---
name: git-commit
description: Git 커밋 요청 시 자동 발동. 커밋 메시지 작성, 변경사항 확인, Conventional Commits 형식 적용. 커밋해줘, commit, 커밋 요청 시 사용.
user-invocable: true
---

# Git 커밋 Skill

사용자가 커밋을 요청할 때 자동으로 발동됩니다.

## 트리거 조건

- "커밋해줘", "commit", "커밋 요청" 등의 표현
- 코드 작업 완료 후 커밋 요청

## 커밋 전 필수 확인

1. `git status`로 변경 파일 확인
2. `git diff --staged`로 스테이징된 변경 확인
3. `git log --oneline -5`로 최근 커밋 스타일 확인

## Conventional Commits 형식

```
<type>(<scope>): <subject>

<body>
```

### Type (필수)

| Type | 설명 |
|------|------|
| feat | 새 기능 추가 |
| fix | 버그 수정 |
| refactor | 리팩토링 (기능 변경 없음) |
| docs | 문서 수정 |
| style | 코드 스타일 변경 (포맷팅 등) |
| test | 테스트 추가/수정 |
| chore | 빌드, 설정 파일 등 |
| perf | 성능 개선 |

### Scope (선택)

변경된 컴포넌트/모듈명 (예: `feat(auth):`, `fix(api):`)

### Subject

- 50자 이내
- 현재형 사용 ("Add" not "Added")
- 마침표 없음

## 커밋 절차

1. **변경 확인**: `git status`, `git diff`
2. **스테이징**: 관련 파일만 `git add`
3. **메시지 작성**: Conventional Commits 형식
4. **커밋 실행**: HEREDOC 사용

```bash
git commit -m "$(cat <<'EOF'
feat(module): 기능 설명

상세 내용 (필요시)
EOF
)"
```

## 금지 사항

- Co-Authored-By 메타데이터 추가 금지
- **`--amend` 절대 금지** (사용자 명시적 요청 + 푸시 전 확인 완료 시에만 예외)
- `--no-verify` 사용 금지
- 자동 push 금지 (사용자 명시적 요청 제외)


## --amend 관련 중요 규칙

> **절대 --amend 사용 금지!** 이미 push된 커밋을 amend하면 원격과 분기가 발생함

### 파일 추가가 필요한 경우 (예: CHANGELOG.md)

**잘못된 방법:**

```bash
git commit -m "fix: 버그 수정"
# 나중에 CHANGELOG.md 추가 필요
git add CHANGELOG.md
git commit --amend --no-edit  # ❌ 금지!
```

**올바른 방법:**

```bash
# 처음부터 모든 파일을 한 번에 커밋
git add src/file.ts CHANGELOG.md
git commit -m "fix: 버그 수정"
```

**또는 별도 커밋으로 분리:**

```bash
git commit -m "fix: 버그 수정"
git add CHANGELOG.md
git commit -m "docs: CHANGELOG v1.0.5 업데이트"  # ✅ 새 커밋 생성
```

### 커밋 시 체크리스트

1. [ ] 모든 관련 파일이 스테이징되었는가?
2. [ ] CHANGELOG.md 업데이트가 필요한가? → 함께 커밋
3. [ ] package.json 버전 업데이트가 필요한가? → 함께 커밋

## CHANGELOG 자동 기록

> **Keep a Changelog** 국제 규격 준수: https://keepachangelog.com/ko/1.0.0/

### 기록 대상 커밋

| Commit Type | Changelog Category |
|-------------|-------------------|
| feat        | Added             |
| fix         | Fixed             |
| perf        | Changed           |
| refactor    | Changed           |
| security    | Security          |

### 기록 제외 커밋

- `docs` - 문서 수정
- `chore` - 빌드, 설정 파일
- `style` - 코드 스타일 변경
- `test` - 테스트 추가/수정

### 기록 절차

1. CHANGELOG.md 존재 확인 (없으면 생성)
2. `[Unreleased]` 섹션 찾기 (없으면 생성)
3. 커밋 유형에 맞는 카테고리에 항목 추가
4. **코드 변경과 CHANGELOG를 함께 스테이징**
5. 단일 커밋으로 처리

### CHANGELOG 포맷 (Keep a Changelog)

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- 새 기능 설명 (scope)

### Fixed

- 버그 수정 설명 (scope)

## [1.7.1] (managers v1.1.2) - 2025-02-03

### Added

- 초기 릴리스
```

### 이중 버전 표기

프로젝트에 시스템/매니저 등 복수 버전이 있는 경우:

```markdown
## [시스템버전] (managers v매니저버전) - YYYY-MM-DD
```

예시:
```markdown
## [1.7.1] (managers v1.1.2) - 2025-02-03
```

### 예시

커밋: `feat(auth): 로그인 기능 추가`

CHANGELOG에 추가:

```markdown
## [Unreleased]

### Added

- 로그인 기능 추가 (auth)
```

### 릴리스 워크플로우

버전 태그가 정해지면:

1. `[Unreleased]` → `[X.X.X] - YYYY-MM-DD` 변환
2. 새 빈 `[Unreleased]` 섹션 생성
3. ISO 8601 날짜 포맷 사용 (YYYY-MM-DD)

```markdown
## [Unreleased]

## [1.2.0] - 2024-01-20

### Added

- 로그인 기능 추가 (auth)
- 회원가입 기능 추가 (auth)

### Fixed

- 세션 만료 버그 수정 (session)
```

## 커밋 제외 파일

다음 파일은 절대 커밋하지 않음 (변경되어도 무시):


- `.env` - 환경변수 (민감정보)
- `*.pem`, `*.key` - 인증서/키 파일

## 커밋 후

- `git status`로 성공 확인
- 사용자에게 결과 알림
