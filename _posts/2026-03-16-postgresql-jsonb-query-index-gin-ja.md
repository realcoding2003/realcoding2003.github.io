---
layout: post
title: "PostgreSQL JSONBクエリ最適化 - GINインデックスで高速検索"
date: 2026-03-16 09:00:00 +0900
categories: [Development, Tips]
tags: [PostgreSQL, JSONB, GIN Index, Database]
author: "Kevin Park"
lang: ja
excerpt: "PostgreSQLのJSONBカラムにGINインデックスを設定し、JSONデータを高速に検索する方法をご紹介します。"
---

## 問題

ユーザー設定をJSONBカラムに保存しましたが、特定のキーで検索するとフルスキャンが走って遅くなりました。

```sql
-- metadataカラムがJSONBのテーブル
SELECT * FROM users
WHERE metadata->>'role' = 'admin';
-- Seq Scan... 遅い
```

## 解決方法

GINインデックスを作成すると、JSONB内部のキー・値検索がインデックスを利用できます。

```sql
-- GINインデックスを作成
CREATE INDEX idx_users_metadata ON users USING GIN (metadata);

-- @>演算子で検索（GINインデックスを使用）
SELECT * FROM users
WHERE metadata @> '{"role": "admin"}';
```

特定のキーだけを頻繁に検索する場合は、Expressionインデックスがより効率的です。

```sql
-- 特定パスにB-treeインデックス
CREATE INDEX idx_users_role ON users ((metadata->>'role'));

-- このクエリがインデックスを利用するようになります
SELECT * FROM users
WHERE metadata->>'role' = 'admin';
```

ネストされたJSONもパス演算子でアクセスできます。

```sql
-- ネストされたキーへのアクセス
SELECT * FROM users
WHERE metadata #>> '{address,city}' = 'Seoul';

-- jsonpathも使用可能（PostgreSQL 12以降）
SELECT * FROM users
WHERE metadata @? '$.tags[*] ? (@ == "vip")';
```

## ポイント

- `@>`包含演算子を使うことでGINインデックスが利用されます。`->>`演算子にはGINではなくExpressionインデックスが必要です
- GINインデックスは書き込みが遅くなるトレードオフがあります。読み取り中心のテーブルに適しています
- JSONBはバイナリ形式で保存されるため、JSONより検索が高速です。カラム型はJSONではなくJSONBを使いましょう
