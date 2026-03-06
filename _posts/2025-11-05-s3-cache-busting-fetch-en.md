---
layout: post
title: "S3 Cache Busting - Always Fetch the Latest File"
date: 2025-11-05 09:00:00 +0900
categories: [Development, Tips]
tags: [AWS, S3, cache, fetch, CDN]
author: "Kevin Park"
lang: en
excerpt: "Fix stale S3 config files caused by browser/CDN caching with three cache-busting techniques."
---

## Problem

Updated config.json on S3, but the browser keeps showing the cached old version. With CloudFront CDN in the mix, it takes even longer to refresh.

## Solution

```javascript
// Method 1: Timestamp query parameter (simplest)
function addCacheBuster(url) {
  const t = new Date().getTime();
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}_t=${t}`;
}

// Method 2: fetch options + headers (bypass browser cache)
const response = await fetch(addCacheBuster(CONFIG_URL), {
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
  cache: 'no-store'
});

// Method 3: S3 object metadata (server-side)
// aws s3 cp config.json s3://bucket/ \
//   --cache-control "no-cache, no-store, must-revalidate"
```

## Key Points

- Adding `?_t=1234567890` solves most cases. CDNs treat different URLs as different files.
- `cache: 'no-store'` disables the fetch API cache. `Cache-Control` headers disable the browser HTTP cache. Use both for certainty.
- Only disable caching for frequently changing files. Disabling cache on static assets (CSS/JS) hurts performance.
