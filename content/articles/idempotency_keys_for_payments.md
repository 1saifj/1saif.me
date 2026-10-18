---
title: Idempotency Keys, or How Not to Charge Someone Twice
description: A customer taps "Pay", the connection drops, and they tap again. How idempotency keys make that retry safe, and the race in the obvious implementation that lets the double charge through anyway.
createdAt: "2025-03-23"
updatedAt: "2025-03-23"
featuredImage: "/articles/idempotency_feat.jpg"
tags:
  - backend
  - golang
  - postgresql
  - payments
  - system-design
---

A customer is on the checkout screen. They tap "Complete purchase" and the connection drops before the response comes back. Did the order go through? Was the card charged? They don't know, so they tap again.

Without protection, that second tap is a second order and a second charge. That means a refund and a support ticket.

Idempotency fixes this. An operation is idempotent when doing it many times has the same effect as doing it once. `GET` is naturally idempotent, and `PUT` is supposed to be. A `POST` that creates a payment isn't, unless you make it so.

I implemented this in a service recently. The idea is simple, but the details need care.

## The idea

The client generates a unique key for the operation, usually a UUID, and sends it in a header:

```
POST /checkout
Idempotency-Key: 5b0d7c4e-2a8f-4b51-9c55-1f0a3e6d9b12
```

The server remembers every key it has seen, and what it answered. If the same key comes again, it doesn't process anything. It returns the same answer as the first time.

The important part is when the client creates the key. It's once per attempt to pay, when the checkout screen opens, and not once per HTTP request. If the app makes a new key on every retry, the server sees two different operations and you're back to double charges.

```ts
// when the checkout screen opens
const idempotencyKey = crypto.randomUUID()

// every retry of this checkout reuses it
await fetch('/checkout', {
  method: 'POST',
  headers: { 'Idempotency-Key': idempotencyKey, 'Content-Type': 'application/json' },
  body: JSON.stringify(cart),
})
```

## The obvious version has a race

The first thing most people write looks like this:

1. Look up the key.
2. If it exists, return the stored response.
3. If not, process the payment and store the key with the response.

Now two requests with the same key arrive at the same time, which is exactly what happens when a client retries quickly or a load balancer retries for you. Both look up the key. Both see nothing. Both charge the card.

It's the same check-then-act problem as two people buying the last seat. The fix is to let the database decide who is first, with a unique constraint, before any work starts.

## The table

```sql
CREATE TABLE idempotency_keys (
  user_id         bigint      NOT NULL,
  key             text        NOT NULL,
  request_hash    bytea       NOT NULL,
  response_status int,
  response_body   jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, key)
);
```

The key is scoped to the user. Otherwise one user could, by accident or not, replay another user's response by guessing a key.

`request_hash` is a hash of the request body. It catches a client bug where the same key gets reused for a different cart.

`response_status` stays `NULL` while the request is still being processed.

## The handler

First, claim the key. `ON CONFLICT DO NOTHING` means exactly one request wins, no matter how many arrive at once:

```go
func (h *Handler) Checkout(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	key := r.Header.Get("Idempotency-Key")
	if key == "" {
		http.Error(w, "Idempotency-Key header is required", http.StatusBadRequest)
		return
	}

	body, err := io.ReadAll(http.MaxBytesReader(w, r.Body, 1<<20))
	if err != nil {
		http.Error(w, "body is too large or unreadable", http.StatusBadRequest)
		return
	}
	hash := sha256.Sum256(body)
	userID := auth.UserID(ctx)

	tag, err := h.db.Exec(ctx,
		`INSERT INTO idempotency_keys (user_id, key, request_hash)
		 VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
		userID, key, hash[:])
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	if tag.RowsAffected() == 0 {
		h.replay(w, r, userID, key, hash[:])
		return
	}

	// The client may disconnect mid-payment. Finish and record the result anyway.
	work := context.WithoutCancel(ctx)
	status, resp := h.processPayment(work, userID, body, key)

	payload, _ := json.Marshal(resp)
	if _, err := h.db.Exec(work,
		`UPDATE idempotency_keys SET response_status = $3, response_body = $4
		 WHERE user_id = $1 AND key = $2`,
		userID, key, status, payload); err != nil {
		slog.Error("store idempotent response", "key", key, "err", err)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	w.Write(payload)
}
```

Notice `context.WithoutCancel`. In Go, the request context is cancelled the moment the client disconnects, which is exactly the situation we're protecting against. If the payment and the `UPDATE` used that context, a dropped connection could stop the work halfway and leave the row unfinished. So once we own the key, we finish the job and store the answer, whether or not anyone is still listening. The retry will pick it up. `WithoutCancel` needs Go 1.21 or newer.

The request that lost the race, or a retry that comes later, goes to `replay`:

```go
func (h *Handler) replay(w http.ResponseWriter, r *http.Request, userID int64, key string, hash []byte) {
	var storedHash []byte
	var status *int
	var body []byte

	err := h.db.QueryRow(r.Context(),
		`SELECT request_hash, response_status, response_body
		 FROM idempotency_keys WHERE user_id = $1 AND key = $2`,
		userID, key).Scan(&storedHash, &status, &body)
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	switch {
	case !bytes.Equal(storedHash, hash):
		http.Error(w, "this key was already used for a different request", http.StatusUnprocessableEntity)
	case status == nil:
		w.Header().Set("Retry-After", "2")
		http.Error(w, "this request is still being processed", http.StatusConflict)
	default:
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(*status)
		w.Write(body)
	}
}
```

Three outcomes:

- Same key, different body: a client bug. Say so with a 422, and don't guess.
- Same key, first request still running: a 409 with `Retry-After`. The client waits and tries again, and by then it gets the stored response.
- Same key, finished: return exactly what the first request returned, status code included.

## Things to decide

**What if the server crashes in the middle?** The row stays with `response_status = NULL`, and every retry gets "still processing" forever. You need a timeout: if a row has been in progress for longer than any payment could take, let a new request take it over. That's only safe if the call to the payment provider is itself idempotent, and most providers accept an idempotency key for exactly this reason. Pass your key through, so a takeover can't charge twice at the provider either.

**Do you store failures?** If the card was declined, store it. A retry should get the same decline and not a second attempt. But if your service failed before it reached the provider, it's better to delete the row, so the client can retry with the same key and actually get processed.

**How long do you keep keys?** Long enough to cover any retry. 24 hours is common. A daily job that deletes old rows keeps the table small.

## Why it's worth it

What you get:

- no duplicate charges or duplicate orders
- clients can retry safely when the network fails, which on mobile is all the time
- fewer refunds and fewer support messages that start with "I was charged twice"

Which operations have you made idempotent in your systems? And how do you handle a retry that arrives while the first request is still running?
