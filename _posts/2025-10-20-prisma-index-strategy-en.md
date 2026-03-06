---
layout: post
title: "Prisma Index Strategy - Composite Indexes and Sort Direction"
date: 2025-10-20 09:00:00 +0900
categories: [Development, Tips]
tags: [Prisma, database, index, PostgreSQL, performance]
author: "Kevin Park"
lang: en
excerpt: "Configure single, composite, and directional indexes in Prisma schema to boost query performance."
---

## Problem

Queries like `WHERE userId = ? ORDER BY createdAt DESC` started doing full table scans as the table grew past tens of thousands of rows.

## Solution

```prisma
model UserLog {
  id        String   @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  action    String   @db.VarChar(50)
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  user      User     @relation(fields: [userId], references: [id])

  // Single column indexes
  @@index([userId], map: "idx_user_logs_user_id")
  @@index([action], map: "idx_user_logs_action")

  // Directional index
  @@index([createdAt(sort: Desc)], map: "idx_user_logs_created_at")

  // Composite index (WHERE + ORDER BY)
  @@index([userId, createdAt(sort: Desc)], map: "idx_user_logs_user_date")

  @@map("user_logs")
}
```

## Key Points

- `@@index([userId, createdAt(sort: Desc)])` lets the database return "a specific user's logs in newest-first order" using the index alone. One index covers both `WHERE` and `ORDER BY`.
- Without `sort: Desc`, the default is ascending. If most queries sort descending, an ascending index requires a reverse scan — slower.
- Use `map: "idx_..."` to name indexes explicitly. Auto-generated names are unreadable when reviewing `EXPLAIN` output in production.
