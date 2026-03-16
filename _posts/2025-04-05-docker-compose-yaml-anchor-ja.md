---
layout: post
title: "Docker Compose YAMLアンカー(&)で繰り返し設定を排除する"
date: 2025-04-05 09:00:00 +0900
categories: [Development, Tips]
tags: [Docker, Docker Compose, YAML, anchor, DRY]
author: "Kevin Park"
lang: ja
slug: docker-compose-yaml-anchor
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /ja/2025/04/05/docker-compose-yaml-anchor-ja/
  - /2025/04/05/docker-compose-yaml-anchor-ja/
excerpt: "Docker ComposeでYAMLアンカー(&)とマージ(<<)を使って、サービス設定の重複を排除する方法をご紹介します。"
---

## 問題

Docker Composeで類似のサービスを複数起動する際、image、volumes、restartなどの共通設定を毎回コピペしていました。サービスが10個あれば、同じ内容が10回繰り返されます。

## 解決方法

```yaml
# 共通設定をアンカー(&)で定義
x-app-common: &app-common
  image: my-app:latest
  volumes:
    - ./cert:/app/cert:ro
  restart: unless-stopped
  dns:
    - 172.16.0.1

services:
  # マージ(<<)で共通設定を取り込み、個別設定のみ追加
  app01:
    <<: *app-common
    container_name: app01
    environment:
      - APP_ID=01
      - PORT=3001

  app02:
    <<: *app-common
    container_name: app02
    environment:
      - APP_ID=02
      - PORT=3002

  app03:
    <<: *app-common
    container_name: app03
    environment:
      - APP_ID=03
      - PORT=3003
```

## ポイント

- `x-`プレフィックスで始まるキーは、Docker Composeが無視する拡張フィールドです。共通設定をまとめておくのに最適です。
- `&名前`でアンカーを定義し、`<<: *名前`でマージします。マージ後に同じキーを再度指定するとオーバーライドされます。
- サービスが多いほど効果が大きくなります。10個のサービスを運用する際、共通設定の変更が1箇所で済むため、ミスが減ります。
