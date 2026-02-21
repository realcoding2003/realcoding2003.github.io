---
layout: post
title: "既存MCPを使った新しいMCPの簡単インストール - Playwright MCP設置実践ガイド"
date: 2025-06-05 14:30:00 +0900
categories: [Tips, Development]
tags: [mcp, playwright, automation, installation, filesystem, desktop-commander, beginner]
author: "Kevin Park"
excerpt: "既にインストールされたfilesystem、desktop-commander MCPを活用して、新しいMCPをClaudeが直接自動インストールする実践的な方法を学びます。"
lang: ja
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /2025/06/05/mcp-easy-install-with-existing-mcp-ja/
---

# 既存MCPを使った新しいMCPの簡単インストール - Playwright MCP設置実践ガイド

## 🎯 概要

**既にインストールされたfilesystem、desktop-commander等のMCPを活用すれば、新しいMCPサーバーを手動インストールすることなく、Claudeが直接インストールしてくれます。**

### 基本インストールコマンド

```
Claudeへのリクエスト:
「playwright MCPサーバーをインストールして設定ファイルに追加してください」
```

### 自動化されるプロセス
- **設定ファイル自動編集**: filesystem MCPでclaude_desktop_config.json編集
- **依存関係自動インストール**: desktop-commanderでNPXコマンド実行
- **設定検証**: ファイル内容確認及び文法チェック
- **再起動ガイド**: Claude Desktop再起動ガイド

### 複数MCPの一括インストール
```
「GitHub、Google Drive、Playwright MCPをすべてインストールして設定してください」
```

---

## 📚 詳細説明

### 既存MCPを活用する理由

既にfilesystem、desktop-commander等のMCPがインストールされていれば、Claudeが直接:
- ファイルシステムにアクセスして設定ファイル修正
- ターミナルコマンド実行でパッケージインストール
- 設定検証及び問題解決

これらすべてのプロセスを自動化できます。

### 実際のインストールプロセス

#### ステップ1: Claudeにインストール要求

```
「playwright-mcpをインストールしてください。設定ファイルも自動で修正してください」
```

Claudeが自動で実行する作業:
1. 現在のclaude_desktop_config.jsonファイル読み取り
2. playwright MCP設定追加
3. NPXで依存関係確認
4. 設定ファイル保存

#### ステップ2: 自動設定ファイル修正

Claudeがfilesystem MCPを使用して以下のように修正:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/username/Documents"]
    },
    "desktop-commander": {
      "command": "npx", 
      "args": ["-y", "@executeautomation/desktop-commander-mcp"]
    },
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

#### ステップ3: 依存関係インストール確認

Claudeがdesktop-commanderを通じて実行:
```bash
npx @playwright/mcp@latest --help
```

### 推奨MCPサーバーリスト

Claudeに一度にリクエストできる有用なMCP:

```
「以下のMCPをすべてインストールしてください:
- GitHub MCP (コードリポジトリ管理)
- Google Drive MCP (ファイル同期)
- Slack MCP (メッセージ管理)
- Brave Search MCP (ウェブ検索)
- Playwright MCP (ブラウザ自動化)」
```

### インストール検証方法

#### 自動検証リクエスト
```
「インストールしたMCPが正常に動作するか確認してください」
```

Claudeが実行する検証:
1. 設定ファイルJSON構文チェック
2. 各MCPサーバー実行テスト
3. 必要な依存関係インストール確認
4. 権限設定チェック

#### 手動検証方法
1. Claude Desktop完全再起動
2. 新しいチャットで「Allow for This Chat」クリック
3. 簡単なテストリクエスト: 「現在のディレクトリのファイル一覧を表示してください」

### 実用的な活用ヒント

#### 1. プロジェクト別MCP設定

```
「現在のプロジェクトに適したMCPを推奨してインストールしてください」
```

ウェブ開発プロジェクト:
- Playwright (ブラウザテスト)
- GitHub (コード管理)
- Filesystem (ファイル作業)

データ分析プロジェクト:
- Filesystem (データファイルアクセス)
- Google Drive (データ同期)
- Desktop Commander (スクリプト実行)

#### 2. バッチインストールスクリプト

```
「以下の設定でMCP環境を構築してください:
1. 開発用MCP: GitHub、Filesystem、Playwright
2. 業務用MCP: Slack、Google Drive、Calendar
3. ユーティリティMCP: Desktop Commander、Brave Search」
```

#### 3. 設定バックアップと復元

```
「現在のMCP設定をバックアップしてください」
「バックアップされたMCP設定を新しいコンピュータに適用してください」
```

### トラブルシューティングガイド

#### 一般的な問題

**1. NPXキャッシュ問題**
```
「NPXキャッシュをクリアしてMCPを再インストールしてください」
```

**2. 権限問題**
```
「MCP設定ファイルの権限を確認して修正してください」
```

**3. ポート競合**
```
「使用中のポートを確認してMCPポートを変更してください」
```

#### 高度なトラブルシューティング

**設定ファイル復旧**
```
「MCP設定ファイルが破損しました。バックアップから復旧してください」
```

**選択的MCP無効化**
```
「Playwright MCPのみ一時的に無効化してください」
```

### パフォーマンス最適化ヒント

#### 1. 必要なMCPのみアクティブ化
```json
{
  "mcpServers": {
    // よく使用するもののみ保持
    "filesystem": { ... },
    "playwright": { ... }
    // 使用しないMCPはコメントアウト
    // "heavy-mcp": { ... }
  }
}
```

#### 2. リソース使用量モニタリング
```
「現在実行中のMCPサーバーのリソース使用量を確認してください」
```

## 結論

既存のMCPツールを活用すれば、新しいMCPのインストールが非常に簡単になります。Claudeがファイルシステムアクセスから依存関係インストールまですべてのプロセスを自動化してくれるため、開発者は複雑なインストールプロセスの代わりに実際の機能活用に集中できます。

**重要なヒント**: 「インストールしてください」と簡単にリクエストすれば、Claudeが最適な方法で自動的にインストールして設定まで完了してくれます。

**次のステップ**: インストールしたMCPを活用したワークフロー自動化を構築してみてください。
