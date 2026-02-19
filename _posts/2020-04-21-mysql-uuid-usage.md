---
layout: post
title: "MySQL uuid() 활용기 - Auto Increment PK를 URL에 노출하지 마라"
date: 2020-04-21 09:00:00 +0900
categories: [Development, Database]
tags: [MySQL, UUID, 보안, 데이터베이스, PHP]
author: "Kevin Park"
lang: ko
excerpt: "auto_increment PK를 URL에 그대로 쓰면 보안 리포트에서 매번 지적당한다. 그렇다고 PK를 전부 UUID로 바꾸기엔 비효율적이고. 현실적인 타협안을 정리했다."
---

# Auto Increment PK, URL에 노출하면 안 되는 이유

## 흔한 패턴

대부분의 웹 서비스에서 이런 URL을 본 적 있을 거다.

```
/users/1
/boards/152
/orders/30421
```

DB 테이블의 auto_increment 값을 그대로 URL에 쓰는 패턴. 개발할 때 이게 제일 편하다. PK 값 하나로 조회하면 끝이니까.

근데 보안 리포트를 받아보면 이 부분이 거의 매번 지적된다.

## 뭐가 문제인가

순차적인 숫자가 URL에 노출되면 생기는 문제들이 있다.

- `mb_no=1`이면 "아 이 사이트 첫 번째 가입자구나" 라는 정보가 노출된다
- `order_id=30421`이면 "이 사이트 주문 건수가 3만 건 정도 되는구나" 라는 것도 알 수 있다
- URL의 숫자만 바꿔가면서 다른 사람의 데이터에 접근 시도가 가능하다 (IDOR 취약점)

물론 서버 쪽에서 권한 체크를 제대로 하면 데이터가 실제로 유출되진 않는다. 근데 보안 감사에서는 이런 것도 지적 대상이다. "불필요한 정보 노출"이라고.

## 그래서 UUID를 쓰자... 근데

MySQL에는 `uuid()` 함수가 있다. 이걸로 생성하면 `550e8400-e29b-41d4-a716-446655440000` 같은 값이 나온다.

```sql
SELECT uuid();
-- 550e8400-e29b-41d4-a716-446655440000
```

그러면 PK를 전부 UUID로 바꾸면 되지 않나? 라고 생각할 수 있는데, 현실은 그렇게 간단하지 않다.

UUID를 PK로 쓰면 생기는 문제들:

- **인덱스 성능 저하**: 36바이트 문자열 vs 4바이트 정수. 비교 연산 자체가 느리다
- **클러스터드 인덱스 문제**: InnoDB에서 PK는 클러스터드 인덱스인데, UUID는 랜덤이라 INSERT마다 페이지 분할이 발생한다
- **저장 공간**: 조인이 많은 테이블일수록 FK까지 전부 UUID가 되니까 공간 낭비가 심하다
- **디버깅 불편**: `WHERE id = 1` vs `WHERE id = '550e8400-e29b-41d4-a716-446655440000'`... 말이 필요한가

PK를 전부 UUID로 바꾸는 건 비효율적인 부분이 너무 많다.

## 현실적인 타협안

그래서 내가 쓰는 방식은 이렇다.

**PK는 auto_increment 그대로 두고, URL에 노출되는 부분만 별도 UUID 컬럼을 추가하는 것.**

```sql
CREATE TABLE members (
    mb_no INT AUTO_INCREMENT PRIMARY KEY,
    mb_uuid CHAR(36) DEFAULT (uuid()),
    mb_name VARCHAR(50),
    -- ...
    INDEX idx_uuid (mb_uuid)
);
```

내부적으로 조인이나 조회할 때는 `mb_no`를 쓰고, 외부에 노출되는 URL에서만 `mb_uuid`를 쓴다.

```
-- 내부 쿼리
SELECT * FROM members WHERE mb_no = 1;

-- URL에서 접근 시
SELECT * FROM members WHERE mb_uuid = '550e8400-...';
```

이러면 성능도 잡고 보안도 잡을 수 있다.

## 꼭 MySQL uuid()가 아니어도 된다

UUID 생성을 꼭 MySQL에서 할 필요는 없다. 애플리케이션 레벨에서 생성해도 된다.

PHP라면 `uniqid()` 함수가 있고:

```php
$unique_id = uniqid('', true);
// 예: 5e6f7a8b9c0d1.12345678
```

더 안전하게 하려면 `random_bytes()`로 생성할 수도 있다:

```php
$uuid = bin2hex(random_bytes(16));
```

요즘은 대부분의 언어에서 UUID 라이브러리를 제공하니까 상황에 맞게 쓰면 된다.

## 정리

결론은 간단하다.

- auto_increment PK는 내부에서만 쓴다
- URL에 노출되는 식별자는 별도 UUID 컬럼으로 분리한다
- PK 전체를 UUID로 바꾸는 건 비효율적이니까 하지 마라

보안 리포트에서 매번 지적당하는 것도 스트레스인데, 이렇게 하면 깔끔하게 해결된다. 처음부터 이렇게 설계하면 좋은데... 이미 돌아가는 서비스에 적용하려면 또 마이그레이션 이슈가 있다.

결국 "나중에 해야지" 목록에 또 하나 추가되는 거다.
