# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Astro 정적 사이트 뼈대: `_posts` 글 로더, Jekyll식 주소(UTC 날짜·slug·permalink), 이동 페이지 649건, hreflang, Atom feed, sitemap, 404 (site)
- 운영 사이트와 주소·메타·본문 지표를 전수 비교하는 도구 `tools/parity/` (parity)
- 새 디자인의 글 읽기 페이지: 공통 머리·바닥, 밝은/어두운 테마, 목차, 잉크 코드 패널, 코드 복사, 이미지 확대, 언어별 자체 호스팅 글꼴 (reader)
- 본문 이미지 WebP 반응형 변형(480/768/960/1440)과 빌드 캐시 (reader)
- 댓글·GA4·mermaid 화면 근접 지연 로드 (reader)

### Fixed

- kramdown 오류 렌더링 흉내 제거, bitbucket 글 3편의 목록 안 코드 블록 들여쓰기 수정 (reader)
- 2026-03-15~24 영어·일본어 글 20편을 `/en/`·`/ja/` 주소로 정규화하고 옛 주소는 이동 페이지로 유지 — 한국어 글의 hreflang이 없는 주소를 가리키던 문제 해소 (site)
