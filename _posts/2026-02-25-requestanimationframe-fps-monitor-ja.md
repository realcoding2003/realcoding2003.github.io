---
layout: post
title: "requestAnimationFrameでFPSモニタリングを実装する"
date: 2026-02-25 09:00:00 +0900
categories: [Development, Tips]
tags: [JavaScript, requestAnimationFrame, FPS, performance, monitoring]
author: "Kevin Park"
lang: ja
slug: requestanimationframe-fps-monitor
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /ja/2026/02/25/requestanimationframe-fps-monitor-ja/
  - /2026/02/25/requestanimationframe-fps-monitor-ja/
excerpt: "requestAnimationFrameを使用してWebアプリのリアルタイムFPSを測定し、パフォーマンス低下を検知する方法をご紹介します。"
---

## 問題

Webアプリでアニメーションやリアルタイムデータ更新がカクつくのに、実際のFPSがどの程度出ているか測定する方法が必要です。

## 解決方法

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

## ポイント

- `requestAnimationFrame`はブラウザが次の画面を描画する直前に呼ばれます。1秒に60回呼ばれれば60fpsです。
- 1秒ごとにフレーム数を数えてFPSを計算します。一時的なドロップは無視し、3秒連続で30fps未満の場合のみ警告すれば誤検知が減ります。
- `performance.now()`は`Date.now()`より精密です。マイクロ秒単位なのでFPS計算に適しています。
