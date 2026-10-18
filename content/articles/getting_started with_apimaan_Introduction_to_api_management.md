---
title: An Introduction to API Management with Apiman
description: What an API manager does, how Apiman models it with organizations, plans, client apps and contracts, and what you get from putting a gateway in front of your APIs.
createdAt: "2023-05-26"
updatedAt: 2023-05-26
featuredImage: "/articles/api_mgt_feat.jpg"
tags:
  - apiman
  - api-management
  - api-gateway
---

When you have one API and one client, you don't need an API manager. You put a token check in your code and move on. It gets harder when several teams or partners call several APIs. Each partner needs its own key. One of them needs a lower rate limit. Another should only reach two endpoints. Someone asks how many requests partner X made last month. If all of that lives inside every service, every service ends up with its own slightly different copy of it.

An API manager moves those rules out of your services and into a gateway that sits in front of them. I looked at Apiman for this, and these are my notes.

## What is Apiman?

Apiman is an open-source API manager written in Java, under the Apache 2.0 license. It has two parts:

- **The Manager**, a web UI and a REST API where you define your APIs, their policies, and who is allowed to call them.
- **The Gateway**, which receives the real traffic, applies the policies, and forwards the request to your backend.

Your backend doesn't change. Clients call the gateway instead of calling the service directly.

## How Apiman models things

Apiman has a few concepts, and once they click, the UI makes sense:

- **Organization**: a container for everything else. Usually one per team or per company that publishes or consumes APIs.
- **API**: your backend endpoint, registered with a version. You publish it to the gateway when it's ready.
- **Policy**: a rule the gateway applies to requests, like rate limiting, a quota, an IP allowlist, BASIC authentication or caching. You can attach policies to an API, to a plan, or to a client.
- **Plan**: a set of policies under a name, like "Free" with 100 requests per hour and "Gold" with 10,000.
- **Client App**: the thing that calls your API, for example a partner's mobile app.
- **Contract**: links a client app to an API through one plan. Creating a contract gives the client an API key.

The client sends that key with every request, in the `X-API-Key` header or the `apikey` query parameter. The gateway uses the key to find the contract, which tells it which plan, and so which policies, apply to the request.

You can also publish an API as public, with no contracts and no keys. That's useful for health checks or open endpoints that still need a rate limit.

## What you get from it

**Access control in one place.** You cut off a partner by removing their contract, not by deleting keys from three services.

**Limits per client.** The same API can be cheap for one client and generous for another, without a single `if` in your code.

**Usage numbers.** The gateway sees every request, so it can tell you request counts, response times and errors per API and per client.

**Versions side by side.** Version 1 and version 2 of an API can both be published, so clients move to the new one on their own schedule.

## Getting started

The quickest way to try it is the Docker setup from the Apiman project. Then the usual flow in the Manager is:

1. Create an organization.
2. Register your API, point it at your backend's URL, and add the policies you want for everyone.
3. Create one or two plans with different limits, and attach them to the API.
4. Publish the API to the gateway.
5. Create a client app, make a contract with one of the plans, and copy the API key.
6. Call the gateway's URL for your API with that key, and watch the policies apply. Send requests faster than the plan allows and you'll get a 429.

Apiman doesn't replace your API testing tool. You still use Postman or curl to send the requests, but now you send them to the gateway and see what a real client will see.

## Is it worth it?

For one service and one client, no. A token check and a rate limiter in your code are simpler. Once you have partners with different access and limits, or several services that all need the same rules, a gateway pays for itself. Apiman is a solid open-source option, and its organization, plan and contract model is a good way to think about API access even if you end up using a different gateway.
