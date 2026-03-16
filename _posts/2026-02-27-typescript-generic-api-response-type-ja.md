---
layout: post
title: "TypeScriptジェネリクスでAPIレスポンスを型安全に扱う"
date: 2026-02-27 09:00:00 +0900
categories: [Development, Tips]
tags: [TypeScript, Generics, API, Type Safety, Frontend, Backend]
author: "Kevin Park"
lang: ja
slug: typescript-generic-api-response-type
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /ja/2026/02/27/typescript-generic-api-response-type-ja/
  - /2026/02/27/typescript-generic-api-response-type-ja/
excerpt: "API呼び出しのたびにasで型アサーションしていませんか。ジェネリクスで一括管理する方法をご紹介します。"
---

## 問題

API呼び出しのたびに`as`で型アサーションをしていました。

```typescript
const res = await fetch('/api/users');
const data = await res.json() as User[];
```

これでは実際のレスポンス構造が変わっても型エラーが出ず、ランタイムでクラッシュしてしまいます。

## 解決方法

ジェネリクスのラッパー関数を一つ作ります。

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

async function fetchApi<T>(url: string): Promise<ApiResponse<T>> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```

使い方はこのようになります。

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

// dataの型がApiResponse<User[]>として推論されます
const { data: users } = await fetchApi<User[]>('/api/users');

// dataの型がApiResponse<User>として推論されます
const { data: user } = await fetchApi<User>('/api/users/1');
```

## ポイント

- `as`型アサーションはコンパイラを欺くものです。ジェネリクスは型システムが直接推論するようにします。ランタイムの安全性に大きな差が出ます。
- エラーレスポンスもジェネリクスで統一したい場合は、ユニオン型を使います：`Promise<ApiResponse<T> | ApiError>`。
- Axiosをお使いであれば、すでに`axios.get<T>()`のようにジェネリクスをサポートしています。このパターンはfetch APIで同じ体験を実現するものです。
