---
layout: post
title: "Next.js API Proxy with rewrites for Microservices"
date: 2026-03-02 09:00:00 +0900
categories: [Development, Tips]
tags: [Next.js, rewrites, proxy, microservice, API]
author: "Kevin Park"
lang: en
excerpt: "Use Next.js rewrites to proxy multiple backend microservices behind a single domain — no CORS headaches."
---

## Problem

One Next.js frontend, multiple backend microservices on different ports. Calling them directly from the client means dealing with CORS configuration for every service.

## Solution

```javascript
// next.config.js
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/proxy/token/:path*',
        destination: 'http://127.0.0.1:3001/:path*',
      },
      {
        source: '/api/proxy/file/:path*',
        destination: 'http://127.0.0.1:3002/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
```

The client calls `/api/proxy/token/verify` and Next.js proxies it server-side to `http://127.0.0.1:3001/verify`.

## Key Points

- `rewrites` changes the destination without changing the URL visible to the client. Unlike `redirects`, the proxy is transparent.
- `:path*` is a wildcard that forwards all sub-paths. `/api/proxy/token/a/b/c` maps to `http://127.0.0.1:3001/a/b/c`.
- Since requests originate from the same domain, no CORS configuration is needed. Especially convenient during development.
