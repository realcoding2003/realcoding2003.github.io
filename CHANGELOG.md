# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- 리뉴얼기 글 '블로그를 포털로 갈아엎었다, 코드는 AI 에이전트들이 짰다'(한·영·일)와 AI 화면 대표 글 카드 연결 (ai)
- AI 영역: 메뉴 1순위 'AI', 홈 작업대 첫 조각(빛이 흐르는 반복 영상), `/ai/` 화면(AX 스크롤 영화 15초·이렇게 씁니다·기업 AX·DX 전환·AI 글 30편), 의뢰 'AI 도입·AX' 탭(회사·팀명 선택, 고지 반영) (ai)
- Astro 정적 사이트 뼈대: `_posts` 글 로더, Jekyll식 주소(UTC 날짜·slug·permalink), 이동 페이지 649건, hreflang, Atom feed, sitemap, 404 (site)
- 운영 사이트와 주소·메타·본문 지표를 전수 비교하는 도구 `tools/parity/` (parity)
- 새 디자인의 글 읽기 페이지: 공통 머리·바닥, 밝은/어두운 테마, 목차, 잉크 코드 패널, 코드 복사, 이미지 확대, 언어별 자체 호스팅 글꼴 (reader)
- 본문 이미지 WebP 반응형 변형(480/768/960/1440)과 빌드 캐시 (reader)
- 댓글·GA4·mermaid 화면 근접 지연 로드 (reader)
- 포털 화면: 홈 6섹션, 메이커·개발·게임·생활 영역, 영상 모음, 의뢰 화면(폼 UI·메일 대체), 소개, 목록 화면 재디자인 ×3언어 (portal)
- 작업물 데이터 8건(`src/data/works/`)과 글 하단 관련 작업 카드 (portal)
- 홈 히어로 스크롤 영화(생성 영상 15초, 스크롤 진행률로 앞뒤 재생)와 챕터 전환, 층 레일 진행률 연동 (motion)
- 작업대·의뢰 섹션 반복 배경 영상, 홈 전용 부드러운 스크롤(Lenis), 움직임 줄이기·데이터 절약 시 포스터 폴백 (motion)

### Changed

- 검증 스크립트(routes·ai-realm 테스트, s2·s3·s5 dist 점검)의 글 465편·sitemap 498·AI 글 30편 고정값을 하한으로 — 새 글이 생겨도 기존 보존을 확인, AI 대표 글은 같은 언어 글로 연결되는지 확인 (parity)
- 사이트 이름: 실전코딩 기술 블로그 → 실전코딩 작업실 / RealCoding Workshop / 実戦コーディング工房, 설명 문구·목록 화면 설명·앱 manifest 교체 (site)
- 상단 메뉴를 화면 위에 고정하고, 모든 폭에서 메뉴 항목을 바로 보이게(767px 이하 두 줄, 768px 이상 한 줄, 접는 메뉴 제거) — 히어로·목차·앵커 오프셋을 메뉴 높이 변수 하나로 맞춤 (header)
- 의뢰 안내: 출력 범위보다 큰 출력물(분할 출력·조립)과 출력 가능한 범위의 기구 설계를 '가능한 것'으로 옮김 (portal)
- 배포: GitHub Pages 기본 Jekyll 빌드 → GitHub Actions의 Astro 빌드(`.github/workflows/pages.yml`) (ci)

### Fixed

- 글·목록·404 화면이 OS 설정에 따라 밝은 테마로 바뀌던 문제 — 모든 화면을 어두운 테마로 고정(테마 전환 버튼 숨김, 저장된 밝은 테마 무시), 주소창 색(theme-color) #0C1130 하나로 통일 (reader)
- 영어·일본어 홈 첫 화면 제목 글꼴 교체 밀림(제목 글꼴 미리 받기 + optional) (header)
- 미리보기(dev) 서버에서 WebP 변형 이미지가 404로 깨져 보이던 문제 (reader)
- 원본이 없어 깨져 보이던 `ai-powered-github-pages-blog-series` 글(3개 언어)의 대표 이미지 제거 (posts)
- kramdown 오류 렌더링 흉내 제거, bitbucket 글 3편의 목록 안 코드 블록 들여쓰기 수정 (reader)
- 2026-03-15~24 영어·일본어 글 20편을 `/en/`·`/ja/` 주소로 정규화하고 옛 주소는 이동 페이지로 유지 — 한국어 글의 hreflang이 없는 주소를 가리키던 문제 해소 (site)
