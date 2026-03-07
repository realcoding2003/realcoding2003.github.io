---
layout: post
title: "Python FastAPI + SQLAlchemy非同期DB接続パターン"
date: 2026-02-16 09:00:00 +0900
categories: [Development, Tips]
tags: [Python, FastAPI, SQLAlchemy, Async, Database, Backend]
author: "Kevin Park"
lang: ja
excerpt: "FastAPIでSQLAlchemyの非同期セッションを設定し、依存性注入で使用するパターンをご紹介します。"
---

## 問題

FastAPIでSQLAlchemyを同期方式で使うと、DBクエリの間イベントループがブロックされます。同時リクエストが増えるとレスポンス速度が大幅に低下します。

## 解決方法

`sqlalchemy[asyncio]`と`asyncpg`で非同期接続を設定します。

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

## ポイント

- `asyncpg`はPostgreSQL専用です。MySQLなら`aiomysql`、SQLiteなら`aiosqlite`を使ってください。
- `expire_on_commit=False`を設定しないと、コミット後にオブジェクトの属性にアクセスした際にlazy loadingが発生し、非同期ではエラーの原因になります。
- `pool_size`と`max_overflow`は同時接続数に合わせて調整してください。DBのコネクション数の上限を超えないように注意が必要です。
- `get_db`をジェネレーターにすると、FastAPIの依存性注入が自動的にセッションの作成とクリーンアップを行います。手動で`try/finally`を書く必要はありません。
