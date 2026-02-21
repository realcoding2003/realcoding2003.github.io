---
layout: post
title: "Linux SSHキー生成 - ssh-keygen完全ガイド"
date: 2024-05-10 09:00:00 +0900
categories: [Development, Tutorial]
tags: [linux, ssh, keygen, security, server, tutorial, beginner]
author: "Kevin Park"
excerpt: "SSHキー生成から活用まで！ssh-keygenコマンドで安全なサーバーアクセス環境を構築する完全ガイド"
lang: ja
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /2024/05/10/linux-ssh-keygen-ja/
---

# Linux SSHキー生成 - ssh-keygen完全ガイド

## 🎯 概要

**すぐに使えるSSHキー生成コマンド:**

```bash
# RSAキー生成（最も一般的）
ssh-keygen -t rsa

# より安全なED25519キー生成（推奨）
ssh-keygen -t ed25519

# キーサイズ指定（RSAの場合）
ssh-keygen -t rsa -b 4096
```

**基本的な使用方法:**
1. `ssh-keygen -t rsa` を実行
2. 保存パスの質問 → エンター（デフォルトパスを使用）
3. パスワードの質問 → エンター（パスワードなしで使用）
4. パスワード再確認 → エンター

**生成されたキーの確認:**
```bash
# 公開キーの内容確認
cat ~/.ssh/id_rsa.pub

# 生成されたキーファイル一覧
ls -la ~/.ssh/
```

---

## 📚 詳細説明

### 背景と必要性

SSHキーは、パスワードなしで安全にリモートサーバーにアクセスするための認証方式です。特にGit、AWS EC2、VPSサーバーアクセス時に必須で使用され、パスワードよりもはるかに安全で便利な認証方法を提供します。

### ssh-keygenコマンドオプション詳細

#### キータイプオプション (-t)
```bash
# RSA（最も互換性が良い）
ssh-keygen -t rsa

# ED25519（より安全で高速、最新推奨）
ssh-keygen -t ed25519

# ECDSA（楕円曲線暗号化）
ssh-keygen -t ecdsa

# DSA（旧式、推奨されない）
ssh-keygen -t dsa
```

#### キーサイズ指定 (-b)
```bash
# RSA 4096ビット（より安全）
ssh-keygen -t rsa -b 4096

# RSA 2048ビット（デフォルト）
ssh-keygen -t rsa -b 2048
```

#### ファイル名とパス指定 (-f)
```bash
# 特定のファイル名で生成
ssh-keygen -t rsa -f ~/.ssh/my_server_key

# 現在のディレクトリに生成
ssh-keygen -t rsa -f ./my_key
```

#### コメント追加 (-C)
```bash
# メールアドレスや説明を追加
ssh-keygen -t rsa -C "your_email@example.com"
ssh-keygen -t rsa -C "aws-ec2-production"
```

### 実際の生成過程ステップ別説明

**ステップ1: コマンド実行**
```bash
ubuntu@server:~$ ssh-keygen -t rsa
Generating public/private rsa key pair.
```

**ステップ2: 保存場所選択**
```bash
Enter file in which to save the key (/home/ubuntu/.ssh/id_rsa): 
```
- エンター: デフォルトパス使用（`~/.ssh/id_rsa`）
- 他のパス: 希望するファイル名を入力

**ステップ3: パスワード設定**
```bash
Enter passphrase (empty for no passphrase): 
Enter same passphrase again: 
```
- エンター2回: パスワードなしで使用
- パスワード入力: 追加のセキュリティレイヤー（毎回入力が必要）

**ステップ4: 生成完了**
```bash
Your identification has been saved in /home/ubuntu/.ssh/id_rsa
Your public key has been saved in /home/ubuntu/.ssh/id_rsa.pub
The key fingerprint is:
SHA256:8MBHCzkCy/2X2CQCTeP2p9r2gUOAZokCtrCANw5DaAk ubuntu@ip-172-31-35-113
The key's randomart image is:
+---[RSA 3072]----+
|Eo++o ...        |
|X*+Boooo .       |
|=*B.*.=.+        |
|.o.. = X .       |
|      = S        |
|     . =         |
|      + .        |
|     o.. .       |
|    .....        |
+----[SHA256]-----+
```

