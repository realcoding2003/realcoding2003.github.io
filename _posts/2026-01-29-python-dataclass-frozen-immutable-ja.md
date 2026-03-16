---
layout: post
title: "Python dataclass(frozen=True)で不変データオブジェクトを作成する"
date: 2026-01-29 09:00:00 +0900
categories: [Development, Tips]
tags: [Python, dataclass, 型安全, バックエンド]
author: "Kevin Park"
lang: ja
slug: python-dataclass-frozen-immutable
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /ja/2026/01/29/python-dataclass-frozen-immutable-ja/
  - /2026/01/29/python-dataclass-frozen-immutable-ja/
excerpt: "Pythonのfrozen dataclassを使って、不変オブジェクトを簡単に作成する方法を解説します。"
---

## 問題

設定値やAPIレスポンスデータを保持するオブジェクトを作成したものの、コードのどこかで誤って値が変更されると、デバッグが非常に困難になります。辞書型ではタイプヒントが効かず、通常のクラスで不変にするにはボイラープレートが必要です。

## 解決方法

`dataclass(frozen=True)`を使えば、1行で解決できます。

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

`__post_init__`で生成時のバリデーションも可能です。

```python
@dataclass(frozen=True)
class PriceRange:
    min_price: float
    max_price: float

    def __post_init__(self):
        if self.min_price < 0:
            raise ValueError("min_priceは0以上である必要があります")
        if self.min_price > self.max_price:
            raise ValueError("min_priceがmax_priceを超えることはできません")
```

frozen dataclassはハッシュ可能なので、辞書のキーやsetの要素としても使えます。

```python
@dataclass(frozen=True)
class Coordinate:
    x: float
    y: float

visited = set()
visited.add(Coordinate(1.0, 2.0))  # setに追加可能
```

## ポイント

- `@dataclass(frozen=True)`で最小限のコードで不変オブジェクトを作成できます
- 属性の変更を試みると`FrozenInstanceError`が発生します
- `__post_init__`で生成時のバリデーションが可能です
- frozen dataclassはハッシュ可能なので、dictのキーやsetの要素として使用できます
