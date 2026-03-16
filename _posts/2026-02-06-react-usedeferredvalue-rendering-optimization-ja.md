---
layout: post
title: "React useDeferredValueでdebounceなしに検索を最適化する"
date: 2026-02-06 09:00:00 +0900
categories: [Development, Tips]
tags: [React, useDeferredValue, パフォーマンス, レンダリング]
author: "Kevin Park"
lang: ja
slug: react-usedeferredvalue-rendering-optimization
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /ja/2026/02/06/react-usedeferredvalue-rendering-optimization-ja/
  - /2026/02/06/react-usedeferredvalue-rendering-optimization-ja/
excerpt: "入力はすぐに反映しつつ、重いリストのレンダリングだけ遅延させます"
---

## 問題

検索フィルター付きのリストを作りましたが、データが多いとキーストロークのたびに再レンダリングが走り、入力がカクつきます。`debounce`で対応はできますが、入力中に値が見えない固定の遅延が気になります。

```jsx
function SearchList({ items }) {
  const [query, setQuery] = useState('');

  // itemsが10000件あると、毎回のタイピングで全件フィルタリング
  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <List items={filtered} />
    </>
  );
}
```

## 解決方法

`useDeferredValue`を使えば、入力は即座に反映しつつ、重いレンダリングは後回しにできます。

```jsx
import { useState, useDeferredValue, memo } from 'react';

function SearchList({ items }) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  // 入力はqueryで即時反映、リストはdeferredQueryで遅延レンダリング
  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(deferredQuery.toLowerCase())
  );

  const isStale = query !== deferredQuery;

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <div style={{ opacity: isStale ? 0.7 : 1 }}>
        <SlowList items={filtered} />
      </div>
    </>
  );
}

// memoで囲まないと遅延効果が正しく動作しません
const SlowList = memo(function SlowList({ items }) {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
});
```

`debounce`との違いはこうです：

```
debounce: 入力停止 → 300ms待機 → フィルタリング開始
useDeferredValue: 入力は即時反映 → ブラウザの空き時間にフィルタリング更新
```

ユーザーの入力は一切遅延せず、重い再レンダリングだけをReactが自動的に後回しにします。

## ポイント

- `useDeferredValue`は緊急な更新（入力）と非緊急な更新（リスト描画）を分離します
- `memo`と一緒に使う必要があります — 使わないと毎回再レンダリングされてしまいます
- `debounce`と違い固定の遅延がないので、高速なデバイスではほぼ即時に反映され、低速なデバイスでのみ遅延が発生します
