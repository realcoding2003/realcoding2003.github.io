---
layout: post
title: "TypeScript Pick, Omit, Partial ユーティリティ型の実務組み合わせパターン"
date: 2026-03-15 09:00:00 +0900
categories: [Development, Tips]
tags: [TypeScript, 型システム, Utility-Types, フロントエンド]
author: "Kevin Park"
lang: ja
slug: typescript-pick-omit-partial-utility-types
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /ja/2026/03/15/typescript-pick-omit-partial-utility-types-ja/
  - /2026/03/15/typescript-pick-omit-partial-utility-types-ja/
excerpt: "TypeScriptのユーティリティ型を組み合わせて、APIリクエスト・レスポンスの型をスマートに作成する方法を解説します。"
---

## 問題

DBモデルの型は一つですが、APIリクエストごとに必要なフィールドが異なります。作成時は`id`を除いてすべて必須、更新時は`id`が必須で残りは任意。毎回新しいインターフェースを定義すると、型が際限なく増えてしまいます。

## 解決方法

ユーティリティ型を組み合わせることで、既存の型から派生させることができます。

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

// 作成リクエスト: id, createdAtを除外
type CreateUserDto = Omit<User, 'id' | 'createdAt'>;

// 更新リクエスト: id必須、残りは任意
type UpdateUserDto = Pick<User, 'id'> & Partial<Omit<User, 'id'>>;

// 一覧レスポンス: 必要なフィールドだけ
type UserListItem = Pick<User, 'id' | 'name' | 'email'>;
```

よく使うパターンはジェネリック型にしておくと便利です。

```typescript
// 更新DTO: Kフィールドは必須、残りは任意
type UpdateDto<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>;

type UpdateUserDto = UpdateDto<User, 'id'>;
type UpdatePostDto = UpdateDto<Post, 'id' | 'slug'>;
```

## ポイント

- `Omit<T, K>`: 特定フィールドを除外（作成DTOに最適）
- `Pick<T, K>`: 特定フィールドだけ選択（一覧・要約型に最適）
- `Partial<T>`: すべてのフィールドを任意に（更新DTOに最適）
- 組み合わせることで、新しいインターフェースなしに既存の型から派生できます
- よく使うパターンはジェネリック型として抽出しておくと再利用性が高まります
