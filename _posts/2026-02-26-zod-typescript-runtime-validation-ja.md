---
layout: post
title: "ZodでTypeScriptのランタイム型検証を行う方法"
date: 2026-02-26 09:00:00 +0900
categories: [Development, Tips]
tags: [TypeScript, Zod, validation, runtime-type-check]
author: "Kevin Park"
lang: ja
slug: zod-typescript-runtime-validation
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /ja/2026/02/26/zod-typescript-runtime-validation-ja/
  - /2026/02/26/zod-typescript-runtime-validation-ja/
excerpt: "TypeScriptの型はランタイムで消えます。Zodで外部データをランタイムでも検証する方法を紹介します"
---

## 問題

TypeScriptの型はコンパイル時にのみ存在します。ランタイムでは完全に消えてしまいます。

```typescript
type User = {
  id: number;
  name: string;
  email: string;
};

const res = await fetch("/api/user/1");
const user: User = await res.json(); // 型キャストだけで、実際の検証はありません
```

サーバーから`{ id: "abc", name: null }`のようなデータが返ってきても、そのまま通過してしまい、後でUIで問題が発生します。原因のデバッグが非常に困難になります。

## 解決方法

Zodを使えば、型定義とランタイム検証を一つのスキーマで同時に行えます。

```bash
npm install zod
```

```typescript
import { z } from "zod";

// スキーマ定義 = 型定義 + ランタイム検証ルール
const UserSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  email: z.string().email(),
});

// スキーマから型を自動抽出
type User = z.infer<typeof UserSchema>;

// APIレスポンスの検証
const res = await fetch("/api/user/1");
const data = await res.json();
const user = UserSchema.parse(data); // 不正なデータならここで即エラー！
```

エラーをスローせずに処理したい場合は`safeParse`を使います。

```typescript
const result = UserSchema.safeParse(data);

if (!result.success) {
  console.error(result.error.flatten());
  // { fieldErrors: { email: ["Invalid email"] } }
  return;
}

// result.dataは検証済みのUser型
console.log(result.data.name);
```

フォームバリデーションにもそのまま使えます。

```typescript
const SignupSchema = z.object({
  username: z.string().min(3, "3文字以上入力してください"),
  password: z.string().min(8, "8文字以上入力してください"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "パスワードが一致しません",
  path: ["confirmPassword"],
});
```

## ポイント

- TypeScriptの型はランタイムで消えるため、外部データには必ずランタイム検証が必要です
- `z.infer`でスキーマから型を抽出すれば、型定義の重複を解消できます
- `parse`はエラーをスローし、`safeParse`はResult型を返します
- APIレスポンス、フォーム入力、環境変数など、外部から入るデータに積極的に活用しましょう
