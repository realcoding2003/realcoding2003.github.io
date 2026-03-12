---
layout: post
title: "Node.jsでuuidパッケージなしでUUIDを生成する方法"
date: 2026-03-09 09:00:00 +0900
categories: [Development, Tips]
tags: [Node.js, UUID, crypto, 依存関係]
author: "Kevin Park"
lang: ja
excerpt: "crypto.randomUUID()だけでuuidパッケージは不要になります"
---

## 問題

UUIDが必要になるたびに`uuid`パッケージをインストールしていました。UUID v4を1つ使うためだけに外部依存関係を追加するのは少し気になります。

```bash
npm install uuid
```

```javascript
const { v4: uuidv4 } = require('uuid');
const id = uuidv4();
```

## 解決方法

Node.js 19以降（LTSでは20以降）、`crypto.randomUUID()`がグローバルで利用可能です。パッケージのインストールは不要です。

```javascript
// Node.js 19+ / すべてのモダンブラウザ
const id = crypto.randomUUID();
// 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'
```

`require`も不要です。`crypto`はグローバルオブジェクトに存在します。

古いバージョン（Node 14.17〜18）では`require`が必要です：

```javascript
// Node 14.17 〜 18
const { randomUUID } = require('crypto');
const id = randomUUID();
```

ブラウザでも動作します：

```javascript
// すべてのモダンブラウザ対応
const id = self.crypto.randomUUID();
```

互換性を考慮したヘルパー関数：

```javascript
function generateUUID() {
  // グローバルcrypto（Node 19+ / ブラウザ）
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Node 14.17+
  return require('crypto').randomUUID();
}
```

## ポイント

- `crypto.randomUUID()`はRFC 4122準拠のUUID v4を生成します — `uuid`パッケージと同じ結果です
- Node.js 20 LTS以上ならグローバルで即利用可能、外部依存関係ゼロです
- すべてのモダンブラウザでもサポートされているので、フルスタックで統一した方法でUUIDを生成できます
