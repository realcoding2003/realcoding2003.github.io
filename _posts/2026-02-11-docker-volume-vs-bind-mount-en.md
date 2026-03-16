---
layout: post
title: "Docker Volume vs Bind Mount: When to Use Which"
date: 2026-02-11 09:00:00 +0900
categories: [Development, Tips]
tags: [Docker, Volume, Bind Mount, DevOps]
author: "Kevin Park"
lang: en
slug: docker-volume-vs-bind-mount
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2026/02/11/docker-volume-vs-bind-mount-en/
  - /2026/02/11/docker-volume-vs-bind-mount-en/
excerpt: "Understanding the difference between Docker volumes and bind mounts, and when to use each."
---

## Problem

Docker requires volumes to persist data, but the difference between `volume` and `bind mount` can be confusing.

```yaml
volumes:
  - ./src:/app/src          # bind mount
  - db-data:/var/lib/mysql  # named volume
```

## Solution

**Bind Mount** maps a specific host path directly into the container.

```yaml
# Development — file changes reflect immediately
services:
  app:
    volumes:
      - ./src:/app/src
      - ./config:/app/config
```

Since it directly accesses the host filesystem, code edits are instantly visible inside the container. Perfect for hot-reload during development.

**Named Volume** is a Docker-managed storage area.

```yaml
# Production — preserve database data
services:
  db:
    volumes:
      - db-data:/var/lib/mysql

volumes:
  db-data:  # managed by Docker
```

You don't need to know where it's stored on the host. Docker handles it, and data survives container removal.

## Common Mistake

```yaml
# This overwrites node_modules with the host's version
volumes:
  - .:/app

# Protect with an anonymous volume
volumes:
  - .:/app
  - /app/node_modules  # preserves container's node_modules
```

Mounting the entire host directory overwrites the container's `node_modules` (installed via `npm install`) with the host's (possibly empty) `node_modules`.

## Key Points

- **Bind Mount**: Direct host path mapping. Best for code syncing in development
- **Named Volume**: Docker-managed storage. Best for persisting production data
- Use anonymous volumes to protect directories like `node_modules` when bind-mounting the project root
- In production, prefer named volumes over bind mounts for better security
