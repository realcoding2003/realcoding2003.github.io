---
layout: post
title: "Node.js TCPポートスキャナーの実装 - net.Socketとタイムアウト処理"
date: 2025-09-20 09:00:00 +0900
categories: [Development, Tips]
tags: [Node.js, TCP, port scanner, net, socket]
author: "Kevin Park"
lang: ja
slug: nodejs-tcp-port-scanner
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /ja/2025/09/20/nodejs-tcp-port-scanner-ja/
  - /2025/09/20/nodejs-tcp-port-scanner-ja/
excerpt: "Node.jsのnetモジュールでTCPポートが開いているか確認する非同期ポートスキャナーの作り方をご紹介します。"
---

## 問題

特定のホストのポートが開いているか確認したい。`ping`はICMPなのでポート単位の確認ができず、外部ライブラリを入れるほどの作業でもありません。

## 解決方法

```javascript
const net = require('net');

async function checkPort(host, port, timeout = 500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    const timer = setTimeout(() => {
      socket.destroy();
      resolve({ host, port, open: false });
    }, timeout);

    socket.on('connect', () => {
      clearTimeout(timer);
      socket.destroy();
      resolve({ host, port, open: true });
    });

    socket.on('error', () => {
      clearTimeout(timer);
      resolve({ host, port, open: false });
    });

    socket.connect(port, host);
  });
}

// 使用例：複数ポートを同時スキャン
async function scanPorts(host, ports) {
  const results = await Promise.all(
    ports.map(port => checkPort(host, port))
  );
  return results.filter(r => r.open);
}
```

## ポイント

- `reject`の代わりに`resolve`で統一するのがポイントです。ポートが閉じているのはエラーではなく正常な結果なので、`Promise.all`が途中で停止しません。
- タイムアウトはLAN環境では500msで十分です。インターネットのホストをスキャンする場合は2000〜3000msに増やす必要があります。
- `socket.destroy()`を必ず呼び出してください。呼ばないとソケットが開いたままになり、数百ポートを同時スキャンするとファイルディスクリプタが枯渇します。
