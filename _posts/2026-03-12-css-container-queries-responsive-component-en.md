---
layout: post
title: "CSS Container Queries: Component-Level Responsive Design"
date: 2026-03-12 09:00:00 +0900
categories: [Development, Tips]
tags: [CSS, container queries, responsive, component]
author: "Kevin Park"
lang: en
excerpt: "Use @container instead of media queries to make components responsive based on their parent size"
---

## Problem

You have a card component styled with media queries for responsive layout. It works fine in the main content area, but breaks when placed in a narrow sidebar — because media queries are based on the viewport, not the component's actual available space.

## Solution

CSS Container Queries let you apply styles based on the parent container's size instead of the viewport.

```css
/* Register the parent as a container */
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}

/* Style based on container width */
.card {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@container card (min-width: 400px) {
  .card {
    grid-template-columns: 200px 1fr;
  }
}

@container card (min-width: 700px) {
  .card {
    grid-template-columns: 300px 1fr;
    font-size: 1.1rem;
  }
}
```

The `.card` component now adapts to wherever it's placed — sidebar, main area, or modal — based on its parent's width.

There are three `container-type` values:

```css
container-type: inline-size;  /* Track width only (most common) */
container-type: size;         /* Track both width and height */
container-type: normal;       /* Default, not a query target */
```

Shorthand syntax:

```css
/* container-name + container-type combined */
.wrapper {
  container: card / inline-size;
}
```

## Key Points

- `@container` queries respond to the parent container's size, making them ideal for reusable components
- Browser support is over 95% (Chrome 105+, Firefox 110+, Safari 16+) — production-ready
- `container-type: inline-size` covers most use cases; use `size` only when you need height-based queries
