---
layout: post
title: "Viteモノレポで上位ディレクトリへのアクセスを許可する - server.fs.allow"
date: 2026-01-10 09:00:00 +0900
categories: [Development, Tips]
tags: [Vite, monorepo, config, SvelteKit, fs]
author: "Kevin Park"
lang: ja
slug: vite-monorepo-fs-allow
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /ja/2026/01/10/vite-monorepo-fs-allow-ja/
  - /2026/01/10/vite-monorepo-fs-allow-ja/
excerpt: "Viteモノレポで上位ディレクトリのファイルアクセスがブロックされる問題をserver.fs.allowで解決する方法をご紹介します。"
---

## 問題

モノレポ構造でサブパッケージが上位ディレクトリの共有モジュールをimportすると、Viteがブロックします。`The request url is outside of Vite serving allow list`エラーが発生します。

## 解決方法

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import path from 'path';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: 5174,
    fs: {
      allow: [
        // 上位ディレクトリへのアクセスを許可（モノレポルート）
        path.resolve(__dirname, '..'),
      ],
    },
  },
});
```

## ポイント

- Viteはセキュリティ上、プロジェクトルート外のファイルアクセスをデフォルトでブロックします。モノレポでは共有パッケージが上位にあるため、これが問題になります。
- `server.fs.allow`にパスを追加すると、そのディレクトリ以下のファイルをサーブできます。`..`を指定すると1階層上まで許可されます。
- この設定はDevサーバー（`vite dev`）にのみ影響します。プロダクションビルドには適用されません。ビルド時はバンドラーが自動的に処理します。
