---
layout: post
title: "Setting up SSH Push with Bitbucket Access Key"
date: 2023-12-10 09:00:00 +0900
categories: [Development, Tutorial]
tags: [bitbucket, ssh, git, devops, setup, tutorial]
author: "Kevin Park"
excerpt: "Complete setup guide for securely pushing to Bitbucket Private Repository using SSH Key without password authentication"
lang: en
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /2023/12/10/bitbucket-ssh-access-key-setup-en/
---

# Setting up SSH Push with Bitbucket Access Key

## 🎯 Summary

**How to push to Bitbucket Private Repository using SSH Key without password authentication**

### Key Steps
1. **Generate SSH Key**
```bash
ssh-keygen -t rsa -C "your-email@example.com"
# Press Enter to use default settings
```

2. **Configure SSH Agent**
```bash
# Start SSH Agent
eval "$(ssh-agent -s)"

# Add generated key to SSH Agent
ssh-add ~/.ssh/id_rsa

# Verify registration
ssh-add -l
```

3. **Copy Public Key**
```bash
cat ~/.ssh/id_rsa.pub
# Copy the entire output
```

4. **Configure Bitbucket Repository**
   - Repository Settings → Access Keys → Add Key
   - Enter Label, check Read/Write permissions
   - Paste the copied Public Key

5. **Push using SSH URL**
```bash
git remote set-url origin ssh://git@bitbucket.org:username/repository.git
git push origin master
```

---

## 📚 Detailed Explanation

### Background and Necessity

When migrating from GitHub to Bitbucket, the method for accessing Private Repositories changes. To avoid the hassle of entering credentials repeatedly and to enable secure Git operations in CI/CD pipelines or automation scripts, SSH Key authentication must be configured.

### SSH Key Generation Process

#### 1. Generate SSH Key
```bash
# Generate RSA type SSH Key
ssh-keygen -t rsa -C "your-email@example.com"

# Example output
Generating public/private rsa key pair.
Enter file in which to save the key (/root/.ssh/id_rsa): [Enter]
Enter passphrase (empty for no passphrase): [Enter]
Enter same passphrase again: [Enter]
```

**Key Options:**
- `-t rsa`: Use RSA encryption algorithm
- `-C`: Add comment (usually email address)
- Pressing Enter only sets default path and empty passphrase

#### 2. Verify Generated Files
```bash
ls -la ~/.ssh/
# Check id_rsa (private key), id_rsa.pub (public key) files

# Set permissions (important for security)
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub
```

### SSH Agent Configuration

#### Start SSH Agent and Register Key
```bash
# Run SSH Agent in background
eval "$(ssh-agent -s)"
# Output message like "Agent pid 1234"

# Add SSH key to Agent
ssh-add ~/.ssh/id_rsa

# Verify registered keys
ssh-add -l
# Output format: 2048 SHA256:... /root/.ssh/id_rsa (RSA)
```

**Why Use SSH Agent:**
- No need to re-enter keys once loaded during session
- Same key can be used for multiple repositories
- Securely manages keys only in memory

### Register Bitbucket Access Key

#### 1. Access Repository Settings
1. Navigate to Bitbucket Repository page
2. Click **Settings**
3. Select **Access Management** → **Access Keys**

#### 2. Add Access Key
```bash
# Copy Public Key content
cat ~/.ssh/id_rsa.pub
# ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ... your-email@example.com
```

**Configuration Options:**
- **Label**: Distinguishable name for the key (e.g., "Production Server Key")
- **Key**: Complete Public Key content copied
- **Permissions**: 
  - ✅ **Read**: Repository clone/pull permissions
  - ✅ **Write**: Push permissions (check if needed)

### SSH Connection Test and Push

#### 1. Test SSH Connection
```bash
# Test Bitbucket SSH connection
ssh -T git@bitbucket.org

# Success output example:
# logged in as username.
# You can use git or hg to connect to Bitbucket.
```

#### 2. Change Remote URL
```bash
# Check current remote URL
git remote -v

# Change from HTTPS to SSH
git remote set-url origin ssh://git@bitbucket.org/username/repository.git

# Or use SSH address when cloning
git clone ssh://git@bitbucket.org/username/repository.git
```

#### 3. Execute Push
```bash
git add .
git commit -m "SSH key setup test"
git push origin master

# Successful push without password input
# Enumerating objects: 12, done.
# Compressing objects: 100% (11/11), done.
# Total 12 (delta 6), reused 0 (delta 0)
# To ssh://git@bitbucket.org/username/repository.git
#    ca052fa..57740e4  master -> master
```

### Real-world Use Cases

#### Jenkins Automatic Backup Setup
```bash
#!/bin/bash
# Using SSH Key in Jenkins backup script

# Create backup file
tar -czf jenkins_backup_$(date +%Y%m%d).tar.gz /var/lib/jenkins/

# Automatic commit and push to Git
git add .
git commit -m "Jenkins backup $(date +%Y-%m-%d)"
git push origin master
```

#### Multiple Repository Management
```bash
# Manage multiple keys with ~/.ssh/config file
Host bitbucket-work
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_rsa_work

Host bitbucket-personal
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_rsa_personal

# Usage
git clone ssh://bitbucket-work/company/project.git
git clone ssh://bitbucket-personal/username/personal-project.git
```

### Troubleshooting

#### Permission Denied Error
```bash
# Check SSH key permissions
ls -la ~/.ssh/id_rsa
# -rw------- 1 user user ... id_rsa (requires 600 permissions)

# Fix permissions
chmod 600 ~/.ssh/id_rsa
```

#### SSH Agent Connection Failure
```bash
# Check SSH Agent status
ps aux | grep ssh-agent

# Restart Agent
killall ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa
```

## Conclusion

Setting up Bitbucket authentication using SSH Key provides both security and convenience, making it an essential development environment configuration. It's particularly useful in automated CI/CD environments where Git operations need to be performed without password input.

**Key Points:**
- SSH Key can be used permanently once configured
- Secure as only Public Key is registered on server
- Same key can be reused across multiple repositories and servers
- Easy integration with automation tools like Jenkins, GitHub Actions

**Next Steps:**
- Multiple account management using SSH Config file
- Commit signing setup with additional GPG Key
- Using combination of 2FA (Two-Factor Authentication) and SSH Key
