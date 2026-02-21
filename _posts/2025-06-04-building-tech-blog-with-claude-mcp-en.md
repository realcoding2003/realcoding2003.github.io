---
layout: post
title: "Building a Complete Tech Blog with Claude Desktop + MCP: The Reality of AI Pair Programming"
date: 2025-06-04 14:30:00 +0900
categories: [AI, Development, Blog, MCP]
tags: [Claude, MCP, Jekyll, GitHub Pages, AI, PairProgramming, TechBlog, DeveloperTools, Claude Desktop]
author: Kevin Park
excerpt: "I finally completed the tech blog I'd been postponing for years in just one day with Claude Desktop + MCP Server. Markdown formatting hassles, complex configurations, maintenance burdens... All obstacles were solved through AI pair programming. Sharing my real experience."
lang: en
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /2025/06/04/building-tech-blog-with-claude-mcp-en/
---

# Building a Complete Tech Blog with Claude Desktop + MCP: The Reality of AI Pair Programming

## 🤔 Honest Confession: Years of Postponing a Tech Blog

To be honest, **I'd been thinking about creating a tech blog** for several years. Problems encountered during development, solutions I found, new technologies I learned... I thought it would be useful for me later and helpful to other developers too.

### 😅 But Why Did I Keep Postponing?

**1. The Hassle of Markdown Format**
```markdown
# How do I write titles?
## How many # should I use for subtitles?
- Should lists use - or *?
1. And how about numbered lists...
[Link](url) what was the format again?
```
It was bothersome to look up markdown syntax every time, and maintaining consistency wasn't easy either.

**2. Complex Initial Setup**
```bash
# Jekyll installation? Ruby version management?
gem install jekyll bundler
bundle init
# Which theme should I use? 
# How do I configure _config.yml?
# CSS customization?
```
Just to create one blog, there was a mountain of things to configure. I often got exhausted before even writing a single post.

**3. Continuous Updates and Maintenance**
```
- Need to add a comment system
- Google Analytics integration too
- SEO optimization also...
- I don't like the design
- Is it responsive?
```
Even after creating it once, there were too many things that needed continuous attention.

**4. The Perfectionist Trap**
```
"I should write a few basic posts first before starting"
"I wish the design was prettier..."
"The functionality seems a bit lacking..."
```
Eventually fell into infinite postponement mode with **"I'll do it properly later"**.

## 🚀 The Arrival of Claude Desktop + MCP: Game Changer

But from late 2024, I encountered the amazing combination of **Claude Desktop + MCP Server**.

### 🎯 "This Time Feels Different"

It was definitely different from existing AI tools:

```
Existing AI Tools:
"Write some code" → Copy-paste → Modify → Ask again

Claude Desktop + MCP:
"I want to build this" → Actual file creation → Immediate application → Real-time improvement → Auto deployment
```

Instead of simply providing code snippets, it felt like **a partner actually building projects together**.

### 💡 "Alright, Let's Do It Today!"

On the morning of June 4, 2025, I finally decided.

> **"Let's completely build a tech blog with Claude Desktop + MCP in one day!"**

And indeed... **I completed it in one day**. 😱

- **From Jekyll setup to deployment**
- **Writing 5 tech posts**
- **Google Analytics, AdSense integration**
- **Privacy policy page**
- **Complete responsive design**
- **Dark/light mode support**
- **Automated posting workflow**

And not by manually searching and configuring everything myself, but through **natural conversation** with Claude Desktop + MCP.

---

> **TL;DR**: I built a complete Jekyll-based tech blog using Claude Desktop + MCP Server. The hassles of markdown, complexity of configuration, maintenance burdens... All obstacles were resolved through AI pair programming. Sharing detailed real experience.

## 🛠️ Setting Up Claude Desktop + MCP Environment

### 1. Claude Desktop Installation and Configuration

```bash
# Download and install Claude Desktop
# Download macOS/Windows version from https://claude.ai/download

# Login after installation
# Anthropic account login required
```

### 2. Local MCP Server Setup

**Project Initialization**:
```bash
mkdir blog-mcp-server
cd blog-mcp-server
npm init -y
npm install @anthropic-ai/mcp-sdk
```

