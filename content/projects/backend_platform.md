---
order: 1
name: Backend Platform and Cloud Infrastructure
description: Backend, cloud infrastructure and edge services for a product that partners and their customers use every day: integrations, billing callbacks, a content API, reporting, partner dashboards, and apps in Arabic, English and Kurdish.
language: typescript
wip: false
isPrivate: true
sourceType: company
role: Lead engineer
impact: TypeScript and Go services, Pulumi infrastructure on Google Cloud, load tests before launch
stack:
  - TypeScript
  - Go
  - Pulumi
  - Google Cloud
  - PostgreSQL
  - Next.js
---

I lead engineering for a product that partners and their customers use every day. This page describes the work in general terms, and the code, the partners and the numbers stay private.

## What I build

- The backend monorepo: integrations with partner platforms, billing callbacks, a content API, and reporting.
- Infrastructure as code on Google Cloud with Pulumi: Cloud Run services, Valkey, GitHub OIDC federation, preview environments for pull requests, and production alerts.
- A Go TLS service at the edge. It reloads its certificate when the files change, and it has k6 load tests.
- A partner-facing edge API with circuit breakers and scripted deploys and rollbacks.
- Partner dashboards and timed quiz apps in Arabic, English and Kurdish, with right-to-left layouts.

## How I work on it

- CI runs only the database tests that a change touches, and lint warnings fail the build.
- Mutation tests check that the tests fail when the code is wrong.
- Logs are structured, and personal data stays out of URLs and logs.

## Stack

TypeScript, Express, PostgreSQL with Drizzle, Valkey (Redis-compatible), Zod, OpenAPI, Next.js, React, Go, Pulumi, Google Cloud, Docker, k6, Playwright, Vitest.
