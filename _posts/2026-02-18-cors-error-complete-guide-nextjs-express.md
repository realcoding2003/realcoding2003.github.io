---
layout: post
title: "CORS 에러 완벽 해결 - 원인부터 Next.js/Express 설정까지"
date: 2026-02-18 09:00:00 +0900
categories: [Development, Tips]
tags: [CORS, Next.js, Express, API, Security, HTTP]
author: "Kevin Park"
lang: ko
excerpt: "브라우저 콘솔에 CORS 에러가 뜨면 당황하지 말고 이 글을 보면 된다."
---

## 문제

프론트엔드에서 API를 호출하면 브라우저 콘솔에 이런 에러가 뜬다.

```
Access to fetch at 'http://api.example.com/data' from origin 'http://localhost:3000'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
on the requested resource.
```

서버는 정상인데 브라우저에서만 막힌다.

## 해결

CORS는 브라우저가 다른 출처(origin)로의 요청을 차단하는 보안 정책이다. 서버에서 허용 헤더를 보내주면 된다.

### Express

```javascript
const cors = require('cors');

// 전체 허용 (개발용)
app.use(cors());

// 특정 origin만 허용 (프로덕션)
app.use(cors({
  origin: ['https://myapp.com', 'https://www.myapp.com'],
  credentials: true
}));
```

### Next.js API Route

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://myapp.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization' },
        ],
      },
    ];
  },
};
```

### Next.js Rewrites (프록시 방식)

```javascript
// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://api.example.com/:path*',
      },
    ];
  },
};
```

이 방식은 브라우저가 같은 origin으로 요청한다고 인식해서 CORS 자체가 발생하지 않는다.

## 핵심 포인트

- CORS는 서버 문제가 아니라 브라우저 보안 정책이다. Postman이나 curl로는 잘 되는데 브라우저에서만 안 되는 이유가 이거다.
- 개발 환경에서 `cors()`로 전체 허용하는 건 괜찮지만, 프로덕션에서는 반드시 `origin`을 명시해야 한다.
- `credentials: true`를 쓸 때는 `origin: '*'`가 안 된다. 구체적인 도메인을 지정해야 한다.
- Next.js rewrites를 쓰면 서버 쪽 CORS 설정 없이 우회할 수 있어서 가장 간편하다.
