---
layout: post
title: "TypeScript Enum vs Union Type、どちらを使うべきか"
date: 2026-03-08 09:00:00 +0900
categories: [Development, Tips]
tags: [TypeScript, Enum, Union Type, Type Safety]
author: "Kevin Park"
lang: ja
excerpt: "TypeScriptでEnumとUnion Typeのどちらを使うべきか、実務の観点から整理しました。"
---

## 問題

TypeScriptプロジェクトで定数の集合を定義する際、`enum`と`union type`のどちらを使うべきか悩むことがあります。チームによって規約も異なり、判断が難しいところです。

## Enumの落とし穴

```typescript
enum Status {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Pending = 'PENDING'
}
```

これがJavaScriptにコンパイルされると、以下のようなコードが生成されます。

```javascript
var Status;
(function (Status) {
  Status["Active"] = "ACTIVE";
  Status["Inactive"] = "INACTIVE";
  Status["Pending"] = "PENDING";
})(Status || (Status = {}));
```

ランタイムにオブジェクトが生成されます。バンドルサイズに影響し、tree-shakingもうまく機能しません。

## 解決方法：Union Type + `as const`

```typescript
const STATUS = {
  Active: 'ACTIVE',
  Inactive: 'INACTIVE',
  Pending: 'PENDING',
} as const;

type Status = typeof STATUS[keyof typeof STATUS];
// 結果: 'ACTIVE' | 'INACTIVE' | 'PENDING'
```

`as const`を付けることで、リテラル型として推論されます。ランタイムコードが最小限になり、tree-shakingも正常に動作します。

シンプルな場合は、直接union typeを使うだけで十分です。

```typescript
type Direction = 'up' | 'down' | 'left' | 'right';
```

## ポイント

- `enum`はランタイムオブジェクトを生成し、バンドルサイズが増加します
- `const enum`はインライン化されますが、`--isolatedModules`環境（Vite、Next.jsなど）では使用できません
- `as const` + union typeがほとんどのケースでより適切です
- `enum`が必要な場面：ビットフラグ演算やランタイムでの逆方向マッピングが必要な場合に限られます