**MCP Server Implementation (mcp-server.js)**:
```javascript
import { Server } from '@anthropic-ai/mcp-sdk/server/index.js';
import { StdioServerTransport } from '@anthropic-ai/mcp-sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@anthropic-ai/mcp-sdk/types.js';
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

const server = new Server({
  name: 'blog-automation-server',
  version: '1.0.0',
});

// Register blog automation tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'create_blog_post',
        description: 'Creates a new blog post',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            content: { type: 'string' },
            categories: { type: 'array', items: { type: 'string' } },
            tags: { type: 'array', items: { type: 'string' } }
          }
        }
      },
      {
        name: 'auto_deploy',
        description: 'Git commit and GitHub Pages deployment',
        inputSchema: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    ]
  };
});
```

**Claude Desktop Connection Configuration (~/.claude/config.json)**:
```json
{
  "mcp": {
    "servers": {
      "blog-automation": {
        "command": "node",
        "args": ["/Users/kevinpark/blog-mcp-server/mcp-server.js"],
        "env": {
          "BLOG_PATH": "/Users/kevinpark/Documents/projects/realcoding.github.io"
        }
      }
    }
  }
}
```

## 🎯 Claude Project Configuration

### 1. Creating Dedicated Project

I created a **"RealCoding Tech Blog"** project in Claude Desktop.

**Project Settings**:
```yaml
Name: RealCoding Tech Blog Development
Description: Jekyll-based tech blog development and content management specialist AI
Purpose: Blog posting, site improvement, automation implementation
```

### 2. Custom Instructions Setup

```markdown
# 🔧 RealCoding Tech Blog AI Assistant

## Core Role
- Jekyll-based tech blog full-stack development
- Professional technical content writing
- UI/UX improvement and performance optimization
- Automation workflow construction

## Blog Information
- **Site**: RealCoding Tech Blog (realcoding.blog)
- **Author**: Kevin Park (kevinpark@okyc.kr)  
- **GitHub**: realcoding2003
- **Concept**: Sharing practical development experience and technical insights

## Work Modes
### Plan Mode (Default)
- Requirements analysis and strategy establishment
- File structure exploration and status assessment  
- Solution presentation (95%+ reliability)

### Act Mode (Execution)
- Actual file creation/modification
- Auto deployment through MCP
- Real-time result verification

## Posting Guidelines
### Structure
1. **Problem Situation** - Specific issue description
2. **Solution Process** - Step-by-step resolution methods
3. **Code Examples** - Executable code
4. **Results and Verification** - Solution result confirmation
5. **Additional Tips** - Related know-how sharing

### Style
- Title: SEO-friendly and specific
- Tone: Professional yet friendly
- Code: Include comments and explanations
- Images: Explanation-focused screenshots

## Technical Environment
- **Framework**: Jekyll + GitHub Pages
- **Styling**: CSS3 + JavaScript ES6+
- **Templating**: Liquid
- **Syntax Highlighting**: Prism.js
- **Analytics**: Google Analytics + AdSense

## Quality Standards
- ✅ Responsive Design (Mobile First)
- ✅ Web Accessibility (WCAG 2.1 AA)
- ✅ SEO Optimization (Meta tags, Structured data)
- ✅ Performance Optimization (Core Web Vitals)
- ✅ Browser Compatibility (ES6+ supporting browsers)

## Automation Workflow
1. **Content Generation**: Draft writing with artifacts
2. **Local Generation**: .md file creation with MCP
3. **Auto Deployment**: Git commit + push automation
4. **Result Verification**: GitHub Pages build status check
```

### 3. Knowledge Base Configuration

I uploaded the following files to the project:

**Core Configuration Files**:
- `_config.yml` - Jekyll configuration
- `assets/css/main.css` - Current stylesheet
- `_layouts/default.html` - Default layout
- `package.json` - Project dependencies

**Reference Documents**:
- Jekyll official documentation (PDF)
- GitHub Pages deployment guide
- Liquid template syntax guide
- Existing post samples (writing style reference)

## 🎨 Prompt-Based Skin Customization

### 1. Skin Modification Workflow

**Step-by-Step Approach**:
```
User: "Make the header design more modern"
     ↓
AI: Analyze current style in Plan Mode
     ↓  
AI: Present improvement plan (color, typography, layout)
     ↓
User: "Act" command
     ↓
AI: CSS modification + real-time application
```

**Actual Conversation Example**:
```
👤 User: The current blog header looks too plain. Can you change it to 
         something more professional and modern?

🤖 Claude: I'll analyze the current header style.

[Plan Mode Analysis Result]
- Current: Simple text logo + basic navigation
- Issues: Lack of visual impact, absence of branding elements
- Improvement plan:
  1. Gradient background + glassmorphism effect
  2. Enhanced logo typography
  3. Navigation hover animations
  4. Enhanced dark mode support

Confidence: 98%

👤 User: Great! Act

🤖 Claude: I'll update the header style.
```

