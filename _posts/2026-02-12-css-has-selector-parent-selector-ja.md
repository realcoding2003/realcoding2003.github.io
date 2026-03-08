---
layout: post
title: "CSS :has()セレクターで親要素を選択する方法"
date: 2026-02-12 09:00:00 +0900
categories: [Development, Tips]
tags: [CSS, Selector, has, Frontend]
author: "Kevin Park"
lang: ja
excerpt: "CSSだけで親要素を選択できる:has()セレクターの実践的な活用法を紹介します。"
---

## 問題

CSSで「子要素の状態に応じて親のスタイルを変えたい」という要件がある場合、以前は必ずJavaScriptが必要でした。

```javascript
checkbox.addEventListener('change', (e) => {
  e.target.closest('.card').classList.toggle('selected');
});
```

このような単純なスタイル変更にJavaScriptを使うのは、あまり理想的ではありません。

## 解決方法

`:has()`セレクターを使えば、CSSだけで実現できます。すべてのモダンブラウザで対応しています。

```css
/* チェック済みのチェックボックスを持つカード */
.card:has(input:checked) {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

/* 画像を含む投稿アイテム */
.post-item:has(img) {
  grid-template-columns: 200px 1fr;
}

/* 空の入力フィールドを持つフォームグループ */
.form-group:has(input:placeholder-shown) {
  opacity: 0.7;
}
```

より実用的な例もあります。

```css
/* エラーメッセージが表示されたら入力フィールドのボーダーを赤に */
.field:has(.error-message:not(:empty)) input {
  border-color: #ef4444;
}

/* 動画を含むセクションはパディングなし */
section:has(video) {
  padding: 0;
}
```

## ポイント

- `:has()`はCSSで親要素・兄弟要素を条件付きで選択できるセレクターです
- JavaScriptなしで、純粋なCSSだけで状態ベースのスタイリングが可能になりました
- すべてのモダンブラウザで対応しています（Chrome 105+、Firefox 121+、Safari 15.4+）
- 過度に複雑な`:has()`のチェーンはパフォーマンスに影響する可能性があるため、注意が必要です
