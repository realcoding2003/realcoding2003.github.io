---
layout: post
title: "git worktree: Work on Multiple Branches Without Switching"
date: 2026-03-14 09:00:00 +0900
categories: [Development, Tips]
tags: [Git, git-worktree, CLI, Version-Control]
author: "Kevin Park"
lang: en
slug: git-worktree-multiple-branch-management
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2026/03/14/git-worktree-multiple-branch-management-en/
  - /2026/03/14/git-worktree-multiple-branch-management-en/
excerpt: "Use git worktree to open multiple branches in separate directories simultaneously. No more stash-checkout-pop cycles."
---

## Problem

You're deep in a feature branch when a hotfix request comes in. Stash changes, checkout main, create a hotfix branch, fix the bug, push, then switch back and pop the stash. Repeat this several times a day and it gets old fast.

## Solution

`git worktree` lets you check out multiple branches into separate directories from a single repo.

```bash
# Open main branch in a separate directory
git worktree add ../project-main main

# Create a new branch with a worktree
git worktree add ../project-hotfix -b hotfix/login-bug

# Open an existing branch
git worktree add ../project-review feature/api-v2
```

Now work in each directory independently. No branch switching needed.

```bash
# Open multiple editor windows for simultaneous work
code ../project-main      # main branch
code ../project-hotfix    # hotfix branch
code .                    # current feature branch
```

Managing worktrees is straightforward:

```bash
# List all worktrees
git worktree list
# /home/user/project              abc1234 [feature/auth]
# /home/user/project-main         def5678 [main]
# /home/user/project-hotfix       ghi9012 [hotfix/login-bug]

# Remove a finished worktree
git worktree remove ../project-hotfix

# Clean up manually deleted worktree directories
git worktree prune
```

Worktrees share `.git` data, so they use far less disk space than a full `git clone`. Commit history is shared across all worktrees.

## Key Points

- `git worktree add <path> <branch>` opens a branch in a separate directory
- Work on multiple branches simultaneously without `checkout`
- Shares `.git` data — much lighter than cloning
- Clean up with `git worktree remove` when done
- The same branch cannot be checked out in two worktrees at once
