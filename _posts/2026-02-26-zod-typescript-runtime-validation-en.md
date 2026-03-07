---
layout: post
title: "Zod: Runtime Type Validation for TypeScript"
date: 2026-02-26 09:00:00 +0900
categories: [Development, Tips]
tags: [TypeScript, Zod, validation, runtime-type-check]
author: "Kevin Park"
lang: en
excerpt: "TypeScript types vanish at runtime. Use Zod to validate API responses and external data at runtime"
---

## Problem

TypeScript types only exist at compile time. They're completely erased at runtime.

```typescript
type User = {
  id: number;
  name: string;
  email: string;
};

const res = await fetch("/api/user/1");
const user: User = await res.json(); // Just a type cast, no actual validation
```

If the server returns `{ id: "abc", name: null }`, it passes through silently and blows up in the UI later. Debugging the root cause becomes a nightmare.

## Solution

Zod lets you define a schema that serves as both a type definition and a runtime validator.

```bash
npm install zod
```

```typescript
import { z } from "zod";

// Schema = type definition + runtime validation rules
const UserSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  email: z.string().email(),
});

// Extract type from schema automatically
type User = z.infer<typeof UserSchema>;

// Validate API response
const res = await fetch("/api/user/1");
const data = await res.json();
const user = UserSchema.parse(data); // Throws immediately on invalid data!
```

Use `safeParse` for non-throwing validation:

```typescript
const result = UserSchema.safeParse(data);

if (!result.success) {
  console.error(result.error.flatten());
  // { fieldErrors: { email: ["Invalid email"] } }
  return;
}

// result.data is a validated User type
console.log(result.data.name);
```

Works great for form validation too:

```typescript
const SignupSchema = z.object({
  username: z.string().min(3, "Must be at least 3 characters"),
  password: z.string().min(8, "Must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

## Key Points

- TypeScript types disappear at runtime, so external data always needs runtime validation
- `z.infer` extracts types from schemas, eliminating duplicate type definitions
- `parse` throws on failure, `safeParse` returns a Result type
- Use it for API responses, form inputs, environment variables, and any external data
