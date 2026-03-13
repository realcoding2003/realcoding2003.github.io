---
layout: post
title: "Node.js AbortControllerでfetchのタイムアウトを処理する方法"
date: 2026-02-02 09:00:00 +0900
categories: [Development, Tips]
tags: [Node.js, AbortController, fetch, timeout]
author: "Kevin Park"
lang: ja
excerpt: "Node.jsでAbortControllerを活用して、fetchリクエストにタイムアウトを設定するクリーンなパターンをご紹介します。"
---

## 問題

外部APIを呼び出す際、レスポンスが返ってこないとリクエストが永遠に待機してしまう問題がありました。サードパーティAPIが遅くなったり障害が発生すると、自分たちのサービスまで一緒に止まってしまいます。`setTimeout` + `Promise.race`の組み合わせで解決しようとすると、コードが煩雑になります。

## 解決方法

`AbortController`を使えば、fetchリクエストにタイムアウトをクリーンに設定できます。

```javascript
async function fetchWithTimeout(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// 使用例
const data = await fetchWithTimeout('https://api.example.com/users', 3000);
```

Node.js 20+では`AbortSignal.timeout()`でさらに簡単に書けます：

```javascript
// 一行で完結
const response = await fetch('https://api.example.com/users', {
  signal: AbortSignal.timeout(3000),
});
```

複数のリクエストを一括でキャンセルするパターンも便利です：

```javascript
async function fetchMultiple(urls) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const results = await Promise.all(
      urls.map((url) =>
        fetch(url, { signal: controller.signal }).then((r) => r.json())
      )
    );
    return results;
  } catch (error) {
    controller.abort(); // 一つでも失敗したら残りを全てキャンセル
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
```

## ポイント

- `AbortController`はfetchだけでなく、`addEventListener`や`ReadableStream`などでも使用できます
- `AbortSignal.timeout()`はNode.js 20+でサポートされており、手動のクリーンアップが不要なのでメモリリークの心配がありません
- 一つのcontrollerで複数のリクエストを同時にキャンセルできるので、並行リクエストの管理に最適です
