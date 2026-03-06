---
layout: post
title: "pnpm workspaceでモノレポを構成する"
date: 2026-03-03 09:00:00 +0900
categories: [Development, Tips]
tags: [pnpm, monorepo, workspace, Node.js]
author: "Kevin Park"
lang: ja
excerpt: "pnpm workspaceでフロントエンド、インフラ、モバイルプロジェクトを1つのリポジトリで管理するモノレポ構成法をご紹介します。"
---

## 問題

フロントエンド、ランディングページ、モバイルアプリ、インフラコードがそれぞれ別のリポジトリに分散していると、依存関係の管理が面倒で共通コードの共有も困難です。

## 解決方法

```yaml
# pnpm-workspace.yaml
packages:
  - frontend
  - landing
  - android
  - ios
  - infra
```

```json
// ルート package.json
{
  "name": "my-project",
  "private": true,
  "scripts": {
    "dev": "pnpm -F @my-project/frontend dev",
    "build": "pnpm -F @my-project/frontend build"
  }
}
```

ルートで`pnpm install`を1回実行するだけで、すべてのパッケージの依存関係がインストールされます。特定のパッケージだけを実行するには`-F`（filter）フラグを使います。

## ポイント

- `pnpm-workspace.yaml`ファイル1つでモノレポの設定が完了します。yarn workspaceのように`package.json`に設定を書く必要がないためシンプルです。
- pnpmはシンボリックリンクベースでディスク容量を節約し、パッケージ間の依存関係分離も厳格です。npmやyarnよりモノレポに適した構造です。
- ルートの`package.json`には`"private": true`を必ず設定してください。誤ってnpmにパブリッシュされるのを防ぎます。
