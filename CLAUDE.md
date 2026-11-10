# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

실전코딩 개인 포털 realcoding.blog — **Astro 7 정적 사이트**(2026-11 Jekyll에서 이전). 한국어(기본)·영어·일본어. 기술 글뿐 아니라 메이커(3D 프린팅)·개발·게임 공략·생활 4개 영역, 작업 쇼케이스, 영상 모음, 의뢰 화면을 둔다. 디자인 정본은 `_design/design-brief.md`와 `_design/refs/*.jpg`(보드 9장).

## 개발 명령어

```bash
npm install          # 의존성 설치(Node 24 이상)
npm run dev          # 로컬 미리보기 http://localhost:4321 (predev가 assets/ 등을 public/으로 복사)
npm run build        # 정적 빌드 → dist/ (본문 이미지 WebP 변형 생성, 캐시 node_modules/.cache/rc-images)
npm test             # 주소·렌더링·포털·움직임 단위 테스트
npx astro check      # 타입 검사
```

배포: master에 push → GitHub Actions(`.github/workflows/pages.yml`)가 빌드해 GitHub Pages로 게시. push = 즉시 게시.

## 구조

- 글 원본: `_posts/`(파일명 `YYYY-MM-DD-slug.md`, `-en.md`, `-ja.md` 그대로). `src/content.config.ts`의 glob 로더가 읽는다.
- 주소 규칙(`src/lib/`): Jekyll과 같은 `/:year/:month/:day/:title/`, 날짜는 front matter `date`의 **UTC 날짜**. 영어·일본어는 `/en/…`·`/ja/…`(slug·permalink가 없어도 자동). `redirect_from`은 이동 페이지로 생성. 경로가 겹치면 빌드 실패.
- 영역: front matter `section`(maker·dev·game·life) 또는 categories로 자동 판정(`src/lib/sections.ts`). 게임 글이 0편이면 메뉴에서 숨는다.
- 작업 쇼케이스 데이터: `src/data/works/*.yaml`(작업 1건 = 파일 1개). 글 하단 "관련 작업"·홈 bento·`/maker/`·`/videos/`가 읽는다.
- 화면: `src/layouts/`(Document·Post·Portal·Listing), `src/components/`(공통 머리·바닥, `portal/` 포털 화면), 스타일 `src/styles/`(tokens·global·reader·portal), 클라이언트 스크립트 `src/scripts/`.
- 정적 파일: `assets/`(이미지·파비콘·영상 `assets/video/portal/`), `CNAME`·`ads.txt`·`robots.txt` — `scripts/sync-public.mjs`가 빌드 전에 `public/`으로 복사(`public/`은 생성물, 커밋 안 함).
- 본문 Liquid(`{{ site.url }}`, `{% raw %}`)는 liquidjs로 Jekyll과 같게 처리된다.
- 글 페이지: 밝은/어두운 테마, 목차, 코드 복사, 이미지 확대, mermaid(코드 블록이 보일 때만 로드), 댓글(Utterances, 화면 근처에서 로드), GA4. 포털 화면(홈 등)은 어두운 테마 고정, 홈만 스크롤 영화·Lenis.
- 검증 도구 `tools/parity/`: 운영 사이트와 주소·hreflang·본문 지표 전수 비교(`baseline.py`·`compare.py`), dist 점검, JS 예산, 브라우저 점검(Playwright, 실제 Chrome).

### Front Matter 구조
```yaml
---
layout: post
title: "제목"
date: 2026-11-10 10:00:00 +0900
categories: [Development, AI]
section: dev                           # 선택: maker | dev | game | life
tags: [태그1, 태그2]
author: "Kevin Park"
lang: ko                              # ko | en | ja
excerpt: "요약 텍스트"
image: "/assets/images/posts/폴더/hero.png"  # 선택, 공유 미리보기(OG) 전용
---
```

### 외부 서비스
- **댓글**: Utterances (repo `realcoding2003/realcoding2003.github.io`, issue-term `pathname` — 주소가 바뀌면 댓글이 끊기므로 주소 보존 필수)
- **분석**: Google Analytics GA4 (`G-MEFBMHM6FK`, 운영 호스트에서만)
- **광고**: 현재 AdSense 스크립트 없음(2026-03 제거, `ads.txt`만 유지)
- **코드 하이라이팅**: Shiki(빌드 시, 단일 잉크 테마)

## 작업 모드

이 프로젝트에서의 작업은 두 가지 모드로 구분된다:

1. **블로그 디자인 모드**: CSS/JS/레이아웃 등 UI/UX 개선 작업
2. **블로깅 모드** (`/blog-write`): 새 포스트 작성 워크플로우

모드를 명시하지 않으면 대화 내용에서 자동 판별한다.

## 블로깅 규칙

