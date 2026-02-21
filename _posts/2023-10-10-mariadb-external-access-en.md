---
layout: post
title: "Complete Guide to Configuring MariaDB External Access"
date: 2023-10-10 09:00:00 +0900
categories: [Development, Database]
tags: [mariadb, mysql, database, server, configuration, troubleshooting]
author: "Kevin Park"
excerpt: "Step-by-step guide to configure MariaDB for external access by modifying bind-address settings and user permissions."
lang: en
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /2023/10/10/mariadb-external-access-en/
---

# Complete Guide to Configuring MariaDB External Access

## 🎯 Summary

To enable external access to MariaDB, you need two steps: **modifying bind-address settings** and **configuring user permissions**.

### Quick Solution

**1. Comment out bind-address**
```bash
# Edit my.cnf file
sudo nano /etc/mysql/my.cnf
# or
sudo nano /etc/mysql/mariadb.conf.d/50-server.cnf
```

```ini
# Comment out this line
#bind-address = 127.0.0.1
```

**2. Grant external access permissions**
```sql
-- Execute after connecting to MariaDB
GRANT ALL PRIVILEGES ON *.* TO 'username'@'%' IDENTIFIED BY 'password';
FLUSH PRIVILEGES;
```

**3. Restart service**
```bash
sudo systemctl restart mariadb
```

---

## 📚 Detailed Explanation

### Background and Necessity

MariaDB by default only allows local connections (`127.0.0.1`) for security reasons. To connect from remote servers or other applications, you must configure the database to allow external access.

### Step-by-Step Configuration Process

#### 1. Locate Configuration Files

**Ubuntu/Debian Systems**
```bash
# Main configuration file locations
/etc/mysql/my.cnf
/etc/mysql/mariadb.conf.d/50-server.cnf
```

**CentOS/RHEL Systems**
```bash
# Main configuration file locations
/etc/my.cnf
/etc/my.cnf.d/server.cnf
```

#### 2. Modify bind-address Settings

```bash
# Backup configuration file
sudo cp /etc/mysql/my.cnf /etc/mysql/my.cnf.backup

# Edit configuration file
sudo nano /etc/mysql/my.cnf
```

**Before Change**
```ini
[mysqld]
bind-address = 127.0.0.1
```

**After Change**
```ini
[mysqld]
#bind-address = 127.0.0.1
# Or to allow specific IPs only
#bind-address = 0.0.0.0
```

#### 3. Configure User Permissions

```sql
-- Connect to MariaDB
mysql -u root -p

-- Allow access from all IPs
CREATE USER 'myuser'@'%' IDENTIFIED BY 'mypassword';
GRANT ALL PRIVILEGES ON mydatabase.* TO 'myuser'@'%';
FLUSH PRIVILEGES;

-- Allow access from specific IP only
CREATE USER 'myuser'@'192.168.1.100' IDENTIFIED BY 'mypassword';
GRANT ALL PRIVILEGES ON mydatabase.* TO 'myuser'@'192.168.1.100';
FLUSH PRIVILEGES;
```

#### 4. Firewall Configuration

**Ubuntu (UFW)**
```bash
sudo ufw allow 3306/tcp
```

**CentOS (firewalld)**
```bash
sudo firewall-cmd --permanent --add-port=3306/tcp
sudo firewall-cmd --reload
```

### Practical Use Cases

#### Web Application Connection
```javascript
// Node.js example
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'your-server-ip',
  user: 'myuser',
  password: 'mypassword',
  database: 'mydatabase'
});

connection.connect((err) => {
  if (err) {
    console.error('Connection failed:', err);
    return;
  }
  console.log('MariaDB connection successful!');
});
```

#### External Tool Connection Settings
```
Host: your-server-ip
Port: 3306
Username: myuser
Password: mypassword
Database: mydatabase
```

### Security Considerations

**1. Allow Specific IPs Only**
```sql
-- Allow specific IP range only
GRANT ALL PRIVILEGES ON *.* TO 'user'@'192.168.1.%' IDENTIFIED BY 'password';
```

**2. Set Strong Passwords**
```sql
-- Use complex passwords
CREATE USER 'user'@'%' IDENTIFIED BY 'StrongP@ssw0rd!2023';
```

**3. Principle of Least Privilege**
```sql
-- Grant only necessary permissions
GRANT SELECT, INSERT, UPDATE ON mydatabase.* TO 'user'@'%';
```

### Troubleshooting

#### Items to Check When Connection Fails

**1. Check Port**
```bash
netstat -tulpn | grep 3306
```

**2. Check Service Status**
```bash
sudo systemctl status mariadb
```

**3. Check Logs**
```bash
sudo tail -f /var/log/mysql/error.log
```

#### Common Error Solutions

**"Access denied" Error**
```sql
-- Recheck user permissions
SELECT user, host FROM mysql.user WHERE user = 'myuser';
SHOW GRANTS FOR 'myuser'@'%';
```

**"Can't connect to server" Error**
```bash
# Check firewall status
sudo ufw status
# or
sudo firewall-cmd --list-all
```

## Conclusion

Configuring MariaDB external access can be easily resolved by commenting out the `bind-address` and setting user permissions. However, for security purposes, it's important to allow only specific IPs and apply the principle of least privilege.

Consider implementing SSL connections and advanced security options as your next steps.