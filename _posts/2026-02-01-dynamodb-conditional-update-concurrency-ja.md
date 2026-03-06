---
layout: post
title: "DynamoDB ConditionExpressionで同時実行制御を行う"
date: 2026-02-01 09:00:00 +0900
categories: [Development, Tips]
tags: [AWS, DynamoDB, concurrency, conditional update, race condition]
author: "Kevin Park"
lang: ja
excerpt: "DynamoDBのConditionExpressionを活用して同時リクエスト時のデータ競合（race condition）を防止する方法をご紹介します。"
---

## 問題

ダウンロードカウンターを増加させる際、同時に複数のリクエストが来ると最大回数を超過する可能性があります。`GET → 確認 → UPDATE`パターンはrace conditionに脆弱です。

## 解決方法

```typescript
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';

await docClient.send(new UpdateCommand({
  TableName: 'tokens',
  Key: { PK: `TOKEN#${token}`, SK: 'TOKEN' },
  UpdateExpression: 'SET downloadCount = downloadCount + :inc',
  ConditionExpression: 'downloadCount < :max',
  ExpressionAttributeValues: {
    ':inc': 1,
    ':max': maxDownloads,
  },
}));
// 条件不一致時はConditionalCheckFailedExceptionが発生
```

## ポイント

- `ConditionExpression`はアップデート実行前に条件をチェックします。条件が合わなければアップデート自体が実行されません。これがアトミックなのでrace conditionは不可能です。
- 「読み取り → 確認 → 書き込み」をコードで行うと、その間に他のリクエストが割り込む可能性があります。DynamoDBに条件チェックを委譲すれば、その隙間がなくなります。
- `ConditionalCheckFailedException`をcatchして「ダウンロード制限超過」のレスポンスを返せます。このエラーは正常なビジネスロジックの一部です。
