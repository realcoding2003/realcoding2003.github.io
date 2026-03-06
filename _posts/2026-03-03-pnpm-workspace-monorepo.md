---
layout: post
title: "pnpm workspace로 모노레포 구성하기"
date: 2026-03-03 09:00:00 +0900
categories: [Development, Tips]
tags: [pnpm, monorepo, workspace, Node.js]
author: "Kevin Park"
lang: ko
excerpt: "pnpm workspace로 프론트엔드, 인프라, 모바일 프로젝트를 하나의 레포에서 관리하는 모노레포 구성법."
---

## 문제

프론트엔드, 랜딩페이지, 모바일 앱, 인프라 코드가 각각 다른 레포에 흩어져 있으면 의존성 관리도 귀찮고 공통 코드 공유도 어렵다.

## 해결

```yaml
# pnpm-workspace.yaml
packages:
  - frontend
  - landing
  - android
  - ios
  - infra
```

```json
// 루트 package.json
{
  "name": "my-project",
  "private": true,
  "scripts": {
    "dev": "pnpm -F @my-project/frontend dev",
    "build": "pnpm -F @my-project/frontend build"
  }
}
```

루트에서 `pnpm install` 한 번이면 모든 패키지의 의존성이 설치된다. 특정 패키지만 실행하려면 `-F` (filter) 플래그를 쓰면 된다.

## 핵심 포인트

- `pnpm-workspace.yaml` 파일 하나면 모노레포 설정 끝이다. yarn workspace처럼 `package.json`에 넣을 필요가 없어서 깔끔하다.
- pnpm은 심볼릭 링크 기반이라 디스크 공간을 아끼고, 패키지 간 의존성 격리도 엄격하다. npm이나 yarn보다 모노레포에 유리한 구조다.
- 루트 `package.json`에 `"private": true`를 꼭 넣어야 한다. 실수로 루트 패키지가 npm에 퍼블리시되는 걸 막아준다.
