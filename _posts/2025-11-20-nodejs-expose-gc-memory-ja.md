---
layout: post
title: "Node.js --expose-gcでメモリリークをデバッグする"
date: 2025-11-20 09:00:00 +0900
categories: [Development, Tips]
tags: [Node.js, memory, garbage collection, debugging, performance]
author: "Kevin Park"
lang: ja
excerpt: "Node.jsで--expose-gcフラグを使って手動GCをトリガーし、メモリリークを特定する方法をご紹介します。"
---

## 問題

長時間実行されるNode.jsアプリ（MQTTクライアント、バッチプロセッサなど）でメモリが増加し続けます。GCが正常に動作しているのか、本当にリークなのか区別がつきません。

## 解決方法

```bash
# --expose-gcで実行するとglobal.gc()を呼び出せる
node --expose-gc app.js

# Dockerの場合
CMD ["node", "--expose-gc", "--max-old-space-size=512", "dist/index.js"]
```

```javascript
function logMemory(label) {
  if (global.gc) global.gc(); // 手動GC実行
  const usage = process.memoryUsage();
  console.log(`[${label}] Heap: ${Math.round(usage.heapUsed / 1024 / 1024)}MB / ${Math.round(usage.heapTotal / 1024 / 1024)}MB`);
}

logMemory('開始');
await processLargeData();
logMemory('処理後');  // GC後もメモリが減らなければ → リーク
```

## ポイント

- `global.gc()`を呼び出した後も`heapUsed`が増加し続ければ、本当のメモリリークです。GCが回収できないオブジェクトがどこかで参照されています。
- `--max-old-space-size=512`でヒープサイズを制限すると、リークがある場合にOOMで早くクラッシュするため、問題を早期発見できます。
- プロダクション環境では`--expose-gc`を使わないのが良いです。手動GCはパフォーマンスに影響します。デバッグ時のみ使用してください。
