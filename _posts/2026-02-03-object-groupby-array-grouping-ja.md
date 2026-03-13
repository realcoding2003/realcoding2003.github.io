---
layout: post
title: "Object.groupByで配列グルーピングを一行で完結する"
date: 2026-02-03 09:00:00 +0900
categories: [Development, Tips]
tags: [JavaScript, Object.groupBy, array, ES2024]
author: "Kevin Park"
lang: ja
excerpt: "reduceで複雑にグルーピングする時代は終わりました。Object.groupBy一つで完結します。"
---

## 問題

配列を特定の基準でグルーピングするたびに`reduce`を書く必要がありました。毎回初期値を設定し、キーの存在チェックをして、配列にpushして... 単純なグルーピングなのにコードが5行以上になるのは少し煩わしいものです。

```javascript
// 毎回これを書いていました
const grouped = items.reduce((acc, item) => {
  const key = item.category;
  if (!acc[key]) acc[key] = [];
  acc[key].push(item);
  return acc;
}, {});
```

## 解決方法

ES2024で追加された`Object.groupBy`を使えば一行で済みます。

```javascript
const items = [
  { name: 'りんご', category: '果物' },
  { name: 'にんじん', category: '野菜' },
  { name: 'バナナ', category: '果物' },
  { name: 'ほうれん草', category: '野菜' },
];

const grouped = Object.groupBy(items, (item) => item.category);
// {
//   '果物': [{ name: 'りんご', ... }, { name: 'バナナ', ... }],
//   '野菜': [{ name: 'にんじん', ... }, { name: 'ほうれん草', ... }]
// }
```

実務でよく使うパターンです：

```javascript
// ステータス別に注文を分類
const orders = [
  { id: 1, status: 'pending' },
  { id: 2, status: 'shipped' },
  { id: 3, status: 'pending' },
];
const byStatus = Object.groupBy(orders, (o) => o.status);

// 日付別にログをグルーピング
const logs = [
  { msg: 'error', date: '2026-03-14' },
  { msg: 'info', date: '2026-03-14' },
  { msg: 'warn', date: '2026-03-13' },
];
const byDate = Object.groupBy(logs, (log) => log.date);

// 条件付きグルーピング（成人/未成年）
const users = [
  { name: 'Kim', age: 25 },
  { name: 'Lee', age: 17 },
];
const byAge = Object.groupBy(users, (u) => u.age >= 18 ? 'adult' : 'minor');
```

## ポイント

- `Object.groupBy`はnullプロトタイプオブジェクトを返します。`hasOwnProperty`チェックは不要です
- キーにシンボルを使いたい場合は`Map.groupBy`を使います
- Node.js 21+、Chrome 117+、Safari 17.4+でサポートされています。古いブラウザにはcore-jsポリフィルで対応できます
