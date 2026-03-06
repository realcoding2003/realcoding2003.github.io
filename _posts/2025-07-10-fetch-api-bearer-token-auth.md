---
layout: post
title: "fetch API에 Bearer Token 자동 주입하는 인증 헬퍼 만들기"
date: 2025-07-10 09:00:00 +0900
categories: [Development, Tips]
tags: [JavaScript, fetch, Bearer Token, authentication, API]
author: "Kevin Park"
lang: ko
excerpt: "매번 Authorization 헤더를 수동으로 넣는 대신, fetch 래퍼 함수로 Bearer Token을 자동 주입하는 패턴."
---

## 문제

API 호출할 때마다 `headers: { 'Authorization': 'Bearer ...' }`를 반복해서 넣고 있었다. 토큰 갱신이나 에러 처리도 API마다 따로 하고 있었다.

## 해결

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

## 핵심 포인트

- `authToken` 변수와 `localStorage`를 이중으로 관리한다. 메모리에서 먼저 찾고 없으면 `localStorage`를 확인하는 식이다. 매번 `localStorage.getItem`을 호출하는 것보다 빠르다.
- 모든 API 함수에서 `fetchWithAuth<ResponseType>('/endpoint')` 한 줄로 호출하면 된다. 토큰 관리 로직이 한 곳에만 있으니 갱신 로직 추가할 때도 여기만 수정하면 된다.
- `res.json().catch()`로 JSON 파싱 실패도 잡아준다. 서버가 HTML 에러 페이지를 반환할 때 터지지 않는다.
