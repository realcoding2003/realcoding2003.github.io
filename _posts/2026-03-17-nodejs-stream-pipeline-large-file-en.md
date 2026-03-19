---
layout: post
title: "Node.js stream.pipeline - Process Large Files Without Memory Overflow"
date: 2026-03-17 09:00:00 +0900
categories: [Development, Tips]
tags: [Node.js, Stream, Pipeline, File Processing]
author: "Kevin Park"
lang: en
excerpt: "Use Node.js stream.pipeline to process large files in chunks without blowing up memory."
---

## Problem

Tried to read a multi-GB log file with `fs.readFile` and ran out of memory. Obvious in hindsight, but easy to forget.

```javascript
// This loads the entire file into memory
const data = await fs.promises.readFile('huge.log', 'utf-8');
```

## Solution

Use `stream.pipeline` to create a read-transform-write pipeline that processes data in chunks. Error handling and stream cleanup are automatic.

```javascript
const { pipeline } = require('stream/promises');
const fs = require('fs');
const zlib = require('zlib');

// Compress a large file while copying
await pipeline(
  fs.createReadStream('huge.log'),
  zlib.createGzip(),
  fs.createWriteStream('huge.log.gz')
);
```

For line-by-line processing, insert a Transform stream.

```javascript
const { Transform } = require('stream');

const lineFilter = new Transform({
  transform(chunk, encoding, callback) {
    const lines = chunk.toString().split('\n');
    const errors = lines
      .filter(line => line.includes('ERROR'))
      .join('\n');
    callback(null, errors ? errors + '\n' : '');
  }
});

await pipeline(
  fs.createReadStream('huge.log'),
  lineFilter,
  fs.createWriteStream('errors-only.log')
);
```

## Key Points

- `pipeline` from `stream/promises` works naturally with async/await
- On error, it automatically destroys all streams in the pipeline — the key advantage over `.pipe()` chaining
- Memory usage stays constant regardless of file size. Works the same for 10GB or 100GB files
