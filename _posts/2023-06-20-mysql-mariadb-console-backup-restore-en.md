---
layout: post
title: "Complete Guide to MySQL/MariaDB Database Backup and Restore via Console"
date: 2023-06-20 10:00:00 +0900
categories: [Development, Database]
tags: [mysql, mariadb, database, backup, restore, console, mysqldump]
author: "Kevin Park"
lang: en
excerpt: "How to backup and restore MySQL/MariaDB databases via console without GUI tools. Ready-to-use command collection for hosting environments"
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /2023/06/20/mysql-mariadb-console-backup-restore-en/
---

# Complete Guide to MySQL/MariaDB Database Backup and Restore via Console

## 🎯 Core Solutions (Ready to Use)

These are commands used to backup and restore databases via console without GUI tools in hosting or restricted environments.

### Most Commonly Used Patterns

#### 1. Single Database Backup (Most Common)
```bash
# Basic backup
mysqldump -u[username] -p[password] [database_name] > backup.sql

# Real usage example
mysqldump -umyuser -pmypassword mywebsite_db > website_backup_20230620.sql
```

#### 2. Single Database Restore
```bash
# Basic restore
mysql -u[username] -p[password] [database_name] < backup.sql

# Real usage example
mysql -umyuser -pmypassword mywebsite_db < website_backup_20230620.sql
```

#### 3. Full Database Backup (For Server Migration)
```bash
# Backup all databases
mysqldump -u[username] -p[password] --all-databases > full_backup.sql

# Real usage example
mysqldump -uroot -pmypassword --all-databases > full_server_backup_20230620.sql
```

### ⚠️ Important Usage Notes
- **No spaces after -u and -p** when writing username and password
- Wrap password with single quotes if it contains special characters: `-p'my@pass!'`
- Recommended to include date in backup filename: `backup_YYYYMMDD.sql`

---

## 📚 Detailed Explanation

### Background and Necessity

Modern database management provides convenient backup/restore features through GUI tools like phpMyAdmin, MySQL Workbench, and DBeaver. However, console commands are essential in the following situations:

- **Hosting environments**: When only SSH access is available on shared hosting
- **Server automation**: Setting up regular backups using crontab
- **Large data volumes**: GUI tool timeout or memory limitations
- **Remote servers**: Network constraints making GUI access difficult

### Technical Details

#### Detailed mysqldump Options

```bash
# Backup structure only (exclude data)
mysqldump -u[username] -p[password] --no-data [database_name] > structure_only.sql

# Backup data only (exclude structure)
mysqldump -u[username] -p[password] --no-create-info [database_name] > data_only.sql

# Compressed backup (save space)
mysqldump -u[username] -p[password] [database_name] | gzip > backup.sql.gz

# Backup specific table only
mysqldump -u[username] -p[password] [database_name] [table_name] > table_backup.sql
```

#### Restore Precautions

```bash
# Create database first if it doesn't exist
mysql -u[username] -p[password] -e "CREATE DATABASE IF NOT EXISTS [database_name];"

# Then execute restore
mysql -u[username] -p[password] [database_name] < backup.sql
```

### Practical Use Cases

#### 1. Automated Regular Backup (Crontab)
```bash
# Edit with crontab -e
# Daily backup at 2 AM
0 2 * * * /usr/bin/mysqldump -umyuser -pmypass mydb > /backup/daily_$(date +\%Y\%m\%d).sql

# Weekly full backup at 3 AM on Sundays
0 3 * * 0 /usr/bin/mysqldump -umyuser -pmypass --all-databases > /backup/weekly_$(date +\%Y\%m\%d).sql
```

#### 2. Data Migration Between Servers
```bash
# Backup on source server
mysqldump -uolduser -poldpass production_db > migration_backup.sql

# Transfer file (using scp)
scp migration_backup.sql user@newserver:/tmp/

# Restore on new server
mysql -unewuser -pnewpass production_db < /tmp/migration_backup.sql
```

#### 3. Error Handling and Troubleshooting

**Common errors and solutions:**

```bash
# Error: Access denied
# Solution: Check user permissions
GRANT SELECT, SHOW DATABASES ON *.* TO 'username'@'localhost';

# Error: Unknown database
# Solution: Create database first
mysql -u[username] -p[password] -e "CREATE DATABASE [database_name];"

# Error: Table doesn't exist
# Solution: Temporarily disable foreign key constraints before restore
mysql -u[username] -p[password] -e "SET FOREIGN_KEY_CHECKS=0;"
mysql -u[username] -p[password] [database_name] < backup.sql
mysql -u[username] -p[password] -e "SET FOREIGN_KEY_CHECKS=1;"
```

#### 4. Large Database Handling

```bash
# Backup with progress indicator
mysqldump -u[username] -p[password] [database_name] | pv > backup.sql

# Backup with compression (save disk space)
mysqldump -u[username] -p[password] [database_name] | gzip > backup.sql.gz

# Direct restore from compressed file
gunzip < backup.sql.gz | mysql -u[username] -p[password] [database_name]
```

## Conclusion

MySQL/MariaDB backup and restore via console is very useful in hosting environments or situations requiring automation. The key point is to write the username and password immediately after `-u` and `-p` options without spaces.

**Recommended next steps:**
- Write regular backup scripts and set up crontab
- Implement backup file encryption and remote storage upload
- Establish recovery test environment and verification processes

Data is the lifeblood of business. Practice safe data management through regular backups and recovery testing.