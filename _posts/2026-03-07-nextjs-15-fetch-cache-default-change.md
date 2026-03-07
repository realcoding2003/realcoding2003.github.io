---
layout: post
title: "Next.js 15 fetch cache 기본값이 바뀌었다 - no-store 대응법"
date: 2026-03-07 09:00:00 +0900
categories: [Development, Tips]
tags: [Next.js, React, cache, fetch, revalidate]
author: "Kevin Park"
lang: ko
excerpt: "Next.js 15에서 fetch 기본 캐시가 no-store로 바뀌면서 생기는 성능 문제와 해결법"
---

## 문제

Next.js 14에서 15로 업그레이드했더니 페이지 로딩이 눈에 띄게 느려졌다. 네트워크 탭을 열어보니 같은 API를 매번 새로 호출하고 있었다. 분명 어제까지 잘 캐싱되던 건데?

```typescript
// 이 코드, Next.js 14에서는 자동으로 캐싱됐다
const res = await fetch('https://api.example.com/products');
const data = await res.json();
```

아무것도 안 건드렸는데 왜 갑자기 느려진 건지 한참 삽질했다.

## 원인

Next.js 15부터 `fetch()`의 기본 cache 옵션이 바뀌었다.

| 버전 | 기본값 | 동작 |
|------|--------|------|
| Next.js 14 이하 | `force-cache` | 한 번 가져오면 캐싱 |
| Next.js 15 이상 | `no-store` | 매번 새로 요청 |

Vercel 팀이 이렇게 바꾼 이유는 명확하다. 캐시가 기본값이면 "왜 데이터가 안 바뀌지?" 같은 버그가 너무 많았던 거다. 차라리 명시적으로 캐시를 지정하게 만든 것이다.

근데 이걸 모르고 업그레이드하면... 그냥 느려진 사이트를 보게 된다.

## 해결

세 가지 방법이 있다.

### 1. fetch 단위로 캐시 지정

```typescript
// 영구 캐시 (빌드 시점 데이터)
const res = await fetch('https://api.example.com/products', {
  cache: 'force-cache'
});

// 시간 기반 캐시 (1시간마다 갱신)
const res = await fetch('https://api.example.com/products', {
  next: { revalidate: 3600 }
});
```

### 2. 라우트 세그먼트 설정

페이지 전체를 정적으로 만들고 싶으면 이렇게 한다.

```typescript
// app/products/page.tsx
export const dynamic = 'force-static';
export const revalidate = 3600; // 1시간

export default async function ProductsPage() {
  const res = await fetch('https://api.example.com/products');
  // 이 페이지의 모든 fetch가 캐싱된다
}
```

### 3. 태그 기반 캐시 무효화

Server Action에서 특정 데이터만 갱신할 때 쓴다.

```typescript
// 데이터 가져올 때 태그 지정
const res = await fetch('https://api.example.com/products', {
  next: { tags: ['products'] }
});

// Server Action에서 캐시 무효화
'use server';
import { revalidateTag } from 'next/cache';

export async function updateProduct() {
  await db.product.update(/* ... */);
  revalidateTag('products'); // 'products' 태그 캐시만 날림
}
```

## 핵심 포인트

- **dev 모드 함정**: `next dev`에서는 캐싱이 제대로 동작하지 않는다. 반드시 `next build && next start`로 테스트해야 한다
- **마이그레이션 팁**: 14에서 15로 올릴 때 기존 fetch에 `cache: 'force-cache'`를 일괄 추가하면 기존 동작을 유지할 수 있다
- **use cache 디렉티브**: `unstable_cache`는 deprecated 예정이고, 새로운 `use cache` 디렉티브로 전환되는 추세다. 새 프로젝트라면 이쪽을 주목하자
