---
layout: post
title: "Next.js Health Check API - Essential Production Monitoring Endpoint"
date: 2025-10-05 09:00:00 +0900
categories: [Development, Tips]
tags: [Next.js, health check, API, monitoring, production]
author: "Kevin Park"
lang: en
slug: nextjs-health-check-api
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2025/10/05/nextjs-health-check-api-en/
  - /2025/10/05/nextjs-health-check-api-en/
excerpt: "Build a health check API endpoint in Next.js App Router with system metrics for production monitoring."
---

## Problem

Docker and Kubernetes need a health check endpoint to verify your app is alive. Returning system metrics alongside the 200 status makes debugging much easier.

## Solution

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.NEXT_PUBLIC_VERSION || '1.0.0',
      node: process.version,
      platform: process.platform,
      arch: process.arch,
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
```

```yaml
# Docker usage
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

## Key Points

- `process.memoryUsage()` returns `heapUsed`, `heapTotal`, and `rss`. If `heapUsed` keeps growing, suspect a memory leak.
- `process.uptime()` is in seconds. If it's frequently near zero, your app is crash-looping.
- Always return JSON even in the catch block. Monitoring tools need to parse the response regardless of status code.
