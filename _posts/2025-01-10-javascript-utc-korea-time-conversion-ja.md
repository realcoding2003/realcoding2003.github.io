---
layout: post
title: "JavaScript UTC・韓国時間(KST)変換 - 実務で使える3つの関数"
date: 2025-01-10 09:00:00 +0900
categories: [Development, Tips]
tags: [JavaScript, UTC, KST, timezone, Date]
author: "Kevin Park"
lang: ja
excerpt: "JavaScriptでUTCと韓国標準時(KST)を外部ライブラリなしで変換する方法をご紹介します。"
---

## 問題

バックエンドはUTCで保存しているのに、フロントエンドでは韓国時間で表示しなければなりません。`toLocaleString`はブラウザによって結果が異なる場合があるため、直接変換する方が安全です。

## 解決方法

```javascript
// 1. 韓国日付文字列 → UTC日付
function toUtcDate(koreaDateStr) {
  const date = new Date(koreaDateStr + 'T00:00:00+09:00');
  return date.toISOString().split('T')[0];
}

// 2. UTCタイムスタンプ → 韓国日付
function toKoreaDate(utcTimestamp) {
  const date = new Date(utcTimestamp);
  if (isNaN(date.getTime())) return '';
  const koreaTime = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return koreaTime.toISOString().split('T')[0];
}

// 3. 韓国の1日分のUTC範囲（APIクエリ用）
function getUtcDateRange(koreaDateStr) {
  const startUtc = toUtcDate(koreaDateStr);
  const nextDay = new Date(koreaDateStr + 'T00:00:00+09:00');
  nextDay.setDate(nextDay.getDate() + 1);
  const endUtc = toUtcDate(nextDay.toISOString().split('T')[0]);
  return [startUtc, endUtc];
}
```

## ポイント

- 韓国の深夜0時（00:00 KST）は前日の15:00 UTCです。日付基準でクエリする際は、UTCの範囲を2日分に設定しないとデータが欠落します。
- パース時に`+09:00`オフセットを直接付与することで、タイムゾーンライブラリなしでも正確に変換できます。
- `9 * 60 * 60 * 1000`（32,400,000ms）を加算する方法は、サマータイムのない韓国では完璧に動作します。
