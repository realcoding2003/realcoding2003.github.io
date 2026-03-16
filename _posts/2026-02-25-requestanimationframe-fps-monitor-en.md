---
layout: post
title: "Build an FPS Monitor with requestAnimationFrame"
date: 2026-02-25 09:00:00 +0900
categories: [Development, Tips]
tags: [JavaScript, requestAnimationFrame, FPS, performance, monitoring]
author: "Kevin Park"
lang: en
slug: requestanimationframe-fps-monitor
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2026/02/25/requestanimationframe-fps-monitor-en/
  - /2026/02/25/requestanimationframe-fps-monitor-en/
excerpt: "Measure real-time FPS in web apps using requestAnimationFrame and detect performance degradation."
---

## Problem

Web app animations or real-time updates feel sluggish, but there's no way to measure the actual FPS.

## Solution

```javascript
class FPSMonitor {
  constructor(onLowFPS) {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.lowFpsCount = 0;
    this.onLowFPS = onLowFPS;
    this.running = false;
  }

  start() {
    this.running = true;
    this.tick();
  }

  tick() {
    if (!this.running) return;
    this.frameCount++;
    const now = performance.now();
    const delta = now - this.lastTime;

    if (delta >= 1000) {
      const fps = Math.round((this.frameCount * 1000) / delta);
      if (fps < 30) {
        this.lowFpsCount++;
        if (this.lowFpsCount >= 3) this.onLowFPS(fps);
      } else {
        this.lowFpsCount = 0;
      }
      this.frameCount = 0;
      this.lastTime = now;
    }
    requestAnimationFrame(() => this.tick());
  }

  stop() { this.running = false; }
}
```

## Key Points

- `requestAnimationFrame` fires just before the browser paints the next frame. 60 calls per second = 60fps.
- Count frames per second to calculate FPS. Alerting only after 3 consecutive seconds below 30fps reduces false positives.
- `performance.now()` is more precise than `Date.now()` — microsecond resolution is ideal for FPS measurement.
