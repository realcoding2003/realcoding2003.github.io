---
layout: post
title: "TypeScript Type Guard로 타입 좁히기 - is 키워드 실전 활용"
date: 2026-03-19 09:00:00 +0900
categories: [Development, Tips]
tags: [TypeScript, Type Guard, Type Narrowing, is keyword]
author: "Kevin Park"
lang: ko
excerpt: "TypeScript에서 커스텀 타입 가드 함수를 만들어 유니온 타입을 안전하게 좁히는 방법을 정리한다."
---

## 문제

API 응답이 성공/실패 두 가지 타입의 유니온으로 들어오는데, `if`문 안에서 타입이 좁혀지지 않아서 매번 타입 단언을 써야 하는 상황이 생겼다.

```typescript
type SuccessResponse = { status: 'ok'; data: string[] };
type ErrorResponse = { status: 'error'; message: string };
type ApiResponse = SuccessResponse | ErrorResponse;

function handle(res: ApiResponse) {
  // res.data 접근 불가 - 타입이 좁혀지지 않음
}
```

## 해결

`is` 키워드를 사용한 커스텀 타입 가드 함수를 만들면 된다.

```typescript
function isSuccess(res: ApiResponse): res is SuccessResponse {
  return res.status === 'ok';
}

function handle(res: ApiResponse) {
  if (isSuccess(res)) {
    // 여기서 res는 SuccessResponse로 좁혀진다
    console.log(res.data);
  } else {
    // 여기서 res는 ErrorResponse
    console.log(res.message);
  }
}
```

배열 필터링에서도 유용하다.

```typescript
const results: (string | null)[] = ['a', null, 'b', null];

// filter 후에도 (string | null)[] 타입...
const bad = results.filter(x => x !== null);

// 타입 가드로 string[]으로 좁힘
const good = results.filter((x): x is string => x !== null);
```

## 핵심 포인트

- `is` 키워드는 반환 타입 위치에 쓰며, 함수가 `true`를 반환하면 해당 타입으로 좁혀진다
- `Array.filter`에 타입 가드를 넘기면 결과 배열의 타입이 자동으로 좁혀진다
- `typeof`나 `in` 연산자로 안 되는 복잡한 타입 분기에서 특히 쓸모 있다
