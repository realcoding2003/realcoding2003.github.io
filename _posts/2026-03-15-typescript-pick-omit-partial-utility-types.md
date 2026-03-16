---
layout: post
title: "TypeScript Pick, Omit, Partial 유틸리티 타입 실무 조합 패턴"
date: 2026-03-15 09:00:00 +0900
categories: [Development, Tips]
tags: [TypeScript, 타입시스템, Utility-Types, 프론트엔드]
author: "Kevin Park"
lang: ko
excerpt: "TypeScript 유틸리티 타입을 조합해서 API 요청/응답 타입을 깔끔하게 만드는 실무 패턴 정리."
---

## 문제

DB 모델 타입은 하나인데, API 요청마다 필요한 필드가 다르다. 생성할 때는 `id` 빼고 전부 필수, 수정할 때는 `id` 필수에 나머지는 선택. 매번 새 인터페이스를 만들면 타입이 끝없이 늘어난다.

## 해결

유틸리티 타입을 조합하면 기존 타입에서 파생시킬 수 있다.

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

// 생성 요청: id, createdAt 제외
type CreateUserDto = Omit<User, 'id' | 'createdAt'>;
// { name: string; email: string; role: 'admin' | 'user' }

// 수정 요청: id 필수, 나머지 선택
type UpdateUserDto = Pick<User, 'id'> & Partial<Omit<User, 'id'>>;
// { id: string; name?: string; email?: string; role?: ... ; createdAt?: Date }

// 목록 응답: 필요한 필드만
type UserListItem = Pick<User, 'id' | 'name' | 'email'>;
// { id: string; name: string; email: string }
```

자주 쓰는 패턴을 제네릭으로 만들어두면 더 편하다.

```typescript
// 수정 DTO 패턴: K 필드는 필수, 나머지 선택
type UpdateDto<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>;

// 사용
type UpdateUserDto = UpdateDto<User, 'id'>;
type UpdatePostDto = UpdateDto<Post, 'id' | 'slug'>;
```

## 핵심 포인트

- `Omit<T, K>`: 특정 필드 제거 (생성 DTO에 유용)
- `Pick<T, K>`: 특정 필드만 선택 (목록/요약 타입에 유용)
- `Partial<T>`: 모든 필드를 선택적으로 (수정 DTO에 유용)
- 조합하면 새 인터페이스 없이 기존 타입에서 파생 가능
- 자주 쓰는 패턴은 제네릭 타입으로 추출해두면 재사용성이 올라간다
