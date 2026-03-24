---
layout: post
title: "React Compilerを導入したらuseMemoとuseCallbackが不要になった話"
date: 2026-03-23 09:00:00 +0900
categories: [Development, Tips]
tags: [React, React Compiler, useMemo, useCallback, パフォーマンス最適化]
author: "Kevin Park"
lang: ja
excerpt: "React Compilerがビルド時に自動でメモ化を行うため、useMemoやuseCallbackを手動で書く必要がほぼなくなりました。"
---

## 問題

Reactでパフォーマンスを最適化するために、`useMemo`や`useCallback`を至る所に書くのが日常でした。
書き忘れると不要な再レンダリングが発生し、書いたら書いたで依存配列の管理が大変です。

```jsx
// すべてのコンポーネントにこのようなコードがありました
const filteredList = useMemo(() => {
  return items.filter(item => item.active);
}, [items]);

const handleClick = useCallback((id) => {
  setSelected(id);
}, []);
```

「これはメモ化すべきか？」と毎回悩むのも負担でした。

## 解決方法

React Compiler v1.0のリリースにより、この悩みが解消されました。
ビルド時にコンパイラが自動的にメモ化を挿入してくれます。

Next.jsでの設定は非常に簡単です。

```js
// next.config.js
const nextConfig = {
  reactCompiler: true,
};

module.exports = nextConfig;
```

既存プロジェクトにはBabelプラグインで導入できます。

```bash
npm install -D babel-plugin-react-compiler
```

```js
// babel.config.js
module.exports = {
  plugins: [
    ['babel-plugin-react-compiler'],
  ],
};
```

これで、先ほどのコードをシンプルに書き換えられます。

```jsx
// コンパイラが自動的に最適化してくれます
const filteredList = items.filter(item => item.active);

const handleClick = (id) => {
  setSelected(id);
};
```

`useMemo`や`useCallback`を削除しても、コンパイラがビルド時に自動でメモ化を適用します。

## ポイント

- React Compilerはビルド時にコンポーネントを解析し、自動的にメモ化を適用します
- `useMemo`、`useCallback`、`React.memo`を手動で書く必要が95%以上なくなります
- Next.jsでは`reactCompiler: true`の1行で設定完了です
- 既存のuseMemo/useCallbackコードもそのまま動作します（競合なし）
- コンパイラが最適化できるよう、Reactのルール（純粋関数、不変性）を守ることが重要です
