---
layout: post
title: "Docker Compose YAML Anchors (&) - Eliminate Repeated Config"
date: 2025-04-05 09:00:00 +0900
categories: [Development, Tips]
tags: [Docker, Docker Compose, YAML, anchor, DRY]
author: "Kevin Park"
lang: en
slug: docker-compose-yaml-anchor
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2025/04/05/docker-compose-yaml-anchor-en/
  - /2025/04/05/docker-compose-yaml-anchor-en/
excerpt: "Use YAML anchors (&) and merge keys (<<) in Docker Compose to eliminate duplicated service configurations."
---

## Problem

When running multiple similar services in Docker Compose, common settings like image, volumes, and restart get copy-pasted across every service definition. With 10 services, that's 10 copies of the same config.

## Solution

```yaml
# Define common config with an anchor (&)
x-app-common: &app-common
  image: my-app:latest
  volumes:
    - ./cert:/app/cert:ro
  restart: unless-stopped
  dns:
    - 172.16.0.1

services:
  # Merge (<<) common config, add service-specific settings
  app01:
    <<: *app-common
    container_name: app01
    environment:
      - APP_ID=01
      - PORT=3001

  app02:
    <<: *app-common
    container_name: app02
    environment:
      - APP_ID=02
      - PORT=3002

  app03:
    <<: *app-common
    container_name: app03
    environment:
      - APP_ID=03
      - PORT=3003
```

## Key Points

- Keys starting with `x-` are extension fields that Docker Compose ignores. They're the ideal place for shared configuration.
- `&name` defines an anchor, `<<: *name` merges it. Any key specified after the merge overrides the anchored value.
- The more services you have, the bigger the payoff. When managing 10 services, changing a common setting in one place eliminates configuration drift.
