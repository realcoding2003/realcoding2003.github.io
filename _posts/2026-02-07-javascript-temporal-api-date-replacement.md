---
layout: post
title: "JavaScript Temporal API로 날짜 다루기 - Date 객체는 이제 그만"
date: 2026-02-07 09:00:00 +0900
categories: [Development, Tips]
tags: [JavaScript, Temporal API, Date, TypeScript]
author: "Kevin Park"
lang: ko
excerpt: "Date 객체의 0부터 시작하는 month, mutable 문제를 Temporal API로 깔끔하게 해결하는 방법"
---

## 문제

JavaScript의 `Date` 객체, 쓸 때마다 짜증나는 부분이 한두 개가 아니다.

```javascript
// 2026년 1월 15일을 만들고 싶다
const date = new Date(2026, 0, 15); // month가 0부터?!
console.log(date.getMonth()); // 0 ← 1월인데 0이다

// 날짜를 바꿨더니 원본도 바뀐다
const original = new Date(2026, 0, 15);
const copy = original;
copy.setMonth(5);
console.log(original.getMonth()); // 5 ← 원본이 바뀌어버렸다
```

month가 0부터 시작하는 건 20년 넘게 개발자들을 괴롭혀 온 문제다. 거기에 mutable이라 원본이 의도치 않게 바뀌는 버그까지. 결국 moment.js, day.js 같은 라이브러리를 가져다 쓰는 게 당연해졌는데, 이제 드디어 네이티브 해결책이 나왔다.

## 해결

`Temporal` API가 Chrome 144(2026년 1월), Firefox 139(2025년 5월)부터 기본 지원된다. 라이브러리 없이 날짜를 제대로 다룰 수 있게 된 거다.

### 날짜 생성

```javascript
// PlainDate - 시간 없이 날짜만
const date = Temporal.PlainDate.from('2026-02-07');
const date2 = Temporal.PlainDate.from({ year: 2026, month: 2, day: 7 });

console.log(date.month); // 2 ← 드디어 2월이 2다!
console.log(date.dayOfWeek); // 6 (토요일)

// PlainTime - 날짜 없이 시간만
const time = Temporal.PlainTime.from('14:30:00');
console.log(time.hour); // 14
```

### 날짜 연산

```javascript
const today = Temporal.PlainDate.from('2026-02-07');

// 30일 후
const later = today.add({ days: 30 });
console.log(later.toString()); // 2026-03-09

// 원본은 변하지 않는다 (immutable!)
console.log(today.toString()); // 2026-02-07

// 두 날짜 사이 기간
const start = Temporal.PlainDate.from('2026-01-01');
const end = Temporal.PlainDate.from('2026-02-07');
const diff = start.until(end);
console.log(diff.days); // 37
```

### 타임존 변환

```javascript
// 한국 시간으로 현재 시각
const now = Temporal.Now.zonedDateTimeISO('Asia/Seoul');
console.log(now.toString());
// 2026-02-07T14:30:00+09:00[Asia/Seoul]

// 뉴욕 시간으로 변환
const nyTime = now.withTimeZone('America/New_York');
console.log(nyTime.toString());
// 2026-02-07T00:30:00-05:00[America/New_York]
```

Date 객체로 타임존 변환하려면 온갖 삽질이 필요했는데, Temporal은 그냥 `withTimeZone()` 한 줄이면 끝이다.

## 핵심 포인트

- **month가 1부터 시작한다**: 1월 = 1, 12월 = 12. 20년 묵은 버그 원인이 사라졌다
- **immutable이다**: `add()`, `subtract()` 등 모든 연산이 새 객체를 반환한다. 원본이 바뀌는 사고가 원천 차단된다
- **용도별 타입 분리**: `PlainDate`(날짜만), `PlainTime`(시간만), `ZonedDateTime`(타임존 포함) 등 필요한 것만 쓰면 된다
- **브라우저 지원**: Chrome 144+, Firefox 139+에서 사용 가능. Safari는 아직이라 프로덕션에서는 `@js-temporal/polyfill` 폴리필을 함께 쓰는 게 안전하다
