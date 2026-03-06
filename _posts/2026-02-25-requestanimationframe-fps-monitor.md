---
layout: post
title: "requestAnimationFrame으로 FPS 모니터링 구현하기"
date: 2026-02-25 09:00:00 +0900
categories: [Development, Tips]
tags: [JavaScript, requestAnimationFrame, FPS, performance, monitoring]
author: "Kevin Park"
lang: ko
excerpt: "requestAnimationFrame을 사용해 웹 앱의 실시간 FPS를 측정하고 성능 저하를 감지하는 방법."
---

## 문제

웹 앱에서 애니메이션이나 실시간 데이터 업데이트가 버벅거리는데, 실제 FPS가 얼마나 나오는지 측정할 방법이 필요하다.

## 해결

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
        if (this.lowFpsCount >= 3) {
          this.onLowFPS(fps);  // 3초 연속 30fps 미만이면 알림
        }
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

// 사용
const monitor = new FPSMonitor((fps) => {
  console.warn(`성능 저하 감지: ${fps}fps`);
});
monitor.start();
```

## 핵심 포인트

- `requestAnimationFrame`은 브라우저가 다음 화면을 그리기 직전에 호출된다. 1초에 60번 호출되면 60fps인 거다.
- 1초마다 프레임 수를 세서 FPS를 계산한다. 순간적인 드롭은 무시하고 3초 연속 30fps 미만일 때만 경고하면 오탐이 줄어든다.
- `performance.now()`는 `Date.now()`보다 정밀하다. 마이크로초 단위라서 FPS 계산에 적합하다.
