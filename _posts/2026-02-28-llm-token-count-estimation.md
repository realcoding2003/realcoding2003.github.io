---
layout: post
title: "LLM 토큰 수 추정하기 - 한국어와 영어 차이"
date: 2026-02-28 09:00:00 +0900
categories: [Development, Tips]
tags: [LLM, token, estimation, Korean, NLP]
author: "Kevin Park"
lang: ko
excerpt: "정확한 토크나이저 없이 LLM API 비용을 추정하는 간단한 토큰 수 추정 알고리즘. 한국어는 영어보다 토큰을 더 많이 소비한다."
---

## 문제

LLM API를 호출하기 전에 대략적인 토큰 수를 알고 싶다. tiktoken 같은 라이브러리를 설치하기엔 과하고, 간단한 추정만 필요하다.

## 해결

```typescript
function estimateTokenCount(text: string): number {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  let tokens = 0;

  for (const word of words) {
    const hasKorean = /[가-힣]/.test(word);
    if (hasKorean) {
      tokens += Math.ceil(word.length * 1.5);  // 한국어: 글자당 ~1.5 토큰
    } else {
      tokens += Math.ceil(word.length * 0.75); // 영어: 글자당 ~0.75 토큰
    }
  }

  // 마크다운 구문 추가 토큰
  const mdElements = text.match(/```[\s\S]*?```|`[^`]+`|#{1,6}\s/g);
  if (mdElements) tokens += mdElements.length * 2;

  return Math.max(1, Math.round(tokens));
}

// 포맷팅 헬퍼
function formatTokens(count: number): string {
  return count < 1000 ? `${count} tokens` : `${(count / 1000).toFixed(1)}K tokens`;
}
```

## 핵심 포인트

- 한국어는 UTF-8 인코딩에서 글자당 3바이트를 차지하고, BPE 토크나이저에서도 영어보다 토큰을 많이 소비한다. 같은 의미의 텍스트라도 한국어가 영어보다 1.5~2배 더 많은 토큰을 쓴다.
- 이 추정은 정확하지 않지만, API 호출 전 비용 가늠이나 입력 길이 제한 체크에는 충분하다.
- 정확한 토큰 수가 필요하면 OpenAI의 tiktoken이나 Anthropic의 토크나이저를 사용해야 한다. 하지만 대부분의 경우 이 정도 추정이면 된다.
