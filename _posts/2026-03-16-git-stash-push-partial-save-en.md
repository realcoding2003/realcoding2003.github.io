---
layout: post
title: "Selectively Stash Files with git stash push -m"
date: 2026-03-16 09:00:00 +0900
categories: [Development, Tips]
tags: [Git, git-stash, CLI, Version-Control]
author: "Kevin Park"
lang: en
slug: git-stash-push-partial-save
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2026/03/16/git-stash-push-partial-save-en/
  - /2026/03/16/git-stash-push-partial-save-en/
excerpt: "How to stash only specific files using git stash push instead of stashing everything at once."
---

## Problem

You're working on multiple files in a branch but need to temporarily set aside only some of them. Running `git stash` stashes everything, which isn't what you want.

## Solution

Use `git stash push` with file paths to selectively stash.

```bash
# Stash a specific file
git stash push -m "login form WIP" -- src/components/LoginForm.tsx

# Multiple files
git stash push -m "API refactor" -- src/api/user.ts src/api/auth.ts

# Entire directory
git stash push -m "style changes" -- src/styles/
```

The older `git stash save` is deprecated. `push` is more flexible and supports file-level granularity.

Managing stashes works the same way:

```bash
# List stashes
git stash list
# stash@{0}: On feature/login: login form WIP
# stash@{1}: On feature/login: API refactor

# Apply without removing
git stash apply stash@{0}

# Apply and remove
git stash pop stash@{0}
```

## Key Points

- `git stash push -m "message" -- path/to/file` stashes only specified files
- `git stash save` is deprecated — use `push` instead
- Always add `-m` messages to identify stashes later
- `apply` keeps the stash entry; `pop` removes it after applying
