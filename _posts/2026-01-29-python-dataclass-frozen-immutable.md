---
layout: post
title: "Python dataclass(frozen=True)로 불변 데이터 객체 만들기"
date: 2026-01-29 09:00:00 +0900
categories: [Development, Tips]
tags: [Python, dataclass, 타입안전, 백엔드]
author: "Kevin Park"
lang: ko
excerpt: "Python dataclass에 frozen=True를 쓰면 불변 객체를 간단하게 만들 수 있다. 설정값이나 상수 객체에 딱이다."
---

## 문제

설정값이나 API 응답 데이터를 담는 객체를 만들었는데, 코드 어딘가에서 실수로 값이 변경되면 디버깅이 지옥이 된다. 딕셔너리로 넘기면 타입 힌트도 안 되고, 일반 클래스로 만들면 `__setattr__` 오버라이드하고 난리를 쳐야 한다.

## 해결

`dataclass(frozen=True)`를 쓰면 한 줄로 해결된다.

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class DatabaseConfig:
    host: str
    port: int
    name: str
    max_connections: int = 10

config = DatabaseConfig(
    host="localhost",
    port=5432,
    name="myapp"
)

# 값 변경 시도하면 에러 발생
config.port = 3306  # FrozenInstanceError!
```

`__post_init__`으로 생성 시점 검증도 가능하다.

```python
@dataclass(frozen=True)
class PriceRange:
    min_price: float
    max_price: float

    def __post_init__(self):
        if self.min_price < 0:
            # frozen이라 object.__setattr__ 사용
            raise ValueError("min_price는 0 이상이어야 한다")
        if self.min_price > self.max_price:
            raise ValueError("min_price가 max_price보다 클 수 없다")
```

frozen dataclass는 해시 가능해서 딕셔너리 키나 set 원소로도 쓸 수 있다.

```python
@dataclass(frozen=True)
class Coordinate:
    x: float
    y: float

visited = set()
visited.add(Coordinate(1.0, 2.0))  # set에 넣을 수 있다
```

## 핵심 포인트

- `@dataclass(frozen=True)`로 불변 객체를 간단하게 생성
- 속성 변경 시도 시 `FrozenInstanceError` 발생
- `__post_init__`으로 생성 시점 검증 가능
- frozen dataclass는 hashable이라 dict 키나 set 원소로 사용 가능
