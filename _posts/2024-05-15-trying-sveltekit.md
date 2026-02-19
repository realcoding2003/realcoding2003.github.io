---
layout: post
title: "SvelteKit 한번 해보려고 합니다 - 프레임워크 또 갈아탈 건가"
date: 2024-05-15 09:00:00 +0900
categories: [Development, Frontend]
tags: [SvelteKit, Svelte, 프론트엔드, JavaScript, 프레임워크]
author: "Kevin Park"
lang: ko
excerpt: "Vue.js 배운 지 얼마 안 됐는데 또 새 프레임워크가 눈에 들어온다. SvelteKit이 가상 DOM 없이 빠르다는데, 한번 해보기로 했다."
---

# SvelteKit, 한번 해보기로 했다

## 또 새 프레임워크?

[Vue.js를 배우기 시작한 게](/2021/09/20/starting-vuejs/) 엊그제 같은데, 또 새 프레임워크에 눈이 갔다.

이번엔 SvelteKit이다.

솔직히 프론트엔드 생태계의 프레임워크 전쟁은 좀 피곤하다. React가 나오고, Vue가 나오고, Angular가 있고, 이제 Svelte까지. 몇 년마다 "이게 최고다"라는 게 바뀌니까 다 배우다간 끝이 없다.

근데 Svelte는 좀 달라 보였다.

## Svelte가 다른 점

React나 Vue는 가상 DOM을 쓴다. 상태가 바뀌면 가상 DOM을 새로 만들고, 이전 가상 DOM이랑 비교해서 실제로 변경된 부분만 업데이트하는 방식. 이게 효율적이라고 알려져 있었는데, Svelte는 아예 다른 접근을 한다.

**컴파일 타임에 다 처리한다.**

Svelte는 빌드할 때 컴포넌트를 최적화된 vanilla JavaScript로 변환한다. 런타임에 가상 DOM 비교 같은 걸 안 한다. 그래서 번들 크기가 작고 실행 속도가 빠르다.

처음 이 개념을 들었을 때 "아 그게 되는구나" 싶었다. 단순하면서도 합리적인 접근이다.

## SvelteKit = Svelte + 풀스택

SvelteKit은 Svelte 기반의 풀스택 프레임워크다. Next.js가 React의 프레임워크인 것처럼.

SSR(서버 사이드 렌더링), 라우팅, API 엔드포인트 등을 기본으로 제공한다. 파일 기반 라우팅이라 디렉토리 구조만 봐도 URL이 어떻게 되는지 알 수 있다.

```
src/routes/
├── +page.svelte          → /
├── about/+page.svelte    → /about
└── blog/[slug]/+page.svelte → /blog/:slug
```

이건 직관적이라서 좋다.

## 코드가 깔끔하다

Svelte 코드를 처음 봤을 때 놀란 건 코드 양이 적다는 거다.

React에서 상태 관리하려면 useState, useEffect 같은 훅을 써야 하고, Vue에서도 ref, reactive, computed 같은 API를 써야 한다. Svelte는?

```svelte
<script>
  let count = 0;
  $: doubled = count * 2;
</script>

<button on:click={() => count++}>
  {count} (doubled: {doubled})
</button>
```

그냥 변수 선언하면 끝이다. `$:` 하나로 반응형 선언이 된다. 보일러플레이트가 거의 없다.

## 배울 가치가 있을까

솔직히 고민이 되긴 한다.

Vue도 아직 깊이 있게 쓰고 있진 못한 상태에서 또 새로운 걸 배우면, 이것저것 찔러만 보고 하나도 제대로 못 하는 상황이 될 수 있다. "Jack of all trades, master of none" 상태.

근데 [나태함을 이기는 방법](/2020/03/16/developer-laziness-burnout/)에서 썼듯이, 새로운 기술을 배우면 다시 동기부여가 된다. 코딩이 재밌어지려면 모르는 게 있어야 한다.

일단 간단한 사이드 프로젝트 하나를 SvelteKit으로 만들어볼 생각이다. 본업 프로젝트에 바로 도입하기엔 리스크가 있으니까, 사이드 프로젝트에서 먼저 검증하고.

또 새 프레임워크에 빠지게 될지, 아니면 "역시 Vue가 편하다"가 될지는 해봐야 안다.
