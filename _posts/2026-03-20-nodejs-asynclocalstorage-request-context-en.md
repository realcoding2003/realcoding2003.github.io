---
layout: post
title: "Node.js AsyncLocalStorage - Stop Passing requestId Through Every Function"
date: 2026-03-20 09:00:00 +0900
categories: [Development, Tips]
tags: [Node.js, AsyncLocalStorage, Express, logging]
author: "Kevin Park"
lang: en
excerpt: "Use AsyncLocalStorage to manage Express request context cleanly without prop-drilling requestId."
---

## Problem

When implementing per-request logging in Express, you end up passing `requestId` through every function — service layer, DB layer, utilities, everything.

```javascript
app.get('/users/:id', (req, res) => {
  const requestId = crypto.randomUUID();
  const user = getUser(req.params.id, requestId);
  res.json(user);
});

function getUser(id, requestId) {
  logger.info(`[${requestId}] getUser called`);
  return queryDB(`SELECT * FROM users WHERE id = $1`, [id], requestId);
}

function queryDB(sql, params, requestId) {
  logger.info(`[${requestId}] query: ${sql}`);
  // ...
}
```

Every function signature is polluted with a parameter that has nothing to do with business logic.

## Solution

`AsyncLocalStorage` propagates context implicitly through async call chains. It's built into Node.js — no packages needed.

```javascript
const { AsyncLocalStorage } = require('node:async_hooks');
const crypto = require('node:crypto');

const asyncLocalStorage = new AsyncLocalStorage();

// Express middleware
function requestContext(req, res, next) {
  const store = {
    requestId: crypto.randomUUID(),
    method: req.method,
    path: req.path,
  };
  asyncLocalStorage.run(store, next);
}

app.use(requestContext);
```

Now access the context anywhere with `getStore()`.

```javascript
// Logger utility
function createLogger(module) {
  return {
    info(msg) {
      const store = asyncLocalStorage.getStore();
      const requestId = store?.requestId ?? 'no-context';
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        requestId,
        module,
        msg,
      }));
    }
  };
}

// Service layer - no more requestId parameter
const logger = createLogger('user-service');

function getUser(id) {
  logger.info(`getUser called: ${id}`);
  return queryDB(`SELECT * FROM users WHERE id = $1`, [id]);
}

function queryDB(sql, params) {
  logger.info(`query: ${sql}`);
  // ...
}
```

Logs from the same request share the same `requestId`, making debugging a single `grep` away.

## Key Points

- `AsyncLocalStorage` is stable since Node.js 16.4 — zero dependencies required
- All async code inside `run()` shares the same store: `setTimeout`, `Promise`, `async/await` all work
- Performance overhead is negligible. Node.js 23+ uses V8-native `AsyncContextFrame` for even better performance
- NestJS offers `ClsModule`, Fastify has `@fastify/request-context` — same pattern, different wrappers
- Beyond logging: use it for auth context, transaction IDs, or multi-tenant identification
