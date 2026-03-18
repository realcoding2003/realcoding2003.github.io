---
layout: post
title: "git worktree로 브랜치 전환 없이 여러 브랜치 동시 작업하기"
date: 2026-03-14 09:00:00 +0900
categories: [Development, Tips]
tags: [Git, git-worktree, CLI, 버전관리]
author: "Kevin Park"
lang: ko
excerpt: "git worktree로 한 레포에서 여러 브랜치를 동시에 열어서 작업하는 방법. 브랜치 전환 스트레스가 사라진다."
---

## 문제

feature 브랜치에서 작업 중인데 갑자기 핫픽스 요청이 들어왔다. `git stash` 하고 `git checkout main` 하고 핫픽스 브랜치 만들고... 끝나면 다시 원래 브랜치로 돌아와서 `git stash pop`. 이 과정이 하루에 몇 번씩 반복되면 진짜 짜증난다.

## 해결

`git worktree`를 쓰면 하나의 레포에서 여러 브랜치를 별도 디렉토리에 동시에 열 수 있다.

```bash
# main 브랜치를 ../project-main 디렉토리에 열기
git worktree add ../project-main main

# 새 브랜치를 만들면서 worktree 생성
git worktree add ../project-hotfix -b hotfix/login-bug

# 기존 브랜치를 열기
git worktree add ../project-review feature/api-v2
```

이제 각 디렉토리에서 독립적으로 작업하면 된다. 브랜치 전환이 필요 없다.

```bash
# 에디터에서 여러 창으로 동시 작업
code ../project-main      # main 브랜치
code ../project-hotfix    # 핫픽스 브랜치
code .                    # 현재 feature 브랜치
```

worktree 목록 확인과 정리도 간단하다.

```bash
# 현재 worktree 목록
git worktree list
# /home/user/project              abc1234 [feature/auth]
# /home/user/project-main         def5678 [main]
# /home/user/project-hotfix       ghi9012 [hotfix/login-bug]

# 작업 끝난 worktree 삭제
git worktree remove ../project-hotfix

# 이미 디렉토리를 수동 삭제한 경우
git worktree prune
```

`.git` 데이터를 공유하기 때문에 `git clone`보다 디스크를 훨씬 적게 쓴다. 커밋 히스토리도 당연히 공유된다.

## 핵심 포인트

- `git worktree add <경로> <브랜치>`로 브랜치를 별도 디렉토리에 열 수 있다
- 브랜치 전환(`checkout`) 없이 여러 브랜치를 동시에 작업 가능
- `.git` 데이터를 공유하므로 clone보다 가볍다
- 작업 끝나면 `git worktree remove`로 정리
- 같은 브랜치를 두 개의 worktree에서 동시에 열 수는 없다
