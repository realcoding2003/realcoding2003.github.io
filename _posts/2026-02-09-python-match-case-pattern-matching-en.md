---
layout: post
title: "Python match-case: Cleaner Alternative to if-elif Chains"
date: 2026-02-09 09:00:00 +0900
categories: [Development, Tips]
tags: [Python, Pattern Matching, match-case, Python3]
author: "Kevin Park"
lang: en
slug: python-match-case-pattern-matching
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2026/02/09/python-match-case-pattern-matching-en/
  - /2026/02/09/python-match-case-pattern-matching-en/
excerpt: "Use Python 3.10's structural pattern matching to replace messy if-elif chains."
---

## Problem

Handling API responses often leads to long if-elif chains.

```python
def handle_response(response):
    if response['status'] == 200:
        return process_data(response['data'])
    elif response['status'] == 404:
        return None
    elif response['status'] == 401 or response['status'] == 403:
        raise AuthError()
    elif response['status'] >= 500:
        raise ServerError()
    else:
        raise UnknownError(response['status'])
```

Add a few more conditions and it becomes hard to read.

## Solution

Python 3.10+'s `match-case` makes this much cleaner.

```python
def handle_response(response):
    match response:
        case {'status': 200, 'data': data}:
            return process_data(data)
        case {'status': 404}:
            return None
        case {'status': 401 | 403}:
            raise AuthError()
        case {'status': status} if status >= 500:
            raise ServerError()
        case _:
            raise UnknownError(response['status'])
```

The key feature is automatic destructuring. `'data': data` extracts and binds the value in one step.

It works with class instances too:

```python
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float

def describe(point):
    match point:
        case Point(x=0, y=0):
            return "origin"
        case Point(x=0, y=y):
            return f"on Y-axis ({y})"
        case Point(x=x, y=0):
            return f"on X-axis ({x})"
        case Point(x=x, y=y) if x == y:
            return f"on diagonal ({x})"
        case _:
            return f"general ({point.x}, {point.y})"
```

## Key Points

- `match-case` is **structural pattern matching**, not just value comparison
- Use `|` to combine multiple patterns into one case
- Guard clauses with `if` allow additional filtering
- `_` is the wildcard pattern, matching anything (works like `else`)
- Requires Python 3.10+
