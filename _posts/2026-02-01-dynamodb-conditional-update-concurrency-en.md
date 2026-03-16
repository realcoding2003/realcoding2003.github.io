---
layout: post
title: "DynamoDB ConditionExpression for Concurrency Control"
date: 2026-02-01 09:00:00 +0900
categories: [Development, Tips]
tags: [AWS, DynamoDB, concurrency, conditional update, race condition]
author: "Kevin Park"
lang: en
slug: dynamodb-conditional-update-concurrency
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2026/02/01/dynamodb-conditional-update-concurrency-en/
  - /2026/02/01/dynamodb-conditional-update-concurrency-en/
excerpt: "Prevent race conditions in DynamoDB using ConditionExpression for atomic conditional updates."
---

## Problem

Incrementing a download counter — concurrent requests can exceed the max limit. The `GET → check → UPDATE` pattern is vulnerable to race conditions.

## Solution

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
// Throws ConditionalCheckFailedException if condition fails
```

## Key Points

- `ConditionExpression` checks the condition before executing the update. If the condition fails, the update doesn't execute. This is atomic — race conditions are impossible.
- "Read → check → write" in application code allows other requests to slip in between. Delegating the check to DynamoDB eliminates that gap.
- Catch `ConditionalCheckFailedException` to return "download limit exceeded" responses. This error is a normal part of business logic.
