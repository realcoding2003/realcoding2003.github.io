---
layout: post
title: "Redisキーのネーミング規則 - 階層的構造で管理する"
date: 2025-12-20 09:00:00 +0900
categories: [Development, Tips]
tags: [Redis, naming convention, key design, TypeScript]
author: "Kevin Park"
lang: ja
excerpt: "Redisキーを体系的に管理するネーミング規則とTypeScriptヘルパー関数パターンをご紹介します。"
---

## 問題

Redisキーを`"user_123_session"`、`"sess-user-123"`のようにバラバラに作っていると、どんなキーがあるのか把握できず、`KEYS *`検索も困難です。

## 解決方法

```typescript
const KEY_PREFIX = 'myapp';

export const keys = {
  conversation: (id: string) => `${KEY_PREFIX}:conv:${id}`,
  conversationMessages: (id: string) => `${KEY_PREFIX}:conv:${id}:messages`,
  userSettings: (id: string) => `${KEY_PREFIX}:settings:${id}`,
  userSession: (id: string) => `${KEY_PREFIX}:session:${id}`,
  allConversations: () => `${KEY_PREFIX}:conversations`,
  monthlyIndex: (ym: string) => `${KEY_PREFIX}:conv:month:${ym}`,
  cacheProduct: (id: string) => `${KEY_PREFIX}:cache:product:${id}`,
};

// 使用例
await redis.set(keys.conversation('abc123'), JSON.stringify(data));
await redis.del(keys.userSession('user1'));
```

## ポイント

- コロン（`:`）で階層を区切るのがRedisコミュニティの標準です。RedisInsightなどのGUIツールがこの構造をツリー表示してくれます。
- 関数でキーを生成するとタイプミスがなくなり、IDEの自動補完も効きます。文字列リテラルを直接使うと将来のリファクタリングが不可能になります。
- プレフィックス（`KEY_PREFIX`）があれば、同じRedisインスタンスで複数のアプリがキー衝突なく共存できます。
