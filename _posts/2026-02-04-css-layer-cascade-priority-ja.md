---
layout: post
title: "CSS @layerでスタイルの優先順位をすっきり整理する方法"
date: 2026-02-04 09:00:00 +0900
categories: [Development, Tips]
tags: [CSS, layer, cascade, architecture]
author: "Kevin Park"
lang: ja
excerpt: "CSS @layerを活用して、スタイルの優先順位の混乱を解消する方法をご紹介します。"
---

## 問題

プロジェクトが大きくなると、CSSの優先順位が混乱します。ライブラリCSS、リセットCSS、コンポーネントCSS、ユーティリティCSSが入り混じり、`!important`を乱用することになります。セレクタの詳細度（specificity）の戦いに負けるとスタイルが適用されず、勝つためにより複雑なセレクタを書くという悪循環に陥ります。

## 解決方法

`@layer`を使えば、CSSカスケードの優先順位をレイヤー単位で明示的に制御できます。

```css
/* レイヤーの順序を宣言 - 後に宣言したものほど優先順位が高い */
@layer reset, base, components, utilities;

@layer reset {
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
}

@layer base {
  body {
    font-family: system-ui, sans-serif;
    line-height: 1.6;
  }
  a {
    color: #3b82f6;
  }
}

@layer components {
  .card {
    padding: 1rem;
    border-radius: 8px;
    background: white;
  }
  .card a {
    color: #1e40af; /* baseのaスタイルに自動的に勝ちます */
  }
}

@layer utilities {
  .text-red { color: red; } /* どのコンポーネントスタイルよりも優先 */
}
```

外部ライブラリのCSSもレイヤーに入れることができます：

```css
@layer reset, vendor, components, utilities;

/* 外部CSSをvendorレイヤーに隔離 */
@import url('tailwind.css') layer(vendor);

@layer components {
  /* vendorより常に優先 - !importantは不要 */
  .my-button {
    background: #3b82f6;
  }
}
```

## ポイント

- `@layer`の宣言順序が優先順位を決定します。後に宣言されたレイヤーが勝ちます
- レイヤー内のセレクタの詳細度は、レイヤー間の比較では無視されます。下位レイヤーの`.card a`がどれだけ具体的でも、上位レイヤーの`a`に負けます
- `@import`に`layer()`を付けると外部CSSを特定のレイヤーに隔離でき、`!important`なしでオーバーライドが可能になります
