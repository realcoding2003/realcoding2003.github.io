---
layout: post
title: "React useEffect Infinite Loop: 3 Causes and How to Fix Them"
date: 2026-02-23 09:00:00 +0900
categories: [Development, Tips]
tags: [React, useEffect, Hooks, Debugging, Performance, Frontend]
author: "Kevin Park"
lang: en
slug: react-useeffect-infinite-loop-fix
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2026/02/23/react-useeffect-infinite-loop-fix-en/
  - /2026/02/23/react-useeffect-infinite-loop-fix-en/
excerpt: "Three common causes of useEffect running endlessly and the fix for each one."
---

## Problem

The component mounts and useEffect fires non-stop. Console logs flood the screen and the API gets hammered with hundreds of requests.

## Solution

Infinite loops in useEffect almost always come from three causes.

### 1. Missing Dependency Array

```jsx
// Infinite loop - runs on every render
useEffect(() => {
  fetchData();
});

// Fix - runs once on mount
useEffect(() => {
  fetchData();
}, []);
```

### 2. Objects or Arrays as Dependencies

```jsx
// Infinite loop - new object reference created every render
const options = { page: 1, limit: 10 };

useEffect(() => {
  fetchData(options);
}, [options]); // Reference changes every time

// Fix - stabilize with useMemo
const options = useMemo(() => ({ page: 1, limit: 10 }), []);

useEffect(() => {
  fetchData(options);
}, [options]);
```

### 3. Setting State Inside useEffect Without a Guard

```jsx
// Infinite loop - state change → re-render → useEffect → state change → ...
useEffect(() => {
  setCount(count + 1);
}, [count]);

// Fix - add a condition
useEffect(() => {
  if (count < 10) {
    setCount(count + 1);
  }
}, [count]);
```

## Key Points

- An empty dependency array `[]` means the effect runs once on mount. This is enough for most data fetching scenarios.
- Objects and arrays create new references on every render. Use `useMemo` or `useCallback` to stabilize them, or stick to primitive values in the dependency array.
- Don't ignore ESLint's `react-hooks/exhaustive-deps` warnings. They're usually a sign that the dependency structure needs rethinking.
