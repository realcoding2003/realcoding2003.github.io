---
layout: post
title: "Node.js Redis Singleton Connection + Auto-Reconnect Strategy"
date: 2025-04-20 09:00:00 +0900
categories: [Development, Tips]
tags: [Node.js, Redis, singleton, reconnect, TypeScript]
author: "Kevin Park"
lang: en
slug: nodejs-redis-singleton-reconnect
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2025/04/20/nodejs-redis-singleton-reconnect-en/
  - /2025/04/20/nodejs-redis-singleton-reconnect-en/
excerpt: "Manage Redis connections as a singleton in Node.js with exponential backoff reconnection."
---

## Problem

When multiple modules each call `createClient()`, you end up with duplicate Redis connections. Without reconnection logic, a network hiccup kills your app.

## Solution

```typescript
import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;
let isConnecting = false;

export async function getRedisClient(): Promise<RedisClientType> {
  // Return existing connection if open
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  // Wait if another caller is already connecting
  if (isConnecting) {
    while (isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (redisClient && redisClient.isOpen) return redisClient;
  }

  isConnecting = true;
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) return new Error('Max retries reached');
          return Math.min(retries * 100, 3000); // exponential backoff
        }
      }
    });
    await redisClient.connect();
    return redisClient;
  } finally {
    isConnecting = false;
  }
}
```

## Key Points

- The `isConnecting` flag prevents multiple simultaneous `connect()` calls. Without it, concurrent requests during startup create duplicate connections.
- `reconnectStrategy` uses `retries * 100` for incremental delays (100ms, 200ms, 300ms...), capped at 3 seconds via `Math.min`. Gives up after 10 failures.
- The `finally` block ensures `isConnecting` is reset even on failure, allowing subsequent connection attempts.
