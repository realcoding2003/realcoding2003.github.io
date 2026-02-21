---
layout: post
title: "Linux SSH Key Generation - Complete ssh-keygen Guide"
date: 2024-05-10 09:00:00 +0900
categories: [Development, Tutorial]
tags: [linux, ssh, keygen, security, server, tutorial, beginner]
author: "Kevin Park"
excerpt: "From SSH key generation to implementation! A complete guide to building secure server access environment with ssh-keygen command"
lang: en
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /2024/05/10/linux-ssh-keygen-en/
---

# Linux SSH Key Generation - Complete ssh-keygen Guide

## 🎯 Summary

**Ready-to-use SSH key generation commands:**

```bash
# Generate RSA key (most common)
ssh-keygen -t rsa

# Generate more secure ED25519 key (recommended)
ssh-keygen -t ed25519

# Specify key size (for RSA)
ssh-keygen -t rsa -b 4096
```

**Basic usage:**
1. Run `ssh-keygen -t rsa`
2. Save location prompt → Press Enter (use default path)
3. Password prompt → Press Enter (use without password)
4. Password confirmation → Press Enter

**Verify generated keys:**
```bash
# Check public key content
cat ~/.ssh/id_rsa.pub

# List generated key files
ls -la ~/.ssh/
```

---

## 📚 Detailed Explanation

### Background and Necessity

SSH keys are an authentication method for securely accessing remote servers without passwords. They are essential for Git, AWS EC2, and VPS server connections, providing a much safer and more convenient authentication method than passwords.

### ssh-keygen Command Options Details

#### Key Type Options (-t)
```bash
# RSA (best compatibility)
ssh-keygen -t rsa

# ED25519 (more secure and faster, latest recommendation)
ssh-keygen -t ed25519

# ECDSA (elliptic curve cryptography)
ssh-keygen -t ecdsa

# DSA (deprecated, not recommended)
ssh-keygen -t dsa
```

#### Key Size Specification (-b)
```bash
# RSA 4096-bit (more secure)
ssh-keygen -t rsa -b 4096

# RSA 2048-bit (default)
ssh-keygen -t rsa -b 2048
```

#### Filename and Path Specification (-f)
```bash
# Generate with specific filename
ssh-keygen -t rsa -f ~/.ssh/my_server_key

# Generate in current directory
ssh-keygen -t rsa -f ./my_key
```

#### Add Comment (-C)
```bash
# Add email address or description
ssh-keygen -t rsa -C "your_email@example.com"
ssh-keygen -t rsa -C "aws-ec2-production"
```

### Step-by-Step Generation Process

**Step 1: Execute command**
```bash
ubuntu@server:~$ ssh-keygen -t rsa
Generating public/private rsa key pair.
```

**Step 2: Choose save location**
```bash
Enter file in which to save the key (/home/ubuntu/.ssh/id_rsa): 
```
- Press Enter: Use default path (`~/.ssh/id_rsa`)
- Other path: Enter desired filename

**Step 3: Set password**
```bash
Enter passphrase (empty for no passphrase): 
Enter same passphrase again: 
```
- Press Enter twice: Use without password
- Enter password: Additional security layer (requires input each time)

**Step 4: Generation complete**
```bash
Your identification has been saved in /home/ubuntu/.ssh/id_rsa
Your public key has been saved in /home/ubuntu/.ssh/id_rsa.pub
The key fingerprint is:
SHA256:8MBHCzkCy/2X2CQCTeP2p9r2gUOAZokCtrCANw5DaAk ubuntu@ip-172-31-35-113
The key's randomart image is:
+---[RSA 3072]----+
|Eo++o ...        |
|X*+Boooo .       |
|=*B.*.=.+        |
|.o.. = X .       |
|      = S        |
|     . =         |
|      + .        |
|     o.. .       |
|    .....        |
+----[SHA256]-----+
```

### Generated File Structure

```bash
~/.ssh/
├── id_rsa        # Private key (never share)
├── id_rsa.pub    # Public key (register on server)
├── known_hosts   # Connected server information
└── authorized_keys  # Allowed public key list
```

### Real-world Use Cases

#### GitHub/GitLab Integration
```bash
# 1. Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# 2. Copy public key
cat ~/.ssh/id_ed25519.pub

# 3. Add to GitHub Settings > SSH Keys
# 4. Test connection
ssh -T git@github.com
```

#### AWS EC2 Instance Access
```bash
# 1. Generate key (separate key for EC2)
ssh-keygen -t rsa -f ~/.ssh/aws_ec2_key

# 2. Register public key to EC2 instance
# 3. Connect
ssh -i ~/.ssh/aws_ec2_key ubuntu@your-ec2-ip
```

#### SSH Config for Multiple Servers
```bash
# Create ~/.ssh/config file
Host production
    HostName 192.168.1.100
    User ubuntu
    IdentityFile ~/.ssh/production_key

Host development
    HostName 192.168.1.200
    User dev
    IdentityFile ~/.ssh/dev_key

# Usage
ssh production
ssh development
```

### Security Considerations

#### File Permission Settings
```bash
# Private key permission (owner read only)
chmod 600 ~/.ssh/id_rsa

# Public key permission
chmod 644 ~/.ssh/id_rsa.pub

# .ssh directory permission
chmod 700 ~/.ssh
```

#### Password Usage Decision
```bash
# Without password (convenience priority)
ssh-keygen -t rsa

# With password (security priority)
ssh-keygen -t rsa
# Requires password input each time after setting
```

### Error Resolution and Troubleshooting

#### Permission-related Errors
```bash
# Error: WARNING: UNPROTECTED PRIVATE KEY FILE!
chmod 600 ~/.ssh/id_rsa

# Error: Permission denied (publickey)
# 1. Check if public key is properly registered on server
# 2. Check SSH agent
ssh-add -l
ssh-add ~/.ssh/id_rsa
```

#### Backup Existing Keys and Generate New Ones
```bash
# Backup existing keys
cp ~/.ssh/id_rsa ~/.ssh/id_rsa.backup
cp ~/.ssh/id_rsa.pub ~/.ssh/id_rsa.pub.backup

# Generate new key (overwrite existing)
ssh-keygen -t rsa -f ~/.ssh/id_rsa
```

### Advanced Usage

#### Generate Key with Multiple Settings at Once
```bash
# Without password, 4096-bit, with comment
ssh-keygen -t rsa -b 4096 -C "production-server" -f ~/.ssh/prod_key -N ""
```

#### Using SSH Agent
```bash
# Start SSH agent
eval "$(ssh-agent -s)"

# Add key (enter password only once)
ssh-add ~/.ssh/id_rsa

# Check registered keys
ssh-add -l
```

## Conclusion

SSH key generation can be done simply with the `ssh-keygen -t rsa` command, but it's important to choose appropriate options considering security and convenience. Particularly in modern environments, using ED25519 key type is recommended, and when managing multiple servers, you can efficiently manage them using SSH Config files.

As a next step, register the generated SSH key to actual servers or Git services to build a secure authentication environment without passwords.
