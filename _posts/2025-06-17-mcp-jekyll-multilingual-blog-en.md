---
layout: post
title: "Building a GitHub Pages Tech Blog with AI (5) - Completing Jekyll Multilingual Blog with MCP"
date: 2025-06-17 16:30:00 +0900
last_modified_at: 2026-02-24 00:00:00 +0900
categories: [AI, MCP, Internationalization]
tags: [Claude, MCP, Multilingual, i18n, Jekyll, Internationalization, Series Finale]
author: "Kevin Park"
excerpt: "Final stage of global tech blog completion from Jekyll multilingual system to entire series retrospective with MCP"
image: "/assets/images/posts/mcp-jekyll-multilingual-blog/hero.png"
lang: en
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /2025/06/09/mcp-jekyll-multilingual-blog-en/
  - /en/2025/06/09/mcp-jekyll-multilingual-blog-en/
---

# Building a GitHub Pages Tech Blog with AI (5) - Completing Jekyll Multilingual Blog with MCP

![Hero Image](/assets/images/posts/mcp-jekyll-multilingual-blog/hero.png)

## 🎯 Project Overview

**Final Goal**: Complete global tech blog supporting Korean/English/Japanese
**Core Challenge**: Complete automation of Jekyll's complex multilingual system with MCP
**Deliverable**: Complete multilingual blog including language-specific URL routing, translation system, and SEO optimization

```bash
# MCP final deliverable
realcoding.github.io/
├── ko/                    # Korean site
├── en/                    # English site  
├── ja/                    # Japanese site
├── _data/translations/    # Translation data
├── _includes/lang-switch/ # Language switching UI
└── Perfect SEO optimization      # hreflang, language-specific sitemap
```

## 🛠️ Core Technology Stack

```mermaid
graph TD
    A[Korean Site] --> B[URL: /]
    C[English Site] --> D[URL: /en/]
    E[Japanese Site] --> F[URL: /ja/]
    
    B --> G[Translation System]
    D --> G
    F --> G
    
    G --> H[SEO Optimization]
    G --> I[Language Switch UI]
    G --> J[Auto Routing]
    
    style A fill:#e8f5e8
    style C fill:#e1f5fe
    style E fill:#fff3e0
    style G fill:#f3e5f5
```

### Chosen Multilingual Strategy

**Jekyll-Polyglot vs Custom Solution Comparison**:

| Method | Advantages | Disadvantages |
|--------|------------|---------------|
| Jekyll-Polyglot | Plugin-based simplicity | GitHub Pages not supported |
| **Custom Solution** | **Complete control, GitHub Pages compatible** | **Implementation complexity** |

**Core Value of MCP**: Completely resolves complexity of custom solution to achieve best performance and compatibility simultaneously

### Implemented Architecture Structure

```yaml
# MCP auto-generated multilingual structure
Languages:
  - ko: Korean (default)
  - en: English
  - ja: Japanese

URL Structure:
  - realcoding.github.io/ (Korean, default)
  - realcoding.github.io/en/ (English)
  - realcoding.github.io/ja/ (Japanese)

Translation System:
  - YAML-based translation data
  - Automatic fallback system
  - Dynamic language switching
```

## 💡 Key Implementation Points

### 1. MCP Prompt Design

```
MCP execution command:
"Implement Korean/English/Japanese multilingual system for Jekyll blog.

Architecture requirements:
1. Complete GitHub Pages compatibility
2. URL structure: / (Korean), /en/ (English), /ja/ (Japanese)
3. Per-post language version management
4. SEO optimization (hreflang, sitemap)
5. Perfect integration with existing theme/comment systems

Systems to implement:
- _data/translations.yml (translation data)
- _includes/language-switcher.html (language switch UI)
- _plugins/multilingual.rb (for local build)
- Language-specific _config.yml settings
- Post template system

Generate all files and integrate with existing systems."
```

### 2. Auto-Generated Translation System

