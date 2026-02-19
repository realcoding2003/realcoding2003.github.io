---
layout: post
title: "An On-Premise Developer Falls Hard for AWS"
date: 2020-09-10 09:00:00 +0900
categories: [Development, DevOps]
tags: [AWS, Cloud, EC2, S3, Lambda, Getting Started]
author: "Kevin Park"
lang: en
excerpt: "After 10+ years of physical servers in data centers, I finally dove into AWS. I thought I was late to the party, but the late start made every discovery that much more impressive."
---

# An On-Premise Developer Falls Hard for AWS

## A Late Start

I've been completely absorbed in AWS lately.

I knew I should have moved to the cloud ages ago. I even [wrote about keeping postponing the server migration](/2020/04/20/cloud-vs-onpremise-server-en/) a while back — but at the time it was still in "someday" territory.

This year I actually started getting hands-on with AWS, and... why is this so fun?

## Coming From IDC to AWS

For someone who survived 10+ years on on-premise servers, AWS was a revelation.

Spinning up an EC2 instance takes 5 minutes. Getting a server into an IDC means quotes, purchase orders, delivery, racking, OS installation... minimum 2 weeks. That gap is staggering.

Upload to S3 and it's automatically redundant. Use RDS and backups are automatic. Set up CloudWatch and monitoring takes care of itself. I was doing all of this manually the entire time.

Those days of going to the server room to replace UPS batteries suddenly feel like the Stone Age.

## Services That Hooked Me

The standouts from what I've tried so far:

**Lambda** — The concept of just uploading functions without a server didn't click at first. But once you use it, it's incredibly convenient. Simple APIs are done. No server management needed.

**S3** — I thought it was just file storage, but it does static website hosting too. Hook it up with CloudFront and you've got a CDN. And the pricing is reasonable.

**CloudFormation** — Infrastructure as code. The YAML was brutal at first, but once you get used to it, replicating server environments becomes trivial. What used to require a "can you set up another identical environment?" request is now a single file.

## Plenty of Stumbles Too

It's not all sunshine, of course.

IAM permissions had me stuck for ages. "Access Denied" everywhere, and figuring out which policy was blocking what felt like a maze. The policy concept wasn't intuitive at first.

VPC networking is another headache when things get tangled. Subnets, route tables, internet gateways, NAT gateways... the concepts are different from on-premise networking, and the adjustment took time.

And then there's billing. Misconfigure something and you're looking at a surprise bill. I once left a test instance running overnight — thankfully it was free tier so the damage was minimal, but in production that would have been a cold-sweat moment.

## What's Next

Now that I've got some real hands-on time with AWS, I want to study it more systematically.

I'm thinking about going for an AWS certification. Planning to start with the Developer Associate — apparently the prep process itself is an excellent way to learn the services properly.

I started late, but that's exactly why every discovery hits harder. Having the IDC background means I know the pain these services are solving. "Wait, you can do THIS that easily?" — that reaction keeps coming.

All those years sweating in server rooms are actually helping me understand AWS on a deeper level. Turns out no experience is truly wasted.
