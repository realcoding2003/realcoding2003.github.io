---
layout: post
title: "Docker Compose Redis healthcheck 설정 - 앱 시작 순서 보장하기"
date: 2025-08-05 09:00:00 +0900
categories: [Development, Tips]
tags: [Docker, Docker Compose, Redis, healthcheck]
author: "Kevin Park"
lang: ko
excerpt: "Docker Compose에서 Redis가 완전히 준비된 후에 앱을 시작하도록 healthcheck와 depends_on을 설정하는 방법."
---

## 문제

`depends_on`만 설정하면 Redis 컨테이너가 "시작"된 것만 보장하지, "준비"된 것은 보장하지 않는다. Redis가 아직 초기화 중인데 앱이 연결을 시도하면 Connection refused 에러가 발생한다.

## 해결

```yaml
services:
  app:
    build: .
    depends_on:
      redis:
        condition: service_healthy  # healthy 상태일 때만 시작
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

## 핵심 포인트

- `redis-cli ping`이 `PONG`을 반환하면 healthy 상태가 된다. `start_period: 30s`는 컨테이너 시작 후 30초 동안은 실패해도 unhealthy로 표시하지 않는다.
- `--maxmemory-policy allkeys-lru`는 메모리가 가득 차면 가장 오래된 키부터 자동 삭제한다. 캐시 용도라면 이 정책이 가장 무난하다.
- `deploy.resources.limits.memory`로 Redis가 호스트 메모리를 다 먹는 것도 방지한다. `maxmemory`와 별개로 컨테이너 레벨에서도 제한을 걸어야 안전하다.
