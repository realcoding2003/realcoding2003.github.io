---
layout: post
title: "グヌーボード フック(Hook) 使用法とイベント種類完全ガイド"
date: 2023-07-20 10:00:00 +0900
categories: [Development, Tutorial]
tags: [gnuboard, php, hooks, korean-cms, web-development]
author: "Kevin Park"
lang: ja
excerpt: "グヌーボード bbs フォルダを修正せずにコード挿入するフック機能の使用法と全てのイベント種類をまとめました。extend フォルダ活用から実際の実装まで"
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /2023/07/20/gnuboard-hooks-guide-ja/
---

# グヌーボード フック(Hook) 使用法とイベント種類完全ガイド

## 🎯 概要

グヌーボード フックは **bbs フォルダを直接修正せずに** 途中でコードを挿入できる機能です。extend フォルダに PHP ファイルを作成して、希望するタイミングで関数を実行できます。

### 基本使用法（すぐに使用可能）

```php
<?php
if (!defined('_GNUBOARD_')) exit; // 個別ページアクセス不可

// イベント登録
add_event('write_update_after', 'my_custom_function', G5_HOOK_DEFAULT_PRIORITY, 4);

// 実行される関数
function my_custom_function($board, $wr_id, $w, $qstr, $redirect_url)
{
    global $g5;
    
    // 投稿作成・修正後に実行されるコード
    // 例：ログ記録、通知送信など
    
    // ログ例
    $log_data = "掲示板: {$board['bo_table']}, 投稿番号: {$wr_id}, 作業: {$w}";
    write_log($log_data, 'board_activity');
}
?>
```

### 主要イベント例

```php
// 1. 会員ログイン後の処理
add_event('member_login_check', 'after_login_process');

// 2. 投稿作成前の検証
add_event('write_update_before', 'validate_content');

// 3. 管理者設定変更後の処理
add_event('admin_config_form_update', 'config_changed_notify');
```

---

## 📚 詳細説明

### グヌーボード フックの動作原理

グヌーボード フックシステムはイベント基盤で動作します。グヌーボード コアで特定のタイミングごとに `run_event()` 関数を呼び出して、登録されたフック関数を順次実行します。

```php
// グヌーボード コア内部（bbs フォルダ）
run_event('event_name', $params);
```

この時、`extend` フォルダに登録されたフック関数が実行される構造です。

### フックファイル作成と登録

**ステップ1：ファイル作成**
```
/extend/my_hooks.php （ファイル名は自由）
```

**ステップ2：基本構造作成**
```php
<?php
if (!defined('_GNUBOARD_')) exit;

// 優先順位とパラメータ数を指定
add_event('イベント名', '関数名', G5_HOOK_DEFAULT_PRIORITY, パラメータ数);

function 関数名($param1, $param2, ...)
{
    // 実行するコード
}
?>
```

**ステップ3：パラメータ活用**
```php
function write_update_handler($board, $wr_id, $w, $qstr, $redirect_url)
{
    // $board: 掲示板設定配列
    // $wr_id: 投稿番号
    // $w: 作業区分（write/modify/reply）
    // $qstr: クエリストリング
    // $redirect_url: リダイレクト URL
    
    if ($w === 'write') {
        // 新しい投稿作成時のみ実行
        send_notification($board['bo_table'], $wr_id);
    }
}
```

### 実際の活用事例

**事例1：投稿作成時の Slack 通知**
```php
<?php
if (!defined('_GNUBOARD_')) exit;

add_event('write_update_after', 'slack_notification', G5_HOOK_DEFAULT_PRIORITY, 5);

function slack_notification($board, $wr_id, $w, $qstr, $redirect_url)
{
    if ($w === 'write') {
        $write = get_write($board['bo_table'], $wr_id);
        
        $message = "新しい投稿: [{$board['bo_subject']}] {$write['wr_subject']}";
        send_slack_message($message);
    }
}

function send_slack_message($message)
{
    $webhook_url = 'YOUR_SLACK_WEBHOOK_URL';
    $data = json_encode(['text' => $message]);
    
    $ch = curl_init($webhook_url);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_exec($ch);
    curl_close($ch);
}
?>
```

**事例2：会員登録時の追加処理**
```php
<?php
if (!defined('_GNUBOARD_')) exit;

add_event('register_form_update_after', 'welcome_process', G5_HOOK_DEFAULT_PRIORITY, 2);

function welcome_process($mb_id, $w)
{
    if ($w === '') { // 新規登録
        // ウェルカムメッセージ送信
        send_welcome_message($mb_id);
        
        // デフォルトグループ追加
        add_member_to_default_group($mb_id);
        
        // 登録ログ記録
        write_log("新規会員登録: {$mb_id}", 'member_register');
    }
}
?>
```

## 📋 グヌーボード フックイベント全体リスト

### 共通およびレイアウト

| イベント名 | ファイル位置 | パラメータ | 説明 |
|-----------|-------------|-----------|------|
| `common_header` | common.php | - | 共通ヘッダーロード時 |
| `pre_head` | head.php | - | HTML head 生成前 |
| `tail_sub` | tail.sub.php | - | フッターテンプレートロード時 |

