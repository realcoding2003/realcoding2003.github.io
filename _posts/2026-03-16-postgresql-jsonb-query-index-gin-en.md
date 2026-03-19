---
layout: post
title: "PostgreSQL JSONB Query Optimization with GIN Index"
date: 2026-03-16 09:00:00 +0900
categories: [Development, Tips]
tags: [PostgreSQL, JSONB, GIN Index, Database]
author: "Kevin Park"
lang: en
excerpt: "Speed up PostgreSQL JSONB queries by adding a GIN index for fast key-value lookups inside JSON data."
---

## Problem

Stored user settings in a JSONB column, but querying by specific keys triggers a full table scan.

```sql
-- metadata column is JSONB
SELECT * FROM users
WHERE metadata->>'role' = 'admin';
-- Seq Scan... slow
```

## Solution

A GIN index enables indexed lookups inside JSONB data.

```sql
-- Create GIN index
CREATE INDEX idx_users_metadata ON users USING GIN (metadata);

-- Use @> containment operator (uses GIN index)
SELECT * FROM users
WHERE metadata @> '{"role": "admin"}';
```

If you only query specific keys, an expression index is more efficient.

```sql
-- B-tree index on a specific path
CREATE INDEX idx_users_role ON users ((metadata->>'role'));

-- This query now uses the index
SELECT * FROM users
WHERE metadata->>'role' = 'admin';
```

Nested JSON is accessible via path operators.

```sql
-- Access nested keys
SELECT * FROM users
WHERE metadata #>> '{address,city}' = 'Seoul';

-- jsonpath also works (PostgreSQL 12+)
SELECT * FROM users
WHERE metadata @? '$.tags[*] ? (@ == "vip")';
```

## Key Points

- Use the `@>` containment operator to leverage GIN indexes. The `->>` operator requires an expression index instead
- GIN indexes slow down writes — best suited for read-heavy tables
- Always use JSONB over JSON. JSONB stores data in binary format, making searches significantly faster
