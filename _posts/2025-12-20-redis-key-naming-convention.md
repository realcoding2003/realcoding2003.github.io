---
layout: post
title: "Redis key 네이밍 컨벤션 - 계층적 구조로 관리하기"
date: 2025-12-20 09:00:00 +0900
categories: [Development, Tips]
tags: [Redis, naming convention, key design, TypeScript]
author: "Kevin Park"
lang: ko
excerpt: "Redis key를 체계적으로 관리하는 네이밍 컨벤션과 TypeScript 헬퍼 함수 패턴."
---

## 문제

Redis key를 `"user_123_session"`, `"sess-user-123"` 같이 제각각으로 만들다 보니 어떤 키가 있는지 파악이 안 되고, `KEYS *` 검색도 어렵다.

## 해결

```typescript
const KEY_PREFIX = 'myapp';

export const keys = {
  // 대화: myapp:conv:{id}
  conversation: (id: string) => `${KEY_PREFIX}:conv:${id}`,
  conversationMessages: (id: string) => `${KEY_PREFIX}:conv:${id}:messages`,

  // 사용자: myapp:user:{id}
  userSettings: (id: string) => `${KEY_PREFIX}:settings:${id}`,
  userSession: (id: string) => `${KEY_PREFIX}:session:${id}`,

  // 인덱스: myapp:conversations (전체 목록)
  allConversations: () => `${KEY_PREFIX}:conversations`,
  monthlyIndex: (ym: string) => `${KEY_PREFIX}:conv:month:${ym}`,

  // 캐시: myapp:cache:{entity}:{id}
  cacheProduct: (id: string) => `${KEY_PREFIX}:cache:product:${id}`,
};

// 사용
await redis.set(keys.conversation('abc123'), JSON.stringify(data));
await redis.del(keys.userSession('user1'));
```

## 핵심 포인트

- 콜론(`:`)으로 계층을 구분하는 게 Redis 커뮤니티의 표준이다. RedisInsight 같은 GUI 도구가 이 구조를 트리로 보여준다.
- 함수로 키를 생성하면 오타가 없고, IDE 자동완성이 된다. 문자열 리터럴을 직접 쓰면 나중에 리팩토링이 불가능하다.
- 접두사(`KEY_PREFIX`)가 있으면 같은 Redis 인스턴스에서 여러 앱이 키 충돌 없이 공존할 수 있다.
