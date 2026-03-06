---
layout: post
title: "JavaScript Intl.NumberFormat - ライブラリなしで数値フォーマット"
date: 2025-06-25 09:00:00 +0900
categories: [Development, Tips]
tags: [JavaScript, Intl, NumberFormat, formatting, i18n]
author: "Kevin Park"
lang: ja
excerpt: "JavaScript内蔵のIntl.NumberFormatで通貨、桁区切り、パーセントフォーマットをライブラリなしで処理する方法をご紹介します。"
---

## 問題

数値を「1,000円」や「$1,234.56」のように表示するためにnumeral.jsやaccounting.jsをインストールしていました。しかし、ブラウザにはすでに内蔵機能がありました。

## 解決方法

```javascript
// 韓国ウォン
new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW',
  minimumFractionDigits: 0,
}).format(15000);
// → "₩15,000"

// 桁区切り
new Intl.NumberFormat('ko-KR').format(1234567);
// → "1,234,567"

// 米ドル
new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
}).format(1234.5);
// → "$1,234.50"

// パーセント
new Intl.NumberFormat('ko-KR', {
  style: 'percent',
  minimumFractionDigits: 1,
}).format(0.1234);
// → "12.3%"
```

## ポイント

- `Intl.NumberFormat`はすべてのモダンブラウザとNode.jsでサポートされています。IE11でも基本機能は動作します。
- `currency: 'KRW'`にすると小数点なしで表示され、`'USD'`にすると自動的に小数点2桁が付きます。各通貨の慣例に自動的に従います。
- 同じフォーマットを繰り返し使う場合は、インスタンスを変数に保存しておくとパフォーマンスが向上します。毎回`new`するのは無駄です。
