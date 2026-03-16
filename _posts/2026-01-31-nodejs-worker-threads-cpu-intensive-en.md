---
layout: post
title: "Offload CPU-Intensive Tasks with Node.js worker_threads"
date: 2026-01-31 09:00:00 +0900
categories: [Development, Tips]
tags: [Node.js, worker_threads, Performance, Backend]
author: "Kevin Park"
lang: en
excerpt: "How to use Node.js worker_threads to run heavy computations without blocking the main event loop."
---

## Problem

Running CPU-intensive operations like image processing or large JSON parsing in Node.js blocks the event loop. Your API stops responding, and all other requests queue up.

## Solution

Use the built-in `worker_threads` module to offload heavy computation to a separate thread.

```javascript
// worker.js
const { parentPort, workerData } = require('worker_threads');

function heavyCalculation(data) {
  let result = 0;
  for (let i = 0; i < data.iterations; i++) {
    result += Math.sqrt(i) * Math.random();
  }
  return result;
}

const result = heavyCalculation(workerData);
parentPort.postMessage(result);
```

```javascript
// main.js
const { Worker } = require('worker_threads');

function runWorker(data) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./worker.js', { workerData: data });
    worker.on('message', resolve);
    worker.on('error', reject);
  });
}

app.get('/heavy', async (req, res) => {
  const result = await runWorker({ iterations: 10_000_000 });
  res.json({ result });
  // Other requests continue to be served normally
});
```

For repeated tasks, use a worker pool to avoid creation overhead:

```javascript
const os = require('os');
const poolSize = os.cpus().length;
const workers = Array.from({ length: poolSize },
  () => new Worker('./worker.js')
);
```

## Key Points

- `worker_threads` is built into Node.js — no external dependencies needed
- Pass data via `workerData`, return results via `parentPort.postMessage()`
- The main event loop stays unblocked, keeping API responsiveness intact
- Use worker pools for repeated tasks to reduce thread creation overhead