### 2. Style Component System

**Using CSS Variables**:
```css
:root {
  /* Color system */
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  
  /* Typography */
  --heading-font: 'Inter', -apple-system, sans-serif;
  --mono-font: 'JetBrains Mono', 'Fira Code', monospace;
  
  /* Spacing */
  --header-height: 80px;
  --container-width: 1200px;
}

/* Modern header */
.site-header {
  background: var(--primary-gradient);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--glass-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.site-logo {
  font-family: var(--heading-font);
  font-weight: 800;
  font-size: 1.5rem;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}
```

## 🚀 Automated Blog Posting System

### 1. Artifact-Based Content Generation

**Prompt Example**:
```
👤 User: Write a tech post based on practical experience with the topic 
         "Building Development Environment with Docker Compose"

🤖 Claude: I'll write a post about building development environment with Docker Compose.

[Artifact Creation]
- Title: "Building Efficient Development Environment with Docker Compose: Practical Application Guide"
- Categories: [Docker, DevOps, Development Environment]
- Tags: [docker-compose, containerization, development, workflow]
- Content: 7000-character detailed guide
- Code Examples: 12 executable examples
```

**Generated Artifact Structure**:
```markdown
---
layout: post
title: "Building Efficient Development Environment with Docker Compose: Practical Application Guide"
date: 2025-06-04 15:30:00 +0900
categories: [Docker, DevOps, Development Environment]
tags: [docker-compose, containerization, development, workflow]
author: Kevin Park
excerpt: "A comprehensive guide to building development environments with Docker Compose based on practical experience."
---

# Building Efficient Development Environment with Docker Compose

## 🤔 Why Docker Compose?

Have you ever experienced this during development?

"It works on my machine?" 
"It doesn't work because MySQL version is different"
"Should I downgrade Node.js version?"

... [Detailed content]
```

### 2. Auto Deployment with Act Command

**Automation Commands**:
```
👤 User: Act - Publish the above post to the blog

🤖 Claude: I'll publish the post to the blog.

[MCP Tool Execution]
1. ✅ create_blog_post executed
   - Filename: 2025-06-04-docker-compose-dev-environment.md
   - Path: _posts/
   - Content: Artifact content applied

2. ✅ Git auto deployment executed
   - git add _posts/2025-06-04-docker-compose-dev-environment.md
   - git commit -m "feat: Add Docker Compose development environment guide post"
   - git push origin main

3. ✅ GitHub Pages build verification
   - Build status: Success
   - Deploy time: ~2 minutes
   - Access URL: https://realcoding.blog/docker/devops/2025/06/04/docker-compose-dev-environment/

Complete! New post successfully published. 🎉
```

### 3. Intelligent Metadata Generation

**Auto-Generated Elements**:
```yaml
# SEO optimization
title: "Building Efficient Development Environment with Docker Compose: Practical Application Guide"
description: "Practical guide to unifying team development environment and automating deployment using Docker Compose"
keywords: [docker, compose, development environment, devops, container]

# Automatic category classification
categories: [Docker, DevOps, Development Environment]
tags: [docker-compose, containerization, development, workflow, automation]

# Meta information
reading_time: "15 minutes"
word_count: 7234
code_examples: 12
difficulty: "Intermediate"

# Social media
og_title: "Complete Docker Compose Development Environment Guide"
og_description: "Docker Compose usage that can be applied immediately in practice"
og_image: "/assets/images/docker-compose-guide-thumbnail.png"
```

## 💡 Real Use Cases

### Case 1: Emergency Technical Issue Posting

**Situation**: Resolving Redis memory issue that occurred at dawn

```
👤 User: I just had a service outage due to Redis memory shortage. 
         Please organize the resolution process into a post

🤖 Claude: I'll write an emergency technical issue resolution post.

[5 minutes later]
✅ "Redis Memory Shortage Incident Response: 3 AM Server Emergency Room" post completed
✅ Real-time monitoring setup guide included  
✅ Preventive measures and alarm setup methods added
✅ Auto deployment completed

👤 User: Perfect! Now I can share it with team members.
```

### Case 2: Series Post Planning

