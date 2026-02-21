---
layout: post
title: "JavaScript jQuery AJAX通信でHTTPヘッダーに値を追加する方法"
date: 2023-04-05 12:00:00 +0900
categories: [Development, Tutorial]
tags: [javascript, jquery, ajax, http-header, beforeSend, authorization]
author: "Kevin Park"
lang: ja
excerpt: "AJAX通信でbeforeSendとsetRequestHeaderを使用してHTTPヘッダーに認証トークンを追加する核心的な方法と実際の活用例について学びます。"
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /2023/04/05/jquery-ajax-http-header-ja/
---

# JavaScript jQuery AJAX通信でHTTPヘッダーに値を追加する方法

## 🎯 核心的な解決策（すぐに使用可能）

AJAX通信でHTTPヘッダーに値を追加するには **`beforeSend`** オプションを使用します。

```javascript
$.ajax({
    method: "POST",
    url: "your-api-url",
    beforeSend: function(xhr) {
        xhr.setRequestHeader("Authorization", "Bearer your-token");
        xhr.setRequestHeader("x-api-key", "your-api-key");
    },
    success: function(response) {
        console.log(response);
    },
    error: function(xhr, status, error) {
        console.error('Error:', error);
    }
});
```

### 最も多く使用されるパターン

**1. Authorizationヘッダーの追加**
```javascript
beforeSend: function(xhr) {
    xhr.setRequestHeader("Authorization", "Bearer " + accessToken);
}
```

**2. API Keyヘッダーの追加**
```javascript
beforeSend: function(xhr) {
    xhr.setRequestHeader("x-api-key", "your-api-key");
}
```

**3. 複数ヘッダーの追加**
```javascript
beforeSend: function(xhr) {
    xhr.setRequestHeader("Authorization", "Bearer " + token);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("X-Custom-Header", "custom-value");
}
```

---

## 📚 詳細説明

### beforeSendが必要な理由

WebアプリケーションでAPIサーバーと通信する際、セキュリティのためにHTTPヘッダーに認証情報を含める必要がある場合が多くあります。特に以下のような状況で必須となります：

- **REST API認証**: JWTトークン、Bearerトークン
- **AWS API Gateway**: APIキー、IAM認証
- **サードパーティAPI連携**: 各サービス固有の認証キー
- **CSRFセキュリティ**: トークンベースのセキュリティ処理

### 実際の開発事例

以下はAWS API GatewayとCognito認証を使用する実際の開発コードです：

```javascript
$.ajax({
    method: "POST",
    url: "https://console-api.ciottb.com/dashboard",
    beforeSend: function(xhr) {
        xhr.setRequestHeader("Authorization", cognito.session.idToken.jwtToken);
    },
    error: function(xhr, status, error) {
        alert(xhr.responseJSON.errorMessage);
        Swal.fire({
            type: 'error',
            title: xhr.responseJSON.errorMessage,
            showConfirmButton: true,
        });
    },
    success: function(res) {
        $("#word_cloud").jqCloud(res.total.wordcloud);
        tot_wordList(res.total.word_cnt);
        risk(res.Apple, "#apple");
        risk(res.Canonical, "#Canonical");
        risk(res.Cisco, "#Cisco");
        risk(res.Debian, "#Debian");
        risk(res.Google, "#Google");
        risk(res.Linux, "#Linux");
        risk(res.Microsoft, "#Microsoft");
        risk(res.Redhat, "#Redhat");
        risk(res.Sqlite, "#Sqlite");
    }
});
```

### xhr.setRequestHeader()メソッドの詳細

**構文**
```javascript
xhr.setRequestHeader(ヘッダー名, ヘッダー値)
```

**パラメータ**
- `ヘッダー名`: HTTPヘッダーの名前（文字列）
- `ヘッダー値`: そのヘッダーに設定する値（文字列）

**注意事項**
- `beforeSend`コールバック内でのみ呼び出し可能
- 大文字小文字を区別しない（HTTP標準）
- 同じヘッダー名で複数回呼び出すと値が累積される

### 様々な活用例

**1. 条件付きヘッダー追加**
```javascript
$.ajax({
    method: "GET",
    url: "/api/data",
    beforeSend: function(xhr) {
        // ログイン状態の時のみトークンを追加
        const token = localStorage.getItem('accessToken');
        if (token) {
            xhr.setRequestHeader("Authorization", "Bearer " + token);
        }
        
        // 開発環境でのみデバッグヘッダーを追加
        if (window.location.hostname === 'localhost') {
            xhr.setRequestHeader("X-Debug-Mode", "enabled");
        }
    }
});
```

