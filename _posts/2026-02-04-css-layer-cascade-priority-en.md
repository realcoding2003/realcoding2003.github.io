---
layout: post
title: "Organizing CSS Priority with @layer"
date: 2026-02-04 09:00:00 +0900
categories: [Development, Tips]
tags: [CSS, layer, cascade, architecture]
author: "Kevin Park"
lang: en
slug: css-layer-cascade-priority
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2026/02/04/css-layer-cascade-priority-en/
  - /2026/02/04/css-layer-cascade-priority-en/
excerpt: "Use CSS @layer to take explicit control over cascade priority and end specificity wars."
---

## Problem

As projects grow, CSS priority becomes a mess. Library CSS, reset CSS, component CSS, and utility CSS clash with each other, leading to `!important` abuse. You lose specificity battles, write more complex selectors to win, and the cycle continues.

## Solution

`@layer` lets you control cascade priority at the layer level explicitly.

```css
/* Declare layer order - later layers have higher priority */
@layer reset, base, components, utilities;

@layer reset {
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
}

@layer base {
  body {
    font-family: system-ui, sans-serif;
    line-height: 1.6;
  }
  a {
    color: #3b82f6;
  }
}

@layer components {
  .card {
    padding: 1rem;
    border-radius: 8px;
    background: white;
  }
  .card a {
    color: #1e40af; /* Automatically wins over base's a style */
  }
}

@layer utilities {
  .text-red { color: red; } /* Wins over any component style */
}
```

You can also isolate third-party CSS into a layer:

```css
@layer reset, vendor, components, utilities;

/* Isolate external CSS in the vendor layer */
@import url('tailwind.css') layer(vendor);

@layer components {
  /* Always wins over vendor - no !important needed */
  .my-button {
    background: #3b82f6;
  }
}
```

## Key Points

- Layer declaration order determines priority — later layers win
- Selector specificity inside a layer is ignored in cross-layer comparisons. A highly specific `.card a` in a lower layer still loses to a simple `a` in a higher layer
- Use `layer()` with `@import` to isolate third-party CSS, enabling overrides without `!important`
