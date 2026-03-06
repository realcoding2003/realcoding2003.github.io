---
layout: post
title: "AWS Lambda 배포 쉘 스크립트 - CDK 함수명 자동 조회"
date: 2026-02-15 09:00:00 +0900
categories: [Development, Tips]
tags: [AWS, Lambda, shell script, deploy, CDK]
author: "Kevin Park"
lang: ko
excerpt: "CDK가 생성한 Lambda 함수명을 자동으로 찾아서 코드를 배포하는 쉘 스크립트 패턴."
---

## 문제

CDK로 Lambda를 만들면 함수명에 해시가 붙는다. `MyFunction-a1b2c3d4` 같은 식이라 매번 콘솔에서 함수명을 확인하고 배포해야 한다.

## 해결

```bash
#!/bin/bash
set -euo pipefail

FUNCTION_NAME="${1:?Usage: deploy.sh <function-name>}"
REGION="ap-northeast-2"

# CDK가 생성한 Lambda 함수명 조회 (접두사로 검색)
ACTUAL_FN=$(aws lambda list-functions \
  --region "$REGION" \
  --query "Functions[?starts_with(FunctionName, '${FUNCTION_NAME}')].FunctionName" \
  --output text)

if [ -z "$ACTUAL_FN" ]; then
  echo "Error: No Lambda function found with prefix '$FUNCTION_NAME'"
  exit 1
fi

echo "Found: $ACTUAL_FN"

# 빌드 & 패키징
npm run build
cd dist && zip -r ../deploy.zip . && cd ..

# 배포
aws lambda update-function-code \
  --function-name "$ACTUAL_FN" \
  --zip-file "fileb://deploy.zip" \
  --region "$REGION"

echo "Deployed to $ACTUAL_FN"
rm deploy.zip
```

## 핵심 포인트

- `--query`에 JMESPath의 `starts_with()`를 쓰면 접두사로 함수를 찾을 수 있다. CDK가 뒤에 붙이는 해시는 몰라도 된다.
- `set -euo pipefail`은 에러 발생 시 즉시 중단한다. 빌드 실패했는데 배포까지 가는 사고를 방지한다.
- `fileb://`는 바이너리 파일 경로를 나타내는 AWS CLI 프로토콜이다. `file://`과 다르니 주의. zip 파일은 반드시 `fileb://`로 전달해야 한다.
