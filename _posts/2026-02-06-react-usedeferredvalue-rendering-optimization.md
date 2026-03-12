---
layout: post
title: "React useDeferredValue로 debounce 없이 검색 최적화하기"
date: 2026-02-06 09:00:00 +0900
categories: [Development, Tips]
tags: [React, useDeferredValue, 성능 최적화, 렌더링]
author: "Kevin Park"
lang: ko
excerpt: "검색 입력할 때마다 버벅대는 리스트, debounce 대신 React 네이티브 방식으로 해결한다"
---

## 문제

검색 필터가 있는 리스트를 만들었는데, 데이터가 많으니까 입력할 때마다 리렌더링이 걸려서 타이핑이 버벅거렸다. `debounce`를 걸면 되긴 하는데, 타이핑 중에 입력값이 안 보이는 게 거슬렸다.

```jsx
function SearchList({ items }) {
  const [query, setQuery] = useState('');

  // items가 10000개면 매 타이핑마다 전부 필터링
  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <List items={filtered} />
    </>
  );
}
```

## 해결

`useDeferredValue`를 쓰면 입력은 즉시 반영하고, 무거운 렌더링은 뒤로 미룰 수 있다.

```jsx
import { useState, useDeferredValue, memo } from 'react';

function SearchList({ items }) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  // 입력은 query로 즉시 반영, 리스트는 deferredQuery로 지연 렌더링
  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(deferredQuery.toLowerCase())
  );

  const isStale = query !== deferredQuery;

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <div style={{ opacity: isStale ? 0.7 : 1 }}>
        <SlowList items={filtered} />
      </div>
    </>
  );
}

// memo로 감싸야 지연 효과가 제대로 동작한다
const SlowList = memo(function SlowList({ items }) {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
});
```

`debounce`와의 차이는 이렇다:

```
debounce: 입력 멈춤 → 300ms 대기 → 필터링 시작
useDeferredValue: 입력 즉시 반영 → 브라우저 여유 시 필터링 업데이트
```

사용자 입력은 절대 지연되지 않고, 무거운 리렌더링만 React가 알아서 뒤로 미뤄준다.

## 핵심 포인트

- `useDeferredValue`는 긴급한 업데이트(입력)와 느린 업데이트(리스트)를 분리해준다
- `memo`와 같이 써야 효과가 있다 — 안 쓰면 어차피 매번 리렌더링된다
- `debounce`와 달리 고정 딜레이가 없어서, 빠른 기기에서는 거의 즉시 반영되고 느린 기기에서만 지연된다
