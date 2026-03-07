---
layout: post
title: "TypeScript 제네릭으로 API 응답 타입 안전하게 다루기"
date: 2026-02-27 09:00:00 +0900
categories: [Development, Tips]
tags: [TypeScript, Generics, API, Type Safety, Frontend, Backend]
author: "Kevin Park"
lang: ko
excerpt: "API 호출할 때마다 as로 타입 단언하고 있었다면, 제네릭으로 한 번에 정리하는 방법."
---

## 문제

API를 호출할 때마다 응답 타입을 매번 `as`로 단언하고 있었다.

```typescript
const res = await fetch('/api/users');
const data = await res.json() as User[];
```

이러면 실제 응답 구조가 바뀌어도 타입 에러가 안 나서 런타임에 터진다.

## 해결

제네릭 래퍼 함수를 하나 만들면 된다.

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

async function fetchApi<T>(url: string): Promise<ApiResponse<T>> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```

사용할 때는 이렇게 쓴다.

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

// data의 타입이 ApiResponse<User[]>로 추론된다
const { data: users } = await fetchApi<User[]>('/api/users');

// data의 타입이 ApiResponse<User>로 추론된다
const { data: user } = await fetchApi<User>('/api/users/1');
```

## 핵심 포인트

- `as` 타입 단언은 컴파일러를 속이는 거다. 제네릭은 타입 시스템이 직접 추론하게 만든다. 런타임 안전성 차이가 크다.
- 에러 응답도 제네릭으로 통일하고 싶으면 유니온 타입을 쓰면 된다: `Promise<ApiResponse<T> | ApiError>`.
- Axios를 쓴다면 이미 `axios.get<T>()`처럼 제네릭을 지원한다. 위 패턴은 fetch API를 쓸 때 동일한 경험을 만들어주는 거다.
