---
layout: post
title: "Prisma 인덱스 전략 - 복합 인덱스와 정렬 방향 설정"
date: 2025-10-20 09:00:00 +0900
categories: [Development, Tips]
tags: [Prisma, database, index, PostgreSQL, performance]
author: "Kevin Park"
lang: ko
excerpt: "Prisma schema에서 단일 인덱스, 복합 인덱스, 정렬 방향 인덱스를 설정해서 쿼리 성능을 올리는 방법."
---

## 문제

테이블에 데이터가 수만 건이 넘어가면서 조회가 느려졌다. `WHERE userId = ? ORDER BY createdAt DESC` 같은 쿼리가 풀 테이블 스캔을 하고 있었다.

## 해결

```prisma
model UserLog {
  id        String   @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  action    String   @db.VarChar(50)
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  user      User     @relation(fields: [userId], references: [id])

  // 단일 컬럼 인덱스
  @@index([userId], map: "idx_user_logs_user_id")
  @@index([action], map: "idx_user_logs_action")

  // 정렬 방향 포함 인덱스
  @@index([createdAt(sort: Desc)], map: "idx_user_logs_created_at")

  // 복합 인덱스 (WHERE + ORDER BY 조합)
  @@index([userId, createdAt(sort: Desc)], map: "idx_user_logs_user_date")

  @@map("user_logs")
}
```

## 핵심 포인트

- `@@index([userId, createdAt(sort: Desc)])`는 "특정 유저의 로그를 최신순으로" 조회할 때 인덱스만으로 결과를 반환한다. `WHERE`와 `ORDER BY`를 하나의 인덱스가 커버한다.
- `sort: Desc`를 안 넣으면 기본이 오름차순이다. 최신순 조회가 많은데 오름차순 인덱스면 역방향 스캔이 필요해서 느려질 수 있다.
- `map: "idx_..."`로 인덱스명을 직접 지정해야 운영 환경에서 `EXPLAIN` 결과를 볼 때 어떤 인덱스가 사용되는지 알 수 있다. 자동 생성 이름은 알아보기 어렵다.
