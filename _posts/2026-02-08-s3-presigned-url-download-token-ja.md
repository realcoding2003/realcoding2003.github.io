---
layout: post
title: "S3 Presigned URLでワンタイムダウンロードリンクを作る"
date: 2026-02-08 09:00:00 +0900
categories: [Development, Tips]
tags: [AWS, S3, presigned URL, download, security]
author: "Kevin Park"
lang: ja
slug: s3-presigned-url-download-token
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /ja/2026/02/08/s3-presigned-url-download-token-ja/
  - /2026/02/08/s3-presigned-url-download-token-ja/
excerpt: "S3のPresigned URLとDynamoDB TTLを組み合わせて、有効期限とダウンロード回数制限付きのワンタイムダウンロードリンクを実装する方法をご紹介します。"
---

## 問題

ファイルをダウンロードできるリンクを提供したいが、誰でも無制限にダウンロードできてはいけません。時間制限とダウンロード回数制限が必要です。

## 解決方法

```typescript
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({ region: 'ap-northeast-2' });

async function generateDownloadUrl(bucket: string, key: string) {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const url = await getSignedUrl(s3, command, {
    expiresIn: 300,  // 5分
  });
  return url;
}

// DynamoDBにトークンを保存（1時間TTL、最大1回ダウンロード）
const token = crypto.randomUUID();
await docClient.send(new PutCommand({
  TableName: 'download-tokens',
  Item: {
    PK: `TOKEN#${token}`,
    downloadCount: 0,
    maxDownloads: 1,
    ttl: Math.floor(Date.now() / 1000) + 3600,
  },
}));
```

## ポイント

- Presigned URLは署名情報がURLに含まれているため、AWS資格情報なしで直接ダウンロードできます。有効期限が過ぎると403が返されます。
- DynamoDB TTLを設定すると、期限切れのトークンが自動削除されます。クーロンジョブでのクリーンアップは不要です。
- `expiresIn`はURL自体の有効時間、DynamoDB TTLはトークンの有効時間です。これらを分離して管理するとより柔軟です。
