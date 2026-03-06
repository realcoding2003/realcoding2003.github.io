---
layout: post
title: "Nginx + Docker로 정적 사이트 서빙하기"
date: 2026-03-06 09:00:00 +0900
categories: [Development, Tips]
tags: [Nginx, Docker, static-site, docker-compose]
author: "Kevin Park"
lang: ko
excerpt: "Docker Compose로 Nginx 컨테이너를 띄워서 정적 HTML/CSS/JS 사이트를 서빙하는 가장 간단한 방법."
---

## 문제

빌드된 정적 사이트를 로컬이나 서버에서 빠르게 서빙하고 싶은데, Node.js 서버를 따로 짜기엔 과하다.

## 해결

```yaml
# docker-compose.yml
version: '3'
services:
  nginx:
    image: nginx
    ports:
      - "80:80"
    volumes:
      - ./dist:/usr/share/nginx/html:ro
```

```bash
docker compose up -d
```

끝이다. `./dist` 폴더에 빌드 결과물을 넣으면 `http://localhost`에서 바로 접근할 수 있다.

## 핵심 포인트

- `:ro` (read-only)로 마운트하면 컨테이너에서 파일을 실수로 수정하는 걸 막을 수 있다. 프로덕션에서는 반드시 붙이는 게 좋다.
- Nginx 공식 이미지의 기본 document root가 `/usr/share/nginx/html`이라서 별도 설정 파일 없이도 바로 동작한다.
- SPA 라우팅이 필요하면 커스텀 `nginx.conf`에 `try_files $uri $uri/ /index.html;`을 추가하면 된다. 그 전까지는 이 설정만으로 충분하다.
