---
layout: post
title: "Node.js AsyncLocalStorage - 함수마다 requestId 넘기던 시절은 끝났다"
date: 2026-03-20 09:00:00 +0900
categories: [Development, Tips]
tags: [Node.js, AsyncLocalStorage, Express, logging]
author: "Kevin Park"
lang: ko
excerpt: "AsyncLocalStorage로 Express 요청 컨텍스트를 깔끔하게 관리하는 방법을 정리한다."
---

## 문제

Express에서 요청별 로깅을 하려면 `requestId`를 함수마다 넘겨야 했다. 서비스 레이어, DB 레이어, 유틸 함수까지 전부.

```javascript
app.get('/users/:id', (req, res) => {
  const requestId = crypto.randomUUID();
  const user = getUser(req.params.id, requestId);  // requestId 전달
  res.json(user);
});

function getUser(id, requestId) {
  logger.info(`[${requestId}] getUser called`);
  return queryDB(`SELECT * FROM users WHERE id = $1`, [id], requestId);  // 또 전달
}

function queryDB(sql, params, requestId) {
  logger.info(`[${requestId}] query: ${sql}`);
  // ...
}
```

함수 시그니처가 전부 오염된다. 비즈니스 로직과 관계없는 `requestId`가 모든 함수에 끼어드는 거다.

## 해결

`AsyncLocalStorage`를 쓰면 컨텍스트를 암묵적으로 전파할 수 있다. Node.js 내장이라 별도 설치도 필요 없다.

```javascript
const { AsyncLocalStorage } = require('node:async_hooks');
const crypto = require('node:crypto');

const asyncLocalStorage = new AsyncLocalStorage();

// Express 미들웨어
function requestContext(req, res, next) {
  const store = {
    requestId: crypto.randomUUID(),
    method: req.method,
    path: req.path,
  };
  asyncLocalStorage.run(store, next);
}

app.use(requestContext);
```

이제 어디서든 `getStore()`로 컨텍스트에 접근할 수 있다.

```javascript
// 로거 유틸리티
function createLogger(module) {
  return {
    info(msg) {
      const store = asyncLocalStorage.getStore();
      const requestId = store?.requestId ?? 'no-context';
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        requestId,
        module,
        msg,
      }));
    }
  };
}

// 서비스 레이어 - requestId 인자가 사라졌다
const logger = createLogger('user-service');

function getUser(id) {
  logger.info(`getUser called: ${id}`);
  return queryDB(`SELECT * FROM users WHERE id = $1`, [id]);
}

function queryDB(sql, params) {
  logger.info(`query: ${sql}`);
  // ...
}
```

로그 출력이 이렇게 된다.

```json
{"timestamp":"2026-03-20T01:00:00.000Z","requestId":"a1b2c3d4-...","module":"user-service","msg":"getUser called: 42"}
{"timestamp":"2026-03-20T01:00:00.001Z","requestId":"a1b2c3d4-...","module":"user-service","msg":"query: SELECT * FROM users WHERE id = $1"}
```

같은 요청의 로그는 동일한 `requestId`로 묶이니까 디버깅할 때 grep 한 번이면 전체 흐름이 보인다.

## 핵심 포인트

- `AsyncLocalStorage`는 Node.js 16.4+에서 stable API다. `npm install` 없이 바로 쓸 수 있다
- `run()` 안에서 실행되는 모든 비동기 코드가 같은 store를 공유한다. `setTimeout`, `Promise`, `async/await` 전부 된다
- 성능 오버헤드는 거의 없다. Node.js 23+에서는 V8 네이티브 `AsyncContextFrame`으로 더 빨라졌다
- NestJS는 `@nestjs/core`의 `ClsModule`, Fastify는 `@fastify/request-context`로 동일한 패턴을 제공한다
- 로깅 외에도 인증 정보, 트랜잭션 ID, 멀티테넌트 식별 등에 활용 가능하다
