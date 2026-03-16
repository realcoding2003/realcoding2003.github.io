---
layout: post
title: "CORSエラー完全解決ガイド - 原因からNext.js/Express設定まで"
date: 2026-02-18 09:00:00 +0900
categories: [Development, Tips]
tags: [CORS, Next.js, Express, API, Security, HTTP]
author: "Kevin Park"
lang: ja
slug: cors-error-complete-guide-nextjs-express
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /ja/2026/02/18/cors-error-complete-guide-nextjs-express-ja/
  - /2026/02/18/cors-error-complete-guide-nextjs-express-ja/
excerpt: "ブラウザのコンソールにCORSエラーが表示されたら、この記事を参考にしてください。"
---

## 問題

フロントエンドからAPIを呼び出すと、ブラウザのコンソールにこのようなエラーが表示されます。

```
Access to fetch at 'http://api.example.com/data' from origin 'http://localhost:3000'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
on the requested resource.
```

サーバーは正常なのに、ブラウザでだけブロックされます。

## 解決方法

CORSはブラウザが異なるオリジンへのリクエストをブロックするセキュリティポリシーです。サーバーから許可ヘッダーを送れば解決します。

### Express

```javascript
const cors = require('cors');

// 全て許可（開発用）
app.use(cors());

// 特定のoriginのみ許可（本番用）
app.use(cors({
  origin: ['https://myapp.com', 'https://www.myapp.com'],
  credentials: true
}));
```

### Next.js APIルート

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://myapp.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization' },
        ],
      },
    ];
  },
};
```

### Next.js Rewrites（プロキシ方式）

```javascript
// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://api.example.com/:path*',
      },
    ];
  },
};
```

この方式ではブラウザが同じオリジンへのリクエストと認識するため、CORSが発生しません。

## ポイント

- CORSはサーバーの問題ではなく、ブラウザのセキュリティポリシーです。Postmanやcurlではうまくいくのにブラウザでだけエラーになる理由がこれです。
- 開発環境で`cors()`で全許可するのは問題ありませんが、本番環境では必ず`origin`を明示してください。
- `credentials: true`を使う場合、`origin: '*'`は使えません。具体的なドメインを指定する必要があります。
- Next.jsのrewritesを使えば、サーバー側のCORS設定なしで回避でき、最も簡単な方法です。
