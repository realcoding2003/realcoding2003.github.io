---
layout: post
title: "Using __dirname in ES Modules - import.meta.url Approach"
date: 2026-01-05 09:00:00 +0900
categories: [Development, Tips]
tags: [Node.js, ESM, ES Modules, dirname, import.meta]
author: "Kevin Park"
lang: en
excerpt: "Get __dirname and __filename in ES Modules using import.meta.url and fileURLToPath."
---

## Problem

With `"type": "module"` in package.json or `.mjs` files, `__dirname` and `__filename` are undefined. You get `ReferenceError: __dirname is not defined`.

## Solution

```javascript
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use as usual
const configPath = path.resolve(__dirname, '../config/settings.json');
const dataDir = path.join(__dirname, '../../data');
```

## Key Points

- `import.meta.url` returns the current file's URL as `file:///Users/...`. Convert it with `fileURLToPath` to get a regular path for `path.join` etc.
- This is the first issue you hit when migrating from CommonJS to ESM. Two lines at the top of the file, and the rest of your code works as-is.
- Node.js 20.11+ has built-in `import.meta.dirname` and `import.meta.filename`. But the above approach is safer for backward compatibility.
