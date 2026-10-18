---
title: What Happens When Your Database Crashes Mid-Transaction
description: The write-ahead log is why a committed transaction survives a power cut. How PostgreSQL uses it to recover, why it has no undo step, and how the same log powers replication and tools like Supabase Realtime.
createdAt: "2025-05-31"
updatedAt: "2025-05-31"
featuredImage: "/articles/wal_recovery_feat.jpg"
tags:
  - postgresql
  - database
  - backend
---

In a job interview, I was asked what happens when a database crashes in the middle of a transaction. The question reminded me why database internals aren't just academic. The answer explains why a committed payment survives a power cut. It also explains settings that trade safety for speed, and how real-time features get changes without polling.

## The write-ahead log

Writing a change straight into the table files would be slow. The rows you touch are spread across the disk, and a crash halfway through a write can leave a page half old and half new.

So databases write the change to a log first. The write-ahead log, WAL, is a sequential file. Appending to it is fast, and every change is recorded there before the table data itself is changed. That's the rule the name comes from: the log entry is written ahead of the data.

In PostgreSQL, a `COMMIT` returns only after the WAL records for that transaction, including the commit record, are flushed to disk. The table pages themselves can stay changed only in memory for a while. A background process, the checkpointer, writes them out later in bigger batches.

A commit costs one sequential write, not many random ones, and you still don't lose anything if the server dies right after.

## Recovery

When PostgreSQL starts after a crash, it finds the last checkpoint. That's a point where every change before it is known to be in the data files. Then it reads the WAL from there and replays every change, in order, onto the data files. This is redo. When it reaches the end of the log, the data files contain every change that was in the WAL when the server died.

What about transactions that were running and never committed? Their changes may have been replayed too. Many databases, following the classic ARIES design, recover in three steps: analysis (what was happening at the crash), redo (repeat the history), and undo (roll back what didn't commit).

PostgreSQL doesn't need the undo step, because of MVCC. Every row version records which transaction created it, and a separate status log records whether each transaction committed. After the crash, PostgreSQL treats those unfinished transactions as aborted, because they have no commit record. Their row versions are invisible to every query from then on. Vacuum cleans them up later. No rollback is needed, because no query can see those rows.

## Settings that trade safety for speed

Knowing this makes a few settings much easier to understand:

- **`synchronous_commit = off`** lets `COMMIT` return before the WAL is flushed. Commits get much faster. If the server crashes, you can lose the last fraction of a second of commits, but the database stays consistent. For some data, like analytics events, that's a reasonable deal. For payments it isn't. You can set it per transaction, so you don't have to choose for the whole database.
- **`fsync = off`** tells PostgreSQL not to make sure anything reaches the disk. After a crash, the database can be corrupted, not just missing a few transactions. It's only for throwaway data, like a test database you rebuild anyway.
- **`full_page_writes`** protects against torn pages, where a crash leaves a data page half written. Leave it on.

## The same log feeds replication

Once every change is in a log, you can send that log somewhere else. That's how PostgreSQL streaming replication works: a replica receives the WAL and replays it, the same way crash recovery does.

With `wal_level = logical`, PostgreSQL can also decode the WAL into row changes: this row was inserted, this column changed from this to that. You can see it yourself:

```sql
CREATE TABLE orders (id int PRIMARY KEY, status text);

SELECT pg_create_logical_replication_slot('demo', 'test_decoding');

INSERT INTO orders (id, status) VALUES (1, 'pending');

SELECT data FROM pg_logical_slot_get_changes('demo', NULL, NULL);
-- BEGIN 812
-- table public.orders: INSERT: id[integer]:1 status[text]:'pending'
-- COMMIT 812

SELECT pg_drop_replication_slot('demo');
```

This is what change data capture tools build on, and it's how Supabase Realtime works. It creates a replication slot, reads the decoded changes, turns them into JSON, and pushes them over WebSockets to the clients that subscribed. The server side is built with Elixir and Phoenix, which is a good fit for holding a huge number of open connections.

It catches every change to the published tables, no matter where it came from. An update from your API, from a migration script, or from someone in the database console all go through the WAL, so every client sees them. You don't add triggers to each table, and you don't run into the 8000-byte payload limit of PostgreSQL's `NOTIFY`. I used it for a collaborative dashboard for a client, where several people needed to see each other's changes without refreshing the page, and it saved a lot of work compared to building it ourselves.

One warning if you play with this. A replication slot keeps every WAL segment that its consumer hasn't read yet. If you create a slot and forget it, PostgreSQL keeps all the WAL that the slot has not confirmed, and the disk can fill up. That's why the example above drops it. In production, monitor `pg_replication_slots`.

## And with more than one database

All of this is about one server. When a transaction spans several databases or services, there is no shared log, and you need a protocol on top. Two-phase commit is the classic one, and it blocks if the coordinator dies at the wrong moment. Consensus algorithms like Raft keep a replicated log across machines, which is how distributed databases survive losing a node. Sagas avoid a distributed transaction altogether, with a series of local steps and a compensating step for each one if something fails later.

The real lesson is that these fundamentals help you make better architecture decisions, whether you're choosing a database setting or designing how services talk to each other. I've seen too many production incidents that a better understanding of transactions and recovery would have prevented.

What's your experience with database failures in production?
