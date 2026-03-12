---
layout: post
title: "Promise.allSettled vs Promise.all, 에러 처리가 다르다"
date: 2026-03-10 09:00:00 +0900
categories: [Development, Tips]
tags: [JavaScript, Promise, 비동기, 에러 처리]
author: "Kevin Park"
lang: ko
excerpt: "API 여러 개 동시에 쏠 때 하나 실패한다고 전부 날리면 안 되잖아"
---

## 문제

대시보드를 만드는데 여러 API를 동시에 호출해야 했다. `Promise.all`을 썼더니 하나만 실패해도 전체가 reject 되면서 성공한 데이터까지 날아가버렸다.

```javascript
// 하나라도 실패하면 전부 날아감
try {
  const [users, orders, stats] = await Promise.all([
    fetchUsers(),
    fetchOrders(),   // 이게 실패하면
    fetchStats(),
  ]);
} catch (err) {
  // users, stats 결과도 못 쓴다
}
```

## 해결

`Promise.allSettled`를 쓰면 전부 완료될 때까지 기다리고, 각각의 성공/실패를 따로 확인할 수 있다.

```javascript
const results = await Promise.allSettled([
  fetchUsers(),
  fetchOrders(),
  fetchStats(),
]);

// 각 결과의 status로 성공/실패 판별
results.forEach((result, index) => {
  if (result.status === 'fulfilled') {
    console.log(`API ${index} 성공:`, result.value);
  } else {
    console.log(`API ${index} 실패:`, result.reason);
  }
});
```

실무에서는 이런 식으로 패턴화해서 쓴다:

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

// 실패한 것만 로깅
const failures = [usersResult, ordersResult, statsResult]
  .filter(r => r.status === 'rejected');

if (failures.length > 0) {
  console.error('일부 API 실패:', failures.map(f => f.reason));
}
```

## 핵심 포인트

- `Promise.all`은 하나라도 실패하면 즉시 reject — 전부 성공해야만 하는 경우에 쓴다
- `Promise.allSettled`는 전부 완료 후 각각 결과를 줌 — 부분 실패를 허용할 때 쓴다
- 대시보드, 배치 처리처럼 "가능한 건 보여주고, 실패한 건 따로 처리"하는 상황에 딱이다
