---
layout: post
title: "CSS animation-timeline: scroll()でJSなしのスクロールアニメーション"
date: 2026-03-18 09:00:00 +0900
categories: [Development, Tips]
tags: [CSS, scroll-animation, animation-timeline, フロントエンド]
author: "Kevin Park"
lang: ja
slug: css-scroll-driven-animation-timeline
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /ja/2026/03/18/css-scroll-driven-animation-timeline-ja/
  - /2026/03/18/css-scroll-driven-animation-timeline-ja/
excerpt: "animation-timeline: scroll()を使えば、JavaScriptなしでスクロール進捗バーが作れます。"
---

## 問題

ページのスクロールに応じて上部にプログレスバーを表示したい場合、通常は`scroll`イベントリスナーと`requestAnimationFrame`を使います。動作はしますが、コードが長くなりパフォーマンスの調整も必要です。

## 解決方法

CSS `animation-timeline: scroll()`を使えば、JavaScriptは不要です。

```css
.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: #3b82f6;
  transform-origin: left;
  animation: grow-progress linear;
  animation-timeline: scroll();
}

@keyframes grow-progress {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
```

```html
<div class="progress-bar"></div>
```

これだけです。`animation-timeline: scroll()`が、時間ベースではなくスクロール位置ベースでアニメーションを駆動します。

特定の要素がビューポートに入った時にアニメーションさせたい場合は`view()`を使います。

```css
.fade-in {
  animation: fade-in linear;
  animation-timeline: view();
  animation-range: entry 0% cover 40%;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

`animation-range`で、アニメーションの開始・終了区間を細かく制御できます。`entry`、`exit`、`cover`、`contain`などのキーワードを組み合わせて使います。

## ポイント

- `animation-timeline: scroll()`はスクロール位置ベースのアニメーション、JSは不要です
- `view()`は要素のビューポート進入・離脱に基づくアニメーションです
- `animation-range`でアニメーション区間を精密に制御できます
- `transform`と`opacity`のみ使えばコンポジタースレッドで動作し60fpsが保証されます
- Chrome、Edge、Safari 18+で対応。Firefoxはまだフラグの裏にあります
