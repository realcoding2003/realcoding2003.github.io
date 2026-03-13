---
layout: post
title: "React useOptimisticで即座にUIを更新する方法"
date: 2026-03-13 09:00:00 +0900
categories: [Development, Tips]
tags: [React, useOptimistic, hooks, UX]
author: "Kevin Park"
lang: ja
excerpt: "React 19のuseOptimisticフックで、サーバーレスポンスを待たずにUIを先に更新するパターンをご紹介します。"
---

## 問題

「いいね」ボタンを押した時、サーバーのレスポンスが返ってくるまでUIが止まってしまう問題があります。ユーザーにとって、ボタンを押しても0.5秒間反応がないと「押せたのかな？」と不安になります。ローディングスピナーを表示するのは大げさですし、即座に反映されてほしいところです。

## 解決方法

React 19で追加された`useOptimistic`フックを使えば、サーバーレスポンスの前にUIを先に更新し、失敗した場合は自動的にロールバックできます。

```tsx
import { useOptimistic } from 'react';

function LikeButton({ postId, initialCount }: {
  postId: string;
  initialCount: number;
}) {
  const [optimisticCount, setOptimisticCount] = useOptimistic(
    initialCount,
    (current, increment: number) => current + increment
  );

  async function handleLike() {
    setOptimisticCount(1); // UIを即座に更新
    await likePost(postId); // サーバーリクエストはバックグラウンドで
  }

  return (
    <button onClick={handleLike}>
      {optimisticCount}
    </button>
  );
}
```

より実践的な例として、コメントリストに適用するとこのようになります：

```tsx
function CommentList({ comments }: { comments: Comment[] }) {
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (state, newComment: Comment) => [...state, newComment]
  );

  async function handleSubmit(text: string) {
    const tempComment = {
      id: crypto.randomUUID(),
      text,
      pending: true,
    };
    addOptimisticComment(tempComment); // リストに即座に追加
    await postComment(text); // サーバーに保存
  }

  return (
    <ul>
      {optimisticComments.map((c) => (
        <li key={c.id} style={% raw %}{{ opacity: c.pending ? 0.6 : 1 }}{% endraw %}>
          {c.text}
        </li>
      ))}
    </ul>
  );
}
```

## ポイント

- `useOptimistic`は非同期処理が進行中の間だけ楽観的な状態を表示し、完了すると実際の状態に戻ります
- サーバーリクエストが失敗した場合は、元の状態に自動的にロールバックされるのでエラー処理が簡単です
- `pending`フラグを使って「保存中」の状態を視覚的に表現すると、UXがさらに向上します
