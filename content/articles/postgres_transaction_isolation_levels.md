---
title: Transaction Isolation Levels in PostgreSQL, With Examples
description: Strange bugs from concurrent requests often come down to how the database isolates transactions. What each PostgreSQL level protects you from, a lost update you can reproduce in two terminals, and how to retry when the database says no.
createdAt: "2025-04-02"
updatedAt: "2025-04-02"
featuredImage: "/articles/isolation_levels_feat.jpg"
tags:
  - postgresql
  - database
  - concurrency
  - golang
---

Some bugs only happen under load. A balance ends up wrong, a counter skips, or a booking goes through twice. You can't reproduce it on your machine, because on your machine there is only one request at a time.

Many of these bugs come from how the database handles concurrent transactions. PostgreSQL isolation levels decide how much one transaction can see of another. Each level protects you from a different set of problems. Knowing which level you run, and what it does and does not promise, saves a lot of guessing.

## The problems

First the names, because the levels are defined by which of these they prevent:

- **Dirty read.** You read data that another transaction wrote but hasn't committed. If it rolls back, you acted on something that never existed. PostgreSQL never allows this, at any level.
- **Non-repeatable read.** You read the same row twice in one transaction and get different values, because someone committed a change in between.
- **Phantom.** You run the same query twice and new rows appear, because someone inserted rows that match your `WHERE`.
- **Lost update.** Two transactions read the same value, both compute a new one, both write. The second write silently replaces the first.
- **Serialization anomaly.** Each transaction looks fine on its own, but the final result is something that couldn't happen if they had run one after the other.

## The levels

**Read Committed** is the default. Each statement sees the data committed before that statement started. It prevents dirty reads, and that's all. Non-repeatable reads, phantoms and lost updates can all happen.

**Repeatable Read** takes one snapshot when the transaction runs its first statement, and every statement after sees that same snapshot. In PostgreSQL this also prevents phantoms, which is stronger than the SQL standard asks for. If you try to update a row that someone else changed after your snapshot, you get an error instead of a lost update.

**Serializable** is the strictest. PostgreSQL watches for patterns of reads and writes that could produce a result no serial order could produce, and aborts one of the transactions when it sees one.

If you ask for Read Uncommitted, PostgreSQL gives you Read Committed. There is no way to get dirty reads.

## A lost update in two terminals

The easiest way to understand this is to break it yourself. Create a table:

```sql
CREATE TABLE accounts (id int PRIMARY KEY, balance int NOT NULL);
INSERT INTO accounts VALUES (1, 100);
```

Open two `psql` sessions and run these steps in order. Both sessions use the default, Read Committed.

```sql
-- session A
BEGIN;
SELECT balance FROM accounts WHERE id = 1;   -- 100, the app plans to withdraw 30

-- session B
BEGIN;
SELECT balance FROM accounts WHERE id = 1;   -- 100, the app plans to withdraw 50

-- session A
UPDATE accounts SET balance = 70 WHERE id = 1;
COMMIT;

-- session B
UPDATE accounts SET balance = 50 WHERE id = 1;
COMMIT;
```

The balance is now 50. Eighty was withdrawn and only fifty was recorded. Nothing failed and nothing was logged. This is the pattern behind a lot of "the numbers don't add up" tickets: read a value into the application, change it there, write it back.

There are three ways out.

**Let the database do the math.** If the new value only depends on the old one, don't read it at all:

```sql
UPDATE accounts SET balance = balance - 30 WHERE id = 1 AND balance >= 30;
```

The row is locked for the update, so the second transaction waits and then applies its change on top of the first. This is the cheapest fix, and it covers more cases than people expect.

**Lock the row when you read it.** When the application has to decide something between the read and the write, use `SELECT ... FOR UPDATE`. The second transaction waits at the `SELECT` until the first one commits, and then reads the new value.

**Use a stricter level.** Run the same steps with `BEGIN ISOLATION LEVEL REPEATABLE READ;` in both sessions. Session B's `UPDATE` now fails:

```
ERROR:  could not serialize access due to concurrent update
```

That error is the database protecting you. The cost is that your code now has to handle it.

## When Repeatable Read isn't enough

Repeatable Read stops two transactions from writing the same row. It doesn't stop two transactions that each read rows and then write different rows, based on what they read.

The classic example: a hospital rule says at least one doctor must be on call. Two doctors are on call, and both ask to go off call at the same moment. Each transaction checks "is anyone else on call?", sees the other doctor, and updates its own row. No row is written twice, so Repeatable Read is happy. Now nobody is on call.

This is a serialization anomaly, and only Serializable catches it. One of the two transactions fails with the same kind of error, and the rule holds.

## Handling the error

Both stricter levels report conflicts with SQLSTATE `40001`, `serialization_failure`. The fix is always the same: roll back and run the whole transaction again from the start, including the reads. In Go with pgx:

```go
func inSerializableTx(ctx context.Context, pool *pgxpool.Pool, fn func(pgx.Tx) error) error {
	for attempt := 1; ; attempt++ {
		err := pgx.BeginTxFunc(ctx, pool, pgx.TxOptions{IsoLevel: pgx.Serializable}, fn)

		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "40001" && attempt < 5 {
			time.Sleep(time.Duration(attempt*20) * time.Millisecond)
			continue
		}
		return err
	}
}
```

Two rules make this safe. The function you pass in must do all its work inside the transaction, because it can run more than once. And it must not have side effects outside the database, like sending an email or calling a payment API, before the transaction commits.

## Which one to use

Higher isolation means more safety and less concurrency. You get more retries, and under heavy contention, slower throughput. It's a trade-off between consistency and performance.

What works well in practice:

- Keep Read Committed as the default for most of the app.
- Write updates so the database does the math, and use `FOR UPDATE` where the app must decide between a read and a write.
- Use Serializable, with a retry loop, for the few transactions where correctness depends on several rows together: booking, money movement, inventory, anything with a rule like "at least one" or "no more than".

If your app does bookings or financial transactions, you need to understand these levels. Many of the bugs they prevent only appear under concurrent load, which is why they rarely show up on a developer's machine.
