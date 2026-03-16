---
layout: post
title: "Node.js worker_threadsでCPU集約タスクをメインスレッドから分離する"
date: 2026-01-31 09:00:00 +0900
categories: [Development, Tips]
tags: [Node.js, worker_threads, パフォーマンス, バックエンド]
author: "Kevin Park"
lang: ja
excerpt: "Node.jsでCPU集約的な処理をworker_threadsで分離し、メインイベントループをブロックしない方法を解説します。"
---

## 問題

Node.jsで画像リサイズや大量のJSONパースなどのCPU集約的な処理を実行すると、イベントループがブロックされます。APIレスポンスが停止し、他のリクエストも処理できなくなります。

## 解決方法

`worker_threads`モジュールを使って、重い処理を別スレッドで実行します。

```javascript
// worker.js - ワーカースレッドで実行されるコード
const { parentPort, workerData } = require('worker_threads');

function heavyCalculation(data) {
  let result = 0;
  for (let i = 0; i < data.iterations; i++) {
    result += Math.sqrt(i) * Math.random();
  }
  return result;
}

const result = heavyCalculation(workerData);
parentPort.postMessage(result);
```

```javascript
// main.js - メインスレッド
const { Worker } = require('worker_threads');

function runWorker(data) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./worker.js', { workerData: data });
    worker.on('message', resolve);
    worker.on('error', reject);
  });
}

app.get('/heavy', async (req, res) => {
  const result = await runWorker({ iterations: 10_000_000 });
  res.json({ result });
  // この間、他のリクエストは正常に処理されます
});
```

繰り返し使う場合は、ワーカープールでオーバーヘッドを削減できます。

```javascript
const os = require('os');
const poolSize = os.cpus().length;
const workers = Array.from({ length: poolSize },
  () => new Worker('./worker.js')
);
```

## ポイント

- `worker_threads`はNode.js組み込みモジュールなので、追加インストール不要です
- `workerData`でデータを渡し、`parentPort.postMessage()`で結果を返します
- メインスレッドのイベントループをブロックしないため、APIの応答性が維持されます
- 繰り返し使用する場合はワーカープールパターンで生成オーバーヘッドを削減しましょう
