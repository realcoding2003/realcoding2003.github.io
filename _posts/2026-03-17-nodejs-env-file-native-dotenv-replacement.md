---
layout: post
title: "Node.js --env-file로 dotenv 없이 .env 파일 로드하기"
date: 2026-03-17 09:00:00 +0900
categories: [Development, Tips]
tags: [Node.js, env, dotenv, 환경변수]
author: "Kevin Park"
lang: ko
excerpt: "Node.js 20.6부터 --env-file 플래그로 .env 파일을 네이티브로 읽을 수 있다. dotenv 패키지 이제 안 써도 된다."
---

## 문제

Node.js 프로젝트마다 `dotenv` 패키지를 설치하고, 진입점에 `require('dotenv').config()` 한 줄 넣는 게 당연한 루틴이었다. 근데 이게 결국 런타임에 파일 읽어서 파싱하는 거라 의존성 하나 더 생기는 거다.

## 해결

Node.js 20.6+부터 `--env-file` 플래그가 내장됐다.

```bash
# 기본 사용법
node --env-file=.env app.js

# 여러 파일도 가능
node --env-file=.env --env-file=.env.local app.js
```

`.env` 파일 형식은 기존과 동일하다.

```
DATABASE_URL=postgresql://localhost:5432/mydb
API_KEY=sk-1234567890
NODE_ENV=development
```

코드에서는 그냥 `process.env`로 접근하면 된다. `require('dotenv')` 같은 건 필요 없다.

```javascript
// dotenv 임포트 없이 바로 사용
const dbUrl = process.env.DATABASE_URL;
console.log(dbUrl); // postgresql://localhost:5432/mydb
```

Node.js 20.12+부터는 프로그래밍 방식도 지원한다.

```javascript
// 런타임에 동적으로 로드
process.loadEnvFile('.env');

// 문자열에서 직접 파싱
const { parseEnv } = require('node:util');
const vars = parseEnv('KEY=value\nFOO=bar');
console.log(vars.KEY); // "value"
```

`package.json` 스크립트도 깔끔해진다.

```json
{
  "scripts": {
    "dev": "node --env-file=.env --watch app.js",
    "prod": "node --env-file=.env.production app.js"
  }
}
```

## 핵심 포인트

- Node.js 20.6+ `--env-file` 플래그로 `.env` 네이티브 로드 가능
- `dotenv` 패키지 설치 불필요, `require` 코드도 필요 없다
- 20.12+에서는 `process.loadEnvFile()`로 동적 로드도 가능
- 여러 env 파일을 순서대로 로드할 수 있고, 뒤에 오는 파일이 덮어쓴다
- 20 미만 버전이면 여전히 dotenv가 필요하다
