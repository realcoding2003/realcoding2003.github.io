---
layout: post
title: "Node.js Redis接続シングルトンパターン + 自動再接続戦略"
date: 2025-04-20 09:00:00 +0900
categories: [Development, Tips]
tags: [Node.js, Redis, singleton, reconnect, TypeScript]
author: "Kevin Park"
lang: ja
slug: nodejs-redis-singleton-reconnect
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /ja/2025/04/20/nodejs-redis-singleton-reconnect-ja/
  - /2025/04/20/nodejs-redis-singleton-reconnect-ja/
excerpt: "Node.jsでRedis接続をシングルトンで管理し、指数バックオフで自動再接続するパターンをご紹介します。"
---

## 問題

複数のモジュールがそれぞれ`createClient()`を呼び出すと、Redis接続が重複して作成されます。さらに、ネットワーク切断時に再接続ロジックがないと、アプリがそのまま停止してしまいます。

## 解決方法

```typescript
import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;
let isConnecting = false;

export async function getRedisClient(): Promise<RedisClientType> {
  // すでに接続されていればそのまま返す
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  // 他の箇所で接続中なら待機
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
          return Math.min(retries * 100, 3000); // 指数バックオフ
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

## ポイント

- `isConnecting`フラグにより、複数箇所から同時に`connect()`が呼ばれるのを防ぎます。これがないと、サーバー起動時の同時リクエストで接続が重複して作成されます。
- `reconnectStrategy`では`retries * 100`で100ms、200ms、300ms...と増加し、`Math.min`で最大3秒まで待機します。10回失敗したら諦めます。
- `finally`ブロックで`isConnecting = false`にするのが重要です。接続失敗時にもフラグが解除されないと、次の試行ができなくなります。
