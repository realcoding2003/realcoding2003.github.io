---
layout: post
title: "Linux tar コマンド完全ガイド - 圧縮と解凍のすべて"
date: 2023-03-18 09:00:00 +0900
categories: [Linux, System Administration]
tags: [Linux, tar, 圧縮, コマンド, CLI, システム管理]
author: Kevin Park
lang: ja
excerpt: "Linuxで最も多く使用されるtarコマンドのオプションと実際の使用例をまとめました。圧縮と解凍、様々なオプションまで一度にマスターしましょう。"
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /2023/03/18/linux-tar-command-options-guide-ja/
---

Linuxを使用していると、ファイルやディレクトリを圧縮したり解凍したりする必要がある場合がよくあります。この時最も多く使用されるコマンドが`tar`です。今日はtarコマンドの主要オプションと実際の使用例を見てみましょう。

## 📦 tarコマンドとは？

`tar`は**T**ape **AR**chiveの略語で、複数のファイルとディレクトリを一つのアーカイブファイルにまとめたり展開したりする際に使用するコマンドです。バックアップ、ファイル転送、配布などに幅広く活用されます。

## 🔧 基本的な使用法

### 📁 圧縮（アーカイブ作成）

```bash
tar -cvf file.tar folder
```

- `file.tar`: 作成されるアーカイブファイル名
- `folder`: 圧縮するディレクトリまたはファイル

**例：**
```bash
tar -cvf backup.tar /home/user/documents
```

### 📂 解凍（アーカイブ解凍）

```bash
tar -xvf file.tar
```

**例：**
```bash
tar -xvf backup.tar
```

## 🗜️ gzip圧縮と一緒に使用する

### 📁 tar.gz圧縮

```bash
tar -zcvf file.tar.gz folder
```

gzip圧縮を一緒に使用するとファイルサイズをさらに削減できます。

**例：**
```bash
tar -zcvf website_backup.tar.gz /var/www/html
```

### 📂 tar.gz解凍

```bash
tar -zxvf file.tar.gz
```

**例：**
```bash
tar -zxvf website_backup.tar.gz
```

## 📋 主要オプション整理

| **オプション** | **説明** |
|--------------|---------|
| `-c` | ファイルをtarでまとめる（create） |
| `-p` | ファイル権限を保存 |
| `-v` | まとめたりファイルを展開したりする時の過程を画面に出力（verbose） |
| `-f` | ファイル名を指定（file） |
| `-C` | パスを指定（change directory） |
| `-x` | tar圧縮を解凍（extract） |
| `-z` | gzipで圧縮または解凍 |

## 💡 実用的な使用例

### 1. 特定ディレクトリに解凍

```bash
tar -xvf backup.tar -C /tmp/restore
```

### 2. ファイル権限を維持して圧縮

```bash
tar -cpvf backup.tar /etc/nginx
```

### 3. 複数のファイルとディレクトリを同時圧縮

```bash
tar -zcvf multiple_backup.tar.gz file1.txt file2.txt /home/user/docs
```

### 4. アーカイブ内容確認（解凍せずに）

```bash
tar -tvf backup.tar.gz
```

### 5. 特定ファイルのみ解凍

```bash
tar -zxvf backup.tar.gz path/to/specific/file.txt
```

## 🚀 高度な使用Tips

### 📊 圧縮率比較

```bash
# 通常のtar（圧縮なし）
tar -cvf backup.tar folder/

# gzip圧縮
tar -zcvf backup.tar.gz folder/

# bzip2圧縮（より高い圧縮率）
tar -jcvf backup.tar.bz2 folder/
```

### 🔍 圧縮過程で特定ファイルを除外

```bash
tar -zcvf backup.tar.gz folder/ --exclude="*.log" --exclude="temp/*"
```

### 📅 日付別バックアップ自動化

```bash
tar -zcvf backup_$(date +%Y%m%d).tar.gz /important/data
```

## ⚠️ 注意事項

1. **パス注意**: 絶対パスで圧縮すると解凍時に同じパスに復元されます。
2. **権限確認**: `-p`オプション無しではファイル権限が保存されない場合があります。
3. **容量確認**: 圧縮前にディスク容量を十分確保してください。

## 🎯 よく使用するコマンド集

```bash
# 基本圧縮
tar -cvf archive.tar folder/

# gzip圧縮
tar -zcvf archive.tar.gz folder/

# 解凍
tar -xvf archive.tar

# gzip解凍
tar -zxvf archive.tar.gz

# 内容確認
tar -tvf archive.tar

# 特定パスに解凍
tar -xvf archive.tar -C /target/path
```

## 📚 まとめ

tarコマンドはLinuxシステム管理において必須のツールです。基本的な圧縮と解凍から高度なオプションまで身につけておけば、ファイル管理がより効率的になります。

特にサーバーバックアップ、デプロイ自動化、ログ管理などでtarコマンドの様々なオプションを活用すれば、より強力なスクリプトを作成することができます。

---

💡 **Tips**: よく使用するtarコマンドはaliasに登録しておくとより便利です！

```bash
alias targz='tar -zcvf'
alias untar='tar -zxvf'
```