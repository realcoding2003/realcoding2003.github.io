---
layout: post
title: "Mac mini一台でAI個人秘書を作った話 - OpenClawの設定からコスト最適化まで"
date: 2026-03-24 09:00:00 +0900
categories: [Development, AI]
tags: [OpenClaw, Claude Code, Mac mini, 個人秘書, Telegram, Gmail, Google Calendar, 自動化, コスト削減]
author: "Kevin Park"
lang: ja
excerpt: "OpenClawでGmailの自動整理、カレンダー登録、Telegram報告まで構築しました。ポイントはAPIではなくCLIで実行して、コストを極限まで抑えたことです。"
image: "/assets/images/posts/mac-mini-openclaw-personal-assistant/mac-mini-hero.jpg"
---

![我が家の個人秘書Mac mini](/assets/images/posts/mac-mini-openclaw-personal-assistant/mac-mini-hero.jpg)

オフィスに仕事用で買ったMac miniが一台あります。放置状態でした。時間ができたので、最近話題のOpenClawをセットアップしてみました。

まずは簡単に秘書の仕事をさせてみました。メール整理とスケジュール管理くらいです。メールは毎日何十通も溜まるのに確認しない。スケジュール関連のメールが来てもカレンダーに登録しないから見落とす。

セットアップ中に重要なことを2つ学びました。OpenClawをClaude OAuthで連携するとアカウントがブロックされる可能性があること。そしてAPIだけで回すとコストがかなりかかること。この2つを回避してコストを最適化する方法を見つけました。

この記事はそのセットアップ記です。OpenClawのインストールからアカウントブロック回避、コストをほぼゼロにする構造まで。

---

**目次**

**事前準備**

