---
layout: post
title: "AWS Lambda デプロイシェルスクリプト - CDK関数名を自動検索"
date: 2026-02-15 09:00:00 +0900
categories: [Development, Tips]
tags: [AWS, Lambda, shell script, deploy, CDK]
author: "Kevin Park"
lang: ja
slug: aws-lambda-deploy-shell-script
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /ja/2026/02/15/aws-lambda-deploy-shell-script-ja/
  - /2026/02/15/aws-lambda-deploy-shell-script-ja/
excerpt: "CDKが生成したLambda関数名を自動的に見つけてコードをデプロイするシェルスクリプトパターンをご紹介します。"
---

## 問題

CDKでLambdaを作成すると関数名にハッシュが付きます（`MyFunction-a1b2c3d4`）。毎回コンソールで関数名を確認してからデプロイしなければなりません。

## 解決方法

```bash
#!/bin/bash
set -euo pipefail

FUNCTION_NAME="${1:?Usage: deploy.sh <function-name>}"
REGION="ap-northeast-2"

ACTUAL_FN=$(aws lambda list-functions \
  --region "$REGION" \
  --query "Functions[?starts_with(FunctionName, '${FUNCTION_NAME}')].FunctionName" \
  --output text)

if [ -z "$ACTUAL_FN" ]; then
  echo "Error: No Lambda function found with prefix '$FUNCTION_NAME'"
  exit 1
fi

echo "Found: $ACTUAL_FN"

npm run build
cd dist && zip -r ../deploy.zip . && cd ..

aws lambda update-function-code \
  --function-name "$ACTUAL_FN" \
  --zip-file "fileb://deploy.zip" \
  --region "$REGION"

echo "Deployed to $ACTUAL_FN"
rm deploy.zip
```

## ポイント

- `--query`でJMESPathの`starts_with()`を使えば、プレフィックスで関数を検索できます。CDKが付けるハッシュを知らなくても大丈夫です。
- `set -euo pipefail`はエラー発生時に即座に中断します。ビルド失敗したのにデプロイまで進んでしまう事故を防ぎます。
- `fileb://`はバイナリファイルパスを示すAWS CLIプロトコルです。`file://`とは異なるため注意。zipファイルは必ず`fileb://`で渡す必要があります。
