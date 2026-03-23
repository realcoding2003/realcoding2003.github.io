# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Jekyll 3.9.5 기반 다국어 기술 블로그 (github-pages gem v231). 커스텀 도메인 `realcoding.blog`에서 운영되며 한국어(기본), 영어, 일본어 3개 언어를 지원한다.

## 개발 명령어

```bash
bundle install                # 의존성 설치
bundle exec jekyll serve      # 로컬 개발 서버 (localhost:4000, 라이브 리로드)
bundle exec jekyll build      # 정적 사이트 빌드 → _site/
```

배포: `git push origin master` → GitHub Pages가 자동으로 Jekyll 빌드 및 배포 (별도 CI/CD 없음)

## 아키텍처

### 레이아웃 체계
```
default.html (기본 HTML 구조, SEO, 다국어 hreflang, 외부 라이브러리)
├── post.html (포스트 메타데이터, 네비게이션, 공유버튼, Utterances 댓글)
└── page.html (단순 페이지 제목/콘텐츠)
```

### 다국어 시스템
- UI 문자열: `_data/ko.yml`, `_data/en.yml`, `_data/ja.yml`
- 언어별 페이지: 루트(`/`) = 한국어, `/en/`, `/ja/`
- 포스트에서 `lang` front matter로 언어 지정
- 레이아웃에서 `site.data[page.lang]`로 해당 언어 데이터 접근

### 포스트 규칙
- **파일명**: `YYYY-MM-DD-slug.md` (한국어), `YYYY-MM-DD-slug-en.md` (영어), `YYYY-MM-DD-slug-ja.md` (일본어)
- **URL**: `/:year/:month/:day/:title/`
- **이미지**: `/assets/images/posts/[포스트별-폴더]/` 하위에 저장

### Front Matter 구조
```yaml
---
layout: post
title: "제목"
date: 2025-07-04 00:02:00 +0900
categories: [Development, AI]
tags: [태그1, 태그2]
author: "Kevin Park"
lang: ko                              # ko | en | ja
excerpt: "요약 텍스트"
image: "/assets/images/posts/폴더/hero.png"  # 선택
mermaid: true                          # Mermaid 다이어그램 사용 시
---
```

### 주요 에셋
- `assets/css/main.css` — 전체 스타일 (CSS 변수 기반 다크/라이트 테마)
- `assets/js/main.js` — 모바일 메뉴, 테마 토글, 이미지 모달, 스크롤 기능
- `_includes/header.html` — 네비게이션 + 언어 전환 드롭다운
- `_includes/footer.html` — 소셜 링크, 카테고리, 최근 포스트
- `_includes/mermaid.html` — Mermaid 다이어그램 렌더링
- `_includes/analytics.html` — Google Analytics (GA4)
- `_includes/adsense.html` — Google AdSense

### 외부 서비스
- **댓글**: Utterances (GitHub Issues 기반, repo: `realcoding2003/realcoding2003.github.io`)
- **분석**: Google Analytics GA4 (`G-MEFBMHM6FK`)
- **광고**: Google AdSense (`ca-pub-9012129960393497`)
- **코드 하이라이팅**: Rouge (빌드 시) + Highlight.js (런타임)

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
- `_config.yml`의 `exclude` 목록에 포함된 파일은 빌드에서 제외됨
- GitHub Pages 호환 플러그인만 사용 가능 (커스텀 플러그인 불가)
- 페이지네이션: 홈페이지에서 10개씩 표시
