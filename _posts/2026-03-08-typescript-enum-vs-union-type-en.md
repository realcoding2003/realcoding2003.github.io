---
layout: post
title: "TypeScript Enum vs Union Type: Which One Should You Use?"
date: 2026-03-08 09:00:00 +0900
categories: [Development, Tips]
tags: [TypeScript, Enum, Union Type, Type Safety]
author: "Kevin Park"
lang: en
slug: typescript-enum-vs-union-type
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2026/03/08/typescript-enum-vs-union-type-en/
  - /2026/03/08/typescript-enum-vs-union-type-en/
excerpt: "A practical comparison of TypeScript Enum and Union Type to help you choose the right one."
---

## Problem

When defining a set of constants in TypeScript, you face the classic dilemma: `enum` or `union type`? Both work, but they have very different runtime behaviors.

## The Enum Trap

```typescript
enum Status {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Pending = 'PENDING'
}
```

This compiles to a runtime object in JavaScript:

```javascript
var Status;
(function (Status) {
  Status["Active"] = "ACTIVE";
  Status["Inactive"] = "INACTIVE";
  Status["Pending"] = "PENDING";
})(Status || (Status = {}));
```

That's extra bundle size, and it doesn't tree-shake well.

## Solution: Union Type with `as const`

```typescript
const STATUS = {
  Active: 'ACTIVE',
  Inactive: 'INACTIVE',
  Pending: 'PENDING',
} as const;

type Status = typeof STATUS[keyof typeof STATUS];
// Result: 'ACTIVE' | 'INACTIVE' | 'PENDING'
```

With `as const`, TypeScript infers literal types. Minimal runtime footprint, excellent tree-shaking.

For simple cases, a plain union is even cleaner:

```typescript
type Direction = 'up' | 'down' | 'left' | 'right';
```

## Key Points

- `enum` creates a runtime object, increasing bundle size
- `const enum` gets inlined but doesn't work with `--isolatedModules` (Vite, Next.js)
- `as const` + union type is the better default for most use cases
- Use `enum` only when you need bitwise flags or runtime reverse mapping