### 生成されたファイル構造

```bash
~/.ssh/
├── id_rsa        # 秘密キー（絶対に共有してはいけない）
├── id_rsa.pub    # 公開キー（サーバーに登録するキー）
├── known_hosts   # 接続したサーバー情報
└── authorized_keys  # 許可された公開キー一覧
```

### 実際の活用事例

#### GitHub/GitLab連携
```bash
# 1. SSHキー生成
ssh-keygen -t ed25519 -C "your_email@example.com"

# 2. 公開キーをコピー
cat ~/.ssh/id_ed25519.pub

# 3. GitHub Settings > SSH Keysに追加
# 4. 接続テスト
ssh -T git@github.com
```

#### AWS EC2インスタンスアクセス
```bash
# 1. キー生成（EC2用別キー）
ssh-keygen -t rsa -f ~/.ssh/aws_ec2_key

# 2. 公開キーをEC2インスタンスに登録
# 3. 接続
ssh -i ~/.ssh/aws_ec2_key ubuntu@your-ec2-ip
```

#### 複数サーバー管理のためのSSH Config
```bash
# ~/.ssh/configファイル作成
Host production
    HostName 192.168.1.100
    User ubuntu
    IdentityFile ~/.ssh/production_key

Host development
    HostName 192.168.1.200
    User dev
    IdentityFile ~/.ssh/dev_key

# 使用方法
ssh production
ssh development
```

### セキュリティ関連注意事項

#### ファイル権限設定
```bash
# 秘密キー権限（所有者のみ読み取り可能）
chmod 600 ~/.ssh/id_rsa

# 公開キー権限
chmod 644 ~/.ssh/id_rsa.pub

# .sshディレクトリ権限
chmod 700 ~/.ssh
```

#### パスワード使用の可否
```bash
# パスワードなし（利便性優先）
ssh-keygen -t rsa

# パスワードあり（セキュリティ優先）
ssh-keygen -t rsa
# パスワード入力後、使用時毎回入力が必要
```

### エラー解決とトラブルシューティング

#### 権限関連エラー
```bash
# エラー: WARNING: UNPROTECTED PRIVATE KEY FILE!
chmod 600 ~/.ssh/id_rsa

# エラー: Permission denied (publickey)
# 1. 公開キーがサーバーに正しく登録されているか確認
# 2. SSHエージェントを確認
ssh-add -l
ssh-add ~/.ssh/id_rsa
```

#### 既存キーのバックアップと新規生成
```bash
# 既存キーをバックアップ
cp ~/.ssh/id_rsa ~/.ssh/id_rsa.backup
cp ~/.ssh/id_rsa.pub ~/.ssh/id_rsa.pub.backup

# 新しいキー生成（既存キーを上書き）
ssh-keygen -t rsa -f ~/.ssh/id_rsa
```

### 高度な使用方法

#### 一度に複数設定でキー生成
```bash
# パスワードなし、4096ビット、コメント付き
ssh-keygen -t rsa -b 4096 -C "production-server" -f ~/.ssh/prod_key -N ""
```

#### SSHエージェント活用
```bash
# SSHエージェント開始
eval "$(ssh-agent -s)"

# キー追加（パスワードは一度だけ入力）
ssh-add ~/.ssh/id_rsa

# 登録されたキー確認
ssh-add -l
```

## 結論

SSHキー生成は`ssh-keygen -t rsa`コマンド一つで簡単にできますが、セキュリティと利便性を考慮して適切なオプションを選択することが重要です。特に最新環境ではED25519キータイプの使用が推奨され、複数サーバーを管理する際はSSH Configファイルを活用して効率的に管理できます。

次のステップとして、生成したSSHキーを実際のサーバーやGitサービスに登録して、パスワードなしの安全な認証環境を構築してみてください。
