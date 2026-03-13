---
layout: post
title: "Extracting Generic Types with TypeScript infer Keyword"
date: 2026-03-14 09:00:00 +0900
categories: [Development, Tips]
tags: [TypeScript, infer, generic, type-system]
author: "Kevin Park"
lang: en
excerpt: "How to use TypeScript's infer keyword to extract types from generics cleanly."
---

## Problem

Sometimes you need to extract the inner type from a generic — the resolved type of a Promise, the element type of an array, or the return type of a function. Manually specifying these types is tedious and fragile.

## Solution

The `infer` keyword lets you declare a type variable inside a conditional type and extract it automatically.

```typescript
// Extract the inner type of a Promise
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type Result = UnwrapPromise<Promise<string>>; // string
type Plain = UnwrapPromise<number>; // number
```

Common patterns you'll use often:

```typescript
// Extract function return type
type ReturnOf<T> = T extends (...args: any[]) => infer R ? R : never;

const fetchUser = async () => ({ id: 1, name: 'Kevin' });
type User = ReturnOf<typeof fetchUser>; // Promise<{ id: number; name: string }>

// Extract array element type
type ElementOf<T> = T extends (infer E)[] ? E : never;

type Item = ElementOf<string[]>; // string
```

Particularly useful when working with API response types:

```typescript
type ApiResponse<T> = {
  data: T;
  status: number;
};

// Extract just the data field type
type ExtractData<T> = T extends ApiResponse<infer D> ? D : never;

type UserData = ExtractData<ApiResponse<{ id: number; name: string }>>;
// { id: number; name: string }
```

## Key Points

- `infer` only works inside `extends` conditional types
- Built-in utilities like `ReturnType` and `Parameters` are all built with `infer`
- Use `infer` instead of manual type extraction to maintain automatic type safety across nested generics
