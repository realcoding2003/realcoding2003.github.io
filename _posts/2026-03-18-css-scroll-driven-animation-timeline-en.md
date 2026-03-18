---
layout: post
title: "CSS animation-timeline: scroll() — Scroll Animations Without JavaScript"
date: 2026-03-18 09:00:00 +0900
categories: [Development, Tips]
tags: [CSS, scroll-animation, animation-timeline, Frontend]
author: "Kevin Park"
lang: en
slug: css-scroll-driven-animation-timeline
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2026/03/18/css-scroll-driven-animation-timeline-en/
  - /2026/03/18/css-scroll-driven-animation-timeline-en/
excerpt: "Build a scroll progress bar with pure CSS using animation-timeline: scroll(). No JavaScript needed."
---

## Problem

Showing a scroll progress bar at the top of the page typically requires a `scroll` event listener and `requestAnimationFrame`. It works, but it's verbose and needs performance tuning.

## Solution

CSS `animation-timeline: scroll()` eliminates the need for JavaScript entirely.

```css
.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: #3b82f6;
  transform-origin: left;
  animation: grow-progress linear;
  animation-timeline: scroll();
}

@keyframes grow-progress {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
```

```html
<div class="progress-bar"></div>
```

That's it. `animation-timeline: scroll()` drives the animation based on scroll position instead of time.

For animating elements as they enter the viewport, use `view()`:

```css
.fade-in {
  animation: fade-in linear;
  animation-timeline: view();
  animation-range: entry 0% cover 40%;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

`animation-range` gives fine-grained control over when the animation starts and ends, using keywords like `entry`, `exit`, `cover`, and `contain`.

## Key Points

- `animation-timeline: scroll()` ties animation progress to scroll position
- `view()` triggers animations based on element viewport visibility
- `animation-range` controls the exact animation segment
- Stick to `transform` and `opacity` for compositor-thread rendering at 60fps
- Supported in Chrome, Edge, Safari 18+. Firefox still behind a flag
