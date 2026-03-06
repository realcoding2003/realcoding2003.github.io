---
layout: post
title: "Redis Key Naming Convention - Hierarchical Key Design"
date: 2025-12-20 09:00:00 +0900
categories: [Development, Tips]
tags: [Redis, naming convention, key design, TypeScript]
author: "Kevin Park"
lang: en
excerpt: "Organize Redis keys with a hierarchical naming convention and TypeScript helper functions."
---

## Problem

Redis keys like `"user_123_session"` and `"sess-user-123"` created inconsistently make it impossible to track what keys exist or search with `KEYS *`.

## Solution

```typescript
const KEY_PREFIX = 'myapp';

export const keys = {
  conversation: (id: string) => `${KEY_PREFIX}:conv:${id}`,
  conversationMessages: (id: string) => `${KEY_PREFIX}:conv:${id}:messages`,
  userSettings: (id: string) => `${KEY_PREFIX}:settings:${id}`,
  userSession: (id: string) => `${KEY_PREFIX}:session:${id}`,
  allConversations: () => `${KEY_PREFIX}:conversations`,
  monthlyIndex: (ym: string) => `${KEY_PREFIX}:conv:month:${ym}`,
  cacheProduct: (id: string) => `${KEY_PREFIX}:cache:product:${id}`,
};

// Usage
await redis.set(keys.conversation('abc123'), JSON.stringify(data));
await redis.del(keys.userSession('user1'));
```

## Key Points

- Colons (`:`) as hierarchy separators are the Redis community standard. GUI tools like RedisInsight display this structure as a tree.
- Generating keys via functions eliminates typos and enables IDE autocompletion. String literals make future refactoring impossible.
- A `KEY_PREFIX` allows multiple apps to coexist on the same Redis instance without key collisions.
