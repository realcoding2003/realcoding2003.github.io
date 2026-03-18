---
layout: post
title: "TypeScript Record型で型安全なディクショナリを作る方法"
date: 2026-03-16 09:00:00 +0900
categories: [Development, Tips]
tags: [TypeScript, Record, 型システム, ユーティリティ型]
author: "Kevin Park"
lang: ja
slug: typescript-record-type-practical-guide
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /ja/2026/03/16/typescript-record-type-practical-guide-ja/
  - /2026/03/16/typescript-record-type-practical-guide-ja/
excerpt: "TypeScript Record<K, V>型の実務活用パターン。オブジェクトのキーと値のマッピングを型安全にする方法を解説します。"
---

## 問題

APIレスポンスコード別のメッセージをオブジェクトで管理していますが、新しいコードを追加した時に漏れがあってもTypeScriptが検出してくれません。`{ [key: string]: string }`のようなインデックスシグネチャは緩すぎます。

## 解決方法

`Record<K, V>`を使えば、キーと値の両方を型レベルで強制できます。

```typescript
type StatusCode = 'success' | 'error' | 'pending' | 'timeout';

const statusMessages: Record<StatusCode, string> = {
  success: '完了しました',
  error: 'エラーが発生しました',
  pending: '処理中です',
  timeout: 'タイムアウトしました',
};
// 一つでも漏れるとコンパイルエラー
```

`StatusCode`に新しい値を追加すると、`statusMessages`で即座にエラーが発生します。漏れることがありません。

enumキーとの組み合わせはさらに強力です。

```typescript
enum Permission {
  Read = 'read',
  Write = 'write',
  Delete = 'delete',
}

const permissionLabels: Record<Permission, string> = {
  [Permission.Read]: '読み取り',
  [Permission.Write]: '書き込み',
  [Permission.Delete]: '削除',
};
```

すべてのキーを強制したくない場合は`Partial`と組み合わせます。

```typescript
// 一部だけ定義してもOK
const overrides: Partial<Record<StatusCode, string>> = {
  error: 'サーバーエラーです',
};
```

ネストしたオブジェクトにも便利です。

```typescript
type Locale = 'ko' | 'en' | 'ja';

const translations: Record<Locale, Record<string, string>> = {
  ko: { greeting: '안녕하세요' },
  en: { greeting: 'Hello' },
  ja: { greeting: 'こんにちは' },
};
```

## ポイント

- `Record<K, V>`はKのすべてのキーに対してV型の値を強制します
- ユニオン型やenumをキーにすると、漏れたキーをコンパイル時に検出できます
- 一部だけ必要な場合は`Partial<Record<K, V>>`を使います
- `{ [key: string]: V }`のインデックスシグネチャよりはるかに精密です
- 設定マッピング、i18n、状態管理などでよく使われます
