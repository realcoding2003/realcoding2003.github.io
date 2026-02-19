---
layout: post
title: "jQuery 개발자가 Vue.js를 시작하다"
date: 2021-09-20 09:00:00 +0900
categories: [Development, Frontend]
tags: [Vue.js, JavaScript, jQuery, 프론트엔드, 입문]
author: "Kevin Park"
lang: ko
excerpt: "10년 넘게 jQuery로 버텨온 개발자가 Vue.js 공부를 시작했다. 반응형 데이터 바인딩이란 게 이렇게 편한 거였다니."
---

# jQuery 개발자가 Vue.js를 시작하다

## 왜 이제서야

Vue.js를 공부하기 시작했다.

사실 프론트엔드 프레임워크 공부는 진작에 했어야 했다. React, Vue, Angular... 다들 몇 년 전부터 쓰고 있는데, 나는 아직도 jQuery로 버티고 있었다.

jQuery가 나쁜 건 아니다. 10년 넘게 써왔고, 못 하는 게 없다. 근데 최근 프로젝트들을 보면 점점 jQuery를 쓰는 곳이 줄어들고 있다. 클라이언트도 "Vue로 해주세요" 같은 요구사항이 늘었다.

[나태해지는 개발자](/2020/03/16/developer-laziness-burnout/) 글에서 "의도적으로 새로운 기술을 프로젝트에 섞자"고 했는데, 이번이 그 실천인 셈이다.

## React vs Vue 선택

셋 중에 고민하다가 Vue를 선택한 이유가 있다.

일단 러닝 커브가 상대적으로 낮다고 해서. jQuery에서 넘어오는 사람한테는 Vue가 적응하기 쉽다는 이야기가 많았다. HTML 템플릿 기반이라 기존 마크업 구조와 비슷하니까.

React는 JSX가 좀 낯설었다. HTML 안에 JavaScript를 쓰는 건 익숙한데, JavaScript 안에 HTML을 쓰는 건 처음에 어색했다.

Angular는 너무 거대해 보였다. TypeScript 필수인 것도 부담이었고.

## 첫 인상

Vue를 처음 만져봤을 때 솔직한 감상.

**반응형 데이터 바인딩이 신세계다.**

jQuery에서 DOM을 직접 조작하던 것에 비하면 정말 편하다. 데이터를 바꾸면 화면이 알아서 바뀐다. jQuery로 이걸 하려면 `$('.target').text(newValue)` 이런 코드를 일일이 써야 했는데.

```javascript
// jQuery 방식
$('#counter').text(count);
$('#status').text(count > 10 ? '초과' : '정상');
$('.counter-display').toggleClass('warning', count > 10);

// Vue 방식
data() {
  return { count: 0 }
},
computed: {
  status() { return this.count > 10 ? '초과' : '정상' }
}
```

컴포넌트 시스템도 좋다. 재사용 가능한 UI 조각을 만들 수 있다는 개념은 알고 있었지만, 실제로 써보니까 프로젝트 구조가 깔끔해지는 게 느껴진다.

## 어려운 점

물론 쉬운 것만 있진 않다.

상태 관리(Vuex)가 처음엔 이해가 잘 안 됐다. 왜 이렇게 복잡하게 해야 하지? 그냥 전역 변수 쓰면 안 되나? 라는 생각이 먼저 들었다. 근데 프로젝트 규모가 커지면 왜 필요한지 이해가 된다고 하니까 일단 배우는 중이다.

빌드 도구도 낯설다. jQuery는 스크립트 태그 하나면 끝이었는데, Vue는 webpack이니 Vite니 빌드 설정이 필요하다. npm, node_modules, package.json... 프론트엔드 생태계가 이렇게 복잡해졌다니.

## 앞으로

일단 간단한 프로젝트에 Vue를 적용해보려고 한다. 기존에 jQuery로 만들었던 관리자 페이지를 Vue로 다시 만들어보는 게 좋은 연습이 될 것 같다.

늦었다고 생각하는 시점이 가장 빠른 시점이라는 말이 있는데... 솔직히 좀 늦긴 했다. 근데 AWS도 늦게 시작했지만 결국 잘 쓰고 있으니까, Vue도 그렇게 되지 않을까.

새로운 기술을 배우기 시작하면 다시 초보가 된 느낌이 들어서 묘하게 재밌다. 모르는 게 있어야 검색하게 되고, 검색하다 보면 코드를 치게 되고. 이게 [나태함을 이기는 방법](/2020/03/16/developer-laziness-burnout/)이라고 했었는데, 진짜 그런 것 같다.
