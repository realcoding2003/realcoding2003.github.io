---
layout: post
title: "Node.js stream.pipeline으로 대용량 파일 안전하게 처리하기"
date: 2026-03-17 09:00:00 +0900
categories: [Development, Tips]
tags: [Node.js, Stream, Pipeline, File Processing]
author: "Kevin Park"
lang: ko
excerpt: "Node.js의 stream.pipeline을 사용해 대용량 파일을 메모리 폭발 없이 처리하는 방법을 정리한다."
---

## 문제

수 GB짜리 로그 파일을 `fs.readFile`로 한 번에 읽으려다 메모리가 터졌다. 당연한 결과인데 매번 까먹는다.

```javascript
// 이러면 파일 전체가 메모리에 올라간다
const data = await fs.promises.readFile('huge.log', 'utf-8');
```

## 해결

`stream.pipeline`을 쓰면 청크 단위로 읽고-변환하고-쓰는 파이프라인을 만들 수 있다. 에러 처리와 스트림 정리도 자동이다.

```javascript
const { pipeline } = require('stream/promises');
const fs = require('fs');
const zlib = require('zlib');

// 대용량 파일을 gzip 압축하면서 복사
await pipeline(
  fs.createReadStream('huge.log'),
  zlib.createGzip(),
  fs.createWriteStream('huge.log.gz')
);
```

줄 단위 처리가 필요하면 Transform 스트림을 끼워 넣으면 된다.

```javascript
const { Transform } = require('stream');

const lineFilter = new Transform({
  transform(chunk, encoding, callback) {
    const lines = chunk.toString().split('\n');
    const errors = lines
      .filter(line => line.includes('ERROR'))
      .join('\n');
    callback(null, errors ? errors + '\n' : '');
  }
});

await pipeline(
  fs.createReadStream('huge.log'),
  lineFilter,
  fs.createWriteStream('errors-only.log')
);
```

## 핵심 포인트

- `stream/promises`의 `pipeline`은 async/await와 자연스럽게 쓸 수 있다
- 중간에 에러가 나면 모든 스트림을 자동으로 destroy 해준다. `.pipe()` 체이닝과의 가장 큰 차이점이다
- 메모리 사용량이 파일 크기와 무관하게 일정하다. 10GB 파일이든 100GB든 상관없다
