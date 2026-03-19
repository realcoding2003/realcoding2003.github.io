---
layout: post
title: "git bisect로 버그 원인 커밋 찾기 - 이진 탐색 디버깅"
date: 2026-03-15 09:00:00 +0900
categories: [Development, Tips]
tags: [Git, git bisect, Debugging, Binary Search]
author: "Kevin Park"
lang: ko
excerpt: "git bisect를 사용해 버그를 만든 커밋을 이진 탐색으로 빠르게 찾는 방법을 정리한다."
---

## 문제

어느 시점부터 버그가 생겼는데 커밋이 수백 개라 하나씩 확인하는 건 불가능했다. "분명 지난주까지는 됐는데..."라는 말만 반복하고 있었다.

## 해결

`git bisect`는 이진 탐색으로 버그를 만든 커밋을 찾아준다. 1024개 커밋도 10번만 확인하면 된다.

```bash
# bisect 시작
git bisect start

# 현재(버그 있음)를 bad로 표시
git bisect bad

# 버그 없던 시점을 good으로 표시
git bisect good abc1234
```

이제 git이 중간 커밋으로 체크아웃해준다. 테스트하고 결과를 알려주면 된다.

```bash
# 이 커밋에서 버그가 있으면
git bisect bad

# 이 커밋에서 버그가 없으면
git bisect good

# 반복하면 원인 커밋을 찾아준다
# "abc5678 is the first bad commit"
```

테스트 스크립트가 있으면 완전 자동화도 가능하다.

```bash
# 스크립트 종료코드 0이면 good, 아니면 bad
git bisect run npm test

# 또는 특정 스크립트
git bisect run ./check-bug.sh
```

끝나면 원래 브랜치로 돌아간다.

```bash
git bisect reset
```

## 핵심 포인트

- 커밋 수가 N개면 최대 log2(N)번만 확인하면 된다. 1000개 커밋도 10번이면 충분하다
- `git bisect run`으로 테스트를 자동화하면 아예 손 안 대고 원인을 찾을 수 있다
- bisect 중에 빌드가 안 되는 커밋을 만나면 `git bisect skip`으로 건너뛸 수 있다
