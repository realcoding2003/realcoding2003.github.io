---
layout: post
title: "Serve Static Sites with Nginx + Docker"
date: 2026-03-06 09:00:00 +0900
categories: [Development, Tips]
tags: [Nginx, Docker, static-site, docker-compose]
author: "Kevin Park"
lang: en
slug: nginx-docker-static-site
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2026/03/06/nginx-docker-static-site-en/
  - /2026/03/06/nginx-docker-static-site-en/
excerpt: "The simplest way to serve a static HTML/CSS/JS site using Nginx in a Docker container with Docker Compose."
---

## Problem

Need to quickly serve a built static site locally or on a server. Setting up a Node.js server is overkill.

## Solution

```yaml
# docker-compose.yml
version: '3'
services:
  nginx:
    image: nginx
    ports:
      - "80:80"
    volumes:
      - ./dist:/usr/share/nginx/html:ro
```

```bash
docker compose up -d
```

That's it. Put your build output in `./dist` and access it at `http://localhost`.

## Key Points

- The `:ro` (read-only) mount flag prevents accidental file modifications from inside the container. Always use it in production.
- The official Nginx image defaults to `/usr/share/nginx/html` as the document root, so it works without any custom configuration files.
- If you need SPA routing, add `try_files $uri $uri/ /index.html;` in a custom `nginx.conf`. Until then, this minimal setup is sufficient.
