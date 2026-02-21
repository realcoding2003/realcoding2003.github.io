---
layout: post
title: "BitbucketアクセスキーでSSH Push設定"
date: 2023-12-10 09:00:00 +0900
categories: [Development, Tutorial]
tags: [bitbucket, ssh, git, devops, setup, tutorial]
author: "Kevin Park"
excerpt: "BitbucketプライベートリポジトリにSSHキーを使用してパスワードなしで安全にpushする完全な設定ガイド"
lang: ja
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /2023/12/10/bitbucket-ssh-access-key-setup-ja/
---

# BitbucketアクセスキーでSSH Push設定

## 🎯 概要

**BitbucketプライベートリポジトリにSSHキーを使用してパスワードなしでpushする方法**

### 主要手順
1. **SSHキー生成**
```bash
ssh-keygen -t rsa -C "your-email@example.com"
# Enterキーのみ押してデフォルト設定で生成
```

2. **SSH Agent設定**
```bash
# SSH Agent開始
eval "$(ssh-agent -s)"

# 生成したキーをSSH Agentに追加
ssh-add ~/.ssh/id_rsa

# 登録確認
ssh-add -l
```

3. **公開キーコピー**
```bash
cat ~/.ssh/id_rsa.pub
# 出力された内容全体をコピー
```

4. **Bitbucketリポジトリ設定**
   - Repository Settings → Access Keys → Add Key
   - ラベル入力、Read/Write権限チェック
   - コピーした公開キーを貼り付け

5. **SSHアドレスでPush**
```bash
git remote set-url origin ssh://git@bitbucket.org:username/repository.git
git push origin master
```

---

## 📚 詳細説明

### 背景と必要性

GitHubからBitbucketにサーバーを変更する際、プライベートリポジトリへのアクセス方法が変わります。毎回ID/パスワードを入力する煩わしさを避け、特にCI/CDパイプラインや自動化スクリプトで安全にGit作業を実行するためにSSHキー認証を設定する必要があります。

### SSHキー生成過程

#### 1. SSHキー生成
```bash
# RSAタイプのSSHキー生成
ssh-keygen -t rsa -C "your-email@example.com"

# 実行結果例
Generating public/private rsa key pair.
Enter file in which to save the key (/root/.ssh/id_rsa): [Enter]
Enter passphrase (empty for no passphrase): [Enter]
Enter same passphrase again: [Enter]
```

**主要オプション:**
- `-t rsa`: RSA暗号化アルゴリズム使用
- `-C`: コメント追加（通常はメールアドレス）
- Enterのみ押すとデフォルトパスと空のパスフレーズで設定

#### 2. 生成されたファイル確認
```bash
ls -la ~/.ssh/
# id_rsa（秘密鍵）、id_rsa.pub（公開鍵）ファイル確認

# 権限設定（セキュリティ上重要）
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub
```

### SSH Agent設定

#### SSH Agent開始とキー登録
```bash
# SSH Agentをバックグラウンド実行
eval "$(ssh-agent -s)"
# Agent pid 1234のようなメッセージ出力

# SSHキーをAgentに追加
ssh-add ~/.ssh/id_rsa

# 登録されたキー確認
ssh-add -l
# 2048 SHA256:... /root/.ssh/id_rsa (RSA)形式で出力
```

**SSH Agentを使用する理由:**
- 一度キーをロードすればセッション中は再入力不要
- 複数のリポジトリで同じキーを使用可能
- セキュリティ上メモリでのみキー管理

### Bitbucketアクセスキー登録

#### 1. リポジトリ設定へのアクセス
1. Bitbucketリポジトリページに移動
2. **Settings**クリック
3. **Access Management** → **Access Keys**選択

#### 2. アクセスキー追加
```bash
# 公開キー内容コピー
cat ~/.ssh/id_rsa.pub
# ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ... your-email@example.com
```

**設定オプション:**
- **Label**: キーを区別できる名前（例：「Production Server Key」）
- **Key**: コピーした公開キー全体内容
- **Permissions**: 
  - ✅ **Read**: リポジトリクローン/プル権限
  - ✅ **Write**: プッシュ権限（必要時チェック）

### SSH接続テストとPush

#### 1. SSH接続テスト
```bash
# Bitbucket SSH接続テスト
ssh -T git@bitbucket.org

# 成功時出力例:
# logged in as username.
# You can use git or hg to connect to Bitbucket.
```

#### 2. リモートURL変更
```bash
# 現在のリモートURL確認
git remote -v

# HTTPSからSSHに変更
git remote set-url origin ssh://git@bitbucket.org/username/repository.git

# またはgit clone時にSSHアドレス使用
git clone ssh://git@bitbucket.org/username/repository.git
```

#### 3. Push実行
```bash
git add .
git commit -m "SSH key setup test"
git push origin master

# パスワード入力なしでpush成功
# Enumerating objects: 12, done.
# Compressing objects: 100% (11/11), done.
# Total 12 (delta 6), reused 0 (delta 0)
# To ssh://git@bitbucket.org/username/repository.git
#    ca052fa..57740e4  master -> master
```

### 実際の活用事例

#### Jenkins自動バックアップ設定
```bash
#!/bin/bash
# JenkinsバックアップスクリプトでSSHキー活用

# バックアップファイル作成
tar -czf jenkins_backup_$(date +%Y%m%d).tar.gz /var/lib/jenkins/

# Gitに自動コミットとプッシュ
git add .
git commit -m "Jenkins backup $(date +%Y-%m-%d)"
git push origin master
```

#### 複数リポジトリ管理
```bash
# ~/.ssh/configファイルで複数キー管理
Host bitbucket-work
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_rsa_work

Host bitbucket-personal
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_rsa_personal

# 使用法
git clone ssh://bitbucket-work/company/project.git
git clone ssh://bitbucket-personal/username/personal-project.git
```

### 主要トラブルシューティング

#### Permission Deniedエラー
```bash
# SSHキー権限確認
ls -la ~/.ssh/id_rsa
# -rw------- 1 user user ... id_rsa (600権限必要)

# 権限修正
chmod 600 ~/.ssh/id_rsa
```

#### SSH Agent接続失敗
```bash
# SSH Agent状態確認
ps aux | grep ssh-agent

# Agent再起動
killall ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa
```

## 結論

SSHキーを使用したBitbucket認証設定は、セキュリティと利便性の両方を提供する必須の開発環境構成です。特に自動化されたCI/CD環境では、パスワード入力なしでGit作業を実行できるため非常に便利です。

**ポイント:**
- SSHキーは一度設定すれば永続的に使用可能
- 公開キーのみサーバーに登録するためセキュリティ上安全
- 複数のリポジトリとサーバーで同じキーを再利用可能
- Jenkins、GitHub Actionsなどの自動化ツールとの連携が簡単

**次のステップ:**
- SSH Configファイルを活用した複数アカウント管理
- GPGキーを追加したコミット署名設定
- 2FA（二要素認証）とSSHキーの組み合わせ使用
