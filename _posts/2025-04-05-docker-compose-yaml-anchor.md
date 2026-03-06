---
layout: post
title: "Docker Compose YAML 앵커(&)로 반복 설정 제거하기"
date: 2025-04-05 09:00:00 +0900
categories: [Development, Tips]
tags: [Docker, Docker Compose, YAML, anchor, DRY]
author: "Kevin Park"
lang: ko
excerpt: "Docker Compose에서 YAML 앵커(&)와 병합(<<)을 사용해 서비스 설정 중복을 제거하는 방법."
---

## 문제

Docker Compose에서 비슷한 서비스를 여러 개 띄울 때 image, volumes, restart 같은 공통 설정을 매번 복붙하고 있었다. 서비스가 10개면 같은 내용이 10번 반복된다.

## 해결

```yaml
# 공통 설정을 앵커(&)로 정의
x-app-common: &app-common
  image: my-app:latest
  volumes:
    - ./cert:/app/cert:ro
  restart: unless-stopped
  dns:
    - 172.16.0.1

services:
  # 병합(<<)으로 공통 설정 가져오고, 개별 설정만 추가
  app01:
    <<: *app-common
    container_name: app01
    environment:
      - APP_ID=01
      - PORT=3001

  app02:
    <<: *app-common
    container_name: app02
    environment:
      - APP_ID=02
      - PORT=3002

  app03:
    <<: *app-common
    container_name: app03
    environment:
      - APP_ID=03
      - PORT=3003
```

## 핵심 포인트

- `x-` 접두사로 시작하는 키는 Docker Compose가 무시하는 확장 필드다. 여기에 공통 설정을 모아두면 깔끔하다.
- `&이름`으로 앵커를 정의하고, `<<: *이름`으로 병합한다. 병합 후에 같은 키를 다시 쓰면 오버라이드된다.
- 서비스가 많아질수록 효과가 크다. 실제로 10개 서비스를 운영하면서 공통 설정 변경할 때 한 곳만 수정하면 되니까 실수가 줄었다.
