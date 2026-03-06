---
layout: post
title: "AWS CDK - Build a SES Email Lambda in Minutes"
date: 2026-01-25 09:00:00 +0900
categories: [Development, Tips]
tags: [AWS, CDK, SES, Lambda, email, TypeScript]
author: "Kevin Park"
lang: en
excerpt: "Set up a serverless email sending endpoint with AWS CDK: API Gateway + Lambda + SES."
---

## Problem

Need email sending for a contact form, but running a dedicated server is overkill. Serverless AWS is the answer.

## Solution

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

## Key Points

- SES starts in sandbox mode — you can only send to verified emails. Request production access from AWS for unrestricted sending.
- Setting `resources: ['*']` for `ses:SendEmail` allows sending from any identity. For tighter security, restrict to specific identity ARNs.
- Infrastructure as code with CDK means environment replication is a single `cdk deploy`. Far more reproducible than console clicking.
