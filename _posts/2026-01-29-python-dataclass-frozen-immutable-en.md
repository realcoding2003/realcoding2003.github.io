---
layout: post
title: "Create Immutable Data Objects with Python dataclass(frozen=True)"
date: 2026-01-29 09:00:00 +0900
categories: [Development, Tips]
tags: [Python, dataclass, Type-Safety, Backend]
author: "Kevin Park"
lang: en
excerpt: "Use Python's frozen dataclass to create immutable objects with built-in validation and hashability."
---

## Problem

You create objects to hold configuration or API response data, but accidental mutations somewhere in the code lead to painful debugging sessions. Dictionaries lack type hints, and making regular classes immutable requires boilerplate.

## Solution

`dataclass(frozen=True)` solves this in one line.

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class DatabaseConfig:
    host: str
    port: int
    name: str
    max_connections: int = 10

config = DatabaseConfig(host="localhost", port=5432, name="myapp")

config.port = 3306  # FrozenInstanceError!
```

Add creation-time validation with `__post_init__`:

```python
@dataclass(frozen=True)
class PriceRange:
    min_price: float
    max_price: float

    def __post_init__(self):
        if self.min_price < 0:
            raise ValueError("min_price must be >= 0")
        if self.min_price > self.max_price:
            raise ValueError("min_price cannot exceed max_price")
```

Frozen dataclasses are hashable, so they work as dictionary keys or set members:

```python
@dataclass(frozen=True)
class Coordinate:
    x: float
    y: float

visited = set()
visited.add(Coordinate(1.0, 2.0))  # Works as a set member
```

## Key Points

- `@dataclass(frozen=True)` creates immutable objects with minimal boilerplate
- Any mutation attempt raises `FrozenInstanceError`
- Use `__post_init__` for creation-time validation
- Frozen dataclasses are hashable — usable as dict keys and set members
