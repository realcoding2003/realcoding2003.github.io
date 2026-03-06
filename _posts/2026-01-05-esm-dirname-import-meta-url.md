---
layout: post
title: "ESM에서 __dirname 사용하기 - import.meta.url 활용법"
date: 2026-01-05 09:00:00 +0900
categories: [Development, Tips]
tags: [Node.js, ESM, ES Modules, dirname, import.meta]
author: "Kevin Park"
lang: ko
excerpt: "ES Modules에서 __dirname과 __filename을 사용하는 방법. import.meta.url과 fileURLToPath 조합."
---

## 문제

`package.json`에 `"type": "module"`을 설정하거나 `.mjs` 파일을 쓰면 `__dirname`과 `__filename`이 정의되지 않는다. `ReferenceError: __dirname is not defined` 에러가 뜬다.

## 해결

```javascript
import { fileURLToPath } from 'url';
import path from 'path';

// ESM에서 __dirname, __filename 구현
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 이제 기존처럼 사용 가능
const configPath = path.resolve(__dirname, '../config/settings.json');
const dataDir = path.join(__dirname, '../../data');
```

## 핵심 포인트

- `import.meta.url`은 현재 파일의 URL을 `file:///Users/...` 형식으로 반환한다. `fileURLToPath`로 일반 파일 경로로 바꿔야 `path.join` 등에서 쓸 수 있다.
- CommonJS(`require`)에서 ESM으로 마이그레이션할 때 가장 먼저 부딪히는 문제가 이거다. 이 2줄만 파일 상단에 넣으면 나머지 코드는 그대로 쓸 수 있다.
- Node.js 20.11+에서는 `import.meta.dirname`과 `import.meta.filename`이 내장되어 있다. 하지만 하위 호환성을 위해 위 방법을 쓰는 게 안전하다.
