---
title: Give Every Request an ID You Can Follow
description: When a strange bug shows up in production, the first question is what happened to that one request. A request ID in the context, a logger that carries it, and cancellation that actually stops work.
createdAt: "2025-11-10"
updatedAt: "2025-11-10"
featuredImage: "/articles/request_id_feat.jpg"
tags:
  - golang
  - backend
  - observability
  - logging
---

You're working on a service. Requests come in, everything runs normally, and then a strange bug shows up that nobody can explain. You want to know: which functions did this request go through? What happened to it? Where did it stop?

You open the logs and find thousands of lines from hundreds of requests, all mixed together. The line that says "payment failed" is there, but nothing tells you which request it belongs to, or what that request did before it failed.

This is where the request context matters. Most of the work your server does for a request needs to carry some information about that request with it: an ID, who the user is, and whether the client is still waiting. With that, you can follow one request from start to end. Without it, when something goes wrong, you're lost.

## One ID per request

The basic idea: every request gets an identity at the edge of your system, and that identity travels with it through every step. Every log line includes it. Every error response includes it. Every call to another service passes it on.

In Go, the place for this is `context.Context`. Every handler already has one in `r.Context()`, and every function that does I/O should already take a `ctx` as its first argument. A small middleware puts the ID in:

```go
type requestIDKey struct{}

func RequestID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		id := r.Header.Get("X-Request-ID")
		if !validID(id) {
			id = rand.Text()
		}
		w.Header().Set("X-Request-ID", id)

		ctx := context.WithValue(r.Context(), requestIDKey{}, id)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func validID(id string) bool {
	if id == "" || len(id) > 64 {
		return false
	}
	for _, c := range id {
		if !(c == '-' || c >= '0' && c <= '9' || c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z') {
			return false
		}
	}
	return true
}

func IDFrom(ctx context.Context) string {
	id, _ := ctx.Value(requestIDKey{}).(string)
	return id
}
```

A few choices here:

- If a proxy or the client already sent an `X-Request-ID`, keep it, so the ID in the load balancer logs matches the ID in yours. But check it first. A header is user input, and you don't want someone writing newlines or a megabyte of text into your logs.
- The ID goes back in the response header. When the mobile app shows an error, it can show the ID too, and a user's screenshot becomes a search query.
- The context key is an unexported struct type, so no other package can collide with it by accident.

## A logger that already knows the ID

Passing the ID to every log call by hand doesn't last. Someone forgets, and it's often the line you need. Make the logger read it from the context:

```go
func Log(ctx context.Context) *slog.Logger {
	if id := IDFrom(ctx); id != "" {
		return slog.Default().With("request_id", id)
	}
	return slog.Default()
}
```

Then anywhere in the code:

```go
func (s *OrderService) Pay(ctx context.Context, orderID int64) error {
	Log(ctx).Info("charging order", "order_id", orderID)

	if err := s.gateway.Charge(ctx, orderID); err != nil {
		Log(ctx).Error("charge failed", "order_id", orderID, "err", err)
		return fmt.Errorf("charge order %d: %w", orderID, err)
	}
	return nil
}
```

With a JSON handler, every line has a `request_id` field, and finding everything that happened to one request is one filter in whatever you use to read logs:

```json
{"time":"2025-11-10T09:14:02Z","level":"INFO","msg":"charging order","request_id":"7f3c9a2e","order_id":4417}
{"time":"2025-11-10T09:14:03Z","level":"ERROR","msg":"charge failed","request_id":"7f3c9a2e","order_id":4417,"err":"gateway timeout"}
```

## Pass it to the next service

If your service calls another one, send the ID along so its logs line up with yours:

```go
req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, body)
if err != nil {
	return err
}
req.Header.Set("X-Request-ID", IDFrom(ctx))
```

And if you have background jobs that start from a request, like a queue message, put the ID in the message. When the worker picks it up, it puts the ID back into its own context. The trail continues even when the work leaves the HTTP request.

## The context also knows if the request is still alive

The context also tells you whether anyone is still waiting for the answer.

When the client disconnects, or a timeout you set expires, the request context is cancelled. Every call that takes `ctx` and respects it stops early:

```go
ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
defer cancel()

rows, err := s.db.QueryContext(ctx, query, args...)
if errors.Is(err, context.Canceled) {
	Log(ctx).Info("client went away, query stopped")
	return
}
if errors.Is(err, context.DeadlineExceeded) {
	Log(ctx).Warn("query took longer than 5s")
	return
}
if err != nil {
	Log(ctx).Error("query failed", "err", err)
	return
}
defer rows.Close()
```

Without this, a user who gave up and closed the app still has a heavy query running on your database for them. On a slow day, the database spends its time on queries nobody is waiting for.

The rule that makes it work is boring: every function that does I/O takes `ctx context.Context` as its first parameter and passes it down. Never create a fresh `context.Background()` in the middle of a request, because that cuts both the ID and the cancellation.

## When to go further

A request ID in the logs takes an hour to add and covers most debugging in a single service or a few services. When you have many services calling each other and you want to see the whole tree of calls with timings, that's what distributed tracing is for. OpenTelemetry gives you a trace ID that works the same way, carried in the context and passed in headers, plus spans that show where the time went. The request ID is a good first step toward that, and the habits are the same.

## Why it matters

The value shows most in bigger systems, or when you start having problems that are hard to explain to the other developers on your team. Once you rely on the request context, even if you forgot something or an error happened, you can go back and see what happened step by step.

It's a little extra code, and sometimes it saves you hours of investigation. If you have another approach that helps with tracing and debugging, share it. I'd like to learn from it too.
