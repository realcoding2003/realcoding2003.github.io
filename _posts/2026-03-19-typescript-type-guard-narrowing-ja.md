---
layout: post
title: "TypeScript Type Guardでユニオン型を安全に絞り込む - isキーワード活用法"
date: 2026-03-19 09:00:00 +0900
categories: [Development, Tips]
tags: [TypeScript, Type Guard, Type Narrowing, is keyword]
author: "Kevin Park"
lang: ja
excerpt: "TypeScriptでカスタムType Guard関数を作成し、isキーワードでユニオン型を安全に絞り込む方法をご紹介します。"
---

## 問題

APIレスポンスが成功・失敗の2つの型のユニオンで返ってくる場合、`if`文の中で型が絞り込まれず、毎回型アサーションを書かなければならない状況が発生します。

```typescript
type SuccessResponse = { status: 'ok'; data: string[] };
type ErrorResponse = { status: 'error'; message: string };
type ApiResponse = SuccessResponse | ErrorResponse;

function handle(res: ApiResponse) {
  // res.dataにアクセスできない - 型が絞り込まれていない
}
```

## 解決方法

`is`キーワードを使ったカスタムType Guard関数を作成します。

```typescript
function isSuccess(res: ApiResponse): res is SuccessResponse {
  return res.status === 'ok';
}

function handle(res: ApiResponse) {
  if (isSuccess(res)) {
    // ここではresがSuccessResponseに絞り込まれます
    console.log(res.data);
  } else {
    // ここではresがErrorResponseになります
    console.log(res.message);
  }
}
```

配列のフィルタリングでも便利です。

```typescript
const results: (string | null)[] = ['a', null, 'b', null];

// filterの後も(string | null)[]型のまま...
const bad = results.filter(x => x !== null);

// Type Guardでstring[]に絞り込み
const good = results.filter((x): x is string => x !== null);
```

## ポイント

- `is`キーワードは戻り値の型の位置に書き、関数が`true`を返すとその型に絞り込まれます
- `Array.filter`にType Guardを渡すと、結果の配列の型が自動的に絞り込まれます
- `typeof`や`in`演算子では対応できない複雑な型分岐で特に役立ちます
