---
layout: post
title: "React useEffect無限ループの原因3つと解決法"
date: 2026-02-23 09:00:00 +0900
categories: [Development, Tips]
tags: [React, useEffect, Hooks, Debugging, Performance, Frontend]
author: "Kevin Park"
lang: ja
slug: react-useeffect-infinite-loop-fix
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /ja/2026/02/23/react-useeffect-infinite-loop-fix-ja/
  - /2026/02/23/react-useeffect-infinite-loop-fix-ja/
excerpt: "useEffectが止まらず実行され続ける3つの原因と、それぞれの解決方法をご紹介します。"
---

## 問題

コンポーネントがレンダリングされた途端、useEffectが止まらず繰り返し実行されます。コンソールにログが大量に出力され、APIが何百回も呼び出されていました。

## 解決方法

無限ループの原因はほぼ3つです。

### 1. 依存配列の省略

```jsx
// 無限ループ - 毎回のレンダリングで実行
useEffect(() => {
  fetchData();
});

// 解決 - マウント時に一度だけ実行
useEffect(() => {
  fetchData();
}, []);
```

### 2. オブジェクト・配列を依存配列に入れた場合

```jsx
// 無限ループ - 毎回のレンダリングで新しいオブジェクトが生成される
const options = { page: 1, limit: 10 };

useEffect(() => {
  fetchData(options);
}, [options]); // 参照が毎回変わるため無限実行

// 解決 - useMemoで参照を固定
const options = useMemo(() => ({ page: 1, limit: 10 }), []);

useEffect(() => {
  fetchData(options);
}, [options]);
```

### 3. useEffect内で直接stateを変更

```jsx
// 無限ループ - state変更 → 再レンダリング → useEffect → state変更 → ...
useEffect(() => {
  setCount(count + 1);
}, [count]);

// 解決 - 条件文でガード
useEffect(() => {
  if (count < 10) {
    setCount(count + 1);
  }
}, [count]);
```

## ポイント

- 依存配列を空の配列`[]`にすると、コンポーネントのマウント時に一度だけ実行されます。ほとんどのデータフェッチングはこれで十分です。
- オブジェクトや配列は毎回のレンダリングで新しい参照が生成されます。`useMemo`や`useCallback`で参照を固定するか、プリミティブ値のみを依存配列に入れてください。
- ESLintの`react-hooks/exhaustive-deps`ルールの警告を無視せず、依存関係の構造を見直すことをお勧めします。
