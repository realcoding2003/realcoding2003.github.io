---
layout: post
title: "Generate UUIDs in Node.js Without the uuid Package"
date: 2026-03-09 09:00:00 +0900
categories: [Development, Tips]
tags: [Node.js, UUID, crypto, dependencies]
author: "Kevin Park"
lang: en
excerpt: "crypto.randomUUID() is built-in — no need for the uuid package anymore"
---

## Problem

Every project that needs UUIDs pulls in the `uuid` package. Adding an external dependency just for UUID v4 generation feels unnecessary.

```bash
npm install uuid
```

```javascript
const { v4: uuidv4 } = require('uuid');
const id = uuidv4();
```

## Solution

Since Node.js 19 (and LTS 20+), `crypto.randomUUID()` is available globally. No package install needed.

```javascript
// Node.js 19+ / all modern browsers
const id = crypto.randomUUID();
// 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'
```

No `require` needed — `crypto` is on the global object.

For older versions (Node 14.17–18), you need the require:

```javascript
// Node 14.17 – 18
const { randomUUID } = require('crypto');
const id = randomUUID();
```

Works in browsers too:

```javascript
// All modern browsers
const id = self.crypto.randomUUID();
```

A compatibility helper if you need one:

```javascript
function generateUUID() {
  // Global crypto (Node 19+ / browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Node 14.17+
  return require('crypto').randomUUID();
}
```

## Key Points

- `crypto.randomUUID()` generates RFC 4122 compliant UUID v4 — identical output to the `uuid` package
- Available globally on Node.js 20 LTS and above — zero external dependencies
- Supported in all modern browsers, so you can use the same approach across your full stack
