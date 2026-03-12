---
layout: post
title: "CSS Container Queriesでコンポーネント単位のレスポンシブデザインを実現する"
date: 2026-03-12 09:00:00 +0900
categories: [Development, Tips]
tags: [CSS, container queries, レスポンシブ, コンポーネント]
author: "Kevin Park"
lang: ja
excerpt: "media queryの代わりに@containerを使えば、コンポーネントが配置される場所に関係なくレスポンシブ対応できます"
---

## 問題

カードコンポーネントをmedia queryでレスポンシブ対応していましたが、同じコンポーネントをサイドバーに配置するとレイアウトが崩れてしまいます。media queryはビューポート基準のため、コンポーネントの実際の表示領域に対応できないのが原因です。

## 解決方法

CSS Container Queriesを使えば、ビューポートではなく親コンテナのサイズを基準にスタイルを適用できます。

```css
/* 親要素をコンテナとして登録 */
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}

/* コンテナの幅に基づいてレスポンシブを適用 */
.card {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@container card (min-width: 400px) {
  .card {
    grid-template-columns: 200px 1fr;
  }
}

@container card (min-width: 700px) {
  .card {
    grid-template-columns: 300px 1fr;
    font-size: 1.1rem;
  }
}
```

これにより、`.card`コンポーネントはサイドバーでもメインエリアでも、親コンテナのサイズに応じて自動的にレイアウトが変わります。

`container-type`には3つの値があります：

```css
container-type: inline-size;  /* 横幅のみ追跡（最も一般的） */
container-type: size;         /* 横幅＋高さを追跡 */
container-type: normal;       /* デフォルト、クエリ対象外 */
```

省略記法もあります：

```css
/* container-name + container-type を一括指定 */
.wrapper {
  container: card / inline-size;
}
```

## ポイント

- `@container`はビューポートではなく親コンテナのサイズ基準なので、再利用可能なコンポーネントに最適です
- ブラウザサポート率は95%以上（Chrome 105+、Firefox 110+、Safari 16+）で、本番環境でも安心して使えます
- `container-type: inline-size`が最も実用的で、`size`は高さベースのクエリが必要な特殊なケースでのみ使用します
