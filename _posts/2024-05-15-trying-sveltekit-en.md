---
layout: post
title: "Giving SvelteKit a Try - Am I Framework-Hopping Again?"
date: 2024-05-15 09:00:00 +0900
categories: [Development, Frontend]
tags: [SvelteKit, Svelte, Frontend, JavaScript, Framework]
author: "Kevin Park"
lang: en
excerpt: "I barely finished learning Vue.js and another framework caught my eye. SvelteKit claims to be faster without virtual DOM. Time to find out."
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /2024/05/15/trying-sveltekit-en/
---

# Giving SvelteKit a Try

## Another New Framework?

It feels like [I just started learning Vue.js](/en/2021/09/20/starting-vuejs-en/), and already another framework has my attention.

This time it's SvelteKit.

The frontend framework wars are honestly exhausting. React, Vue, Angular, and now Svelte. Every few years, the "best" option changes. Try to learn them all and you'll never finish.

But Svelte looked genuinely different.

## What Makes Svelte Different

React and Vue use a virtual DOM. When state changes, they create a new virtual DOM, diff it against the previous one, and update only what changed. This was considered efficient — until Svelte took a completely different approach.

**It handles everything at compile time.**

Svelte transforms components into optimized vanilla JavaScript during the build step. No virtual DOM diffing at runtime. The result: smaller bundles and faster execution.

When I first heard this concept, my reaction was "oh, that actually makes sense." Simple yet logical.

## SvelteKit = Svelte + Full Stack

SvelteKit is a full-stack framework built on Svelte. Think Next.js for React.

It provides SSR, routing, and API endpoints out of the box. File-based routing means the directory structure directly maps to URLs:

```
src/routes/
├── +page.svelte          → /
├── about/+page.svelte    → /about
└── blog/[slug]/+page.svelte → /blog/:slug
```

Intuitive. I like it.

## The Code Is Clean

What struck me first about Svelte code was how little of it there is.

React needs useState, useEffect and other hooks for state management. Vue needs ref, reactive, computed APIs. Svelte?

```svelte
<script>
  let count = 0;
  $: doubled = count * 2;
</script>

<button on:click={() => count++}>
  {count} (doubled: {doubled})
</button>
```

Just declare a variable. `$:` makes it reactive. Almost zero boilerplate.

## Is It Worth Learning?

I'm genuinely conflicted.

I haven't even used Vue deeply yet. Picking up another framework risks becoming a "Jack of all trades, master of none" situation — poking at everything, mastering nothing.

But as I [wrote about overcoming developer laziness](/en/2020/03/16/developer-laziness-burnout-en/), learning new technology reignites motivation. Coding gets fun again when there's something you don't know.

The plan is to build one small side project with SvelteKit first. Too risky to introduce it into client work directly — validate it in a side project, then decide.

Whether I'll fall for another framework or conclude "Vue was fine after all" — only one way to find out.
