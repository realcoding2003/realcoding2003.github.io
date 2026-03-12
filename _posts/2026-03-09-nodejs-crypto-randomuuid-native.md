---
layout: post
title: "Node.js에서 uuid 패키지 없이 UUID 생성하는 법"
date: 2026-03-09 09:00:00 +0900
categories: [Development, Tips]
tags: [Node.js, UUID, crypto, 의존성]
author: "Kevin Park"
lang: ko
excerpt: "crypto.randomUUID() 하나면 uuid 패키지 안 깔아도 된다"
---

## 문제

프로젝트마다 UUID가 필요할 때마다 `uuid` 패키지를 설치하고 있었다. 근데 UUID v4 하나 쓰겠다고 외부 의존성을 추가하는 게 좀 거슬렸다.

```bash
npm install uuid
```

```javascript
const { v4: uuidv4 } = require('uuid');
const id = uuidv4();
```

## 해결

Node.js 19부터 (정확히는 19.0.0, 그리고 LTS는 20부터) `crypto.randomUUID()`가 글로벌로 쓸 수 있다. 패키지 설치 없이 바로 된다.

```javascript
// Node.js 19+ / 브라우저 전부 지원
const id = crypto.randomUUID();
// 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'
```

`require`도 필요 없다. `crypto`가 글로벌 객체에 있기 때문이다.

이전 버전(Node 14.17~18)에서는 `require`가 필요하다:

```javascript
// Node 14.17 ~ 18
const { randomUUID } = require('crypto');
const id = randomUUID();
```

브라우저에서도 된다:

```javascript
// 모든 모던 브라우저 지원
const id = self.crypto.randomUUID();
```

호환성을 고려한 헬퍼를 만들어두면:

```javascript
function generateUUID() {
  // 글로벌 crypto (Node 19+ / 브라우저)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Node 14.17+
  return require('crypto').randomUUID();
}
```

## 핵심 포인트

- `crypto.randomUUID()`는 RFC 4122 표준 UUID v4를 생성한다 — `uuid` 패키지와 동일한 결과
- Node.js 20 LTS 이상이면 글로벌에서 바로 사용 가능, 외부 의존성 제로
- 브라우저도 전부 지원하니까 풀스택에서 통일된 방식으로 UUID를 생성할 수 있다
