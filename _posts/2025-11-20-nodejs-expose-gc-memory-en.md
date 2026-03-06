---
layout: post
title: "Node.js --expose-gc for Memory Leak Debugging"
date: 2025-11-20 09:00:00 +0900
categories: [Development, Tips]
tags: [Node.js, memory, garbage collection, debugging, performance]
author: "Kevin Park"
lang: en
excerpt: "Use Node.js --expose-gc flag to trigger manual GC and identify real memory leaks."
---

## Problem

Long-running Node.js apps (MQTT clients, batch processors) show increasing memory usage. Hard to tell if GC is working properly or if there's a real leak.

## Solution

```bash
# --expose-gc enables global.gc()
node --expose-gc app.js

# In Docker
CMD ["node", "--expose-gc", "--max-old-space-size=512", "dist/index.js"]
```

```javascript
function logMemory(label) {
  if (global.gc) global.gc(); // force GC
  const usage = process.memoryUsage();
  console.log(`[${label}] Heap: ${Math.round(usage.heapUsed / 1024 / 1024)}MB / ${Math.round(usage.heapTotal / 1024 / 1024)}MB`);
}

logMemory('start');
await processLargeData();
logMemory('after');  // if heap doesn't shrink after GC → leak
```

## Key Points

- If `heapUsed` keeps growing after `global.gc()`, it's a real memory leak — objects are referenced somewhere GC can't reach.
- `--max-old-space-size=512` limits heap size so leaks trigger OOM errors faster, making them easier to catch.
- Don't use `--expose-gc` in production. Manual GC impacts performance. Use it only for debugging.
