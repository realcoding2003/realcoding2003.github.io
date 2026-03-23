---
layout: post
title: "JavaScript Set New Methods - intersection, union, difference Practical Guide"
date: 2026-03-22 09:00:00 +0900
categories: [Development, Tips]
tags: [JavaScript, Set, intersection, union, difference, ES2025]
author: "Kevin Park"
lang: en
excerpt: "JavaScript Set finally gets intersection, union, difference, and symmetricDifference methods. Native set operations without filter + includes hacks."
---

## Problem

Finding common elements, merging, or computing differences between two arrays used to require clunky `filter` + `includes` combinations.

```javascript
// The old way - verbose and slow
const common = arr1.filter(x => arr2.includes(x));
const merged = [...new Set([...arr1, ...arr2])];
const diff = arr1.filter(x => !arr2.includes(x));
```

Since `includes` does an O(n) scan each time, the overall complexity is O(n²). It doesn't scale.

## Solution

Use the new Set composition methods. They shipped in all major browsers in 2024 and are available in Node.js 22+.

```javascript
const frontend = new Set(['React', 'Vue', 'Svelte', 'Angular']);
const liked = new Set(['React', 'Svelte', 'Rust', 'Go']);

// Intersection - elements in both
frontend.intersection(liked);
// Set {'React', 'Svelte'}

// Union - all elements combined
frontend.union(liked);
// Set {'React', 'Vue', 'Svelte', 'Angular', 'Rust', 'Go'}

// Difference - only in frontend
frontend.difference(liked);
// Set {'Vue', 'Angular'}

// Symmetric difference - in one but not both
frontend.symmetricDifference(liked);
// Set {'Vue', 'Angular', 'Rust', 'Go'}
```

There are also comparison methods:

```javascript
const all = new Set([1, 2, 3, 4, 5]);
const sub = new Set([2, 3]);
const other = new Set([6, 7]);

sub.isSubsetOf(all);       // true
all.isSupersetOf(sub);     // true
all.isDisjointFrom(other); // true
```

## Practical Patterns

Permission checking becomes much cleaner:

```javascript
function hasRequiredPermissions(userPerms, requiredPerms) {
  const user = new Set(userPerms);
  const required = new Set(requiredPerms);
  return required.isSubsetOf(user);
}

const myPerms = ['read', 'write', 'delete'];
const needed = ['read', 'write'];

hasRequiredPermissions(myPerms, needed); // true
```

Tag filtering is also straightforward:

```javascript
const selectedTags = new Set(['JavaScript', 'TypeScript']);
const postTags = new Set(['JavaScript', 'React', 'Node.js']);

selectedTags.intersection(postTags).size > 0; // true
```

## Key Points

- Four core methods: `intersection`, `union`, `difference`, `symmetricDifference`
- All return a new Set without mutating the original (immutable)
- Hash-based O(n) internally — significantly faster than `filter` + `includes`
- Supported in Node.js 22+, Chrome 122+, Safari 17+, Firefox 127+
- `isSubsetOf`, `isSupersetOf`, `isDisjointFrom` for set relationship checks
