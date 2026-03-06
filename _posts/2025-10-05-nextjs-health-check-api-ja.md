---
layout: post
title: "Next.js Health Check APIの作り方 - プロダクション監視の必須エンドポイント"
date: 2025-10-05 09:00:00 +0900
categories: [Development, Tips]
tags: [Next.js, health check, API, monitoring, production]
author: "Kevin Park"
lang: ja
excerpt: "Next.js App Routerでシステム状態を確認するHealth Check APIエンドポイントの作り方をご紹介します。"
---

## 問題

DockerやKubernetesでアプリが正常に動作しているか確認するには、Health Checkエンドポイントが必要です。単純に200を返すだけでなく、メモリやアップタイムなどの情報を含めると、デバッグ時に非常に便利です。

## 解決方法

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
# Dockerでの使用
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

## ポイント

- `process.memoryUsage()`は`heapUsed`、`heapTotal`、`rss`などを返します。`heapUsed`が増加し続ける場合は、メモリリークを疑うことができます。
- `process.uptime()`は秒単位です。これが頻繁に0に近い場合、アプリが繰り返しクラッシュして再起動していることを示しています。
- catchブロックでも必ずJSONを返す必要があります。500エラーでも監視ツールがレスポンスをパースできなければなりません。
