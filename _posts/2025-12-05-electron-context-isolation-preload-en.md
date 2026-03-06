---
layout: post
title: "Electron contextIsolation + Preload Security Pattern"
date: 2025-12-05 09:00:00 +0900
categories: [Development, Tips]
tags: [Electron, security, contextIsolation, preload, IPC]
author: "Kevin Park"
lang: en
excerpt: "Secure your Electron app by using contextIsolation and preload scripts to restrict renderer access to Node.js."
---

## Problem

With `nodeIntegration: true`, the renderer (webpage) can directly access the filesystem via `require('fs')`. If loading external URLs, this is a critical security risk.

## Solution

```javascript
// main.js
const mainWindow = new BrowserWindow({
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,   // separate renderer and Node.js contexts
    nodeIntegration: false,   // block require in renderer
  }
});
```

```javascript
// preload.js - bridge between main and renderer
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  scanNetwork: () => ipcRenderer.invoke('scan-network'),
  getVersion: () => ipcRenderer.invoke('get-version'),
  onScanResult: (callback) =>
    ipcRenderer.on('scan-result', (_, data) => callback(data)),
});
```

```javascript
// renderer.js - use in the webpage
const results = await window.electronAPI.scanNetwork();
```

## Key Points

- With `contextIsolation: true`, the preload script's globals and the renderer's globals are completely separate. Only functions exposed via `contextBridge.exposeInMainWorld` are accessible.
- The renderer can only use what's defined in `window.electronAPI`. Dangerous access like `require('child_process')` is impossible.
- `ipcRenderer.invoke` returns a Promise for bidirectional communication. Handle it in the main process with `ipcMain.handle`.
