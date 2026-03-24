---
layout: post
title: "어제 OpenClaw 세팅기 쓰고 잤더니, 다음날 Claude가 Computer Use를 발표했다"
date: 2026-03-25 08:45:00 +0900
categories: [Life, Essay]
tags: [AI, Claude, Computer Use, OpenClaw, OpenAI, Anthropic, 개인비서, AI전쟁]
author: "Kevin Park"
lang: ko
excerpt: "OpenClaw 세팅기를 올린 다음날 Claude Computer Use가 나왔다. 타이밍이 소름이다. 2026년 AI 개인비서 전쟁이 본격적으로 시작됐다."
image: "/assets/images/posts/claude-computer-use-ai-assistant-war/hero.png"
---

![Claude Computer Use](/assets/images/posts/claude-computer-use-ai-assistant-war/hero.png)

어제 [맥미니 하나로 AI 개인비서 만들었다](/2026/03/24/mac-mini-openclaw-personal-assistant/) 글을 올렸다. OpenClaw 세팅기. 나름 고생해서 쓴 글이다.

자고 일어났더니 세상이 바뀌어 있었다.

## 타이밍이 소름이다

3월 24일. OpenClaw 세팅기 포스팅을 올렸다.
3월 25일. Anthropic이 Claude Computer Use를 발표했다.

하루 차이다. 진짜 딱 하루.

근데 더 소름인 건 타임라인이다.

2월에 OpenAI가 OpenClaw를 인수했다. 정확히는 OpenClaw 만든 Peter Steinberger를 영입한 거다. OpenClaw는 GitHub 스타가 19만 6천 개. 주간 활성 사용자 200만. 요즘 가장 핫한 오픈소스 AI 에이전트였다.

그리고 딱 한 달 좀 지나서... Anthropic이 비슷한 기능을 들고 나왔다.

우연의 일치...라고 하기엔 너무 정확하지 않나 ㅋㅋ

뭔가 노림수가 있을 것 같다. OpenAI가 OpenClaw를 가져간 걸 보고 Anthropic이 "우리도 있다"고 빠르게 대응한 건지, 아니면 원래 준비하고 있었는데 타이밍이 맞은 건지. 아무튼 결과적으로 어제 내가 쓴 세팅기가 하루 만에 "구세대 방식"이 될 뻔했다 ㄷㄷ

## Claude Computer Use가 뭔데

간단하게 말하면, Claude가 내 컴퓨터 화면을 보고 마우스랑 키보드를 직접 조작하는 거다.

OpenClaw는 API를 통해서 작업을 처리하는 구조다. 메일을 읽고, 캘린더에 등록하고, 텔레그램으로 보고하는 건 전부 API 호출로 한다. 화면을 볼 필요가 없다.

근데 Computer Use는 다르다. 진짜 사람처럼 화면을 보고 클릭한다.

주요 기능을 정리하면 이렇다.

- **스크린샷 캡처**: 화면에 뭐가 떠있는지 본다
- **마우스 조작**: 클릭, 드래그, 커서 이동
- **키보드 입력**: 타이핑, 단축키 사용
- **데스크톱 자동화**: 아무 앱이나 조작 가능

카카오톡도 보낼 수 있다는 데모 영상을 봤다. 카톡은 API가 없으니까 OpenClaw로는 절대 못 하는 건데, Computer Use는 그냥 화면에서 카톡 앱을 열고 메시지를 타이핑하는 거다. 이건 좀 충격적이었다.

현재 상태는 이렇다.

- 베타/리서치 프리뷰 단계
- macOS만 지원 (Windows, Linux는 아직)
- Claude Pro 또는 Max 구독자만 사용 가능
- 아직 느리고, 실수도 꽤 한다

완성형은 아니다. 느리고 에러도 잦다고 한다. 근데 "시작"이라는 게 중요하다. 이 기능이 나왔다는 것 자체가 방향을 보여주는 거니까.

