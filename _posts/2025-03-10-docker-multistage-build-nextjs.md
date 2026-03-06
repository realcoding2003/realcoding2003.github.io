---
layout: post
title: "Docker 멀티스테이지 빌드로 Next.js 이미지 최적화하기"
date: 2025-03-10 09:00:00 +0900
categories: [Development, Tips]
tags: [Docker, Next.js, multi-stage build, optimization]
author: "Kevin Park"
lang: ko
excerpt: "Docker 멀티스테이지 빌드로 Next.js 이미지를 1GB에서 200MB 이하로 줄이는 실전 Dockerfile."
---

## 문제

Next.js를 그냥 Docker로 빌드하면 `node_modules` 전체가 포함되어 이미지가 1GB를 넘긴다. devDependencies까지 포함되니까 당연한 결과다.

## 해결

```dockerfile
# Stage 1: 의존성 설치
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: 빌드
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: 실행 (최소 이미지)
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

## 핵심 포인트

- `next.config.js`에 `output: 'standalone'`을 설정해야 `.next/standalone`가 생성된다. 이게 없으면 3단계가 동작하지 않는다.
- `deps` → `builder` → `runner` 3단계로 나누면 최종 이미지에는 실행에 필요한 파일만 들어간다.
- `adduser`로 비루트 사용자를 만들어서 실행하는 건 보안 기본이다. 컨테이너가 뚫려도 root 권한은 없다.
