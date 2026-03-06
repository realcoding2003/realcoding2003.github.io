---
layout: post
title: "Next.js Health Check API 만들기 - 프로덕션 모니터링 필수 엔드포인트"
date: 2025-10-05 09:00:00 +0900
categories: [Development, Tips]
tags: [Next.js, health check, API, monitoring, production]
author: "Kevin Park"
lang: ko
excerpt: "Next.js App Router에서 시스템 상태를 확인하는 Health Check API 엔드포인트를 만드는 방법."
---

## 문제

Docker나 Kubernetes에서 앱이 살아있는지 확인하려면 health check 엔드포인트가 필요하다. 단순히 200을 반환하는 것보다 메모리, 업타임 같은 정보를 같이 주면 디버깅할 때 훨씬 편하다.

## 해결

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
# Docker에서 사용
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

## 핵심 포인트

- `process.memoryUsage()`는 `heapUsed`, `heapTotal`, `rss` 등을 반환한다. `heapUsed`가 계속 증가하면 메모리 누수를 의심할 수 있다.
- `process.uptime()`은 초 단위다. 이게 자꾸 0에 가까우면 앱이 반복적으로 크래시하고 재시작되고 있다는 신호다.
- catch 블록에서도 반드시 JSON을 반환해야 한다. 500 에러라도 모니터링 도구가 파싱할 수 있어야 하니까.
