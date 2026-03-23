---
layout: post
title: "JavaScript Promise.withResolvers()로 비동기 코드 깔끔하게 정리하기"
date: 2026-03-21 09:00:00 +0900
categories: [Development, Tips]
tags: [JavaScript, Promise, async, ES2024]
author: "Kevin Park"
lang: ko
excerpt: "Promise 생성자 콜백 지옥에서 벗어나는 Promise.withResolvers() 활용법"
---

## 문제

Promise를 직접 만들어야 할 때가 있다.
이벤트 기반 API를 감싸거나, 타이머를 Promise로 바꾸거나.

근데 매번 이런 코드를 작성하게 된다.

```javascript
let resolve, reject;
const promise = new Promise((res, rej) => {
  resolve = res;
  reject = rej;
});

// resolve, reject를 외부에서 사용
someEmitter.on('done', resolve);
someEmitter.on('error', reject);
```

`resolve`랑 `reject`를 바깥으로 꺼내려고 `let`으로 선언해놓고 콜백 안에서 할당하는 패턴.
동작은 하는데 매번 볼 때마다 찝찝하다.

## 해결

`Promise.withResolvers()`가 이걸 한 줄로 해결해준다.

```javascript
const { promise, resolve, reject } = Promise.withResolvers();

someEmitter.on('done', resolve);
someEmitter.on('error', reject);
```

끝이다. `promise`, `resolve`, `reject` 세 개를 한번에 받아온다.

실무에서 자주 쓰는 패턴을 하나 더 보면:

```javascript
function createDeferredRequest() {
  const { promise, resolve, reject } = Promise.withResolvers();

  const timeout = setTimeout(() => {
    reject(new Error('Request timeout'));
  }, 5000);

  return {
    promise,
    complete(data) {
      clearTimeout(timeout);
      resolve(data);
    },
    fail(error) {
      clearTimeout(timeout);
      reject(error);
    }
  };
}

// 사용
const req = createDeferredRequest();
ws.send(message);
ws.onmessage = (e) => req.complete(JSON.parse(e.data));
const result = await req.promise;
```

WebSocket 같은 이벤트 기반 통신에서 요청-응답 패턴을 만들 때 진짜 깔끔해진다.

## 핵심 포인트

- `Promise.withResolvers()`는 `{ promise, resolve, reject }` 객체를 반환한다
- 생성자 콜백 없이 바로 resolve/reject 참조를 얻을 수 있다
- Chrome 119+, Firefox 121+, Safari 17.4+, Node.js 22+에서 지원한다
- Deferred 패턴이 필요한 곳이면 어디든 쓸 수 있다
