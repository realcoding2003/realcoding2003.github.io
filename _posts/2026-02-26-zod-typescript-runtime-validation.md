---
layout: post
title: "Zod로 TypeScript 런타임 유효성 검사하기"
date: 2026-02-26 09:00:00 +0900
categories: [Development, Tips]
tags: [TypeScript, Zod, validation, runtime-type-check]
author: "Kevin Park"
lang: ko
excerpt: "TypeScript 타입은 런타임에서 사라진다. Zod로 API 응답을 런타임에서도 검증하는 법"
---

## 문제

TypeScript 타입은 컴파일 타임에만 존재한다. 런타임에서는 완전히 사라진다.

```typescript
type User = {
  id: number;
  name: string;
  email: string;
};

// API에서 받은 데이터가 정말 User 타입인지?
const res = await fetch("/api/user/1");
const user: User = await res.json(); // 타입 캐스팅일 뿐, 실제 검증은 없다
```

서버에서 `{ id: "abc", name: null }` 같은 데이터가 오면 그냥 통과돼서 한참 뒤에 UI에서 터진다. 디버깅할 때 원인 찾기가 지옥인 거다.

## 해결

Zod를 쓰면 스키마 하나로 타입 정의 + 런타임 검증을 동시에 할 수 있다.

```bash
npm install zod
```

```typescript
import { z } from "zod";

// 스키마 정의 = 타입 정의 + 런타임 검증 규칙
const UserSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  email: z.string().email(),
});

// 스키마에서 타입 자동 추출
type User = z.infer<typeof UserSchema>;

// API 응답 검증
const res = await fetch("/api/user/1");
const data = await res.json();
const user = UserSchema.parse(data); // 잘못된 데이터면 여기서 바로 에러!
```

에러를 던지지 않고 처리하고 싶으면 `safeParse`를 쓴다.

```typescript
const result = UserSchema.safeParse(data);

if (!result.success) {
  console.error(result.error.flatten());
  // { fieldErrors: { email: ["Invalid email"] } }
  return;
}

// result.data는 검증된 User 타입
console.log(result.data.name);
```

폼 유효성 검사에도 바로 쓸 수 있다.

```typescript
const SignupSchema = z.object({
  username: z.string().min(3, "3자 이상 입력"),
  password: z.string().min(8, "8자 이상 입력"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
});
```

## 핵심 포인트

- TypeScript 타입은 런타임에서 사라지니까, 외부 데이터는 반드시 런타임 검증이 필요하다
- `z.infer`로 스키마에서 타입을 추출하면 타입 정의 중복을 없앨 수 있다
- `parse`는 에러를 던지고, `safeParse`는 Result 타입을 반환한다
- API 응답, 폼 입력, 환경변수 등 외부에서 들어오는 데이터에 적극 활용하면 된다
