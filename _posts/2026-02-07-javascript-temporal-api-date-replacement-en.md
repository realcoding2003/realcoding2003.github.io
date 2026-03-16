---
layout: post
title: "JavaScript Temporal API - Finally a Proper Date Replacement"
date: 2026-02-07 09:00:00 +0900
categories: [Development, Tips]
tags: [JavaScript, Temporal API, Date, TypeScript]
author: "Kevin Park"
lang: en
slug: javascript-temporal-api-date-replacement
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2026/02/07/javascript-temporal-api-date-replacement-en/
  - /2026/02/07/javascript-temporal-api-date-replacement-en/
excerpt: "How to use the Temporal API to replace JavaScript's broken Date object with immutable, timezone-aware date handling"
---

## Problem

JavaScript's `Date` object has frustrated developers for over two decades.

```javascript
// Create January 15, 2026
const date = new Date(2026, 0, 15); // month starts from 0?!
console.log(date.getMonth()); // 0 ← It's January, but returns 0

// Mutating a reference changes the original
const original = new Date(2026, 0, 15);
const copy = original;
copy.setMonth(5);
console.log(original.getMonth()); // 5 ← original is mutated
```

Zero-indexed months and mutable objects have been a constant source of bugs. Most teams ended up depending on libraries like moment.js or day.js just to handle dates sanely. Now there's a native solution.

## Solution

The `Temporal` API ships natively in Chrome 144 (January 2026) and Firefox 139 (May 2025). No libraries needed.

### Creating Dates

```javascript
// PlainDate - date without time
const date = Temporal.PlainDate.from('2026-02-07');
const date2 = Temporal.PlainDate.from({ year: 2026, month: 2, day: 7 });

console.log(date.month); // 2 ← February is actually 2!
console.log(date.dayOfWeek); // 6 (Saturday)

// PlainTime - time without date
const time = Temporal.PlainTime.from('14:30:00');
console.log(time.hour); // 14
```

### Date Arithmetic

```javascript
const today = Temporal.PlainDate.from('2026-02-07');

// 30 days later
const later = today.add({ days: 30 });
console.log(later.toString()); // 2026-03-09

// Original stays unchanged (immutable!)
console.log(today.toString()); // 2026-02-07

// Duration between two dates
const start = Temporal.PlainDate.from('2026-01-01');
const end = Temporal.PlainDate.from('2026-02-07');
const diff = start.until(end);
console.log(diff.days); // 37
```

### Timezone Conversion

```javascript
// Current time in Seoul
const now = Temporal.Now.zonedDateTimeISO('Asia/Seoul');
console.log(now.toString());
// 2026-02-07T14:30:00+09:00[Asia/Seoul]

// Convert to New York time
const nyTime = now.withTimeZone('America/New_York');
console.log(nyTime.toString());
// 2026-02-07T00:30:00-05:00[America/New_York]
```

Timezone conversion with `Date` required ugly workarounds. With Temporal, it's a single `withTimeZone()` call.

## Key Points

- **Months start from 1**: January = 1, December = 12. The most common off-by-one bug source is gone
- **Immutable by design**: Every operation like `add()` and `subtract()` returns a new object. No more accidental mutations
- **Purpose-built types**: `PlainDate` (date only), `PlainTime` (time only), `ZonedDateTime` (with timezone) — use exactly what you need
- **Browser support**: Available in Chrome 144+ and Firefox 139+. For Safari, use `@js-temporal/polyfill` in production
