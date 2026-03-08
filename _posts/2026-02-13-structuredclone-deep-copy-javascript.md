---
layout: post
title: "structuredClone으로 JavaScript 딥카피 제대로 하기"
date: 2026-02-13 09:00:00 +0900
categories: [Development, Tips]
tags: [JavaScript, Node.js, Deep Copy, structuredClone]
author: "Kevin Park"
lang: ko
excerpt: "JSON.parse(JSON.stringify())의 한계를 structuredClone으로 깔끔하게 해결하는 방법."
---

## 문제

JavaScript에서 객체 딥카피 할 때 이런 코드를 많이 쓴다.

```javascript
const copy = JSON.parse(JSON.stringify(original));
```

근데 이게 생각보다 함정이 많다.

```javascript
const obj = {
  date: new Date(),
  func: () => 'hello',
  undef: undefined,
  regex: /test/gi,
};

const copy = JSON.parse(JSON.stringify(obj));
console.log(copy);
// { date: "2026-02-13T00:00:00.000Z", regex: {} }
// func, undef는 사라지고 date는 문자열이 됐다
```

`Date`는 문자열로 바뀌고, `undefined`와 함수는 아예 날아간다. 순환 참조가 있으면 에러도 난다.

## 해결

`structuredClone`을 쓰면 된다. 브라우저와 Node.js 17+에서 전부 지원한다.

```javascript
const original = {
  date: new Date(),
  nested: { a: 1, b: [2, 3] },
  set: new Set([1, 2, 3]),
  map: new Map([['key', 'value']]),
};

const copy = structuredClone(original);

copy.nested.a = 999;
console.log(original.nested.a); // 1 — 원본 안 변함
console.log(copy.date instanceof Date); // true — Date 객체 유지
console.log(copy.set instanceof Set); // true — Set도 유지
```

순환 참조도 문제없다.

```javascript
const obj = { name: 'test' };
obj.self = obj; // 순환 참조

const copy = structuredClone(obj); // 에러 없이 동작
```

## 핵심 포인트

- `JSON.parse(JSON.stringify())`는 `Date`, `Set`, `Map`, `RegExp`, `undefined`를 제대로 복사 못 한다
- `structuredClone`은 대부분의 내장 타입을 정확히 복사한다
- 단, 함수와 DOM 노드, `Symbol`은 `structuredClone`으로도 복사 불가다
- lodash의 `cloneDeep` 없이도 네이티브로 딥카피가 가능한 시대다