1. [Mac miniの基本セットアップ](#ステップ1mac-miniの基本セットアップ) - Homebrew、Node.js
2. [Claude Code CLIのインストール](#ステップ2claude-code-cliのインストールと認証) - 公式スクリプト＋認証
3. [APIキーとボットトークンの取得](#ステップ3apiキーとボットトークンの取得) - Claude APIキー、Telegramボットトークン

**本格インストール**

4. [OpenClawのインストール](#ステップ4openclawのインストール) - インストール＋ペアリング
5. [Google Cloud API連携](#ステップ5google-cloud-api連携) - Gmail、Calendar API

**活用**

6. [機能の構築](#実際の機能を構築する) - メール整理、Telegram報告、カレンダー登録
7. [コストが核心](#でもコストが核心なんです) - API vs CLI、バッチスクリプト戦略

---

全体の構成はこうなっています。

![Mac mini AI個人秘書アーキテクチャ](/assets/images/posts/mac-mini-openclaw-personal-assistant/architecture.jpg)

## 事前準備

### ステップ1：Mac miniの基本セットアップ

Mac miniを秘書として使うには、まず土台を整える必要があります。macOSなのでHomebrewさえあれば後は簡単です。

```bash
# Homebrewインストール（既にあればスキップ）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.jsインストール
brew install node

# バージョン確認
node -v  # v24.x以上を推奨
npm -v
```

Mac miniがこの用途にぴったりな理由があります。低消費電力で24時間稼働しても電気代の負担が少ない。macOSなので開発環境のセットアップが楽。そして無音です。

### ステップ2：Claude Code CLIのインストールと認証

ここが重要です。後で説明するコスト削減の核心がClaude Code CLIにあります。

公式のインストール方法は[Claude Code公式ドキュメント](https://code.claude.com/docs/ko/setup)に記載されています。

```bash
# Claude Code公式インストール
curl -fsSL https://claude.ai/install.sh | bash
```

インストール後、ターミナルで`claude`コマンドを実行します。初回起動時にブラウザが開き、Anthropicアカウントでログインします。ここでMaxプランのサブスクリプションが必要です。MaxプランならCLI利用がサブスクリプションに含まれているため、追加課金はありません。

なぜこれが重要なのかは後ほど詳しく説明します。とりあえず覚えておいてください。**CLI = 追加コストなし**。

### ステップ3：APIキーとボットトークンの取得

OpenClawをインストールすると対話形式でいろいろ聞かれます。その時に必要なものを事前に準備しておかないと途中で詰まります。

**必要なもの2つ：**

### Claude APIキー

[Anthropic Console](https://console.anthropic.com/)に登録してAPIキーを発行します。

1. Anthropic Consoleにアクセス → 会員登録
2. API Keysメニューで新しいキーを作成
3. `sk-ant-`で始まるキーが発行されます

コピーしてどこかに保存しておきましょう。CLIの認証とは別物です。

### Telegramボットトークン

秘書から報告を受けるにはチャネルが必要です。Telegramを選んだ理由はシンプルで、Bot APIが無料で強力だからです。

登録自体は電話番号だけで簡単にできます。面倒ではありませんでした。

ただ、ボット作成の手順が少し分かりにくかったです。Telegramデスクトップアプリをインストールして、そこで作業するのがずっと楽でした。画面が大きいのでトークンのコピーもしやすいです。

1. [Telegramデスクトップ](https://desktop.telegram.org/)をインストール
2. 電話番号で登録
3. BotFatherでボットを作成

![BotFatherで/newbotコマンドを入力](/assets/images/posts/mac-mini-openclaw-personal-assistant/botfather-newbot.png)

```
# Telegramデスクトップで@BotFatherを検索して会話開始

/newbot
# ボット名を入力（例：MyAssistantBot）
# ボットのユーザー名を入力（例：my_assistant_2026_bot）
# ユーザー名は必ず_botで終わる必要があります

# トークンが発行されます。保存しておいてください
# 例：7123456789:AAH1234abcd5678efgh...
```

![ボット作成完了後のトークン発行画面](/assets/images/posts/mac-mini-openclaw-personal-assistant/botfather-token.png)

最初に少し戸惑ったのが、BotFatherが聞いてくる「name」と「username」が別物だということです。nameは表示名で、usernameは固有IDのようなもので、必ず`_bot`で終わる必要があります。これを知らないとエラーが出続けます。

**Claude APIキー**と**Telegramボットトークン**、この2つをコピーして保存しておけば準備完了です。

## 本格インストール

### ステップ4：OpenClawのインストール

OpenClawはオープンソースのAIエージェントです。TelegramやSlackなどのメッセンジャーとAIを接続するツールで、これを使うとTelegramからAIに直接指示を出せます。

公式のインストール方法は[OpenClaw公式サイト](https://openclaw.ai)で確認できます。

```bash
# OpenClaw公式インストール
curl -fsSL https://openclaw.ai/install.sh | bash
```

インストールが終わると対話形式でセットアップが始まります。順番に進めていくと、途中で選択肢が出てきます。

1. AI認証方式の選択 → **Claude auth**を選択
2. 次に**Claude API** vs **Claude OAuth**を聞かれる → **必ずAPIを選択**

ここで**絶対にOAuthを選ばないでください**。OAuthで連携するとアカウントがブロックされる可能性があります。必ずAPIです。

APIを選択したら、先ほど保存したものを入力します。

- Claude APIキー → `sk-ant-xxxxx`を貼り付け
- Telegramボットトークン → `7123456789:AAH...`を貼り付け

入力が終わればOpenClawが自動で設定してくれます。

### ボットのペアリング

設定完了後、Telegramでボットと初めて会話を始めると**ペアリングキー**が表示されます。

![Telegramでボットに/startを送るとペアリングコードが表示される](/assets/images/posts/mac-mini-openclaw-personal-assistant/pairing-code.jpg)

このキーをコピーしてOpenClawに入力すればペアリング完了です。

ここまでくれば、Telegramでボットにメッセージを送るとClaudeが応答する状態になります。

ちなみに、この初期設定の過程でAPI費用が**$10〜20ほど**消費されます。OpenClawが初回セットアップ時に各種テストや連携確認を行うためです。これは避けられません。

「API料金がかかるの？」その通りです。OpenClawがTelegramからのコマンドを処理する際にAPIを使います。でもこれはTelegramから直接コマンドを送る時だけなので量は少ないです。本当に重い作業は別の方法で処理します。これも後で説明します。

### ステップ5：Google Cloud API連携

正直、ここが全工程で一番面倒でした…。手順が多いです。でも一度やれば終わりなので、スクリーンショットを見ながら進めましょう。

#### Google Cloudへの登録とプロジェクト作成

Googleアカウントはあると思いますが、Cloud Consoleは別途登録が必要です。[Google Cloud Console](https://console.cloud.google.com/)にアクセスして登録します。決済情報の登録を求められますが、無料枠で十分です。

登録が終わったらプロジェクトを作成します。

![新規プロジェクト作成 - 名前入力](/assets/images/posts/mac-mini-openclaw-personal-assistant/gc-01-new-project.png)

プロジェクト名は何でもOKです。

#### APIの有効化

左側のハンバーガーメニューを開いて**APIとサービス**に進みます。

![左メニュー — APIとサービス](/assets/images/posts/mac-mini-openclaw-personal-assistant/gc-02-menu.png)

APIとサービスのダッシュボードが表示されます。**ライブラリ**からAPIを検索します。

![APIとサービスダッシュボード](/assets/images/posts/mac-mini-openclaw-personal-assistant/gc-03-api-dashboard.png)

ライブラリでAPI名を検索します。

![Calendar APIを検索](/assets/images/posts/mac-mini-openclaw-personal-assistant/gc-04-api-search.png)

クリックして**有効にする**ボタンを押せば有効化されます。

![Calendar APIを有効化](/assets/images/posts/mac-mini-openclaw-personal-assistant/gc-05-api-enable.png)

必要なAPIごとにこれを繰り返します。

必須：

- **Gmail API** — メールの読み取り・整理用
- **Google Calendar API** — 予定登録用

必要に応じて追加：

- Google Sheets API、Google Docs API、Google Drive API

私は5つほど有効化しましたが、メールとカレンダーだけなら2つで十分です。

#### 認証情報の設定

APIを有効化したら認証情報を作成します。**APIとサービス** > **認証情報**に進みます。

![認証情報ページ](/assets/images/posts/mac-mini-openclaw-personal-assistant/gc-06-credentials.png)

初めての場合はOAuth同意画面の設定を先に行うよう表示されます。

#### OAuth同意画面の設定

**Google認証プラットフォーム**画面が表示されます。**始める**ボタンを押します。

![OAuth概要 — 始める](/assets/images/posts/mac-mini-openclaw-personal-assistant/gc-07-oauth-start.png)

プロジェクト構成が4ステップで進みます。

**ステップ1：アプリ情報**

アプリ名とサポートメールを入力します。

![アプリ情報の入力](/assets/images/posts/mac-mini-openclaw-personal-assistant/gc-08-oauth-app-info.png)

**ステップ2：対象**

ユーザータイプを選択します。**内部（Internal）**を選びます。

![対象の選択](/assets/images/posts/mac-mini-openclaw-personal-assistant/gc-09-oauth-audience.png)

**ステップ3：連絡先情報**

メールアドレスを求められます。自分だけで使うので、適当に自分のメールアドレスを入れればOKです。

![連絡先情報の入力](/assets/images/posts/mac-mini-openclaw-personal-assistant/gc-10-oauth-contact.png)

**ステップ4：完了**

Google APIサービスのデータポリシーに同意して**作成**をクリックします。

![完了 — データポリシーへの同意](/assets/images/posts/mac-mini-openclaw-personal-assistant/gc-11-oauth-complete.png)

これでOAuth同意画面の設定が完了です。

#### OAuth 2.0クライアントIDの作成

再び左メニューから**APIとサービス** > **認証情報**に進みます。

![メニュー — 認証情報](/assets/images/posts/mac-mini-openclaw-personal-assistant/gc-12-menu-credentials.png)

上部の**+ 認証情報を作成**をクリックし、**OAuthクライアントID**を選択します。

![認証情報を作成](/assets/images/posts/mac-mini-openclaw-personal-assistant/gc-13-create-credentials.png)

アプリケーションの種類で**デスクトップアプリ**を選択します。

![デスクトップアプリを選択](/assets/images/posts/mac-mini-openclaw-personal-assistant/gc-14-client-type.png)

名前を入力して**作成**をクリックします。

![クライアントIDを作成](/assets/images/posts/mac-mini-openclaw-personal-assistant/gc-15-client-create.png)

#### credentials.jsonのダウンロード

クライアントIDが作成されるとポップアップが表示されます。**JSONをダウンロード**ボタンをクリックします。

![OAuthクライアント作成完了 — JSONダウンロード](/assets/images/posts/mac-mini-openclaw-personal-assistant/gc-16-json-download.png)

これが`credentials.json`ファイルです。Google API認証の鍵になります。

#### OpenClawへの連携

ダウンロードしたcredentials.jsonをダウンロードフォルダに置いて、OpenClawに連携を頼めばOKです。Telegramでボットに「ダウンロードフォルダのcredentials.jsonでGoogle API連携して」と言えば、自動で処理してくれます。

初回連携時にブラウザでGoogleアカウント認証が必要です。以降はトークンが自動更新されます。

ここが一番面倒な区間です。でも一度やってしまえば二度とやる必要はありません。

## 実際の機能を構築する

セットアップが終わったので、秘書に仕事をさせましょう。ここで重要なのは、コードを自分で書くのではなく、**会話で指示する**ということです。

### 核心の指示：バッチ + CLIで実行

Telegramでボットにこう伝えました。

```
自分：すべてのタスクは必ずバッチスクリプトとして登録して実行し、
      実行時にはclaude code cliを使うようにして
```

これが核心です。OpenClawに「タスクをバッチで作ってCLIで実行しろ」と指示するわけです。なぜこうするかは後で説明するコストの問題なんですが、とりあえず進めましょう。

### Gmail自動整理の設定

```
自分：6時間ごとにGmailのメールを自動整理して。
      プロモーション/マーケティングメールはアーカイブして、
      重要なメールは要約してTelegramで報告して。
      スケジュール関連のメールがあれば別途知らせて。
```

これだけです。OpenClawがバッチスクリプトを作成し、crontabに6時間周期で登録し、Claude Code CLIを通じて実行するよう設定してくれます。コードを一行も書く必要がありません。

### Telegramへの報告

設定が終わると、6時間ごとにこんな報告がTelegramに届きます。

![Telegramで受信したメール整理レポート](/assets/images/posts/mac-mini-openclaw-personal-assistant/telegram-report.png)

重要メールの要約、スケジュールのアラート、アーカイブ処理の結果がきれいにまとまって届きます。朝起きた時にはもうメール整理が終わっているわけです。

### スケジュールメール → Telegram確認 → カレンダー登録

スケジュール関連のメールが検知されると、Telegramで聞いてきます。

```
ボット：スケジュール関連のメールがあります。
        田中さん：3/27(木) 午後2時ミーティング提案
        カレンダーに登録しますか？

自分：うん、登録して

ボット：Google Calendarに登録しました。
        📅 3/27(木) 14:00-15:00
        タイトル：田中さんミーティング
        リマインダー：30分前
```

双方向のやり取りができるんです。一方的な報告だけでなく、Telegramで返事すればそれに応じて行動してくれます。

### 会話で機能を追加していく

後から機能を追加したくなったら、ただ言えばいいんです。

```
自分：毎朝9時に今日のカレンダー予定をTelegramで送って
```

```
自分：週に1回メールの統計をまとめて報告して。
      どの送信者が一番多かったか、重要メールの割合はどうか、とか。
```

こう言うだけでOpenClawがバッチスクリプトを作成・登録してくれます。コーディング不要。会話を重ねるごとに、自分だけの秘書が出来上がっていきます。

## でもコストが核心なんです

ここまで読むと「いいけど…API料金けっこうかかるんじゃ？」と思うかもしれません。

その通りです。最適化せずにAPIだけで回すと本当に怖いです。実際に確認したところ、**1日あたり$35〜55**かかります。20日使えば月$1,100超え。とんでもない金額です。

だからこそ最初に**「バッチスクリプトにしてCLIで実行しろ」**と指示したわけです。コスト構造が完全に変わります。

### API vs CLI、コストがこれだけ違う

```
APIだけで実行した場合：
  - 1日あたり$35〜55
  - 月20日使用で: 約$1,100+
  - 毎日秘書のように使うとこのくらいかかる

バッチ + CLIハイブリッド：
  - バッチ処理（CLI）: Maxプランに含まれる
  - 対話型タスク（API）: 1日$1未満
  - Telegramで色々頼んだ日: 1日$10〜20
```

差が圧倒的です。APIだけなら月$1,100超えですが、CLI中心に切り替えると1日$1もかかりません。Telegramで質問回答や別の作業をたくさん頼んだ日でも$10〜20程度です。

Maxプランは月額$100または$200ですが、開発作業用にすでにサブスクリプション中でした。この中にCLI利用が含まれているので、バッチ処理は追加コストがかかりません。

### なぜこう分けたのか

2つのチャネルでそれぞれ役割が異なります。

**OpenClaw（API経由）：**
- Telegramから直接コマンドを送る時
- 「カレンダーに登録して」のような対話型タスク
- APIキーが必要 — OpenClawがClaudeとやり取りするには必須
- 通常1日$1未満。たくさん使った日は$10〜20

**バッチスクリプト（CLI経由）：**
- 6時間ごとの自動メール整理
- 重い繰り返し作業すべて
- Claude Code CLIで実行 — Maxプランに含まれる
- 結果はTelegram Bot APIで送信（無料）

ポイントはこれです。**OpenClawはTelegramの入出力を担当し、実際の重い繰り返し作業はCLIが担当する。**

だからこそ最初の「バッチスクリプト + CLI」の指示が大事なんです。この一言でコストが劇的に下がります。

以前、[AIサブスクリプション費用についての考え](/2026/02/05/ai-subscription-regret/)を書いたことがありますが、結局すでに払っているサブスクリプション料金の中で最大限活用するのが答えです。

## まとめ

Mac mini一台。放置していたものを秘書にしました。

やっていることを整理するとこうなります。

- 6時間ごとにGmailを整理してTelegramで報告
- スケジュール関連のメールはTelegramで確認してカレンダーに登録
- 重い作業はCLIで、対話型の作業はAPIで。コスト最適化

正直、一番満足しているのはコスト構造です。APIだけで回していたら毎月$10〜30かかっていたところ、CLIで実行するだけでサブスクリプション料金内ですべて解決しました。

次はSlack連携や天気通知なども追加してみようと思っています。でも今の状態でもかなり便利です。朝起きたらTelegramにメール要約が届いているのは本当に楽です。

Mac miniを持て余している方がいたら、ぜひ試してみてください。セットアップは少し面倒ですが、一度やってしまえば後は自動で動きます。

どうせサブスクリプション料金を払っているなら、使わないともったいないですよ。
