---
layout: post
title: "Auto-Deploy Docker Images to ECR with GitHub Actions"
date: 2026-02-17 09:00:00 +0900
categories: [Development, Tips]
tags: [GitHub Actions, CI/CD, Docker, AWS ECR, DevOps, Automation]
author: "Kevin Park"
lang: en
excerpt: "Set up a GitHub Actions workflow that automatically builds Docker images and pushes them to ECR on every push."
---

## Problem

Building Docker images and pushing to ECR manually every time. Building locally on an M1 Mac caused architecture issues, and forgetting to push after building happened more often than it should.

## Solution

One GitHub Actions workflow handles everything.

```yaml
# .github/workflows/deploy.yml
name: Build and Push to ECR

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-northeast-2

      - name: Login to ECR
        id: ecr-login
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push
        env:
          REGISTRY: ${{ steps.ecr-login.outputs.registry }}
          REPOSITORY: my-app
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $REGISTRY/$REPOSITORY:$IMAGE_TAG .
          docker build -t $REGISTRY/$REPOSITORY:latest .
          docker push $REGISTRY/$REPOSITORY:$IMAGE_TAG
          docker push $REGISTRY/$REPOSITORY:latest
```

Add `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` to your repository's Settings → Secrets.

## Key Points

- Using `github.sha` as the tag makes it easy to trace which commit produced the image. Pushing `latest` alongside keeps deployments simple.
- GitHub Actions runners use `linux/amd64`, eliminating M1/M2 Mac architecture issues entirely.
- The ECR repository must exist before pushing. Create it with `aws ecr create-repository --repository-name my-app`.
- Attach the `AmazonEC2ContainerRegistryPowerUser` policy to your IAM user for sufficient push/pull permissions.
