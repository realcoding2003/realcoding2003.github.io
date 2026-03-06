---
layout: post
title: "JavaScript Intl.NumberFormat - 숫자 포맷팅 라이브러리 없이 해결"
date: 2025-06-25 09:00:00 +0900
categories: [Development, Tips]
tags: [JavaScript, Intl, NumberFormat, formatting, i18n]
author: "Kevin Park"
lang: ko
excerpt: "JavaScript 내장 Intl.NumberFormat으로 통화, 천단위 구분, 퍼센트 포맷팅을 라이브러리 없이 처리하는 방법."
---

## 문제

숫자를 "1,000원"이나 "$1,234.56" 같은 형식으로 표시하려고 numeral.js나 accounting.js를 설치하고 있었다. 근데 브라우저에 이미 내장된 기능이 있었다.

## 해결

```javascript
// 한국 원화
new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW',
  minimumFractionDigits: 0,
}).format(15000);
// → "₩15,000"

// 천단위 구분
new Intl.NumberFormat('ko-KR').format(1234567);
// → "1,234,567"

// 미국 달러
new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
}).format(1234.5);
// → "$1,234.50"

// 퍼센트
new Intl.NumberFormat('ko-KR', {
  style: 'percent',
  minimumFractionDigits: 1,
}).format(0.1234);
// → "12.3%"
```

## 핵심 포인트

- `Intl.NumberFormat`은 모든 모던 브라우저와 Node.js에서 지원된다. IE11도 기본 기능은 된다.
- `currency: 'KRW'`로 하면 소수점 없이 표시되고, `'USD'`면 자동으로 소수점 2자리가 붙는다. 각 통화의 관례를 알아서 따른다.
- 같은 포맷을 반복 사용하면 인스턴스를 변수에 저장해두는 게 성능상 좋다. 매번 `new` 하는 건 낭비다.
