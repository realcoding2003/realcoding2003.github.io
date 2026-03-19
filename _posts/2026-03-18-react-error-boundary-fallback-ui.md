---
layout: post
title: "React Error Boundary 실전 사용법 - 에러 나도 앱 안 죽게 하기"
date: 2026-03-18 09:00:00 +0900
categories: [Development, Tips]
tags: [React, Error Boundary, Error Handling, Fallback UI]
author: "Kevin Park"
lang: ko
excerpt: "React Error Boundary로 컴포넌트 에러를 격리하고 폴백 UI를 보여주는 실전 패턴을 정리한다."
---

## 문제

하위 컴포넌트 하나에서 런타임 에러가 터지면 전체 앱이 하얀 화면으로 죽어버린다. 프로덕션에서 이러면 큰일이다.

## 해결

Error Boundary 클래스 컴포넌트를 만들어서 에러를 격리한다.

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
    // 여기서 Sentry 같은 에러 트래킹 서비스에 보고
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
```

사용할 때는 에러가 날 수 있는 영역을 감싸면 된다.

```tsx
function App() {
  return (
    <div>
      <Header />
      <ErrorBoundary fallback={<p>이 섹션을 불러올 수 없습니다.</p>}>
        <UserProfile />
      </ErrorBoundary>
      <ErrorBoundary fallback={<p>댓글을 불러올 수 없습니다.</p>}>
        <Comments />
      </ErrorBoundary>
      <Footer />
    </div>
  );
}
```

`UserProfile`에서 에러가 나도 `Comments`와 나머지는 정상 동작한다.

## 핵심 포인트

- Error Boundary는 클래스 컴포넌트로만 만들 수 있다 (함수 컴포넌트에는 `getDerivedStateFromError` 해당 없음)
- 에러 범위를 좁게 잡을수록 좋다. 앱 전체를 하나로 감싸지 말고 섹션별로 감싸는 게 핵심이다
- 이벤트 핸들러 안의 에러는 잡지 못한다. 렌더링 중 에러만 잡는다는 점을 기억하자
