---
layout: post
title: "React useOptimistic으로 즉각적 UI 업데이트 구현하기"
date: 2026-03-13 09:00:00 +0900
categories: [Development, Tips]
tags: [React, useOptimistic, hooks, UX]
author: "Kevin Park"
lang: ko
excerpt: "React 19의 useOptimistic 훅으로 서버 응답을 기다리지 않고 UI를 먼저 업데이트하는 패턴을 정리했다."
---

## 문제

좋아요 버튼을 누르면 서버 응답이 올 때까지 UI가 멈춰있는 게 답답했다. 사용자 입장에서 버튼을 눌렀는데 0.5초간 아무 반응이 없으면 "어... 눌린 건가?" 하게 된다. 로딩 스피너를 넣자니 과한 느낌이고, 그냥 즉시 반영됐으면 좋겠는 거다.

## 해결

React 19에서 추가된 `useOptimistic` 훅을 쓰면 서버 응답 전에 UI를 먼저 업데이트하고, 실패하면 자동으로 롤백할 수 있다.

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
    setOptimisticCount(1); // UI 즉시 업데이트
    await likePost(postId); // 서버 요청은 백그라운드에서
  }

  return (
    <button onClick={handleLike}>
      {optimisticCount}
    </button>
  );
}
```

좀 더 실전적인 예시로, 댓글 목록에 적용하면 이런 느낌이다:

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
    addOptimisticComment(tempComment); // 목록에 즉시 추가
    await postComment(text); // 서버에 저장
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

## 핵심 포인트

- `useOptimistic`은 서버 액션(또는 비동기 작업)이 진행 중일 때만 낙관적 상태를 보여주고, 완료되면 실제 상태로 돌아간다
- 서버 요청이 실패하면 원래 상태로 자동 롤백되니까 에러 처리가 간단하다
- `pending` 같은 플래그를 넣어서 "저장 중" 상태를 시각적으로 표현하면 UX가 더 좋아진다
