---
layout: post
title: "Array Grouping in One Line with Object.groupBy"
date: 2026-02-03 09:00:00 +0900
categories: [Development, Tips]
tags: [JavaScript, Object.groupBy, array, ES2024]
author: "Kevin Park"
lang: en
excerpt: "Stop writing reduce boilerplate for grouping arrays. Object.groupBy does it in one line."
---

## Problem

Every time you needed to group an array by some criteria, you had to write a `reduce` with initial value setup, key existence checks, and array pushes. A simple grouping operation shouldn't require 5+ lines of code.

```javascript
// The old way
const grouped = items.reduce((acc, item) => {
  const key = item.category;
  if (!acc[key]) acc[key] = [];
  acc[key].push(item);
  return acc;
}, {});
```

## Solution

ES2024's `Object.groupBy` does it in one line.

```javascript
const items = [
  { name: 'Apple', category: 'fruit' },
  { name: 'Carrot', category: 'vegetable' },
  { name: 'Banana', category: 'fruit' },
  { name: 'Spinach', category: 'vegetable' },
];

const grouped = Object.groupBy(items, (item) => item.category);
// {
//   fruit: [{ name: 'Apple', ... }, { name: 'Banana', ... }],
//   vegetable: [{ name: 'Carrot', ... }, { name: 'Spinach', ... }]
// }
```

Common real-world patterns:

```javascript
// Group orders by status
const orders = [
  { id: 1, status: 'pending' },
  { id: 2, status: 'shipped' },
  { id: 3, status: 'pending' },
];
const byStatus = Object.groupBy(orders, (o) => o.status);

// Group logs by date
const logs = [
  { msg: 'error', date: '2026-03-14' },
  { msg: 'info', date: '2026-03-14' },
  { msg: 'warn', date: '2026-03-13' },
];
const byDate = Object.groupBy(logs, (log) => log.date);

// Conditional grouping
const users = [
  { name: 'Kim', age: 25 },
  { name: 'Lee', age: 17 },
];
const byAge = Object.groupBy(users, (u) => u.age >= 18 ? 'adult' : 'minor');
```

## Key Points

- `Object.groupBy` returns a null-prototype object — no need for `hasOwnProperty` checks
- Use `Map.groupBy` if you need symbol keys or non-string keys
- Supported in Node.js 21+, Chrome 117+, Safari 17.4+. Use core-js polyfill for older browsers
