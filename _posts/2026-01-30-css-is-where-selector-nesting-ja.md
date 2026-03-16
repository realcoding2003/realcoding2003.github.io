---
layout: post
title: "CSS :is()と:where()セレクタで重複セレクタを減らす方法"
date: 2026-01-30 09:00:00 +0900
categories: [Development, Tips]
tags: [CSS, セレクタ, フロントエンド, Web開発]
author: "Kevin Park"
lang: ja
slug: css-is-where-selector-nesting
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /ja/2026/01/30/css-is-where-selector-nesting-ja/
  - /2026/01/30/css-is-where-selector-nesting-ja/
excerpt: "CSS :is()と:where()で繰り返しのセレクタをスッキリ減らす方法と、両者のspecificity の違いを解説します。"
---

## 問題

CSSで似たようなスタイルを複数の要素に適用するには、セレクタを長々と列挙する必要があります。

```css
.article h1,
.article h2,
.article h3,
.article h4 {
  color: #333;
  line-height: 1.4;
}
```

見ているだけで疲れてしまいます。

## 解決方法

`:is()`を使えば、セレクタリストをグループ化できます。

```css
.article :is(h1, h2, h3, h4) {
  color: #333;
  line-height: 1.4;
}

/* 両方をグループ化することも可能 */
:is(.article, .sidebar) :is(h1, h2, h3, h4) {
  line-height: 1.4;
}
```

`:where()`も構文は同じですが、**specificityが常に0**という違いがあります。

```css
/* :is() - 最も高いspecificityの引数に従う */
:is(.class, #id) p { } /* specificity: (1,0,1) */

/* :where() - 常にspecificity 0 */
:where(.class, #id) p { } /* specificity: (0,0,1) */
```

そのため、`:where()`は簡単にオーバーライドできるデフォルトスタイルに最適です。

```css
/* ベーススタイル - 後から簡単に上書き可能 */
:where(.btn) {
  padding: 8px 16px;
  border-radius: 4px;
}

/* このシンプルなクラスで上書きできます */
.my-btn {
  padding: 12px 24px;
}
```

## ポイント

- `:is()`と`:where()`はセレクタリストをグループ化して重複を減らします
- `:is()`は引数の中で最も高いspecificityを採用します
- `:where()`はspecificityが常に0なので、オーバーライドが簡単です
- リセットCSS/ライブラリには`:where()`、コンポーネントスタイルには`:is()`が適しています
