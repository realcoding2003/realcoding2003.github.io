---
layout: post
title: "Node.js AsyncLocalStorage - requestIdをすべての関数に渡す時代は終わりました"
date: 2026-03-20 09:00:00 +0900
categories: [Development, Tips]
tags: [Node.js, AsyncLocalStorage, Express, logging]
author: "Kevin Park"
lang: ja
excerpt: "AsyncLocalStorageを使って、Expressのリクエストコンテキストをきれいに管理する方法をまとめます。"
---

## 問題

Expressでリクエストごとのロギングを実装する場合、`requestId`をすべての関数に引数として渡す必要がありました。

```javascript
app.get('/users/:id', (req, res) => {
  const requestId = crypto.randomUUID();
  const user = getUser(req.params.id, requestId);
  res.json(user);
});

function getUser(id, requestId) {
  logger.info(`[${requestId}] getUser called`);
  return queryDB(`SELECT * FROM users WHERE id = $1`, [id], requestId);
}

function queryDB(sql, params, requestId) {
  logger.info(`[${requestId}] query: ${sql}`);
  // ...
}
```

ビジネスロジックと関係のない`requestId`が、すべての関数シグネチャに入り込んでしまいます。

## 解決方法

`AsyncLocalStorage`を使えば、非同期コールチェーン全体にコンテキストを暗黙的に伝播できます。Node.js組み込みなので、追加パッケージは不要です。

```javascript
const { AsyncLocalStorage } = require('node:async_hooks');
const crypto = require('node:crypto');

const asyncLocalStorage = new AsyncLocalStorage();

// Expressミドルウェア
function requestContext(req, res, next) {
  const store = {
    requestId: crypto.randomUUID(),
    method: req.method,
    path: req.path,
  };
  asyncLocalStorage.run(store, next);
}

app.use(requestContext);
```

これで、どこからでも`getStore()`でコンテキストにアクセスできます。

```javascript
// ロガーユーティリティ
function createLogger(module) {
  return {
    info(msg) {
      const store = asyncLocalStorage.getStore();
      const requestId = store?.requestId ?? 'no-context';
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        requestId,
        module,
        msg,
      }));
    }
  };
}

// サービスレイヤー - requestId引数がなくなりました
const logger = createLogger('user-service');

function getUser(id) {
  logger.info(`getUser called: ${id}`);
  return queryDB(`SELECT * FROM users WHERE id = $1`, [id]);
}

function queryDB(sql, params) {
  logger.info(`query: ${sql}`);
  // ...
}
```

同じリクエストのログは同一の`requestId`でまとまるため、デバッグ時にgrepひとつで全体の流れが把握できます。

## ポイント

- `AsyncLocalStorage`はNode.js 16.4以降でstable APIです。追加インストールは不要です
- `run()`内で実行されるすべての非同期コードが同じstoreを共有します。`setTimeout`、`Promise`、`async/await`すべて対応しています
- パフォーマンスオーバーヘッドはほぼありません。Node.js 23+ではV8ネイティブの`AsyncContextFrame`でさらに高速化されています
- NestJSは`ClsModule`、Fastifyは`@fastify/request-context`で同様のパターンを提供しています
- ロギング以外にも、認証情報、トランザクションID、マルチテナント識別などに活用できます