```
👤 User: I want to plan a "Practical Git Workflow" series in 5 parts

🤖 Claude: I'll plan the Git Workflow series.

[Planning Proposal]
Part 1: "Git Flow vs GitHub Flow: Choosing the Right Strategy for Your Team"
Part 2: "Building Code Review Culture: From PR Templates to Automation" 
Part 3: "Automating Quality Management with Git Hooks"
Part 4: "Large File and Binary Management: Git LFS Practical Guide"
Part 5: "Git Troubleshooting: Common Problems and Solutions"

Expected length per part: 5000-7000 characters
Publishing cycle: Weekly (Every Tuesday)
First publication: June 10, 2025

👤 User: Great! Please write them in order starting from Part 1

🤖 Claude: I'll write Part 1...
```

## 🎯 Core Value of Project Configuration

### 1. Consistent Quality

**Before (Before project configuration)**:
- Different style posts every time
- Missing metadata
- Irregular category system

**After (After project configuration)**:
- Unified posting format
- Complete SEO optimization
- Systematic information structure

### 2. Revolutionary Work Speed

```
Existing Posting Process:
Idea → Draft writing → Markdown conversion → Image processing → 
Metadata writing → File creation → Git commit → Deployment verification
(Time required: 2-3 hours)

AI Automation Process:  
Idea → "Act" command → Complete
(Time required: 5-10 minutes)
```

### 3. Focus on Creativity

Now I can focus on **"What to write?"** instead of **"How to write?"**:

- Markdown syntax concerns ❌
- Metadata configuration ❌  
- Filename rules ❌
- Git commands ❌

Instead:
- Content helpful to readers ✅
- Sharing practical experience ✅
- Technical insights ✅
- Community contribution ✅

## 🚧 Limitations and Future Improvements

### Current Limitations

1. **Insufficient Image Automation**: No support for automatic screenshot, diagram generation
2. **Lack of SEO Analysis**: No keyword competition, search volume analysis features  
3. **Performance Monitoring**: Lack of automatic checks for page loading speed, Core Web Vitals

### Improvement Plans

**Phase 1: Image Automation**
```javascript
// Planned features
const imageAutomation = {
  screenshots: "Puppeteer-based automatic screenshots",
  diagrams: "Automatic Mermaid, PlantUML generation",
  thumbnails: "AI-based automatic thumbnail generation"
};
```

**Phase 2: SEO Intelligence**
```javascript
const seoFeatures = {
  keywordResearch: "Google Keyword Planner API integration",
  competitorAnalysis: "Top ranking post analysis",
  contentOptimization: "Readability, keyword density optimization"
};
```

**Phase 3: Analytics Automation**
```javascript
const analyticsAutomation = {
  performanceMonitoring: "Lighthouse CI integration",
  userEngagement: "Google Analytics automatic reports",
  contentPerformance: "Recommended topics based on popular posts"
};
```

## 🎉 Conclusion: Blogging in the AI Era

Building a tech blog using Claude Desktop + MCP is a **paradigm shift** beyond simple **tool usage**.

### Key Insights

1. **AI as Creative Partner**: Creative collaboration, not simple automation
2. **Complete Elimination of Entry Barriers**: Start immediately without technical complexity
3. **Quality Leveling Up**: Anyone can achieve professional-level results
4. **Sustainable Content Production**: Consistent posting without burnout

### Message to Developers

```markdown
💡 Don't postpone "I should blog later" anymore.
   With Claude Desktop + MCP, you can start right now.

🚀 What matters isn't the technology, but your experience and insights.
   Let AI handle the technical parts, focus on creativity.

🎯 Future developers won't be "people who code" but
   "people who define and solve problems".

📝 Record and share your development journey.
   Those experiences will be a great help to someone.
```

The tech blog I've been **"someday..."** postponing for years.
Now you can start **"right now!"** 🚀

With Claude Desktop + MCP, your development experience and knowledge will easily transform into valuable content.

---

## 📖 References

- **Claude Desktop**: [Official Download](https://claude.ai/download)
- **MCP SDK**: [Anthropic MCP Documentation](https://docs.anthropic.com/claude/docs/mcp)
- **Jekyll Guide**: [Jekyll Official Docs](https://jekyllrb.com/docs/)
- **GitHub Pages**: [Pages Documentation](https://pages.github.com/)
- **Project Code**: [GitHub Repository](https://github.com/realcoding2003/realcoding.github.io)

---

**💬 Please share your questions or experiences!**

If you have any experiences developing with Claude Desktop + MCP or questions, please leave them in the comments anytime. Let's build the development culture of the AI era together! 🤝

**📧 Contact**: kevinpark@okyc.kr  
**🐙 GitHub**: [realcoding2003](https://github.com/realcoding2003)  
**💼 LinkedIn**: [realcoding](https://linkedin.com/in/realcoding)