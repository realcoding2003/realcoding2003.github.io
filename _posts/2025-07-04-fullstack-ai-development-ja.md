---
layout: post
title: "一人でプロジェクト全体の開発が可能？CDK + Lambda + Cursorで200% AI活用術"
date: 2025-07-04 00:02:00 +0900
categories: [Development, AI]
tags: [CDK, Lambda, Cursor, AI開発, モノレポ, フルスタック, 開発生産性]
author: "Kevin Park"
lang: ja
excerpt: "Lambda関数ごとにリポジトリを作成していた過去から脱却し、CDK + Lambda + Cursorで一人でもプロジェクト全体の開発が可能になった体験談"
image: "/assets/images/posts/fullstack-ai-development/hero.png"
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /2025/07/04/fullstack-ai-development-ja/
---

# 一人でプロジェクト全体の開発が可能？CDK + Lambda + Cursorで200% AI活用術

![Hero Image](/assets/images/posts/fullstack-ai-development/hero.png)
*モノレポ構造でインフラからフロントエンドまで一元管理する開発環境*

## 🤦‍♂️ 以前はこのような開発方法だった

**問題**: Lambda関数一つにつきリポジトリを一つずつ作成して管理
- プロジェクト10個あればリポジトリ10個
- 共通コードのコピペ地獄
- デプロイのたびにリポジトリ10個を巡回

**現在**: CDK + Lambda + Cursorで全てを一つのプロジェクトで管理
- IaCコード、サーバーコード、フロントコード、デモページまで一箇所に
- AIが全体のコンテキストを理解して開発をサポート
- 一人でもプロジェクト全体の開発が可能

```javascript
// 現在はこのように一つのプロジェクトで全てを管理
project/
├── infrastructure/     # CDKコード
├── lambda-functions/   # サーバーロジック
├── frontend/          # フロントエンド
├── demo-pages/        # デモページ
└── docs/              # ルールブックとガイド
```

## 🚀 開発速度とメンテナンス性が同時に向上する魔法

### 開発速度200%向上
**AIコンテキスト共有の力**
- Cursorがプロジェクト全体の構造を理解
- インフラコードを見てサーバーコードを自動生成
- サーバーAPIを見てフロント連携コードを自動生成
- 一貫したパターンで新機能を迅速に追加

**実際の体験**: 新しいAPIを一つ追加する場合
1. CDKでLambda関数を定義（30秒）
2. Cursorが既存パターンを見てサーバーコードを生成（1分）
3. フロントエンド連携コードも自動生成（1分）
4. デプロイスクリプトも既存パターンそのまま（30秒）

**合計3分**で完了。以前は最低30分はかかっていたのに。

### メンテナンス性大幅改善
**コードの一貫性確保**
```typescript
// 全てのLambda関数が同じパターンを使用
export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    // 共通ミドルウェアを適用
    const result = await processRequest(event);
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
};
```

**バージョン管理の簡素化**
- 一つのリポジトリで全ての変更履歴を追跡
- 機能別ブランチの代わりにコンポーネント別フォルダ構造
- デプロイも一括または選択的に可能

## 💡 しかし、このような困難もあった

### 最大の課題：ルールブック管理
**膨大なソースコードの罠**
- AIがプロジェクト全体を理解するには複雑すぎる
- 過去の試行錯誤をAIが繰り返す問題
- 一貫性のないコードパターンがAIを混乱させる

**解決策：体系的なルールブック作成**
```markdown
# プロジェクトルールブック (docs/rulebook.md)

## 1. Lambda関数作成ルール
- 全ての関数はcommon/middleware.tsを使用
- エラー処理はstandardErrorクラスを活用
- 環境変数はconfig/environment.tsで管理

## 2. CDKインフラパターン
- Lambda関数はconstructs/lambda-construct.tsを使用
- API Gatewayパスはkebab-caseで統一
- 全てのリソースにプロジェクトタグ必須

## 3. 禁止事項
- AWS SDK直接呼び出し禁止（ラッパー関数使用）
- ハードコーディングされたARN禁止（CDK参照使用）
- console.logの代わりにstructured loggingを使用
```

このルールブックをCursorに適切に認識させると、AIが一貫したパターンで開発してくれる。

## 🎯 今や一人でもプロジェクト全体が可能に

### MSA設計 + モノレポ管理の利点
**設計は分離、管理は統合**

| 区分 | 従来の方法 | 現在の方法 |
|------|-----------|-----------|
| リポジトリ | 関数別分離 | プロジェクト統合 |
| デプロイ | 個別デプロイ | 選択的一括デプロイ |
| コード再利用 | コピペ | 共通モジュール |
| AI活用度 | 限定的 | 全体コンテキスト |
| 開発速度 | 遅い | 速い |

### 実際のプロジェクト構造
```
my-fullstack-project/
├── cdk/
│   ├── lib/
│   │   ├── api-stack.ts      # API Gateway + Lambda
│   │   ├── frontend-stack.ts  # S3 + CloudFront
│   │   └── database-stack.ts  # DynamoDB
│   └── bin/app.ts
├── lambdas/
│   ├── user-service/
│   ├── auth-service/
│   └── common/               # 共通ユーティリティ
├── frontend/
│   ├── src/
│   └── dist/
├── demo/
│   └── landing-page/
└── docs/
    ├── rulebook.md           # AI用ルールブック
    └── architecture.md
```

## 🔧 Cursorと共に進める開発ワークフロー

### 新機能追加プロセス
1. **要件定義**（1分）
   - 「ユーザープロファイル参照APIを作って」

2. **Cursorが自動生成**（2分）
   - CDKスタックにLambda関数を追加
   - Lambda関数実装（ルールブック基準）
   - フロントエンド連携コード生成

3. **デプロイとテスト**（2分）
   - `npm run deploy`
   - デモページで即座にテスト

**合計5分**で完了。これがまさにAI 200%活用の力である。

### トークン消費最適化のコツ
**Ultra版を使いながら学んだこと**
- ルールブックを適切に作成すればAIが迷わない
- コンテキストウィンドウには関連ファイルのみ含める
- 頻繁に使うパターンはスニペットとして登録

```typescript
// 頻繁に使うLambda関数テンプレートをスニペットとして登録
const lambdaTemplate = `
export const handler = async (event: APIGatewayProxyEvent) => {
  // ルールブック基準の標準パターン
};
`;
```

## 💡 結論：一人でもフルスタック開発が現実になった

**利点のまとめ**
- 開発速度200%向上
- メンテナンス性大幅改善
- AIコンテキスト共有による一貫したコード品質
- 一人でもプロジェクト全体の開発が可能

**注意事項**
- ルールブック管理が核心
- 初期構造設計に時間投資が必要
- トークン消費を考慮（Ultra版推奨）

このような方法で開発すると、本当に生産性が違います。もし似たような経験をお持ちの方がいらっしゃれば、どのような方法で管理されているのか気になりますね！

より良いコツがあれば、コメントで共有してください 🙏