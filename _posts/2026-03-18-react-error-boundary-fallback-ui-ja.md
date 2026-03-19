---
layout: post
title: "React Error Boundary実践ガイド - エラーでもアプリを落とさない方法"
date: 2026-03-18 09:00:00 +0900
categories: [Development, Tips]
tags: [React, Error Boundary, Error Handling, Fallback UI]
author: "Kevin Park"
lang: ja
excerpt: "React Error Boundaryでコンポーネントのエラーを隔離し、フォールバックUIを表示する実践パターンをご紹介します。"
---

## 問題

子コンポーネントの一つでランタイムエラーが発生すると、アプリ全体が白い画面になってしまいます。本番環境でこれが起きると大問題です。

## 解決方法

Error Boundaryクラスコンポーネントを作成してエラーを隔離します。

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
    // Sentryなどのエラートラッキングサービスに報告
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
```

エラーが発生する可能性のあるセクションを個別にラップします。

```tsx
function App() {
  return (
    <div>
      <Header />
      <ErrorBoundary fallback={<p>このセクションを読み込めませんでした。</p>}>
        <UserProfile />
      </ErrorBoundary>
      <ErrorBoundary fallback={<p>コメントを読み込めませんでした。</p>}>
        <Comments />
      </ErrorBoundary>
      <Footer />
    </div>
  );
}
```

`UserProfile`でエラーが発生しても、`Comments`やその他の部分は正常に動作します。

## ポイント

- Error Boundaryはクラスコンポーネントでのみ作成可能です（関数コンポーネントには`getDerivedStateFromError`に相当するものがありません）
- エラーの範囲をできるだけ狭く設定することが重要です。アプリ全体を一つでラップするのではなく、セクション単位でラップしましょう
- Error Boundaryはレンダリング中のエラーのみキャッチします。イベントハンドラ内のエラーはキャッチしません
