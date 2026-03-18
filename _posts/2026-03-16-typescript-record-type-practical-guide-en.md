---
layout: post
title: "TypeScript Record Type: Building Type-Safe Dictionaries"
date: 2026-03-16 09:00:00 +0900
categories: [Development, Tips]
tags: [TypeScript, Record, Type-System, Utility-Types]
author: "Kevin Park"
lang: en
slug: typescript-record-type-practical-guide
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2026/03/16/typescript-record-type-practical-guide-en/
  - /2026/03/16/typescript-record-type-practical-guide-en/
excerpt: "Practical patterns for TypeScript Record<K, V>. Enforce exhaustive key-value mappings at compile time."
---

## Problem

You're managing status code messages in an object, but when a new code is added to the union, TypeScript doesn't catch the missing entry. Index signatures like `{ [key: string]: string }` are too loose.

## Solution

`Record<K, V>` enforces both keys and values at the type level.

```typescript
type StatusCode = 'success' | 'error' | 'pending' | 'timeout';

const statusMessages: Record<StatusCode, string> = {
  success: 'Completed',
  error: 'An error occurred',
  pending: 'Processing',
  timeout: 'Request timed out',
};
// Missing any key = compile error
```

Adding a new value to `StatusCode` immediately flags `statusMessages` as incomplete.

Combine with enums for stronger guarantees:

```typescript
enum Permission {
  Read = 'read',
  Write = 'write',
  Delete = 'delete',
}

const permissionLabels: Record<Permission, string> = {
  [Permission.Read]: 'Read',
  [Permission.Write]: 'Write',
  [Permission.Delete]: 'Delete',
};
```

When not all keys are required, wrap with `Partial`:

```typescript
const overrides: Partial<Record<StatusCode, string>> = {
  error: 'Server error',
};
```

Works well for nested structures too:

```typescript
type Locale = 'ko' | 'en' | 'ja';

const translations: Record<Locale, Record<string, string>> = {
  ko: { greeting: '안녕하세요' },
  en: { greeting: 'Hello' },
  ja: { greeting: 'こんにちは' },
};
```

## Key Points

- `Record<K, V>` requires a value of type `V` for every key in `K`
- Union types or enums as keys catch missing entries at compile time
- Use `Partial<Record<K, V>>` when only some keys are needed
- Far more precise than `{ [key: string]: V }` index signatures
- Common in config mappings, i18n, and state management
