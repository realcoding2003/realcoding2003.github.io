---
layout: post
title: "Cookie認証 + localStorageフォールバックパターン"
date: 2026-03-04 09:00:00 +0900
categories: [Development, Tips]
tags: [JavaScript, cookie, localStorage, authentication]
author: "Kevin Park"
lang: ja
excerpt: "Cookie認証への移行時に、既存のlocalStorageユーザーとの互換性を保つパターンをご紹介します。"
---

## 問題

localStorageで認証状態を管理していたアプリをCookieベースに移行したいのですが、既にログイン済みのユーザーのセッションを失わせたくありません。

## 解決方法

```typescript
const AUTH_COOKIE = 'auth_token';

function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;

  // 第1優先: Cookie確認
  const cookie = document.cookie
    .split(';')
    .find(c => c.trim().startsWith(`${AUTH_COOKIE}=`));
  if (cookie) return true;

  // 第2優先: 既存のlocalStorageフォールバック
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
  // Cookieに保存（新方式）
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  document.cookie = `${AUTH_COOKIE}=${JSON.stringify(data)}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
  // localStorageにも保存（互換性）
  localStorage.setItem('auth', JSON.stringify(data));
}

function logout() {
  document.cookie = `${AUTH_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
  localStorage.removeItem('auth');
}
```

## ポイント

- 新規ログインはCookieに保存され、既存ユーザーはlocalStorageから読み込まれます。段階的にCookie方式に移行されます。
- `SameSite=Lax`はCSRF対策をある程度提供しつつ、通常のナビゲーションではCookieが送信されます。内部管理ツールなどのサービスには十分です。
- 十分な時間が経過したら、localStorageフォールバックのコードを削除できます。それまでは両方のストレージを併用します。
