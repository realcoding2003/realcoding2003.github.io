---
layout: post
title: "DynamoDB ConditionExpression으로 동시성 제어하기"
date: 2026-02-01 09:00:00 +0900
categories: [Development, Tips]
tags: [AWS, DynamoDB, concurrency, conditional update, race condition]
author: "Kevin Park"
lang: ko
excerpt: "DynamoDB의 ConditionExpression을 활용해 동시 요청 시 데이터 충돌(race condition)을 방지하는 방법."
---

## 문제

다운로드 카운터를 증가시키는데, 동시에 여러 요청이 들어오면 최대 횟수를 초과할 수 있다. `GET → 확인 → UPDATE` 패턴은 race condition에 취약하다.

## 해결

```typescript
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';

// 원자적 증가 + 조건부 업데이트
await docClient.send(new UpdateCommand({
  TableName: 'tokens',
  Key: { PK: `TOKEN#${token}`, SK: 'TOKEN' },
  UpdateExpression: 'SET downloadCount = downloadCount + :inc',
  ConditionExpression: 'downloadCount < :max',
  ExpressionAttributeValues: {
    ':inc': 1,
    ':max': maxDownloads,  // 예: 3
  },
}));

// ConditionExpression 실패 시 ConditionalCheckFailedException 발생
// → 이미 최대 횟수에 도달했다는 뜻
```

## 핵심 포인트

- `ConditionExpression`은 업데이트를 실행하기 전에 조건을 체크한다. 조건이 맞지 않으면 업데이트 자체가 실행되지 않는다. 이게 원자적이라서 race condition이 불가능하다.
- "읽기 → 확인 → 쓰기"를 코드에서 하면 그 사이에 다른 요청이 끼어들 수 있다. DynamoDB에게 조건 체크를 위임하면 그 사이가 없다.
- `ConditionalCheckFailedException`을 catch해서 "다운로드 제한 초과" 같은 응답을 보내면 된다. 이 에러는 정상적인 비즈니스 로직의 일부다.
