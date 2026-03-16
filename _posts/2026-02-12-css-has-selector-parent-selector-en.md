---
layout: post
title: "CSS :has() Selector: The Parent Selector We've Been Waiting For"
date: 2026-02-12 09:00:00 +0900
categories: [Development, Tips]
tags: [CSS, Selector, has, Frontend]
author: "Kevin Park"
lang: en
slug: css-has-selector-parent-selector
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2026/02/12/css-has-selector-parent-selector-en/
  - /2026/02/12/css-has-selector-parent-selector-en/
excerpt: "Use the CSS :has() selector to style parent elements based on their children — no JavaScript needed."
---

## Problem

Styling a parent element based on its child's state used to require JavaScript.

```javascript
checkbox.addEventListener('change', (e) => {
  e.target.closest('.card').classList.toggle('selected');
});
```

Simple style toggling shouldn't need JavaScript.

## Solution

The `:has()` selector makes this possible with pure CSS. Supported in all modern browsers.

```css
/* Card with a checked checkbox */
.card:has(input:checked) {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

/* Post item that contains an image */
.post-item:has(img) {
  grid-template-columns: 200px 1fr;
}

/* Form group with an empty input */
.form-group:has(input:placeholder-shown) {
  opacity: 0.7;
}
```

More practical examples:

```css
/* Red border when error message is visible */
.field:has(.error-message:not(:empty)) input {
  border-color: #ef4444;
}

/* Remove padding for sections with video */
section:has(video) {
  padding: 0;
}
```

## Key Points

- `:has()` lets you select parent or sibling elements conditionally in pure CSS
- Replaces JavaScript for state-based styling in many common scenarios
- Supported in all modern browsers (Chrome 105+, Firefox 121+, Safari 15.4+)
- Avoid deeply chained `:has()` selectors — they can impact rendering performance
