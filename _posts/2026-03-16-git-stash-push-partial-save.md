---
layout: post
title: "git stash push -m 으로 작업 중 코드 부분 저장하기"
date: 2026-03-16 09:00:00 +0900
categories: [Development, Tips]
tags: [Git, git-stash, CLI, 버전관리]
author: "Kevin Park"
lang: ko
excerpt: "git stash push로 특정 파일만 골라서 스태시하는 방법. 전체 스태시 말고 필요한 것만 저장하자."
---

## 문제

브랜치에서 여러 파일을 동시에 수정하고 있는데, 일부 파일만 잠깐 치워두고 싶을 때가 있다. `git stash`를 하면 수정한 파일이 전부 들어가버린다. "이 파일만 스태시하고 싶은데..." 하는 상황.

## 해결

`git stash push`에 파일 경로를 지정하면 된다.

```bash
# 특정 파일만 스태시
git stash push -m "로그인 폼 수정 중" -- src/components/LoginForm.tsx

# 여러 파일도 가능
git stash push -m "API 리팩토링" -- src/api/user.ts src/api/auth.ts

# 디렉토리 단위도 된다
git stash push -m "스타일 작업" -- src/styles/
```

예전에는 `git stash save`를 썼는데, 이건 deprecated 됐다. `push`가 파일 지정도 되고 더 유연하다.

스태시 목록 확인하고 꺼내는 건 똑같다.

```bash
# 목록 확인
git stash list
# stash@{0}: On feature/login: 로그인 폼 수정 중
# stash@{1}: On feature/login: API 리팩토링

# 꺼내기 (스태시 유지)
git stash apply stash@{0}

# 꺼내면서 삭제
git stash pop stash@{0}
```

`-m` 메시지를 안 넣으면 나중에 어떤 스태시가 뭔지 알 수가 없다. 꼭 넣자.

## 핵심 포인트

- `git stash push -m "메시지" -- 파일경로`로 특정 파일만 스태시 가능
- `git stash save`는 deprecated, `push`를 쓰자
- `-m` 메시지는 필수는 아닌데, 안 넣으면 나중에 후회한다
- `apply`는 스태시를 남기고, `pop`은 꺼내면서 삭제한다
