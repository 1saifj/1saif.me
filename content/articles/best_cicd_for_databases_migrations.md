---
title: "Database Migrations Done Right: Git-Style Version Control for Your Schema"
description: "Keep every schema change in Git next to the code, apply it with a migration tool, and test it in CI before it touches production. The tools, the rules that keep migrations safe, and the PostgreSQL details that bite."
createdAt: "2025-01-22"
updatedAt: "2025-07-22"
featuredImage: "/articles/db_cicd_feat.jpg"
tags:
  - database
  - migrations
  - postgresql
  - devops
  - ci-cd
---

Your application code goes through Git, review and CI. Then someone adds a column on staging by hand, or runs a fix on production from their laptop, and it never makes it back into the repo. A month later staging and production have different schemas and nobody can say which one is right.

I wrote a short LinkedIn post about this: you can make database changes behave like Git flow. Every change is a file in the repo, it gets reviewed like code, and the same files run in every environment in the same order. This is the longer version, with the parts that the post didn't have room for.

## What a migration tool does

The idea is simple. Every schema change is a numbered SQL file in your repo:

```
db/migrations/
  V1__create_users.sql
  V2__create_orders.sql
  V3__add_orders_status_index.sql
```

The tool keeps a table in the database that records which files were applied, when, and a checksum of each one. When you run it, it compares that table with the folder and applies whatever is missing, in order. Run it on a fresh database and you get the full schema. Run it on production and you get only the new files.

That table is the answer to "what version is production on?", and the checksum catches the other classic problem: someone edited a migration after it already ran somewhere.

## The tools

These are the ones I mentioned in the post. They all solve the same problem in different ways:

- **Flyway**: plain SQL files with a version in the name, like the folder above. Very little to learn. `flyway info` shows what's applied and what's pending, `flyway validate` checks the checksums, `flyway migrate` applies.
- **Liquibase**: changes are grouped in changelogs, in SQL, XML or YAML, and each change can carry its own rollback. More setup, more control.
- **Bytebase**: a web UI on top of migrations, with review and approval steps before a change reaches a database. Useful when people outside the dev team need to sign off on changes.
- **DbSchema**: a visual designer that can keep the model in Git. More for designing the schema than for running it in a pipeline.

In Go projects you'll also see **goose** and **golang-migrate**. They do the same job and install with `go install`. Goose puts the up and down parts of a change in the same file:

```sql
-- +goose Up
ALTER TABLE orders ADD COLUMN status text NOT NULL DEFAULT 'pending';

-- +goose Down
ALTER TABLE orders DROP COLUMN status;
```

If you use GORM, `AutoMigrate` is handy in development. It creates what's missing and can widen some columns, but it never drops anything, and it keeps no history of what changed. For production you want real migration files you can review.

## Rules that keep migrations safe

The tool is the easy part. Most of the trouble comes from how migrations are written.

**Never edit a migration after it has run anywhere.** If `V3` is wrong, write `V4` that fixes it. Editing `V3` means the databases that already ran it will never see your change, and the checksum check will fail on them.

**Plan to go forward, not back.** Down migrations are great in development. In production, rolling back a schema change often means losing data that was written after it. If you add a column and users fill it for an hour, dropping it throws that away. Fix forward with a new migration, and keep a backup or point-in-time recovery for the real disasters. Also note that Flyway's undo migrations are not in the free edition.

**Keep the old code working with the new schema.** During a deploy, the old version of your app is still running while the migration runs, and sometimes for minutes after. So a migration must not break the code that's currently live. A rename is the usual trap. Renaming a column in one step breaks every running instance that still uses the old name. Do it in steps instead:

1. Add the new column.
2. Deploy code that writes to both columns.
3. Copy the old values into the new column.
4. Deploy code that reads only the new column.
5. Drop the old column, in a later release.

It's slower, but at no point is there a version of the app that the schema can't serve. People call this expand and contract.

## The PostgreSQL details that bite

A migration is a statement on a live database, and some statements take locks that stop your app.

**Set a lock timeout.** `ALTER TABLE` needs a strong lock on the table. If a long query is holding the table, the `ALTER` waits, and every new query on that table queues behind the `ALTER`. A two-second schema change becomes a full outage. Start risky migrations with:

```sql
SET lock_timeout = '5s';
```

If the lock isn't free in five seconds, the migration fails and you retry later, instead of taking the app down with it.

**Know which changes rewrite the table.** Since PostgreSQL 11, adding a column with a constant default doesn't rewrite the table, so it's fast even on big tables. Changing a column's type usually does rewrite it, and that holds the lock for the whole rewrite.

**Add constraints in two steps.** Adding a `CHECK` or foreign key constraint scans the whole table while holding a lock. You can split it:

```sql
ALTER TABLE orders
  ADD CONSTRAINT orders_amount_positive CHECK (amount > 0) NOT VALID;

ALTER TABLE orders VALIDATE CONSTRAINT orders_amount_positive;
```

The first statement only checks new rows and is quick. The second one checks the existing rows with a weaker lock, so reads and writes keep going.

**Build indexes concurrently, in their own file.** A normal `CREATE INDEX` blocks writes to the table until it's done. `CREATE INDEX CONCURRENTLY` doesn't, but it can't run inside a transaction, and migration tools usually wrap each file in one. With goose you mark the file with `-- +goose NO TRANSACTION`. Flyway runs the statement outside a transaction for you, but in recent versions its own lock on PostgreSQL can make the build wait forever, and Redgate's docs tell you to set `postgresql.transactional.lock` to false for it. Either way, one concurrent index per file is the easiest rule. And if a concurrent build fails, it leaves an invalid index behind, so drop it before you try again.

## Test migrations in CI

The cheapest check is to run every migration from an empty database on every pull request. It catches broken SQL, files in the wrong order, and a migration that depends on something that doesn't exist yet. With GitHub Actions and a Postgres service container it's a few lines:

```yaml
jobs:
  migrations:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
        ports: ["5432:5432"]
        options: >-
          --health-cmd pg_isready --health-interval 5s --health-retries 10
    env:
      DB: postgres://postgres:postgres@localhost:5432/postgres?sslmode=disable
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: stable
      - run: go install github.com/pressly/goose/v3/cmd/goose@latest
      - run: goose -dir db/migrations postgres "$DB" up
      - run: goose -dir db/migrations postgres "$DB" reset
      - run: goose -dir db/migrations postgres "$DB" up
```

Up, all the way down, and up again. That proves the down parts work too, which you'll be glad of in development. Run your integration tests against the same database afterwards, and you're testing the code against the schema it will actually get.

An empty database won't catch everything. A migration that's instant on an empty table can lock a big table for minutes. If your tables are large, run new migrations against a recent copy of production data before you ship them, with personal data removed.

## Deploying

Run migrations once, as their own step in the pipeline, before the new app version rolls out. Don't run them on app startup when you have several instances: they all start at the same time and all try to migrate. Flyway and goose can take a lock so only one wins, but a separate step is easier to watch and easier to stop when something looks wrong.

Since every migration keeps the old code working, the order is safe: migrate, then deploy the code that needs the new schema.

## Why bother

Once schema changes live in Git, a lot of small problems disappear. New developers get a working database with one command. Staging and production can't quietly drift apart. A schema change gets the same review as the code that uses it. And when something breaks, the history table tells you exactly what ran and when.

If you still copy SQL scripts around or run changes by hand, pick any of these tools and start with the next change. You don't need to migrate your history first. Most tools can take the current schema as a baseline and track everything after it.

What do you use for database migrations? I'm curious what works for teams bigger and smaller than mine.
