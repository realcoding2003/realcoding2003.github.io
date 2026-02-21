---
layout: post
title: "Building a Kiosk with Raspberry Pi - More Pitfalls Than Expected"
date: 2025-07-20 09:00:00 +0900
categories: [Development, IoT]
tags: [Raspberry Pi, Kiosk, Chromium, Linux, IoT]
author: "Kevin Park"
lang: en
excerpt: "I built a store kiosk using a Raspberry Pi. As a web developer, hardware was a whole new world — and the unexpected pitfalls were plenty."
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /2025/07/20/raspberry-pi-kiosk-en/
---

# Building a Kiosk with Raspberry Pi

## Why Raspberry Pi?

A client asked me to build a kiosk for their store.

My first thought was a regular PC, but for a kiosk, it's expensive and takes up too much space. A Raspberry Pi is compact, cheap, and runs Linux — perfect for a web-based kiosk.

I decided to go with a Raspberry Pi + touchscreen monitor combo.

## The Basic Setup

The core concept is simple. On boot, a fullscreen browser launches automatically and displays a specific web page.

```bash
# Auto-login setup
sudo raspi-config  # Boot Options → Desktop Autologin

# Chromium kiosk mode auto-launch
# ~/.config/autostart/kiosk.desktop
[Desktop Entry]
Type=Application
Name=Kiosk
Exec=chromium-browser --kiosk --noerrdialogs --disable-infobars http://localhost:3000
```

In theory, that's it. But reality had other plans.

## The Unexpected Pitfalls

**Screen saver issue**. After some idle time, the screen goes dark. A kiosk needs to stay on 24/7, so you have to disable the screen saver, power management, and DPMS entirely. Took me over an hour just to figure this part out.

**Memory shortage**. Even with a Raspberry Pi 4 (4GB), Chromium is a memory hog. After running for a while, memory leaks made everything sluggish. I ended up adding a cron job to restart Chromium every night.

**Touchscreen calibration**. Touch positions didn't match the actual screen coordinates. You need to tweak driver settings, and it's different for every monitor.

**Network disconnection handling**. When WiFi drops, the web page won't load. I created an offline fallback page and added logic to auto-refresh when the network comes back.

**SD card lifespan**. The Raspberry Pi boots from an SD card, and heavy write operations kill it fast. I minimized logging and moved what I could to a RAM disk.

## A Web Developer's Hardware Adventure

Going from pure web development to working with hardware felt like entering a new world. In software, "just restart it" solves most things — but hardware has physical constraints.

Once you install it at the store, you need remote management. If SSH won't connect, you have to physically go there. Thinking about all these edge cases made me realize remote management tools are absolutely essential.

But honestly, this kind of problem-solving is fun. [That feeling when you're learning something new](/en/2020/03/16/developer-laziness-burnout-en/). You hit a wall, search for answers, find a solution, and feel that rush of accomplishment.

For the price of a single Raspberry Pi, the results are impressive. Next time, I might try my hand at Arduino too.
