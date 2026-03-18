---
layout: post
title: "Docker Compose Watchで開発環境のホットリロードを設定する方法"
date: 2026-03-15 09:00:00 +0900
categories: [Development, Tips]
tags: [Docker, docker-compose, hot-reload, 開発環境]
author: "Kevin Park"
lang: ja
slug: docker-compose-watch-hot-reload
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /ja/2026/03/15/docker-compose-watch-hot-reload-ja/
  - /2026/03/15/docker-compose-watch-hot-reload-ja/
excerpt: "docker compose watchでコード変更時に自動でコンテナに反映する方法。ボリュームマウントよりスマートです。"
---

## 問題

Dockerで開発する際、コードを変更するたびに`docker compose up --build`を実行するのは非効率です。ボリュームマウント（`volumes`）を使う方法もありますが、`node_modules`の競合やOS間のファイル監視の問題が発生します。

## 解決方法

Docker Compose 2.22以降、`watch`機能が追加されました。`compose.yaml`に`develop.watch`セクションを追加します。

```yaml
services:
  web:
    build: .
    ports:
      - "3000:3000"
    develop:
      watch:
        # ソースコード変更 → コンテナに自動同期
        - action: sync
          path: ./src
          target: /app/src

        # package.json変更 → イメージリビルド
        - action: rebuild
          path: ./package.json

        # 設定ファイル変更 → コンテナ再起動
        - action: sync+restart
          path: ./config
          target: /app/config
```

実行方法はこちらです。

```bash
docker compose watch
```

3つのアクションがあります。

- **sync**: ファイルをコンテナに直接コピーします。ソースコードの変更に適しています
- **rebuild**: イメージを再ビルドしてコンテナを置き換えます。依存関係の変更に適しています
- **sync+restart**: ファイルをコピーしてからコンテナを再起動します。設定ファイルの変更に適しています

特定のファイルを除外したい場合は`ignore`を使います。

```yaml
        - action: sync
          path: ./src
          target: /app/src
          ignore:
            - "**/*.test.ts"
            - "**/__snapshots__"
```

## ポイント

- `docker compose watch`はファイル変更を検知して自動で同期/リビルド/再起動します
- ボリュームマウントと違い`node_modules`の競合がありません
- `sync`、`rebuild`、`sync+restart`の3つのアクションで変更タイプに応じた対応が可能です
- `ignore`で不要なファイル変更をフィルタリングできます
- Docker Compose 2.22+が必要です（Docker Desktop 4.24+）