**2. 動的トークン処理**
```javascript
function makeAuthenticatedRequest(url, data) {
    return $.ajax({
        method: "POST",
        url: url,
        beforeSend: function(xhr) {
            // トークンの有効期限チェックと更新
            const token = getValidToken(); // トークン検証関数
            xhr.setRequestHeader("Authorization", "Bearer " + token);
            xhr.setRequestHeader("Content-Type", "application/json");
        },
        data: JSON.stringify(data)
    });
}
```

**3. グローバルヘッダー設定**
```javascript
// 全てのAJAXリクエストに共通ヘッダーを適用
$.ajaxSetup({
    beforeSend: function(xhr) {
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        
        // 認証トークンがある時のみ追加
        const token = sessionStorage.getItem('authToken');
        if (token) {
            xhr.setRequestHeader("Authorization", "Bearer " + token);
        }
    }
});

// 以降の全ての$.ajax()呼び出しにヘッダーが自動追加される
$.get("/api/user/profile", function(data) {
    console.log(data);
});
```

### よく使用されるヘッダータイプ

**1. 認証関連ヘッダー**
```javascript
// JWTトークン
xhr.setRequestHeader("Authorization", "Bearer " + jwtToken);

// APIキー
xhr.setRequestHeader("x-api-key", apiKey);
xhr.setRequestHeader("X-API-KEY", apiKey);

// Basic認証
xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
```

**2. コンテンツ関連ヘッダー**
```javascript
// JSONデータ送信
xhr.setRequestHeader("Content-Type", "application/json");

// ファイルアップロード
xhr.setRequestHeader("Content-Type", "multipart/form-data");

// レスポンス形式指定
xhr.setRequestHeader("Accept", "application/json");
```

**3. セキュリティ関連ヘッダー**
```javascript
// CSRFトークン
xhr.setRequestHeader("X-CSRF-Token", csrfToken);

// リクエスト元確認
xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

// カスタムセキュリティヘッダー
xhr.setRequestHeader("X-Client-Version", "1.0.0");
```

### エラー処理とデバッグ

**1. ヘッダー関連エラー処理**
```javascript
$.ajax({
    method: "POST",
    url: "/api/data",
    beforeSend: function(xhr) {
        try {
            xhr.setRequestHeader("Authorization", "Bearer " + getToken());
        } catch (error) {
            console.error("ヘッダー設定エラー:", error);
            return false; // リクエスト中断
        }
    },
    error: function(xhr, status, error) {
        if (xhr.status === 401) {
            alert("認証が必要です。再度ログインしてください。");
            window.location.href = "/login";
        } else if (xhr.status === 403) {
            alert("権限がありません。");
        }
    }
});
```

**2. ヘッダー値の確認**
```javascript
$.ajax({
    beforeSend: function(xhr) {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
        
        // 開発者ツールでヘッダーを確認
        console.log("設定されたヘッダー:", {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        });
    }
});
```

### AWS API Gateway特化例

**1. Cognitoユーザープール認証**
```javascript
function callApiWithCognito(endpoint, data) {
    const cognitoUser = userPool.getCurrentUser();
    
    cognitoUser.getSession((err, session) => {
        if (err) {
            console.error('セッションエラー:', err);
            return;
        }
        
        $.ajax({
            method: "POST",
            url: `https://your-api-id.execute-api.region.amazonaws.com/prod/${endpoint}`,
            beforeSend: function(xhr) {
                // Cognito JWTトークン
                xhr.setRequestHeader("Authorization", session.getIdToken().getJwtToken());
                xhr.setRequestHeader("Content-Type", "application/json");
            },
            data: JSON.stringify(data),
            success: function(response) {
                console.log('成功:', response);
            }
        });
    });
}
```

**2. IAM署名認証（AWS Signature V4）**
```javascript
$.ajax({
    method: "POST",
    url: "https://api.amazonaws.com/service",
    beforeSend: function(xhr) {
        // AWS SDKで生成された署名ヘッダー
        xhr.setRequestHeader("Authorization", awsSignature);
        xhr.setRequestHeader("X-Amz-Date", amzDate);
        xhr.setRequestHeader("X-Amz-Security-Token", sessionToken);
    }
});
```

## まとめ

jQuery AJAXでのHTTPヘッダー追加は、`beforeSend`オプションと`xhr.setRequestHeader()`メソッドを使用することで簡単に実装できます。

**重要なポイント**：
- `beforeSend`コールバックで`xhr.setRequestHeader(ヘッダー名, ヘッダー値)`を使用
- 認証トークン、APIキーなどのセキュリティ情報送信に必須
- 条件付きヘッダー追加とエラー処理を考慮
- AWS API Gatewayなどのクラウドサービス連携時に活用

この方法を通じて安全で効率的なAPI通信を実装することができます。