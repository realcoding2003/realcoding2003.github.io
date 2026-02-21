---
layout: post
title: "Complete Guide to Gnuboard Hook Usage and Event Types"
date: 2023-07-20 10:00:00 +0900
categories: [Development, Tutorial]
tags: [gnuboard, php, hooks, korean-cms, web-development]
author: "Kevin Park"
lang: en
excerpt: "A comprehensive guide to using Gnuboard hook features for code injection without modifying the bbs folder, covering extend folder usage and practical implementations."
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /2023/07/20/gnuboard-hooks-guide-en/
---

# Complete Guide to Gnuboard Hook Usage and Event Types

## 🎯 Summary

Gnuboard hooks are a feature that allows you to **insert code without directly modifying the bbs folder**. You can create PHP files in the extend folder to execute functions at desired points in time.

### Basic Usage (Ready to Use)

```php
<?php
if (!defined('_GNUBOARD_')) exit; // Prevent individual page access

// Register event
add_event('write_update_after', 'my_custom_function', G5_HOOK_DEFAULT_PRIORITY, 4);

// Function to be executed
function my_custom_function($board, $wr_id, $w, $qstr, $redirect_url)
{
    global $g5;
    
    // Code to execute after post creation/modification
    // e.g., logging, sending notifications, etc.
    
    // Log example
    $log_data = "Board: {$board['bo_table']}, Post ID: {$wr_id}, Action: {$w}";
    write_log($log_data, 'board_activity');
}
?>
```

### Key Event Examples

```php
// 1. Process after member login
add_event('member_login_check', 'after_login_process');

// 2. Validate content before post creation
add_event('write_update_before', 'validate_content');

// 3. Process after admin configuration changes
add_event('admin_config_form_update', 'config_changed_notify');
```

---

## 📚 Detailed Explanation

### How Gnuboard Hook System Works

The Gnuboard hook system operates on an event-driven basis. The Gnuboard core calls the `run_event()` function at specific points to sequentially execute registered hook functions.

```php
// Inside Gnuboard core (bbs folder)
run_event('event_name', $params);
```

At this point, hook functions registered in the `extend` folder are executed.

### Creating and Registering Hook Files

**Step 1: Create File**
```
/extend/my_hooks.php (filename is flexible)
```

**Step 2: Write Basic Structure**
```php
<?php
if (!defined('_GNUBOARD_')) exit;

// Specify priority and parameter count
add_event('event_name', 'function_name', G5_HOOK_DEFAULT_PRIORITY, parameter_count);

function function_name($param1, $param2, ...)
{
    // Code to execute
}
?>
```

**Step 3: Utilize Parameters**
```php
function write_update_handler($board, $wr_id, $w, $qstr, $redirect_url)
{
    // $board: Board configuration array
    // $wr_id: Post ID
    // $w: Action type (write/modify/reply)
    // $qstr: Query string
    // $redirect_url: Redirect URL
    
    if ($w === 'write') {
        // Execute only on new post creation
        send_notification($board['bo_table'], $wr_id);
    }
}
```

### Practical Use Cases

**Case 1: Slack Notification on Post Creation**
```php
<?php
if (!defined('_GNUBOARD_')) exit;

add_event('write_update_after', 'slack_notification', G5_HOOK_DEFAULT_PRIORITY, 5);

function slack_notification($board, $wr_id, $w, $qstr, $redirect_url)
{
    if ($w === 'write') {
        $write = get_write($board['bo_table'], $wr_id);
        
        $message = "New Post: [{$board['bo_subject']}] {$write['wr_subject']}";
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

**Case 2: Additional Processing on Member Registration**
```php
<?php
if (!defined('_GNUBOARD_')) exit;

add_event('register_form_update_after', 'welcome_process', G5_HOOK_DEFAULT_PRIORITY, 2);

