---
layout: post
title: "Electron contextIsolation + preloadセキュリティパターン"
date: 2025-12-05 09:00:00 +0900
categories: [Development, Tips]
tags: [Electron, security, contextIsolation, preload, IPC]
author: "Kevin Park"
lang: ja
excerpt: "ElectronでcontextIsolationとpreloadスクリプトを使い、レンダラープロセスのNode.jsアクセスを安全に制限する方法をご紹介します。"
---

## 問題

Electronで`nodeIntegration: true`にすると、レンダラー（Webページ）から`require('fs')`でファイルシステムに直接アクセスできます。外部URLをロードする場合、深刻なセキュリティリスクになります。

## 解決方法

```javascript
// main.js - メインプロセス
const mainWindow = new BrowserWindow({
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,   // レンダラーとNode.jsコンテキストを分離
    nodeIntegration: false,   // レンダラーでrequireをブロック
  }
});
```

```javascript
// preload.js - ブリッジ役割
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  scanNetwork: () => ipcRenderer.invoke('scan-network'),
  getVersion: () => ipcRenderer.invoke('get-version'),
  onScanResult: (callback) =>
    ipcRenderer.on('scan-result', (_, data) => callback(data)),
});
```

```javascript
// renderer.js - Webページで使用
const results = await window.electronAPI.scanNetwork();
```

## ポイント

- `contextIsolation: true`にすると、preloadスクリプトのグローバルオブジェクトとレンダラーのグローバルオブジェクトが完全に分離されます。`contextBridge.exposeInMainWorld`で許可された関数のみが公開されます。
- レンダラーでできるのは`window.electronAPI`に定義されたことだけです。`require('child_process')`のような危険なアクセスは不可能です。
- `ipcRenderer.invoke`はPromiseを返す双方向通信です。メインプロセスで`ipcMain.handle`で受け取って処理します。