### 워크플로우
`/blog-write` 스킬로 실행. 주제 접수 → 구조 제안 → 이미지 처리 → 한국어 초안 → 사용자 리뷰 → **영어/일본어 자동 번역** → 발행

### 다국어 자동 번역

- 한국어 초안이 확정되면 영어(en), 일본어(ja) 버전을 **자동으로** 작성한다
- 별도 요청 없이도 항상 3개 언어 파일을 생성한다
- 단순 번역이 아닌, 해당 언어권 독자에게 자연스러운 표현으로 작성
- 영어: 전문적이고 간결한 어투
- 일본어: 정중한 경어체 (~です/~ます)

### 이미지 규칙

- **필수**: 모든 포스트에 최소 1개 이미지 (일상 블로그 포함)
- **경로**: `/assets/images/posts/[포스트-slug]/`
- **최적화**: `scripts/optimize-image.sh` 사용 (최대 1200px, 300KB 이하)
- **이미지 소스**:
  - PC 캡처 → MCP screenshot capture (`mcp__screenshot__capture`)
  - AI 생성 이미지 → 상세 영문 프롬프트 제공, 사용자가 외부 도구로 생성
  - 사용자 사진 → `dropbox/` 폴더에 넣으면 스크립트로 최적화
  - 웹사이트 캡처 → Playwright MCP 활용

### 프로젝트 기반 블로깅

- 사용자가 프로젝트 링크(GitHub 등)를 제공하면, 해당 프로젝트를 분석하여 블로그 소재로 활용
- **프로젝트 코드를 그대로 노출하지 않는다** — 아키텍처, 기술 선택, 문제 해결 과정 등 블로그 독자에게 유익한 정보 중심으로 재구성
- 분석 관점: 기술 스택, 설계 결정, 삽질/해결 경험, 배운 점, 다른 개발자에게 도움될 팁

### 이전 포스트 참조

- 초안 작성 전 `_posts/` 폴더의 기존 포스트를 확인하여 관련 주제가 있으면 참고
- 이전 글과 연결되는 내용이 있으면 본문에서 자연스럽게 링크 (`[이전 글 제목](/YYYY/MM/DD/slug/)`)
- 시리즈물이 될 수 있는 주제는 연속성을 유지
- 글쓰기 어투와 구조를 기존 포스트와 일관되게 유지

### 글쓰기 스타일

- 구어체 + 전문 용어 혼합 ("~더라", "~했다")
- 이모지 소제목 활용 (🤦‍♂️ 문제, 🔧 해결, 💡 인사이트, 🎯 결론)
- 서사 구조: 문제 → 삽질/시도 → 해결 → 배운 점
- 기존 게시글의 어투를 지속 학습하여 메모리에 저장 후 활용
- **AI스러운 표현 금지**: "따라서", "그러므로", "또한" 남발 금지. 감정 없는 건조한 서술 금지. 모든 문제가 깔끔하게 해결되는 완벽한 스토리 금지
- 문장 길이를 의도적으로 변화시켜 자연스러운 리듬 유지 (짧은 문장과 긴 문장 혼합)

### 글쓰기 스타일 상세 (Kevin Park 어투 분석)

**블로그 어미 패턴:**

- "~했었다" (과거 경험), "~인 거다" (설명/강조), "~더라" (발견/깨달음), "~한다" (현재/의지)
- 반말 기반 일기체이지만 너무 거칠지 않게

**감정 표현:**

- ㅎㅎ (만족/가벼운 웃음), ㅋㅋ (웃김/자조), ㅠㅠ (아쉬움), "..." (여운)
- "!!!" (감탄), "???" (놀람), "어라?" (예상치 못한 발견)

**문장 특징:**

- 매우 짧은 문장 (1~2줄 이내), 문장마다 줄바꿈으로 가독성 확보
- 의문형 마무리로 독자와 소통 ("~할까요?", "~겠죠?")

**어휘:**

- "요놈이", "플젝", "뚝딱", "빡칠때", "눈물을 머금고", "현타가 왔다"
- "따라서/그러므로" 절대 불가 → "근데/그래서/아무튼"

**이모지 규칙:**

- 이모지 사용하지 않음 (소제목, 본문 모두 X)
- 감정 표현은 ㅎㅎ/ㅋㅋ/ㅠㅠ 같은 한글 자음으로 대체

## 새 포스트 작성 시 참고사항

- 하나의 포스트를 3개 언어 버전으로 작성 (ko, en, ja 파일)
- 영어·일본어 파일은 `lang`만 바꾸면 된다(주소 자동)
- 미래 날짜(`date`)의 글은 빌드에서 빠진다 — 게시 직전 실제 시각 이전으로
- 3D 작업 글이면 `src/data/works/`에 작업 데이터 1건 추가
- 게시 전 `npm run build`로 확인, push = 즉시 게시
