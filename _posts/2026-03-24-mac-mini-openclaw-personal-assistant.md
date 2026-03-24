---
layout: post
title: "맥미니 하나로 AI 개인비서 만들었다 - OpenClaw 설정부터 비용 최적화까지"
date: 2026-03-24 09:00:00 +0900
categories: [Development, AI]
tags: [OpenClaw, Claude Code, 맥미니, 개인비서, 텔레그램, Gmail, Google Calendar, 자동화, 비용절감]
author: "Kevin Park"
lang: ko
excerpt: "OpenClaw로 Gmail 자동 정리, 캘린더 등록, 텔레그램 보고까지. 핵심은 API가 아니라 CLI로 돌려서 비용을 극한까지 줄인 거다."
image: "/assets/images/posts/mac-mini-openclaw-personal-assistant/mac-mini-hero.jpg"
---

![우리집 김비서](/assets/images/posts/mac-mini-openclaw-personal-assistant/mac-mini-hero.jpg)

사무용으로 산 맥미니가 하나 있다. 사무실에서 놀고 있었다. 시간이 좀 나서 요즘 핫한 OpenClaw를 세팅해봤다.

우선 간단하게 비서 역할을 시켜봤다. 메일 계정 정리하고, 일정 관리하는 정도. 메일은 매일 수십 통씩 쌓이는데 확인을 안 하고, 일정 관련 메일이 와도 캘린더에 등록을 안 해서 놓치고. 이런 걸 자동으로 해주면 좋겠다 싶었다.

근데 세팅하면서 알게 된 게 있다. OpenClaw를 Claude OAuth로 연동하면 계정이 블록될 수 있다는 거. 그리고 API로만 돌리면 비용이 꽤 나온다는 거. 이 두 가지를 피하면서 비용을 최적화하는 방법을 찾았다.

이 글은 그 세팅기다. OpenClaw 설치부터 계정 블록 피하는 법, 비용을 거의 0원으로 만드는 구조까지.

---

**목차**

**사전 준비**

