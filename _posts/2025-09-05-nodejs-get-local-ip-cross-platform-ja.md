---
layout: post
title: "Node.jsでローカルIPアドレスを取得する - Windows/macOS/Linux対応"
date: 2025-09-05 09:00:00 +0900
categories: [Development, Tips]
tags: [Node.js, network, IP address, cross-platform, os]
author: "Kevin Park"
lang: ja
slug: nodejs-get-local-ip-cross-platform
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /ja/2025/09/05/nodejs-get-local-ip-cross-platform-ja/
  - /2025/09/05/nodejs-get-local-ip-cross-platform-ja/
excerpt: "Node.jsのos.networkInterfaces()でプラットフォーム別にローカルIPを正確に取得する方法をご紹介します。"
---

## 問題

`os.networkInterfaces()`を使うとインターフェースが大量に表示されます。Windowsは「イーサネット」、macOSは「en0」、Linuxは「eth0」と、プラットフォームごとにコードを変える必要があります。

## 解決方法

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

  // 優先インターフェースから検索
  for (const name of names) {
    const iface = (interfaces[name] || [])
      .find(i => i.family === 'IPv4' && !i.internal);
    if (iface) return iface.address;
  }

  // 見つからない場合、仮想インターフェースを除外して検索
  for (const [name, addrs] of Object.entries(interfaces)) {
    if (/VMware|VirtualBox|Hyper-V/i.test(name)) continue;
    const iface = addrs.find(i => i.family === 'IPv4' && !i.internal);
    if (iface) return iface.address;
  }

  return null;
}
```

## ポイント

- macOSでは実際のネットワークはほぼ`en0`（有線/Wi-Fi）です。Windowsではインターフェース名がローカライズされている場合があります。
- VMwareやVirtualBoxなどの仮想インターフェースを除外しないと、実際のLAN IPの代わりに仮想ネットワークIP（172.x.x.x）が返される可能性があります。
- `iface.internal`が`true`の場合はループバック（127.0.0.1）なので、常に除外します。
