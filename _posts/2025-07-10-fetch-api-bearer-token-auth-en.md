---
layout: post
title: "Auto-Inject Bearer Token with a fetch API Auth Helper"
date: 2025-07-10 09:00:00 +0900
categories: [Development, Tips]
tags: [JavaScript, fetch, Bearer Token, authentication, API]
author: "Kevin Park"
lang: en
slug: fetch-api-bearer-token-auth
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2025/07/10/fetch-api-bearer-token-auth-en/
  - /2025/07/10/fetch-api-bearer-token-auth-en/
excerpt: "Stop repeating Authorization headers — build a fetch wrapper that auto-injects Bearer tokens."
---

## Problem

Manually adding `headers: { 'Authorization': 'Bearer ...' }` to every API call. Token refresh and error handling duplicated across each function.

## Solution

```typescript
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) localStorage.setItem('auth_token', token);
  else localStorage.removeItem('auth_token');
}

function getAuthToken(): string | null {
  if (!authToken) authToken = localStorage.getItem('auth_token');
  return authToken;
}

async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  return res.json();
}
```

## Key Points

- Dual-layer token storage: in-memory variable first, `localStorage` as fallback. Faster than calling `localStorage.getItem` every time.
- All API functions reduce to `fetchWithAuth<ResponseType>('/endpoint')`. Token management logic lives in one place — easy to add refresh logic later.
- `res.json().catch()` gracefully handles non-JSON responses (like HTML error pages from the server).
