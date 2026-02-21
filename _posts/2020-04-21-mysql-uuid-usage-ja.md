---
layout: post
title: "MySQL uuid()活用記 - Auto Increment PKをURLに露出してはいけない理由"
date: 2020-04-21 09:00:00 +0900
categories: [Development, Database]
tags: [MySQL, UUID, セキュリティ, データベース, PHP]
author: "Kevin Park"
lang: ja
excerpt: "auto_incrementのPKをそのままURLに使うと、セキュリティ監査で毎回指摘される。かといってPKを全部UUIDに変えるのは非効率すぎる。現実的な妥協案をまとめました。"
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /2020/04/21/mysql-uuid-usage-ja/
---

# Auto Increment PKをURLに露出してはいけない理由

## よくあるパターン

ほとんどのWebサービスで、こういうURLを見たことがあるはずです。

```
/users/1
/boards/152
/orders/30421
```

DBテーブルのauto_increment値をそのままURLに使うパターン。開発する時はこれが一番楽です。PK値一つで検索すれば終わりですから。

でもセキュリティレポートが来ると、ほぼ毎回この部分が指摘されます。

## 何が問題なのか

連番がURLに露出すると、こんな問題が発生します。

- `mb_no=1`なら「このサイトの最初の会員だな」という情報が漏れる
- `order_id=30421`なら「このサイトの注文件数は約3万件だな」ということも分かる
- URLの数字を変えながら他人のデータへのアクセスを試みることが可能（IDOR脆弱性）

もちろんサーバー側で権限チェックを適切に行えば、実際にデータが漏洩することはありません。でもセキュリティ監査では「不必要な情報露出」として指摘の対象になります。

## ではUUIDを使おう...でも

MySQLには`uuid()`関数があります。これで生成すると`550e8400-e29b-41d4-a716-446655440000`のような値が出てきます。

```sql
SELECT uuid();
-- 550e8400-e29b-41d4-a716-446655440000
```

じゃあPKを全部UUIDに変えればいいのでは？と思うかもしれませんが、現実はそう簡単ではありません。

UUIDをPKにすると起きる問題：

- **インデックス性能低下**：36バイトの文字列 vs 4バイトの整数。比較演算自体が遅くなります
- **クラスタードインデックスの問題**：InnoDBではPKがクラスタードインデックスですが、UUIDはランダムなのでINSERTのたびにページ分割が発生します
- **ストレージの浪費**：JOINが多いテーブルほどFKまで全部UUIDになるので、容量の無駄が大きくなります
- **デバッグの不便さ**：`WHERE id = 1` vs `WHERE id = '550e8400-e29b-41d4-a716-446655440000'`...言うまでもないですね

PKを全部UUIDに変えるのは非効率的すぎます。

## 現実的な妥協案

私が使っている方式はこうです。

**PKはauto_incrementのまま残して、URLに露出する部分だけ別途UUIDカラムを追加する。**

```sql
CREATE TABLE members (
    mb_no INT AUTO_INCREMENT PRIMARY KEY,
    mb_uuid CHAR(36) DEFAULT (uuid()),
    mb_name VARCHAR(50),
    -- ...
    INDEX idx_uuid (mb_uuid)
);
```

内部的にJOINや検索をする時は`mb_no`を使い、外部に露出するURLでは`mb_uuid`を使います。

```
-- 内部クエリ
SELECT * FROM members WHERE mb_no = 1;

-- URLからのアクセス
SELECT * FROM members WHERE mb_uuid = '550e8400-...';
```

これならパフォーマンスもセキュリティも両立できます。

## 必ずしもMySQLのuuid()でなくても良い

UUID生成を必ずMySQLで行う必要はありません。アプリケーションレベルで生成しても構いません。

PHPなら`uniqid()`関数がありますし：

```php
$unique_id = uniqid('', true);
// 例：5e6f7a8b9c0d1.12345678
```

より安全にしたいなら`random_bytes()`で生成もできます：

```php
$uuid = bin2hex(random_bytes(16));
```

最近はほとんどの言語でUUIDライブラリが提供されているので、状況に合わせて使えば良いです。

## まとめ

結論はシンプルです。

- auto_incrementのPKは内部でのみ使う
- URLに露出する識別子は別途UUIDカラムで分離する
- PKを全部UUIDに変えるのは非効率的なのでやめておく

セキュリティレポートで毎回指摘されるストレスも、これでスッキリ解決できます。最初からこう設計しておけば良いのですが...すでに稼働中のサービスに適用するとなると、またマイグレーションの問題が出てきます。

結局「そのうちやろう」リストにまた一つ追加されるのです。
