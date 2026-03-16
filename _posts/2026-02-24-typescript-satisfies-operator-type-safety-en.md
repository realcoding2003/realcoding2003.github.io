---
layout: post
title: "TypeScript satisfies Operator: Type Safety Without Losing Inference"
date: 2026-02-24 09:00:00 +0900
categories: [Development, Tips]
tags: [TypeScript, satisfies, type-safety, type-inference]
author: "Kevin Park"
lang: en
slug: typescript-satisfies-operator-type-safety
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2026/02/24/typescript-satisfies-operator-type-safety-en/
  - /2026/02/24/typescript-satisfies-operator-type-safety-en/
excerpt: "Use satisfies instead of as to get both type validation and narrow type inference"
---

## Problem

When typing objects in TypeScript, you typically do this:

```typescript
type Config = {
  api: string;
  port: number;
  debug: boolean;
};

const config: Config = {
  api: "https://api.example.com",
  port: 3000,
  debug: true,
};
```

The issue is that explicit type annotations widen the inferred type. `config.api` becomes `string` instead of the literal `"https://api.example.com"`, weakening autocomplete.

Using `as const` makes everything readonly, and `as Config` skips type checking entirely.

## Solution

Use the `satisfies` operator.

```typescript
const config = {
  api: "https://api.example.com",
  port: 3000,
  debug: true,
} satisfies Config;

// config.api type: "https://api.example.com" (literal type!)
// config.port type: 3000
// Still validated against Config
```

A practical use case is route configuration:

```typescript
type Route = {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
};

const routes = {
  getUsers: { path: "/users", method: "GET" },
  createUser: { path: "/users", method: "POST" },
  updateUser: { path: "/users/:id", method: "PUT" },
} satisfies Record<string, Route>;

// routes.getUsers.method type: "GET" (not string!)
```

The difference from `as` is clear:

```typescript
// as allows lies (dangerous)
const bad = { api: 123 } as Config; // No error!

// satisfies actually validates
const good = { api: 123 } satisfies Config; // Error!
```

## Key Points

- `satisfies` gives you both type validation and narrow type inference
- Unlike `as`, `satisfies` validates the actual value against the type
- Especially useful for config objects, route maps, and theme constants
- Available since TypeScript 4.9
