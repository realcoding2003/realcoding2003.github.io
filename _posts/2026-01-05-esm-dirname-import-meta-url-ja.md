---
layout: post
title: "ESMで__dirnameを使う - import.meta.urlの活用法"
date: 2026-01-05 09:00:00 +0900
categories: [Development, Tips]
tags: [Node.js, ESM, ES Modules, dirname, import.meta]
author: "Kevin Park"
lang: ja
slug: esm-dirname-import-meta-url
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /ja/2026/01/05/esm-dirname-import-meta-url-ja/
  - /2026/01/05/esm-dirname-import-meta-url-ja/
excerpt: "ES Modulesで__dirnameと__filenameを使用する方法。import.meta.urlとfileURLToPathの組み合わせをご紹介します。"
---

## 問題

`package.json`に`"type": "module"`を設定するか`.mjs`ファイルを使うと、`__dirname`と`__filename`が定義されません。`ReferenceError: __dirname is not defined`エラーが発生します。

## 解決方法

```javascript
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 従来通り使用可能
const configPath = path.resolve(__dirname, '../config/settings.json');
const dataDir = path.join(__dirname, '../../data');
```

## ポイント

- `import.meta.url`は現在のファイルのURLを`file:///Users/...`形式で返します。`fileURLToPath`で通常のファイルパスに変換しないと、`path.join`などで使えません。
- CommonJS（`require`）からESMへの移行時に最初にぶつかるのがこの問題です。ファイル上部にこの2行を追加するだけで、残りのコードはそのまま使えます。
- Node.js 20.11以降では`import.meta.dirname`と`import.meta.filename`が内蔵されています。ただし、下位互換性のためには上記の方法が安全です。
