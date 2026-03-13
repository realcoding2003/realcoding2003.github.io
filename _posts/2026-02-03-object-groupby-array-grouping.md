---
layout: post
title: "Object.groupBy로 배열 그룹핑 한 줄로 끝내기"
date: 2026-02-03 09:00:00 +0900
categories: [Development, Tips]
tags: [JavaScript, Object.groupBy, array, ES2024]
author: "Kevin Park"
lang: ko
excerpt: "reduce로 복잡하게 그룹핑하던 시대는 끝났다. Object.groupBy 하나면 된다."
---

## 문제

배열을 특정 기준으로 그룹핑할 때마다 `reduce`를 써야 했다. 매번 초기값 설정하고, 키 존재 여부 체크하고, 배열에 push하고... 단순한 그룹핑인데 코드가 5줄 이상 나오는 게 좀 짜증났다.

```javascript
// 이걸 매번 써야 했다
const grouped = items.reduce((acc, item) => {
  const key = item.category;
  if (!acc[key]) acc[key] = [];
  acc[key].push(item);
  return acc;
}, {});
```

## 해결

ES2024에 추가된 `Object.groupBy`를 쓰면 한 줄이다.

```javascript
const items = [
  { name: '사과', category: '과일' },
  { name: '당근', category: '채소' },
  { name: '바나나', category: '과일' },
  { name: '시금치', category: '채소' },
];

const grouped = Object.groupBy(items, (item) => item.category);
// {
//   '과일': [{ name: '사과', ... }, { name: '바나나', ... }],
//   '채소': [{ name: '당근', ... }, { name: '시금치', ... }]
// }
```

실무에서 자주 쓰는 패턴들:

```javascript
// 상태별 주문 분류
const orders = [
  { id: 1, status: 'pending' },
  { id: 2, status: 'shipped' },
  { id: 3, status: 'pending' },
];
const byStatus = Object.groupBy(orders, (o) => o.status);

// 날짜별 로그 그룹핑
const logs = [
  { msg: 'error', date: '2026-03-14' },
  { msg: 'info', date: '2026-03-14' },
  { msg: 'warn', date: '2026-03-13' },
];
const byDate = Object.groupBy(logs, (log) => log.date);

// 조건부 그룹핑 (성인/미성년)
const users = [
  { name: 'Kim', age: 25 },
  { name: 'Lee', age: 17 },
];
const byAge = Object.groupBy(users, (u) => u.age >= 18 ? 'adult' : 'minor');
```

## 핵심 포인트

- `Object.groupBy`는 null 프로토타입 객체를 반환한다. `hasOwnProperty` 체크가 필요 없다
- 키로 심볼을 쓰고 싶으면 `Map.groupBy`를 쓰면 된다
- Node.js 21+, Chrome 117+, Safari 17.4+에서 지원한다. 구 브라우저는 core-js 폴리필로 대응 가능하다
