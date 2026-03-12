---
layout: post
title: "TypeScript as const: Stop Type Widening for Good"
date: 2026-03-11 09:00:00 +0900
categories: [Development, Tips]
tags: [TypeScript, as const, literal types, type safety]
author: "Kevin Park"
lang: en
excerpt: "Use as const to create type-safe constants without enums and prevent type widening"
---

## Problem

You define a constants object, but TypeScript widens the types:

```typescript
const STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  CLOSED: 'closed',
};
// Type: { PENDING: string, ACTIVE: string, CLOSED: string }
// Just 'string', not the literal types you wanted
```

`STATUS.PENDING` is typed as `string`, so it won't match a parameter expecting `'pending' | 'active' | 'closed'`.

## Solution

Add `as const`:

```typescript
const STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  CLOSED: 'closed',
} as const;
// Type: { readonly PENDING: 'pending', readonly ACTIVE: 'active', readonly CLOSED: 'closed' }
```

Now `STATUS.PENDING` is the literal type `'pending'`. You can also extract a union type:

```typescript
type StatusType = typeof STATUS[keyof typeof STATUS];
// 'pending' | 'active' | 'closed'

function updateStatus(status: StatusType) {
  // Only accepts one of the three values
}

updateStatus(STATUS.ACTIVE);  // OK
updateStatus('random');        // Compile error
```

Works with arrays too:

```typescript
const ROLES = ['admin', 'editor', 'viewer'] as const;
type Role = typeof ROLES[number];  // 'admin' | 'editor' | 'viewer'

// Inferred as a tuple, not string[]
// readonly ['admin', 'editor', 'viewer']
```

Also useful for function return values:

```typescript
function getConfig() {
  return {
    apiUrl: 'https://api.example.com',
    timeout: 5000,
    retries: 3,
  } as const;
}
// retries is typed as 3, not number
```

## Key Points

- `as const` makes all properties `readonly` with literal types, preventing type widening
- Combine with `typeof` + `keyof` to extract union types — no enums needed
- Zero runtime overhead and better tree-shaking compared to enums
