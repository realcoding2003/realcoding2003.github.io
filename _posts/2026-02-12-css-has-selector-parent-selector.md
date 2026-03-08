---
layout: post
title: "CSS :has() 셀렉터로 부모 요소 선택하기"
date: 2026-02-12 09:00:00 +0900
categories: [Development, Tips]
tags: [CSS, Selector, has, Frontend]
author: "Kevin Park"
lang: ko
excerpt: "CSS만으로 부모 요소를 선택할 수 있는 :has() 셀렉터 실전 활용법."
---

## 문제

CSS에서 "자식 요소의 상태에 따라 부모 스타일을 바꾸고 싶다"는 요구가 있으면, 예전에는 무조건 JavaScript를 써야 했다.

```javascript
// 체크박스가 체크되면 부모 카드에 클래스 추가
checkbox.addEventListener('change', (e) => {
  e.target.closest('.card').classList.toggle('selected');
});
```

이런 단순한 스타일 변경에 JS를 쓰는 게 항상 찜찜했다.

## 해결

`:has()` 셀렉터를 쓰면 CSS만으로 가능하다. 모든 모던 브라우저에서 지원한다.

```css
/* 체크된 체크박스를 가진 카드 */
.card:has(input:checked) {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

/* 이미지가 있는 글 목록 항목 */
.post-item:has(img) {
  grid-template-columns: 200px 1fr;
}

/* 빈 입력 필드를 가진 폼 그룹 */
.form-group:has(input:placeholder-shown) {
  opacity: 0.7;
}
```

좀 더 실용적인 예제도 있다.

```css
/* 에러 메시지가 보이면 입력 필드 테두리 빨갛게 */
.field:has(.error-message:not(:empty)) input {
  border-color: #ef4444;
}

/* 비디오를 포함한 섹션은 패딩 없이 */
section:has(video) {
  padding: 0;
}
```

## 핵심 포인트

- `:has()`는 CSS에서 부모/형제 요소를 조건부로 선택할 수 있는 셀렉터다
- JavaScript 없이 순수 CSS로 상태 기반 스타일링이 가능해졌다
- 모든 모던 브라우저에서 지원한다 (Chrome 105+, Firefox 121+, Safari 15.4+)
- 과도하게 복잡한 `:has()` 체이닝은 성능에 영향줄 수 있으니 주의한다
