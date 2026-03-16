---
layout: post
title: "JavaScript Intl.NumberFormat - Format Numbers Without Libraries"
date: 2025-06-25 09:00:00 +0900
categories: [Development, Tips]
tags: [JavaScript, Intl, NumberFormat, formatting, i18n]
author: "Kevin Park"
lang: en
slug: javascript-intl-numberformat
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2025/06/25/javascript-intl-numberformat-en/
  - /2025/06/25/javascript-intl-numberformat-en/
excerpt: "Use the built-in Intl.NumberFormat API for currency, thousands separators, and percentage formatting without external libraries."
---

## Problem

Installing numeral.js or accounting.js just to display "1,000" or "$1,234.56". There's a built-in browser API that handles this already.

## Solution

```javascript
// Korean Won
new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW',
  minimumFractionDigits: 0,
}).format(15000);
// → "₩15,000"

// Thousands separator
new Intl.NumberFormat('ko-KR').format(1234567);
// → "1,234,567"

// US Dollar
new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
}).format(1234.5);
// → "$1,234.50"

// Percentage
new Intl.NumberFormat('ko-KR', {
  style: 'percent',
  minimumFractionDigits: 1,
}).format(0.1234);
// → "12.3%"
```

## Key Points

- `Intl.NumberFormat` is supported in all modern browsers and Node.js. Even IE11 handles the basics.
- `currency: 'KRW'` displays without decimals, while `'USD'` automatically adds 2 decimal places. Each currency follows its own conventions.
- For repeated use, store the formatter instance in a variable. Creating `new` instances every time is wasteful.
