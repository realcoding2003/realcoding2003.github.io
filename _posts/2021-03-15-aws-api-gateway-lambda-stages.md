---
layout: post
title: "API Gateway 스테이지별 Lambda 함수 분리 - 삽질 끝에 성공한 이야기"
date: 2021-03-15 09:00:00 +0900
categories: [Development, DevOps]
tags: [AWS, API Gateway, Lambda, 스테이지, 서버리스]
author: "Kevin Park"
lang: ko
excerpt: "API Gateway에서 dev, staging, prod 스테이지별로 다른 Lambda 함수를 호출하고 싶었다. 공식 문서만 보고는 도저히 안 돼서 한참 삽질했다."
---

# API Gateway 스테이지별 Lambda 함수 분리

## 하고 싶었던 것

[AWS에 빠져서 공부하고](/2020/09/10/getting-into-aws/) [자격증까지 딴](/2020/12/15/aws-developer-certification/) 이후로 실전 프로젝트에 본격적으로 적용하기 시작했다.

그러다 필요해진 게 API Gateway 스테이지별로 다른 Lambda 함수를 호출하는 것이었다. 개발(dev), 스테이징(staging), 운영(prod) 환경에서 각각 다른 함수를 호출해야 하는데, 이게 생각보다 쉽지 않았다.

원하는 구조는 이랬다:

```
API Gateway
├── dev 스테이지 → my-function-dev
├── staging 스테이지 → my-function-staging
└── prod 스테이지 → my-function-prod
```

## 처음 시도 - 스테이지 변수

API Gateway에는 스테이지 변수(Stage Variables)라는 기능이 있다. 스테이지마다 다른 변수 값을 설정할 수 있는 건데, Lambda 함수 이름에 이 변수를 쓸 수 있다.

Lambda 통합 설정에서 함수 이름을 이렇게 넣으면 된다:

```
my-function-${stageVariables.env}
```

그리고 각 스테이지에서 `env` 변수를 `dev`, `staging`, `prod`로 설정.

여기까지는 공식 문서에도 나와 있다. 근데 이대로만 하면 작동을 안 한다.

## 권한 문제

작동 안 하는 이유는 Lambda 리소스 기반 정책(Resource-based Policy) 때문이다.

API Gateway가 Lambda를 호출하려면 Lambda 쪽에서 "API Gateway가 나를 호출해도 된다"는 권한을 줘야 한다. 콘솔에서 통합을 설정하면 자동으로 이 권한이 추가되는데, 스테이지 변수를 쓰면 자동 추가가 안 된다.

왜냐하면 콘솔이 추가하는 권한은 특정 함수 이름에 대한 권한인데, `${stageVariables.env}` 같은 변수는 아직 확정된 값이 아니니까.

결국 수동으로 각 Lambda 함수에 권한을 추가해야 한다:

```bash
aws lambda add-permission \
  --function-name my-function-dev \
  --statement-id apigateway-dev \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:ap-northeast-2:123456789:api-id/*/GET/resource"
```

이걸 dev, staging, prod 함수 각각에 대해 실행해줘야 한다.

## 이것 때문에 한참 헤맸다

공식 문서에는 "스테이지 변수로 Lambda 함수를 지정할 수 있습니다" 라고만 되어 있고, 권한을 수동으로 추가해야 한다는 건 작은 글씨로 노트에 있었다. 자료를 찾아봐도 제대로 된 설명이 잘 없었다.

에러 메시지도 직관적이지 않았다. "Execution failed due to configuration error: Invalid permissions on Lambda function" 이게 뜨는데 뭘 어떻게 고쳐야 하는지 감이 안 왔다.

결국 CloudWatch 로그 뒤지고, Stack Overflow 뒤지고, AWS 포럼 뒤져서 해결했다.

## 또 다른 방법 - Lambda Alias

스테이지 변수 방식 말고 Lambda Alias를 쓰는 방법도 있다.

하나의 Lambda 함수에 여러 버전을 배포하고, 각 버전에 alias를 붙인다:

```
my-function:dev
my-function:staging
my-function:prod
```

이러면 함수를 여러 개 만들 필요 없이 하나의 함수에서 관리할 수 있다. 배포도 alias만 업데이트하면 되니까 좀 더 깔끔하다.

근데 이것도 권한 문제는 똑같이 있다. alias 별로 권한을 따로 줘야 한다.

## 결론

결국 핵심은 **권한 설정**이었다. 기능 자체는 간단한데 권한 때문에 안 되는 거다.

AWS 쓰면서 느끼는 건데, IAM 권한이 전체 학습 시간의 절반은 차지하는 것 같다. 서비스 자체보다 "누가 누구를 호출할 수 있는지" 설정하는 게 더 어렵다.

그래도 성공하고 나니 뿌듯하다. 이제 dev에서 테스트하고 prod로 배포하는 파이프라인이 깔끔하게 돌아간다.

자격증 딸 때 공부한 내용이 실전에서 도움이 된 첫 번째 케이스였다. 역시 공부는 배신하지 않는다... 고 믿고 싶다.
