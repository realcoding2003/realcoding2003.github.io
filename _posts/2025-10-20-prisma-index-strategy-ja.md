---
layout: post
title: "Prismaインデックス戦略 - 複合インデックスとソート方向の設定"
date: 2025-10-20 09:00:00 +0900
categories: [Development, Tips]
tags: [Prisma, database, index, PostgreSQL, performance]
author: "Kevin Park"
lang: ja
slug: prisma-index-strategy
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /ja/2025/10/20/prisma-index-strategy-ja/
  - /2025/10/20/prisma-index-strategy-ja/
excerpt: "Prismaスキーマで単一インデックス、複合インデックス、ソート方向インデックスを設定してクエリ性能を向上させる方法をご紹介します。"
---

## 問題

テーブルのデータが数万件を超えるとクエリが遅くなりました。`WHERE userId = ? ORDER BY createdAt DESC`のようなクエリがフルテーブルスキャンをしていました。

## 解決方法

```prisma
model UserLog {
  id        String   @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  action    String   @db.VarChar(50)
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  user      User     @relation(fields: [userId], references: [id])

  // 単一カラムインデックス
  @@index([userId], map: "idx_user_logs_user_id")
  @@index([action], map: "idx_user_logs_action")

  // ソート方向付きインデックス
  @@index([createdAt(sort: Desc)], map: "idx_user_logs_created_at")

  // 複合インデックス（WHERE + ORDER BY組み合わせ）
  @@index([userId, createdAt(sort: Desc)], map: "idx_user_logs_user_date")

  @@map("user_logs")
}
```

## ポイント

- `@@index([userId, createdAt(sort: Desc)])`は「特定ユーザーのログを最新順に」取得する際、インデックスだけで結果を返せます。`WHERE`と`ORDER BY`を1つのインデックスがカバーします。
- `sort: Desc`を指定しないとデフォルトは昇順です。降順クエリが多いのに昇順インデックスだと逆方向スキャンが必要になり、遅くなる可能性があります。
- `map: "idx_..."`でインデックス名を直接指定すべきです。本番環境で`EXPLAIN`の結果を確認する際、自動生成名では判読が困難です。
