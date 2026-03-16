---
layout: post
title: "JavaScript UTC to KST Conversion - 3 Utility Functions for Production"
date: 2025-01-10 09:00:00 +0900
categories: [Development, Tips]
tags: [JavaScript, UTC, KST, timezone, Date]
author: "Kevin Park"
lang: en
slug: javascript-utc-korea-time-conversion
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2025/01/10/javascript-utc-korea-time-conversion-en/
  - /2025/01/10/javascript-utc-korea-time-conversion-en/
excerpt: "Convert between UTC and Korean Standard Time (KST) in JavaScript without external libraries."
---

## Problem

Your backend stores timestamps in UTC, but the frontend needs to display Korean time (KST, UTC+9). `toLocaleString` behavior varies across browsers, so manual conversion is safer.

## Solution

```javascript
// 1. Korea date string → UTC date
function toUtcDate(koreaDateStr) {
  const date = new Date(koreaDateStr + 'T00:00:00+09:00');
  return date.toISOString().split('T')[0];
}

// 2. UTC timestamp → Korea date
function toKoreaDate(utcTimestamp) {
  const date = new Date(utcTimestamp);
  if (isNaN(date.getTime())) return '';
  const koreaTime = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return koreaTime.toISOString().split('T')[0];
}

// 3. UTC date range for a single Korea day (for API queries)
function getUtcDateRange(koreaDateStr) {
  const startUtc = toUtcDate(koreaDateStr);
  const nextDay = new Date(koreaDateStr + 'T00:00:00+09:00');
  nextDay.setDate(nextDay.getDate() + 1);
  const endUtc = toUtcDate(nextDay.toISOString().split('T')[0]);
  return [startUtc, endUtc];
}
```

## Key Points

- Midnight in Korea (00:00 KST) is 15:00 UTC the previous day. When querying by date, you need a 2-day UTC range to avoid missing data.
- Appending `+09:00` offset directly during parsing eliminates the need for timezone libraries.
- Adding `9 * 60 * 60 * 1000` (32,400,000ms) is simple and works perfectly for Korea since it doesn't observe DST.
