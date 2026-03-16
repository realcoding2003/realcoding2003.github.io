---
layout: post
title: "Docker Multi-Stage Build for Next.js - Optimize Image Size"
date: 2025-03-10 09:00:00 +0900
categories: [Development, Tips]
tags: [Docker, Next.js, multi-stage build, optimization]
author: "Kevin Park"
lang: en
slug: docker-multistage-build-nextjs
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2025/03/10/docker-multistage-build-nextjs-en/
  - /2025/03/10/docker-multistage-build-nextjs-en/
excerpt: "Reduce Next.js Docker image from 1GB to under 200MB with a 3-stage Dockerfile."
---

## Problem

A naive Docker build for Next.js includes the entire `node_modules` directory, resulting in images over 1GB. DevDependencies bloat it even further.

## Solution

```dockerfile
# Stage 1: Install dependencies
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Run (minimal image)
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

## Key Points

- Set `output: 'standalone'` in `next.config.js` to generate `.next/standalone`. Without this, stage 3 won't work.
- The 3-stage split (`deps` → `builder` → `runner`) ensures only production-necessary files end up in the final image.
- Creating a non-root user with `adduser` is a security baseline. Even if the container is compromised, there's no root access.