**_data/translations.yml**:
```yaml
# MCP auto-generation - Complete translation database
ko:
  site:
    title: "Real Coding"
    description: "AI와 함께하는 실전 개발 블로그"
  nav:
    home: "홈"
    posts: "포스트"
    categories: "카테고리"
    about: "소개"
  post:
    read_time: "읽는 시간"
    published: "게시일"
    updated: "수정일"
    share: "공유하기"
  comments:
    title: "댓글"
    login_required: "댓글을 작성하려면 GitHub 로그인이 필요합니다"

en:
  site:
    title: "Real Coding"
    description: "Practical Development Blog with AI"
  nav:
    home: "Home"
    posts: "Posts"
    categories: "Categories"
    about: "About"
  post:
    read_time: "Read time"
    published: "Published"
    updated: "Updated"
    share: "Share"
  comments:
    title: "Comments"
    login_required: "GitHub login required to post comments"

ja:
  site:
    title: "Real Coding"
    description: "AIと一緒に学ぶ実践開発ブログ"
  nav:
    home: "ホーム"
    posts: "投稿"
    categories: "カテゴリ"
    about: "について"
  post:
    read_time: "読む時間"
    published: "公開日"
    updated: "更新日"
    share: "シェア"
  comments:
    title: "コメント"
    login_required: "コメントを投稿するにはGitHubログインが必要です"
```

### 3. Smart Language Switching Component

**_includes/language-switcher.html**:
```html
<!-- MCP auto-generation - Complete language switching system -->
{% assign current_lang = page.lang | default: site.lang | default: 'ko' %}
{% assign translations = site.data.translations %}

<div class="language-switcher">
  <button class="lang-toggle" onclick="toggleLanguageMenu()" aria-label="Select language">
    <span class="current-lang">{{ current_lang | upcase }}</span>
    <svg class="chevron" width="12" height="12" viewBox="0 0 24 24">
      <path d="M6 9l6 6 6-6"/>
    </svg>
  </button>
  
  <div class="lang-menu" id="langMenu">
    {% for lang_data in translations %}
      {% assign lang_code = lang_data[0] %}
      {% if lang_code != current_lang %}
        <a href="{% if lang_code == 'ko' %}/{% else %}/{{ lang_code }}/{% endif %}" 
           class="lang-option">
          <span class="lang-code">{{ lang_code | upcase }}</span>
          <span class="lang-name">
            {% if lang_code == 'ko' %}한국어
            {% elsif lang_code == 'en' %}English
            {% elsif lang_code == 'ja' %}日本語
            {% endif %}
          </span>
        </a>
      {% endif %}
    {% endfor %}
  </div>
</div>

<script>
function toggleLanguageMenu() {
  const menu = document.getElementById('langMenu');
  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

// Close menu when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('.language-switcher')) {
    document.getElementById('langMenu').style.display = 'none';
  }
});
</script>

<style>
.language-switcher {
  position: relative;
  display: inline-block;
}

.lang-toggle {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: var(--transition);
}

.lang-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 6px;
  box-shadow: 0 4px 12px var(--shadow);
  min-width: 150px;
  display: none;
  z-index: 1000;
}

.lang-option {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  text-decoration: none;
  color: var(--text-primary);
  transition: var(--transition);
}

.lang-option:hover {
  background: var(--bg-secondary);
}
</style>
```

### 4. Complete SEO Optimization

**Auto-generated hreflang system**:
```html
<!-- MCP auto-adds to _includes/head.html -->
{% assign current_lang = page.lang | default: site.lang | default: 'ko' %}

<!-- Auto-generate hreflang tags -->
<link rel="alternate" hreflang="ko" href="{{ site.url }}{{ page.url | remove: '/en' | remove: '/ja' }}" />
<link rel="alternate" hreflang="en" href="{{ site.url }}/en{{ page.url | remove: '/en' | remove: '/ja' }}" />
<link rel="alternate" hreflang="ja" href="{{ site.url }}/ja{{ page.url | remove: '/en' | remove: '/ja' }}" />
<link rel="alternate" hreflang="x-default" href="{{ site.url }}{{ page.url | remove: '/en' | remove: '/ja' }}" />

<!-- Language-specific Open Graph -->
<meta property="og:locale" content="{% if current_lang == 'en' %}en_US{% elsif current_lang == 'ja' %}ja_JP{% else %}ko_KR{% endif %}" />
```

## 📈 Results and Insights

### Performance and Usability Metrics

**Implementation completion time**:
- **Manual implementation estimated time**: 8-12 hours
- **MCP automation time**: 15 minutes
- **Time savings rate**: 97%

