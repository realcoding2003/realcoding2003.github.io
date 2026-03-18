---
layout: post
title: "Docker Compose Watch로 개발 환경 핫 리로드 설정하기"
date: 2026-03-15 09:00:00 +0900
categories: [Development, Tips]
tags: [Docker, docker-compose, hot-reload, 개발환경]
author: "Kevin Park"
lang: ko
excerpt: "docker compose watch로 코드 변경 시 자동으로 컨테이너에 반영하는 방법. 볼륨 마운트보다 깔끔하다."
---

## 문제

Docker로 개발할 때 코드 바꿀 때마다 `docker compose up --build` 다시 치는 건 미친 짓이다. 볼륨 마운트(`volumes`)를 쓰면 되긴 하는데, `node_modules` 충돌이나 OS 간 파일 감시 문제가 생긴다.

## 해결

Docker Compose 2.22+에서 `watch` 기능이 추가됐다. `compose.yaml`에 `develop.watch` 섹션을 넣으면 된다.

```yaml
services:
  web:
    build: .
    ports:
      - "3000:3000"
    develop:
      watch:
        # 소스 코드 변경 → 컨테이너에 자동 싱크
        - action: sync
          path: ./src
          target: /app/src

        # package.json 변경 → 이미지 리빌드
        - action: rebuild
          path: ./package.json

        # 설정 파일 변경 → 컨테이너 재시작
        - action: sync+restart
          path: ./config
          target: /app/config
```

실행은 이렇게 한다.

```bash
docker compose watch
```

세 가지 액션이 있다.

- **sync**: 파일을 컨테이너에 바로 복사한다. 소스 코드 변경에 적합
- **rebuild**: 이미지를 다시 빌드하고 컨테이너를 교체한다. 의존성 변경에 적합
- **sync+restart**: 파일 복사 후 컨테이너를 재시작한다. 설정 파일 변경에 적합

특정 파일을 제외하고 싶으면 `ignore`를 쓴다.

```yaml
        - action: sync
          path: ./src
          target: /app/src
          ignore:
            - "**/*.test.ts"
            - "**/__snapshots__"
```

## 핵심 포인트

- `docker compose watch`는 파일 변경 감지 → 자동 싱크/리빌드/재시작
- 볼륨 마운트와 달리 `node_modules` 충돌이 없다
- `sync`, `rebuild`, `sync+restart` 세 가지 액션으로 변경 유형에 맞게 대응
- `ignore`로 불필요한 파일 변경을 필터링할 수 있다
- Docker Compose 2.22+ 필요 (Docker Desktop 4.24+)
