---
title: A Simple CI/CD Pipeline for a Small VPS
description: The pipeline I used for the University of Kufa graduate tracking system. GitHub Actions builds the image, GHCR stores it, Watchtower deploys it, Shoutrrr tells me what happened, and Infisical keeps the secrets out of the repo.
createdAt: "2025-08-26"
updatedAt: "2026-10-18"
featuredImage: "/articles/vps_pipeline_feat.jpg"
tags:
  - devops
  - ci-cd
  - docker
  - github-actions
---

> Update, October 2026: the original Watchtower project (`containrrr/watchtower`) was archived in December 2025. Its last image also fails on Docker Engine 29 with "client version 1.25 is too old", because Docker raised the minimum API version. Setting `DOCKER_API_VERSION=1.44` on the Watchtower container works around it, and there are maintained forks. For a new setup, pick a maintained updater. The rest of this post is the setup as I described it in August 2025.

Automated deploys are normal for big teams with a cluster and a platform team. The challenge is a single VPS with limited resources. That might be government infrastructure, or a startup that wants a solid setup at the lowest cost with the simplest tools.

That was my situation with the graduate tracking system at the University of Kufa. The backend runs in Docker on a single server. I wanted a pipeline that gives me:

- fast and safe updates
- visibility into every deploy, good or bad
- secrets that never sit in the repo or in a loose `.env` file
- as little manual work as possible

This is what I ended up with.

## 1. Build the image with GitHub Actions and push to GHCR

Every push to `main` builds a Docker image and pushes it to the GitHub Container Registry. You don't run a registry, and the `GITHUB_TOKEN` that every workflow gets is enough to push, so there is no extra credential to manage on the CI side.

```yaml
name: build

on:
  push:
    branches: [main]

permissions:
  contents: read
  packages: write

jobs:
  image:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - uses: docker/build-push-action@v6
        with:
          push: true
          tags: |
            ghcr.io/your-org/grad-api:latest
            ghcr.io/your-org/grad-api:${{ github.sha }}
```

Two tags on purpose. `latest` is what the server follows. The commit SHA tag means every version stays in the registry, so going back to an older build is one `docker pull` away. Write the image name in lowercase. GHCR rejects uppercase names, and `${{ github.repository }}` keeps the case of your org name.

## 2. Let Watchtower deploy it

Watchtower runs as a container on the VPS. It checks the registry on an interval, and when the image behind `latest` changes, it pulls it, stops the old container and starts a new one with the same settings. Nothing on the server needs SSH access from CI, and CI doesn't need to know the server exists.

```yaml
services:
  api:
    image: ghcr.io/your-org/grad-api:latest
    restart: unless-stopped
    environment:
      - DATABASE_URL
      - JWT_SECRET
    labels:
      - com.centurylinklabs.watchtower.enable=true

  watchtower:
    image: containrrr/watchtower
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /home/deploy/.docker/config.json:/config.json:ro
    environment:
      WATCHTOWER_LABEL_ENABLE: "true"
      WATCHTOWER_POLL_INTERVAL: "120"
      WATCHTOWER_CLEANUP: "true"
```

A few details worth knowing:

- The image is private, so Watchtower needs to log in to GHCR. Run `docker login ghcr.io` once on the server, as the user that runs your deploys (`deploy` here), with a token that only has `read:packages`. Then mount the `config.json` it creates into the container like above.
- `WATCHTOWER_LABEL_ENABLE` means Watchtower only touches containers with the label. Without it, Watchtower also updates your database image, and you don't want a Postgres major version arriving by surprise.
- It's a stop and start, not a rolling update. There are a few seconds where the API is down. For many systems that's acceptable. If it isn't for yours, you need two containers behind a proxy, and at that point you're building a small orchestrator.
- Mounting the Docker socket gives the container full control of Docker on that host. Only do it with an image you trust.

## 3. Notifications with Shoutrrr

I wanted to know about every deploy without watching anything. Watchtower has Shoutrrr built in, so it's one more environment variable. Shoutrrr speaks Slack, Telegram, email and many others through a URL:

```yaml
      WATCHTOWER_NOTIFICATION_URL: "telegram://<bot-token>@telegram?chats=<chat-id>"
```

Now every update on the server sends a message with the container and the new image.

That only covers the server side. If the build itself fails, Watchtower never hears about it. So the workflow gets one more step that only runs on failure, using the Shoutrrr CLI image:

```yaml
      - name: notify on failure
        if: failure()
        run: |
          docker run --rm containrrr/shoutrrr send \
            --url "${{ secrets.SHOUTRRR_URL }}" \
            --message "Build failed on ${{ github.ref_name }}: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
```

Between the two, I get a message when a deploy lands and a message when one never makes it.

## 4. Secrets with Infisical

The biggest risk in a setup like this is secrets. Database passwords and API keys end up in a `.env` file on the server, then in a backup, then in someone's laptop.

I moved them to Infisical. The server authenticates with a machine identity. You start the stack through the Infisical CLI, which loads the secrets for that environment:

```bash
infisical run --env=prod -- docker compose up -d
```

`infisical run` puts the secrets in the environment of the `docker compose` command only. They reach a container because the compose file lists them by name under `environment:` (the `DATABASE_URL` and `JWT_SECRET` lines above). A name without a value tells Compose to copy it from its own environment. Forget a name there and the container simply won't have it.

Rotating a secret is then a change in the Infisical dashboard and a restart, with no file to edit and nothing to commit. Access is per person and per environment, and there's an audit log of who changed what.

One thing to keep in mind with Watchtower: when it recreates a container, it reuses the environment the container already had. So the new container keeps the secrets the old one had, which is what you want during an update. A changed secret still needs a restart through `infisical run`.

## What I got out of it

- Full control over deploys without complicated steps. Merge to `main`, and Watchtower picks up the new image on its next check.
- A record of every event. Each image in GHCR maps to a commit, and each deploy shows up as a message.
- Safe enough for production on a modest server. No inbound access from CI, no secrets in the repo.
- Room to grow. When the project outgrows one VPS, the images and the registry stay the same. Only the part that runs them changes.

If you're a developer or you run a small team, try something like this before you reach for heavier tools. It doesn't take long to set up, and a lot of the stress around updating services goes away.

Have you set up CI/CD in a limited environment? I'd like to hear what worked for you, or what you'd change in this one.
