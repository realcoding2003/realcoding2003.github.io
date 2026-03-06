---
layout: post
title: "Set Up a Monorepo with pnpm Workspace"
date: 2026-03-03 09:00:00 +0900
categories: [Development, Tips]
tags: [pnpm, monorepo, workspace, Node.js]
author: "Kevin Park"
lang: en
excerpt: "Configure a monorepo with pnpm workspace to manage frontend, infra, and mobile projects in a single repository."
---

## Problem

Frontend, landing page, mobile apps, and infrastructure code scattered across separate repos makes dependency management painful and sharing common code difficult.

## Solution

```yaml
# pnpm-workspace.yaml
packages:
  - frontend
  - landing
  - android
  - ios
  - infra
```

```json
// Root package.json
{
  "name": "my-project",
  "private": true,
  "scripts": {
    "dev": "pnpm -F @my-project/frontend dev",
    "build": "pnpm -F @my-project/frontend build"
  }
}
```

A single `pnpm install` at the root installs dependencies for all packages. Use the `-F` (filter) flag to target specific packages.

## Key Points

- A single `pnpm-workspace.yaml` file is all you need. Unlike yarn workspaces, there's no need to configure anything in `package.json`.
- pnpm uses symlinks and content-addressable storage, saving disk space while enforcing strict dependency isolation. It's structurally better suited for monorepos than npm or yarn.
- Always set `"private": true` in the root `package.json` to prevent accidental publishing to npm.
