---
layout: post
title: "JavaScript Temporal APIで日付処理 - Dateオブジェクトはもう卒業"
date: 2026-02-07 09:00:00 +0900
categories: [Development, Tips]
tags: [JavaScript, Temporal API, Date, TypeScript]
author: "Kevin Park"
lang: ja
excerpt: "Dateオブジェクトの0始まりmonthやmutable問題をTemporal APIで解決する方法"
---

## 問題

JavaScriptの`Date`オブジェクトは、20年以上開発者を悩ませてきました。

```javascript
// 2026年1月15日を作りたい
const date = new Date(2026, 0, 15); // monthが0から?!
console.log(date.getMonth()); // 0 ← 1月なのに0が返ります

// 参照を変更すると元のオブジェクトも変わってしまう
const original = new Date(2026, 0, 15);
const copy = original;
copy.setMonth(5);
console.log(original.getMonth()); // 5 ← 元のオブジェクトが変更されました
```

monthが0始まりであることと、mutableであることは常にバグの原因になっていました。結局moment.jsやday.jsなどのライブラリに頼ることが当たり前になっていましたが、ついにネイティブの解決策が登場しました。

## 解決方法

`Temporal` APIがChrome 144（2026年1月）とFirefox 139（2025年5月）からネイティブでサポートされています。ライブラリなしで日付を正しく扱えるようになりました。

### 日付の作成

```javascript
// PlainDate - 時間なしの日付のみ
const date = Temporal.PlainDate.from('2026-02-07');
const date2 = Temporal.PlainDate.from({ year: 2026, month: 2, day: 7 });

console.log(date.month); // 2 ← ついに2月が2です！
console.log(date.dayOfWeek); // 6（土曜日）

// PlainTime - 日付なしの時間のみ
const time = Temporal.PlainTime.from('14:30:00');
console.log(time.hour); // 14
```

### 日付の計算

```javascript
const today = Temporal.PlainDate.from('2026-02-07');

// 30日後
const later = today.add({ days: 30 });
console.log(later.toString()); // 2026-03-09

// 元のオブジェクトは変わりません（immutable！）
console.log(today.toString()); // 2026-02-07

// 2つの日付の差分
const start = Temporal.PlainDate.from('2026-01-01');
const end = Temporal.PlainDate.from('2026-02-07');
const diff = start.until(end);
console.log(diff.days); // 37
```

### タイムゾーン変換

```javascript
// ソウル時間で現在時刻
const now = Temporal.Now.zonedDateTimeISO('Asia/Seoul');
console.log(now.toString());
// 2026-02-07T14:30:00+09:00[Asia/Seoul]

// ニューヨーク時間に変換
const nyTime = now.withTimeZone('America/New_York');
console.log(nyTime.toString());
// 2026-02-07T00:30:00-05:00[America/New_York]
```

`Date`オブジェクトでタイムゾーン変換をするには複雑な処理が必要でしたが、Temporalなら`withTimeZone()`の一行で完了です。

## ポイント

- **monthが1から始まります**: 1月 = 1、12月 = 12。最も多いオフバイワンバグの原因がなくなりました
- **immutable設計**: `add()`や`subtract()`などすべての操作は新しいオブジェクトを返します。意図しない変更が起きません
- **用途別の型**: `PlainDate`（日付のみ）、`PlainTime`（時間のみ）、`ZonedDateTime`（タイムゾーン付き）— 必要なものだけ使えます
- **ブラウザサポート**: Chrome 144+、Firefox 139+で利用可能です。Safariはまだなので、本番環境では`@js-temporal/polyfill`の併用をお勧めします
