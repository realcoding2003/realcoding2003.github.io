---
layout: post
title: "Node.js Get Local IP Address - Cross-Platform (Win/Mac/Linux)"
date: 2025-09-05 09:00:00 +0900
categories: [Development, Tips]
tags: [Node.js, network, IP address, cross-platform, os]
author: "Kevin Park"
lang: en
slug: nodejs-get-local-ip-cross-platform
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2025/09/05/nodejs-get-local-ip-cross-platform-en/
  - /2025/09/05/nodejs-get-local-ip-cross-platform-en/
excerpt: "Get the correct local IP address using os.networkInterfaces() across Windows, macOS, and Linux, excluding virtual adapters."
---

## Problem

`os.networkInterfaces()` returns many interfaces. Windows uses "Ethernet", macOS uses "en0", Linux uses "eth0" — platform-specific code is needed.

## Solution

```javascript
const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  const platform = process.platform;

  const priority = {
    win32:  ['Ethernet', 'Wi-Fi'],
    darwin: ['en0', 'en1', 'en2'],
    linux:  ['eth0', 'eth1', 'wlan0'],
  };

  const names = priority[platform] || priority.linux;

  // Check priority interfaces first
  for (const name of names) {
    const iface = (interfaces[name] || [])
      .find(i => i.family === 'IPv4' && !i.internal);
    if (iface) return iface.address;
  }

  // Fallback: any interface excluding virtual adapters
  for (const [name, addrs] of Object.entries(interfaces)) {
    if (/VMware|VirtualBox|Hyper-V/i.test(name)) continue;
    const iface = addrs.find(i => i.family === 'IPv4' && !i.internal);
    if (iface) return iface.address;
  }

  return null;
}
```

## Key Points

- On macOS, the real network is almost always `en0`. On Windows, interface names may be localized (e.g., Korean "이더넷").
- Without filtering VMware/VirtualBox interfaces, you might get a virtual network IP (172.x.x.x) instead of the real LAN IP.
- `iface.internal === true` means loopback (127.0.0.1) — always exclude it.
