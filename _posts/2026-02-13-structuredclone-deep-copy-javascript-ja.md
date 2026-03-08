---
layout: post
title: "structuredCloneでJavaScriptのディープコピーを正しく行う方法"
date: 2026-02-13 09:00:00 +0900
categories: [Development, Tips]
tags: [JavaScript, Node.js, Deep Copy, structuredClone]
author: "Kevin Park"
lang: ja
excerpt: "JSON.parse(JSON.stringify())の限界をstructuredCloneで解決する方法を紹介します。"
---

## 問題

JavaScriptでオブジェクトのディープコピーを行う際、よく使われるパターンがあります。

```javascript
const copy = JSON.parse(JSON.stringify(original));
```

しかし、これには意外な落とし穴があります。

```javascript
const obj = {
  date: new Date(),
  func: () => 'hello',
  undef: undefined,
  regex: /test/gi,
};

const copy = JSON.parse(JSON.stringify(obj));
console.log(copy);
// { date: "2026-02-13T00:00:00.000Z", regex: {} }
// funcとundefは消え、dateは文字列になりました
```

`Date`は文字列に変換され、`undefined`と関数は完全に消えてしまいます。循環参照がある場合はエラーも発生します。

## 解決方法

`structuredClone`を使いましょう。すべてのモダンブラウザとNode.js 17+で対応しています。

```javascript
const original = {
  date: new Date(),
  nested: { a: 1, b: [2, 3] },
  set: new Set([1, 2, 3]),
  map: new Map([['key', 'value']]),
};

const copy = structuredClone(original);

copy.nested.a = 999;
console.log(original.nested.a); // 1 — 元のオブジェクトは変更されません
console.log(copy.date instanceof Date); // true — Dateオブジェクト維持
console.log(copy.set instanceof Set); // true — Setも維持
```

循環参照も問題なく動作します。

```javascript
const obj = { name: 'test' };
obj.self = obj;

const copy = structuredClone(obj); // エラーなし
```

## ポイント

- `JSON.parse(JSON.stringify())`は`Date`、`Set`、`Map`、`RegExp`、`undefined`を正しくコピーできません
- `structuredClone`はほとんどの組み込み型を正確にコピーします
- ただし、関数、DOMノード、`Symbol`は`structuredClone`でもコピーできません
- lodashの`cloneDeep`なしでもネイティブでディープコピーが可能な時代です
