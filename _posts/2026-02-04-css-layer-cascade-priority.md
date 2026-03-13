---
layout: post
title: "CSS @layer로 스타일 우선순위 깔끔하게 정리하기"
date: 2026-02-04 09:00:00 +0900
categories: [Development, Tips]
tags: [CSS, layer, cascade, architecture]
author: "Kevin Park"
lang: ko
excerpt: "CSS @layer를 활용해서 스타일 우선순위 전쟁을 끝내는 방법을 정리했다."
---

## 문제

프로젝트가 커지면 CSS 우선순위가 난장판이 된다. 라이브러리 CSS, 리셋 CSS, 컴포넌트 CSS, 유틸리티 CSS가 뒤엉켜서 `!important`를 남발하게 되는 거다. 선택자 특이성(specificity) 싸움에서 지면 스타일이 안 먹히고, 이기려고 더 복잡한 선택자를 쓰게 되는 악순환.

## 해결

`@layer`를 쓰면 CSS 캐스케이드의 우선순위를 레이어 단위로 명시적으로 제어할 수 있다.

```css
/* 레이어 순서 선언 - 뒤에 올수록 우선순위 높음 */
@layer reset, base, components, utilities;

@layer reset {
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
}

@layer base {
  body {
    font-family: system-ui, sans-serif;
    line-height: 1.6;
  }
  a {
    color: #3b82f6;
  }
}

@layer components {
  .card {
    padding: 1rem;
    border-radius: 8px;
    background: white;
  }
  .card a {
    color: #1e40af; /* base의 a 스타일을 자동으로 이김 */
  }
}

@layer utilities {
  .text-red { color: red; } /* 어떤 컴포넌트 스타일보다 우선 */
}
```

외부 라이브러리 CSS도 레이어에 집어넣을 수 있다:

```css
@layer reset, vendor, components, utilities;

/* 외부 CSS를 vendor 레이어에 격리 */
@import url('tailwind.css') layer(vendor);

@layer components {
  /* vendor보다 항상 우선 - !important 필요 없음 */
  .my-button {
    background: #3b82f6;
  }
}
```

## 핵심 포인트

- `@layer` 선언 순서가 우선순위를 결정한다. 나중에 선언된 레이어가 이긴다
- 레이어 안의 선택자 특이성(specificity)은 레이어 간 비교에서 무시된다. `.card a`가 아무리 구체적이어도 상위 레이어의 `a`에 진다
- `@import`에 `layer()`를 붙이면 외부 CSS를 특정 레이어에 격리시킬 수 있어서 `!important` 없이 오버라이드가 가능하다
