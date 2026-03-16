---
layout: post
title: "Ubuntu 18.04LTSでのLEMPスタック構築：Nginx、MariaDB、PHP 7.1完全ガイド"
date: 2023-11-10 10:00:00 +0900
categories: [Development, Tutorial]
tags: [ubuntu, nginx, mariadb, php, lemp, server, hosting, tutorial, beginner]
author: "Kevin Park"
excerpt: "Ubuntu 18.04LTSでLEMPスタックを素早くインストールする完全ガイド。ワンクリックスクリプトからマルチサイトホスティング設定まで一気に解決。"
lang: ja
slug: ubuntu-lemp-stack-installation
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /2023/11/10/ubuntu-lemp-stack-installation-ja/
  - /ja/2023/11/10/ubuntu-lemp-stack-installation-ja/
  - /en/2023/11/10/ubuntu-lemp-stack-installation-ja/

---

# Ubuntu 18.04LTSでのLEMPスタック構築：Nginx、MariaDB、PHP 7.1完全ガイド

## 🎯 概要

**Ubuntu 18.04LTSでLEMPスタックを素早くインストールする方法**

### ワンクリックインストールスクリプト
```bash
#!/bin/bash
# LEMPスタック自動インストールスクリプト

# Nginxインストール
sudo apt update
sudo apt install -y nginx
sudo systemctl start nginx.service
sudo systemctl enable nginx.service

# MariaDBインストール
sudo apt-get install -y mariadb-server mariadb-client
sudo systemctl start mysql.service
sudo systemctl enable mysql.service

# PHP 7.1インストール
sudo apt-get install -y software-properties-common
sudo add-apt-repository ppa:ondrej/php
sudo apt update
sudo apt install -y php7.1 php7.1-fpm php7.1-mysql php7.1-common php7.1-curl php7.1-xml php7.1-zip php7.1-gd php7.1-mbstring

# PHP-FPM開始
sudo systemctl start php7.1-fpm
sudo systemctl enable php7.1-fpm
```

### コア設定ファイル
```nginx
# /etc/nginx/sites-available/default
server {
    listen 80;
    listen [::]:80;
    root /var/www/html;
    index index.php index.html index.htm;
    server_name _;

    location / {
        try_files $uri $uri/ =404;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php7.1-fpm.sock;
    }
}
```

### 即座テスト方法
```bash
# インストール確認
sudo nginx -t
sudo systemctl status nginx
sudo systemctl status mysql
sudo systemctl status php7.1-fpm

# PHP情報ページ作成
echo "<?php phpinfo(); ?>" | sudo tee /var/www/html/info.php
```

---

## 📚 詳細説明

### 背景と必要性

**LEMPスタックとは？**
- **L**inux：オペレーティングシステム（Ubuntu 18.04LTS）
- **E**nginx：ウェブサーバー（Apacheの代わりに使用）
- **M**ariaDB：データベース（MySQL互換）
- **P**HP：サーバーサイドスクリプト言語

**なぜこの組み合わせを選ぶのか？**
- **パフォーマンス**：NginxはApacheよりメモリ使用量が少なく、同時接続処理能力に優れている
- **安定性**：MariaDBはMySQLの完全な代替として、より良いパフォーマンスとセキュリティを提供
- **互換性**：PHP 7.1は多くのCMSやフレームワークで安定してサポートされている

### ステップバイステップのインストール過程

#### 1. システム準備
```bash
# パッケージリスト更新
sudo apt update
sudo apt upgrade -y

# 必須パッケージインストール
sudo apt install -y curl wget software-properties-common
```

#### 2. Nginxインストールと設定
```bash
# Nginxインストール
sudo apt install -y nginx

# サービス管理
sudo systemctl start nginx.service
sudo systemctl enable nginx.service

# ファイアウォール設定
sudo ufw allow 'Nginx Full'
```

**Nginx基本設定最適化：**
```nginx
# /etc/nginx/nginx.conf 主要設定
worker_processes auto;
worker_connections 1024;

# Gzip圧縮有効化
gzip on;
gzip_types text/plain application/json application/javascript text/css;

# セキュリティヘッダー追加
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
```

#### 3. MariaDBインストールとセキュリティ設定
```bash
# MariaDBインストール
sudo apt-get install -y mariadb-server mariadb-client

# サービス開始
sudo systemctl start mysql.service
sudo systemctl enable mysql.service

# セキュリティ設定（対話式）
sudo mysql_secure_installation
```

**自動化されたMariaDBセキュリティ設定：**
```bash
# 非対話式セキュリティ設定
sudo mysql -e "UPDATE mysql.user SET Password = PASSWORD('your_password') WHERE User = 'root'"
sudo mysql -e "DROP DATABASE IF EXISTS test"
sudo mysql -e "DELETE FROM mysql.user WHERE User=''"
sudo mysql -e "DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1')"
sudo mysql -e "FLUSH PRIVILEGES"
```

