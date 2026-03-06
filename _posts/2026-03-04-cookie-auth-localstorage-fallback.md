---
layout: post
title: "Cookie 인증 + localStorage 폴백 패턴"
date: 2026-03-04 09:00:00 +0900
categories: [Development, Tips]
tags: [JavaScript, cookie, localStorage, authentication]
author: "Kevin Park"
lang: ko
excerpt: "Cookie 기반 인증으로 마이그레이션하면서 기존 localStorage 사용자도 호환되게 처리하는 패턴."
---

## 문제

기존에 localStorage로 인증 상태를 관리하던 앱을 Cookie 기반으로 바꾸고 싶은데, 이미 로그인된 사용자들의 세션을 날리면 안 된다.

## 해결

```typescript
const AUTH_COOKIE = 'auth_token';

function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;

  // 1순위: 쿠키 확인
  const cookie = document.cookie
    .split(';')
    .find(c => c.trim().startsWith(`${AUTH_COOKIE}=`));
  if (cookie) return true;

  // 2순위: 기존 localStorage 폴백
  try {
    const auth = localStorage.getItem('auth');
    if (auth) return JSON.parse(auth).isAuthenticated === true;
  } catch {
    return false;
  }

  return false;
}

function login(username: string) {
  const data = { isAuthenticated: true, username, loginTime: new Date().toISOString() };
  // 쿠키에 저장 (새 방식)
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  document.cookie = `${AUTH_COOKIE}=${JSON.stringify(data)}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
  // localStorage에도 저장 (호환성)
  localStorage.setItem('auth', JSON.stringify(data));
}

function logout() {
  document.cookie = `${AUTH_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
  localStorage.removeItem('auth');
}
```

## 핵심 포인트

- 새로 로그인하는 사용자는 Cookie에 저장되고, 기존 사용자는 localStorage에서 읽힌다. 점진적으로 Cookie 방식으로 전환된다.
- `SameSite=Lax`는 CSRF를 어느 정도 막아주면서도 일반적인 네비게이션에서는 쿠키가 전송된다. 내부 어드민 같은 서비스에는 충분하다.
- 충분한 시간이 지나면 localStorage 폴백 코드를 제거하면 된다. 그때까지는 두 저장소를 병행한다.
