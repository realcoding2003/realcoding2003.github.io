---
layout: post
title: "Instant UI Updates with React useOptimistic Hook"
date: 2026-03-13 09:00:00 +0900
categories: [Development, Tips]
tags: [React, useOptimistic, hooks, UX]
author: "Kevin Park"
lang: en
excerpt: "Use React 19's useOptimistic hook to update the UI before the server responds."
---

## Problem

When a user clicks a "like" button, the UI freezes until the server responds. Even a 500ms delay makes users wonder if their click registered. A loading spinner feels excessive for such a small interaction.

## Solution

React 19's `useOptimistic` hook lets you update the UI immediately and automatically rolls back if the server request fails.

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
    setOptimisticCount(1); // Update UI instantly
    await likePost(postId); // Server request in the background
  }

  return (
    <button onClick={handleLike}>
      {optimisticCount}
    </button>
  );
}
```

A more practical example — applying it to a comment list:

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
    addOptimisticComment(tempComment); // Add to list immediately
    await postComment(text); // Save to server
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

## Key Points

- `useOptimistic` shows the optimistic state only while the async action is in progress, then reverts to the actual state on completion
- Failed server requests automatically roll back to the original state
- Adding a `pending` flag for visual feedback (like reduced opacity) further improves the user experience
