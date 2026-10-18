---
title: Audit Logs Are Built for a Different Job
description: Who did what, to which record, and when. How an audit log differs from application logs, a PostgreSQL design that records every change in the same transaction, and how to keep the log append-only.
createdAt: "2025-07-23"
updatedAt: "2025-07-23"
featuredImage: "/articles/audit_log_feat.jpg"
tags:
  - security
  - postgresql
  - backend
  - compliance
---

Sooner or later someone asks a question your application logs can't answer. Who changed this customer's limit last Tuesday? Who approved this refund? Was this account disabled by an admin or by the system?

Your application logs are built for debugging. They're noisy, they rotate after a few days, they often miss the "before" value, and anyone with access to the server can edit them. An audit log is built for a different job: a complete, trustworthy record of who did what, to which record, and when.

For systems that handle money, personal data or permissions, this isn't optional. You need it to answer complaints and to investigate incidents.

## What to record

Each entry should answer the same questions:

- **Who:** the user or service that acted, and whether it was a person, an API key or a background job.
- **What:** the action, in plain words: `refund.approved`, `user.role_changed`, `card.blocked`.
- **Which record:** the type and ID of what changed.
- **When:** a timestamp from the database, not from the client.
- **Before and after:** the values that changed. Without "before", you know something changed but not what it was.
- **Context:** the request ID, so you can jump from the audit entry to the full logs of that request, and the IP address or device where it matters.

What not to record: passwords, tokens, full card numbers, and anything else that would make the audit log itself a target. Mask those fields before they're written.

## A table for it

```sql
CREATE TABLE audit_log (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  actor_id    text,
  action      text NOT NULL,
  entity_type text NOT NULL,
  entity_id   text NOT NULL,
  before      jsonb,
  after       jsonb,
  request_id  text
);

CREATE INDEX ON audit_log (entity_type, entity_id, occurred_at);
CREATE INDEX ON audit_log (actor_id, occurred_at);
```

The two indexes match the two questions people actually ask: "what happened to this record?" and "what did this person do?"

## Write it in the same transaction

The most important rule: the audit entry is written in the same database transaction as the change. If the change commits, the entry commits. If the change rolls back, so does the entry. Writing the audit entry afterwards, or sending it to a queue, leaves a window where the change exists and the record of it doesn't.

You can do this in the application, next to each change, which lets you use meaningful action names. Or you can let the database do it with a trigger, which catches every change, including the ones made from a migration or a SQL console.

A trigger doesn't know which user is logged in to your app, so the application tells it, at the start of each transaction:

```go
_, err := tx.Exec(ctx, `SELECT set_config('app.actor_id', $1, true), set_config('app.request_id', $2, true)`,
	userID, requestID)
```

The `true` means the setting only lives until the end of the transaction, so it can't leak into the next request that reuses the connection.

The trigger reads those settings:

```sql
CREATE FUNCTION audit_row() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (actor_id, action, entity_type, entity_id, after, request_id)
    VALUES (current_setting('app.actor_id', true), 'insert', TG_TABLE_NAME, NEW.id::text,
            to_jsonb(NEW), current_setting('app.request_id', true));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (actor_id, action, entity_type, entity_id, before, after, request_id)
    VALUES (current_setting('app.actor_id', true), 'update', TG_TABLE_NAME, NEW.id::text,
            to_jsonb(OLD), to_jsonb(NEW), current_setting('app.request_id', true));
  ELSE
    INSERT INTO audit_log (actor_id, action, entity_type, entity_id, before, request_id)
    VALUES (current_setting('app.actor_id', true), 'delete', TG_TABLE_NAME, OLD.id::text,
            to_jsonb(OLD), current_setting('app.request_id', true));
  END IF;
  RETURN NULL;
END $$;

CREATE TRIGGER refunds_audit
AFTER INSERT OR UPDATE OR DELETE ON refunds
FOR EACH ROW EXECUTE FUNCTION audit_row();
```

When a change comes from outside the app, `actor_id` is empty. That's useful information too: it tells you someone changed production data by hand.

## Keep it append-only

An audit log that can be edited isn't worth much. At minimum, the database role your application uses should only be able to insert:

```sql
REVOKE UPDATE, DELETE, TRUNCATE ON audit_log FROM app_user;
GRANT INSERT, SELECT ON audit_log TO app_user;
```

Now a bug, or an attacker who gets the app's credentials, can't quietly rewrite history. This only holds if the app's role doesn't own the table. An owner can grant itself the rights back, or drop the trigger, so create the table and the trigger with a separate migration role. For stricter needs, copy the entries regularly to storage that nobody can modify, like an object storage bucket with a retention lock. Some teams also chain entries with hashes, where each entry includes a hash of the previous one, so any change in the middle breaks the chain and is easy to detect.

## Make it usable

An audit log nobody can search doesn't help. A few things make it useful:

- A simple screen for support and admins: pick a record, see its history, before and after.
- Alerts on the actions that matter: a role changed to admin, a large refund, a login from a new country for a privileged account.
- Access control on the audit log itself, and an audit entry when someone reads it, if the data is sensitive.
- A retention policy. Keep it as long as your regulations require, then archive it somewhere cheap instead of letting the table grow forever.

When you choose a solution, look for complete capture across all your systems, the same format everywhere, easy search, strong access control and encryption, alerts for suspicious activity, and storage that stays affordable for years.

Add it early. Adding it after the first audit is much harder.
