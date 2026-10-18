---
title: Stress Testing a REST API with k6
description: How I use k6 to find out where an API breaks before users do. A first script, stages and thresholds that fail the build, the difference between virtual users and requests per second, and what to watch while it runs.
createdAt: "2025-04-03"
updatedAt: "2025-04-03"
featuredImage: "/articles/k6_load_feat.jpg"
tags:
  - testing
  - performance
  - backend
  - api
---

I've been working on making my REST APIs handle high concurrency more reliably, and k6 has become one of my favorite tools for it. It lets you simulate thousands of users hitting your endpoints at once, so you find the bottleneck in a test instead of in production.

The scripts are JavaScript, the tool itself is a single Go binary, and a useful first test takes about fifteen lines.

## A first script

```js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,
  duration: '2m',
};

export default function () {
  const res = http.get(`${__ENV.BASE_URL}/api/products?page=1`);
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
```

Run it against a staging environment:

```bash
k6 run -e BASE_URL=https://staging.example.com load.js
```

k6 starts 50 virtual users. Each one runs the default function in a loop: one request, a check, one second of rest. When it finishes, you get a summary with the request rate, the failure rate and latency percentiles.

Look at `p(95)` and `p(99)`, not the average. An average of 150 ms can hide the slowest 5% of requests, which may take two seconds.

## Stages: find where it breaks

A fixed number of users tells you how the API behaves at one load. To find the limit, ramp up in stages:

```js
export const options = {
  stages: [
    { duration: '1m', target: 50 },   // warm up
    { duration: '3m', target: 50 },   // steady
    { duration: '2m', target: 300 },  // push
    { duration: '3m', target: 300 },  // hold
    { duration: '1m', target: 0 },    // ramp down
  ],
};
```

Watch where the latency curve bends. Usually it stays flat, then at some point it climbs fast and errors appear. That bend is your real capacity, and the useful question is what hit its limit first: CPU, database connections, a lock, a slow query, or a downstream service.

These are the usual kinds of tests, all done by changing the stages:

- **Smoke:** a few users for a minute, to check the script and the environment work.
- **Load:** the traffic you expect on a normal busy day.
- **Stress:** beyond that, until something breaks.
- **Spike:** a jump from almost nothing to a lot in seconds, like a push notification or a sale starting.
- **Soak:** normal load for hours, to find memory leaks and connection pools that slowly run dry.

## Thresholds make it a test

Without thresholds, k6 prints numbers and someone has to read them. With thresholds, it passes or fails:

```js
export const options = {
  stages: [ /* ... */ ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<400', 'p(99)<1000'],
  },
};
```

If more than 1% of requests fail, or the 95th percentile goes over 400 ms, k6 exits with a non-zero code. Put a short load test in CI before a release, and a performance regression fails the pipeline like a broken unit test would.

## Virtual users are not requests per second

With `vus` and `stages`, each virtual user waits for its response before sending the next request. When the API slows down, every user sends fewer requests, so the load drops exactly when the system is struggling. That's realistic for users clicking around an app. It's not realistic for traffic that arrives at a fixed rate regardless of how fast you answer, like webhooks or callbacks from a partner.

For that, use an arrival-rate executor:

```js
export const options = {
  scenarios: {
    callbacks: {
      executor: 'constant-arrival-rate',
      rate: 200,
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 100,
      maxVUs: 1000,
    },
  },
};
```

Now k6 starts 200 requests every second, no matter how slow the responses get, and adds virtual users, up to `maxVUs`, to keep that rate. This is much better at showing what happens when you fall behind.

## Testing real flows

Most endpoints need authentication. Log in once in `setup()` and share the token with every virtual user:

```js
export function setup() {
  const res = http.post(`${__ENV.BASE_URL}/auth/login`, JSON.stringify({
    email: __ENV.TEST_EMAIL,
    password: __ENV.TEST_PASSWORD,
  }), { headers: { 'Content-Type': 'application/json' } });
  return { token: res.json('access_token') };
}

export default function (data) {
  const params = { headers: { Authorization: `Bearer ${data.token}` } };
  const res = http.get(`${__ENV.BASE_URL}/api/orders`, params);
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
```

Test the flows that matter, not only the cheapest endpoint. A list endpoint that reads from cache is usually fast. The checkout, the search with filters, and the report export are where the surprises are.

## A few things to watch out for

- **Don't run it against production** unless everyone knows and you have a way to stop it fast. Use a staging environment that looks like production, with similar data volume. A query that's fast on 500 rows can be slow on 5 million.
- **Run k6 from a separate machine.** If it runs on the same server as the API, they fight for CPU, and your numbers are unreliable. Also check that the machine running k6 isn't the bottleneck itself.
- **Watch the server while it runs**, not only the k6 output. CPU, memory, database connections, slow query logs. Server metrics explain the latency that k6 reports.
- **Be careful with rate limits and caches.** If your test hits the same URL with the same user, you might be testing the cache or the rate limiter instead of the API.

k6 is simple to set up and gives you real answers. If you're building APIs that need to hold up under pressure, I'd recommend giving it a try.