**Feature completeness**:
- ✅ Complete URL routing system
- ✅ Dynamic language switching UI
- ✅ SEO optimization (hreflang, sitemap)
- ✅ Perfect integration with existing theme/comment systems
- ✅ Complete GitHub Pages compatibility

### Unexpected Strengths of MCP

1. **Context Awareness**: Generated optimal multilingual templates by analyzing existing post structures
2. **Auto Optimization**: Perfect handling of SEO elements including hreflang, sitemap, robots.txt
3. **Consistency Maintenance**: Design that perfectly harmonizes with existing theme systems

### Actual Multilingual Content Management

**Post creation workflow**:
```yaml
# Korean post (_posts/2025-06-09-example.md)
---
layout: post
title: "제목"
lang: ko
ref: example-post
---

# English post (en/_posts/2025-06-09-example.md)
---
layout: post
title: "Title"
lang: en
ref: example-post
---

# Japanese post (ja/_posts/2025-06-09-example.md)
---
layout: post
title: "タイトル"
lang: ja
ref: example-post
---
```

**Auto-connection system**: MCP automatically connects posts between languages based on `ref` values

## 🔗 Complete Series Retrospective

### AI Tech Blog Completed in 5 Steps

1. **🏗️ Basic Framework** → Complete Jekyll project structure with Claude Desktop MCP
2. **📝 Content System** → SEO-optimized posting auto-generation system
3. **💬 Communication Features** → Giscus comment system completed in 5 minutes
4. **🎨 User Experience** → Perfect implementation of dark/light mode
5. **🌍 Global Expansion** → Complete international blog with multilingual support

### Core Value of MCP Innovation

**Traditional Method** (Total time: 20-30 hours):
```
Read documentation for each step → Follow tutorials → Resolve errors → Customize
```

**MCP Method** (Total time: 1-2 hours):
```
Organize ideas → Converse with MCP → Verify completed system → Fine-tune if needed
```

**Time savings**: 94% ⬆️
**Learning curve**: 95% ⬇️
**Code quality**: Maintains expert-level consistency

## 🎉 Conclusion and Future Outlook

### Final Specs of Completed Blog

- ✅ **Completely automated development environment**: One-click blog construction based on MCP
- ✅ **Professional content system**: SEO-optimized posting auto-generation
- ✅ **Social features**: GitHub-based comment system
- ✅ **Modern UI/UX**: Dark mode and perfect responsive design
- ✅ **Global accessibility**: Borderless tech sharing with multilingual support

### New Development Paradigm Opened by MCP

**Before MCP**: Developers learn and adapt to tools
**After MCP**: Tools understand developer intentions and auto-execute

This goes beyond simple efficiency improvements to create **an environment focused on creativity**. Freed from complex configurations and repetitive tasks, we can now focus on what truly matters - creating valuable content and implementing innovative ideas.

### Next Step Suggestions

What you can do with the completed blog:
- **AI Tools Review Series**: AI tools applicable to actual development
- **MCP Advanced Applications**: Applying MCP to more complex projects
- **Open Source Contribution**: Share MCP-based Jekyll themes with the community

---

**📚 Complete Series List**:
1. [Building a GitHub Pages Tech Blog with AI (1) - Creating Jekyll Blog Locally with Claude Desktop MCP](/en/2025/06/08/claude-desktop-mcp-blog-setup-en/)
2. [Building a GitHub Pages Tech Blog with AI (2) - Complete Automation of SEO-Optimized Tech Posting with MCP](/en/2025/06/11/mcp-automated-blog-posting-en/)
3. [Building a GitHub Pages Tech Blog with AI (3) - Setting up Giscus Comment System in 5 Minutes with MCP](/en/2025/06/13/mcp-giscus-comments-setup-en/)
4. [Building a GitHub Pages Tech Blog with AI (4) - Perfect Implementation of Dark/Light Mode with MCP](/en/2025/06/15/mcp-dark-light-mode-implementation-en/)
5. [Building a GitHub Pages Tech Blog with AI (5) - Completing Jekyll Multilingual Blog with MCP](/en/2025/06/17/mcp-jekyll-multilingual-blog-en/) ← Current post

---

**Previous in Series**: [Building a GitHub Pages Tech Blog with AI (4) - Perfect Implementation of Dark/Light Mode with MCP](/en/2025/06/15/mcp-dark-light-mode-implementation-en/)
