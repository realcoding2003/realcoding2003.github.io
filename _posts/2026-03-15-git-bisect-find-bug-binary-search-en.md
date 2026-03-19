---
layout: post
title: "git bisect - Find the Bug-Introducing Commit with Binary Search"
date: 2026-03-15 09:00:00 +0900
categories: [Development, Tips]
tags: [Git, git bisect, Debugging, Binary Search]
author: "Kevin Park"
lang: en
excerpt: "Use git bisect to quickly find the exact commit that introduced a bug using binary search."
---

## Problem

A bug appeared at some point, but with hundreds of commits to check, going through them one by one was impossible. All I knew was "it worked last week."

## Solution

`git bisect` uses binary search to find the commit that introduced a bug. Even 1024 commits only need 10 checks.

```bash
# Start bisect
git bisect start

# Mark current state (has bug) as bad
git bisect bad

# Mark a known working commit as good
git bisect good abc1234
```

Git checks out a commit in the middle. Test it and report the result.

```bash
# If this commit has the bug
git bisect bad

# If this commit works fine
git bisect good

# Repeat until it finds the culprit
# "abc5678 is the first bad commit"
```

With a test script, you can fully automate the process.

```bash
# Exit code 0 = good, non-zero = bad
git bisect run npm test

# Or use a custom script
git bisect run ./check-bug.sh
```

When done, return to your original branch.

```bash
git bisect reset
```

## Key Points

- For N commits, you need at most log2(N) checks. 1000 commits? Just 10 checks
- `git bisect run` automates the entire process — hands-free bug hunting
- If you hit a commit that doesn't build, use `git bisect skip` to skip it
