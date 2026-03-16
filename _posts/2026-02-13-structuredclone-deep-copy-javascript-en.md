---
layout: post
title: "Deep Copy in JavaScript with structuredClone"
date: 2026-02-13 09:00:00 +0900
categories: [Development, Tips]
tags: [JavaScript, Node.js, Deep Copy, structuredClone]
author: "Kevin Park"
lang: en
slug: structuredclone-deep-copy-javascript
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2026/02/13/structuredclone-deep-copy-javascript-en/
  - /2026/02/13/structuredclone-deep-copy-javascript-en/
excerpt: "Stop using JSON.parse(JSON.stringify()). structuredClone is the native deep copy solution."
---

## Problem

The classic deep copy hack in JavaScript has some serious pitfalls.

```javascript
const obj = {
  date: new Date(),
  func: () => 'hello',
  undef: undefined,
  regex: /test/gi,
};

const copy = JSON.parse(JSON.stringify(obj));
console.log(copy);
// { date: "2026-02-13T00:00:00.000Z", regex: {} }
// func and undef are gone, date became a string
```

`Date` gets converted to a string, `undefined` and functions are silently dropped, and circular references throw errors.

## Solution

Use `structuredClone`. It's supported in all modern browsers and Node.js 17+.

```javascript
const original = {
  date: new Date(),
  nested: { a: 1, b: [2, 3] },
  set: new Set([1, 2, 3]),
  map: new Map([['key', 'value']]),
};

const copy = structuredClone(original);

copy.nested.a = 999;
console.log(original.nested.a); // 1 — original unchanged
console.log(copy.date instanceof Date); // true — Date preserved
console.log(copy.set instanceof Set); // true — Set preserved
```

Circular references work out of the box:

```javascript
const obj = { name: 'test' };
obj.self = obj;

const copy = structuredClone(obj); // no error
```

## Key Points

- `JSON.parse(JSON.stringify())` fails with `Date`, `Set`, `Map`, `RegExp`, and `undefined`
- `structuredClone` correctly copies most built-in types
- Functions, DOM nodes, and `Symbol` cannot be cloned even with `structuredClone`
- No more need for lodash `cloneDeep` — native deep copy is here
