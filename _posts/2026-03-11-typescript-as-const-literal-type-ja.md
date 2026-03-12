---
layout: post
title: "TypeScript as constで型の拡大を防ぐ方法"
date: 2026-03-11 09:00:00 +0900
categories: [Development, Tips]
tags: [TypeScript, as const, リテラル型, 型安全性]
author: "Kevin Park"
lang: ja
excerpt: "as constを使えばenumなしでも型安全な定数を作成できます"
---

## 問題

定数オブジェクトを定義しても、TypeScriptが型を広く推論してしまいます。

```typescript
const STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  CLOSED: 'closed',
};
// 型: { PENDING: string, ACTIVE: string, CLOSED: string }
// 'pending' | 'active' | 'closed'ではなく、ただのstring
```

`STATUS.PENDING`が`string`型になるため、`'pending' | 'active' | 'closed'`を期待する関数パラメータで型エラーが発生します。

## 解決方法

`as const`を付けるだけです。

```typescript
const STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  CLOSED: 'closed',
} as const;
// 型: { readonly PENDING: 'pending', readonly ACTIVE: 'active', readonly CLOSED: 'closed' }
```

これで`STATUS.PENDING`は`string`ではなく`'pending'`リテラル型になります。ユニオン型も抽出できます：

```typescript
type StatusType = typeof STATUS[keyof typeof STATUS];
// 'pending' | 'active' | 'closed'

function updateStatus(status: StatusType) {
  // statusは正確に3つの値のいずれかのみ受け付けます
}

updateStatus(STATUS.ACTIVE);  // OK
updateStatus('random');        // コンパイルエラー
```

配列にも使えます：

```typescript
const ROLES = ['admin', 'editor', 'viewer'] as const;
type Role = typeof ROLES[number];  // 'admin' | 'editor' | 'viewer'

// string[]ではなくタプルとして推論されます
// readonly ['admin', 'editor', 'viewer']
```

関数の戻り値にも便利です：

```typescript
function getConfig() {
  return {
    apiUrl: 'https://api.example.com',
    timeout: 5000,
    retries: 3,
  } as const;
}
// retriesの型はnumberではなく3
```

## ポイント

- `as const`はすべてのプロパティを`readonly`＋リテラル型にして、型の拡大を防ぎます
- `typeof` + `keyof`でユニオン型を抽出すれば、enumなしで同じ効果が得られます
- ランタイムオーバーヘッドがゼロで、enumよりもツリーシェイキングに優れています
