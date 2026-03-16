---
layout: post
title: "Next.js 15でfetchのキャッシュデフォルトが変更 - no-storeへの対応方法"
date: 2026-03-07 09:00:00 +0900
categories: [Development, Tips]
tags: [Next.js, React, cache, fetch, revalidate]
author: "Kevin Park"
lang: ja
slug: nextjs-15-fetch-cache-default-change
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /ja/2026/03/07/nextjs-15-fetch-cache-default-change-ja/
  - /2026/03/07/nextjs-15-fetch-cache-default-change-ja/
excerpt: "Next.js 15でfetchのデフォルトキャッシュがno-storeに変更され、パフォーマンスが低下する問題と解決方法を解説します"
---

## 問題

Next.js 14から15にアップグレードしたところ、ページの読み込みが目に見えて遅くなりました。ネットワークタブを確認すると、同じAPIを毎回新しくリクエストしていました。

```typescript
// このコード、Next.js 14では自動的にキャッシュされていました
const res = await fetch('https://api.example.com/products');
const data = await res.json();
```

コードは何も変えていないのに、フレームワークのデフォルト値が変わっていたのです。

## 原因

Next.js 15から`fetch()`のデフォルト`cache`オプションが変更されました。

| バージョン | デフォルト値 | 動作 |
|-----------|------------|------|
| Next.js 14以下 | `force-cache` | 一度取得したらキャッシュ |
| Next.js 15以上 | `no-store` | 毎回新しくリクエスト |

Vercelチームがこの変更を行った理由は、暗黙的なキャッシュによる「なぜデータが更新されないのか？」というバグが多すぎたためです。明示的に指定する方が安全という判断です。

## 解決方法

3つのアプローチがあります。

### 1. fetch単位でキャッシュを指定

```typescript
// 永続キャッシュ（ビルド時のデータ）
const res = await fetch('https://api.example.com/products', {
  cache: 'force-cache'
});

// 時間ベースのキャッシュ（1時間ごとに更新）
const res = await fetch('https://api.example.com/products', {
  next: { revalidate: 3600 }
});
```

### 2. ルートセグメント設定

ページ全体を静的にしたい場合はこちらです。

```typescript
// app/products/page.tsx
export const dynamic = 'force-static';
export const revalidate = 3600; // 1時間

export default async function ProductsPage() {
  const res = await fetch('https://api.example.com/products');
  // このページの全てのfetchがキャッシュされます
}
```

### 3. タグベースのキャッシュ無効化

Server Actionから特定のデータだけを更新する場合に使います。

```typescript
// データ取得時にタグを指定
const res = await fetch('https://api.example.com/products', {
  next: { tags: ['products'] }
});

// Server Actionでキャッシュを無効化
'use server';
import { revalidateTag } from 'next/cache';

export async function updateProduct() {
  await db.product.update(/* ... */);
  revalidateTag('products'); // 'products'タグのキャッシュのみ削除
}
```

## ポイント

- **開発モードの罠**: `next dev`ではキャッシュが正しく動作しません。必ず`next build && next start`でテストしてください
- **マイグレーションのコツ**: 14から15へアップグレードする際、既存のfetchに`cache: 'force-cache'`を一括追加すれば、以前の動作を維持できます
- **use cacheディレクティブ**: `unstable_cache`は非推奨になる予定で、新しい`use cache`ディレクティブへの移行が進んでいます。新規プロジェクトではこちらに注目してください
