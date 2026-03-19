---
layout: post
title: "TypeScript Type Guards with 'is' Keyword - Narrowing Union Types Safely"
date: 2026-03-19 09:00:00 +0900
categories: [Development, Tips]
tags: [TypeScript, Type Guard, Type Narrowing, is keyword]
author: "Kevin Park"
lang: en
excerpt: "Learn how to create custom type guard functions in TypeScript to safely narrow union types using the 'is' keyword."
---

## Problem

When an API response comes as a union of success and error types, TypeScript can't narrow the type inside `if` blocks without explicit type assertions.

```typescript
type SuccessResponse = { status: 'ok'; data: string[] };
type ErrorResponse = { status: 'error'; message: string };
type ApiResponse = SuccessResponse | ErrorResponse;

function handle(res: ApiResponse) {
  // Can't access res.data - type isn't narrowed
}
```

## Solution

Create a custom type guard function using the `is` keyword.

```typescript
function isSuccess(res: ApiResponse): res is SuccessResponse {
  return res.status === 'ok';
}

function handle(res: ApiResponse) {
  if (isSuccess(res)) {
    // res is narrowed to SuccessResponse here
    console.log(res.data);
  } else {
    // res is ErrorResponse here
    console.log(res.message);
  }
}
```

This is also useful for array filtering.

```typescript
const results: (string | null)[] = ['a', null, 'b', null];

// Still (string | null)[] after filter...
const bad = results.filter(x => x !== null);

// Narrowed to string[] with type guard
const good = results.filter((x): x is string => x !== null);
```

## Key Points

- The `is` keyword goes in the return type position — when the function returns `true`, TypeScript narrows the type accordingly
- Passing a type guard to `Array.filter` automatically narrows the resulting array type
- Most useful for complex type branching where `typeof` or `in` operators fall short
