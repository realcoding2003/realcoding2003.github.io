---
layout: post
title: "S3 Presigned URL로 일회용 다운로드 링크 만들기"
date: 2026-02-08 09:00:00 +0900
categories: [Development, Tips]
tags: [AWS, S3, presigned URL, download, security]
author: "Kevin Park"
lang: ko
excerpt: "S3 presigned URL과 DynamoDB TTL을 조합해서 만료 시간과 다운로드 횟수를 제한하는 일회용 다운로드 링크 구현."
---

## 문제

파일을 다운로드할 수 있는 링크를 제공하고 싶은데, 누구나 무제한 다운로드 가능하면 안 된다. 시간 제한 + 횟수 제한이 필요하다.

## 해결

```typescript
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({ region: 'ap-northeast-2' });

async function generateDownloadUrl(bucket: string, key: string) {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });

  // 5분간 유효한 presigned URL 생성
  const url = await getSignedUrl(s3, command, {
    expiresIn: 300,  // 초 단위
  });

  return url;
}

// DynamoDB에 토큰 저장 (1시간 TTL, 최대 1회 다운로드)
const token = crypto.randomUUID();
await docClient.send(new PutCommand({
  TableName: 'download-tokens',
  Item: {
    PK: `TOKEN#${token}`,
    downloadCount: 0,
    maxDownloads: 1,
    ttl: Math.floor(Date.now() / 1000) + 3600,  // 1시간 후 자동 삭제
  },
}));
```

## 핵심 포인트

- Presigned URL은 서명 정보가 URL에 포함되어 있어서 AWS 자격 증명 없이 직접 다운로드 가능하다. 하지만 만료 시간이 지나면 403이 반환된다.
- DynamoDB TTL을 설정하면 만료된 토큰이 자동 삭제된다. 크론잡으로 정리할 필요가 없다.
- `expiresIn`은 URL 자체의 유효 시간이고, DynamoDB TTL은 토큰의 유효 시간이다. 둘을 분리해서 관리하면 더 유연하다.
