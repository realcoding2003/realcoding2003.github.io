---
layout: post
title: "Next.js에서 HttpOnly Cookie로 JWT 안전하게 저장하기"
date: 2025-08-25 09:00:00 +0900
categories: [Development, Tips]
tags: [Next.js, JWT, HttpOnly, cookie, authentication, security]
author: "Kevin Park"
lang: ko
excerpt: "JWT를 localStorage 대신 HttpOnly 쿠키에 저장해서 XSS 공격으로부터 토큰을 보호하는 Next.js 패턴."
---

## 문제

JWT를 `localStorage`에 저장하면 XSS 공격에 그대로 노출된다. 악성 스크립트가 `localStorage.getItem('token')`으로 토큰을 훔쳐갈 수 있다.

## 해결

```typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  const user = await authenticateUser(username, password);

  if (!user) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }

  const token = generateToken(user.id, user.username);
  const response = NextResponse.json({ success: true, user });

  // HttpOnly 쿠키에 토큰 저장
  response.cookies.set('auth-token', token, {
    httpOnly: true,                              // JS에서 접근 불가
    secure: process.env.NODE_ENV === 'production', // HTTPS만
    sameSite: 'lax',                             // CSRF 방어
    maxAge: 60 * 60 * 24,                        // 24시간
    path: '/',
  });

  return response;
}
```

## 핵심 포인트

- `httpOnly: true`가 핵심이다. 이걸 설정하면 `document.cookie`로 접근할 수 없어서 XSS 공격으로 토큰을 탈취할 수 없다.
- `secure: true`는 프로덕션에서만 켜야 한다. 로컬 개발은 HTTP라서 쿠키가 전송 안 되는 문제가 생긴다.
- `sameSite: 'lax'`는 다른 사이트에서 우리 사이트로 POST 요청을 보낼 때 쿠키를 보내지 않는다. CSRF 공격의 기본 방어선이다.
