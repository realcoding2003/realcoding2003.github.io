---
layout: post
title: "TypeScript satisfies 연산자, 아직도 안 쓰고 있다면"
date: 2026-02-24 09:00:00 +0900
categories: [Development, Tips]
tags: [TypeScript, satisfies, type-safety, type-inference]
author: "Kevin Park"
lang: ko
excerpt: "as 대신 satisfies를 쓰면 타입 안전성과 추론을 동시에 잡을 수 있다"
---

## 문제

TypeScript에서 객체 타입을 지정할 때 보통 이렇게 한다.

```typescript
type Config = {
  api: string;
  port: number;
  debug: boolean;
};

const config: Config = {
  api: "https://api.example.com",
  port: 3000,
  debug: true,
};
```

문제는 이렇게 타입을 직접 지정하면 TypeScript가 값을 넓은 타입으로 추론한다는 거다. `config.api`의 타입이 `string`이 되어버려서 자동완성이 약해진다.

그렇다고 `as const`를 쓰면 readonly가 되어서 나중에 수정이 안 되고, `as Config`는 타입 체크를 건너뛰는 거라 위험하다.

## 해결

`satisfies` 연산자를 쓰면 된다.

```typescript
const config = {
  api: "https://api.example.com",
  port: 3000,
  debug: true,
} satisfies Config;

// config.api의 타입: "https://api.example.com" (리터럴 타입!)
// config.port의 타입: 3000
// 근데 Config 타입에 맞는지도 검증됨
```

실무에서 자주 쓰는 패턴은 라우트 설정이다.

```typescript
type Route = {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
};

// satisfies로 타입 검증 + 좁은 추론 동시에
const routes = {
  getUsers: { path: "/users", method: "GET" },
  createUser: { path: "/users", method: "POST" },
  updateUser: { path: "/users/:id", method: "PUT" },
} satisfies Record<string, Route>;

// routes.getUsers.method의 타입: "GET" (string이 아님!)
```

`as` 단언과의 차이를 보면 확실하다.

```typescript
// as는 거짓말이 가능 (위험)
const bad = { api: 123 } as Config; // 에러 안 남!

// satisfies는 실제로 검증함
const good = { api: 123 } satisfies Config; // 에러 발생!
```

## 핵심 포인트

- `satisfies`는 타입 검증과 좁은 타입 추론을 동시에 해준다
- `as`는 타입 단언이라 실수를 놓칠 수 있는데, `satisfies`는 실제 값을 검증한다
- 설정 객체, 라우트 맵, 테마 컬러 같은 상수 객체에 특히 유용하다
- TypeScript 4.9부터 사용 가능하니까, 아직 안 쓰고 있었다면 지금 바로 도입하면 된다
