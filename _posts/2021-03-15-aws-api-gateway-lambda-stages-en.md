---
layout: post
title: "API Gateway Stage-Specific Lambda Functions - A Tale of Debugging Permissions"
date: 2021-03-15 09:00:00 +0900
categories: [Development, DevOps]
tags: [AWS, API Gateway, Lambda, Stages, Serverless]
author: "Kevin Park"
lang: en
excerpt: "I wanted API Gateway to call different Lambda functions per stage — dev, staging, prod. The docs made it look simple. It wasn't."
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /2021/03/15/aws-api-gateway-lambda-stages-en/
---

# API Gateway Stage-Specific Lambda Functions

## What I Wanted

After [getting into AWS](/en/2020/09/10/getting-into-aws-en/) and [passing the Developer Associate cert](/en/2020/12/15/aws-developer-certification-en/), I started applying it to real projects.

One thing I needed was calling different Lambda functions per API Gateway stage. Dev, staging, and production environments each needed their own function. Sounds straightforward, right?

The desired setup:

```
API Gateway
├── dev stage → my-function-dev
├── staging stage → my-function-staging
└── prod stage → my-function-prod
```

## First Attempt - Stage Variables

API Gateway has a feature called Stage Variables. You can set different variable values per stage and reference them in the Lambda integration.

In the Lambda integration config, set the function name to:

```
my-function-${stageVariables.env}
```

Then set the `env` variable to `dev`, `staging`, or `prod` in each stage.

The official docs cover this much. But if you stop here, it simply won't work.

## The Permissions Problem

It fails because of Lambda's resource-based policy.

For API Gateway to invoke a Lambda function, the function needs a policy saying "API Gateway is allowed to invoke me." When you set up the integration through the console normally, this permission is added automatically. But with stage variables, the automatic permission doesn't get created.

Why? Because the console adds permission for a specific function name, and `${stageVariables.env}` isn't resolved to an actual name yet.

You need to manually add permissions to each Lambda function:

```bash
aws lambda add-permission \
  --function-name my-function-dev \
  --statement-id apigateway-dev \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:ap-northeast-2:123456789:api-id/*/GET/resource"
```

Run this for dev, staging, and prod functions individually.

## This Had Me Stuck for Hours

The official docs say "you can specify Lambda functions using stage variables" but the part about manually adding permissions was buried in a small note. Finding proper explanations online wasn't easy either.

The error message wasn't helpful: "Execution failed due to configuration error: Invalid permissions on Lambda function." No clear indication of what to fix.

I ended up digging through CloudWatch logs, Stack Overflow, and AWS forums before figuring it out.

## Alternative Approach - Lambda Aliases

Instead of stage variables, you can use Lambda Aliases.

Deploy multiple versions of a single function and attach aliases to each:

```
my-function:dev
my-function:staging
my-function:prod
```

This way you manage one function instead of three. Deployments are cleaner too — just update the alias.

The permissions issue is the same though. Each alias needs its own permission grant.

## Takeaway

The core issue was **permissions**. The functionality itself is simple — it's the authorization that breaks things.

Working with AWS, I've come to feel that IAM permissions account for roughly half of total learning time. Setting up "who can call whom" is harder than the services themselves.

Still, getting it working felt great. Now the dev-to-prod deployment pipeline runs cleanly.

This was the first real-world case where studying for the certification actually paid off. Education doesn't betray you... or so I'd like to believe.
