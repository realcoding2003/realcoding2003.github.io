---
layout: post
title: "Node.js에서 로컬 IP 주소 가져오기 - Windows/macOS/Linux 대응"
date: 2025-09-05 09:00:00 +0900
categories: [Development, Tips]
tags: [Node.js, network, IP address, cross-platform, os]
author: "Kevin Park"
lang: ko
excerpt: "Node.js os.networkInterfaces()로 플랫폼별 로컬 IP를 정확하게 가져오는 방법. VMware, VirtualBox 가상 인터페이스 제외 포함."
---

## 문제

`os.networkInterfaces()`를 쓰면 인터페이스가 잔뜩 나온다. Windows는 "이더넷", macOS는 "en0", Linux는 "eth0"이라서 플랫폼마다 코드가 달라야 한다.

## 해결

```javascript
const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  const platform = process.platform;

  // 플랫폼별 우선순위 인터페이스
  const priority = {
    win32:  ['Ethernet', 'Wi-Fi', '이더넷'],
    darwin: ['en0', 'en1', 'en2'],
    linux:  ['eth0', 'eth1', 'wlan0'],
  };

  const names = priority[platform] || priority.linux;

  // 우선순위 인터페이스에서 먼저 찾기
  for (const name of names) {
    const iface = (interfaces[name] || [])
      .find(i => i.family === 'IPv4' && !i.internal);
    if (iface) return iface.address;
  }

  // 못 찾으면 가상 인터페이스 제외하고 아무거나
  for (const [name, addrs] of Object.entries(interfaces)) {
    if (/VMware|VirtualBox|Hyper-V/i.test(name)) continue;
    const iface = addrs.find(i => i.family === 'IPv4' && !i.internal);
    if (iface) return iface.address;
  }

  return null;
}
```

## 핵심 포인트

- macOS에서 실제 네트워크는 거의 `en0`(유선/Wi-Fi)이다. Windows는 한글 이름도 있으니 `'이더넷'`을 넣어줘야 한다.
- VMware, VirtualBox 같은 가상 인터페이스를 제외하지 않으면 `192.168.x.x` 대신 `172.x.x.x` 같은 가상 네트워크 IP가 반환될 수 있다.
- `iface.internal`이 `true`면 루프백(127.0.0.1)이니까 항상 제외한다.
