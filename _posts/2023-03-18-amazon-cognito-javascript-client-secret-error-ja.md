---
layout: post
title: "Amazon CognitoをJavaScriptと連携する際に避けるべき致命的なミス"
date: 2023-03-18 10:00:00 +0900
categories: [AWS, Authentication]
tags: [Amazon Cognito, JavaScript, Authentication, AWS, 認証, エラー解決]
author: Kevin Park
lang: ja
excerpt: "Amazon CognitoをJavaScriptで連携する際に最も頻繁に発生する「クライアントシークレット」関連エラーと解決方法について説明します。"
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /2023/03/18/amazon-cognito-javascript-client-secret-error-ja/
---

Amazon CognitoはAWSが提供する強力なユーザー認証および管理サービスです。特にJavaScriptを使用したフロントエンド連携は最も一般的で簡単な方法の一つです。しかし、多くの開発者がCognitoを初めて設定する際に見落としがちな重要な設定があります。

## 🚨 最も頻繁なミス：クライアントシークレットの生成

Amazon CognitoをJavaScriptで連携する際に最もよく間違えるのは、**「クライアントシークレットの生成」**オプションをそのままにしておくことです。

### なぜこの設定が問題になるのでしょうか？

JavaScriptはブラウザで実行されるクライアントサイド言語です。ブラウザではソースコードがそのまま公開されるため、シークレットキーを安全に保管することができません。したがって、JavaScriptアプリケーションではクライアントシークレットを使用すべきではありません。

## ⚠️ 設定しないと発生するエラー

もしクライアントシークレット生成オプションを無効にしなければ、次のようなエラーメッセージが表示されます：

```
Unable to verify secret hash for client in Amazon Cognito Userpools
```

このエラーは、Cognitoがクライアントシークレットを期待しているが、JavaScriptコードではこれを提供できないために発生します。

## ✅ 正しい設定方法

### 1. アプリクライアント作成時の設定

Amazon Cognitoコンソールでアプリクライアントを作成する際：

1. **User Pool**を選択
2. **App clients**メニューに移動
3. **Add an app client**をクリック
4. 📋 **重要**: **「Generate client secret」**チェックボックスを**無効化**

![Cognitoクライアント設定](/assets/images/posts/cognito-client-settings.png)

### 2. 注意事項

⚠️ **この設定はアプリクライアント作成時にのみ変更可能です！**

アプリクライアントを既に作成した後では、クライアントシークレット設定を変更することはできません。もし間違ってクライアントシークレットを生成したままアプリクライアントを作成してしまった場合は、新しいアプリクライアントを再作成する必要があります。

## 💻 JavaScriptコード例

正しく設定されたCognitoアプリクライアントを使用するJavaScriptコードの例です：

```javascript
import { CognitoUser, CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';

// User Pool設定
const poolData = {
    UserPoolId: 'us-west-2_xxxxxxxxx', // User Pool ID
    ClientId: 'xxxxxxxxxxxxxxxxxxxxxxxxxx' // クライアントシークレットがないApp Client ID
};

const userPool = new CognitoUserPool(poolData);

// ユーザー登録例
function signUp(username, password, email) {
    const attributeList = [];
    
    const dataEmail = {
        Name: 'email',
        Value: email
    };
    
    const attributeEmail = new CognitoUserAttribute(dataEmail);
    attributeList.push(attributeEmail);
    
    userPool.signUp(username, password, attributeList, null, (err, result) => {
        if (err) {
            console.error('Sign up error:', err);
            return;
        }
        
        console.log('User registered successfully:', result.user);
    });
}
```

## 🔧 トラブルシューティングチェックリスト

まだエラーが発生する場合は、以下の項目を確認してください：

### 1. アプリクライアント設定確認

- [ ] クライアントシークレット生成が**無効化**されているか？
- [ ] 正しいClient IDを使用しているか？

### 2. User Pool設定確認

- [ ] User Pool IDが正確か？
- [ ] リージョン設定が正しいか？

### 3. 権限設定確認

- [ ] アプリクライアントに必要な認証フローが有効化されているか？
- [ ] 適切なOAuthスコープが設定されているか？

## 📚 追加リソース

- [Amazon Cognito公式ドキュメント](https://docs.aws.amazon.com/cognito/)
- [Amazon Cognito Identity SDK for JavaScript](https://github.com/aws-amplify/amplify-js/tree/main/packages/amazon-cognito-identity-js)

## 🎯 まとめ

Amazon CognitoをJavaScriptで連携する際は、**クライアントシークレット生成オプションを必ず無効化**する必要があります。これはセキュリティ上の理由だけでなく、正しい動作のためにも必須です。

小さな設定一つが大きな違いを生むことがあるので、Cognito設定時は慎重に確認してください！

---

💡 **お役に立ちましたか？** この投稿が有用でしたら共有してください！Amazon Cognitoについてさらに質問がございましたら、コメントでお知らせください。
