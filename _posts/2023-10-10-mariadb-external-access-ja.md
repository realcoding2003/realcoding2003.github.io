---
layout: post
title: "MariaDB外部接続許可設定完全ガイド"
date: 2023-10-10 09:00:00 +0900
categories: [Development, Database]
tags: [mariadb, mysql, database, server, configuration, troubleshooting]
author: "Kevin Park"
excerpt: "MariaDB外部接続のためのbind-address設定変更とユーザー権限設定方法を段階的に説明します。"
lang: ja
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /2023/10/10/mariadb-external-access-ja/
---

# MariaDB外部接続許可設定完全ガイド

## 🎯 概要

MariaDBに外部から接続するには、**bind-address設定の変更**と**ユーザー権限設定**の2つのステップが必要です。

### 即座の解決方法

**1. bind-addressをコメントアウト**
```bash
# my.cnfファイルを編集
sudo nano /etc/mysql/my.cnf
# または
sudo nano /etc/mysql/mariadb.conf.d/50-server.cnf
```

```ini
# この行をコメントアウト
#bind-address = 127.0.0.1
```

**2. 外部接続権限の付与**
```sql
-- MariaDB接続後に実行
GRANT ALL PRIVILEGES ON *.* TO 'username'@'%' IDENTIFIED BY 'password';
FLUSH PRIVILEGES;
```

**3. サービス再起動**
```bash
sudo systemctl restart mariadb
```

---

## 📚 詳細説明

### 背景と必要性

MariaDBはセキュリティ上の理由により、デフォルトでローカル接続（`127.0.0.1`）のみを許可しています。リモートサーバーや他のアプリケーションからデータベースに接続するには、外部接続を許可するように設定を変更する必要があります。

### 段階的設定プロセス

#### 1. 設定ファイルの場所確認

**Ubuntu/Debian系**
```bash
# 主設定ファイルの場所
/etc/mysql/my.cnf
/etc/mysql/mariadb.conf.d/50-server.cnf
```

**CentOS/RHEL系**
```bash
# 主設定ファイルの場所
/etc/my.cnf
/etc/my.cnf.d/server.cnf
```

#### 2. bind-address設定の変更

```bash
# 設定ファイルのバックアップ
sudo cp /etc/mysql/my.cnf /etc/mysql/my.cnf.backup

# 設定ファイルの編集
sudo nano /etc/mysql/my.cnf
```

**変更前**
```ini
[mysqld]
bind-address = 127.0.0.1
```

**変更後**
```ini
[mysqld]
#bind-address = 127.0.0.1
# または特定のIPのみ許可する場合
#bind-address = 0.0.0.0
```

#### 3. ユーザー権限設定

```sql
-- MariaDB接続
mysql -u root -p

-- すべてのIPからの接続を許可
CREATE USER 'myuser'@'%' IDENTIFIED BY 'mypassword';
GRANT ALL PRIVILEGES ON mydatabase.* TO 'myuser'@'%';
FLUSH PRIVILEGES;

-- 特定のIPからのみ接続を許可
CREATE USER 'myuser'@'192.168.1.100' IDENTIFIED BY 'mypassword';
GRANT ALL PRIVILEGES ON mydatabase.* TO 'myuser'@'192.168.1.100';
FLUSH PRIVILEGES;
```

#### 4. ファイアウォール設定

**Ubuntu (UFW)**
```bash
sudo ufw allow 3306/tcp
```

**CentOS (firewalld)**
```bash
sudo firewall-cmd --permanent --add-port=3306/tcp
sudo firewall-cmd --reload
```

### 実際の活用事例

#### Webアプリケーション接続
```javascript
// Node.js例
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'your-server-ip',
  user: 'myuser',
  password: 'mypassword',
  database: 'mydatabase'
});

connection.connect((err) => {
  if (err) {
    console.error('接続失敗:', err);
    return;
  }
  console.log('MariaDB接続成功！');
});
```

#### 外部ツール接続設定
```
Host: your-server-ip
Port: 3306
Username: myuser
Password: mypassword
Database: mydatabase
```

### セキュリティ考慮事項

**1. 特定IPのみ許可**
```sql
-- 特定のIP帯域のみ許可
GRANT ALL PRIVILEGES ON *.* TO 'user'@'192.168.1.%' IDENTIFIED BY 'password';
```

**2. 強力なパスワード設定**
```sql
-- 複雑なパスワードを使用
CREATE USER 'user'@'%' IDENTIFIED BY 'StrongP@ssw0rd!2023';
```

**3. 最小権限の原則**
```sql
-- 必要な権限のみ付与
GRANT SELECT, INSERT, UPDATE ON mydatabase.* TO 'user'@'%';
```

### トラブルシューティング

#### 接続失敗時の確認事項

**1. ポート確認**
```bash
netstat -tulpn | grep 3306
```

**2. サービス状態確認**
```bash
sudo systemctl status mariadb
```

**3. ログ確認**
```bash
sudo tail -f /var/log/mysql/error.log
```

#### 一般的なエラー解決

**"Access denied" エラー**
```sql
-- ユーザー権限の再確認
SELECT user, host FROM mysql.user WHERE user = 'myuser';
SHOW GRANTS FOR 'myuser'@'%';
```

**"Can't connect to server" エラー**
```bash
# ファイアウォール状態確認
sudo ufw status
# または
sudo firewall-cmd --list-all
```

## 結論

MariaDB外部接続設定は、`bind-address`のコメントアウトとユーザー権限設定だけで簡単に解決できます。しかし、セキュリティのために特定IPのみを許可し、最小権限の原則を適用することが重要です。

次のステップとして、SSL接続設定と高度なセキュリティオプションの適用を検討してください。