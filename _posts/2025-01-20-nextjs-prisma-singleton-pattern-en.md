---
layout: post
title: "Next.js Prisma Singleton Pattern - Fix Hot Reload Connection Leaks"
date: 2025-01-20 09:00:00 +0900
categories: [Development, Tips]
tags: [Next.js, Prisma, singleton, database, TypeScript]
author: "Kevin Park"
lang: en
slug: nextjs-prisma-singleton-pattern
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2025/01/20/nextjs-prisma-singleton-pattern-en/
  - /2025/01/20/nextjs-prisma-singleton-pattern-en/
excerpt: "Fix Prisma client connection leaks during Next.js hot reload with a simple singleton pattern."
---

## Problem

In Next.js dev mode, every file save triggers a hot reload that creates a new `PrismaClient()` instance. Database connections pile up until you hit a `Too many connections` error.

## Solution

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

## Key Points

- `globalThis` survives hot reloads. Storing the Prisma instance here ensures the existing connection is reused when modules are re-evaluated.
- In production, modules load only once, so storing on `globalThis` is unnecessary. The `NODE_ENV !== 'production'` guard handles this.
- Five lines of code prevent dozens of zombie database connections during development.
