---
layout: post
title: "Estimate LLM Token Count - Korean vs English Differences"
date: 2026-02-28 09:00:00 +0900
categories: [Development, Tips]
tags: [LLM, token, estimation, Korean, NLP]
author: "Kevin Park"
lang: en
slug: llm-token-count-estimation
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2026/02/28/llm-token-count-estimation-en/
  - /2026/02/28/llm-token-count-estimation-en/
excerpt: "A simple token estimation algorithm without a full tokenizer. Korean text consumes more tokens than English."
---

## Problem

Need to estimate token count before calling an LLM API. Installing tiktoken is overkill — just need a rough estimate.

## Solution

```typescript
function estimateTokenCount(text: string): number {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  let tokens = 0;

  for (const word of words) {
    const hasKorean = /[가-힣]/.test(word);
    if (hasKorean) {
      tokens += Math.ceil(word.length * 1.5);  // Korean: ~1.5 tokens/char
    } else {
      tokens += Math.ceil(word.length * 0.75); // English: ~0.75 tokens/char
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

## Key Points

- Korean characters take 3 bytes in UTF-8 and consume more tokens in BPE tokenizers than English. The same content in Korean uses 1.5-2x more tokens.
- This estimate isn't exact, but it's sufficient for pre-call cost estimation and input length checks.
- For precise counts, use OpenAI's tiktoken or Anthropic's tokenizer. But this approximation works for most use cases.
