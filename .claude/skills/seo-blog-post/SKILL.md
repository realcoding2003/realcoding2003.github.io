---
name: seo-blog-post
description: SEO 키워드 리서치 기반 기술 팁 블로그 포스트 자동 생성. 검색 트렌드 분석 후 고검색량/저경쟁 키워드로 포스트 작성. /seo-blog-post, SEO 포스팅, 검색 유입 포스트, 기술 팁 배치 작성 시 사용.
user-invocable: true
---

# SEO 키워드 기반 기술 팁 블로그 포스트 Skill

검색 엔진 최적화를 고려한 기술 팁 포스트를 키워드 리서치 기반으로 작성합니다.

## 트리거 조건

- "/seo-blog-post", "SEO 포스팅", "검색 유입 포스트", "기술 팁 배치" 등
- 하루에 한 번씩 실행하여 1개 포스트(3개 언어) 생성

## 워크플로우

### 1단계: 날짜 결정 + 기존 포스트 분석 (중복 방지)

**날짜 결정 규칙:**

```bash
# 1) _posts/에서 가장 마지막 포스트 날짜를 확인 (한국어 기준)
ls _posts/ | grep -v '\-en\.' | grep -v '\-ja\.' | sort | tail -1
# 2) 마지막 포스트 날짜 + 2일 이후, 그리고 오늘 날짜 이후 중 더 늦은 날짜를 사용
```

- **단일 포스트**: 마지막 포스트 날짜 + 1일 (단, 오늘 날짜를 절대 초과하지 않는다)
- **배치 모드 (N개)**: 오늘 날짜에서 역산하여 1일 간격으로 과거 방향으로 배정 (예: 오늘이 03-07이면 → 03-07, 03-06, 03-05...)
- **미래 날짜 절대 금지**: 모든 포스트 날짜는 반드시 오늘 이하여야 한다. GitHub Pages는 미래 날짜 포스트를 빌드하지 않는다
- **기존 포스트와 날짜 충돌 시**: 해당 날짜를 건너뛰고 그 전날을 사용한다
- **시간**: 항상 `09:00:00 +0900` 고정
- 파일명과 front matter의 `date` 필드가 반드시 동일한 날짜여야 한다

**기존 포스트 확인:**

```bash
# _posts/ 폴더에서 기존 주제 목록 확인
ls _posts/ | grep -v '\-en\.' | grep -v '\-ja\.' | sort
```

- 이미 다룬 주제 목록을 파악하여 중복을 방지한다.

### 2단계: 키워드 리서치

다음 도구/소스를 활용하여 고검색량 + 저경쟁 키워드를 조사한다:

**글로벌 키워드 도구:**
- [Google Trends](https://trends.google.com/trends/) - 시계열 트렌드 비교
- [Semrush Free Keyword Checker](https://www.semrush.com/free-tools/keyword-search-volume-checker/) - 월간 검색량
- [Ahrefs Free Keyword Generator](https://ahrefs.com/keyword-generator) - 키워드 난이도
- [KeywordTool.io](https://keywordtool.io/) - Google 자동완성 기반 롱테일 키워드
- [Ubersuggest](https://neilpatel.com/ubersuggest/) - 경쟁 분석

**한국 키워드 도구:**
- [블랙키위](https://blackkiwi.net/) - 네이버 키워드 검색량/트렌드
- [키워드마스터](https://whereispost.com/keyword/) - 블로그 키워드 경쟁도
- [SURF](https://surffing.net/) - 네이버 월간 검색량

**트렌드 소스:**
- Stack Overflow Developer Survey 최신 결과
- GitHub Octoverse 보고서
- [Glimpse Trends](https://meetglimpse.com/trends/software-development-programming-trends/) - 급성장 키워드
- Reddit r/webdev, r/programming 트렌딩 주제

**WebSearch 도구**로 다음을 검색:
1. "trending developer keywords [현재연도]" - 최신 트렌드
2. "most searched programming questions [현재연도]" - 인기 질문
3. "[기술명] common errors solutions" - 실무 문제 해결 키워드
4. "stackoverflow trending [기술명]" - 커뮤니티 인기 주제

### 3단계: 주제 선정

**선정 기준:**
- 기존 포스트와 중복되지 않는 주제
- 롱테일 키워드 타겟 (4~7 단어)
- 실무에서 자주 마주치는 구체적 문제/해결 패턴
- 검색량 대비 경쟁이 적은 틈새 키워드

**타겟 기술 스택 (우선순위):**
1. TypeScript / JavaScript
2. React / Next.js
3. Node.js
4. Docker / Kubernetes
5. Python / FastAPI
6. AWS (CDK, Lambda, S3, DynamoDB 등)
7. Git / CI/CD
8. Database (PostgreSQL, Redis, Prisma 등)

### 4단계: 포스트 작성

**파일 생성 규칙:**
- 한국어: `YYYY-MM-DD-slug.md`
- 영어: `YYYY-MM-DD-slug-en.md`
- 일본어: `YYYY-MM-DD-slug-ja.md`

**Front Matter 템플릿:**

```yaml
---
layout: post
title: "[제목]"
date: YYYY-MM-DD 09:00:00 +0900
categories: [Development, Tips]
tags: [태그1, 태그2, 태그3, 태그4]
author: "Kevin Park"
lang: ko  # ko | en | ja
excerpt: "[50~80자 요약]"
---
```

**본문 구조:**

```markdown
## 문제

[실무에서 마주치는 구체적 상황 1~2문장]

## 해결

[코드 스니펫 + 간단한 설명]

## 핵심 포인트

- [포인트 1]
- [포인트 2]
- [포인트 3]
```

**어투 규칙:**
- 일기체 반말 ("~했다", "~인 거다", "~더라", "~한다")
- "따라서/그러므로" 절대 불가 -> "근데/그래서/아무튼"
- 이모지 사용 안 함
- 간결하고 실용적 (전체 30~50줄)

**영어 버전:**
- 전문적이고 간결한 어투
- 섹션: Problem → Solution → Key Points

**일본어 버전:**
- 정중한 경어체 (~です/~ます)
- 섹션: 問題 → 解決方法 → ポイント

### 5단계: 자동 커밋 & 푸시

포스트 작성이 완료되면 별도 확인 없이 자동으로 커밋하고 푸시한다.

```bash
# 생성된 포스트 파일만 스테이징
git add _posts/YYYY-MM-DD-slug.md _posts/YYYY-MM-DD-slug-en.md _posts/YYYY-MM-DD-slug-ja.md

# Conventional Commits 형식으로 커밋
git commit -m "$(cat <<'EOF'
docs(blog): SEO 기술 팁 포스트 추가 - [주제 요약] (3개 언어)
EOF
)"

# 자동 푸시
git push origin master
```

- 커밋 메시지는 `docs(blog):` 접두사 사용
- 배치 모드일 경우: `docs(blog): N차 배치 팁 포스트 N개 추가 (3개 언어)`
- 푸시 후 GitHub Pages 자동 빌드/배포 확인은 별도로 하지 않는다

## 배치 모드

사용자가 "N개 배치"를 요청하면:
1. 위 워크플로우로 N개 주제를 한 번에 선정
2. N x 3 = 3N개 파일 생성
3. 날짜는 오늘부터 역산하여 1일 간격 (미래 날짜 절대 금지)

## 금지 사항

- 기존 포스트와 동일한 주제 작성 금지
- AI스러운 표현 ("따라서", "그러므로", "또한" 남발) 금지
- 이모지 사용 금지
- 300줄 이상 포스트 금지 (간결함 유지)
- _posts/ 외의 파일을 커밋에 포함하지 않는다
