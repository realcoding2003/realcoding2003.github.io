---
layout: post
title: "Nginx + Dockerで静的サイトをサーブする"
date: 2026-03-06 09:00:00 +0900
categories: [Development, Tips]
tags: [Nginx, Docker, static-site, docker-compose]
author: "Kevin Park"
lang: ja
slug: nginx-docker-static-site
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /ja/2026/03/06/nginx-docker-static-site-ja/
  - /2026/03/06/nginx-docker-static-site-ja/
excerpt: "Docker ComposeでNginxコンテナを立ち上げ、静的HTML/CSS/JSサイトをサーブする最もシンプルな方法をご紹介します。"
---

## 問題

ビルド済みの静的サイトをローカルやサーバーで素早くサーブしたいのですが、Node.jsサーバーを書くのは大げさです。

## 解決方法

```yaml
# docker-compose.yml
version: '3'
services:
  nginx:
    image: nginx
    ports:
      - "80:80"
    volumes:
      - ./dist:/usr/share/nginx/html:ro
```

```bash
docker compose up -d
```

これだけです。`./dist`フォルダにビルド成果物を入れれば、`http://localhost`からアクセスできます。

## ポイント

- `:ro`（read-only）でマウントすると、コンテナ内から誤ってファイルを変更することを防げます。本番環境では必ず付けることをお勧めします。
- Nginx公式イメージのデフォルトのdocument rootが`/usr/share/nginx/html`なので、設定ファイルなしでそのまま動作します。
- SPAルーティングが必要な場合は、カスタム`nginx.conf`に`try_files $uri $uri/ /index.html;`を追加してください。それまではこの設定だけで十分です。
