---
layout: post
title: "Type-Safe API Responses with TypeScript Generics"
date: 2026-02-27 09:00:00 +0900
categories: [Development, Tips]
tags: [TypeScript, Generics, API, Type Safety, Frontend, Backend]
author: "Kevin Park"
lang: en
slug: typescript-generic-api-response-type
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2026/02/27/typescript-generic-api-response-type-en/
  - /2026/02/27/typescript-generic-api-response-type-en/
excerpt: "Stop using 'as' type assertions on every API call. Use generics to make your fetch wrapper truly type-safe."
---

## Problem

Casting API responses with `as` on every fetch call:

```typescript
const res = await fetch('/api/users');
const data = await res.json() as User[];
```

If the actual response shape changes, TypeScript won't catch it — it blows up at runtime instead.

## Solution

Create a generic fetch wrapper:

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

Usage:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

// data is typed as ApiResponse<User[]>
const { data: users } = await fetchApi<User[]>('/api/users');

// data is typed as ApiResponse<User>
const { data: user } = await fetchApi<User>('/api/users/1');
```

## Key Points

- `as` assertions lie to the compiler. Generics let the type system infer correctly. The runtime safety difference is significant.
- For error responses, use a union type: `Promise<ApiResponse<T> | ApiError>`.
- If you're using Axios, it already supports generics via `axios.get<T>()`. This pattern gives the same experience with the native fetch API.
