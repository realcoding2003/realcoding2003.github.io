---
layout: post
title: "AWS Lambda Deploy Script - Auto-Find CDK Function Names"
date: 2026-02-15 09:00:00 +0900
categories: [Development, Tips]
tags: [AWS, Lambda, shell script, deploy, CDK]
author: "Kevin Park"
lang: en
slug: aws-lambda-deploy-shell-script
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2026/02/15/aws-lambda-deploy-shell-script-en/
  - /2026/02/15/aws-lambda-deploy-shell-script-en/
excerpt: "Shell script pattern to automatically find CDK-generated Lambda function names and deploy code."
---

## Problem

CDK appends a hash to Lambda function names (`MyFunction-a1b2c3d4`). You have to check the console every time to find the exact name before deploying.

## Solution

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

## Key Points

- JMESPath `starts_with()` in `--query` finds functions by prefix. No need to know the CDK-appended hash.
- `set -euo pipefail` stops execution on any error. Prevents deploying after a failed build.
- `fileb://` is the AWS CLI protocol for binary files. Different from `file://` — zip files must use `fileb://`.
