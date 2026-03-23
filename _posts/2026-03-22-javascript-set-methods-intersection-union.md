---
layout: post
title: "JavaScript Set 새 메서드 총정리 - intersection, union, difference 실전 활용"
date: 2026-03-22 09:00:00 +0900
categories: [Development, Tips]
tags: [JavaScript, Set, intersection, union, difference, ES2025]
author: "Kevin Park"
lang: ko
excerpt: "JavaScript Set에 드디어 intersection, union, difference 메서드가 추가됐다. 배열 중복 제거를 넘어서 집합 연산을 네이티브로 처리하는 방법 정리."
---

## 문제

배열 두 개에서 공통 요소를 뽑거나, 합치거나, 차이를 구해야 하는 상황.
매번 `filter` + `includes` 조합으로 처리했는데 코드가 지저분하고 성능도 별로였다.

```javascript
// 예전 방식 - 읽기도 귀찮다
const common = arr1.filter(x => arr2.includes(x));
const merged = [...new Set([...arr1, ...arr2])];
const diff = arr1.filter(x => !arr2.includes(x));
```

`includes`가 매번 O(n) 탐색을 하니까 전체적으로 O(n²)인 거다.
데이터가 좀만 커져도 느려진다.

## 해결

Set에 새로 추가된 집합 연산 메서드를 쓰면 된다.
2024년에 모든 주요 브라우저에서 지원이 완료됐고, Node.js 22부터 사용 가능하다.

```javascript
const frontend = new Set(['React', 'Vue', 'Svelte', 'Angular']);
const liked = new Set(['React', 'Svelte', 'Rust', 'Go']);

// 교집합 - 둘 다 포함된 것
frontend.intersection(liked);
// Set {'React', 'Svelte'}

// 합집합 - 전부 합치기
frontend.union(liked);
// Set {'React', 'Vue', 'Svelte', 'Angular', 'Rust', 'Go'}

// 차집합 - frontend에만 있는 것
frontend.difference(liked);
// Set {'Vue', 'Angular'}

// 대칭차집합 - 한쪽에만 있는 것
frontend.symmetricDifference(liked);
// Set {'Vue', 'Angular', 'Rust', 'Go'}
```

비교 메서드도 있다.

```javascript
const all = new Set([1, 2, 3, 4, 5]);
const sub = new Set([2, 3]);
const other = new Set([6, 7]);

// 부분집합 확인
sub.isSubsetOf(all);       // true

// 상위집합 확인
all.isSupersetOf(sub);     // true

// 서로소 확인 (공통 요소 없음)
all.isDisjointFrom(other); // true
```

## 실전에서 쓸만한 패턴

권한 체크 같은 데서 바로 써먹을 수 있다.

```javascript
function hasRequiredPermissions(userPerms, requiredPerms) {
  const user = new Set(userPerms);
  const required = new Set(requiredPerms);
  return required.isSubsetOf(user);
}

const myPerms = ['read', 'write', 'delete'];
const needed = ['read', 'write'];

hasRequiredPermissions(myPerms, needed); // true
```

태그 필터링도 깔끔해진다.

```javascript
const selectedTags = new Set(['JavaScript', 'TypeScript']);
const postTags = new Set(['JavaScript', 'React', 'Node.js']);

// 선택한 태그 중 하나라도 포함되어 있는지
selectedTags.intersection(postTags).size > 0; // true
```

## 핵심 포인트

- `intersection`, `union`, `difference`, `symmetricDifference` 4개가 핵심이다
- 원본 Set을 변경하지 않고 새 Set을 반환한다 (immutable)
- `filter` + `includes` 조합보다 성능이 훨씬 좋다 - 내부적으로 해시 기반 O(n) 처리
- Node.js 22+, Chrome 122+, Safari 17+, Firefox 127+에서 지원
- `isSubsetOf`, `isSupersetOf`, `isDisjointFrom`으로 집합 관계도 확인 가능
