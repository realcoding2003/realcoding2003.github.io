---
layout: post
title: "MySQL uuid() in Practice - Stop Exposing Auto Increment PKs in URLs"
date: 2020-04-21 09:00:00 +0900
categories: [Development, Database]
tags: [MySQL, UUID, Security, Database, PHP]
author: "Kevin Park"
lang: en
excerpt: "Using auto_increment PKs directly in URLs gets flagged in every security audit. But replacing all PKs with UUIDs is wildly impractical. Here's the realistic middle ground."
---

# Why You Shouldn't Expose Auto Increment PKs in URLs

## The Common Pattern

You've probably seen URLs like this in most web applications:

```
/users/1
/boards/152
/orders/30421
```

It's the classic pattern of using the database table's auto_increment value directly in the URL. And honestly, it's the easiest approach — just query by PK and you're done.

But every time a security audit comes around, this gets flagged without fail.

## What's the Problem?

Sequential numbers in URLs leak information:

- `mb_no=1` tells someone "this is the first registered user on this site"
- `order_id=30421` reveals "this site has processed about 30,000 orders"
- Attackers can iterate through numbers to probe for other users' data (IDOR vulnerability)

Sure, proper server-side authorization checks prevent actual data leaks. But security auditors still flag it as "unnecessary information exposure."

## So Let's Use UUIDs... Right?

MySQL has a built-in `uuid()` function that generates values like `550e8400-e29b-41d4-a716-446655440000`:

```sql
SELECT uuid();
-- 550e8400-e29b-41d4-a716-446655440000
```

So why not replace all PKs with UUIDs? Because reality isn't that simple.

Problems with UUID as primary key:

- **Index performance**: 36-byte string vs 4-byte integer. Comparison operations are inherently slower
- **Clustered index issues**: InnoDB's PK is a clustered index, and random UUIDs cause page splits on every INSERT
- **Storage overhead**: Foreign keys in related tables all become UUIDs too, wasting significant space
- **Debugging pain**: `WHERE id = 1` vs `WHERE id = '550e8400-e29b-41d4-a716-446655440000'` — need I say more?

Replacing all PKs with UUIDs is simply too inefficient.

## The Practical Compromise

Here's the approach I use:

**Keep auto_increment as the PK, but add a separate UUID column for URL-facing identifiers.**

```sql
CREATE TABLE members (
    mb_no INT AUTO_INCREMENT PRIMARY KEY,
    mb_uuid CHAR(36) DEFAULT (uuid()),
    mb_name VARCHAR(50),
    -- ...
    INDEX idx_uuid (mb_uuid)
);
```

Internally, use `mb_no` for joins and lookups. For external-facing URLs, use `mb_uuid`.

```
-- Internal query
SELECT * FROM members WHERE mb_no = 1;

-- URL-based access
SELECT * FROM members WHERE mb_uuid = '550e8400-...';
```

Best of both worlds: performance and security.

## It Doesn't Have to Be MySQL's uuid()

You don't need to generate UUIDs at the database level. Application-level generation works just as well.

In PHP, there's `uniqid()`:

```php
$unique_id = uniqid('', true);
// e.g.: 5e6f7a8b9c0d1.12345678
```

For stronger randomness, use `random_bytes()`:

```php
$uuid = bin2hex(random_bytes(16));
```

Most languages have UUID libraries these days. Pick whatever fits your stack.

## Takeaway

The conclusion is straightforward:

- Keep auto_increment PKs for internal use only
- Use a separate UUID column for any identifier exposed in URLs
- Don't replace all PKs with UUIDs — the overhead isn't worth it

This approach cleanly resolves those recurring security audit findings. Ideally you'd design this way from the start... but retrofitting it onto a running service means yet another migration headache.

And so it goes onto the "I'll do it later" list.
