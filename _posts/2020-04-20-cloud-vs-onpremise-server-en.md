---
layout: post
title: "From On-Premise to Cloud - Confessions of a Developer Who Keeps Postponing Migration"
date: 2020-04-20 09:00:00 +0900
categories: [Development, DevOps]
tags: [Server, Cloud, AWS, OnPremise, IDC, Migration]
author: "Kevin Park"
lang: en
excerpt: "New projects go to the cloud. Old ones stay on IDC servers. I keep telling myself I'll migrate them... but somehow never do."
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /2020/04/20/cloud-vs-onpremise-server-en/
---

# The Transition From On-Premise to Cloud

## Where I Am Now

My server setup is split right down the middle.

New projects go straight to the cloud (AWS and the like), while the older ones sit on physical servers I set up in a data center years ago. Moving them over isn't as simple as it sounds.

## The Servers Are Aging

The real problem is that these old servers are deteriorating.

Every time a hard drive acts up, my heart skips a beat. In that moment, I always tell myself: "This time I'm definitely migrating." But once the emergency fix is done and everything's running again, the migration plan quietly slides back to the bottom of the to-do list.

It's exactly like a diet plan. "Starting Monday." Every Monday.

## Cloud Advantages Are Clear

Having used the cloud for new projects, the benefits are undeniable:

- No hardware worries
- Flexible scaling
- Automatic backups
- Never need to physically visit a server room

With physical servers in a data center, there's always that anxiety about getting a 3 AM failure call. Cloud takes most of that stress away.

## Why I Still Haven't Migrated

It's not that I don't want to — I can't.

Migrating a live service without downtime is riskier than it sounds. Database migration, DNS changes, SSL certificates... one wrong move and the service goes down. And when it's a production service with real users, you can't just say "we'll be offline for a bit."

The developer's survival instinct kicks in: "If it's running, don't touch it."

## A Realistic Plan

Migrating everything at once isn't feasible. So here's the approach:

1. All new projects go to the cloud — no exceptions
2. When an old server fails, use that as the opportunity to migrate
3. Start with low-traffic services and work up from there

Eventually everything will be in the cloud. Probably. Maybe.
