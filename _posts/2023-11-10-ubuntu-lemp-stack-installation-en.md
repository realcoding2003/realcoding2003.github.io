---
layout: post
title: "Installing LEMP Stack on Ubuntu 18.04LTS: Complete Guide to Nginx, MariaDB, PHP 7.1"
date: 2023-11-10 10:00:00 +0900
categories: [Development, Tutorial]
tags: [ubuntu, nginx, mariadb, php, lemp, server, hosting, tutorial, beginner]
author: "Kevin Park"
excerpt: "Complete guide to quickly installing LEMP stack on Ubuntu 18.04LTS. Solve everything from one-click scripts to multi-site hosting configuration at once."
lang: en
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /2023/11/10/ubuntu-lemp-stack-installation-en/
---

# Installing LEMP Stack on Ubuntu 18.04LTS: Complete Guide to Nginx, MariaDB, PHP 7.1

## 🎯 Summary

**How to quickly install LEMP stack on Ubuntu 18.04LTS**

### One-Click Installation Script
```bash
#!/bin/bash
# LEMP Stack Automatic Installation Script

# Install Nginx
sudo apt update
sudo apt install -y nginx
sudo systemctl start nginx.service
sudo systemctl enable nginx.service

# Install MariaDB
sudo apt-get install -y mariadb-server mariadb-client
sudo systemctl start mysql.service
sudo systemctl enable mysql.service

# Install PHP 7.1
sudo apt-get install -y software-properties-common
sudo add-apt-repository ppa:ondrej/php
sudo apt update
sudo apt install -y php7.1 php7.1-fpm php7.1-mysql php7.1-common php7.1-curl php7.1-xml php7.1-zip php7.1-gd php7.1-mbstring

# Start PHP-FPM
sudo systemctl start php7.1-fpm
sudo systemctl enable php7.1-fpm
```

### Core Configuration Files
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

### Immediate Testing Method
```bash
# Verify installation
sudo nginx -t
sudo systemctl status nginx
sudo systemctl status mysql
sudo systemctl status php7.1-fpm

# Create PHP info page
echo "<?php phpinfo(); ?>" | sudo tee /var/www/html/info.php
```

---

## 📚 Detailed Explanation

### Background and Necessity

**What is LEMP Stack?**
- **L**inux: Operating System (Ubuntu 18.04LTS)
- **E**nginx: Web Server (used instead of Apache)
- **M**ariaDB: Database (MySQL compatible)
- **P**HP: Server-side scripting language

**Why choose this combination?**
- **Performance**: Nginx uses less memory than Apache and has superior concurrent connection handling
- **Stability**: MariaDB is a complete replacement for MySQL with better performance and security
- **Compatibility**: PHP 7.1 is stably supported by many CMS and frameworks

### Step-by-Step Installation Process

#### 1. System Preparation
```bash
# Update package list
sudo apt update
sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget software-properties-common
```

#### 2. Nginx Installation and Configuration
```bash
# Install Nginx
sudo apt install -y nginx

# Service management
sudo systemctl start nginx.service
sudo systemctl enable nginx.service

# Firewall configuration
sudo ufw allow 'Nginx Full'
```

**Nginx Basic Configuration Optimization:**
```nginx
# /etc/nginx/nginx.conf key settings
worker_processes auto;
worker_connections 1024;

# Enable Gzip compression
gzip on;
gzip_types text/plain application/json application/javascript text/css;

# Add security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
```

#### 3. MariaDB Installation and Security Setup
```bash
# Install MariaDB
sudo apt-get install -y mariadb-server mariadb-client

# Start service
sudo systemctl start mysql.service
sudo systemctl enable mysql.service

# Security configuration (interactive)
sudo mysql_secure_installation
```

**Automated MariaDB Security Setup:**
```bash
# Non-interactive security setup
sudo mysql -e "UPDATE mysql.user SET Password = PASSWORD('your_password') WHERE User = 'root'"
sudo mysql -e "DROP DATABASE IF EXISTS test"
sudo mysql -e "DELETE FROM mysql.user WHERE User=''"
sudo mysql -e "DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1')"
sudo mysql -e "FLUSH PRIVILEGES"
```

