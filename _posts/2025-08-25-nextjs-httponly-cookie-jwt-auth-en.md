---
layout: post
title: "Next.js HttpOnly Cookie JWT Auth - Protect Tokens from XSS"
date: 2025-08-25 09:00:00 +0900
categories: [Development, Tips]
tags: [Next.js, JWT, HttpOnly, cookie, authentication, security]
author: "Kevin Park"
lang: en
slug: nextjs-httponly-cookie-jwt-auth
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2025/08/25/nextjs-httponly-cookie-jwt-auth-en/
  - /2025/08/25/nextjs-httponly-cookie-jwt-auth-en/
excerpt: "Store JWT in HttpOnly cookies instead of localStorage to protect tokens from XSS attacks in Next.js."
---

## Problem

Storing JWT in `localStorage` exposes it to XSS attacks. Any malicious script can steal the token via `localStorage.getItem('token')`.

## Solution

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

  // Store token in HttpOnly cookie
  response.cookies.set('auth-token', token, {
    httpOnly: true,                              // no JS access
    secure: process.env.NODE_ENV === 'production', // HTTPS only
    sameSite: 'lax',                             // CSRF defense
    maxAge: 60 * 60 * 24,                        // 24 hours
    path: '/',
  });

  return response;
}
```

## Key Points

- `httpOnly: true` is the key. It prevents `document.cookie` access, making token theft via XSS impossible.
- `secure: true` should only be enabled in production. Local development uses HTTP, which would prevent cookies from being sent.
- `sameSite: 'lax'` blocks cookies on cross-site POST requests, providing baseline CSRF protection.
