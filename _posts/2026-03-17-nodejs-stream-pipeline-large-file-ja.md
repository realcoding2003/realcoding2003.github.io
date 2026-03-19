---
layout: post
title: "Node.js stream.pipelineで大容量ファイルを安全に処理する方法"
date: 2026-03-17 09:00:00 +0900
categories: [Development, Tips]
tags: [Node.js, Stream, Pipeline, File Processing]
author: "Kevin Park"
lang: ja
excerpt: "Node.jsのstream.pipelineを使って、メモリオーバーフローなしで大容量ファイルを処理する方法をご紹介します。"
---

## 問題

数GBのログファイルを`fs.readFile`で一度に読み込もうとして、メモリが溢れてしまいました。当然の結果ですが、つい忘れてしまいがちです。

```javascript
// これだとファイル全体がメモリに載ってしまう
const data = await fs.promises.readFile('huge.log', 'utf-8');
```

## 解決方法

`stream.pipeline`を使えば、チャンク単位で読み込み・変換・書き込みを行うパイプラインを構築できます。エラー処理とストリームのクリーンアップも自動です。

```javascript
const { pipeline } = require('stream/promises');
const fs = require('fs');
const zlib = require('zlib');

// 大容量ファイルをgzip圧縮しながらコピー
await pipeline(
  fs.createReadStream('huge.log'),
  zlib.createGzip(),
  fs.createWriteStream('huge.log.gz')
);
```

行単位の処理が必要な場合は、Transformストリームを挟みます。

```javascript
const { Transform } = require('stream');

const lineFilter = new Transform({
  transform(chunk, encoding, callback) {
    const lines = chunk.toString().split('\n');
    const errors = lines
      .filter(line => line.includes('ERROR'))
      .join('\n');
    callback(null, errors ? errors + '\n' : '');
  }
});

await pipeline(
  fs.createReadStream('huge.log'),
  lineFilter,
  fs.createWriteStream('errors-only.log')
);
```

## ポイント

- `stream/promises`の`pipeline`はasync/awaitと自然に組み合わせることができます
- エラー発生時にパイプライン内のすべてのストリームを自動でdestroyしてくれます。`.pipe()`チェーンとの最大の違いです
- メモリ使用量がファイルサイズに関係なく一定です。10GBでも100GBでも問題ありません
