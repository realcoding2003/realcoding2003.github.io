---
layout: post
title: "Promise.allSettled vs Promise.all: Handle Partial Failures Gracefully"
date: 2026-03-10 09:00:00 +0900
categories: [Development, Tips]
tags: [JavaScript, Promise, async, error handling]
author: "Kevin Park"
lang: en
slug: promise-allsettled-vs-all-error-handling
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2026/03/10/promise-allsettled-vs-all-error-handling-en/
  - /2026/03/10/promise-allsettled-vs-all-error-handling-en/
excerpt: "When calling multiple APIs concurrently, one failure shouldn't take down everything"
---

## Problem

Building a dashboard that calls multiple APIs concurrently. Using `Promise.all`, a single API failure rejects everything — even the successful responses are lost.

```javascript
// One failure kills all results
try {
  const [users, orders, stats] = await Promise.all([
    fetchUsers(),
    fetchOrders(),   // If this fails...
    fetchStats(),
  ]);
} catch (err) {
  // Can't access users or stats either
}
```

## Solution

`Promise.allSettled` waits for all promises to complete and reports each result individually.

```javascript
const results = await Promise.allSettled([
  fetchUsers(),
  fetchOrders(),
  fetchStats(),
]);

results.forEach((result, index) => {
  if (result.status === 'fulfilled') {
    console.log(`API ${index} succeeded:`, result.value);
  } else {
    console.log(`API ${index} failed:`, result.reason);
  }
});
```

A practical pattern for production:

```javascript
const [usersResult, ordersResult, statsResult] = await Promise.allSettled([
  fetchUsers(),
  fetchOrders(),
  fetchStats(),
]);

const dashboard = {
  users: usersResult.status === 'fulfilled' ? usersResult.value : [],
  orders: ordersResult.status === 'fulfilled' ? ordersResult.value : [],
  stats: statsResult.status === 'fulfilled' ? statsResult.value : null,
};

// Log only the failures
const failures = [usersResult, ordersResult, statsResult]
  .filter(r => r.status === 'rejected');

if (failures.length > 0) {
  console.error('Some APIs failed:', failures.map(f => f.reason));
}
```

## Key Points

- `Promise.all` rejects immediately on the first failure — use when all promises must succeed
- `Promise.allSettled` waits for all to complete and gives individual results — use when partial failure is acceptable
- Ideal for dashboards, batch operations, or any scenario where you want to show what succeeded and handle failures separately
