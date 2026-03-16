---
layout: post
title: "TypeScript inferキーワードでジェネリック型を抽出する方法"
date: 2026-03-14 09:00:00 +0900
categories: [Development, Tips]
tags: [TypeScript, infer, generic, type-system]
author: "Kevin Park"
lang: ja
slug: typescript-infer-extract-generic-type
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /ja/2026/03/14/typescript-infer-extract-generic-type-ja/
  - /2026/03/14/typescript-infer-extract-generic-type-ja/
excerpt: "TypeScriptのinferキーワードを使って、ジェネリック型から必要な型だけを取り出す方法をご紹介します。"
---

## 問題

ジェネリック型の中に隠れている型を取り出したい場面があります。Promiseの戻り値の型や、配列要素の型などです。毎回手動で型を指定するのは面倒ですし、変更があるたびに修正が必要になります。

## 解決方法

`infer`キーワードを使えば、条件付き型の中で型を推論して変数のように取り出すことができます。

```typescript
// Promiseの中の型を抽出
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type Result = UnwrapPromise<Promise<string>>; // string
type Plain = UnwrapPromise<number>; // number
```

実務でよく使うパターンをいくつかご紹介します：

```typescript
// 関数の戻り値の型を抽出
type ReturnOf<T> = T extends (...args: any[]) => infer R ? R : never;

const fetchUser = async () => ({ id: 1, name: 'Kevin' });
type User = ReturnOf<typeof fetchUser>; // Promise<{ id: number; name: string }>

// 配列要素の型を抽出
type ElementOf<T> = T extends (infer E)[] ? E : never;

type Item = ElementOf<string[]>; // string
```

APIレスポンスの型を扱う際に特に便利です：

```typescript
type ApiResponse<T> = {
  data: T;
  status: number;
};

// dataフィールドの型だけを取り出す
type ExtractData<T> = T extends ApiResponse<infer D> ? D : never;

type UserData = ExtractData<ApiResponse<{ id: number; name: string }>>;
// { id: number; name: string }
```

## ポイント

- `infer`は`extends`条件付き型の中でのみ使用できます
- TypeScript組み込みの`ReturnType`や`Parameters`なども、すべて`infer`で実装されています
- ネストされたジェネリックから型を取り出す際は、手動指定の代わりに`infer`を使うことで型安全性が自動的に保たれます
