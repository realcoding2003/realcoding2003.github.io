---
layout: post
title: "AWS CDKでSESメール送信Lambdaを作る"
date: 2026-01-25 09:00:00 +0900
categories: [Development, Tips]
tags: [AWS, CDK, SES, Lambda, email, TypeScript]
author: "Kevin Park"
lang: ja
excerpt: "AWS CDKでSESメール送信Lambdaを構成するコード。API Gateway + Lambda + SESの組み合わせをご紹介します。"
---

## 問題

お問い合わせフォームからメールを送信する機能が必要ですが、専用サーバーを運用するのは負担が大きいです。AWSのサーバーレスで解決したいところです。

## 解決方法

```typescript
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ses from 'aws-cdk-lib/aws-ses';
import * as iam from 'aws-cdk-lib/aws-iam';

export class ContactApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new ses.EmailIdentity(this, 'Sender', {
      identity: ses.Identity.email('contact@example.com'),
    });

    const fn = new lambda.Function(this, 'ContactFn', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/contact'),
    });

    fn.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ses:SendEmail'],
      resources: ['*'],
    }));

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

## ポイント

- SESは最初サンドボックスモードのため、認証済みメールにのみ送信できます。プロダクション移行にはAWSへの申請が必要です。
- `ses:SendEmail`権限の`resources`を`'*'`にするとすべてのメールから送信可能です。セキュリティが重要な場合は、特定のidentity ARNに制限するのが良いです。
- CDKでインフラをコードで管理すれば、環境複製は`cdk deploy`の1行で完了です。コンソールでクリックするよりはるかに再現性があります。
