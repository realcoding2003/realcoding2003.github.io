---
layout: post
title: "React Compiler: Drop useMemo and useCallback, Let the Compiler Handle It"
date: 2026-03-23 09:00:00 +0900
categories: [Development, Tips]
tags: [React, React Compiler, useMemo, useCallback, Performance]
author: "Kevin Park"
lang: en
excerpt: "React Compiler automatically memoizes your components at build time, eliminating the need for manual useMemo and useCallback in most cases."
---

## Problem

Manual memoization with `useMemo` and `useCallback` has long been a pain point in React development. Forget one, and you get unnecessary re-renders. Add them everywhere, and you're stuck managing dependency arrays.

```jsx
// This was everywhere in every component
const filteredList = useMemo(() => {
  return items.filter(item => item.active);
}, [items]);

const handleClick = useCallback((id) => {
  setSelected(id);
}, []);
```

Deciding what to memoize was a constant cognitive overhead.

## Solution

React Compiler v1.0 handles memoization automatically at build time.

For Next.js, it's a one-liner:

```js
// next.config.js
const nextConfig = {
  reactCompiler: true,
};

module.exports = nextConfig;
```

For existing projects, use the Babel plugin:

```bash
npm install -D babel-plugin-react-compiler
```

```js
// babel.config.js
module.exports = {
  plugins: [
    ['babel-plugin-react-compiler'],
  ],
};
```

Now you can write plain code and let the compiler optimize:

```jsx
// The compiler inserts memoization automatically
const filteredList = items.filter(item => item.active);

const handleClick = (id) => {
  setSelected(id);
};
```

No manual `useMemo` or `useCallback` needed. The compiler analyzes your components and inserts memoization where it matters.

## Key Points

- React Compiler analyzes components at build time and applies automatic memoization
- Eliminates the need for `useMemo`, `useCallback`, and `React.memo` in 95%+ of cases
- Next.js: just set `reactCompiler: true` in your config
- Existing manual memoization still works — no conflicts
- Your code must follow React's rules (pure functions, immutability) for the compiler to optimize effectively
