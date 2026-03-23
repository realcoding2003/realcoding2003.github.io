---
layout: post
title: "JavaScript Promise.withResolvers()で非同期コードをすっきり整理する"
date: 2026-03-21 09:00:00 +0900
categories: [Development, Tips]
tags: [JavaScript, Promise, async, ES2024]
author: "Kevin Park"
lang: ja
excerpt: "Promiseコンストラクタのコールバックパターンから脱却するPromise.withResolvers()の活用法"
---

## 問題

イベントベースのAPIをラップしたり、タイマーをPromiseに変換する際、Promiseを手動で作成する必要があります。

従来のアプローチはこのようになります：

```javascript
let resolve, reject;
const promise = new Promise((res, rej) => {
  resolve = res;
  reject = rej;
});

// resolve/rejectを外部で使用
someEmitter.on('done', resolve);
someEmitter.on('error', reject);
```

`resolve`と`reject`を外部に取り出すために`let`で宣言してコールバック内で代入するパターンです。
動作はしますが、少し不格好ですよね。

## 解決方法

`Promise.withResolvers()`を使えば、これを1行で解決できます。

```javascript
const { promise, resolve, reject } = Promise.withResolvers();

someEmitter.on('done', resolve);
someEmitter.on('error', reject);
```

分割代入で`promise`、`resolve`、`reject`の3つを一度に取得できます。

実務でよく使うパターンをもう一つご紹介します：

```javascript
function createDeferredRequest() {
  const { promise, resolve, reject } = Promise.withResolvers();

  const timeout = setTimeout(() => {
    reject(new Error('Request timeout'));
  }, 5000);

  return {
    promise,
    complete(data) {
      clearTimeout(timeout);
      resolve(data);
    },
    fail(error) {
      clearTimeout(timeout);
      reject(error);
    }
  };
}

// 使用例
const req = createDeferredRequest();
ws.send(message);
ws.onmessage = (e) => req.complete(JSON.parse(e.data));
const result = await req.promise;
```

WebSocketのようなイベントベースの通信で、リクエスト・レスポンスパターンを構築する際にとても便利です。

## ポイント

- `Promise.withResolvers()`は`{ promise, resolve, reject }`オブジェクトを返します
- コンストラクタのコールバックなしで、直接resolve/rejectの参照を取得できます
- Chrome 119+、Firefox 121+、Safari 17.4+、Node.js 22+でサポートされています
- Deferredパターンが必要なあらゆる場面で活用できます
