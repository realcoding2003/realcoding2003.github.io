---
layout: post
title: "Using ChatGPT for Microservice Architecture Design - An Honest Review"
date: 2024-02-10 09:00:00 +0900
categories: [Development, AI]
tags: [MSA, ChatGPT, Microservices, Architecture, AI]
author: "Kevin Park"
lang: en
excerpt: "I tried using ChatGPT to help design a microservice architecture. It's no replacement for an architect, but as a rubber duck debugging partner, it's unbeatable."
---

# Using ChatGPT for MSA Design

## ChatGPT as Architecture Consultant?

I've been actively using ChatGPT at work lately.

Using it for code generation and debugging is old news. This time, I tried it during the design phase of a microservice architecture project — decomposing an existing monolith into microservices, using ChatGPT as an architecture sounding board.

Bottom line: more useful than expected.

## Where It Helped

These were the main areas:

**Service boundary identification.** The hardest part of moving from monolith to microservices is deciding where to cut. I described the current system to ChatGPT and asked how it might be decomposed. The suggestions were reasonably sound. Not directly usable, but a solid starting point for thinking.

**Communication pattern decisions.** When debating synchronous (REST) vs asynchronous (message queue) for inter-service communication, I asked for pros, cons, and situational recommendations. Textbook answers, but well-organized — useful as decision-support material.

**Failure scenario simulation.** Questions like "If the payment service goes down in this architecture, what happens?" yielded helpful cascade failure scenarios. It surfaced edge cases I'd overlooked.

## Clear Limitations

ChatGPT can't replace an architect.

It doesn't know your actual system. Traffic patterns, team size, codebase state, business constraints — you can explain all of this, but it still can't fully grasp the real context.

It offers "general best practices," not "the right answer." MSA design varies by situation, but ChatGPT defaults to textbook responses. "Our team is 3 people with 100K lines of legacy code" type constraints don't get properly factored in.

And it occasionally states wrong things with full confidence. Hallucinations are particularly common with recent libraries and tool specifics. Never trust answers without verification.

## The Most Useful Role

Where ChatGPT proved most valuable was as a **rubber duck debugging partner.**

When designing architecture solo, it's easy to get trapped in your own thinking. You convince yourself an approach works and stop seeing counterarguments. Explaining your design to ChatGPT and asking "any problems with this?" surfaces edge cases you hadn't considered.

It's like having a colleague you can ask "can you review this?" — except this one answers at 2 AM. It can't replace a real colleague's experience and intuition, of course.

## My Practical Workflow

Here's the approach I've settled on:

1. I create the design first
2. Explain it to ChatGPT and request a review
3. Incorporate only the valid criticism
4. Ask about implementation details during the build phase

The key: ChatGPT reviews my design — it doesn't create it. I always maintain ownership. That keeps responsibility clear.

AI tools genuinely boost productivity. But "AI will figure it out" is a dangerous mindset. Tools are tools, nothing more.
