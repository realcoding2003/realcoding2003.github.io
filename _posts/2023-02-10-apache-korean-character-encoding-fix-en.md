---
layout: post
title: "Fixing Korean Character Encoding Issues After Apache Server Migration"
date: 2023-02-10 04:22:00 +0900
categories: [Apache, Web Server, Troubleshooting]
tags: [Apache, Korean-encoding, charset, UTF-8, encoding, server-migration]
author: Kevin Park
lang: en
excerpt: "Learn about the causes of Korean character corruption after Apache server migration and how to resolve it through charset configuration."
keywords: "Apache, Korean encoding, charset, UTF-8, encoding, server migration"
description: "Learn about the causes of Korean character corruption after Apache server migration and how to resolve it through charset configuration."
mermaid: true
sitemap:
  changefreq: weekly
  priority: 0.8
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /2023/02/10/apache-korean-character-encoding-fix-en/
---

After server migration or fresh Apache installation, Korean characters on websites may appear corrupted. This issue typically occurs due to **improper charset configuration**.

## 🚨 Problem Symptoms

After server migration, you may experience the following symptoms:

- Korean characters on web pages display as `?` or corrupted characters
- Manual encoding change in browser is required for proper display
- Previously normal Korean content appears corrupted
- Korean data retrieved from database doesn't display correctly

## 🔍 Root Cause Analysis

This phenomenon is **often caused by missing charset configuration**.

When the default character encoding is not set in Apache server, browsers must guess the appropriate encoding, and during this process, Korean characters are not properly interpreted, resulting in corruption.

## 📁 Configuration File Location

To resolve this issue, you need to check the following file:

```
/etc/apache2/conf-available/charset.conf
```

## 🔧 Checking Current Configuration

First, let's check the current contents of the charset configuration file:

```bash
sudo nano /etc/apache2/conf-available/charset.conf
```

When you open the file, you'll see content like this:

```apache
# Read the documentation before enabling AddDefaultCharset.
# In general, it is only a good idea if you know that all your files
# have this encoding. It will override any encoding given in the files
# in meta http-equiv or xml encoding tags.

# AddDefaultCharset UTF-8

# vim: syntax=apache ts=4 sw=4 sts=4 sr noet
```

As you can see, **`AddDefaultCharset UTF-8` is commented out**.

## ✅ Solution

### 1. Uncomment the Line

Uncomment the following line:

**Before:**
```apache
# AddDefaultCharset UTF-8
```

**After:**
```apache
AddDefaultCharset UTF-8
```

### 2. Enable Configuration

Enable the charset configuration:

```bash
sudo a2enconf charset
```

### 3. Restart Server

After changing the configuration, restart or reload the Apache server:

```bash
sudo service apache2 restart
```

or

```bash
sudo service apache2 reload
```

## 🧪 Verifying Configuration

How to verify that the configuration has been applied correctly:

### 1. Check HTTP Headers

In browser developer tools, check Response Headers. It should display:

```
Content-Type: text/html; charset=UTF-8
```

### 2. Command Line Verification

```bash
curl -I http://your-domain.com
```

### 3. Apache Configuration Test

```bash
sudo apache2ctl configtest
```

## 💡 Additional Considerations

### 1. Relationship with HTML Meta Tags

The `AddDefaultCharset UTF-8` setting takes precedence over HTML meta tags:

```html
<meta charset="UTF-8">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
```

### 2. Virtual Host-Specific Configuration

To apply only to specific virtual hosts:

```apache
<VirtualHost *:80>
    ServerName example.com
    AddDefaultCharset UTF-8
    # Other configurations...
</VirtualHost>
```

### 3. Directory-Specific Configuration

To apply only to specific directories:

```apache
<Directory "/var/www/html/korean">
    AddDefaultCharset UTF-8
</Directory>
```

## ⚠️ Precautions

1. **Check Existing Encoding**: Verify that all files are saved in UTF-8
2. **Database Configuration**: Also check database charset settings (MySQL, etc.)
3. **Backup**: Always backup important data before configuration changes
4. **Testing**: Test in a test environment before applying to production

## 🔍 Additional Troubleshooting

### When Using with PHP

It's recommended to specify encoding in PHP files as well:

```php
<?php
header('Content-Type: text/html; charset=UTF-8');
?>
```

### Using .htaccess Files

You can also use .htaccess files for directory-specific settings:

```apache
AddDefaultCharset UTF-8
```

## 📚 Conclusion

Korean character corruption after Apache server migration is mostly caused by missing charset configuration.

**Key Solution Steps:**
1. Check `/etc/apache2/conf-available/charset.conf` file
2. Uncomment `AddDefaultCharset UTF-8`
3. Enable configuration and restart server

This method resolves most Korean character corruption issues. If problems persist, also check database charset settings and PHP configuration.

---

💡 **Tip**: When building new servers, setting UTF-8 charset from the beginning can prevent these issues!