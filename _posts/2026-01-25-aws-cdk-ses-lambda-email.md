---
layout: post
title: "AWS CDK로 SES 이메일 전송 Lambda 만들기"
date: 2026-01-25 09:00:00 +0900
categories: [Development, Tips]
tags: [AWS, CDK, SES, Lambda, email, TypeScript]
author: "Kevin Park"
lang: ko
excerpt: "AWS CDK로 SES 이메일 전송 Lambda를 구성하는 코드. API Gateway + Lambda + SES 조합."
---

## 문제

문의 폼에서 이메일을 보내는 기능이 필요한데, 서버를 따로 운영하기는 부담스럽다. AWS 서버리스로 해결하고 싶다.

## 해결

```typescript
// infra/lib/contact-api-stack.ts
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ses from 'aws-cdk-lib/aws-ses';
import * as iam from 'aws-cdk-lib/aws-iam';

export class ContactApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // SES 이메일 인증
    new ses.EmailIdentity(this, 'Sender', {
      identity: ses.Identity.email('contact@example.com'),
    });

    // Lambda 함수
    const fn = new lambda.Function(this, 'ContactFn', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/contact'),
    });

    // SES 전송 권한 부여
    fn.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ses:SendEmail'],
      resources: ['*'],
    }));

    // API Gateway
    const api = new apigateway.RestApi(this, 'ContactApi', {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ['POST', 'OPTIONS'],
      },
    });
    api.root.addResource('contact').addMethod('POST',
      new apigateway.LambdaIntegration(fn));
  }
}
```

## 핵심 포인트

- SES는 처음에 샌드박스 모드라서 인증된 이메일로만 보낼 수 있다. 프로덕션으로 전환하려면 AWS에 요청해야 한다.
- `ses:SendEmail` 권한의 `resources`를 `'*'`로 하면 모든 이메일로 보낼 수 있다. 보안이 중요하면 특정 identity ARN으로 제한하는 게 좋다.
- CDK로 인프라를 코드로 관리하면 환경 복제가 `cdk deploy`한 줄이다. 콘솔에서 클릭하는 것보다 훨씬 재현 가능하다.
