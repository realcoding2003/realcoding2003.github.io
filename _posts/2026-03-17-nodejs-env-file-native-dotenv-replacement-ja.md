---
layout: post
title: "Node.js --env-fileでdotenvなしに.envファイルを読み込む方法"
date: 2026-03-17 09:00:00 +0900
categories: [Development, Tips]
tags: [Node.js, env, dotenv, 環境変数]
author: "Kevin Park"
lang: ja
slug: nodejs-env-file-native-dotenv-replacement
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /ja/2026/03/17/nodejs-env-file-native-dotenv-replacement-ja/
  - /2026/03/17/nodejs-env-file-native-dotenv-replacement-ja/
excerpt: "Node.js 20.6以降、--env-fileフラグで.envファイルをネイティブに読み込めます。dotenvパッケージはもう不要です。"
---

## 問題

Node.jsプロジェクトでは毎回`dotenv`パッケージをインストールし、エントリーポイントに`require('dotenv').config()`を書くのが定番でした。しかしこれは結局、ランタイムでファイルを読み込んでパースする依存関係が一つ増えるということです。

## 解決方法

Node.js 20.6以降、`--env-file`フラグが組み込まれています。

```bash
# 基本的な使い方
node --env-file=.env app.js

# 複数ファイルも可能
node --env-file=.env --env-file=.env.local app.js
```

`.env`ファイルの形式は従来と同じです。

```
DATABASE_URL=postgresql://localhost:5432/mydb
API_KEY=sk-1234567890
NODE_ENV=development
```

コードでは`process.env`でそのままアクセスできます。`require('dotenv')`のようなコードは不要です。

```javascript
// dotenvのインポートなしでそのまま使用
const dbUrl = process.env.DATABASE_URL;
console.log(dbUrl); // postgresql://localhost:5432/mydb
```

Node.js 20.12以降はプログラム的な読み込みも対応しています。

```javascript
// ランタイムで動的に読み込み
process.loadEnvFile('.env');

// 文字列から直接パース
const { parseEnv } = require('node:util');
const vars = parseEnv('KEY=value\nFOO=bar');
console.log(vars.KEY); // "value"
```

`package.json`のスクリプトもすっきりします。

```json
{
  "scripts": {
    "dev": "node --env-file=.env --watch app.js",
    "prod": "node --env-file=.env.production app.js"
  }
}
```

## ポイント

- Node.js 20.6+の`--env-file`フラグで`.env`をネイティブに読み込めます
- `dotenv`パッケージのインストールも`require`コードも不要です
- 20.12+では`process.loadEnvFile()`で動的読み込みも可能です
- 複数のenvファイルを順番に読み込め、後のファイルが前のファイルを上書きします
- Node.js 20未満のバージョンでは引き続きdotenvが必要です
