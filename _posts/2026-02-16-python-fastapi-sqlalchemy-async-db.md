---
layout: post
title: "Python FastAPI + SQLAlchemy 비동기 DB 연결 패턴"
date: 2026-02-16 09:00:00 +0900
categories: [Development, Tips]
tags: [Python, FastAPI, SQLAlchemy, Async, Database, Backend]
author: "Kevin Park"
lang: ko
excerpt: "FastAPI에서 SQLAlchemy 비동기 세션을 설정하고 의존성 주입으로 사용하는 패턴."
---

## 문제

FastAPI에서 SQLAlchemy를 동기 방식으로 쓰면 DB 쿼리 동안 이벤트 루프가 블로킹된다. 동시 요청이 많아지면 응답 속도가 뚝 떨어진다.

## 해결

`sqlalchemy[asyncio]`와 `asyncpg`로 비동기 연결을 설정한다.

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

## 핵심 포인트

- `asyncpg`는 PostgreSQL 전용이다. MySQL이면 `aiomysql`, SQLite면 `aiosqlite`를 쓰면 된다.
- `expire_on_commit=False`를 안 넣으면 커밋 후 객체 속성에 접근할 때 lazy loading이 발생하는데, 비동기에서는 이게 에러를 일으킨다.
- `pool_size`와 `max_overflow`는 동시 접속 수에 맞게 조절해야 한다. DB 커넥션 수 제한을 초과하지 않도록 주의.
- `get_db`를 제너레이터로 만들면 FastAPI의 의존성 주입이 알아서 세션 생성/정리를 해준다. `try/finally`를 직접 쓸 필요가 없다.
