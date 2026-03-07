---
layout: post
title: "CORS Error Complete Guide - From Cause to Next.js/Express Setup"
date: 2026-02-18 09:00:00 +0900
categories: [Development, Tips]
tags: [CORS, Next.js, Express, API, Security, HTTP]
author: "Kevin Park"
lang: en
excerpt: "When a CORS error shows up in your browser console, here's everything you need to fix it."
---

## Problem

Calling an API from the frontend triggers this browser console error:

```
Access to fetch at 'http://api.example.com/data' from origin 'http://localhost:3000'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
on the requested resource.
```

The server works fine — it's only blocked in the browser.

## Solution

CORS is a browser security policy that blocks requests to different origins. The fix is sending the right headers from the server.

### Express

```javascript
const cors = require('cors');

// Allow all origins (development only)
app.use(cors());

// Allow specific origins (production)
app.use(cors({
  origin: ['https://myapp.com', 'https://www.myapp.com'],
  credentials: true
}));
```

### Next.js API Route

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://myapp.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization' },
        ],
      },
    ];
  },
};
```

### Next.js Rewrites (Proxy Approach)

```javascript
// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://api.example.com/:path*',
      },
    ];
  },
};
```

This makes the browser think the request goes to the same origin, so CORS never triggers.

## Key Points

- CORS is a browser security policy, not a server bug. That's why Postman and curl work fine but the browser doesn't.
- Using `cors()` with no options is fine for development. In production, always specify the `origin` explicitly.
- When using `credentials: true`, you cannot set `origin: '*'`. A specific domain is required.
- Next.js rewrites bypass CORS entirely by proxying requests through the same origin. It's the simplest approach when you control the frontend.
