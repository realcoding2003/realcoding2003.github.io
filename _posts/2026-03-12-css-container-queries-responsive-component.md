---
layout: post
title: "CSS Container Queries로 컴포넌트 단위 반응형 만들기"
date: 2026-03-12 09:00:00 +0900
categories: [Development, Tips]
tags: [CSS, container queries, 반응형, 컴포넌트]
author: "Kevin Park"
lang: ko
excerpt: "media query 대신 @container를 쓰면 컴포넌트가 어디에 놓이든 알아서 반응형이 된다"
---

## 문제

사이드바에 넣은 카드 컴포넌트가 있는데, 같은 컴포넌트를 메인 영역에도 쓰고 싶었다. media query로 반응형을 만들어뒀더니 뷰포트 기준이라 사이드바에서는 레이아웃이 깨지는 거다.

## 해결

CSS Container Queries를 쓰면 된다. 부모 컨테이너의 크기를 기준으로 스타일을 바꿀 수 있다.

```css
/* 부모를 컨테이너로 등록 */
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}

/* 컨테이너 너비 기준으로 반응형 적용 */
.card {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@container card (min-width: 400px) {
  .card {
    grid-template-columns: 200px 1fr;
  }
}

@container card (min-width: 700px) {
  .card {
    grid-template-columns: 300px 1fr;
    font-size: 1.1rem;
  }
}
```

이렇게 하면 `.card-wrapper`가 사이드바에 들어가든 메인 영역에 들어가든, 자기 부모 크기에 맞춰서 레이아웃이 바뀐다. 뷰포트랑은 상관없이.

`container-type`에는 세 가지 값이 있다:

```css
container-type: inline-size;  /* 가로 크기만 추적 (가장 많이 씀) */
container-type: size;         /* 가로 + 세로 크기 추적 */
container-type: normal;       /* 기본값, 쿼리 대상 아님 */
```

축약형도 있다:

```css
/* container-name + container-type 한 번에 */
.wrapper {
  container: card / inline-size;
}
```

## 핵심 포인트

- `@container`는 뷰포트가 아니라 부모 컨테이너 크기 기준이라 재사용 컴포넌트에 딱 맞는다
- 브라우저 지원율이 95% 이상(Chrome 105+, Firefox 110+, Safari 16+)이라 프로덕션에서 써도 된다
- `container-type: inline-size`가 가장 실용적이고, `size`는 세로 크기까지 필요한 특수한 경우에만 쓴다
