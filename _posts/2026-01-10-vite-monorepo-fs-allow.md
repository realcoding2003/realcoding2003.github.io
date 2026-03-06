---
layout: post
title: "Vite 모노레포에서 상위 디렉토리 접근 허용하기 - server.fs.allow"
date: 2026-01-10 09:00:00 +0900
categories: [Development, Tips]
tags: [Vite, monorepo, config, SvelteKit, fs]
author: "Kevin Park"
lang: ko
excerpt: "Vite 모노레포에서 상위 디렉토리 파일 접근이 차단되는 문제를 server.fs.allow로 해결하는 방법."
---

## 문제

모노레포 구조에서 하위 패키지가 상위 디렉토리의 공유 모듈을 import하면 Vite가 차단한다. `The request url is outside of Vite serving allow list` 에러가 발생한다.

## 해결

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import path from 'path';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: 5174,
    fs: {
      allow: [
        // 상위 디렉토리 접근 허용 (모노레포 루트)
        path.resolve(__dirname, '..'),
      ],
    },
  },
});
```

## 핵심 포인트

- Vite는 보안상 프로젝트 루트 바깥의 파일 접근을 기본 차단한다. 모노레포에서는 이게 문제가 되는데, 공유 패키지가 상위에 있으니까.
- `server.fs.allow`에 경로를 추가하면 그 디렉토리 아래의 파일을 서빙할 수 있다. `..`만 넣으면 한 단계 위까지 허용된다.
- 빌드 시에는 이 설정이 적용되지 않는다. 개발 서버(`vite dev`)에서만 영향을 준다. 프로덕션 빌드는 번들러가 알아서 처리한다.
