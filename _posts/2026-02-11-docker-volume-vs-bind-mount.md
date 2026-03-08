---
layout: post
title: "Docker Volume vs Bind Mount, 언제 뭘 쓰는 건지"
date: 2026-02-11 09:00:00 +0900
categories: [Development, Tips]
tags: [Docker, Volume, Bind Mount, DevOps]
author: "Kevin Park"
lang: ko
excerpt: "Docker에서 Volume과 Bind Mount의 차이점, 개발과 프로덕션에서 각각 어떻게 쓰는지 정리했다."
---

## 문제

Docker에서 데이터를 유지하려면 볼륨을 써야 한다는 건 아는데, `volume`이랑 `bind mount`가 뭐가 다른 건지 헷갈린다. docker-compose.yml에서 이렇게 쓸 때 차이가 뭘까.

```yaml
volumes:
  - ./src:/app/src          # 이게 bind mount
  - db-data:/var/lib/mysql  # 이게 named volume
```

## 해결

**Bind Mount**는 호스트의 특정 경로를 컨테이너에 그대로 마운트한다.

```yaml
# 개발할 때 — 코드 변경이 바로 반영됨
services:
  app:
    volumes:
      - ./src:/app/src
      - ./config:/app/config
```

호스트 파일 시스템에 직접 접근하는 거라, 코드를 수정하면 컨테이너 안에서도 즉시 반영된다. 개발 환경에서 핫 리로드 쓸 때 딱이다.

**Named Volume**은 Docker가 관리하는 별도 저장소다.

```yaml
# 프로덕션 — 데이터베이스 데이터 보존
services:
  db:
    volumes:
      - db-data:/var/lib/mysql

volumes:
  db-data:  # Docker가 알아서 관리
```

호스트의 어디에 저장되는지 신경 쓸 필요 없다. Docker가 알아서 관리하고, 컨테이너를 삭제해도 데이터는 남는다.

## 흔한 실수

```yaml
# 이러면 node_modules가 호스트 것으로 덮어씌워진다
volumes:
  - .:/app

# anonymous volume으로 보호해야 한다
volumes:
  - .:/app
  - /app/node_modules  # 컨테이너의 node_modules 유지
```

호스트 전체를 마운트하면 컨테이너에서 `npm install`로 설치한 `node_modules`가 호스트의 (비어있는) `node_modules`로 덮어씌워지는 문제가 생긴다.

## 핵심 포인트

- **Bind Mount**: 호스트 경로 직접 마운트. 개발 환경에서 코드 동기화에 적합
- **Named Volume**: Docker 관리 저장소. 프로덕션 데이터 보존에 적합
- 호스트 전체 마운트 시 `node_modules` 같은 디렉토리는 anonymous volume으로 보호한다
- 프로덕션에서는 bind mount 대신 named volume을 쓰는 게 보안상 안전하다
