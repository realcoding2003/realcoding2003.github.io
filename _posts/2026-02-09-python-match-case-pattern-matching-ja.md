---
layout: post
title: "Python match-caseでif-elifチェーンをスッキリ書き換える"
date: 2026-02-09 09:00:00 +0900
categories: [Development, Tips]
tags: [Python, Pattern Matching, match-case, Python3]
author: "Kevin Park"
lang: ja
slug: python-match-case-pattern-matching
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /ja/2026/02/09/python-match-case-pattern-matching-ja/
  - /2026/02/09/python-match-case-pattern-matching-ja/
excerpt: "Python 3.10の構造的パターンマッチングで、複雑な条件分岐をクリーンに書く方法を紹介します。"
---

## 問題

APIレスポンスを処理する際、このようなコードになりがちです。

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

条件がさらに増えると、可読性が大幅に低下します。

## 解決方法

Python 3.10+の`match-case`を使うと、はるかにクリーンに書けます。

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

自動的に構造分解が行われるのがポイントです。`'data': data`の部分で値を取り出し、そのまま変数にバインドします。

クラスオブジェクトにも使えます。

```python
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float

def describe(point):
    match point:
        case Point(x=0, y=0):
            return "原点"
        case Point(x=0, y=y):
            return f"Y軸上 ({y})"
        case Point(x=x, y=0):
            return f"X軸上 ({x})"
        case Point(x=x, y=y) if x == y:
            return f"対角線上 ({x})"
        case _:
            return f"一般座標 ({point.x}, {point.y})"
```

## ポイント

- `match-case`は単なる値の比較ではなく、**構造的パターンマッチング**です
- `|`演算子で複数のパターンを一つにまとめることができます
- `if`ガード条件で追加のフィルタリングが可能です
- `_`はワイルドカードで、任意の値にマッチします（elseの役割）
- Python 3.10以上が必須です