### 管理者エリア

| イベント名 | ファイル位置 | パラメータ | 説明 |
|-----------|-------------|-----------|------|
| `admin_common` | adm/_common.php | - | 管理者共通ロード時 |
| `admin_board_form_update` | adm/board_form_update.php | $bo_table, $w | 掲示板設定変更時 |
| `admin_config_form_update` | adm/config_form_update.php | - | 基本設定変更時 |
| `admin_member_form_update` | adm/member_form_update.php | $w, $mb_id | 会員情報変更時 |
| `admin_member_form_add` | adm/member_form.php | $mb, $w, 'table' | 会員フォーム追加時 |

### 掲示板機能

| イベント名 | ファイル位置 | パラメータ | 説明 |
|-----------|-------------|-----------|------|
| `bbs_write` | bbs/write.php | $board, $wr_id, $w | 投稿フォームロード時 |
| `write_update_before` | bbs/write_update.php | $board, $wr_id, $w, $qstr | 投稿保存前 |
| `write_update_after` | bbs/write_update.php | $board, $wr_id, $w, $qstr, $redirect_url | 投稿保存後 |
| `bbs_delete` | bbs/delete.php | $write, $board | 投稿削除時 |
| `bbs_good_before` | bbs/good.php | $bo_table, $wr_id, $good | 推薦前 |
| `bbs_good_after` | bbs/good.php | $bo_table, $wr_id, $good | 推薦後 |

### コメント機能

| イベント名 | ファイル位置 | パラメータ | 説明 |
|-----------|-------------|-----------|------|
| `comment_update_after` | bbs/write_comment_update.php | $board, $wr_id, $w, $qstr, $redirect_url, $comment_id, $reply_array | コメント保存後 |
| `bbs_delete_comment` | bbs/delete_comment.php | $comment_id, $board | コメント削除時 |

### 会員機能

| イベント名 | ファイル位置 | パラメータ | 説明 |
|-----------|-------------|-----------|------|
| `register_form_update_before` | bbs/register_form_update.php | $mb_id, $w | 会員登録処理前 |
| `register_form_update_after` | bbs/register_form_update.php | $mb_id, $w | 会員登録処理後 |
| `member_login_check` | bbs/login_check.php | $mb, $link, $is_social_login | ログイン確認時 |
| `member_logout` | bbs/logout.php | $link | ログアウト時 |
| `password_is_wrong` | bbs/login_check.php, bbs/password_check.php | 'login', $mb または 'bbs', $wr, $qstr | パスワード間違い時 |

### ファイルおよびダウンロード

| イベント名 | ファイル位置 | パラメータ | 説明 |
|-----------|-------------|-----------|------|
| `download_file_header` | bbs/download.php | $file, $file_exist_check | ファイルダウンロード前 |
| `write_update_file_insert` | bbs/write_update.php | $bo_table, $wr_id, $upload[$i], $w | ファイルアップロード時 |

## スキン方式との違い

### 既存スキン方式
```php
// 掲示板スキン内部
// update_head.skin.php
// 特定スキンでのみ動作
```

### フック方式の利点
1. **広範囲適用**：管理者ページ（/adm/）まで含む
2. **中央集中管理**：extend フォルダで統合管理
3. **スキン独立**：スキン変更と無関係に動作
4. **優先順位制御**：複数フックの実行順序調整可能

### 実装のコツ

**1. エラー処理**
```php
function my_hook_function($param1, $param2)
{
    try {
        // メインロジック
        process_data($param1, $param2);
    } catch (Exception $e) {
        // エラーログ記録
        error_log("Hook Error: " . $e->getMessage());
    }
}
```

**2. 条件付き実行**
```php
function conditional_hook($board, $wr_id, $w)
{
    // 特定掲示板でのみ実行
    if ($board['bo_table'] !== 'notice') {
        return;
    }
    
    // 新規作成時のみ実行
    if ($w !== 'write') {
        return;
    }
    
    // 実際の処理ロジック
    send_notification($board, $wr_id);
}
```

**3. パフォーマンス最適化**
```php
function optimized_hook($params)
{
    // 不要な DB クエリ防止
    static $cache = [];
    
    $cache_key = md5(serialize($params));
    if (isset($cache[$cache_key])) {
        return $cache[$cache_key];
    }
    
    // 処理ロジック
    $result = expensive_operation($params);
    $cache[$cache_key] = $result;
    
    return $result;
}
```

## 結論

グヌーボード フックシステムは、コアファイル修正なしに希望する機能を追加できる強力なツールです。特に管理者エリアまで包括する広い適用範囲とイベント基盤の明確な実行タイミングが大きな利点です。

フックを効果的に活用すれば、グヌーボードサイトの機能を安全かつ体系的に拡張でき、アップデート時にも機能損失なしに維持できます。

**次のステップ**：実際のプロジェクトに必要な機能を把握し、適切なイベントを選択してフックを実装してみてください。小さな機能から始めて、徐々に複雑なビジネスロジックを追加していくことをお勧めします。