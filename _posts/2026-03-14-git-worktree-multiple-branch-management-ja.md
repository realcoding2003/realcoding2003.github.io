---
layout: post
title: "git worktreeでブランチ切り替えなしに複数ブランチを同時作業する方法"
date: 2026-03-14 09:00:00 +0900
categories: [Development, Tips]
tags: [Git, git-worktree, CLI, バージョン管理]
author: "Kevin Park"
lang: ja
slug: git-worktree-multiple-branch-management
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /ja/2026/03/14/git-worktree-multiple-branch-management-ja/
  - /2026/03/14/git-worktree-multiple-branch-management-ja/
excerpt: "git worktreeで一つのリポジトリから複数のブランチを別ディレクトリで同時に開いて作業する方法を解説します。"
---

## 問題

featureブランチで作業中に突然ホットフィックスの依頼が来ることがあります。`git stash`して`git checkout main`してホットフィックスブランチを作って...終わったら元のブランチに戻って`git stash pop`。これが一日に何回も繰り返されると、かなりストレスです。

## 解決方法

`git worktree`を使えば、一つのリポジトリから複数のブランチを別々のディレクトリに同時に開くことができます。

```bash
# mainブランチを../project-mainディレクトリに開く
git worktree add ../project-main main

# 新しいブランチを作りながらworktreeを作成
git worktree add ../project-hotfix -b hotfix/login-bug

# 既存のブランチを開く
git worktree add ../project-review feature/api-v2
```

あとは各ディレクトリで独立して作業するだけです。ブランチの切り替えは不要です。

```bash
# エディタで複数ウィンドウを開いて同時作業
code ../project-main      # mainブランチ
code ../project-hotfix    # ホットフィックスブランチ
code .                    # 現在のfeatureブランチ
```

worktreeの一覧確認と整理も簡単です。

```bash
# 現在のworktree一覧
git worktree list
# /home/user/project              abc1234 [feature/auth]
# /home/user/project-main         def5678 [main]
# /home/user/project-hotfix       ghi9012 [hotfix/login-bug]

# 作業が終わったworktreeを削除
git worktree remove ../project-hotfix

# すでにディレクトリを手動削除した場合
git worktree prune
```

`.git`データを共有するため、`git clone`よりディスク使用量がはるかに少ないです。コミット履歴も当然共有されます。

## ポイント

- `git worktree add <パス> <ブランチ>`でブランチを別ディレクトリに開けます
- ブランチ切り替え（`checkout`）なしで複数ブランチの同時作業が可能です
- `.git`データを共有するのでcloneより軽量です
- 作業が終わったら`git worktree remove`で整理します
- 同じブランチを2つのworktreeで同時に開くことはできません
