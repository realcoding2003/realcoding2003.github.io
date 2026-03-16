---
layout: post
title: "git stash push -m で特定ファイルだけを一時退避する方法"
date: 2026-03-16 09:00:00 +0900
categories: [Development, Tips]
tags: [Git, git-stash, CLI, バージョン管理]
author: "Kevin Park"
lang: ja
slug: git-stash-push-partial-save
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /ja/2026/03/16/git-stash-push-partial-save-ja/
  - /2026/03/16/git-stash-push-partial-save-ja/
excerpt: "git stash pushを使って特定のファイルだけをスタッシュする方法を解説します。"
---

## 問題

ブランチで複数のファイルを同時に修正しているとき、一部のファイルだけを一時的に退避したいことがあります。`git stash`を実行すると、変更したファイルがすべてスタッシュされてしまいます。

## 解決方法

`git stash push`にファイルパスを指定すれば、特定のファイルだけをスタッシュできます。

```bash
# 特定のファイルだけをスタッシュ
git stash push -m "ログインフォーム修正中" -- src/components/LoginForm.tsx

# 複数ファイルも可能
git stash push -m "APIリファクタリング" -- src/api/user.ts src/api/auth.ts

# ディレクトリ単位も対応
git stash push -m "スタイル作業" -- src/styles/
```

以前は`git stash save`を使っていましたが、こちらはdeprecatedになっています。`push`の方がファイル指定もでき、より柔軟です。

スタッシュの確認と復元は同じ方法です。

```bash
# 一覧確認
git stash list
# stash@{0}: On feature/login: ログインフォーム修正中
# stash@{1}: On feature/login: APIリファクタリング

# 復元（スタッシュを残す）
git stash apply stash@{0}

# 復元して削除
git stash pop stash@{0}
```

## ポイント

- `git stash push -m "メッセージ" -- ファイルパス`で特定ファイルだけスタッシュ可能です
- `git stash save`はdeprecated、`push`を使いましょう
- `-m`メッセージを入れないと、後でどのスタッシュが何か分からなくなります
- `apply`はスタッシュを残し、`pop`は復元と同時に削除します
