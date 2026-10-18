---
title: "OpenTelemetry in Go: Traces You Can Actually Read"
description: What OpenTelemetry is, what traces, metrics, logs and baggage each give you, and a small Go setup that sends traces to a local Jaeger in a few minutes.
createdAt: "2025-02-03"
updatedAt: "2025-02-03"
featuredImage: "/articles/otel_traces_feat.jpg"
tags:
  - golang
  - observability
  - opentelemetry
  - devops
---

If you build or maintain applications, you need to know what happens inside them, especially when a request is slow and you don't know why. OpenTelemetry (OTel) is an open-source project from the CNCF that gives you one standard way to collect that information: traces, metrics and logs.

The reason it matters is that it's vendor neutral. You instrument your code once, with one API, and you send the data wherever you want: Jaeger, Grafana, Datadog, Honeycomb, or something you host yourself. Switching backends later means changing configuration, not rewriting instrumentation. It has backing from companies like Google, Red Hat and IBM, and most observability vendors accept its data directly.

## The four pieces

**Traces** show the path of one request through your system. A trace is a tree of spans. Each span is one piece of work with a start, an end and attributes: the HTTP handler, the database query inside it, the call to another service. When a request takes two seconds, the trace shows you which of those pieces took them.

**Metrics** are numbers over time: request rate, error rate, latency percentiles, CPU, memory, queue length. Metrics show that something is slow. Traces show which step is slow.

**Logs** are the timestamped records you already write. OTel can attach the trace ID to them, so you can jump from a log line to the whole trace it belongs to.

**Baggage** is key-value context that travels with the request across services, like a tenant ID or a feature flag. Every downstream service can read it. Be careful with it: baggage goes out in headers to every service you call, including third parties, so never put anything sensitive in it.

## Tracing a Go service

Start a local Jaeger to look at the traces. It accepts OTLP, OpenTelemetry's protocol, out of the box:

```bash
docker run --rm -p 16686:16686 -p 4318:4318 jaegertracing/all-in-one:latest
```

Then set up a tracer provider once, at startup:

```go
func setupTracing(ctx context.Context) (func(context.Context) error, error) {
	exporter, err := otlptracehttp.New(ctx) // reads OTEL_EXPORTER_OTLP_ENDPOINT
	if err != nil {
		return nil, fmt.Errorf("create exporter: %w", err)
	}

	tp := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(exporter),
		sdktrace.WithSampler(sdktrace.ParentBased(sdktrace.TraceIDRatioBased(0.1))),
	)
	otel.SetTracerProvider(tp)
	otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(
		propagation.TraceContext{},
		propagation.Baggage{},
	))
	return tp.Shutdown, nil
}
```

```go
func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	shutdownTracing, err := setupTracing(ctx)
	if err != nil {
		log.Fatal(err)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("POST /orders/{id}/pay", payOrder)
	srv := &http.Server{Addr: ":8080", Handler: otelhttp.NewHandler(mux, "orders-api")}

	go func() {
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatal(err)
		}
	}()

	<-ctx.Done()
	// Stop taking requests first, then flush the spans that are still buffered.
	cleanup, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_ = srv.Shutdown(cleanup)
	_ = shutdownTracing(cleanup)
}
```

Run it with two environment variables:

```bash
OTEL_SERVICE_NAME=orders-api OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 go run .
```

`otelhttp.NewHandler` creates a span for every incoming request, and picks up the trace context if the caller sent a `traceparent` header. That's already enough to see every request in Jaeger at `http://localhost:16686`, with its duration and status.

A few choices in that setup:

- `WithBatcher` sends spans in the background in batches. The synchronous exporter is only for debugging.
- The sampler keeps 10% of new traces. `ParentBased` means that if the caller already decided to sample a request, you follow that decision, so a trace is never half recorded across services. In development, use `sdktrace.AlwaysSample()`.
- The propagators decide which headers carry the context between services. W3C Trace Context is the standard, and every OTel SDK in every language understands it.

## Spans for your own code

The HTTP span tells you a request took 800 ms. To see where, add spans around the work that matters:

```go
func (s *OrderService) Pay(ctx context.Context, orderID int64) error {
	ctx, span := otel.Tracer("orders").Start(ctx, "pay order")
	defer span.End()
	span.SetAttributes(attribute.Int64("order.id", orderID))

	if err := s.gateway.Charge(ctx, orderID); err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, "charge failed")
		return fmt.Errorf("charge order %d: %w", orderID, err)
	}
	return nil
}
```

The `ctx` that comes back from `Start` carries the new span. Pass it down, and any span created further down becomes its child. This is the same rule as with request IDs: every function that does I/O takes a context and passes it on.

For calls to other services, wrap the HTTP client's transport, and the trace continues on the other side:

```go
client := &http.Client{Transport: otelhttp.NewTransport(http.DefaultTransport)}
```

Database drivers and Redis clients have OTel instrumentation packages too, so queries show up as spans without writing them by hand.

## Connect logs to traces

Add the trace ID to your logs, and a log line becomes a link to the full story of that request:

```go
func Log(ctx context.Context) *slog.Logger {
	sc := trace.SpanContextFromContext(ctx)
	if !sc.IsValid() {
		return slog.Default()
	}
	return slog.Default().With("trace_id", sc.TraceID().String())
}
```

If you already put a request ID in your logs, this is the same idea, but the ID is shared across every service the request touched.

## Where to go from here

In production you usually don't send data straight from each service to the backend. You run the OpenTelemetry Collector next to your services. It receives traces, metrics and logs, can sample, filter or scrub sensitive attributes, and forwards them to whatever backend you use. Your services only ever talk to the collector, which keeps the backend choice in one config file.

Start with traces on one service, look at a few slow requests, and you'll quickly see which parts of your system deserve their own spans. That's usually where the next performance fix comes from.
