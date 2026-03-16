---
layout: post
title: "fetch APIにBearer Tokenを自動注入する認証ヘルパーの作り方"
date: 2025-07-10 09:00:00 +0900
categories: [Development, Tips]
tags: [JavaScript, fetch, Bearer Token, authentication, API]
author: "Kevin Park"
lang: ja
slug: fetch-api-bearer-token-auth
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /ja/2025/07/10/fetch-api-bearer-token-auth-ja/
  - /2025/07/10/fetch-api-bearer-token-auth-ja/
excerpt: "毎回Authorizationヘッダーを手動で追加する代わりに、fetchラッパー関数でBearer Tokenを自動注入するパターンをご紹介します。"
---

## 問題

API呼び出しのたびに`headers: { 'Authorization': 'Bearer ...' }`を繰り返し追加していました。トークンの更新やエラー処理もAPI毎に別々に行っていました。

## 解決方法

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

## ポイント

- `authToken`変数と`localStorage`の二重管理をしています。まずメモリから探し、なければ`localStorage`を確認します。毎回`localStorage.getItem`を呼ぶより高速です。
- すべてのAPI関数は`fetchWithAuth<ResponseType>('/endpoint')`の1行で呼び出せます。トークン管理ロジックが1箇所にまとまっているため、リフレッシュロジックの追加も簡単です。
- `res.json().catch()`でJSONパース失敗も処理します。サーバーがHTMLエラーページを返した場合にクラッシュしません。
