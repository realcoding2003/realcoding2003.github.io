---
layout: post
title: "Dockerマルチステージビルドで Next.js イメージを最適化する"
date: 2025-03-10 09:00:00 +0900
categories: [Development, Tips]
tags: [Docker, Next.js, multi-stage build, optimization]
author: "Kevin Park"
lang: ja
slug: docker-multistage-build-nextjs
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /ja/2025/03/10/docker-multistage-build-nextjs-ja/
  - /2025/03/10/docker-multistage-build-nextjs-ja/
excerpt: "Dockerマルチステージビルドで Next.js イメージを1GBから200MB以下に削減する実践的なDockerfileをご紹介します。"
---

## 問題

Next.jsをそのままDockerでビルドすると、`node_modules`全体が含まれてイメージが1GBを超えてしまいます。devDependenciesまで含まれるため、当然の結果です。

## 解決方法

```dockerfile
# Stage 1: 依存関係のインストール
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: ビルド
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: 実行（最小イメージ）
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

## ポイント

- `next.config.js`に`output: 'standalone'`を設定しないと、`.next/standalone`が生成されません。Stage 3が機能するための前提条件です。
- `deps` → `builder` → `runner`の3段階に分けることで、最終イメージには実行に必要なファイルのみが含まれます。
- `adduser`で非rootユーザーを作成して実行するのはセキュリティの基本です。コンテナが侵害されてもroot権限はありません。
