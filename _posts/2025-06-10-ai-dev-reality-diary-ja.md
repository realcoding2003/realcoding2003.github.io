---
layout: post
title: "AI開発の現実チェック：ブログ自動化で気づいたこと"
date: 2025-06-10 08:30:00 +0900
categories: [Development, DevDiary]
tags: [AI開発, GitHubPages, 自動化, 開発経験, 新人開発者]
author: "Kevin Park"
excerpt: "数日間GitHubページブログをAIで作成した際の現実的な話。AI開発の明と暗"
image: "/assets/images/posts/ai-dev-reality-diary/hero.png"
lang: ja
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /2025/06/10/ai-dev-reality-diary-ja/
---

# AI開発の現実チェック：ブログ自動化で気づいたこと

![AI Development Reality](/assets/images/posts/ai-dev-reality-diary/hero.png)
*AI開発の現実的な姿：便利さと複雑さの共存*

## 📝 今日の問題

数日間、GitHubページでブログを作成し、AI プロンプト作業による自動化に完全にはまっていた。

AIがコードをすらすら生成してくれるので「すごい、これは本当に簡単だ！」と思ったが、実際に動かしてみると、あちこちで動かない部分が続出した。

## 💡 解決プロセス

### AIの長所：迅速なプロトタイピング

```yaml
# AIが1分で生成したJekyll設定
plugins:
  - jekyll-feed
  - jekyll-sitemap
  - jekyll-seo-tag

collections:
  posts:
    output: true
    permalink: /:year/:month/:day/:title/
```

**良かった点**：基本構造やテンプレートは本当に早く作成してくれる

### AIの限界：詳細なデバッグ

```bash
# 実際にはこのようなエラーが継続的に発生
Error: Liquid syntax error: Unknown tag 'mermaid'
Error: Github Pages build failed
```

**問題点**：AIが生成したコードが実際の環境で動作しない時、どこが間違っているかを見つけ出すのは結局開発者の仕事

## 🎯 気づいたこと

### 1. AI + 既存知識の必須組み合わせ

- AIはコードを生成してくれるが、**正しい方向に導く**のは開発者の役割
- 生成された結果物を**検証し修正**できる既存知識が必須

### 2. 新人開発者の新しいジレンマ

```javascript
// 以前の新人の目標
const juniorGoal = "Hello Worldから着実に";

// 現在の新人の現実
const currentReality = "AIでこの程度は基本でしょう？";
```

**逆説的状況**： 

- 学習はより簡単になったが、期待値は5-6年目レベルに上昇
- AIツール活用能力まで追加で要求される

### 3. AI開発の核心スキル

- **プロンプトエンジニアリング**：AIに正確な要求事項を伝達
- **結果物検証**：生成されたコードの問題点を把握
- **段階的改善**：AIと共に反復的に完成度を高める

## 📈 結論

AI開発は**ツールの革新**であり、**開発知識の代替**ではない。

むしろ既存の開発知識があってこそAIを適切に活用でき、AIが間違った時に「これは違う」と判断できる。

**新しい開発者の必須能力**：

- 従来の開発知識（基礎）
- AIツール活用能力（新しい基礎）
- この二つの領域を繋ぐ洞察力

とてもアイロニカルだが、これが現実である。AI時代の開発者はより多くのことを知らなければならない。