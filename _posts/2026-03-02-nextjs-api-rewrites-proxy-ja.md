---
layout: post
title: "Next.js rewritesでマイクロサービスAPIプロキシを設定する"
date: 2026-03-02 09:00:00 +0900
categories: [Development, Tips]
tags: [Next.js, rewrites, proxy, microservice, API]
author: "Kevin Park"
lang: ja
slug: nextjs-api-rewrites-proxy
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /ja/2026/03/02/nextjs-api-rewrites-proxy-ja/
  - /2026/03/02/nextjs-api-rewrites-proxy-ja/
excerpt: "Next.jsのrewrites機能で複数のバックエンドサービスを1つのドメインに集約するAPIプロキシの設定方法をご紹介します。"
---

## 問題

フロントエンドはNext.js1つなのに、バックエンドのマイクロサービスがそれぞれ異なるポートで動いています。クライアントから直接呼び出すとCORSの問題が発生します。

## 解決方法

```javascript
// next.config.js
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/proxy/token/:path*',
        destination: 'http://127.0.0.1:3001/:path*',
      },
      {
        source: '/api/proxy/file/:path*',
        destination: 'http://127.0.0.1:3002/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
```

クライアントからは`/api/proxy/token/verify`のように呼び出すだけです。Next.jsがサーバーサイドで`http://127.0.0.1:3001/verify`にプロキシしてくれます。

## ポイント

- `rewrites`はURLを変えずに転送先だけを変更します。`redirects`と違い、クライアントからはプロキシの存在が見えません。
- `:path*`はワイルドカードで、すべてのサブパスを転送します。`/api/proxy/token/a/b/c`が`http://127.0.0.1:3001/a/b/c`にマッピングされます。
- 同一ドメインからリクエストが送信されるため、CORS設定が不要です。開発環境で特に便利です。
