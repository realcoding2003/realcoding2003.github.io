---
layout: post
title: "Node.js --expose-gc로 메모리 누수 디버깅하기"
date: 2025-11-20 09:00:00 +0900
categories: [Development, Tips]
tags: [Node.js, memory, garbage collection, debugging, performance]
author: "Kevin Park"
lang: ko
excerpt: "Node.js에서 --expose-gc 플래그로 수동 GC를 트리거하고 메모리 누수를 찾는 방법."
---

## 문제

장시간 실행되는 Node.js 앱(MQTT 클라이언트, 배치 프로세서 등)에서 메모리가 계속 올라간다. GC가 제대로 돌고 있는 건지, 진짜 누수인 건지 구분이 안 된다.

## 해결

```bash
# --expose-gc로 실행하면 global.gc()를 호출할 수 있다
node --expose-gc app.js

# Docker에서
CMD ["node", "--expose-gc", "--max-old-space-size=512", "dist/index.js"]
```

```javascript
// 메모리 상태 확인 함수
function logMemory(label) {
  if (global.gc) global.gc(); // 수동 GC 실행
  const usage = process.memoryUsage();
  console.log(`[${label}] Heap: ${Math.round(usage.heapUsed / 1024 / 1024)}MB / ${Math.round(usage.heapTotal / 1024 / 1024)}MB`);
}

// 사용 예시
logMemory('시작');
await processLargeData();
logMemory('처리 후');  // GC 후에도 메모리가 안 줄면 → 누수
```

## 핵심 포인트

- `global.gc()`를 호출한 후에도 `heapUsed`가 계속 증가하면 진짜 메모리 누수다. GC가 회수할 수 없는 객체가 어딘가에 참조되고 있는 거다.
- `--max-old-space-size=512`로 힙 크기를 제한하면, 누수가 있을 때 빨리 OOM으로 터져서 문제를 빨리 발견할 수 있다.
- 프로덕션에서는 `--expose-gc`를 쓰지 않는 게 좋다. 수동 GC는 성능에 영향을 준다. 디버깅할 때만 쓰자.