1. [맥미니 기본 세팅](#1단계-맥미니-기본-세팅) - Homebrew, Node.js
2. [Claude Code CLI 설치](#2단계-claude-code-cli-설치-및-인증) - 공식 스크립트로 설치 + 인증
3. [API 키와 봇 토큰 받기](#3단계-api-키와-봇-토큰-받기) - Claude API 키, 텔레그램 봇 토큰

**본격 설치**

4. [OpenClaw 설치](#4단계-openclaw-설치) - 설치 + 페어링
5. [Google Cloud API 연동](#5단계-google-cloud-api-연동) - Gmail, Calendar API

**활용**

6. [기능 구현](#이제-진짜-기능을-만든다) - 메일 정리, 텔레그램 보고, 캘린더 등록
7. [비용이 핵심이다](#근데-비용이-핵심이다) - API vs CLI, 배치 스크립트 전략

---

전체 구조는 이렇다.

![맥미니 AI 개인비서 아키텍처](/assets/images/posts/mac-mini-openclaw-personal-assistant/architecture.jpg)

## 사전 준비

### 1단계: 맥미니 기본 세팅

맥미니를 비서로 쓰려면 일단 밑바닥부터 깔아야 한다. macOS라서 Homebrew만 있으면 나머지는 쉽다.

```bash
# Homebrew 설치 (이미 있으면 패스)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js 설치
brew install node

# 버전 확인
node -v  # v24.x 이상 권장
npm -v
```

맥미니가 이 용도에 딱인 이유가 있다. 저전력이라 24시간 켜둬도 전기세 부담이 적고. macOS라서 개발 환경 세팅이 편하다. 소음도 없다.

### 2단계: Claude Code CLI 설치 및 인증

여기가 중요하다. 나중에 나올 비용 절감의 핵심이 Claude Code CLI거든.

공식 설치 방법은 [Claude Code 공식 문서](https://code.claude.com/docs/ko/setup)에 나와있다.

```bash
# Claude Code 공식 설치
curl -fsSL https://claude.ai/install.sh | bash
```

설치가 끝나면 터미널에서 `claude` 명령어를 실행하면 된다. 처음 실행하면 브라우저가 열리면서 Anthropic 계정으로 로그인하게 된다. 여기서 Max 플랜 구독 상태여야 한다. Max 플랜이면 CLI 사용이 구독비에 포함이라 추가 과금이 없다.

이게 왜 중요한지는 뒤에서 자세히 설명한다. 일단 기억해두자. **CLI = 추가비용 없음**.

### 3단계: API 키와 봇 토큰 받기

OpenClaw를 설치하면 대화형으로 이것저것 물어보는데, 그때 필요한 것들을 미리 받아둬야 한다. 중간에 막히면 귀찮으니까.

**필요한 거 두 가지:**

### Claude API 키

[Anthropic Console](https://console.anthropic.com/)에 가입하고 API 키를 발급받는다.

1. Anthropic Console 접속 → 회원가입
2. API Keys 메뉴에서 새 키 생성
3. `sk-ant-` 로 시작하는 키가 나온다

이거 복사해서 어딘가에 저장해두자. CLI 인증과는 별개인 거다.

### 텔레그램 봇 토큰

비서한테 보고를 받으려면 채널이 필요하다. 텔레그램을 선택한 이유는 간단하다. Bot API가 무료고, 강력하다.

가입 자체는 휴대폰 번호만 있으면 금방 된다. 번거롭지 않았다.

근데 봇 만드는 과정이 좀 헷갈렸다. 텔레그램 데스크톱 앱을 설치하고 거기서 진행하는 게 훨씬 편하더라. 맥미니에서 직접 하니까 화면도 크고 토큰 복사하기도 좋고.

1. [텔레그램 데스크톱](https://desktop.telegram.org/) 설치
2. 휴대폰 번호로 가입
3. BotFather한테 봇 만들기

![BotFather에서 /newbot 명령어 입력](/assets/images/posts/mac-mini-openclaw-personal-assistant/botfather-newbot.png)

```
# 텔레그램 데스크톱에서 @BotFather 검색 후 대화

/newbot
# 봇 이름 입력 (예: MyAssistantBot)
# 봇 유저네임 입력 (예: my_assistant_2026_bot)
# 유저네임은 반드시 _bot으로 끝나야 한다

# 토큰이 나온다. 이거 저장해둬야 한다
# 예: 7123456789:AAH1234abcd5678efgh...
```

![봇 생성 완료 후 토큰 발급 화면](/assets/images/posts/mac-mini-openclaw-personal-assistant/botfather-token.png)

처음에 좀 헤맸던 게, BotFather가 물어보는 "name"과 "username"이 다른 거다. name은 표시 이름이고, username은 고유 ID 같은 건데 반드시 `_bot`으로 끝나야 한다. 이거 모르면 계속 에러 뜬다.

이제 **Claude API 키**와 **텔레그램 봇 토큰**, 이 두 개를 복사해서 저장해뒀으면 준비 끝이다.

## 본격 설치

### 4단계: OpenClaw 설치

OpenClaw는 오픈소스 AI 에이전트다. 텔레그램, 슬랙 같은 메신저와 AI를 연결해주는 도구인데. 이걸 쓰면 텔레그램에서 AI한테 직접 명령을 내릴 수 있다.

공식 설치는 [OpenClaw 공식 사이트](https://openclaw.ai)에서 확인할 수 있다.

```bash
# OpenClaw 공식 설치
curl -fsSL https://openclaw.ai/install.sh | bash
```

설치가 끝나면 대화형으로 설정이 시작된다. 순서대로 따라가면 되는데, 중간에 선택지가 나오는 부분이 있다.

1. AI 인증 방식 선택 → **Claude auth** 선택
2. 그 다음 **Claude API** vs **Claude OAuth** 물어본다 → **반드시 API 선택**

여기서 **절대 OAuth로 하면 안 된다**. OAuth로 연동하면 계정이 블록당할 수 있다. API를 선택해야 한다.

API를 선택하면 아까 저장해둔 것들을 입력하면 된다.

- Claude API 키 → `sk-ant-xxxxx` 붙여넣기
- 텔레그램 봇 토큰 → `7123456789:AAH...` 붙여넣기

입력이 끝나면 OpenClaw가 알아서 설정해준다.

### 봇 페어링

설정이 끝나고 텔레그램에서 봇과 처음 대화를 시작하면 **페어링 키**를 알려준다.

![텔레그램에서 봇에게 /start 하면 페어링 코드가 나온다](/assets/images/posts/mac-mini-openclaw-personal-assistant/pairing-code.jpg)

이 키를 복사해서 OpenClaw에 입력하면 페어링이 완료된다.

여기까지 하면 텔레그램에서 봇한테 말을 걸면 Claude가 응답하는 상태가 된다.

참고로 이 초기 설정 과정에서 API 비용이 **$10~20 정도** 소진된다. OpenClaw가 처음 세팅하면서 이것저것 테스트하고 연동 확인하는 과정에서 나가는 거다. 이건 어쩔 수 없다.

"어? API 비용이 나오는 거 아니야?" 맞다. OpenClaw가 텔레그램에서 들어오는 명령을 처리할 때 API를 쓴다. 근데 이건 텔레그램에서 직접 명령할 때만 쓰이는 거라 양이 적다. 진짜 무거운 작업은 다른 방식으로 처리한다. 이것도 뒤에서 설명한다.

### 5단계: Google Cloud API 연동

솔직히 이 부분이 전체 과정에서 가장 귀찮었다 ㅠㅠ 단계가 많다. 근데 한 번만 하면 되니까 스크린샷 보면서 따라가자.

#### Google Cloud 가입 및 프로젝트 생성

Google 계정은 있겠지만 Cloud Console은 별도로 가입이 필요하다. [Google Cloud Console](https://console.cloud.google.com/)에 접속해서 가입한다. 결제 정보 등록을 요구하는데, 무료 티어로 충분하니까 걱정 안 해도 된다.

가입이 끝나면 프로젝트를 만든다.

![새 프로젝트 생성 - 이름 입력](/assets/images/posts/mac-mini-openclaw-personal-assistant/gc-01-new-project.png)

프로젝트 이름은 아무거나 넣으면 된다. 나는 "testOpenClaw"로 했다.

#### API 활성화

프로젝트가 생성되면 좌측 햄버거 메뉴를 열어서 **API 및 서비스**로 들어간다.

![좌측 메뉴에서 API 및 서비스 찾기](/assets/images/posts/mac-mini-openclaw-personal-assistant/gc-02-menu.png)

그러면 API 및 서비스 대시보드가 나온다. 여기서 **라이브러리**로 들어가서 필요한 API를 검색한다.

![API 및 서비스 대시보드](/assets/images/posts/mac-mini-openclaw-personal-assistant/gc-03-api-dashboard.png)

라이브러리에서 API 이름을 검색하면 된다.

![Calendar API 검색](/assets/images/posts/mac-mini-openclaw-personal-assistant/gc-04-api-search.png)

검색해서 들어간 다음 **사용** 버튼을 누르면 활성화된다.

![Calendar API 활성화](/assets/images/posts/mac-mini-openclaw-personal-assistant/gc-05-api-enable.png)

이걸 필요한 API마다 반복한다.

필수:

- **Gmail API** - 메일 읽기/정리용
- **Google Calendar API** - 일정 등록용

필요에 따라 추가:

- Google Sheets API, Google Docs API, Google Drive API

나는 5개 정도 활성화했는데, 메일이랑 캘린더만 쓸 거면 2개면 충분하다.

#### 사용자 인증 정보 설정

API를 활성화했으면 이제 인증 정보를 만들어야 한다. **API 및 서비스** > **사용자 인증 정보**로 들어간다.

![사용자 인증 정보 페이지](/assets/images/posts/mac-mini-openclaw-personal-assistant/gc-06-credentials.png)

처음이면 OAuth 동의 화면을 먼저 설정하라고 나온다.

#### OAuth 동의 화면 설정

**Google 인증 플랫폼** 화면이 나온다. **시작하기** 버튼을 누른다.

![OAuth 개요 - 시작하기](/assets/images/posts/mac-mini-openclaw-personal-assistant/gc-07-oauth-start.png)

프로젝트 구성이 시작된다. 4단계로 진행된다.

**1단계: 앱 정보**

앱 이름이랑 사용자 지원 이메일을 입력한다. 나는 앱 이름을 "김비서"로 했다 ㅋㅋ

![앱 정보 입력 - 앱 이름과 이메일](/assets/images/posts/mac-mini-openclaw-personal-assistant/gc-08-oauth-app-info.png)

**2단계: 대상**

사용자 유형을 선택한다. **내부(Internal)**로 선택하면 된다.

![대상 선택](/assets/images/posts/mac-mini-openclaw-personal-assistant/gc-09-oauth-audience.png)

**3단계: 연락처 정보**

이메일 주소를 요구하는데, 나만 쓸 거니까 적당히 내 이메일 주소를 넣어주면 된다.

![연락처 정보 입력](/assets/images/posts/mac-mini-openclaw-personal-assistant/gc-10-oauth-contact.png)

**4단계: 완료**

Google API 서비스 데이터 정책에 동의하고 **만들기**를 누른다.

![완료 - 데이터 정책 동의](/assets/images/posts/mac-mini-openclaw-personal-assistant/gc-11-oauth-complete.png)

여기까지 하면 OAuth 동의 화면 설정이 끝난다.

#### OAuth 2.0 클라이언트 ID 생성

다시 좌측 메뉴에서 **API 및 서비스** > **사용자 인증 정보**로 들어간다.

![메뉴에서 사용자 인증 정보](/assets/images/posts/mac-mini-openclaw-personal-assistant/gc-12-menu-credentials.png)

상단의 **+ 사용자 인증 정보 만들기**를 클릭하고 **OAuth 클라이언트 ID**를 선택한다.

![사용자 인증 정보 만들기](/assets/images/posts/mac-mini-openclaw-personal-assistant/gc-13-create-credentials.png)

애플리케이션 유형을 **데스크톱 앱**으로 선택한다.

![데스크톱 앱 선택](/assets/images/posts/mac-mini-openclaw-personal-assistant/gc-14-client-type.png)

이름은 아무거나 입력하고 **만들기**를 누른다.

![클라이언트 ID 만들기](/assets/images/posts/mac-mini-openclaw-personal-assistant/gc-15-client-create.png)

#### credentials.json 다운로드

클라이언트 ID가 생성되면 팝업이 뜬다. 여기서 **JSON 다운로드** 버튼을 누른다.

![OAuth 클라이언트 생성 완료 - JSON 다운로드](/assets/images/posts/mac-mini-openclaw-personal-assistant/gc-16-json-download.png)

이게 `credentials.json` 파일이다. 이 파일이 Google API 인증의 열쇠다.

#### OpenClaw에 연동

다운받은 credentials.json을 다운로드 폴더에 넣어두고, OpenClaw한테 연동해달라고 하면 된다. 텔레그램에서 봇한테 "다운로드 폴더에 있는 credentials.json으로 Google API 연동해줘" 라고 말하면 알아서 처리해준다.

처음 연동할 때 브라우저에서 Google 계정 인증을 한 번 해줘야 한다. 이후에는 자동으로 토큰이 갱신된다.

여기까지가 제일 귀찮은 구간이다. 근데 한 번 해놓으면 다시 안 해도 된다.

## 이제 진짜 기능을 만든다

세팅이 끝났으니 이제 비서한테 일을 시키자. 근데 여기서 중요한 건, 코드를 직접 짜는 게 아니라 **대화로 시킨다**는 거다.

### 핵심 명령: 배치 작업 + CLI로 돌려라

텔레그램에서 봇한테 이렇게 말했다.

```
나: 반드시 모든 작업은 배치 작업 스크립트로 등록해서 실행하고,
    실행할 때에 claude code cli를 활용하도록 해줘
```

이게 핵심이다. OpenClaw한테 "작업을 배치로 만들고 CLI로 돌려라"고 지시하는 거다. 왜 이렇게 하냐면 뒤에서 설명할 비용 문제 때문인데, 일단 따라가자.

### Gmail 자동 정리 설정

```
나: Gmail에서 6시간마다 메일을 자동으로 정리해줘.
    프로모션/마케팅 메일은 아카이브하고,
    중요 메일은 요약해서 텔레그램으로 보고해줘.
    일정 관련 메일이 있으면 별도로 알려줘.
```

이렇게 말하면 OpenClaw가 배치 스크립트를 만들고, crontab에 6시간 주기로 등록하고, 실행은 Claude Code CLI를 통해서 하도록 설정해준다. 내가 스크립트를 직접 짤 필요가 없다.

### 텔레그램 보고

설정이 끝나면 6시간마다 이런 보고가 텔레그램으로 날아온다.

![텔레그램으로 받은 메일 정리 보고](/assets/images/posts/mac-mini-openclaw-personal-assistant/telegram-report.png)

중요 메일 요약, 일정 관련 메일 알림, 아카이브 처리 결과가 정리되어 온다. 아침에 일어나면 이미 메일 정리가 끝나있는 거다.

### 일정 메일 → 텔레그램 확인 → 캘린더 등록

일정 관련 메일이 감지되면 텔레그램으로 물어본다.

```
봇: 일정 관련 메일이 있습니다.
    김OO: 3/27(목) 오후 2시 미팅 제안
    캘린더에 등록할까요?

나: 응 등록해줘

봇: Google Calendar에 등록했습니다.
    📅 3/27(목) 14:00-15:00
    제목: 김OO 미팅
    알림: 30분 전
```

양방향 소통이 되는 거다. 일방적으로 보고만 하는 게 아니라, 내가 텔레그램에서 바로 응답하면 그에 맞춰 행동한다.

### 추가 기능도 대화로

나중에 기능을 추가하고 싶으면 그냥 말하면 된다.

```
나: 매일 아침 9시에 오늘 캘린더 일정을 텔레그램으로 알려줘
```

```
나: 일주일에 한 번 메일 통계를 정리해서 보고해줘.
    어떤 발신자가 가장 많았는지, 중요 메일 비율은 어떤지.
```

이런 식으로 말만 하면 OpenClaw가 배치 스크립트를 만들고 등록해준다. 코딩 안 해도 된다.

## 근데 비용이 핵심이다

여기까지 읽으면 "좋은데... API 비용 많이 나오겠네?" 할 수 있다.

맞다. 이걸 최적화 안 하고 API로만 돌리면 진짜 무섭다. 실제로 확인해봤는데 **하루에 5만원~8만원** 정도 나온다. 20일만 써도 160만원이다. 미쳤다.

그래서 처음부터 **"배치 스크립트 + CLI"로 돌려라**고 지시한 거다. 비용 구조가 완전히 달라진다.

### API vs CLI, 비용이 이렇게 다르다

```
API로만 돌릴 경우:
  - 하루 5~8만원 (약 $35~55)
  - 월 20일 사용 기준: 약 160만원 ($1,100+)
  - 매일 비서처럼 굴리면 이 정도 나온다

배치 + CLI 하이브리드:
  - 배치 작업 (CLI): Max 플랜 구독비에 포함
  - 대화형 작업 (API): 하루 $1 미만
  - 텔레그램으로 이것저것 많이 시킨 날: 하루 $10~20
```

차이가 어마어마하다. API로만 돌리면 한 달에 160만원인데, CLI 중심으로 바꾸면 하루 $1도 안 나온다. 텔레그램에서 질문 답변으로 별도 작업을 많이 시킨 날도 $10~20 정도.

Max 플랜은 월 $100 또는 $200인데, 어차피 개발 작업용으로 이미 구독하고 있었다. 이 안에서 CLI 사용이 포함되니까 배치 작업은 추가 비용이 안 나온다.

### 왜 이렇게 나눴냐

구조를 다시 보면 두 개의 채널로 나뉘어 있다.

**OpenClaw (API 경유):**
- 텔레그램에서 내가 직접 명령할 때
- "캘린더 등록해줘" 같은 대화형 작업
- 이건 어쩔 수 없이 API 키가 필요하다. OpenClaw가 Claude랑 소통하려면 API로 해야 하니까
- 평상시 하루 $1 미만. 많이 쓴 날 $10~20

**배치 스크립트 (CLI 경유):**
- 6시간마다 자동 실행되는 메일 정리
- 무거운 반복 작업 전부
- Claude Code CLI로 돌리니까 Max 플랜에 포함
- 결과만 텔레그램 API로 전송 (이건 무료)

핵심은 이거다. **OpenClaw는 텔레그램의 입/출력 역할만 하고, 실제 무거운 반복 작업은 CLI가 담당한다.**

그래서 처음에 "배치 스크립트로 만들고 CLI로 돌려라"고 지시한 거다. 이 한 마디가 비용을 극적으로 줄여준다.

[AI 구독권 비용에 대한 생각](/2026/02/05/ai-subscription-regret/)을 예전에 쓴 적이 있는데. 결국 이미 내고 있는 구독비 안에서 최대한 뽑아먹는 게 답이다 ㅎㅎ

## 마무리

맥미니 하나. 놀고 있던 걸 비서로 만들었다.

하는 일 정리하면 이렇다.

- 6시간마다 Gmail 정리하고 텔레그램으로 보고
- 일정 관련 메일은 텔레그램으로 물어보고 캘린더에 등록
- 무거운 작업은 CLI로, 대화형 작업은 API로. 비용 최적화

솔직히 가장 뿌듯한 건 비용 구조다. API로만 했으면 매달 $10~30 나왔을 텐데. CLI로 돌리니까 어차피 내던 구독비 안에서 전부 해결됐다.

다음에는 Slack 연동이랑 날씨 알림 같은 것도 붙여보려고 한다. 근데 지금 이것만으로도 꽤 쓸만하다. 아침에 일어나면 텔레그램에 메일 요약이 와있는 게 진짜 편하더라.

맥미니 놀리고 있는 사람 있으면 한번 해보시라. 세팅이 좀 귀찮긴 한데 한 번 해놓으면 그 다음부터는 알아서 돌아간다.

어차피 구독비 내고 있으면 안 쓰면 손해다 ㅋㅋ
