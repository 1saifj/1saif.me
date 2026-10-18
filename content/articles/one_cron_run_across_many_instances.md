---
title: Running a Cron Job Once When You Have Many Instances
description: Scale a Go service to three instances and every scheduled job runs three times. How a Redis key fixes that, the two holes in the simple SETNX version, and why the job should still be safe to run twice.
createdAt: "2025-04-08"
updatedAt: "2025-04-08"
featuredImage: "/articles/cron_lock_feat.jpg"
tags:
  - golang
  - redis
  - backend
  - concurrency
---

Scheduled jobs are easy when you run one instance of your service. Then you scale to three instances for traffic, and every cron job now runs three times. A daily report gets sent three times. A cleanup job deletes in parallel with itself. A job that charges or notifies users does it more than once, and that's the one that hurts.

We had this problem in one of our Go services. Every instance ran the same scheduler, so all of them fired at the same minute and did the same work.

There are a few ways out. You can move the jobs to a separate service with one replica, or use your platform's scheduler (a Kubernetes CronJob, Cloud Scheduler, and so on). Both are good. But when you want to keep the jobs where they are, a lock in Redis is the smallest change.

## The idea

Before a job does its work, it tries to take a key in Redis. Only one instance can take it. The others see that the key is taken and skip this run.

I first posted about this on LinkedIn in a short form: `SETNX` to take the key, do the work, `DEL` to give it back. That version works most of the time. It has two holes, and you should know them before you copy it.

## Hole 1: a crash leaves the key forever

If the instance that holds the key crashes, or gets killed during a deploy, nobody deletes the key. Every run after that sees a taken key and skips. The job silently stops running, and you find out days later.

The fix is to always set an expiry when you take the key. Plain `SETNX` can't do that in one step. `SET` with `NX` and an expiry (`EX` or `PX`) can. go-redis sends that form when you pass an expiration to `SetNX`:

```go
ok, err := rdb.SetNX(ctx, key, instanceID, 10*time.Minute).Result()
```

## Hole 2: a slow instance runs the same job again

This one is less obvious. Say the job takes five seconds. Instance A takes the key at 10:00:00, finishes at 10:00:05 and deletes the key. Instance B's clock is a few seconds behind, or it was busy, so its scheduler fires at 10:00:07. The key is gone, so B takes it and runs the 10:00 job a second time.

Deleting the key when you're done is the problem. For a cron job, what matters is whether the 10:00 run has already happened. So put the scheduled time in the key, and let it expire on its own instead of deleting it:

```go
func (s *Scheduler) RunOnce(ctx context.Context, job string, every time.Duration, fn func(context.Context) error) error {
	slot := time.Now().Round(every)
	key := fmt.Sprintf("cron:%s:%s", job, slot.UTC().Format(time.RFC3339))

	ok, err := s.rdb.SetNX(ctx, key, s.instanceID, 2*every).Result()
	if err != nil {
		return fmt.Errorf("take lock for %s: %w", job, err)
	}
	if !ok {
		return nil // another instance already has this run
	}
	return fn(ctx)
}
```

Use `Round`, not `Truncate`. A scheduler can fire a few milliseconds before the boundary. With `Truncate`, that run lands in the previous slot. That slot is already taken, so the 10:00 job is skipped. `Round` gives the right slot as long as the trigger is within half an interval of the boundary.

The expiry is twice the interval, so the key is still there when the slowest instance shows up, and Redis cleans it up later without anyone deleting anything.

Using it with any scheduler looks like this:

```go
c := cron.New()
c.AddFunc("0 * * * *", func() {
	ctx := context.Background()
	if err := sched.RunOnce(ctx, "hourly-report", time.Hour, sendHourlyReport); err != nil {
		slog.Error("hourly report failed", "err", err)
	}
})
c.Start()
```

## When you need a real lock

Sometimes you need the other thing: only one instance doing some work at a time, for as long as it takes. For example, a job that processes a queue table and must not run in parallel with itself.

Then you do delete the key at the end, but you have to make sure you delete your own key. If your work took longer than the expiry, the key may have expired and another instance may hold it now. A plain `DEL` would remove their lock.

So store a random token as the value, and only delete the key if it still has your token. This has to be atomic, so it's a small Lua script:

```go
var release = redis.NewScript(`
if redis.call("GET", KEYS[1]) == ARGV[1] then
	return redis.call("DEL", KEYS[1])
end
return 0
`)

var ErrLocked = errors.New("lock is held by another instance")

func withLock(ctx context.Context, rdb *redis.Client, key string, ttl time.Duration, fn func(context.Context) error) error {
	token := rand.Text()
	ok, err := rdb.SetNX(ctx, key, token, ttl).Result()
	if err != nil {
		return err
	}
	if !ok {
		return ErrLocked // the caller decides whether skipping is fine
	}
	defer release.Run(context.Background(), rdb, []string{key}, token)
	return fn(ctx)
}
```

`rand.Text()` is from `crypto/rand` and needs Go 1.24. On older versions, read 16 random bytes and hex-encode them.

Set the expiry well above the longest time the job has ever taken. If the work can run longer than that, either extend the key while you work or split the work into smaller pieces.

## The lock is not a guarantee

This is the part I'd stress most. A Redis lock makes duplicate runs rare. It doesn't make them impossible. Redis can fail over to a replica that never saw your key. A process can pause for a long GC or a slow disk and wake up after its lock expired, still thinking it holds it.

So for anything that touches money or sends something to a user, the job itself should be safe to run twice. Mark rows as processed in the same transaction that processes them. Use an idempotency key when you call a payment provider. Check "already sent today" before sending.

For most jobs, the slot key above is all you need. It's a few lines, it uses a Redis you probably already run, and each slot runs on one instance.

How do you run scheduled jobs across instances? I'm curious if most people move them out to a separate worker or keep them in the service like we did.
