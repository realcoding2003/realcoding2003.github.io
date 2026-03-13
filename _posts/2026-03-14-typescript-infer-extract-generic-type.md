---
layout: post
title: "TypeScript infer 키워드로 제네릭 타입 추출하기"
date: 2026-03-14 09:00:00 +0900
categories: [Development, Tips]
tags: [TypeScript, infer, generic, type-system]
author: "Kevin Park"
lang: ko
excerpt: "TypeScript infer 키워드를 사용해서 제네릭 타입에서 원하는 타입만 쏙 빼내는 방법을 정리했다."
---

## 문제

제네릭 타입 안에 숨어있는 타입을 꺼내고 싶을 때가 있다. Promise 안의 반환 타입이라든가, 배열 요소의 타입이라든가. 매번 타입을 수동으로 지정하자니 귀찮고, 변경될 때마다 같이 바꿔줘야 하는 게 짜증났다.

## 해결

`infer` 키워드를 쓰면 conditional type 안에서 타입을 추론해서 변수처럼 꺼낼 수 있다.

```typescript
// Promise 안의 타입 추출
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type Result = UnwrapPromise<Promise<string>>; // string
type Plain = UnwrapPromise<number>; // number
```

실무에서 자주 쓰는 패턴 몇 가지 더 보면:

```typescript
// 함수 반환 타입 추출
type ReturnOf<T> = T extends (...args: any[]) => infer R ? R : never;

const fetchUser = async () => ({ id: 1, name: 'Kevin' });
type User = ReturnOf<typeof fetchUser>; // Promise<{ id: number; name: string }>

// 배열 요소 타입 추출
type ElementOf<T> = T extends (infer E)[] ? E : never;

type Item = ElementOf<string[]>; // string
```

API 응답 타입을 다룰 때 진짜 유용하다:

```typescript
type ApiResponse<T> = {
  data: T;
  status: number;
};

// data 필드의 타입만 꺼내기
type ExtractData<T> = T extends ApiResponse<infer D> ? D : never;

type UserData = ExtractData<ApiResponse<{ id: number; name: string }>>;
// { id: number; name: string }
```

## 핵심 포인트

- `infer`는 `extends` 조건부 타입 안에서만 쓸 수 있다
- TypeScript 내장 유틸리티 `ReturnType`, `Parameters` 등이 전부 `infer`로 만들어진 거다
- 중첩된 제네릭에서 타입을 꺼낼 때 수동 지정 대신 `infer`를 쓰면 타입 안전성이 자동으로 따라온다
