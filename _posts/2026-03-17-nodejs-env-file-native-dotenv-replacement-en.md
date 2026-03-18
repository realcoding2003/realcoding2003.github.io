---
layout: post
title: "Node.js --env-file: Native .env Support Without dotenv"
date: 2026-03-17 09:00:00 +0900
categories: [Development, Tips]
tags: [Node.js, env, dotenv, Environment-Variables]
author: "Kevin Park"
lang: en
slug: nodejs-env-file-native-dotenv-replacement
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2026/03/17/nodejs-env-file-native-dotenv-replacement-en/
  - /2026/03/17/nodejs-env-file-native-dotenv-replacement-en/
excerpt: "Node.js 20.6+ has a built-in --env-file flag that loads .env files natively. No more dotenv dependency."
---

## Problem

Every Node.js project starts with `npm install dotenv` and a `require('dotenv').config()` call at the entry point. It works, but it's yet another runtime dependency that reads and parses a file on startup.

## Solution

Node.js 20.6+ ships with a native `--env-file` flag.

```bash
# Basic usage
node --env-file=.env app.js

# Multiple files
node --env-file=.env --env-file=.env.local app.js
```

The `.env` file format is the same as before:

```
DATABASE_URL=postgresql://localhost:5432/mydb
API_KEY=sk-1234567890
NODE_ENV=development
```

Access variables through `process.env` as usual — no imports needed.

```javascript
// No dotenv import required
const dbUrl = process.env.DATABASE_URL;
console.log(dbUrl); // postgresql://localhost:5432/mydb
```

Node.js 20.12+ also supports programmatic loading:

```javascript
// Load dynamically at runtime
process.loadEnvFile('.env');

// Parse env string directly
const { parseEnv } = require('node:util');
const vars = parseEnv('KEY=value\nFOO=bar');
console.log(vars.KEY); // "value"
```

Your `package.json` scripts get cleaner too:

```json
{
  "scripts": {
    "dev": "node --env-file=.env --watch app.js",
    "prod": "node --env-file=.env.production app.js"
  }
}
```

## Key Points

- Node.js 20.6+ `--env-file` flag loads `.env` files natively
- No `dotenv` package or `require` call needed
- 20.12+ adds `process.loadEnvFile()` for dynamic loading
- Multiple env files can be chained; later files override earlier ones
- Projects on Node.js < 20 still need dotenv
