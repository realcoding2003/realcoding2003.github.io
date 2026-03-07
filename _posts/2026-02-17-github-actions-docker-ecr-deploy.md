---
layout: post
title: "GitHub Actions로 Docker 이미지 빌드 + ECR 자동 배포"
date: 2026-02-17 09:00:00 +0900
categories: [Development, Tips]
tags: [GitHub Actions, CI/CD, Docker, AWS ECR, DevOps, Automation]
author: "Kevin Park"
lang: ko
excerpt: "push하면 자동으로 Docker 이미지 빌드하고 ECR에 올리는 워크플로우 설정법."
---

## 문제

Docker 이미지를 빌드하고 ECR에 push하는 걸 매번 수동으로 하고 있었다. 로컬에서 빌드하면 M1 Mac이라 아키텍처 문제도 생기고, 빌드 후 push 잊어먹는 일도 잦았다.

## 해결

GitHub Actions 워크플로우 하나로 끝난다.

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

GitHub 리포지토리 Settings → Secrets에 `AWS_ACCESS_KEY_ID`와 `AWS_SECRET_ACCESS_KEY`를 등록하면 된다.

## 핵심 포인트

- `github.sha`를 태그로 쓰면 어떤 커밋의 이미지인지 추적할 수 있다. `latest`도 같이 push해두면 배포 시 편하다.
- GitHub Actions의 러너는 `linux/amd64`라서 M1/M2 Mac의 아키텍처 문제가 없다.
- ECR 리포지토리는 미리 만들어둬야 한다. AWS CLI로 `aws ecr create-repository --repository-name my-app`으로 생성하면 된다.
- IAM 사용자에게 `AmazonEC2ContainerRegistryPowerUser` 정책을 붙이면 push/pull 권한이 충분하다.
