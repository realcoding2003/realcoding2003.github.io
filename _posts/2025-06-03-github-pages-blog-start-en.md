---
layout: post
title: "Getting Started with a Tech Blog Using GitHub Pages"
date: 2025-06-04 14:30:00 +0900
categories: [Blog, GitHub]
tags: [github-pages, jekyll, blog, getting-started]
author: "Kevin Park"
excerpt: "Learn how to create your own tech blog using GitHub Pages and Jekyll with step-by-step instructions."
lang: en
slug: github-pages-blog-start
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2025/06/03/github-pages-blog-start-en/
  - /2025/06/03/github-pages-blog-start-en/
  - /en/2025/06/04/github-pages-blog-start-en/
---

Hello! Today, we'll explore how to start a tech blog using GitHub Pages.

If you're a developer, you've probably thought about running your own tech blog at least once. GitHub Pages is an excellent service that allows you to host static websites for free.

## Why GitHub Pages?

Here are the reasons I chose GitHub Pages:

### 1. Completely Free
- Provides `username.github.io` domain at no cost
- Completely free hosting
- Automatic SSL certificate provision

### 2. Developer-Friendly
- Version control through Git
- Write posts in Markdown
- Built-in code syntax highlighting

### 3. Customization Freedom
- Theme customization through Jekyll
- Direct modification of HTML, CSS, JavaScript
- Feature extension through plugins

## Setup Process

### Step 1: Create Repository

When creating a new repository on GitHub, set the name in the format `username.github.io`.

```bash
# Example
realcoding.github.io
```

### Step 2: Jekyll Configuration

Create a `_config.yml` file and add basic settings:

```yaml
title: Real Coding Blog
description: Development know-how and technical insights learned from real work
url: "https://realcoding.github.io"
baseurl: ""

# Author information
author:
  name: Kevin Park
  email: kevin@realcoding.blog

# Build settings
markdown: kramdown
highlighter: rouge
permalink: /:year/:month/:day/:title/

# Plugins
plugins:
  - jekyll-feed
  - jekyll-sitemap
  - jekyll-seo-tag
```

### Step 3: Write Your First Post

Create a file in the `_posts` directory with the format `YYYY-MM-DD-title.md`:

```markdown
---
layout: post
title: "First Post"
date: 2025-06-04 14:30:00 +0900
categories: [Blog]
tags: [getting-started, github-pages]
---

Hello! This is my first post.

## Subheading

Write your content here.

```javascript
console.log("Hello, Blog!");
```
```

## Useful Tips

### 1. Setting Up Local Development Environment

```bash
# After installing Ruby
gem install bundler jekyll

# Create new Jekyll site
jekyll new my-blog
cd my-blog

# Run local server
bundle exec jekyll serve
```

### 2. Custom Domain Setup

GitHub Pages makes it easy to set up custom domains:

1. Create a `CNAME` file in your repository
2. Enter your desired domain (e.g., `blog.example.com`)
3. Add CNAME record in DNS settings

### 3. SEO Optimization

```yaml
# Add to _config.yml
plugins:
  - jekyll-seo-tag

# Add metadata to each post
---
title: "Post Title"
description: "Brief description of the post"
image: /assets/images/post-thumbnail.jpg
---
```

## Conclusion

Starting a blog with GitHub Pages is simpler than you might think. Since it's free yet provides powerful features, it's an optimal choice for developers.

In the next post, we'll explore Jekyll theme customization and advanced features.

If you have any questions, please leave them in the comments! 😊

---

**References:**
- [GitHub Pages Official Documentation](https://docs.github.com/pages)
- [Jekyll Official Site](https://jekyllrb.com/)
- [Markdown Guide](https://www.markdownguide.org/)
