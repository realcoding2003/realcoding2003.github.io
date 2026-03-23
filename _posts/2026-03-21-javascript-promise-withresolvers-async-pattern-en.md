---
layout: post
title: "Clean Up Async Code with JavaScript Promise.withResolvers()"
date: 2026-03-21 09:00:00 +0900
categories: [Development, Tips]
tags: [JavaScript, Promise, async, ES2024]
author: "Kevin Park"
lang: en
excerpt: "Escape the Promise constructor callback pattern with Promise.withResolvers()"
---

## Problem

Sometimes you need to create a Promise manually — wrapping event-based APIs, converting timers, or building deferred patterns.

The traditional approach looks like this:

```javascript
let resolve, reject;
const promise = new Promise((res, rej) => {
  resolve = res;
  reject = rej;
});

// Use resolve/reject externally
someEmitter.on('done', resolve);
someEmitter.on('error', reject);
```

Declaring `let` variables and assigning them inside a callback just to extract `resolve` and `reject`. It works, but it's awkward.

## Solution

`Promise.withResolvers()` does this in a single line:

```javascript
const { promise, resolve, reject } = Promise.withResolvers();

someEmitter.on('done', resolve);
someEmitter.on('error', reject);
```

You get `promise`, `resolve`, and `reject` all at once via destructuring.

Here's a practical pattern for request-response over WebSockets:

```javascript
function createDeferredRequest() {
  const { promise, resolve, reject } = Promise.withResolvers();

  const timeout = setTimeout(() => {
    reject(new Error('Request timeout'));
  }, 5000);

  return {
    promise,
    complete(data) {
      clearTimeout(timeout);
      resolve(data);
    },
    fail(error) {
      clearTimeout(timeout);
      reject(error);
    }
  };
}

// Usage
const req = createDeferredRequest();
ws.send(message);
ws.onmessage = (e) => req.complete(JSON.parse(e.data));
const result = await req.promise;
```

## Key Points

- `Promise.withResolvers()` returns a `{ promise, resolve, reject }` object
- No constructor callback needed — you get resolve/reject references directly
- Supported in Chrome 119+, Firefox 121+, Safari 17.4+, Node.js 22+
- Perfect for any scenario requiring the Deferred pattern
