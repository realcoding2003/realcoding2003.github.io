---
layout: post
title: "TypeScript as const로 타입 와이드닝 막는 법"
date: 2026-03-11 09:00:00 +0900
categories: [Development, Tips]
tags: [TypeScript, as const, 리터럴 타입, 타입 안전성]
author: "Kevin Park"
lang: ko
excerpt: "as const 하나로 enum 없이도 타입 안전한 상수를 만들 수 있다"
---

## 문제

상수 객체를 만들었는데 TypeScript가 타입을 너무 넓게 추론하는 거다.

```typescript
const STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  CLOSED: 'closed',
};
// 타입: { PENDING: string, ACTIVE: string, CLOSED: string }
// 'pending' | 'active' | 'closed'가 아니라 그냥 string
```

`STATUS.PENDING`이 `string` 타입이 되어버리니까, 함수 파라미터에 `'pending' | 'active' | 'closed'`를 기대하면 타입 에러가 난다.

## 해결

`as const`를 붙이면 된다.

```typescript
const STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  CLOSED: 'closed',
} as const;
// 타입: { readonly PENDING: 'pending', readonly ACTIVE: 'active', readonly CLOSED: 'closed' }
```

이제 `STATUS.PENDING`은 `string`이 아니라 `'pending'` 리터럴 타입이다. 여기서 유니온 타입도 뽑아낼 수 있다:

```typescript
type StatusType = typeof STATUS[keyof typeof STATUS];
// 'pending' | 'active' | 'closed'

function updateStatus(status: StatusType) {
  // status는 정확히 세 값 중 하나만 받는다
}

updateStatus(STATUS.ACTIVE);  // OK
updateStatus('random');        // 컴파일 에러
```

배열에도 쓸 수 있다:

```typescript
const ROLES = ['admin', 'editor', 'viewer'] as const;
type Role = typeof ROLES[number];  // 'admin' | 'editor' | 'viewer'

// 배열인데 튜플로 추론됨
// readonly ['admin', 'editor', 'viewer']
```

함수 리턴값에도 유용하다:

```typescript
function getConfig() {
  return {
    apiUrl: 'https://api.example.com',
    timeout: 5000,
    retries: 3,
  } as const;
}
// retries 타입이 number가 아니라 3
```

## 핵심 포인트

- `as const`는 모든 프로퍼티를 `readonly` + 리터럴 타입으로 만들어서 타입 와이드닝을 막는다
- `typeof` + `keyof`로 유니온 타입을 추출하면 enum 없이도 같은 효과를 낸다
- 런타임 오버헤드가 전혀 없고, 트리 쉐이킹도 enum보다 잘 된다
