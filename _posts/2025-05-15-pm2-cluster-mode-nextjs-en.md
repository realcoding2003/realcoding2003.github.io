---
layout: post
title: "PM2 Cluster Mode for Next.js Production Performance"
date: 2025-05-15 09:00:00 +0900
categories: [Development, Tips]
tags: [PM2, Node.js, Next.js, cluster, production]
author: "Kevin Park"
lang: en
slug: pm2-cluster-mode-nextjs
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2025/05/15/pm2-cluster-mode-nextjs-en/
  - /2025/05/15/pm2-cluster-mode-nextjs-en/
excerpt: "Use PM2 cluster mode to leverage multi-core CPUs and boost Next.js throughput in production."
---

## Problem

Node.js is single-threaded. Even with 4 CPU cores, only one gets used. When traffic spikes, a single process handles everything.

## Solution

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'my-app',
    script: 'node_modules/next/dist/bin/next',
    args: 'start --port 3000',
    instances: 2,           // number of CPU cores (or 'max')
    exec_mode: 'cluster',   // enable cluster mode
    max_memory_restart: '800M',
    env: {
      NODE_ENV: 'production',
    },
    // restart policy
    exp_backoff_restart_delay: 100,
    max_restarts: 10,
    min_uptime: '10s',
    // logging
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
  }]
};
```

```bash
pm2 start ecosystem.config.js
pm2 monit    # real-time monitoring
pm2 reload my-app  # zero-downtime restart
```

## Key Points

- `instances: 'max'` uses all cores, but on small servers like Raspberry Pi, limit to 2. The OS and other services (Redis, etc.) need cores too.
- `exp_backoff_restart_delay: 100` starts at 100ms and increases the restart interval progressively, preventing infinite restart loops.
- `pm2 reload` differs from `restart` — it replaces processes one at a time for zero downtime.
