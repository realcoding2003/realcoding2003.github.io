---
layout: post
title: "How to Get Good Code From AI - It's Not Just About Prompts"
date: 2025-03-25 09:00:00 +0900
categories: [Development, AI]
tags: [AI Coding, Prompts, Cursor, Claude, Development]
author: "Kevin Park"
lang: en
excerpt: "Sloppy instructions produce sloppy code. But good prompts alone aren't enough — your project structure matters more than you think."
---

# How to Get Good Code From AI

## It's Not Just Prompts

After over a year of using AI coding tools, I've learned something important.

Everyone says "write better prompts." But that's only half the story. Before prompts, your **project structure** needs to be solid.

AI generates code based on context. If your project is a mess, even great prompts produce messy code. In a clean project, even casual instructions yield clean code.

## Practical Tips From Real Use

**1. Keep files small.**

Stuff 500 lines into one file and AI loses context. Break files into small, focused units. The AI grasps each file's purpose and generates appropriate code.

**2. Invest in naming.**

Clear variable and function names help AI understand intent. `userProfileData` beats `data`. `calculateMonthlyRevenue` beats `process`. Better names, dramatically better results.

**3. Work in stages.**

"Build this entire app" produces garbage. "Design the DB schema first" → "Create APIs based on this schema" → "Write tests for these APIs" — breaking it into steps dramatically improves quality.

**4. Show examples.**

If existing code follows a pattern, "create it following the same pattern as this file" is the most effective instruction. AI excels at pattern replication.

**5. Specify edge cases.**

"Handle errors when this function returns null." "Handle negative input values." Explicitly mentioning edge cases produces significantly more robust code.

## Development Skills Matter More Than Ever

Ironically, using AI coding tools well requires strong development skills.

You need to judge whether AI-generated code is correct. Architecture design, code review, and test writing have become *more* important in the AI era, not less.

"AI handles everything, no need to learn coding" is floating around. Reality is the opposite. Using AI effectively requires a solid development foundation. I [wrote about developer laziness](/2020/03/16/developer-laziness-burnout-en/) — having AI doesn't mean you stop learning.

AI is a tool. A skilled carpenter with good tools creates masterpieces. A beginner with good tools does not.
