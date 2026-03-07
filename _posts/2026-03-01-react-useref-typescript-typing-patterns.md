---
layout: post
title: "React useRef에 TypeScript 타입 제대로 지정하는 법"
date: 2026-03-01 09:00:00 +0900
categories: [Development, Tips]
tags: [React, TypeScript, useRef, DOM, type]
author: "Kevin Park"
lang: ko
excerpt: "useRef의 제네릭 타입에 null을 넣느냐 안 넣느냐에 따라 완전히 다른 타입이 된다"
---

## 문제

React에서 `useRef`를 TypeScript랑 같이 쓰면 이런 에러를 한 번쯤 만난다.

```typescript
const inputRef = useRef<HTMLInputElement>();
//                                        ^ 초기값 안 넣으면

inputRef.current.focus();
// 'inputRef.current' is possibly 'undefined'.
```

초기값을 `null`로 넣어도 또 다른 에러가 난다.

```typescript
const inputRef = useRef<HTMLInputElement>(null);

inputRef.current.focus();
// 'inputRef.current' is possibly 'null'.
```

그래서 매번 `if (inputRef.current)` 체크를 해야 되나 싶은데, 사실 이건 `useRef`의 오버로드를 이해하면 깔끔하게 처리된다.

## 해결

`useRef`에는 두 가지 오버로드가 있다.

```typescript
// 1. DOM ref용 (읽기 전용 .current)
// 제네릭에 null 포함, 초기값 null
const inputRef = useRef<HTMLInputElement>(null);
// 타입: RefObject<HTMLInputElement> — current는 readonly

// 2. 값 저장용 (수정 가능한 .current)
// 초기값 타입이 제네릭과 일치
const countRef = useRef<number>(0);
// 타입: MutableRefObject<number> — current 수정 가능
```

DOM ref는 React가 관리하니까 readonly인 거고, 값 저장용은 직접 수정해야 하니까 mutable인 거다.

실무에서 자주 쓰는 패턴들을 보면:

```typescript
// DOM 요소 참조
const inputRef = useRef<HTMLInputElement>(null);
const divRef = useRef<HTMLDivElement>(null);

// 타이머 ID 저장
const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

// 이전 값 추적
const prevValueRef = useRef<string>("");

// 컴포넌트 마운트 상태 추적
const isMountedRef = useRef<boolean>(false);
```

DOM ref에서 null 체크가 귀찮으면 이벤트 핸들러 안에서는 거의 확실히 마운트 상태니까 non-null assertion을 써도 된다.

```typescript
const handleSubmit = () => {
  // 이 시점에 ref가 null일 리가 없으면
  inputRef.current!.focus();
};
```

근데 `useEffect` 안에서는 조건부 체크하는 게 안전하다.

```typescript
useEffect(() => {
  if (inputRef.current) {
    inputRef.current.focus();
  }
}, []);
```

## 핵심 포인트

- `useRef<T>(null)` → `RefObject<T>` (DOM ref용, current readonly)
- `useRef<T>(initialValue)` → `MutableRefObject<T>` (값 저장용, current 수정 가능)
- DOM 요소 ref는 항상 `null`로 초기화하고, 사용 시 null 체크를 해주면 된다
- 타이머, 이전 값, 외부 라이브러리 인스턴스 같은 건 MutableRefObject로 쓴다
