---
layout: post
title: "React Error Boundary in Practice - Prevent Your App from Crashing"
date: 2026-03-18 09:00:00 +0900
categories: [Development, Tips]
tags: [React, Error Boundary, Error Handling, Fallback UI]
author: "Kevin Park"
lang: en
excerpt: "Learn how to use React Error Boundary to isolate component errors and display fallback UI in production."
---

## Problem

When a single child component throws a runtime error, the entire app crashes to a white screen. In production, this is a disaster.

## Solution

Create an Error Boundary class component to isolate errors.

```tsx
import { Component, ReactNode } from 'react';

interface Props {
  fallback: ReactNode;
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
    // Report to error tracking service like Sentry
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
```

Wrap error-prone sections individually.

```tsx
function App() {
  return (
    <div>
      <Header />
      <ErrorBoundary fallback={<p>Failed to load this section.</p>}>
        <UserProfile />
      </ErrorBoundary>
      <ErrorBoundary fallback={<p>Failed to load comments.</p>}>
        <Comments />
      </ErrorBoundary>
      <Footer />
    </div>
  );
}
```

If `UserProfile` throws, `Comments` and the rest still work fine.

## Key Points

- Error Boundaries can only be class components — there's no function component equivalent for `getDerivedStateFromError`
- Keep the error boundary scope narrow. Wrap individual sections, not the entire app
- Error Boundaries only catch errors during rendering. They won't catch errors inside event handlers
