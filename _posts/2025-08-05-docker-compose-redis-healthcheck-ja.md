---
layout: post
title: "Docker Compose Redis healthcheck設定 - アプリの起動順序を保証する"
date: 2025-08-05 09:00:00 +0900
categories: [Development, Tips]
tags: [Docker, Docker Compose, Redis, healthcheck]
author: "Kevin Park"
lang: ja
slug: docker-compose-redis-healthcheck
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /ja/2025/08/05/docker-compose-redis-healthcheck-ja/
  - /2025/08/05/docker-compose-redis-healthcheck-ja/
excerpt: "Docker ComposeでRedisが完全に準備できてからアプリを起動するように、healthcheckとdepends_onを設定する方法をご紹介します。"
---

## 問題

`depends_on`だけを設定すると、Redisコンテナが「起動した」ことしか保証されず、「準備できた」ことは保証されません。Redisがまだ初期化中にアプリが接続を試みると、Connection refusedエラーが発生します。

## 解決方法

```yaml
services:
  app:
    build: .
    depends_on:
      redis:
        condition: service_healthy  # healthyの時のみ起動
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

## ポイント

- `redis-cli ping`が`PONG`を返せばhealthy状態になります。`start_period: 30s`はコンテナ起動後30秒間は失敗してもunhealthyとマークしません。
- `--maxmemory-policy allkeys-lru`はメモリがいっぱいになると最も古いキーから自動削除します。キャッシュ用途なら最も無難なポリシーです。
- `deploy.resources.limits.memory`でRedisがホストメモリを使い切るのも防止します。`maxmemory`とは別に、コンテナレベルでも制限をかけるのが安全です。
