---
layout: post
title: "Next.js에서 Prisma 싱글톤 패턴 - 핫리로드 연결 누수 해결"
date: 2025-01-20 09:00:00 +0900
categories: [Development, Tips]
tags: [Next.js, Prisma, singleton, database, TypeScript]
author: "Kevin Park"
lang: ko
excerpt: "Next.js 개발 모드에서 Prisma 클라이언트 연결이 계속 쌓이는 문제를 싱글톤 패턴으로 해결하는 방법."
---

## 문제

Next.js 개발 모드에서 파일을 수정할 때마다 핫리로드가 발생하면서 `new PrismaClient()`가 매번 새로 실행된다. 결과적으로 DB 연결이 계속 쌓여서 `Too many connections` 에러가 터진다.

## 해결

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
```

## 핵심 포인트

- `globalThis`는 핫리로드를 해도 초기화되지 않는다. 여기에 Prisma 인스턴스를 저장해두면 파일이 다시 로드되어도 기존 연결을 재사용한다.
- 프로덕션에서는 모듈이 한 번만 로드되니까 `globalThis`에 저장할 필요가 없다. 그래서 `NODE_ENV !== 'production'` 조건을 건다.
- 이 패턴 5줄이면 끝나는데, 이걸 안 하면 개발할 때 DB 연결이 수십 개씩 쌓이는 걸 보게 된다.
