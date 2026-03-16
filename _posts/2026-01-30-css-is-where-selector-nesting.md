---
layout: post
title: "CSS :is()와 :where() 선택자로 중복 셀렉터 줄이기"
date: 2026-01-30 09:00:00 +0900
categories: [Development, Tips]
tags: [CSS, 선택자, 프론트엔드, 웹개발]
author: "Kevin Park"
lang: ko
excerpt: "CSS :is()와 :where()로 반복되는 선택자를 깔끔하게 줄이는 방법. 둘의 specificity 차이까지 정리."
---

## 문제

CSS에서 비슷한 스타일을 여러 요소에 적용하려면 선택자를 죽죽 나열해야 한다. 이런 코드 본 적 있을 거다.

```css
.article h1,
.article h2,
.article h3,
.article h4 {
  color: #333;
  line-height: 1.4;
}

.sidebar h1,
.sidebar h2,
.sidebar h3,
.sidebar h4 {
  color: #666;
}
```

보기만 해도 피곤하다.

## 해결

`:is()`를 쓰면 선택자 목록을 그룹핑할 수 있다.

```css
.article :is(h1, h2, h3, h4) {
  color: #333;
  line-height: 1.4;
}

.sidebar :is(h1, h2, h3, h4) {
  color: #666;
}
```

양쪽 다 그룹핑하는 것도 가능하다.

```css
:is(.article, .sidebar) :is(h1, h2, h3, h4) {
  line-height: 1.4;
}
```

`:where()`도 문법은 똑같은데, **specificity가 항상 0**이라는 차이가 있다.

```css
/* :is() - 가장 높은 specificity를 가진 선택자 기준 */
:is(.class, #id) p { } /* specificity: (1,0,1) - #id 기준 */

/* :where() - 항상 specificity 0 */
:where(.class, #id) p { } /* specificity: (0,0,1) - p만 계산 */
```

그래서 `:where()`는 쉽게 오버라이드할 수 있는 기본 스타일에 유용하다.

```css
/* 기본 스타일 - 나중에 쉽게 덮어쓸 수 있다 */
:where(.btn) {
  padding: 8px 16px;
  border-radius: 4px;
}

/* 이 한 줄로 위 스타일을 덮어쓸 수 있다 */
.my-btn {
  padding: 12px 24px;
}
```

## 핵심 포인트

- `:is()`와 `:where()`는 선택자 목록을 그룹핑해서 중복을 줄인다
- `:is()`는 인자 중 가장 높은 specificity를 따라간다
- `:where()`는 specificity가 항상 0이라 오버라이드하기 쉽다
- 라이브러리/리셋 CSS에는 `:where()`, 컴포넌트 스타일에는 `:is()`가 적합하다
