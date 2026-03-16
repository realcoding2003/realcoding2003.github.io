---
layout: post
title: "Next.js 15 Changed the Default Fetch Cache - How to Handle no-store"
date: 2026-03-07 09:00:00 +0900
categories: [Development, Tips]
tags: [Next.js, React, cache, fetch, revalidate]
author: "Kevin Park"
lang: en
slug: nextjs-15-fetch-cache-default-change
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2026/03/07/nextjs-15-fetch-cache-default-change-en/
  - /2026/03/07/nextjs-15-fetch-cache-default-change-en/
excerpt: "Next.js 15 changed fetch default caching to no-store. Here's how to fix the performance hit."
---

## Problem

After upgrading from Next.js 14 to 15, pages started loading noticeably slower. The network tab revealed every API call was being made fresh — no caching at all.

```typescript
// This was automatically cached in Next.js 14
const res = await fetch('https://api.example.com/products');
const data = await res.json();
```

Nothing changed in the code. The framework defaults did.

## Root Cause

Next.js 15 changed the default `cache` option for `fetch()`:

| Version | Default | Behavior |
|---------|---------|----------|
| Next.js 14 and below | `force-cache` | Fetched once, then cached |
| Next.js 15 and above | `no-store` | Fresh request every time |

The Vercel team made this change because implicit caching caused too many "why isn't my data updating?" bugs. Explicit is better than implicit.

## Solution

Three approaches to restore caching:

### 1. Per-fetch Cache Option

```typescript
// Permanent cache (build-time data)
const res = await fetch('https://api.example.com/products', {
  cache: 'force-cache'
});

// Time-based cache (refresh every hour)
const res = await fetch('https://api.example.com/products', {
  next: { revalidate: 3600 }
});
```

### 2. Route Segment Config

To make an entire page static:

```typescript
// app/products/page.tsx
export const dynamic = 'force-static';
export const revalidate = 3600; // 1 hour

export default async function ProductsPage() {
  const res = await fetch('https://api.example.com/products');
  // All fetches in this page are now cached
}
```

### 3. Tag-based Cache Invalidation

Selectively invalidate cache from Server Actions:

```typescript
// Tag the fetch
const res = await fetch('https://api.example.com/products', {
  next: { tags: ['products'] }
});

// Invalidate in Server Action
'use server';
import { revalidateTag } from 'next/cache';

export async function updateProduct() {
  await db.product.update(/* ... */);
  revalidateTag('products'); // Only invalidates 'products' tag
}
```

## Key Points

- **Dev mode trap**: Caching doesn't work properly in `next dev`. Always test with `next build && next start`
- **Migration tip**: When upgrading from 14 to 15, add `cache: 'force-cache'` to existing fetches to preserve previous behavior
- **use cache directive**: `unstable_cache` is being deprecated in favor of the new `use cache` directive. For new projects, keep an eye on this API
