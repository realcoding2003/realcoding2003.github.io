---
layout: post
title: "JavaScript UTC 한국시간(KST) 변환 - 실무에서 자주 쓰는 3가지 함수"
date: 2025-01-10 09:00:00 +0900
categories: [Development, Tips]
tags: [JavaScript, UTC, KST, timezone, Date]
author: "Kevin Park"
lang: ko
excerpt: "JavaScript에서 UTC와 한국시간(KST) 사이를 변환하는 실무 코드. toLocaleString 없이 직접 변환하는 방법."
---

## 문제

백엔드는 UTC로 저장하는데, 프론트엔드에서는 한국시간으로 보여줘야 한다. `toLocaleString`은 브라우저마다 결과가 다를 수 있어서 직접 변환하는 게 안전하다.

## 해결

```javascript
// 1. 한국 날짜 문자열 → UTC 날짜
function toUtcDate(koreaDateStr) {
  const date = new Date(koreaDateStr + 'T00:00:00+09:00');
  return date.toISOString().split('T')[0];
}

// 2. UTC 타임스탬프 → 한국 날짜
function toKoreaDate(utcTimestamp) {
  const date = new Date(utcTimestamp);
  if (isNaN(date.getTime())) return '';
  const koreaTime = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return koreaTime.toISOString().split('T')[0];
}

// 3. 한국 날짜 하루의 UTC 범위 (API 조회용)
function getUtcDateRange(koreaDateStr) {
  const startUtc = toUtcDate(koreaDateStr);
  const nextDay = new Date(koreaDateStr + 'T00:00:00+09:00');
  nextDay.setDate(nextDay.getDate() + 1);
  const endUtc = toUtcDate(nextDay.toISOString().split('T')[0]);
  return [startUtc, endUtc];
}
```

## 핵심 포인트

- 한국 자정(00:00 KST)은 전날 15:00 UTC다. 그래서 날짜 기준 조회할 때 UTC 범위를 2일치로 잡아야 데이터가 빠지지 않는다.
- `+09:00` 오프셋을 직접 붙여서 파싱하면 타임존 라이브러리 없이도 정확하게 변환된다.
- `9 * 60 * 60 * 1000` (32,400,000ms)를 더하는 건 단순하지만 서머타임이 없는 한국에서는 완벽하게 동작한다.
