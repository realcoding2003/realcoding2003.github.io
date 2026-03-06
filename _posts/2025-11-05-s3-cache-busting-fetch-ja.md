---
layout: post
title: "S3ファイルのキャッシュ無効化 - fetchで常に最新ファイルを取得する"
date: 2025-11-05 09:00:00 +0900
categories: [Development, Tips]
tags: [AWS, S3, cache, fetch, CDN]
author: "Kevin Park"
lang: ja
excerpt: "S3から設定ファイルをfetchする際、ブラウザ/CDNキャッシュで更新が反映されない問題を解決する3つの方法をご紹介します。"
---

## 問題

S3にアップロードしたconfig.jsonを修正したのに、ブラウザがキャッシュされた古いバージョンを表示し続けます。CloudFront CDNが入るとさらに長引きます。

## 解決方法

```javascript
// 方法1: タイムスタンプクエリパラメータ（最もシンプル）
function addCacheBuster(url) {
  const t = new Date().getTime();
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}_t=${t}`;
}

// 方法2: fetchオプション + ヘッダー（ブラウザキャッシュ回避）
const response = await fetch(addCacheBuster(CONFIG_URL), {
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
  cache: 'no-store'
});

// 方法3: S3オブジェクトメタデータ設定（サーバー側）
// aws s3 cp config.json s3://bucket/ \
//   --cache-control "no-cache, no-store, must-revalidate"
```

## ポイント

- クエリパラメータ`?_t=1234567890`を付けるだけでほとんど解決します。CDNはURLが異なれば別のファイルとして扱います。
- `cache: 'no-store'`はfetch APIレベルのキャッシュを無効にします。`Cache-Control`ヘッダーはブラウザHTTPキャッシュを無効にします。両方設定するのが確実です。
- 頻繁に変わるファイルだけキャッシュを無効にすべきです。CSS/JSのような静的アセットまでキャッシュを無効にするとパフォーマンスが低下します。
