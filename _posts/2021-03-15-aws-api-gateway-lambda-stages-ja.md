---
layout: post
title: "API Gatewayステージ別Lambda関数の分離 - 権限設定で苦労した話"
date: 2021-03-15 09:00:00 +0900
categories: [Development, DevOps]
tags: [AWS, API Gateway, Lambda, ステージ, サーバーレス]
author: "Kevin Park"
lang: ja
excerpt: "API Gatewayでdev、staging、prodステージごとに異なるLambda関数を呼び出したかった。公式ドキュメントだけでは全然できなくて、かなり苦労しました。"
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /2021/03/15/aws-api-gateway-lambda-stages-ja/
---

# API Gatewayステージ別Lambda関数の分離

## やりたかったこと

[AWSにハマって勉強し](/ja/2020/09/10/getting-into-aws-ja/)、[資格まで取った](/ja/2020/12/15/aws-developer-certification-ja/)後、実際のプロジェクトに本格的に適用し始めました。

そこで必要になったのが、API Gatewayのステージごとに異なるLambda関数を呼び出すことでした。開発（dev）、ステージング（staging）、本番（prod）環境でそれぞれ異なる関数を呼び出す必要があったのですが、これが思ったより簡単ではありませんでした。

やりたかった構成はこうです：

```
API Gateway
├── dev ステージ → my-function-dev
├── staging ステージ → my-function-staging
└── prod ステージ → my-function-prod
```

## 最初の試み - ステージ変数

API Gatewayにはステージ変数（Stage Variables）という機能があります。ステージごとに異なる変数値を設定でき、Lambda関数名にこの変数を使えます。

Lambda統合設定で関数名をこう設定します：

```
my-function-${stageVariables.env}
```

そして各ステージで`env`変数を`dev`、`staging`、`prod`に設定。

ここまでは公式ドキュメントにも書いてあります。でもこのままだと動きません。

## 権限の問題

動かない理由はLambdaのリソースベースポリシー（Resource-based Policy）にあります。

API GatewayがLambdaを呼び出すには、Lambda側で「API Gatewayが自分を呼び出してもよい」という権限を付与する必要があります。コンソールで統合を設定すると、この権限は自動的に追加されます。でもステージ変数を使うと、自動追加されないのです。

なぜなら、コンソールが追加する権限は特定の関数名に対するものですが、`${stageVariables.env}`のような変数はまだ確定した値ではないからです。

結局、各Lambda関数に手動で権限を追加する必要があります：

```bash
aws lambda add-permission \
  --function-name my-function-dev \
  --statement-id apigateway-dev \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:ap-northeast-2:123456789:api-id/*/GET/resource"
```

これをdev、staging、prodの各関数に対して実行する必要があります。

## これでかなり時間を取られました

公式ドキュメントには「ステージ変数でLambda関数を指定できます」とだけ書いてあり、権限を手動で追加しなければならないという説明は小さな注記にありました。資料を探しても、ちゃんとした説明があまり見つかりませんでした。

エラーメッセージも直感的ではありませんでした。「Execution failed due to configuration error: Invalid permissions on Lambda function」と表示されるのですが、何をどう直せばいいのか分かりませんでした。

結局CloudWatchのログを調べ、Stack Overflowを調べ、AWSフォーラムを調べて解決しました。

## もう一つの方法 - Lambda Alias

ステージ変数方式の他に、Lambda Aliasを使う方法もあります。

一つのLambda関数に複数のバージョンをデプロイし、各バージョンにaliasを付けます：

```
my-function:dev
my-function:staging
my-function:prod
```

これなら関数を複数作る必要がなく、一つの関数で管理できます。デプロイもaliasを更新するだけなので、よりスッキリします。

ただし、権限の問題は同じです。alias別に権限を個別に付与する必要があります。

## 結論

結局、核心は**権限設定**でした。機能自体はシンプルなのに、権限のせいで動かないのです。

AWSを使っていて思うのですが、IAM権限が学習時間全体の半分は占めている気がします。サービス自体よりも「誰が誰を呼び出せるか」を設定する方が難しいです。

でも成功したら達成感がありました。今はdevでテストしてprodにデプロイするパイプラインがきれいに動いています。

資格取得時に勉強した内容が実戦で役立った最初のケースでした。やはり勉強は裏切らない...と信じたいです。
