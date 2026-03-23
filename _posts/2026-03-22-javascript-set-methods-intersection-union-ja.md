---
layout: post
title: "JavaScript Setの新メソッド完全ガイド - intersection, union, differenceの実践活用"
date: 2026-03-22 09:00:00 +0900
categories: [Development, Tips]
tags: [JavaScript, Set, intersection, union, difference, ES2025]
author: "Kevin Park"
lang: ja
excerpt: "JavaScript Setにintersection、union、differenceメソッドが追加されました。filterとincludesの組み合わせから卒業し、ネイティブの集合演算を活用する方法をご紹介します。"
---

## 問題

2つの配列から共通要素を抽出したり、結合したり、差分を求める場面は頻繁にあります。
従来は`filter` + `includes`の組み合わせで処理していましたが、コードが冗長で性能も良くありませんでした。

```javascript
// 従来の方法 - 冗長で遅い
const common = arr1.filter(x => arr2.includes(x));
const merged = [...new Set([...arr1, ...arr2])];
const diff = arr1.filter(x => !arr2.includes(x));
```

`includes`が毎回O(n)の探索を行うため、全体的にO(n²)になります。
データが大きくなると明らかに遅くなります。

## 解決方法

Setに新しく追加された集合演算メソッドを使います。
2024年に主要ブラウザすべてでサポートが完了し、Node.js 22以降で利用可能です。

```javascript
const frontend = new Set(['React', 'Vue', 'Svelte', 'Angular']);
const liked = new Set(['React', 'Svelte', 'Rust', 'Go']);

// 積集合 - 両方に含まれるもの
frontend.intersection(liked);
// Set {'React', 'Svelte'}

// 和集合 - すべてを結合
frontend.union(liked);
// Set {'React', 'Vue', 'Svelte', 'Angular', 'Rust', 'Go'}

// 差集合 - frontendにだけあるもの
frontend.difference(liked);
// Set {'Vue', 'Angular'}

// 対称差集合 - 片方にだけあるもの
frontend.symmetricDifference(liked);
// Set {'Vue', 'Angular', 'Rust', 'Go'}
```

比較メソッドも用意されています。

```javascript
const all = new Set([1, 2, 3, 4, 5]);
const sub = new Set([2, 3]);
const other = new Set([6, 7]);

// 部分集合の確認
sub.isSubsetOf(all);       // true

// 上位集合の確認
all.isSupersetOf(sub);     // true

// 互いに素の確認（共通要素なし）
all.isDisjointFrom(other); // true
```

## 実践的なパターン

権限チェックなどですぐに活用できます。

```javascript
function hasRequiredPermissions(userPerms, requiredPerms) {
  const user = new Set(userPerms);
  const required = new Set(requiredPerms);
  return required.isSubsetOf(user);
}

const myPerms = ['read', 'write', 'delete'];
const needed = ['read', 'write'];

hasRequiredPermissions(myPerms, needed); // true
```

タグフィルタリングもシンプルになります。

```javascript
const selectedTags = new Set(['JavaScript', 'TypeScript']);
const postTags = new Set(['JavaScript', 'React', 'Node.js']);

selectedTags.intersection(postTags).size > 0; // true
```

## ポイント

- `intersection`、`union`、`difference`、`symmetricDifference`の4つが核心です
- 元のSetを変更せず、新しいSetを返します（イミュータブル）
- `filter` + `includes`よりも高速 - 内部的にハッシュベースのO(n)処理
- Node.js 22+、Chrome 122+、Safari 17+、Firefox 127+でサポート
- `isSubsetOf`、`isSupersetOf`、`isDisjointFrom`で集合の関係も確認可能
