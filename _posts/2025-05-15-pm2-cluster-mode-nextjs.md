---
layout: post
title: "PM2 cluster mode로 Next.js 프로덕션 성능 올리기"
date: 2025-05-15 09:00:00 +0900
categories: [Development, Tips]
tags: [PM2, Node.js, Next.js, cluster, production]
author: "Kevin Park"
lang: ko
excerpt: "PM2 cluster mode 설정으로 멀티코어를 활용해 Next.js 앱의 처리량을 높이는 방법."
---

## 문제

Node.js는 싱글 스레드라서 CPU 코어가 4개여도 1개만 쓴다. 트래픽이 몰리면 하나의 프로세스가 다 감당해야 한다.

## 해결

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'my-app',
    script: 'node_modules/next/dist/bin/next',
    args: 'start --port 3000',
    instances: 2,           // CPU 코어 수만큼 (또는 'max')
    exec_mode: 'cluster',   // cluster 모드 활성화
    max_memory_restart: '800M',
    env: {
      NODE_ENV: 'production',
    },
    // 재시작 정책
    exp_backoff_restart_delay: 100,
    max_restarts: 10,
    min_uptime: '10s',
    // 로그
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
  }]
};
```

```bash
pm2 start ecosystem.config.js
pm2 monit    # 실시간 모니터링
pm2 reload my-app  # 무중단 재시작
```

## 핵심 포인트

- `instances: 'max'`로 하면 전체 코어를 다 쓰는데, 라즈베리파이 같은 소형 서버에서는 2개 정도로 제한하는 게 안정적이다. OS랑 Redis 같은 다른 서비스에도 코어가 필요하니까.
- `exp_backoff_restart_delay: 100`은 앱이 죽었을 때 100ms부터 시작해서 점점 간격을 늘리며 재시작한다. 무한 재시작 루프를 방지한다.
- `pm2 reload`는 `restart`와 다르게 프로세스를 하나씩 순차적으로 교체해서 다운타임이 없다.
