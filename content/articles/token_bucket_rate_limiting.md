---
title: Rate Limiting with a Token Bucket
description: How the token bucket allows short bursts while holding a steady average rate, a twenty-line Go version to understand it, and what to use in production when you have more than one instance.
createdAt: "2025-02-10"
updatedAt: "2025-02-10"
featuredImage: "/articles/token_bucket_feat.jpg"
tags:
  - golang
  - backend
  - rate-limiting
  - system-design
---

Every public API needs some control over traffic. Without it, one buggy client in a retry loop, or one scraper, can use up the capacity that everyone else needs. Rate limiting is that control, and the token bucket is a simple way to do it.

## How it works

Picture a bucket that holds tokens:

- It has a capacity, say 10 tokens.
- It refills at a steady rate, say 5 tokens per second, and never goes above capacity.
- Every request takes one token. If the bucket is empty, the request is rejected.

Walk through it with those numbers. A user starts with a full bucket and sends 10 requests at once. All 10 go through, and the bucket is empty. After that they can send about 5 requests per second, because that's how fast tokens come back. If they stop for 2 seconds, the bucket refills by 10, and they can burst again.

The refill rate sets the average. The capacity sets the largest burst. That separation is why the token bucket fits real clients so well. A mobile app opening a screen often fires several requests at the same moment and then goes quiet. A strict "5 per second" limit would reject some of those requests. The bucket lets the burst through and still holds the average.

## A simple implementation

You don't need a timer that adds tokens every second. Store when you last refilled, and when a request arrives, add the tokens earned since then:

```go
type Bucket struct {
	mu       sync.Mutex
	capacity float64
	rate     float64 // tokens per second
	tokens   float64
	last     time.Time
}

func NewBucket(capacity, rate float64) *Bucket {
	return &Bucket{capacity: capacity, rate: rate, tokens: capacity, last: time.Now()}
}

func (b *Bucket) Allow() bool {
	b.mu.Lock()
	defer b.mu.Unlock()

	now := time.Now()
	b.tokens = min(b.capacity, b.tokens+now.Sub(b.last).Seconds()*b.rate)
	b.last = now

	if b.tokens < 1 {
		return false
	}
	b.tokens--
	return true
}
```

Each call is O(1) and each bucket is a few numbers in memory. That's what makes it cheap enough to keep one bucket per user, per API key or per IP.

## In production, use x/time/rate

The version above is good for understanding. For real code in Go, `golang.org/x/time/rate` already implements a token bucket, and it's well tested:

```go
limiter := rate.NewLimiter(rate.Limit(5), 10) // 5 tokens per second, burst of 10
if !limiter.Allow() {
	// reject
}
```

It also has `Wait(ctx)`, which blocks until a token is available. That's useful on the client side, when you're the one calling a rate-limited API and would rather slow down than get rejected.

A per-client limiter in an HTTP middleware looks like this:

```go
type clientLimiters struct {
	mu       sync.Mutex
	limiters map[string]*rate.Limiter
}

func newClientLimiters() *clientLimiters {
	return &clientLimiters{limiters: make(map[string]*rate.Limiter)}
}

func (c *clientLimiters) get(key string) *rate.Limiter {
	c.mu.Lock()
	defer c.mu.Unlock()
	l, ok := c.limiters[key]
	if !ok {
		l = rate.NewLimiter(5, 10)
		c.limiters[key] = l
	}
	return l
}

func (c *clientLimiters) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !c.get(clientKey(r)).Allow() {
			w.Header().Set("Retry-After", "1")
			http.Error(w, "too many requests", http.StatusTooManyRequests)
			return
		}
		next.ServeHTTP(w, r)
	})
}
```

Two things this sketch leaves out on purpose. The map only grows, so in a real service you remove limiters that haven't been used for a while, or use a cache with expiry. And `clientKey` matters more than it looks: an API key or user ID is much better than an IP address, because many users can share one IP behind a mobile carrier or an office network.

Return `429 Too Many Requests` with a `Retry-After` header. Well-behaved clients will wait instead of retrying right away.

## More than one instance

An in-memory limiter is per process. If you run three instances behind a load balancer, each one allows 5 per second, so the client can get up to 15 per second.

Sometimes that's fine. If the goal is to protect each instance from overload, a local limit is exactly right, and it costs nothing. If the limit is a promise, like "100 requests per minute on the free plan", you need shared state. The usual answer is Redis: keep the token count and the last refill time in a key, and do the refill-and-take step in a small Lua script so it's atomic. Some API gateways and proxies also do this for you, so check what's in front of your service before you build it.

## Where it's used

Token buckets show up in API throttling, network traffic shaping, protecting internal services from each other, and as one layer of defense against abuse. Token buckets suit these cases because they allow bursts, cost little to run, and have two numbers that are easy to explain.
