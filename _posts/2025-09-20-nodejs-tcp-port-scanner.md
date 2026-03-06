---
layout: post
title: "Node.js TCP 포트 스캐너 구현 - net.Socket과 타임아웃 처리"
date: 2025-09-20 09:00:00 +0900
categories: [Development, Tips]
tags: [Node.js, TCP, port scanner, net, socket]
author: "Kevin Park"
lang: ko
excerpt: "Node.js net 모듈로 TCP 포트가 열려있는지 확인하는 비동기 포트 스캐너를 만드는 방법."
---

## 문제

특정 호스트의 포트가 열려있는지 확인하고 싶다. `ping`은 ICMP라서 포트 단위 확인이 안 되고, 외부 라이브러리를 설치하기엔 간단한 작업이다.

## 해결

```javascript
const net = require('net');

async function checkPort(host, port, timeout = 500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    const timer = setTimeout(() => {
      socket.destroy();
      resolve({ host, port, open: false });
    }, timeout);

    socket.on('connect', () => {
      clearTimeout(timer);
      socket.destroy();
      resolve({ host, port, open: true });
    });

    socket.on('error', () => {
      clearTimeout(timer);
      resolve({ host, port, open: false });
    });

    socket.connect(port, host);
  });
}

// 사용 예시: 여러 포트 동시 스캔
async function scanPorts(host, ports) {
  const results = await Promise.all(
    ports.map(port => checkPort(host, port))
  );
  return results.filter(r => r.open);
}

// 결과: [{ host: '192.168.1.1', port: 80, open: true }, ...]
```

## 핵심 포인트

- `reject` 대신 `resolve`로 통일한 게 포인트다. 포트가 닫혀있는 건 에러가 아니라 "닫혀있다"는 정상 결과이므로 `Promise.all`이 중간에 멈추지 않는다.
- 타임아웃은 LAN 환경에서는 500ms면 충분하다. 인터넷 호스트를 스캔할 때는 2000~3000ms로 늘려야 한다.
- `socket.destroy()`를 반드시 호출해야 한다. 안 하면 소켓이 계속 열려있어서 동시에 수백 개 스캔할 때 파일 디스크립터가 고갈된다.
