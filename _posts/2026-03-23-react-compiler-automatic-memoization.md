---
layout: post
title: "React Compiler 적용했더니 useMemo, useCallback 다 지워도 되더라"
date: 2026-03-23 09:00:00 +0900
categories: [Development, Tips]
tags: [React, React Compiler, useMemo, useCallback, 성능최적화]
author: "Kevin Park"
lang: ko
excerpt: "React Compiler가 자동으로 메모이제이션을 해주면서 useMemo, useCallback을 직접 쓸 일이 거의 없어졌다. 설정법과 실무 적용기."
---

## 문제

React에서 성능 최적화한다고 useMemo, useCallback을 덕지덕지 붙이는 게 일상이었다.
근데 솔직히 이거 빼먹으면 리렌더링 폭발하고, 넣으면 넣는 대로 의존성 배열 관리가 지옥이었다.

```jsx
// 이런 코드가 컴포넌트마다 있었다
const filteredList = useMemo(() => {
  return items.filter(item => item.active);
}, [items]);

const handleClick = useCallback((id) => {
  setSelected(id);
}, []);
```

매번 "이거 메모이제이션 해야 하나?" 고민하는 것도 피곤했다.

## 해결

React Compiler v1.0이 나오면서 이 고민이 사라졌다.
빌드 타임에 컴파일러가 알아서 메모이제이션을 넣어준다.

Next.js에서 설정하는 법은 간단하다.

```js
// next.config.js
const nextConfig = {
  reactCompiler: true,
};

module.exports = nextConfig;
```

기존 프로젝트에 Babel 플러그인으로 넣을 수도 있다.

```bash
npm install -D babel-plugin-react-compiler
```

```js
// babel.config.js
module.exports = {
  plugins: [
    ['babel-plugin-react-compiler'],
  ],
};
```

이제 아까 그 코드를 이렇게 바꿔도 된다.

```jsx
// 컴파일러가 알아서 최적화해준다
const filteredList = items.filter(item => item.active);

const handleClick = (id) => {
  setSelected(id);
};
```

useMemo, useCallback을 지워도 컴파일러가 빌드할 때 자동으로 메모이제이션을 삽입한다.

## 핵심 포인트

- React Compiler는 빌드 타임에 컴포넌트를 분석해서 자동으로 메모이제이션을 적용한다
- useMemo, useCallback, React.memo를 직접 쓸 필요가 95% 이상 사라진다
- Next.js는 `reactCompiler: true` 한 줄이면 끝이다
- 기존에 useMemo/useCallback 쓰던 코드도 그대로 동작한다 (충돌 없음)
- 단, 컴파일러가 최적화할 수 있으려면 React의 규칙(순수 함수, 불변성)을 잘 지켜야 한다
