---
layout: post
title: "MySQL/MariaDBコンソールでのデータベースバックアップ・復旧完全ガイド"
date: 2023-06-20 10:00:00 +0900
categories: [Development, Database]
tags: [mysql, mariadb, database, backup, restore, console, mysqldump]
author: "Kevin Park"
lang: ja
excerpt: "GUIツールなしでコンソールからMySQL/MariaDBデータベースをバックアップ・復旧する方法。ホスティング環境ですぐに使えるコマンド集"
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /2023/06/20/mysql-mariadb-console-backup-restore-ja/
---

# MySQL/MariaDBコンソールでのデータベースバックアップ・復旧完全ガイド

## 🎯 核心解決策（すぐに使用可能）

ホスティングや制限的な環境でGUIツールなしでコンソールからデータベースをバックアップ・復旧する際に使用するコマンドです。

### 最も多く使用されるパターン

#### 1. 単一データベースバックアップ（最も一般的）
```bash
# 基本バックアップ
mysqldump -u[ユーザー名] -p[パスワード] [データベース名] > backup.sql

# 実際の使用例
mysqldump -umyuser -pmypassword mywebsite_db > website_backup_20230620.sql
```

#### 2. 単一データベース復旧
```bash
# 基本復旧
mysql -u[ユーザー名] -p[パスワード] [データベース名] < backup.sql

# 実際の使用例
mysql -umyuser -pmypassword mywebsite_db < website_backup_20230620.sql
```

#### 3. 全データベースバックアップ（サーバー移行時）
```bash
# 全データベースバックアップ
mysqldump -u[ユーザー名] -p[パスワード] --all-databases > full_backup.sql

# 実際の使用例
mysqldump -uroot -pmypassword --all-databases > full_server_backup_20230620.sql
```

### ⚠️ 重要な使用法注意事項
- **-uと-pの後にスペースなし**でユーザー名とパスワードを続けて記述
- パスワードに特殊文字がある場合はシングルクォートで囲む：`-p'my@pass!'`
- バックアップファイル名に日付を含めることを推奨：`backup_YYYYMMDD.sql`

---

## 📚 詳細説明

### 背景と必要性

現代のデータベース管理では、phpMyAdmin、MySQL Workbench、DBeaverなどのGUIツールが便利なバックアップ・復旧機能を提供しています。しかし、次のような状況ではコンソールコマンドが必須です：

- **ホスティング環境**：共有ホスティングでSSHアクセスのみ可能な場合
- **サーバー自動化**：crontabを利用した定期バックアップ設定
- **大容量データ**：GUIツールのタイムアウトやメモリ制限
- **リモートサーバー**：ネットワーク制約でGUIアクセスが困難な環境

### 技術的詳細

#### mysqldumpオプション詳細説明

```bash
# 構造のみバックアップ（データ除外）
mysqldump -u[ユーザー名] -p[パスワード] --no-data [DB名] > structure_only.sql

# データのみバックアップ（構造除外）
mysqldump -u[ユーザー名] -p[パスワード] --no-create-info [DB名] > data_only.sql

# 圧縮バックアップ（容量節約）
mysqldump -u[ユーザー名] -p[パスワード] [DB名] | gzip > backup.sql.gz

# 特定テーブルのみバックアップ
mysqldump -u[ユーザー名] -p[パスワード] [DB名] [テーブル名] > table_backup.sql
```

#### 復旧時の注意事項

```bash
# データベースが存在しない場合、まず作成
mysql -u[ユーザー名] -p[パスワード] -e "CREATE DATABASE IF NOT EXISTS [DB名];"

# その後復旧実行
mysql -u[ユーザー名] -p[パスワード] [DB名] < backup.sql
```

### 実際の活用事例

#### 1. 定期バックアップ自動化（crontab）
```bash
# crontab -e で編集
# 毎日午前2時にバックアップ
0 2 * * * /usr/bin/mysqldump -umyuser -pmypass mydb > /backup/daily_$(date +\%Y\%m\%d).sql

# 毎週日曜日午前3時に全体バックアップ
0 3 * * 0 /usr/bin/mysqldump -umyuser -pmypass --all-databases > /backup/weekly_$(date +\%Y\%m\%d).sql
```

#### 2. サーバー間データ移行
```bash
# 元のサーバーでバックアップ
mysqldump -uolduser -poldpass production_db > migration_backup.sql

# ファイル転送（scpを使用）
scp migration_backup.sql user@newserver:/tmp/

# 新しいサーバーで復旧
mysql -unewuser -pnewpass production_db < /tmp/migration_backup.sql
```

#### 3. エラー処理とトラブルシューティング

**よく発生するエラーと解決方法：**

```bash
# エラー：Access denied
# 解決：ユーザー権限確認
GRANT SELECT, SHOW DATABASES ON *.* TO 'username'@'localhost';

# エラー：Unknown database
# 解決：データベースをまず作成
mysql -u[ユーザー名] -p[パスワード] -e "CREATE DATABASE [DB名];"

# エラー：Table doesn't exist
# 解決：外部キー制約を一時的に解除してから復旧
mysql -u[ユーザー名] -p[パスワード] -e "SET FOREIGN_KEY_CHECKS=0;"
mysql -u[ユーザー名] -p[パスワード] [DB名] < backup.sql
mysql -u[ユーザー名] -p[パスワード] -e "SET FOREIGN_KEY_CHECKS=1;"
```

#### 4. 大容量データベース処理

```bash
# 進行状況を表示しながらバックアップ
mysqldump -u[ユーザー名] -p[パスワード] [DB名] | pv > backup.sql

# 圧縮と同時にバックアップ（ディスク容量節約）
mysqldump -u[ユーザー名] -p[パスワード] [DB名] | gzip > backup.sql.gz

# 圧縮ファイルから直接復旧
gunzip < backup.sql.gz | mysql -u[ユーザー名] -p[パスワード] [DB名]
```

## 結論

コンソールを利用したMySQL/MariaDBバックアップと復旧は、ホスティング環境や自動化が必要な状況で非常に有用です。特に`-u`と`-p`オプションの後にスペースなしでユーザー名とパスワードを続けて書くことが重要なポイントです。

**次のステップとして推奨する内容：**
- 定期バックアップスクリプトの作成とcrontabの設定
- バックアップファイルの暗号化とリモートストレージへのアップロード
- 復旧テスト環境の構築と検証プロセスの確立

データは企業の生命線です。定期的なバックアップと復旧テストを通じて安全なデータ管理を実践しましょう。