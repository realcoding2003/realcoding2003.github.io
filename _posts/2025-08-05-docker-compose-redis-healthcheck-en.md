---
layout: post
title: "Docker Compose Redis Healthcheck - Guarantee Startup Order"
date: 2025-08-05 09:00:00 +0900
categories: [Development, Tips]
tags: [Docker, Docker Compose, Redis, healthcheck]
author: "Kevin Park"
lang: en
slug: docker-compose-redis-healthcheck
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2025/08/05/docker-compose-redis-healthcheck-en/
  - /2025/08/05/docker-compose-redis-healthcheck-en/
excerpt: "Use healthcheck and depends_on condition to ensure Redis is fully ready before your app starts in Docker Compose."
---

## Problem

`depends_on` alone only guarantees the Redis container has "started", not that it's "ready". If the app connects while Redis is still initializing, you get Connection refused errors.

## Solution

```yaml
services:
  app:
    build: .
    depends_on:
      redis:
        condition: service_healthy  # start only when healthy
    environment:
      - REDIS_URL=redis://redis:6379

  redis:
    image: redis/redis-stack:latest
    environment:
      - REDIS_ARGS=--maxmemory 512mb --maxmemory-policy allkeys-lru
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    volumes:
      - redis-data:/data
    deploy:
      resources:
        limits:
          memory: 768M

volumes:
  redis-data:
```

## Key Points

- `redis-cli ping` returning `PONG` signals healthy status. `start_period: 30s` gives Redis 30 seconds to initialize without being marked unhealthy.
- `--maxmemory-policy allkeys-lru` auto-evicts the oldest keys when memory is full. The safest default for cache use cases.
- `deploy.resources.limits.memory` prevents Redis from consuming all host memory. Set container-level limits independently of Redis's `maxmemory`.
