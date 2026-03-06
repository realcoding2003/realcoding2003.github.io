---
layout: post
title: "Vite Monorepo - Allow Parent Directory Access with server.fs.allow"
date: 2026-01-10 09:00:00 +0900
categories: [Development, Tips]
tags: [Vite, monorepo, config, SvelteKit, fs]
author: "Kevin Park"
lang: en
excerpt: "Fix 'request url outside of Vite serving allow list' in monorepos using server.fs.allow."
---

## Problem

In a monorepo, when a sub-package imports shared modules from a parent directory, Vite blocks it: `The request url is outside of Vite serving allow list`.

## Solution

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import path from 'path';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: 5174,
    fs: {
      allow: [
        // allow parent directory access (monorepo root)
        path.resolve(__dirname, '..'),
      ],
    },
  },
});
```

## Key Points

- Vite blocks file access outside the project root for security. In monorepos, this becomes a problem since shared packages live in parent directories.
- Adding a path to `server.fs.allow` enables serving files from that directory. `..` allows one level up.
- This setting only affects the dev server (`vite dev`), not production builds. The bundler handles it during build.
