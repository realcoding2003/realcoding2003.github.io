---
layout: post
title: "S3 파일 캐시 무효화 - fetch에서 항상 최신 파일 받기"
date: 2025-11-05 09:00:00 +0900
categories: [Development, Tips]
tags: [AWS, S3, cache, fetch, CDN]
author: "Kevin Park"
lang: ko
excerpt: "S3에서 설정 파일을 fetch할 때 브라우저/CDN 캐시 때문에 업데이트가 반영 안 되는 문제를 해결하는 3가지 방법."
---

## 문제

S3에 올린 config.json을 수정했는데, 브라우저가 캐시된 이전 버전을 계속 보여준다. CloudFront CDN까지 끼면 더 오래간다.

## 해결

```javascript
// 방법 1: 타임스탬프 쿼리 파라미터 (가장 간단)
function addCacheBuster(url) {
  const t = new Date().getTime();
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}_t=${t}`;
}

// 방법 2: fetch 옵션 + 헤더 (브라우저 캐시 우회)
const response = await fetch(addCacheBuster(CONFIG_URL), {
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
  cache: 'no-store'  // fetch API 자체 캐시도 비활성화
});

// 방법 3: S3 객체 메타데이터 설정 (서버 쪽)
// aws s3 cp config.json s3://bucket/ \
//   --cache-control "no-cache, no-store, must-revalidate"
```

## 핵심 포인트

- 쿼리 파라미터 `?_t=1234567890`만 붙여도 대부분 해결된다. CDN은 URL이 다르면 다른 파일로 취급한다.
- `cache: 'no-store'`는 fetch API 레벨의 캐시를 끈다. `Cache-Control` 헤더는 브라우저 HTTP 캐시를 끈다. 둘 다 해야 확실하다.
- 자주 바뀌는 파일만 캐시를 끄는 게 맞다. CSS/JS 같은 정적 에셋까지 캐시를 끄면 성능이 떨어진다.
