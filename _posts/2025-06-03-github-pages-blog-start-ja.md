---
layout: post
title: "GitHub Pagesで技術ブログを始める"
date: 2025-06-04 14:30:00 +0900
categories: [ブログ, GitHub]
tags: [github-pages, jekyll, ブログ, 開始]
author: "Kevin Park"
excerpt: "GitHub PagesとJekyllを使用して自分だけの技術ブログを作成する方法を段階的に学びます。"
lang: ja
slug: github-pages-blog-start
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /ja/2025/06/03/github-pages-blog-start-ja/
  - /2025/06/03/github-pages-blog-start-ja/
  - /ja/2025/06/04/github-pages-blog-start-ja/
  - /en/2025/06/04/github-pages-blog-start-ja/
---

こんにちは！今日はGitHub Pagesを利用して技術ブログを始める方法について学んでみましょう。

開発者なら一度は自分だけの技術ブログを運営してみたいと思ったことがあるでしょう。GitHub Pagesは無料で静的ウェブサイトをホスティングできる優れたサービスです。

## なぜGitHub Pagesなのか？

GitHub Pagesを選んだ理由は以下の通りです：

### 1. 完全無料
- `username.github.io`ドメインを無料で提供
- ホスティング費用完全無料
- SSL証明書自動提供

### 2. 開発者フレンドリー
- Gitによるバージョン管理
- Markdownでの投稿作成
- コード構文ハイライト標準サポート

### 3. カスタマイズの自由度
- Jekyllによるテーマカスタマイズ
- HTML、CSS、JavaScript直接修正可能
- プラグインによる機能拡張

## 設定プロセス

### ステップ1：リポジトリ作成

GitHubで新しいリポジトリを作成する際、名前を`username.github.io`形式で設定します。

```bash
# 例
realcoding.github.io
```

### ステップ2：Jekyll設定

`_config.yml`ファイルを作成し、基本設定を追加します：

```yaml
title: Real Coding Blog
description: 実務で学んだ開発ノウハウと技術的インサイト
url: "https://realcoding.github.io"
baseurl: ""

# Author information
author:
  name: Kevin Park
  email: kevin@realcoding.blog

# Build settings
markdown: kramdown
highlighter: rouge
permalink: /:year/:month/:day/:title/

# Plugins
plugins:
  - jekyll-feed
  - jekyll-sitemap
  - jekyll-seo-tag
```

### ステップ3：最初の投稿作成

`_posts`ディレクトリに`YYYY-MM-DD-タイトル.md`形式でファイルを作成します：

```markdown
---
layout: post
title: "最初の投稿"
date: 2025-06-04 14:30:00 +0900
categories: [ブログ]
tags: [開始, github-pages]
---

こんにちは！最初の投稿です。

## 小見出し

ここに内容を記述します。

```javascript
console.log("Hello, Blog!");
```
```

## 便利なTips

### 1. ローカル開発環境構築

```bash
# Ruby インストール後
gem install bundler jekyll

# 新しいJekyllサイト作成
jekyll new my-blog
cd my-blog

# ローカルサーバー実行
bundle exec jekyll serve
```

### 2. カスタムドメイン設定

GitHub Pagesではカスタムドメインも簡単に設定できます：

1. リポジトリに`CNAME`ファイル作成
2. 希望するドメインを入力（例：`blog.example.com`）
3. DNS設定でCNAMEレコード追加

### 3. SEO最適化

```yaml
# _config.ymlに追加
plugins:
  - jekyll-seo-tag

# 各投稿にメタデータ追加
---
title: "投稿タイトル"
description: "投稿についての簡単な説明"
image: /assets/images/post-thumbnail.jpg
---
```

## まとめ

GitHub Pagesでブログを始めることは思っているより簡単です。無料でありながら強力な機能を提供するため、開発者にとって最適な選択と言えるでしょう。

次回の投稿では、Jekyllテーマのカスタマイズと高度な機能について学んでいきます。

もし疑問点がございましたら、コメントでお聞かせください！😊

---

**参考資料：**
- [GitHub Pages公式ドキュメント](https://docs.github.com/pages)
- [Jekyll公式サイト](https://jekyllrb.com/)
- [Markdownガイド](https://www.markdownguide.org/)
