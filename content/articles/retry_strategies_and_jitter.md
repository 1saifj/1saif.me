---
title: Retry Strategies That Don't Make Outages Worse
description: Fixed delay, linear and exponential backoff, and why jitter matters most of all. With a small Go retry function and the rules that decide when you should retry in the first place.
createdAt: "2025-03-20"
updatedAt: "2025-03-20"
featuredImage: "/articles/retry_jitter_feat.jpg"
tags:
  - golang
  - backend
  - reliability
  - system-design
---

No system is perfect. A network blips, a downstream service restarts, a database gets overloaded for a few seconds. The worst thing you can do is turn every short failure into an error screen. The second worst thing is to retry in a way that keeps the struggling service down.

A good retry strategy does both jobs. It hides short failures from your users, and it backs off enough that the thing you depend on can recover.

## Four strategies

**Fixed delay.** Wait the same time after every failure, say 2 seconds. Simple, and better than retrying instantly. But it doesn't adapt: if the service needs a minute, you hit it every 2 seconds for that whole minute.

**Linear backoff.** The wait grows by the same step each time: 2s, 4s, 6s, 8s. More patient than fixed delay, and still predictable.

**Exponential backoff.** The wait doubles: 1s, 2s, 4s, 8s. Pressure on the failing service drops fast, which is what you want when the cause is overload. This is the usual choice for calls between services.

**Exponential backoff with jitter.** Same as above, but each wait is a random value up to the backoff. This one deserves its own section.

## Why jitter matters

Picture a service with a thousand clients. It goes down for a moment, and all thousand requests fail at the same second. With plain exponential backoff, they all wait exactly 1 second and retry together. Then they fail together, wait exactly 2 seconds, and retry together again.

The backoff grows, but the traffic still arrives in spikes of a thousand requests, and each spike can knock the service over as it tries to come back. This is the thundering herd problem.

Jitter spreads them out. If each client waits a random time between 0 and the backoff, the thousand retries arrive across the whole window instead of in one instant. The average load stays the same, and the spikes go away. AWS has a well-known write-up comparing the variants, and "full jitter" (a random value between zero and the backoff) does very well for how simple it is.

## A small Go implementation

```go
func Retry(ctx context.Context, attempts int, base, maxDelay time.Duration, fn func(context.Context) error) error {
	var err error
	for i := range attempts {
		if err = fn(ctx); err == nil || ctx.Err() != nil || !retryable(err) {
			return err
		}
		if i == attempts-1 {
			break
		}

		backoff := min(maxDelay, base<<i)
		wait := time.Duration(rand.Int64N(int64(backoff)) + 1)

		select {
		case <-time.After(wait):
		case <-ctx.Done():
			return ctx.Err()
		}
	}
	return fmt.Errorf("after %d attempts: %w", attempts, err)
}
```

A few details:

- `maxDelay` caps the backoff, so a late attempt doesn't wait for minutes. Keep `attempts` small too, because `base<<i` overflows if you shift far enough.
- The context is checked after every failure and during the wait. If the request that started all this was cancelled, or its deadline passed, stop retrying.
- `rand` here is `math/rand/v2`, and the `range` over an integer needs Go 1.22.

Usage:

```go
err := Retry(ctx, 4, 200*time.Millisecond, 5*time.Second, func(ctx context.Context) error {
	return client.SendInvoice(ctx, invoice)
})
```

## When to retry at all

The rules below are harder to get right than the code.

**Only retry errors that can go away.** Timeouts, connection resets, `502`, `503`, `504`, and `429 Too Many Requests` are worth retrying. A `400` or `404` will fail the same way every time. Retrying it only adds load:

```go
func retryable(err error) bool {
	var httpErr *HTTPError
	if errors.As(err, &httpErr) {
		switch httpErr.Status {
		case 429, 502, 503, 504:
			return true
		}
		return false
	}
	var netErr net.Error
	return errors.As(err, &netErr) || errors.Is(err, io.ErrUnexpectedEOF)
}
```

`HTTPError` stands for whatever error type your HTTP client returns with the status code. A timeout from the HTTP client counts as a `net.Error`, so it gets retried. That's also why `Retry` checks `ctx.Err()` before `retryable`: `context.DeadlineExceeded` satisfies `net.Error` too, and if the caller already gave up, another attempt is pointless.

**Respect `Retry-After`.** When a server returns `429` or `503` with a `Retry-After` header, it's telling you exactly when to come back. Use that instead of your own guess.

**Only retry operations that are safe to repeat.** A `GET` is fine. A `POST` that charges a card is not, unless the server supports idempotency keys and you send the same key on every attempt. Otherwise a request that timed out but actually succeeded gets charged twice.

**Retry in one layer only.** If the mobile app retries 3 times, the API retries its call to a service 3 times, and that service retries its database call 3 times, one user tap can become 27 database calls during an outage. Pick the layer closest to the failure and let the others fail fast.

## When retries aren't enough

Retries handle short failures. For a dependency that's down for minutes, you want a circuit breaker: after enough failures in a row, stop calling it for a while and fail immediately, then let a single request through to test whether it's back.

And for the user, a feature that degrades is better than one that disappears. Show the last cached data with a note, queue the action and confirm it later, or hide one widget instead of failing the whole page.

For most calls between services, a good default is exponential backoff with full jitter, a cap, a small number of attempts, and a clear list of which errors are worth another try.
