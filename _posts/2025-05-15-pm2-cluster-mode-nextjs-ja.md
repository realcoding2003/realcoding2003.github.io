---
layout: post
title: "PM2 clusterモードでNext.jsプロダクション性能を向上させる"
date: 2025-05-15 09:00:00 +0900
categories: [Development, Tips]
tags: [PM2, Node.js, Next.js, cluster, production]
author: "Kevin Park"
lang: ja
excerpt: "PM2のclusterモード設定でマルチコアを活用し、Next.jsアプリのスループットを向上させる方法をご紹介します。"
---

## 問題

Node.jsはシングルスレッドのため、CPUコアが4つあっても1つしか使いません。トラフィックが集中すると、1つのプロセスがすべてを処理しなければなりません。

## 解決方法

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'my-app',
    script: 'node_modules/next/dist/bin/next',
    args: 'start --port 3000',
    instances: 2,           // CPUコア数分（または'max'）
    exec_mode: 'cluster',   // clusterモード有効化
    max_memory_restart: '800M',
    env: {
      NODE_ENV: 'production',
    },
    // 再起動ポリシー
    exp_backoff_restart_delay: 100,
    max_restarts: 10,
    min_uptime: '10s',
    // ログ
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
  }]
};
```

```bash
pm2 start ecosystem.config.js
pm2 monit    # リアルタイム監視
pm2 reload my-app  # ゼロダウンタイム再起動
```

## ポイント

- `instances: 'max'`にすると全コアを使いますが、Raspberry Piのような小型サーバーでは2つ程度に制限するのが安定的です。OSやRedisなど他のサービスにもコアが必要です。
- `exp_backoff_restart_delay: 100`はアプリがクラッシュした際、100msから始めて段階的に間隔を広げて再起動します。無限再起動ループを防ぎます。
- `pm2 reload`は`restart`と異なり、プロセスを1つずつ順番に入れ替えるため、ダウンタイムがありません。
