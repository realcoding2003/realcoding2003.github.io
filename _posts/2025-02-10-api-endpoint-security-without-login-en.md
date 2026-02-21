---
layout: post
title: "API Endpoint Security Without Authentication - How Far Should You Go?"
date: 2025-02-10 09:00:00 +0900
categories: [Development, Security]
tags: [API, Security, CORS, Rate Limiting, Token]
author: "Kevin Park"
lang: en
excerpt: "Protecting API endpoints on public sites with no login system. CORS alone isn't enough, but you can't force authentication either. Here's the practical approach."
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /2025/02/10/api-endpoint-security-without-login-en/
---

# API Endpoint Security Without Authentication

## The Problem

I needed to secure API endpoints on a public website with no login functionality.

Example: a company info page with a contact form that submits data via API. The API is exposed to the public. No login means no JWT or session-based authentication.

Leave it unprotected? Someone discovers the API URL and scripts thousands of form submissions.

## CORS Alone Isn't Enough

The first thing that comes to mind is CORS configuration.

```
Access-Control-Allow-Origin: https://mysite.com
```

This blocks browser requests from other domains. But CORS is a **browser policy**. Requests from curl, Postman, or server-side scripts bypass CORS entirely.

CORS is a convenience mechanism, not a security mechanism. Necessary but insufficient.

## Practical Defense Strategy

You need to combine multiple approaches.

**1. API Key + HMAC Signature**

The frontend generates an HMAC signature with a timestamp for each request. The server validates it using the same method. The key is exposed in source code, but combined with obfuscation, it deters casual attacks.

**2. Rate Limiting**

Block requests from the same IP beyond a certain threshold. Configurable at the API Gateway or Nginx level.

```
# Nginx rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=5r/m;

location /api/contact {
    limit_req zone=api burst=2 nodelay;
}
```

No legitimate use case needs more than 5 contact submissions per minute. This stops scripted attacks.

**3. CAPTCHA**

Add reCAPTCHA or hCaptcha to the form. The most reliable way to block automated submissions. Downside: degrades user experience.

**4. Honeypot Fields**

Add a hidden input field via CSS. Humans can't see it and won't fill it. Bots try to fill every field. If the field has a value, reject the submission.

```html
<input type="text" name="website" style="display:none" tabindex="-1">
```

Simple but surprisingly effective.

**5. One-Time Tokens**

Issue a disposable token on page load. Include it with the API request. Discard after single use. Similar principle to CSRF protection.

## My Chosen Combination

Here's what I implemented:

1. **Rate Limiting** (baseline defense)
2. **Honeypot field** (bot defense)
3. **One-time token** (replay prevention)
4. **CORS** (standard configuration)

Skipped CAPTCHA due to UX impact. Not perfect, but achieves a realistic security level for a no-auth environment.

There's no 100% perfect security. The core strategy is raising the attack cost until it's not worth the effort.
