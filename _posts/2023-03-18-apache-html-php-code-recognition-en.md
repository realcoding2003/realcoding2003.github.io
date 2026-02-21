---
layout: post
title: "Configuring Apache to Recognize PHP Code in HTML Files"
date: 2023-03-18 14:00:00 +0900
categories: [Apache, PHP, Web Server]
tags: [Apache, PHP, HTML, webserver, configuration, mime.conf]
author: Kevin Park
lang: en
excerpt: "Learn how to configure Apache web server to execute PHP code in files with .html extension through step-by-step instructions."
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /2023/03/18/apache-html-php-code-recognition-en/
---

Typically, Apache web server only executes PHP code in files with the `.php` extension. However, there are times when you need to execute PHP code in `.html` files as well. Today, we'll learn how to configure Apache to recognize PHP code in HTML files.

## 🎯 When Do You Need This Configuration?

- When you need to add PHP functionality to existing HTML files
- When you want to hide the `.php` extension from URLs
- When legacy systems require dynamic functionality in HTML files
- When you need to maintain URL structure for SEO purposes

## 📁 Configuration File Location

Apache's MIME type configuration is managed in the following file:

```
/etc/apache2/mods-enabled/mime.conf
```

## 🔧 Checking Current Configuration

First, let's check the current configuration file contents:

```bash
sudo nano /etc/apache2/mods-enabled/mime.conf
```

**Default configuration content:**

```apache
#AddHandler cgi-script .cgi

        #
        # For files that include their own HTTP headers:
        #
        #AddHandler send-as-is asis

        #
        # For server-parsed imagemap files:
        #
        #AddHandler imap-file map

        #
        # For type maps (negotiated resources):
        # (This is enabled by default to allow the Apache "It Worked" page
        #  to be distributed in multiple languages.)
        #
        AddHandler type-map var

        #
        # Filters allow you to process content before it is sent to the client.
        #
        # To parse .shtml files for server-side includes (SSI):
        # (You will also need to add "Includes" to the "Options" directive.)
        #
        AddType text/html .shtml
<IfModule mod_include.c>
        AddOutputFilter INCLUDES .shtml
</IfModule>

</IfModule>
```

## ✏️ Modifying the Configuration

To make HTML files recognize PHP code, you need to add the following line:

### 📝 Code to Add

```apache
AddType application/x-httpd-php .html
```

### 📋 Complete Modified Configuration

```apache
#AddHandler cgi-script .cgi

        #
        # For files that include their own HTTP headers:
        #
        #AddHandler send-as-is asis

        #
        # For server-parsed imagemap files:
        #
        #AddHandler imap-file map

        #
        # For type maps (negotiated resources):
        # (This is enabled by default to allow the Apache "It Worked" page
        #  to be distributed in multiple languages.)
        #
        AddHandler type-map var

        #
        # Filters allow you to process content before it is sent to the client.
        #
        # To parse .shtml files for server-side includes (SSI):
        # (You will also need to add "Includes" to the "Options" directive.)
        #
        AddType text/html .shtml
        AddType application/x-httpd-php .html
<IfModule mod_include.c>
        AddOutputFilter INCLUDES .shtml
</IfModule>

</IfModule>
```

## 🔄 Restarting the Server

After changing the configuration, you need to reload the Apache server:

```bash
sudo service apache2 reload
```

or

```bash
sudo systemctl reload apache2
```

## 🧪 Testing the Configuration

Let's test if the configuration has been applied correctly:

### 1. Create a Test File

```bash
sudo nano /var/www/html/test.html
```

### 2. Write Test Code

```html
<!DOCTYPE html>
<html>
<head>
    <title>PHP in HTML Test</title>
</head>
<body>
    <h1>PHP Code Test</h1>
    <p>Current time: <?php echo date('Y-m-d H:i:s'); ?></p>
    <p>Server info: <?php echo $_SERVER['SERVER_SOFTWARE']; ?></p>
</body>
</html>
```

### 3. Check in Browser

Access `http://your-domain/test.html` in your browser to verify that the PHP code is being executed.

## ⚠️ Important Considerations

### 1. Security Considerations

- Executing PHP in HTML files can increase security risks
- Validation of user-uploaded HTML files is necessary
- Proper file permission settings are crucial

### 2. Performance Impact

- All HTML files will go through the PHP parser, which can affect performance
- Static HTML files will be processed dynamically, reducing caching efficiency

### 3. Alternative Methods

If you want to apply this only to specific directories or virtual hosts:

```apache
<Directory "/var/www/html/dynamic">
    AddType application/x-httpd-php .html
</Directory>
```

## 🔍 Troubleshooting

### When PHP Code Doesn't Execute

1. **Check PHP Module:**
   ```bash
   sudo a2enmod php8.1  # Adjust according to your PHP version
   ```

2. **Check Configuration Syntax:**
   ```bash
   sudo apache2ctl configtest
   ```

3. **Check Error Logs:**
   ```bash
   sudo tail -f /var/log/apache2/error.log
   ```

## 🎯 Additional Usage Methods

### 1. Supporting Multiple Extensions

```apache
AddType application/x-httpd-php .html .htm .shtml
```

### 2. Conditional Application

```apache
<FilesMatch "\.html$">
    SetHandler application/x-httpd-php
</FilesMatch>
```

## 📚 Conclusion

Configuring HTML files to execute PHP code is simple, but you must fully consider the impact on security and performance.

Especially in production environments:
- Apply only to necessary directories
- Implement appropriate security measures
- Perform regular security audits

Keep these considerations in mind when configuring your server.

---

💡 **Tip**: It's recommended to thoroughly test in a development environment before applying to production!