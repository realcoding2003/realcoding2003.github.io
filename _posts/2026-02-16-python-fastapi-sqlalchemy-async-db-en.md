---
layout: post
title: "Python FastAPI + SQLAlchemy Async Database Connection Pattern"
date: 2026-02-16 09:00:00 +0900
categories: [Development, Tips]
tags: [Python, FastAPI, SQLAlchemy, Async, Database, Backend]
author: "Kevin Park"
lang: en
excerpt: "Set up async SQLAlchemy sessions in FastAPI with dependency injection for non-blocking database access."
---

## Problem

Using SQLAlchemy synchronously in FastAPI blocks the event loop during database queries. As concurrent requests increase, response times tank.

## Solution

Set up async connections with `sqlalchemy[asyncio]` and `asyncpg`.

```bash
pip install sqlalchemy[asyncio] asyncpg
```

```python
# database.py
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

DATABASE_URL = "postgresql+asyncpg://user:pass@localhost:5432/mydb"

engine = create_async_engine(DATABASE_URL, pool_size=20, max_overflow=10)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db():
    async with async_session() as session:
        yield session
```

```python
# main.py
from fastapi import FastAPI, Depends
from sqlalchemy import select
from database import get_db

app = FastAPI()

@app.get("/users/{user_id}")
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404)
    return user
```

## Key Points

- `asyncpg` is PostgreSQL-only. Use `aiomysql` for MySQL or `aiosqlite` for SQLite.
- Without `expire_on_commit=False`, accessing object attributes after commit triggers lazy loading, which raises errors in async contexts.
- Tune `pool_size` and `max_overflow` based on your concurrency needs. Make sure not to exceed the database's connection limit.
- Making `get_db` a generator lets FastAPI's dependency injection handle session creation and cleanup automatically. No manual `try/finally` needed.
