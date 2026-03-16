---
layout: post
title: "Node.js worker_threads로 CPU 집약 작업 메인 스레드에서 분리하기"
date: 2026-01-31 09:00:00 +0900
categories: [Development, Tips]
tags: [Node.js, worker_threads, 성능최적화, 백엔드]
author: "Kevin Park"
lang: ko
excerpt: "Node.js에서 무거운 연산을 worker_threads로 분리해서 메인 이벤트 루프가 멈추지 않게 하는 방법."
---

## 문제

Node.js에서 이미지 리사이징이나 대용량 JSON 파싱 같은 CPU 집약 작업을 돌리면 이벤트 루프가 블로킹된다. API 응답이 멈추고, 다른 요청도 처리 못 하는 상황이 발생한다.

## 해결

`worker_threads` 모듈로 무거운 연산을 별도 스레드에서 처리하면 된다.

```javascript
// worker.js - 워커 스레드에서 실행될 코드
const { parentPort, workerData } = require('worker_threads');

function heavyCalculation(data) {
  // CPU 집약적인 작업 (예: 해시 계산, 데이터 변환)
  let result = 0;
  for (let i = 0; i < data.iterations; i++) {
    result += Math.sqrt(i) * Math.random();
  }
  return result;
}

const result = heavyCalculation(workerData);
parentPort.postMessage(result);
```

```javascript
// main.js - 메인 스레드
const { Worker } = require('worker_threads');

function runWorker(data) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./worker.js', { workerData: data });
    worker.on('message', resolve);
    worker.on('error', reject);
  });
}

// Express 라우트에서 사용
app.get('/heavy', async (req, res) => {
  const result = await runWorker({ iterations: 10_000_000 });
  res.json({ result });
  // 이 동안 다른 요청은 정상적으로 처리된다
});
```

워커를 매번 생성하면 오버헤드가 있으니, 반복 작업이면 워커 풀을 쓰는 게 낫다.

```javascript
// 간단한 워커 풀
const os = require('os');
const poolSize = os.cpus().length;
const workers = Array.from({ length: poolSize },
  () => new Worker('./worker.js')
);
```

## 핵심 포인트

- `worker_threads`는 Node.js 내장 모듈이라 별도 설치 불필요
- `workerData`로 데이터 전달, `parentPort.postMessage()`로 결과 반환
- 메인 스레드 이벤트 루프를 블로킹하지 않아 API 응답성 유지
- 반복 사용 시 워커 풀 패턴으로 생성 오버헤드를 줄이자
