---
layout: post
title: "TypeScript satisfies演算子で型安全性と型推論を両立する方法"
date: 2026-02-24 09:00:00 +0900
categories: [Development, Tips]
tags: [TypeScript, satisfies, type-safety, type-inference]
author: "Kevin Park"
lang: ja
excerpt: "asの代わりにsatisfiesを使えば、型検証と狭い型推論を同時に実現できます"
---

## 問題

TypeScriptでオブジェクトに型を指定する場合、通常はこのように書きます。

```typescript
type Config = {
  api: string;
  port: number;
  debug: boolean;
};

const config: Config = {
  api: "https://api.example.com",
  port: 3000,
  debug: true,
};
```

問題は、明示的に型を指定すると、TypeScriptが値を広い型で推論してしまうことです。`config.api`の型が`string`になってしまい、オートコンプリートが弱くなります。

`as const`を使うとreadonlyになって後から変更できませんし、`as Config`は型チェックをスキップするので危険です。

## 解決方法

`satisfies`演算子を使います。

```typescript
const config = {
  api: "https://api.example.com",
  port: 3000,
  debug: true,
} satisfies Config;

// config.apiの型: "https://api.example.com"（リテラル型！）
// config.portの型: 3000
// さらにConfig型との整合性も検証されます
```

実務でよく使うパターンはルート設定です。

```typescript
type Route = {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
};

const routes = {
  getUsers: { path: "/users", method: "GET" },
  createUser: { path: "/users", method: "POST" },
  updateUser: { path: "/users/:id", method: "PUT" },
} satisfies Record<string, Route>;

// routes.getUsers.methodの型: "GET"（stringではありません！）
```

`as`アサーションとの違いは明確です。

```typescript
// asは嘘をつくことが可能（危険）
const bad = { api: 123 } as Config; // エラーなし！

// satisfiesは実際に検証する
const good = { api: 123 } satisfies Config; // エラー発生！
```

## ポイント

- `satisfies`は型検証と狭い型推論を同時に実現します
- `as`は型アサーションなのでミスを見逃す可能性がありますが、`satisfies`は実際の値を検証します
- 設定オブジェクト、ルートマップ、テーマカラーなどの定数オブジェクトに特に有用です
- TypeScript 4.9から利用可能です