#### 4. PHP 7.1 Installation and Optimization
```bash
# Add Ondrej PPA (PHP 7.1 support)
sudo add-apt-repository ppa:ondrej/php
sudo apt update

# Install PHP 7.1 and essential extensions
sudo apt install -y php7.1 php7.1-fpm php7.1-mysql php7.1-common \
php7.1-curl php7.1-xml php7.1-zip php7.1-gd php7.1-mbstring \
php7.1-json php7.1-bz2 php7.1-intl php7.1-readline
```

**PHP Configuration Optimization:**
```ini
# /etc/php/7.1/fpm/php.ini key settings
memory_limit = 256M
upload_max_filesize = 100M
post_max_size = 100M
max_execution_time = 360
max_input_vars = 3000
allow_url_fopen = On

# Security settings
expose_php = Off
display_errors = Off
log_errors = On
```

### Real-World Use Cases

#### Multi-Site Hosting Configuration
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
    
    # Apply same PHP configuration
    include /etc/nginx/snippets/php-handler.conf;
}
```

#### Database User and Permission Setup
```sql
-- Create DB users for each site
CREATE DATABASE site1_db;
CREATE USER 'site1_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON site1_db.* TO 'site1_user'@'localhost';

CREATE DATABASE site2_db;
CREATE USER 'site2_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON site2_db.* TO 'site2_user'@'localhost';

FLUSH PRIVILEGES;
```

#### Complete Automation Script
```bash
#!/bin/bash
# complete-lemp-setup.sh

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting LEMP Stack installation...${NC}"

# System update
echo -e "${YELLOW}Updating system...${NC}"
sudo apt update && sudo apt upgrade -y

# Install Nginx
echo -e "${YELLOW}Installing Nginx...${NC}"
sudo apt install -y nginx
sudo systemctl start nginx.service
sudo systemctl enable nginx.service

# Install MariaDB
echo -e "${YELLOW}Installing MariaDB...${NC}"
sudo apt-get install -y mariadb-server mariadb-client
sudo systemctl start mysql.service
sudo systemctl enable mysql.service

# Install PHP 7.1
echo -e "${YELLOW}Installing PHP 7.1...${NC}"
sudo apt-get install -y software-properties-common
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y php7.1 php7.1-fpm php7.1-mysql php7.1-common \
php7.1-curl php7.1-xml php7.1-zip php7.1-gd php7.1-mbstring

# Start PHP-FPM
sudo systemctl start php7.1-fpm
sudo systemctl enable php7.1-fpm

# Nginx configuration
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

# Restart services
sudo systemctl restart nginx.service
sudo systemctl restart php7.1-fpm

# Create test file
echo "<?php phpinfo(); ?>" | sudo tee /var/www/html/info.php

echo -e "${GREEN}LEMP Stack installation completed!${NC}"
echo -e "${GREEN}Visit http://your-server-ip/info.php in your browser to verify.${NC}"
```

### Troubleshooting and Optimization

#### Common Error Resolution
```bash
# Test Nginx configuration
sudo nginx -t

# Check PHP-FPM socket
sudo ls -la /var/run/php/

# Check logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/php7.1-fpm.log
```

#### Performance Optimization
```bash
# Optimize PHP-FPM pool settings
sudo nano /etc/php/7.1/fpm/pool.d/www.conf

# Key configuration values
pm = dynamic
pm.max_children = 50
pm.start_servers = 10
pm.min_spare_servers = 5
pm.max_spare_servers = 35
```

## Conclusion

Installing LEMP stack on Ubuntu 18.04LTS is a crucial process that forms the foundation of web development environment setup. Through this guide, you can build a robust web server environment that leverages Nginx's high performance, MariaDB's stability, and PHP 7.1's compatibility.

**Next steps include:**
- SSL/TLS certificate setup (Let's Encrypt)
- Automated backup system implementation
- Monitoring tools installation (Netdata, Grafana)
- Caching system integration (Redis, Memcached)

On this foundation, you can reliably operate WordPress, Laravel, or custom PHP applications.