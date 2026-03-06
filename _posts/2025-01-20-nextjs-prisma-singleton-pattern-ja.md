---
layout: post
title: "Next.jsでPrismaシングルトンパターン - ホットリロードの接続リークを解決"
date: 2025-01-20 09:00:00 +0900
categories: [Development, Tips]
tags: [Next.js, Prisma, singleton, database, TypeScript]
author: "Kevin Park"
lang: ja
excerpt: "Next.jsの開発モードでPrismaクライアントの接続が増え続ける問題をシングルトンパターンで解決する方法をご紹介します。"
---

## 問題

Next.jsの開発モードでファイルを修正するたびにホットリロードが発生し、`new PrismaClient()`が毎回新しく実行されます。その結果、DB接続が蓄積され、`Too many connections`エラーが発生します。

## 解決方法

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

## ポイント

- `globalThis`はホットリロードしても初期化されません。ここにPrismaインスタンスを保存しておけば、ファイルが再読み込みされても既存の接続を再利用できます。
- 本番環境ではモジュールは一度だけ読み込まれるため、`globalThis`への保存は不要です。そのため`NODE_ENV !== 'production'`の条件を付けています。
- たった5行のコードで、開発中にDB接続が数十個も溜まるのを防ぐことができます。
