---
layout: post
title: "Running LLMs Locally With Ollama - It Depends on the Use Case"
date: 2025-02-15 09:00:00 +0900
categories: [Development, AI]
tags: [Ollama, LLM, Local AI, Llama, Offline]
author: "Kevin Park"
lang: en
excerpt: "I wanted to run LLMs locally so I set up Ollama. Surprisingly easy to get running, but the gap with cloud APIs is clear when you need real capability."
---

# Running LLMs Locally With Ollama

## Why Run AI Locally?

Using cloud services like ChatGPT and Claude, there's always one nagging concern: sending my code to external servers.

Personal projects, fine. But working with client code or company-confidential material? That's uncomfortable. "We don't use your data for training," they say. But still.

So I decided to try running LLMs locally. Ollama seemed like the simplest option for installation and model management.

## Setup Is Dead Simple

```bash
# macOS
brew install ollama

# Start the service
ollama serve

# Download and run a model
ollama run llama3.1
```

That's it. Three lines and you have a local LLM running. No Docker configuration, no GPU driver hassle.

The model library is solid too. Llama 3.1, CodeLlama, Mistral, Gemma — open-source models downloadable with a single `ollama pull`.

## Real-World Usage

**Code assistance** — Tried CodeLlama. Simple function generation and code explanation work fine. But complex refactoring or architecture-level suggestions fall well short of GPT-4 or Claude.

**Document summarization** — Used Llama 3.1 for summarization. English documents came out decent. Non-English languages are noticeably weaker compared to cloud models.

**Speed** — Ran it on an M4 Mac Mini. 7B models have acceptable speed. But 70B-class models generate tokens too slowly to be practical. GPU memory is the bottleneck.

## My Conclusion

After trying various configurations, here's where I landed:

**Local LLM works well for:**
- Security-sensitive environments (proprietary code, confidential documents)
- Offline usage requirements
- Simple repetitive tasks (format conversion, basic classification)
- Reducing API costs

**Cloud LLM wins for:**
- Complex reasoning tasks
- Non-English language processing
- Access to current knowledge
- Long context handling

The conclusion is the predictable "it depends on the use case," but actually using both clarified exactly where that boundary sits. Local LLMs don't replace cloud LLMs — they complement them.

For daily work, Claude and GPT remain the primary tools, with Ollama reserved for security-sensitive tasks. Open-source models are improving rapidly, so this could change — but that's where things stand today.
