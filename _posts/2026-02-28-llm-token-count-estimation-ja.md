---
layout: post
title: "LLMトークン数の推定 - 韓国語と英語の違い"
date: 2026-02-28 09:00:00 +0900
categories: [Development, Tips]
tags: [LLM, token, estimation, Korean, NLP]
author: "Kevin Park"
lang: ja
excerpt: "正確なトークナイザーなしでLLM APIコストを推定するシンプルなトークン数推定アルゴリズムをご紹介します。"
---

## 問題

LLM APIを呼び出す前に大まかなトークン数を知りたい。tiktokenのようなライブラリをインストールするのは過剰で、簡単な推定だけあれば十分です。

## 解決方法

```typescript
function estimateTokenCount(text: string): number {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  let tokens = 0;

  for (const word of words) {
    const hasKorean = /[가-힣]/.test(word);
    if (hasKorean) {
      tokens += Math.ceil(word.length * 1.5);  // 韓国語：文字あたり約1.5トークン
    } else {
      tokens += Math.ceil(word.length * 0.75); // 英語：文字あたり約0.75トークン
    }
  }

  const mdElements = text.match(/```[\s\S]*?```|`[^`]+`|#{1,6}\s/g);
  if (mdElements) tokens += mdElements.length * 2;

  return Math.max(1, Math.round(tokens));
}

function formatTokens(count: number): string {
  return count < 1000 ? `${count} tokens` : `${(count / 1000).toFixed(1)}K tokens`;
}
```

## ポイント

- 韓国語はUTF-8エンコーディングで1文字3バイトを占め、BPEトークナイザーでも英語よりトークンを多く消費します。同じ意味のテキストでも韓国語は英語の1.5〜2倍のトークンを使います。
- この推定は正確ではありませんが、API呼び出し前のコスト見積もりや入力長チェックには十分です。
- 正確なトークン数が必要な場合は、OpenAIのtiktokenやAnthropicのトークナイザーを使用してください。ただし、ほとんどの場合はこの程度の推定で十分です。
