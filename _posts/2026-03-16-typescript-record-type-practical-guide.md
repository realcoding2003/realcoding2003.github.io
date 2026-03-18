---
layout: post
title: "TypeScript Record 타입으로 타입 안전한 딕셔너리 만들기"
date: 2026-03-16 09:00:00 +0900
categories: [Development, Tips]
tags: [TypeScript, Record, 타입시스템, 유틸리티타입]
author: "Kevin Park"
lang: ko
excerpt: "TypeScript Record<K, V> 타입의 실무 활용 패턴. 객체 키-값 매핑을 타입 안전하게 만드는 방법."
---

## 문제

API 응답 코드별 메시지를 객체로 관리하고 있는데, 새 코드를 추가할 때 빼먹어도 TypeScript가 잡아주지 않는다. `{ [key: string]: string }` 같은 인덱스 시그니처는 너무 느슨하다.

## 해결

`Record<K, V>`를 쓰면 키와 값을 모두 타입으로 강제할 수 있다.

```typescript
type StatusCode = 'success' | 'error' | 'pending' | 'timeout';

const statusMessages: Record<StatusCode, string> = {
  success: '완료되었습니다',
  error: '오류가 발생했습니다',
  pending: '처리 중입니다',
  timeout: '시간이 초과되었습니다',
};
// 하나라도 빠지면 컴파일 에러
```

`StatusCode`에 새 값을 추가하면 `statusMessages`에서 바로 에러가 난다. 빼먹을 수가 없는 거다.

enum 키와 조합하면 더 강력하다.

```typescript
enum Permission {
  Read = 'read',
  Write = 'write',
  Delete = 'delete',
}

const permissionLabels: Record<Permission, string> = {
  [Permission.Read]: '읽기',
  [Permission.Write]: '쓰기',
  [Permission.Delete]: '삭제',
};
```

모든 키를 강제하고 싶지 않을 때는 `Partial`과 조합한다.

```typescript
// 일부만 정의해도 OK
const overrides: Partial<Record<StatusCode, string>> = {
  error: '서버 에러입니다',
};
```

중첩 객체에도 유용하다.

```typescript
type Locale = 'ko' | 'en' | 'ja';

const translations: Record<Locale, Record<string, string>> = {
  ko: { greeting: '안녕하세요' },
  en: { greeting: 'Hello' },
  ja: { greeting: 'こんにちは' },
};
```

## 핵심 포인트

- `Record<K, V>`는 K의 모든 키에 대해 V 타입 값을 강제한다
- 유니온 타입이나 enum을 키로 쓰면 빠뜨린 키를 컴파일 타임에 잡아준다
- 일부만 필요하면 `Partial<Record<K, V>>`를 쓴다
- `{ [key: string]: V }` 인덱스 시그니처보다 훨씬 정밀하다
- 설정 매핑, i18n, 상태 관리 등에서 자주 쓰인다
