---
layout: post
title: "Promise.allSettled vs Promise.all：部分的な失敗を適切に処理する"
date: 2026-03-10 09:00:00 +0900
categories: [Development, Tips]
tags: [JavaScript, Promise, 非同期, エラー処理]
author: "Kevin Park"
lang: ja
excerpt: "複数のAPIを同時に呼び出す時、1つの失敗で全体を失わないようにしましょう"
---

## 問題

ダッシュボードで複数のAPIを同時に呼び出す必要がありました。`Promise.all`を使ったところ、1つでも失敗すると全体がrejectされ、成功したデータまで失われてしまいました。

```javascript
// 1つでも失敗すると全部失われる
try {
  const [users, orders, stats] = await Promise.all([
    fetchUsers(),
    fetchOrders(),   // これが失敗すると
    fetchStats(),
  ]);
} catch (err) {
  // users, statsの結果も使えない
}
```

## 解決方法

`Promise.allSettled`を使えば、すべてのPromiseが完了するまで待ち、それぞれの成功・失敗を個別に確認できます。

```javascript
const results = await Promise.allSettled([
  fetchUsers(),
  fetchOrders(),
  fetchStats(),
]);

results.forEach((result, index) => {
  if (result.status === 'fulfilled') {
    console.log(`API ${index} 成功:`, result.value);
  } else {
    console.log(`API ${index} 失敗:`, result.reason);
  }
});
```

実務では以下のようなパターンで使います：

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

// 失敗したものだけログ出力
const failures = [usersResult, ordersResult, statsResult]
  .filter(r => r.status === 'rejected');

if (failures.length > 0) {
  console.error('一部のAPIが失敗:', failures.map(f => f.reason));
}
```

## ポイント

- `Promise.all`は1つでも失敗すると即座にreject — すべて成功が必須の場合に使います
- `Promise.allSettled`はすべて完了後に個別の結果を返します — 部分的な失敗を許容する場合に使います
- ダッシュボードやバッチ処理など「成功した分は表示し、失敗した分は別途処理」するシナリオに最適です