## OpenClaw vs Claude Computer Use

어제까지만 해도 OpenClaw가 개인 AI 비서의 유일한 선택지 같았는데. 하루 만에 경쟁자가 생겼다.

둘의 차이를 정리해보면 이렇다.

**OpenClaw**
- 오픈소스 (GitHub 스타 19.6만)
- Windows, macOS, Linux 전부 지원
- 모델 비종속 (Claude, GPT, 로컬 모델 다 됨)
- 24시간 백그라운드 데몬으로 돌아감
- API 기반이라 화면 조작은 못 함
- 커뮤니티 기반 확장

**Claude Computer Use**
- Anthropic 퍼스트파티 기능
- macOS만 지원 (현재)
- Claude 모델 전용
- 세션 기반 (계속 돌아가는 건 아님)
- 화면을 보고 마우스/키보드 직접 조작
- 권한 요청 후 실행 (안전장치)

재밌는 건, 둘 다 아직 완성형이 아니라는 거다.

OpenClaw는 API로만 작동하니까 화면 조작이 안 된다. Computer Use는 화면 조작은 되는데 아직 느리고 불안정하다. 어느 쪽이든 아직 "완벽한 개인비서"는 아니다.

근데 방향은 똑같다. AI가 내 컴퓨터에서 일을 대신 해주는 것. 접근 방식만 다를 뿐이다.

## 2026년은 AI 개인비서 전쟁의 해

이번 일을 보면서 확신이 생겼다. 2026년은 AI 개인비서 전쟁의 해가 될 거다.

OpenAI가 OpenClaw를 인수한 거 자체가 신호다. 이 영역에 진심이라는 뜻이다. 단순히 챗봇을 넘어서, 사용자의 컴퓨터에서 직접 일을 하는 에이전트를 만들겠다는 거다.

Anthropic도 Computer Use를 발표했다. 따라가는 게 아니라 자기만의 방식으로 도전하고 있다. 화면을 보고 조작하는 건 OpenClaw보다 한 단계 더 나간 거다.

Google도 가만히 있을 리 없다. Gemini 진영에서도 비슷한 게 나올 거다. 아마 올해 안에.

내 예상으로는 2026년 안에 OpenAI, Anthropic, Google 전부 완전한 개인비서 기능을 내놓을 것 같다.

근데 걱정되는 게 있다. 젠스파크, 스카이워크 같은 회사들. 이미 비슷한 서비스를 열심히 개발하고 있던 곳들인데... 대기업이 이렇게 빠르게 치고 들어오면 어떻게 되나. 완전 직격탄이다.

[옆방에서 들리는 AI 이야기](/2026/03/16/ai-office-culture-shift/)를 쓴 지 얼마 안 됐는데. AI가 일상에 들어오는 속도가 내 예상보다 훨씬 빠르다.

## 그래서 나는

일단 OpenClaw 세팅은 그대로 유지한다. 어제 고생해서 세팅했는데 바로 버릴 수는 없지 ㅋㅋ 그리고 OpenClaw는 오픈소스라서 내 서버에서 내 맘대로 돌릴 수 있다는 장점이 있다. 이건 꽤 크다.

Computer Use도 빨리 써볼 예정이다. Pro 구독 중이니까 바로 쓸 수 있을 거다. 써보고 비교 후기를 올리겠다.

어쩌면 둘 다 같이 쓰게 될 수도 있다. OpenClaw는 24시간 백그라운드에서 배치 작업 돌리고, Computer Use는 필요할 때 화면 조작이 필요한 작업에 쓰고. 역할 분담이 되는 거다.

---

어제 세팅기 쓰면서 "이거 진짜 미래다" 했는데, 하루 만에 그 미래가 또 바뀌었다.

AI 시장의 속도가 무섭다. 어제의 최신이 오늘의 구식이 되는 세상.

...아무튼 빨리 써보고 다시 후기 올리겠다.
