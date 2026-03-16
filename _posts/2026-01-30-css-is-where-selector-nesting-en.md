---
layout: post
title: "Reduce Selector Repetition with CSS :is() and :where()"
date: 2026-01-30 09:00:00 +0900
categories: [Development, Tips]
tags: [CSS, Selectors, Frontend, Web-Development]
author: "Kevin Park"
lang: en
slug: css-is-where-selector-nesting
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2026/01/30/css-is-where-selector-nesting-en/
  - /2026/01/30/css-is-where-selector-nesting-en/
excerpt: "How to use CSS :is() and :where() to eliminate repetitive selectors, and the key specificity difference between them."
---

## Problem

Applying similar styles to multiple elements requires listing out selectors repeatedly:

```css
.article h1,
.article h2,
.article h3,
.article h4 {
  color: #333;
  line-height: 1.4;
}
```

This gets tedious fast, especially with nested contexts.

## Solution

`:is()` lets you group selector lists:

```css
.article :is(h1, h2, h3, h4) {
  color: #333;
  line-height: 1.4;
}

/* Group both sides */
:is(.article, .sidebar) :is(h1, h2, h3, h4) {
  line-height: 1.4;
}
```

`:where()` has the same syntax but **always has zero specificity**:

```css
/* :is() - takes the highest specificity argument */
:is(.class, #id) p { } /* specificity: (1,0,1) */

/* :where() - always zero specificity */
:where(.class, #id) p { } /* specificity: (0,0,1) */
```

This makes `:where()` ideal for default styles that should be easy to override:

```css
/* Base styles - easily overridable */
:where(.btn) {
  padding: 8px 16px;
  border-radius: 4px;
}

/* Simple class override works */
.my-btn {
  padding: 12px 24px;
}
```

## Key Points

- Both `:is()` and `:where()` group selector lists to reduce repetition
- `:is()` adopts the highest specificity among its arguments
- `:where()` always contributes zero specificity, making overrides easy
- Use `:where()` for resets/libraries, `:is()` for component styles
