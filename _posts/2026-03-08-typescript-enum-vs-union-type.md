---
layout: post
title: "TypeScript Enum vs Union Type, 뭘 써야 할까"
date: 2026-03-08 09:00:00 +0900
categories: [Development, Tips]
tags: [TypeScript, Enum, Union Type, Type Safety]
author: "Kevin Park"
lang: ko
excerpt: "TypeScript에서 Enum과 Union Type 중 어떤 걸 써야 하는지, 실무 기준으로 정리했다."
---

## 문제

TypeScript 프로젝트에서 상수 집합을 정의할 때마다 고민이 생긴다. `enum`을 쓸까, `union type`을 쓸까. 팀마다 컨벤션도 다르고, 인터넷 글마다 말이 다르다.

## Enum의 함정

```typescript
enum Status {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Pending = 'PENDING'
}
```

이게 JavaScript로 컴파일되면 이런 코드가 나온다.

```javascript
var Status;
(function (Status) {
  Status["Active"] = "ACTIVE";
  Status["Inactive"] = "INACTIVE";
  Status["Pending"] = "PENDING";
})(Status || (Status = {}));
```

런타임에 객체가 생성되는 거다. 번들 사이즈에 영향을 주고, tree-shaking도 안 된다.

## Union Type으로 해결

```typescript
const STATUS = {
  Active: 'ACTIVE',
  Inactive: 'INACTIVE',
  Pending: 'PENDING',
} as const;

type Status = typeof STATUS[keyof typeof STATUS];
// 결과: 'ACTIVE' | 'INACTIVE' | 'PENDING'
```

`as const`를 붙이면 리터럴 타입으로 추론된다. 런타임 코드가 최소화되고, tree-shaking도 잘 된다.

값이 단순하면 이것만으로도 충분하다.

```typescript
type Direction = 'up' | 'down' | 'left' | 'right';
```

## 핵심 포인트

- `enum`은 런타임 객체를 생성한다. 번들 사이즈가 늘어난다
- `const enum`은 인라인되지만, `--isolatedModules` 환경(Vite, Next.js 등)에서 못 쓴다
- `as const` + union type이 대부분의 경우에 더 낫다
- enum이 필요한 경우: 비트 플래그 연산이나 런타임에 역방향 매핑이 필요할 때 정도다
