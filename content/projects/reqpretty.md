---
order: 5
name: reqpretty
description: Go middleware that logs HTTP requests and responses in a structured, readable format.
url: https://github.com/1saifj/reqpretty
language: go
wip: true
isPrivate: false
sourceType: open-source
role: Author
impact: Open-source Go middleware for readable request and response logs
stack:
  - Go
  - net/http
---

reqpretty is a small open-source Go middleware. It logs HTTP requests and responses in a structured format that is easy to read while you develop.

## Features

- Request logging: method, URL, headers, query parameters and body.
- Response logging: status code, headers and body.
- Optional colour output.
- Works as standard `net/http` middleware, with a configurable logger.

## How it works

`DebugHandler` wraps your `http.Handler` and takes an `Options` struct. It reads the request body into a buffer and restores it, so your handler can still read it. A custom `http.ResponseWriter` captures the status code and the response body. When your handler finishes, the middleware logs the request and the response together.

It is still a work in progress. The source is on [GitHub](https://github.com/1saifj/reqpretty).
