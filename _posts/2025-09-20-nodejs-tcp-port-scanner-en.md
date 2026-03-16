---
layout: post
title: "Node.js TCP Port Scanner - Using net.Socket with Timeout"
date: 2025-09-20 09:00:00 +0900
categories: [Development, Tips]
tags: [Node.js, TCP, port scanner, net, socket]
author: "Kevin Park"
lang: en
slug: nodejs-tcp-port-scanner
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2025/09/20/nodejs-tcp-port-scanner-en/
  - /2025/09/20/nodejs-tcp-port-scanner-en/
excerpt: "Build an async TCP port scanner with Node.js net module — no external dependencies needed."
---

## Problem

Need to check if a port is open on a host. `ping` only works at ICMP level (no port info), and this is too simple for an external library.

## Solution

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

// Usage: scan multiple ports concurrently
async function scanPorts(host, ports) {
  const results = await Promise.all(
    ports.map(port => checkPort(host, port))
  );
  return results.filter(r => r.open);
}
```

## Key Points

- Always `resolve` instead of `reject` — a closed port is a valid result, not an error. This keeps `Promise.all` from short-circuiting.
- 500ms timeout is sufficient for LAN. For internet hosts, increase to 2000-3000ms.
- Always call `socket.destroy()`. Without it, sockets stay open and you'll exhaust file descriptors when scanning hundreds of ports.