#### 4. PHP 7.1インストールと最適化
```bash
# Ondrej PPA追加（PHP 7.1サポート）
sudo add-apt-repository ppa:ondrej/php
sudo apt update

# PHP 7.1と必須エクステンションインストール
sudo apt install -y php7.1 php7.1-fpm php7.1-mysql php7.1-common \
php7.1-curl php7.1-xml php7.1-zip php7.1-gd php7.1-mbstring \
php7.1-json php7.1-bz2 php7.1-intl php7.1-readline
```

**PHP設定最適化：**
```ini
# /etc/php/7.1/fpm/php.ini 主要設定
memory_limit = 256M
upload_max_filesize = 100M
post_max_size = 100M
max_execution_time = 360
max_input_vars = 3000
allow_url_fopen = On

# セキュリティ設定
expose_php = Off
display_errors = Off
log_errors = On
```

### 実用的な活用事例

#### マルチサイトホスティング設定
```nginx
# /etc/nginx/sites-available/multisite
server {
    listen 80;
    server_name site1.com www.site1.com;
    root /var/www/site1;
    
    location / {
        try_files $uri $uri/ /index.php?$args;
    }
    
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php7.1-fpm.sock;
    }
}

server {
    listen 80;
    server_name site2.com www.site2.com;
    root /var/www/site2;
    
    # 同じPHP設定適用
    include /etc/nginx/snippets/php-handler.conf;
}
```

#### データベースユーザーと権限設定
```sql
-- 各サイト別DBユーザー作成
CREATE DATABASE site1_db;
CREATE USER 'site1_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON site1_db.* TO 'site1_user'@'localhost';

CREATE DATABASE site2_db;
CREATE USER 'site2_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON site2_db.* TO 'site2_user'@'localhost';

FLUSH PRIVILEGES;
```

#### 自動化スクリプト完成版
```bash
#!/bin/bash
# complete-lemp-setup.sh

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}LEMPスタックインストールを開始します...${NC}"

# システム更新
echo -e "${YELLOW}システム更新中...${NC}"
sudo apt update && sudo apt upgrade -y

# Nginxインストール
echo -e "${YELLOW}Nginxインストール中...${NC}"
sudo apt install -y nginx
sudo systemctl start nginx.service
sudo systemctl enable nginx.service

# MariaDBインストール
echo -e "${YELLOW}MariaDBインストール中...${NC}"
sudo apt-get install -y mariadb-server mariadb-client
sudo systemctl start mysql.service
sudo systemctl enable mysql.service

# PHP 7.1インストール
echo -e "${YELLOW}PHP 7.1インストール中...${NC}"
sudo apt-get install -y software-properties-common
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y php7.1 php7.1-fpm php7.1-mysql php7.1-common \
php7.1-curl php7.1-xml php7.1-zip php7.1-gd php7.1-mbstring

# PHP-FPM開始
sudo systemctl start php7.1-fpm
sudo systemctl enable php7.1-fpm

# Nginx設定
sudo tee /etc/nginx/sites-available/default > /dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    root /var/www/html;
    index index.php index.html index.htm;
    server_name _;

    location / {
        try_files \$uri \$uri/ =404;
    }

    location ~ \.php\$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php7.1-fpm.sock;
    }
}
EOF

# サービス再起動
sudo systemctl restart nginx.service
sudo systemctl restart php7.1-fpm

# テストファイル作成
echo "<?php phpinfo(); ?>" | sudo tee /var/www/html/info.php

echo -e "${GREEN}LEMPスタックインストールが完了しました！${NC}"
echo -e "${GREEN}ブラウザでhttp://your-server-ip/info.phpにアクセスして確認してください。${NC}"
```

### トラブルシューティングと最適化

#### 一般的なエラー解決
```bash
# Nginx設定テスト
sudo nginx -t

# PHP-FPMソケット確認
sudo ls -la /var/run/php/

# ログ確認
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/php7.1-fpm.log
```

#### パフォーマンス最適化
```bash
# PHP-FPMプール設定最適化
sudo nano /etc/php/7.1/fpm/pool.d/www.conf

# 主要設定値
pm = dynamic
pm.max_children = 50
pm.start_servers = 10
pm.min_spare_servers = 5
pm.max_spare_servers = 35
```

## 結論

Ubuntu 18.04LTSでのLEMPスタックインストールは、ウェブ開発環境構築の基盤となる重要なプロセスです。このガイドを通じて、Nginxの高いパフォーマンス、MariaDBの安定性、PHP 7.1の互換性をすべて活用できる堅牢なウェブサーバー環境を構築できます。

**次のステップとして：**
- SSL/TLS証明書設定（Let's Encrypt）
- 自動バックアップシステム構築
- モニタリングツールインストール（Netdata、Grafana）
- キャッシングシステム導入（Redis、Memcached）

この基盤の上で、WordPress、Laravel、またはカスタムPHPアプリケーションを安定して運用できます。