function welcome_process($mb_id, $w)
{
    if ($w === '') { // New registration
        // Send welcome message
        send_welcome_message($mb_id);
        
        // Add to default group
        add_member_to_default_group($mb_id);
        
        // Record registration log
        write_log("New member registration: {$mb_id}", 'member_register');
    }
}
?>
```

## 📋 Complete List of Gnuboard Hook Events

### Common and Layout

| Event Name | File Location | Parameters | Description |
|------------|---------------|------------|-------------|
| `common_header` | common.php | - | When common header loads |
| `pre_head` | head.php | - | Before HTML head generation |
| `tail_sub` | tail.sub.php | - | When footer template loads |

### Admin Area

| Event Name | File Location | Parameters | Description |
|------------|---------------|------------|-------------|
| `admin_common` | adm/_common.php | - | When admin common loads |
| `admin_board_form_update` | adm/board_form_update.php | $bo_table, $w | When board settings change |
| `admin_config_form_update` | adm/config_form_update.php | - | When basic settings change |
| `admin_member_form_update` | adm/member_form_update.php | $w, $mb_id | When member info changes |
| `admin_member_form_add` | adm/member_form.php | $mb, $w, 'table' | When member form is added |

### Board Functions

| Event Name | File Location | Parameters | Description |
|------------|---------------|------------|-------------|
| `bbs_write` | bbs/write.php | $board, $wr_id, $w | When write form loads |
| `write_update_before` | bbs/write_update.php | $board, $wr_id, $w, $qstr | Before post save |
| `write_update_after` | bbs/write_update.php | $board, $wr_id, $w, $qstr, $redirect_url | After post save |
| `bbs_delete` | bbs/delete.php | $write, $board | When post is deleted |
| `bbs_good_before` | bbs/good.php | $bo_table, $wr_id, $good | Before recommendation |
| `bbs_good_after` | bbs/good.php | $bo_table, $wr_id, $good | After recommendation |

### Comment Functions

| Event Name | File Location | Parameters | Description |
|------------|---------------|------------|-------------|
| `comment_update_after` | bbs/write_comment_update.php | $board, $wr_id, $w, $qstr, $redirect_url, $comment_id, $reply_array | After comment save |
| `bbs_delete_comment` | bbs/delete_comment.php | $comment_id, $board | When comment is deleted |

### Member Functions

| Event Name | File Location | Parameters | Description |
|------------|---------------|------------|-------------|
| `register_form_update_before` | bbs/register_form_update.php | $mb_id, $w | Before registration processing |
| `register_form_update_after` | bbs/register_form_update.php | $mb_id, $w | After registration processing |
| `member_login_check` | bbs/login_check.php | $mb, $link, $is_social_login | When login is verified |
| `member_logout` | bbs/logout.php | $link | When logout occurs |
| `password_is_wrong` | bbs/login_check.php, bbs/password_check.php | 'login', $mb or 'bbs', $wr, $qstr | When password is incorrect |

### File and Download

| Event Name | File Location | Parameters | Description |
|------------|---------------|------------|-------------|
| `download_file_header` | bbs/download.php | $file, $file_exist_check | Before file download |
| `write_update_file_insert` | bbs/write_update.php | $bo_table, $wr_id, $upload[$i], $w | When file is uploaded |

## Differences from Skin Method

### Traditional Skin Method
```php
// Inside board skin
// update_head.skin.php
// Works only in specific skin
```

### Advantages of Hook Method
1. **Wide Application**: Includes admin pages (/adm/)
2. **Centralized Management**: Unified management in extend folder
3. **Skin Independent**: Works regardless of skin changes
4. **Priority Control**: Ability to adjust execution order of multiple hooks

### Implementation Tips

**1. Error Handling**
```php
function my_hook_function($param1, $param2)
{
    try {
        // Main logic
        process_data($param1, $param2);
    } catch (Exception $e) {
        // Log error
        error_log("Hook Error: " . $e->getMessage());
    }
}
```

**2. Conditional Execution**
```php
function conditional_hook($board, $wr_id, $w)
{
    // Execute only on specific board
    if ($board['bo_table'] !== 'notice') {
        return;
    }
    
    // Execute only on new posts
    if ($w !== 'write') {
        return;
    }
    
    // Actual processing logic
    send_notification($board, $wr_id);
}
```

**3. Performance Optimization**
```php
function optimized_hook($params)
{
    // Prevent unnecessary DB queries
    static $cache = [];
    
    $cache_key = md5(serialize($params));
    if (isset($cache[$cache_key])) {
        return $cache[$cache_key];
    }
    
    // Processing logic
    $result = expensive_operation($params);
    $cache[$cache_key] = $result;
    
    return $result;
}
```

## Conclusion

The Gnuboard hook system is a powerful tool that allows you to add desired functionality without modifying core files. The wide application scope covering even admin areas and clear execution timing based on events are major advantages.

Effective use of hooks enables safe and systematic extension of Gnuboard site functionality while maintaining features without loss during updates.

**Next Steps**: Identify the functionality needed for your actual project, select appropriate events, and implement hooks. We recommend starting with small features and gradually adding more complex business logic.