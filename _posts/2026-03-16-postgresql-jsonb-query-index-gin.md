---
layout: post
title: "PostgreSQL JSONB 쿼리 최적화 - GIN 인덱스로 빠르게 검색하기"
date: 2026-03-16 09:00:00 +0900
categories: [Development, Tips]
tags: [PostgreSQL, JSONB, GIN Index, Database]
author: "Kevin Park"
lang: ko
excerpt: "PostgreSQL JSONB 컬럼에 GIN 인덱스를 걸어 JSON 데이터를 빠르게 검색하는 방법을 정리한다."
---

## 문제

사용자 설정을 JSONB 컬럼에 저장했는데, 특정 키로 검색하면 풀 스캔을 때려서 느렸다.

```sql
-- metadata 컬럼이 JSONB인 테이블
SELECT * FROM users
WHERE metadata->>'role' = 'admin';
-- Seq Scan... 느리다
```

## 해결

GIN 인덱스를 걸면 JSONB 내부 키/값 검색이 인덱스를 탄다.

```sql
-- GIN 인덱스 생성
CREATE INDEX idx_users_metadata ON users USING GIN (metadata);

-- @> 연산자로 검색 (GIN 인덱스 사용)
SELECT * FROM users
WHERE metadata @> '{"role": "admin"}';
```

특정 키만 자주 검색한다면 Expression 인덱스가 더 효율적이다.

```sql
-- 특정 경로에 B-tree 인덱스
CREATE INDEX idx_users_role ON users ((metadata->>'role'));

-- 이제 이 쿼리가 인덱스를 탄다
SELECT * FROM users
WHERE metadata->>'role' = 'admin';
```

중첩된 JSON도 경로 연산자로 접근 가능하다.

```sql
-- 중첩 키 접근
SELECT * FROM users
WHERE metadata #>> '{address,city}' = 'Seoul';

-- jsonpath도 사용 가능 (PostgreSQL 12+)
SELECT * FROM users
WHERE metadata @? '$.tags[*] ? (@ == "vip")';
```

## 핵심 포인트

- `@>` 포함 연산자를 써야 GIN 인덱스를 탄다. `->>` 연산자는 GIN이 아니라 Expression 인덱스가 필요하다
- GIN 인덱스는 쓰기가 느려지는 트레이드오프가 있다. 읽기 위주 테이블에 적합하다
- JSONB는 바이너리 저장이라 JSON보다 검색이 빠르다. 컬럼 타입을 JSON이 아닌 JSONB로 쓰자
