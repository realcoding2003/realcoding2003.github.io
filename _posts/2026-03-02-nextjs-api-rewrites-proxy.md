---
layout: post
title: "Next.js rewrites로 마이크로서비스 API 프록시 설정"
date: 2026-03-02 09:00:00 +0900
categories: [Development, Tips]
tags: [Next.js, rewrites, proxy, microservice, API]
author: "Kevin Park"
lang: ko
excerpt: "Next.js rewrites 기능으로 여러 백엔드 서비스를 하나의 도메인 뒤에 숨기는 API 프록시 설정법."
---

## 문제

프론트엔드는 Next.js 하나인데, 뒤에 마이크로서비스가 여러 개다. 각각 다른 포트에서 돌아가는 서비스들을 클라이언트에서 직접 호출하면 CORS 지옥이 펼쳐진다.

## 해결

```javascript
// next.config.js
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/proxy/token/:path*',
        destination: 'http://127.0.0.1:3001/:path*',
      },
      {
        source: '/api/proxy/file/:path*',
        destination: 'http://127.0.0.1:3002/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
```

클라이언트에서는 그냥 `/api/proxy/token/verify` 이런 식으로 호출하면 된다. Next.js가 서버사이드에서 `http://127.0.0.1:3001/verify`로 프록시해준다.

## 핵심 포인트

- `rewrites`는 URL은 바뀌지 않고 목적지만 바뀐다. 클라이언트는 프록시 존재를 모른다. `redirects`와 다른 점이 이거다.
- `:path*`는 와일드카드로, 하위 경로를 모두 포워딩한다. `/api/proxy/token/a/b/c`가 `http://127.0.0.1:3001/a/b/c`로 매핑된다.
- 같은 도메인에서 요청이 나가니까 CORS 설정이 필요 없다. 개발 환경에서 특히 편하다.
