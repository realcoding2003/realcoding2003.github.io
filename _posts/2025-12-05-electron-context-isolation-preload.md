---
layout: post
title: "Electron contextIsolation + preload 보안 패턴"
date: 2025-12-05 09:00:00 +0900
categories: [Development, Tips]
tags: [Electron, security, contextIsolation, preload, IPC]
author: "Kevin Park"
lang: ko
excerpt: "Electron에서 contextIsolation과 preload 스크립트로 렌더러 프로세스의 Node.js 접근을 안전하게 제한하는 방법."
---

## 문제

Electron에서 `nodeIntegration: true`로 하면 렌더러(웹페이지)에서 `require('fs')`로 파일 시스템에 직접 접근할 수 있다. 외부 URL을 로드하는 경우 심각한 보안 위험이 된다.

## 해결

```javascript
// main.js - 메인 프로세스
const mainWindow = new BrowserWindow({
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,   // 렌더러와 Node.js 컨텍스트 분리
    nodeIntegration: false,   // 렌더러에서 require 차단
  }
});
```

```javascript
// preload.js - 브릿지 역할
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  scanNetwork: () => ipcRenderer.invoke('scan-network'),
  getVersion: () => ipcRenderer.invoke('get-version'),
  onScanResult: (callback) =>
    ipcRenderer.on('scan-result', (_, data) => callback(data)),
});
```

```javascript
// renderer.js - 웹페이지에서 사용
const results = await window.electronAPI.scanNetwork();
```

## 핵심 포인트

- `contextIsolation: true`면 preload 스크립트의 전역 객체와 렌더러의 전역 객체가 완전히 분리된다. `contextBridge.exposeInMainWorld`로 허용된 함수만 노출한다.
- 렌더러에서 할 수 있는 건 오직 `window.electronAPI`에 정의된 것뿐이다. `require('child_process')` 같은 위험한 접근은 불가능하다.
- `ipcRenderer.invoke`는 Promise를 반환하는 양방향 통신이다. 메인 프로세스에서 `ipcMain.handle`로 받아서 처리한다.
