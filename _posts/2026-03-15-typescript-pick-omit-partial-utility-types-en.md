---
layout: post
title: "TypeScript Pick, Omit, Partial: Practical Utility Type Combinations"
date: 2026-03-15 09:00:00 +0900
categories: [Development, Tips]
tags: [TypeScript, Type-System, Utility-Types, Frontend]
author: "Kevin Park"
lang: en
excerpt: "How to combine TypeScript utility types to create clean API request/response types without duplicating interfaces."
---

## Problem

You have one database model type, but each API endpoint needs different fields. Create requires all fields except `id`, update requires `id` plus optional fields. Defining separate interfaces for each leads to type sprawl.

## Solution

Combine utility types to derive new types from existing ones.

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

// Create: exclude auto-generated fields
type CreateUserDto = Omit<User, 'id' | 'createdAt'>;

// Update: id required, rest optional
type UpdateUserDto = Pick<User, 'id'> & Partial<Omit<User, 'id'>>;

// List response: only needed fields
type UserListItem = Pick<User, 'id' | 'name' | 'email'>;
```

Extract common patterns into reusable generics:

```typescript
// Update DTO: K fields required, rest optional
type UpdateDto<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>;

type UpdateUserDto = UpdateDto<User, 'id'>;
type UpdatePostDto = UpdateDto<Post, 'id' | 'slug'>;
```

## Key Points

- `Omit<T, K>` removes fields — ideal for create DTOs
- `Pick<T, K>` selects fields — ideal for list/summary types
- `Partial<T>` makes all fields optional — ideal for update DTOs
- Combining these avoids redundant interface definitions
- Extract repeated patterns into generic types for reuse
