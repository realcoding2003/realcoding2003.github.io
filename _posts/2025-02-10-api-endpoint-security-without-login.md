---
layout: post
title: "로그인 없는 API 엔드포인트 보안 - 어디까지 막아야 하나"
date: 2025-02-10 09:00:00 +0900
categories: [Development, Security]
tags: [API, 보안, CORS, Rate Limiting, 토큰]
author: "Kevin Park"
lang: ko
excerpt: "로그인 없이 접근 가능한 API를 안전하게 보호하는 방법. CORS만으로는 부족하고, 그렇다고 인증을 강제할 수도 없는 상황에서의 현실적인 대책."
---

# 로그인 없는 API 엔드포인트 보안

## 문제 상황

로그인 기능이 없는 공개 웹사이트에서 API 엔드포인트를 보호해야 하는 상황이 생겼다.

예를 들어 회사 소개 페이지에서 문의 폼을 제출하면 API로 데이터가 전송되는데, 이 API가 외부에 그대로 노출되어 있다. 로그인이 없으니 JWT나 세션 기반 인증을 쓸 수가 없다.

그냥 놔두면? 누군가 API 주소를 알아내서 스크립트로 문의 폼을 수천 건씩 제출할 수 있다.

## CORS만으로는 부족하다

가장 먼저 떠오르는 건 CORS 설정이다.

```
Access-Control-Allow-Origin: https://mysite.com
```

이렇게 하면 다른 도메인에서 브라우저로 요청하는 건 막을 수 있다. 근데 CORS는 **브라우저 정책**이다. curl이나 Postman, 서버 사이드 스크립트에서 보내는 요청은 CORS 제한을 안 받는다.

결국 CORS는 보안 수단이 아니라 편의 수단이다. 있어야 하지만 이것만으로는 안 된다.

## 현실적인 방어 전략

여러 방법을 조합해서 써야 한다.

**1. API Key + HMAC 서명**

프론트엔드에서 요청할 때 타임스탬프와 함께 HMAC 서명을 생성해서 보낸다. 서버에서 같은 방식으로 서명을 검증한다. 키가 소스 코드에 노출되는 문제가 있지만, 난독화와 조합하면 캐주얼한 공격은 막을 수 있다.

**2. Rate Limiting**

같은 IP에서 일정 횟수 이상 요청이 오면 차단한다. API Gateway나 Nginx 레벨에서 설정할 수 있다.

```
# Nginx rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=5r/m;

location /api/contact {
    limit_req zone=api burst=2 nodelay;
}
```

문의 폼이 분당 5건 이상 필요한 경우는 없으니까 이 정도면 스크립트 공격은 막을 수 있다.

**3. CAPTCHA**

reCAPTCHA나 hCaptcha를 폼에 붙인다. 봇이 자동으로 제출하는 걸 막는 가장 확실한 방법이다. 근데 사용자 경험이 나빠지는 단점이 있다.

**4. Honeypot 필드**

폼에 CSS로 숨긴 입력 필드를 추가한다. 사람은 이 필드를 안 보니까 안 채우지만, 봇은 모든 필드를 채우려고 한다. 이 필드에 값이 있으면 봇으로 판단해서 거부한다.

```html
<input type="text" name="website" style="display:none" tabindex="-1">
```

단순하지만 의외로 효과적이다.

**5. 일회용 토큰**

페이지 로드 시 서버에서 일회용 토큰을 발급하고, API 요청 시 이 토큰을 함께 보낸다. 한 번 사용된 토큰은 폐기된다. CSRF 방어와 비슷한 원리다.

## 내가 선택한 조합

결론적으로 내가 적용한 건 이 조합이다.

1. **Rate Limiting** (기본 방어)
2. **Honeypot 필드** (봇 방어)
3. **일회용 토큰** (재사용 방지)
4. **CORS** (기본 설정)

CAPTCHA는 UX 영향이 커서 뺐다. 이 정도면 완벽하진 않지만, 로그인 없는 환경에서 현실적으로 가능한 수준의 보안은 확보된다.

100% 완벽한 보안은 없다. 결국 "공격 비용을 올려서 귀찮게 만드는" 게 핵심이다.
