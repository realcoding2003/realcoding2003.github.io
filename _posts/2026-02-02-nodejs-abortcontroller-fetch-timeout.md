---
layout: post
title: "Node.js AbortController로 fetch 타임아웃 처리하기"
date: 2026-02-02 09:00:00 +0900
categories: [Development, Tips]
tags: [Node.js, AbortController, fetch, timeout]
author: "Kevin Park"
lang: ko
excerpt: "Node.js에서 AbortController를 활용해 fetch 요청에 타임아웃을 거는 깔끔한 패턴을 정리했다."
---

## 문제

외부 API를 호출할 때 응답이 안 오면 요청이 영원히 대기하는 문제가 있었다. 서드파티 API가 느려지거나 장애가 나면 우리 서비스까지 같이 멈추는 거다. `setTimeout` + Promise.race 조합으로 해결하려니 코드가 지저분해졌다.

## 해결

`AbortController`를 쓰면 fetch 요청에 타임아웃을 깔끔하게 걸 수 있다.

```javascript
async function fetchWithTimeout(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// 사용
const data = await fetchWithTimeout('https://api.example.com/users', 3000);
```

Node.js 20+에서는 `AbortSignal.timeout()`으로 더 간단하게 쓸 수 있다:

```javascript
// 한 줄이면 끝
const response = await fetch('https://api.example.com/users', {
  signal: AbortSignal.timeout(3000),
});
```

여러 요청을 한번에 취소하는 패턴도 유용하다:

```javascript
async function fetchMultiple(urls) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const results = await Promise.all(
      urls.map((url) =>
        fetch(url, { signal: controller.signal }).then((r) => r.json())
      )
    );
    return results;
  } catch (error) {
    controller.abort(); // 하나라도 실패하면 나머지 전부 취소
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
```

## 핵심 포인트

- `AbortController`는 fetch뿐 아니라 `addEventListener`, `ReadableStream` 등에서도 쓸 수 있다
- `AbortSignal.timeout()`은 Node.js 20+에서 지원하고, 별도 cleanup이 필요 없어서 메모리 누수 걱정이 없다
- 하나의 controller로 여러 요청을 동시에 취소할 수 있어서 병렬 요청 관리에 딱이다
