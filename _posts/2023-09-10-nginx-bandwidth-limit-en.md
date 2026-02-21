---
layout: post
title: "Setting up nginx Bandwidth Limiting - Complete limit_rate Guide"
date: 2023-09-10 15:30:00 +0900
categories: [Development, Tutorial]
tags: [nginx, server, bandwidth, limit_rate, optimization, devops]
author: "Kevin Park"
excerpt: "Complete guide on how to effectively limit bandwidth using limit_rate and limit_rate_after directives in nginx with practical testing examples"
lang: en
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /2023/09/10/nginx-bandwidth-limit-en/
---

# Setting up nginx Bandwidth Limiting

## 🎯 Summary

The simplest way to limit bandwidth in nginx is by using the `limit_rate` directive. Here are ready-to-use configuration examples.

### Immediately Applicable Configuration

```nginx
# /etc/nginx/nginx.conf or site-specific configuration file
server {
    listen 80;
    server_name example.com;
    
    location / {
        # Limit speed to 200KB/s after 500MB download
        limit_rate_after 500M;
        limit_rate 200k;
        
        # File serving configuration
        root /var/www/html;
        index index.html;
    }
}
```

### File Type-Specific Bandwidth Limiting

```nginx
# Video file bandwidth limiting
location ~* \.(mp4|avi|mkv)$ {
    limit_rate_after 10M;
    limit_rate 500k;
}

# Image file bandwidth limiting
location ~* \.(jpg|jpeg|png|gif)$ {
    limit_rate_after 1M;
    limit_rate 100k;
}

# General file bandwidth limiting
location / {
    limit_rate_after 500M;
    limit_rate 200k;
}
```

### Configuration Application Commands

```bash
# Check configuration file syntax
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

# Or reload configuration
sudo nginx -s reload
```

---

## 📚 Detailed Explanation

### Background and Necessity

Bandwidth limiting in nginx is essential for server resource management and user experience optimization. Especially when serving large files, it prevents server overload caused by unlimited bandwidth usage.

### Technical Details

#### Detailed Explanation of limit_rate Directives

- **`limit_rate`**: Limits the response transmission speed to clients
- **`limit_rate_after`**: Applies speed limiting after transmitting the specified amount
- **Units**: `k` (kilobytes), `m` (megabytes), `g` (gigabytes)

#### Dynamic Bandwidth Limiting

```nginx
# Dynamic limiting using variables
map $request_uri $rate_limit {
    ~*\.(mp4|avi)$  500k;
    ~*\.(jpg|png)$  100k;
    default         200k;
}

server {
    location / {
        limit_rate $rate_limit;
        limit_rate_after 1M;
    }
}
```

#### Per-User Bandwidth Limiting

```nginx
# IP-based limiting
geo $limit_rate_ip {
    default 100k;
    192.168.1.0/24 500k;  # Internal network gets faster speed
    10.0.0.0/8 1m;        # VPN users get faster speed
}

server {
    location / {
        limit_rate $limit_rate_ip;
    }
}
```

### Real-World Use Cases

#### 1. nginx Server Acting as CDN

```nginx
server {
    listen 80;
    server_name cdn.example.com;
    
    # Static file serving
    location /static/ {
        root /var/www;
        
        # Large files transmitted slowly
        location ~* \.(zip|tar|gz)$ {
            limit_rate_after 10M;
            limit_rate 1m;
        }
        
        # Media file streaming optimization
        location ~* \.(mp4|mp3|flv)$ {
            limit_rate_after 2M;
            limit_rate 500k;
        }
    }
}
```

#### 2. API Server Bandwidth Limiting

```nginx
server {
    listen 80;
    server_name api.example.com;
    
    # API response size limiting
    location /api/ {
        proxy_pass http://backend;
        
        # Large data response limiting
        limit_rate_after 5M;
        limit_rate 2m;
        
        # Proxy settings
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Bandwidth Limiting Testing Methods

#### 1. Testing with curl

```bash
# Monitor download speed
curl -o /dev/null -w "%{speed_download}\n" http://example.com/large-file.zip

# Test with time measurement
time curl -O http://example.com/large-file.zip
```

#### 2. Testing with wget

```bash
# Display download speed
wget --progress=bar:force http://example.com/large-file.zip

# Set timeout
wget --timeout=30 http://example.com/large-file.zip
```

#### 3. nginx Log Monitoring

```bash
# Check real-time access logs
tail -f /var/log/nginx/access.log

# Analyze bandwidth usage
awk '{print $7, $10}' /var/log/nginx/access.log | sort | uniq -c
```

### Error Handling and Troubleshooting

#### Configuration Validation Script

```bash
#!/bin/bash
# nginx bandwidth limiting configuration validation

echo "=== nginx Configuration Syntax Check ==="
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuration file syntax OK"
    
    echo "=== Configuration Reload ==="
    sudo nginx -s reload
    
    echo "✅ nginx configuration reload complete"
    
    echo "=== Test File Creation ==="
    sudo dd if=/dev/zero of=/var/www/html/test.dat bs=1M count=100
    
    echo "✅ 100MB test file creation complete"
    echo "Test with: curl -O http://localhost/test.dat"
else
    echo "❌ Configuration file contains errors"
    exit 1
fi
```

#### Common Problem Resolution

1. **Configuration not being applied**
   ```bash
   # Check nginx processes
   sudo ps aux | grep nginx
   
   # Check port usage
   sudo netstat -tlnp | grep :80
   ```

2. **Too slow speed limiting**
   ```nginx
   # Guarantee minimum speed
   location / {
       limit_rate_after 1M;
       limit_rate 100k;  # Guarantee minimum 100KB/s
   }
   ```

## Conclusion

Using nginx's `limit_rate` and `limit_rate_after` directives allows for effective bandwidth limiting. Key insights include:

- **Progressive Limiting**: Use `limit_rate_after` for fast initial downloads, then apply speed limits
- **File Type Differentiation**: Apply different limits for media files and general files
- **Real-time Monitoring**: Track bandwidth usage through log analysis

Next steps could include considering nginx Plus's advanced bandwidth control features or more granular control using dynamic modules.