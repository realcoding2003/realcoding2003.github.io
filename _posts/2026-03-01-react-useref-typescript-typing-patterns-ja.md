---
layout: post
title: "React useRefにTypeScriptで正しく型を指定する方法"
date: 2026-03-01 09:00:00 +0900
categories: [Development, Tips]
tags: [React, TypeScript, useRef, DOM, type]
author: "Kevin Park"
lang: ja
slug: react-useref-typescript-typing-patterns
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /ja/2026/03/01/react-useref-typescript-typing-patterns-ja/
  - /2026/03/01/react-useref-typescript-typing-patterns-ja/
excerpt: "useRefのジェネリックにnullを含めるかどうかで、まったく異なる型になります"
---

## 問題

ReactでTypeScriptと一緒に`useRef`を使うと、このようなエラーに遭遇することがあります。

```typescript
const inputRef = useRef<HTMLInputElement>();

inputRef.current.focus();
// 'inputRef.current' is possibly 'undefined'.
```

初期値を`null`にしても、別のエラーが発生します。

```typescript
const inputRef = useRef<HTMLInputElement>(null);

inputRef.current.focus();
// 'inputRef.current' is possibly 'null'.
```

毎回`if (inputRef.current)`でチェックしなければならないのかと思いますが、実は`useRef`のオーバーロードを理解すれば、すっきり対処できます。

## 解決方法

`useRef`には2つのオーバーロードがあります。

```typescript
// 1. DOM ref用（読み取り専用の.current）
// ジェネリックにnullを含め、初期値はnull
const inputRef = useRef<HTMLInputElement>(null);
// 型: RefObject<HTMLInputElement> — currentはreadonly

// 2. 値保存用（変更可能な.current）
// 初期値の型がジェネリックと一致
const countRef = useRef<number>(0);
// 型: MutableRefObject<number> — currentは変更可能
```

DOM refはReactが管理するのでreadonlyで、値保存用は自分で変更するのでmutableです。

実務でよく使うパターンを紹介します。

```typescript
// DOM要素の参照
const inputRef = useRef<HTMLInputElement>(null);
const divRef = useRef<HTMLDivElement>(null);

// タイマーID保存
const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

// 前回の値を追跡
const prevValueRef = useRef<string>("");

// マウント状態の追跡
const isMountedRef = useRef<boolean>(false);
```

イベントハンドラ内では要素が確実にマウントされているので、non-nullアサーションを使っても問題ありません。

```typescript
const handleSubmit = () => {
  inputRef.current!.focus();
};
```

ただし`useEffect`内では、条件チェックをする方が安全です。

```typescript
useEffect(() => {
  if (inputRef.current) {
    inputRef.current.focus();
  }
}, []);
```

## ポイント

- `useRef<T>(null)` → `RefObject<T>`（DOM ref用、currentはreadonly）
- `useRef<T>(initialValue)` → `MutableRefObject<T>`（値保存用、currentは変更可能）
- DOM要素のrefは常に`null`で初期化し、使用時にnullチェックを行います
- タイマー、前回の値、外部ライブラリのインスタンスなどにはMutableRefObjectを使います
