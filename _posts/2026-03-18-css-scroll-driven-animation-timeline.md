---
layout: post
title: "CSS animation-timeline: scroll()로 JS 없이 스크롤 애니메이션 만들기"
date: 2026-03-18 09:00:00 +0900
categories: [Development, Tips]
tags: [CSS, scroll-animation, animation-timeline, 프론트엔드]
author: "Kevin Park"
lang: ko
excerpt: "JavaScript 한 줄 없이 CSS만으로 스크롤 진행률 표시바를 만드는 방법. animation-timeline: scroll()이면 끝난다."
---

## 문제

페이지 스크롤에 따라 상단에 진행률 바를 보여주고 싶은데, 보통 `scroll` 이벤트 리스너 달고 `requestAnimationFrame`으로 처리한다. 근데 이거 성능도 신경 써야 하고 코드도 길어진다.

## 해결

CSS `animation-timeline: scroll()`을 쓰면 JS가 필요 없다.

```css
/* 스크롤 진행률 바 */
.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: #3b82f6;
  transform-origin: left;
  animation: grow-progress linear;
  animation-timeline: scroll();
}

@keyframes grow-progress {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
```

```html
<div class="progress-bar"></div>
```

이게 전부다. `animation-timeline: scroll()`이 시간 기반 대신 스크롤 위치 기반으로 애니메이션을 구동시킨다.

특정 요소가 뷰포트에 들어올 때 애니메이션을 주고 싶으면 `view()`를 쓴다.

```css
.fade-in {
  animation: fade-in linear;
  animation-timeline: view();
  animation-range: entry 0% cover 40%;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

`animation-range`로 애니메이션이 시작/끝나는 구간을 세밀하게 조절할 수 있다. `entry`, `exit`, `cover`, `contain` 같은 키워드를 조합하면 된다.

## 핵심 포인트

- `animation-timeline: scroll()`은 스크롤 위치 기반 애니메이션, JS 불필요
- `view()`는 요소의 뷰포트 진입/이탈 기반 애니메이션
- `animation-range`로 애니메이션 구간을 정밀하게 제어 가능
- `transform`과 `opacity`만 쓰면 컴포지터 스레드에서 돌아서 60fps 보장
- Chrome, Edge, Safari 18+ 지원. Firefox는 아직 플래그 뒤에 있다
