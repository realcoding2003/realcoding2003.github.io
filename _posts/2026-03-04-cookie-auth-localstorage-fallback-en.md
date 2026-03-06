---
layout: post
title: "Cookie Authentication with localStorage Fallback"
date: 2026-03-04 09:00:00 +0900
categories: [Development, Tips]
tags: [JavaScript, cookie, localStorage, authentication]
author: "Kevin Park"
lang: en
excerpt: "Migrate from localStorage to cookie-based auth while keeping backward compatibility for existing sessions."
---

## Problem

Migrating auth state from localStorage to cookies, but existing logged-in users shouldn't lose their sessions during the transition.

## Solution

```typescript
const AUTH_COOKIE = 'auth_token';

function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;

  // Primary: check cookie
  const cookie = document.cookie
    .split(';')
    .find(c => c.trim().startsWith(`${AUTH_COOKIE}=`));
  if (cookie) return true;

  // Fallback: legacy localStorage
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
  // Store in cookie (new method)
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  document.cookie = `${AUTH_COOKIE}=${JSON.stringify(data)}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
  // Also store in localStorage (backward compatibility)
  localStorage.setItem('auth', JSON.stringify(data));
}

function logout() {
  document.cookie = `${AUTH_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
  localStorage.removeItem('auth');
}
```

## Key Points

- New logins go to cookies; existing users are read from localStorage. The transition happens gradually.
- `SameSite=Lax` provides reasonable CSRF protection while allowing cookies on normal navigation. Sufficient for internal admin tools.
- Remove the localStorage fallback code after enough time has passed. Until then, both storage mechanisms coexist.
