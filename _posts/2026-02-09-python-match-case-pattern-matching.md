---
layout: post
title: "Python match-case로 if-elif 지옥 탈출하기"
date: 2026-02-09 09:00:00 +0900
categories: [Development, Tips]
tags: [Python, Pattern Matching, match-case, Python3]
author: "Kevin Park"
lang: ko
excerpt: "Python 3.10의 match-case 구문으로 복잡한 조건 분기를 깔끔하게 처리하는 방법."
---

## 문제

API 응답 처리하다 보면 이런 코드가 나온다.

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

조건이 몇 개 더 붙으면 읽기 싫어진다.

## 해결

Python 3.10+의 `match-case`를 쓰면 훨씬 깔끔해진다.

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

구조 분해가 자동으로 되는 게 핵심이다. `'data': data` 부분에서 값을 바로 꺼내서 변수에 바인딩한다.

클래스 객체에도 쓸 수 있다.

```python
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float

def describe(point):
    match point:
        case Point(x=0, y=0):
            return "원점"
        case Point(x=0, y=y):
            return f"Y축 위 ({y})"
        case Point(x=x, y=0):
            return f"X축 위 ({x})"
        case Point(x=x, y=y) if x == y:
            return f"대각선 위 ({x})"
        case _:
            return f"일반 좌표 ({point.x}, {point.y})"
```

## 핵심 포인트

- `match-case`는 단순 값 비교가 아니라 **구조 패턴 매칭**이다
- `|` 연산자로 여러 패턴을 하나로 합칠 수 있다
- `if` 가드 조건으로 추가 필터링이 가능하다
- `_`는 와일드카드로, 어떤 값이든 매칭된다 (else 역할)
- Python 3.10+ 필수. 그 이하 버전에서는 못 쓴다
