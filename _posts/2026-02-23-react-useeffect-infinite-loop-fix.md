---
layout: post
title: "React useEffect 무한 루프 원인과 해결법 총정리"
date: 2026-02-23 09:00:00 +0900
categories: [Development, Tips]
tags: [React, useEffect, Hooks, Debugging, Performance, Frontend]
author: "Kevin Park"
lang: ko
excerpt: "useEffect가 멈추지 않고 계속 실행되는 원인 3가지와 각각의 해결법."
---

## 문제

컴포넌트가 렌더링되자마자 useEffect가 미친 듯이 반복 실행된다. 콘솔에 로그가 폭포수처럼 찍히고, API를 수백 번 호출하고 있었다.

## 해결

무한 루프의 원인은 거의 3가지다.

### 1. 의존성 배열 누락

```jsx
// 무한 루프 - 매 렌더마다 실행
useEffect(() => {
  fetchData();
});

// 해결 - 마운트 시 한 번만 실행
useEffect(() => {
  fetchData();
}, []);
```

### 2. 객체/배열을 의존성에 넣은 경우

```jsx
// 무한 루프 - 매 렌더마다 새 객체가 생성됨
const options = { page: 1, limit: 10 };

useEffect(() => {
  fetchData(options);
}, [options]); // 참조가 매번 달라서 무한 실행

// 해결 - useMemo로 참조 고정
const options = useMemo(() => ({ page: 1, limit: 10 }), []);

useEffect(() => {
  fetchData(options);
}, [options]);
```

### 3. useEffect 안에서 state를 바로 변경

```jsx
// 무한 루프 - state 변경 → 리렌더 → useEffect → state 변경 → ...
useEffect(() => {
  setCount(count + 1);
}, [count]);

// 해결 - 조건문으로 가드
useEffect(() => {
  if (count < 10) {
    setCount(count + 1);
  }
}, [count]);
```

## 핵심 포인트

- 의존성 배열을 빈 배열 `[]`로 두면 컴포넌트 마운트 시 딱 한 번만 실행된다. 대부분의 데이터 fetching은 이걸로 충분하다.
- 객체나 배열은 매 렌더마다 새로운 참조가 생긴다. `useMemo`나 `useCallback`으로 참조를 고정하거나, 원시값만 의존성에 넣으면 된다.
- ESLint의 `react-hooks/exhaustive-deps` 규칙이 경고를 줄 때 무시하지 말고, 의존성 구조를 다시 생각해보는 게 맞다.
