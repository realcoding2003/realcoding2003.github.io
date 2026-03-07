---
layout: post
title: "How to Properly Type React useRef with TypeScript"
date: 2026-03-01 09:00:00 +0900
categories: [Development, Tips]
tags: [React, TypeScript, useRef, DOM, type]
author: "Kevin Park"
lang: en
excerpt: "Whether you include null in the useRef generic changes the entire type. Here's how to get it right"
---

## Problem

When using `useRef` with TypeScript in React, you've likely seen this error:

```typescript
const inputRef = useRef<HTMLInputElement>();

inputRef.current.focus();
// 'inputRef.current' is possibly 'undefined'.
```

Passing `null` as the initial value gives a different error:

```typescript
const inputRef = useRef<HTMLInputElement>(null);

inputRef.current.focus();
// 'inputRef.current' is possibly 'null'.
```

The fix isn't just adding null checks everywhere. Understanding `useRef` overloads makes this clean.

## Solution

`useRef` has two overloads:

```typescript
// 1. DOM ref (readonly .current)
// Generic includes null, initial value is null
const inputRef = useRef<HTMLInputElement>(null);
// Type: RefObject<HTMLInputElement> — current is readonly

// 2. Mutable value storage (writable .current)
// Initial value type matches generic
const countRef = useRef<number>(0);
// Type: MutableRefObject<number> — current is writable
```

DOM refs are readonly because React manages them. Value refs are mutable because you manage them yourself.

Common patterns in practice:

```typescript
// DOM element references
const inputRef = useRef<HTMLInputElement>(null);
const divRef = useRef<HTMLDivElement>(null);

// Timer ID storage
const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

// Previous value tracking
const prevValueRef = useRef<string>("");

// Mount state tracking
const isMountedRef = useRef<boolean>(false);
```

In event handlers where the element is definitely mounted, non-null assertion is fine:

```typescript
const handleSubmit = () => {
  inputRef.current!.focus();
};
```

In `useEffect`, use conditional checks:

```typescript
useEffect(() => {
  if (inputRef.current) {
    inputRef.current.focus();
  }
}, []);
```

## Key Points

- `useRef<T>(null)` → `RefObject<T>` (DOM refs, readonly current)
- `useRef<T>(initialValue)` → `MutableRefObject<T>` (value storage, writable current)
- Always initialize DOM refs with `null` and add null checks when accessing
- Use MutableRefObject for timers, previous values, and external library instances
