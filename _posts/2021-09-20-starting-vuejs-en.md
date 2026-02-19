---
layout: post
title: "A jQuery Developer Picks Up Vue.js"
date: 2021-09-20 09:00:00 +0900
categories: [Development, Frontend]
tags: [Vue.js, JavaScript, jQuery, Frontend, Getting Started]
author: "Kevin Park"
lang: en
excerpt: "After 10+ years of jQuery, I finally started learning Vue.js. Reactive data binding turns out to be a game changer."
---

# A jQuery Developer Picks Up Vue.js

## Why Now?

I've started learning Vue.js.

I should have picked up a frontend framework ages ago. React, Vue, Angular — everyone's been using these for years, and I was still getting by with jQuery.

jQuery isn't bad. I've used it for over a decade and there's nothing it can't do. But recent projects show fewer and fewer places using jQuery. Client requests like "please use Vue" are becoming more common.

In my [post about developer laziness](/2020/03/16/developer-laziness-burnout-en/), I said "deliberately introduce unfamiliar technology into every project." This is me putting that into practice.

## Why Vue Over React

I went with Vue after weighing the options. Here's why.

The learning curve is reportedly gentler. People said Vue is the easiest transition for jQuery developers since it's HTML-template-based — similar to the markup structure we're already used to.

React's JSX felt unfamiliar. Writing HTML inside JavaScript was the opposite of what I was used to (JavaScript inside HTML).

Angular looked too massive. The mandatory TypeScript was also a hurdle.

## First Impressions

My honest take after first touching Vue:

**Reactive data binding is a revelation.**

Compared to jQuery's direct DOM manipulation, this is incredibly convenient. Change the data, and the UI updates automatically. In jQuery, you'd write `$('.target').text(newValue)` for every single update.

```javascript
// jQuery way
$('#counter').text(count);
$('#status').text(count > 10 ? 'Over' : 'Normal');
$('.counter-display').toggleClass('warning', count > 10);

// Vue way
data() {
  return { count: 0 }
},
computed: {
  status() { return this.count > 10 ? 'Over' : 'Normal' }
}
```

The component system is great too. I understood the concept of reusable UI pieces, but actually using it makes the project structure noticeably cleaner.

## The Hard Parts

It's not all smooth sailing.

State management (Vuex) didn't click at first. Why make it so complicated? Can't I just use global variables? That was my initial reaction. Apparently it makes sense once projects grow in scale, so I'm learning it on faith for now.

Build tools are unfamiliar too. jQuery was a single script tag and done. Vue needs webpack or Vite, build configurations. npm, node_modules, package.json... the frontend ecosystem has gotten this complex.

## Going Forward

I'm planning to apply Vue to a small project first. Rebuilding an admin panel I originally made with jQuery seems like good practice.

They say the best time to start is when you think you're too late. Honestly, I am a bit late. But I started AWS late too and it worked out fine, so Vue should be the same.

There's something oddly fun about becoming a beginner again. Not knowing things makes you search, searching leads to writing code, and before you know it you're in flow. I [wrote about this being the cure for developer laziness](/2020/03/16/developer-laziness-burnout-en/), and it really does seem to work.
