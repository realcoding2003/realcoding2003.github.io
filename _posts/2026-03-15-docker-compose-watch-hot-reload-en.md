---
layout: post
title: "Docker Compose Watch: Hot Reload for Containerized Development"
date: 2026-03-15 09:00:00 +0900
categories: [Development, Tips]
tags: [Docker, docker-compose, hot-reload, Dev-Environment]
author: "Kevin Park"
lang: en
slug: docker-compose-watch-hot-reload
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2026/03/15/docker-compose-watch-hot-reload-en/
  - /2026/03/15/docker-compose-watch-hot-reload-en/
excerpt: "Use docker compose watch to auto-sync code changes into containers. Cleaner than volume mounts."
---

## Problem

Rebuilding with `docker compose up --build` after every code change is painful. Volume mounts work but introduce `node_modules` conflicts and cross-OS file watching issues.

## Solution

Docker Compose 2.22+ introduced `watch`. Add a `develop.watch` section to your `compose.yaml`:

```yaml
services:
  web:
    build: .
    ports:
      - "3000:3000"
    develop:
      watch:
        # Source code changes → auto-sync to container
        - action: sync
          path: ./src
          target: /app/src

        # package.json changes → rebuild image
        - action: rebuild
          path: ./package.json

        # Config changes → sync and restart
        - action: sync+restart
          path: ./config
          target: /app/config
```

Run it with:

```bash
docker compose watch
```

Three actions are available:

- **sync**: Copies files directly into the container. Best for source code changes.
- **rebuild**: Rebuilds the image and replaces the container. Best for dependency changes.
- **sync+restart**: Copies files then restarts the container. Best for config changes.

Exclude specific files with `ignore`:

```yaml
        - action: sync
          path: ./src
          target: /app/src
          ignore:
            - "**/*.test.ts"
            - "**/__snapshots__"
```

## Key Points

- `docker compose watch` detects file changes and auto-syncs/rebuilds/restarts
- No `node_modules` conflicts unlike volume mounts
- Three actions (`sync`, `rebuild`, `sync+restart`) for different change types
- `ignore` filters out unnecessary file changes
- Requires Docker Compose 2.22+ (Docker Desktop 4.24+)
