---
layout: post
title: "Next.jsでHttpOnly CookieにJWTを安全に保存する"
date: 2025-08-25 09:00:00 +0900
categories: [Development, Tips]
tags: [Next.js, JWT, HttpOnly, cookie, authentication, security]
author: "Kevin Park"
lang: ja
excerpt: "JWTをlocalStorageの代わりにHttpOnly Cookieに保存し、XSS攻撃からトークンを保護するNext.jsパターンをご紹介します。"
---

## 問題

JWTを`localStorage`に保存すると、XSS攻撃にそのまま晒されます。悪意のあるスクリプトが`localStorage.getItem('token')`でトークンを盗むことができます。

## 解決方法

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

  // HttpOnly CookieにJWTを保存
  response.cookies.set('auth-token', token, {
    httpOnly: true,                              // JSからアクセス不可
    secure: process.env.NODE_ENV === 'production', // HTTPSのみ
    sameSite: 'lax',                             // CSRF防御
    maxAge: 60 * 60 * 24,                        // 24時間
    path: '/',
  });

  return response;
}
```

## ポイント

- `httpOnly: true`が最も重要です。これを設定すると`document.cookie`でアクセスできなくなるため、XSS攻撃によるトークン窃取が不可能になります。
- `secure: true`はプロダクション環境でのみ有効にすべきです。ローカル開発はHTTPのため、Cookieが送信されない問題が発生します。
- `sameSite: 'lax'`は他のサイトからのPOSTリクエスト時にCookieを送信しません。CSRF攻撃の基本的な防御線です。
