---
layout: post
title: "GitHub ActionsでDockerイメージをビルドしてECRに自動デプロイ"
date: 2026-02-17 09:00:00 +0900
categories: [Development, Tips]
tags: [GitHub Actions, CI/CD, Docker, AWS ECR, DevOps, Automation]
author: "Kevin Park"
lang: ja
slug: github-actions-docker-ecr-deploy
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /ja/2026/02/17/github-actions-docker-ecr-deploy-ja/
  - /2026/02/17/github-actions-docker-ecr-deploy-ja/
excerpt: "pushするだけでDockerイメージを自動ビルドしてECRにプッシュするワークフローの設定方法をご紹介します。"
---

## 問題

DockerイメージのビルドとECRへのpushを毎回手動で行っていました。ローカルのM1 Macでビルドするとアーキテクチャの問題が発生し、ビルド後にpushを忘れることも頻繁にありました。

## 解決方法

GitHub Actionsのワークフロー1つで完結します。

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

GitHubリポジトリのSettings → Secretsに`AWS_ACCESS_KEY_ID`と`AWS_SECRET_ACCESS_KEY`を登録してください。

## ポイント

- `github.sha`をタグとして使うと、どのコミットのイメージかを追跡できます。`latest`も一緒にpushしておくとデプロイ時に便利です。
- GitHub Actionsのランナーは`linux/amd64`なので、M1/M2 Macのアーキテクチャ問題がありません。
- ECRリポジトリは事前に作成する必要があります。AWS CLIで`aws ecr create-repository --repository-name my-app`で作成できます。
- IAMユーザーに`AmazonEC2ContainerRegistryPowerUser`ポリシーを付与すれば、push/pull権限は十分です。
