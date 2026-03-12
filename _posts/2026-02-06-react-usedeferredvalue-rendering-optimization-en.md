---
layout: post
title: "React useDeferredValue: Optimize Search Without Debounce"
date: 2026-02-06 09:00:00 +0900
categories: [Development, Tips]
tags: [React, useDeferredValue, performance, rendering]
author: "Kevin Park"
lang: en
excerpt: "Keep input responsive while deferring expensive list rendering — no debounce needed"
---

## Problem

A search filter over a large list causes janky typing because every keystroke triggers a full re-render. Debounce helps, but introduces a fixed delay and hides the input value while typing.

```jsx
function SearchList({ items }) {
  const [query, setQuery] = useState('');

  // With 10,000 items, filtering runs on every keystroke
  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <List items={filtered} />
    </>
  );
}
```

## Solution

`useDeferredValue` keeps the input instantly responsive while deferring the expensive rendering.

```jsx
import { useState, useDeferredValue, memo } from 'react';

function SearchList({ items }) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  // Input reflects query immediately, list uses deferredQuery
  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(deferredQuery.toLowerCase())
  );

  const isStale = query !== deferredQuery;

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <div style={{ opacity: isStale ? 0.7 : 1 }}>
        <SlowList items={filtered} />
      </div>
    </>
  );
}

// Must wrap with memo for the deferral to actually work
const SlowList = memo(function SlowList({ items }) {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
});
```

The difference from debounce:

```
debounce: typing stops → wait 300ms → start filtering
useDeferredValue: input updates instantly → filtering updates when browser is idle
```

User input is never delayed. React automatically defers only the expensive re-render.

## Key Points

- `useDeferredValue` separates urgent updates (input) from non-urgent updates (list rendering)
- Must be used with `memo` — without it, the component re-renders every time regardless
- Unlike debounce, there's no fixed delay — fast devices see near-instant updates, slow devices get graceful degradation
