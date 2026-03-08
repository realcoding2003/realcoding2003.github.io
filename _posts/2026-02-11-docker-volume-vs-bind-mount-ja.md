---
layout: post
title: "Docker VolumeとBind Mountの違い、使い分け方"
date: 2026-02-11 09:00:00 +0900
categories: [Development, Tips]
tags: [Docker, Volume, Bind Mount, DevOps]
author: "Kevin Park"
lang: ja
excerpt: "DockerのVolumeとBind Mountの違いと、開発・本番環境での使い分けを整理しました。"
---

## 問題

Dockerでデータを永続化するにはボリュームが必要ですが、`volume`と`bind mount`の違いが分かりにくいことがあります。

```yaml
volumes:
  - ./src:/app/src          # これがbind mount
  - db-data:/var/lib/mysql  # これがnamed volume
```

## 解決方法

**Bind Mount**は、ホストの特定パスをコンテナに直接マウントします。

```yaml
# 開発時 — コードの変更が即座に反映される
services:
  app:
    volumes:
      - ./src:/app/src
      - ./config:/app/config
```

ホストのファイルシステムに直接アクセスするため、コードを修正するとコンテナ内にも即座に反映されます。開発環境でのホットリロードに最適です。

**Named Volume**は、Dockerが管理する別の保存領域です。

```yaml
# 本番環境 — データベースのデータを保存
services:
  db:
    volumes:
      - db-data:/var/lib/mysql

volumes:
  db-data:  # Dockerが管理
```

ホスト上のどこに保存されるか気にする必要はありません。Dockerが管理し、コンテナを削除してもデータは残ります。

## よくある間違い

```yaml
# これだとnode_modulesがホスト側のもので上書きされる
volumes:
  - .:/app

# anonymous volumeで保護する必要がある
volumes:
  - .:/app
  - /app/node_modules  # コンテナのnode_modulesを維持
```

ホスト全体をマウントすると、コンテナ内で`npm install`によりインストールされた`node_modules`がホスト側の（空の）`node_modules`で上書きされる問題が発生します。

## ポイント

- **Bind Mount**: ホストパスを直接マウント。開発環境でのコード同期に適しています
- **Named Volume**: Docker管理のストレージ。本番環境でのデータ保存に適しています
- プロジェクトルートをマウントする際は、`node_modules`などのディレクトリをanonymous volumeで保護しましょう
- 本番環境ではbind mountよりnamed volumeの方がセキュリティ面で安全です
