---
layout: post
title: "Handling Fetch Timeouts with Node.js AbortController"
date: 2026-02-02 09:00:00 +0900
categories: [Development, Tips]
tags: [Node.js, AbortController, fetch, timeout]
author: "Kevin Park"
lang: en
slug: nodejs-abortcontroller-fetch-timeout
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2026/02/02/nodejs-abortcontroller-fetch-timeout-en/
  - /2026/02/02/nodejs-abortcontroller-fetch-timeout-en/
excerpt: "A clean pattern for adding timeouts to fetch requests using AbortController in Node.js."
---

## Problem

When calling external APIs, requests can hang indefinitely if the server doesn't respond. A slow or failing third-party API takes your service down with it. The `setTimeout` + `Promise.race` workaround results in messy code.

## Solution

`AbortController` provides a clean way to add timeouts to fetch requests.

```javascript
async function fetchWithTimeout(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Usage
const data = await fetchWithTimeout('https://api.example.com/users', 3000);
```

Node.js 20+ offers an even simpler approach with `AbortSignal.timeout()`:

```javascript
// One line is all you need
const response = await fetch('https://api.example.com/users', {
  signal: AbortSignal.timeout(3000),
});
```

Cancelling multiple requests at once is also straightforward:

```javascript
async function fetchMultiple(urls) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const results = await Promise.all(
      urls.map((url) =>
        fetch(url, { signal: controller.signal }).then((r) => r.json())
      )
    );
    return results;
  } catch (error) {
    controller.abort(); // Cancel all remaining requests if one fails
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
```

## Key Points

- `AbortController` works with more than fetch — it's supported by `addEventListener`, `ReadableStream`, and more
- `AbortSignal.timeout()` (Node.js 20+) requires no manual cleanup, eliminating memory leak concerns
- A single controller can cancel multiple requests simultaneously, making it ideal for parallel request management
