---
layout: post
title: "AWS Lightsail Revisited - It's a Completely Different Service Now"
date: 2022-06-20 09:00:00 +0900
categories: [Development, DevOps]
tags: [AWS, Lightsail, Cloud, Server, Hosting]
author: "Kevin Park"
lang: en
excerpt: "I tried Lightsail years ago and dropped it. Recently went back and it's transformed — affordable, capable, and actually integrated with the AWS ecosystem."
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /2022/06/20/aws-lightsail-review-en/
---

# AWS Lightsail Revisited — It's Completely Different Now

## I Gave Up on It Once

I tried AWS Lightsail a while back and abandoned it.

At the time, it was too limited compared to EC2. No VPC integration, clunky connections to other AWS services — it couldn't do much beyond being a basic VPS. I figured I might as well just use EC2 directly, so I dropped it.

Recently I went back for a small project, and... it's a completely different service.

## What Changed

VPC peering works now. Lightsail instances can access other AWS services like RDS and S3. Before, Lightsail felt like an isolated island. Now it fits comfortably within the AWS ecosystem.

Container services were added. You can deploy Docker containers directly on Lightsail. ECS and EKS require complex configuration — Lightsail containers are much simpler.

Managed databases are available too. MySQL or PostgreSQL, managed within Lightsail. Cheaper than RDS and simpler to set up.

## The Pricing Is Really Good

Lightsail's biggest advantage is pricing.

Plans start at $3.50/month. The cheapest tier gives you 512MB RAM and 1 vCPU — plenty for simple websites or personal projects. The $5 plan bumps it to 1GB RAM with 2TB of included transfer.

EC2 requires calculating instance costs plus EBS, data transfer, and Elastic IP separately. Lightsail is just a flat monthly fee. Predictable costs do wonders for peace of mind.

For small projects or dev environments, Lightsail makes significantly more sense than EC2.

## Can It Replace EC2?

Not in every scenario.

- Auto-scaling requirements → EC2
- Fine-grained network control → EC2
- High-traffic workloads → EC2

But Lightsail wins for:

- Small websites, blogs
- Development/test environments
- Personal projects
- Static site hosting
- Simple API servers

I [wrote about postponing server migration](/en/2020/04/20/cloud-vs-onpremise-server-en/) before. For smaller services, Lightsail would save costs and simplify management.

## What About Traditional Hosting?

With Lightsail at this price point and these specs, traditional web hosting providers must be feeling the pressure.

There's still demand for cheap shared hosting at a few dollars a month, but a $5 Lightsail instance gives you root access and full configuration control. On top of AWS infrastructure, no less — so reliability is guaranteed.

As cloud pricing keeps dropping, the hosting market's structure is going to shift significantly.
