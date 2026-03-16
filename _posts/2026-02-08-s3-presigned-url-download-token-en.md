---
layout: post
title: "S3 Presigned URLs - Build One-Time Download Links"
date: 2026-02-08 09:00:00 +0900
categories: [Development, Tips]
tags: [AWS, S3, presigned URL, download, security]
author: "Kevin Park"
lang: en
slug: s3-presigned-url-download-token
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2026/02/08/s3-presigned-url-download-token-en/
  - /2026/02/08/s3-presigned-url-download-token-en/
excerpt: "Combine S3 presigned URLs with DynamoDB TTL to create download links with expiration and download count limits."
---

## Problem

Need to provide file download links, but unlimited downloads by anyone is not acceptable. Both time limits and download count limits are required.

## Solution

```typescript
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({ region: 'ap-northeast-2' });

async function generateDownloadUrl(bucket: string, key: string) {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const url = await getSignedUrl(s3, command, {
    expiresIn: 300,  // 5 minutes
  });
  return url;
}

// Store token in DynamoDB (1-hour TTL, max 1 download)
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

## Key Points

- Presigned URLs embed signing info in the URL, enabling direct download without AWS credentials. After expiration, requests return 403.
- DynamoDB TTL auto-deletes expired tokens. No cron jobs needed for cleanup.
- `expiresIn` controls the URL's validity; DynamoDB TTL controls the token's validity. Separating these provides more flexibility.
