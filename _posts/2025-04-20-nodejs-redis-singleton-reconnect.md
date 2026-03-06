---
layout: post
title: "Node.js Redis 연결 싱글톤 패턴 + 자동 재연결 전략"
date: 2025-04-20 09:00:00 +0900
categories: [Development, Tips]
tags: [Node.js, Redis, singleton, reconnect, TypeScript]
author: "Kevin Park"
lang: ko
excerpt: "Node.js에서 Redis 연결을 싱글톤으로 관리하고, 지수 백오프로 자동 재연결하는 패턴."
---

## 문제

Redis 클라이언트를 여러 모듈에서 각각 `createClient()`하면 연결이 중복 생성된다. 게다가 네트워크 끊김 시 재연결 로직이 없으면 앱이 그냥 죽어버린다.

## 해결

```typescript
import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;
let isConnecting = false;

export async function getRedisClient(): Promise<RedisClientType> {
  // 이미 연결되어 있으면 바로 반환
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  // 다른 곳에서 연결 중이면 대기
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
          return Math.min(retries * 100, 3000); // 지수 백오프
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

## 핵심 포인트

- `isConnecting` 플래그로 동시에 여러 곳에서 `connect()`를 호출하는 걸 방지한다. 이게 없으면 서버 시작 시 동시 요청이 들어올 때 연결이 여러 개 생긴다.
- `reconnectStrategy`에서 `retries * 100`은 100ms, 200ms, 300ms... 순으로 증가하고 `Math.min`으로 최대 3초까지만 기다린다. 10번 실패하면 포기한다.
- `finally` 블록에서 `isConnecting = false`를 하는 게 중요하다. 연결 실패 시에도 플래그가 풀려야 다음 시도가 가능하다.
