---
layout: post
title: "Building a 3D Printer Exhaust System: I Vented the PETG Smell Out the Window"
date: 2026-11-24 10:00:00 +0900
categories: [Life, 3D Printing]
section: maker
tags: [3D Printing, Exhaust System, Bambu Lab, P2S, X2D, H3C, Exhaust Fan, PETG, Supports, Print Orientation]
author: "Kevin Park"
lang: en
slug: 3d-printer-exhaust-system
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /en/2026/11/24/3d-printer-exhaust-system-en/
  - /2026/11/24/3d-printer-exhaust-system-en/
excerpt: "I printed a lot of PETG and the smell kept circling the room, so I pulled the exhaust from three enclosed printers into a single exhaust fan on top of the shelf and vented it out the window. I swapped the official exhaust kit for a fanless one-piece hood, and I redesigned the merger adapter four times: once for misreading the layout, once for 285 g of supports, and twice more to change how the parts connect."
image: "/assets/images/posts/3d-printer-exhaust-system/hero.jpg"
---

![The finished exhaust system. Three 80 mm ducts rise to the merger adapter at the top of the shelf, with the exhaust fan and the duct to the window behind it](/assets/images/posts/3d-printer-exhaust-system/hero.jpg)

I somehow ended up with four printers.
H3C, P2S, X2D, and A2L.

![Four printers on a speed rack. H3C on the left, A2L on the top shelf, P2S and X2D on the middle shelf](/assets/images/posts/3d-printer-exhaust-system/02-printers.jpg)

With one printer, it never really bothered me.
But as the count went up, a faint acrid smell started to hang in the room.
My head felt a little foggy too.

It was milder when I only printed PLA.
Once I started printing a lot of PETG, the air got noticeably worse.

So I decided to build an exhaust system.
The idea: gather the exhaust of the three enclosed printers (H3C, P2S, X2D) into one exhaust fan and vent it out the window.
The A2L is an open-frame printer with no enclosure, so it's left out for now.
I plan to build an enclosure for it later and connect it too.

Short version: the whole thing is installed.
It took much longer than I expected, though.
I redesigned one merger adapter four times.

## What I Prepared

First, the parts list.

- **Exhaust fan (sirocco fan)**: 100 mm inlet and outlet. A friend gave it to me.
- **100 mm duct (white)**: Also from a friend. Merger adapter to exhaust fan (short), and exhaust fan to window
- **80 mm aluminum duct**: Printer to merger adapter, three runs. Three sets of [aluminum foil ducting with steel clamp bands](https://www.coupang.com/vp/products/8322535527?vendorItemId=96127339158)
- **Foamed PVC board, 5T, gray**: To close off the window. Five sheets of [Dahanjin colored foamed PVC board, A3 (297 × 420 mm, 5T), gray](https://www.coupang.com/vp/products/8727713188?vendorItemId=92072455395)
- **Hose clamps, M3 and M4 bolts and nuts**: For tightening joints, and for fixing the door frame, hinges, and latch on the board. The 80 mm clamps come with the duct sets
- **Adhesive gap seal rubber (Daiso)**: For the door edge and the gap between the hoods and the printers
- **Removable 3M double-sided tape**: To attach the board to the window frame (so it's easy to remove when I move)
- **Speed rack**: A spot for the exhaust fan at the very top. I bought [a standard storage shelf from the Speed Rack official store](https://speedrack.co.kr/product/%EC%8A%A4%ED%94%BC%EB%93%9C%EB%9E%99-%EC%9D%BC%EB%B0%98-%EC%88%98%EB%82%A9%EC%84%A0%EB%B0%98/99/category/146/display/1/) on a Black Friday deal
- **Hinges**: For the door in the window board. Bought at Daiso, but any hinge will do

![The exhaust fan on top of the shelf. The round collar is the 100 mm inlet](/assets/images/posts/3d-printer-exhaust-system/03-blower.jpg)

I ordered this speed rack separately from the one I used for the [AMS sliding storage](/en/2026/11/09/ams2-pro-sliding-speedrack-underrail/).
I rearranged the shelves so the exhaust fan sits right in the middle above the printers.

## Overall Layout

This is the path the air takes.

- A **hood** on the back of each printer
- 80 mm aluminum ducts run up behind the shelf
- A **3-to-1 merger adapter** at the top of the shelf combines them into one
- A short 100 mm duct feeds the **exhaust fan**
- Another 100 mm duct runs from the exhaust fan outlet to the **window**

![Layout diagram. The exhaust fan sits in the middle at the top of the shelf, and the merger adapter straddles the rear edge of the top board](/assets/images/posts/3d-printer-exhaust-system/01-layout.jpg)

The diagram is a rough sketch I used while designing, so the dimensions differ slightly from the real thing.

Among the printed parts, I **designed the P2S and X2D hoods and the upper merger adapter myself**.
The H3C hood is Bambu Lab's official file, and the window vent is a public model that I modified.

The exhaust fan sits at the center of the top shelf.
The 100 mm inlet faces left, and the outlet faces back toward the window.

The side from the printers to the exhaust fan is under negative pressure, since it's the suction side.
Even if a joint leaks a little, the smell doesn't leak into the room.
That's a surprisingly reassuring point.

Every part is printed in PETG.
The exhaust air can get warm, so I went with something more heat resistant than PLA.

## The H3C Uses the Official Hood, and Here's the Install Since There's Almost No Info

The H3C is new enough that there's almost nothing online about installing an exhaust vent.
So I'll write that part down first.

1. Take the **longest hex key** out of the toolbox.
2. Remove the **three screws** on the back of the printer.
3. Print the hood that Bambu Lab officially distributes and fix it with those screws.

![The H3C toolbox. The long piece at the lower right is the longest hex key](/assets/images/posts/3d-printer-exhaust-system/04-h3c-toolbox.jpg)

![Fixing the hood to the rear screws with that hex key](/assets/images/posts/3d-printer-exhaust-system/05-h3c-screws.jpg)

Bambu Lab put those three screws there in advance for the hood.
Nothing falls out when you remove them.
Loosen the screws, hold the hood in place, tighten them again, and you're done.

![The official hood on the back of the H3C, with the 80 mm duct](/assets/images/posts/3d-printer-exhaust-system/06-h3c-hood.jpg)

This official hood is actually the very part I printed in [my last post about dual-material supports](/en/2026/11/22/h3c-petg-pla-support-interface/).
Bambu Lab's file is named "E1 Air Purifier Hose Adapter" (H3C profile).
It's the model with a PLA contact layer under a PETG body, where the supports just peeled away.
I connected the 80 mm duct to it.

## I Designed the P2S and X2D Hoods Myself: No Fan, One Piece

For the P2S, Bambu Lab has an official exhaust kit on MakerWorld.
But it mounts a 120 mm fan in the middle.
It has 16 parts, including the fan housing, frame, funnel, and even small clips.

In my setup, one exhaust fan pulls from everywhere, so each printer doesn't need its own fan.
I searched MakerWorld for a while and couldn't find a hood that fit this situation.
So I just made one.
No fan slot, no box, no clips, and a single piece that goes straight from the printer to the duct.

I kept exactly one thing from the official kit:
the **six claws** that hook onto the printer's back panel.
If they're off, the hood won't seat, so I copied the claw shape as is and attached it.
The rest narrows from the flange into a 45-degree funnel and ends in an 80 mm spigot.

![The printed P2S/X2D hood. The wide face at the top is the flange that meets the printer, and the 80 mm spigot is at the bottom](/assets/images/posts/3d-printer-exhaust-system/07-hood.jpg)

On the P2S, peel off the sticker under the rear buffer, line up the claws, and slide the hood left. It clicks into place.

![The back of the P2S. The perforated spot with the sticker under the buffer is the exhaust port](/assets/images/posts/3d-printer-exhaust-system/08-p2s-rear.jpg)

The X2D comes with an external exhaust fan.
I used to attach the official connector on top of that fan,
but the joint was weak and kept coming off.
This time I printed the same hood as the P2S,
removed the existing exhaust fan, and mounted the hood in its place.

Once it was on, though, the contact area between the hood and the printer was looser than I expected.
So I stuck the adhesive gap seal rubber, the same kind I used on the window door, on the hood face that touches the printer.
Both the P2S and the X2D.
That closed the gap properly.

![Applying gap seal rubber around the hood flange](/assets/images/posts/3d-printer-exhaust-system/09-hood-seal.jpg)

![The hood mounted on the back of the P2S](/assets/images/posts/3d-printer-exhaust-system/10-p2s-hood.jpg)

![The X2D. I removed the stock exhaust fan, mounted the same hood, and connected the 80 mm duct](/assets/images/posts/3d-printer-exhaust-system/11-x2d-hood.jpg)

## I Printed the Hood Upside Down

I first tried printing it upright, with the end of the duct spigot on the bed.
But the supports under the claw hooks climbed all the way up from the bed, and the prime tower stacked up to 120 mm at the top. Ugh.
So I flipped it and printed it with the claws on the bed.
The faces where the supports touch are PLA, so they peel off easily ([my last post on dual-material supports](/en/2026/11/22/h3c-petg-pla-support-interface/)), the tower ends at 4 mm, and the print time dropped by 27 minutes.

![Upright, the claws are at the top and the prime tower rises to 120 mm. Flipped, it ends at 4 mm](/assets/images/posts/3d-printer-exhaust-system/tower-compare.jpg)

## I Redesigned the Merger Adapter Four Times

This took the longest of anything in the project.

**First, I misread the layout.**
I thought the exhaust fan inlet was at the right end of the shelf,
so I made an adapter that hangs off the side of the shelf with three inlets pointing down.
I'd even finished the review, and then...
the moment I looked at the layout diagram, I realized the intake was on the wrong side.
The exhaust fan is in the middle of the top board, and the inlet is on the left.
I should have checked it against a drawing from the start.

**Second, one L-shaped piece.**
It comes out of the collar in an L, rests on the rear edge of the top board, and the three inlets drop down behind the shelf.
The shape was right.
But the base that sits on the top board (115 × 175 mm) becomes a plate floating 80 mm in the air in the print orientation.
285 g of supports and 19 hours of printing.
That wasn't going to work.

**Third, two pieces.**
I cut it exactly at the line of the top board's rear edge.
The collector with the inlets prints with the inlets on the bed,
and the channel over the top board prints with its flat base on the bed.
Zero supports for both.
Mate the joint rims and tighten with eight M3 bolts, and it's done.

**Fourth, a short duct instead of a direct connection.**
The original design pushed a sleeve straight onto the exhaust fan collar.
That meant matching the collar position to the millimeter.
Joining them with a short duct removes that worry and also transmits less exhaust fan vibration.
In place of the sleeve on the channel wall, I only needed to add a 100 mm spigot plate that uses the same screw positions.

![The two merger adapter pieces before bolting. On the left, the channel with the black 100 mm spigot plate; on the right, the collector](/assets/images/posts/3d-printer-exhaust-system/12-merger-parts.jpg)

![Placed on the top board. The exhaust fan collar and the channel are joined by a short duct](/assets/images/posts/3d-printer-exhaust-system/13-merger-installed.jpg)

![Three 80 mm ducts rising behind the shelf](/assets/images/posts/3d-printer-exhaust-system/14-ducts-up.jpg)

## I Closed the Whole Window With 5T Foamed PVC

The office window opens outward at a slight angle.
Leaving it open is too cold, and bugs get in.
And I can't leave it open all the time anyway.

I thought about blocking everything except the vent opening,
but the window structure is awkward, and that wasn't easy either.

So I **covered the entire window with 5T foamed PVC board** and cut the vent into it.
I joined five A3 gray sheets with super glue.
The perimeter is attached to the window frame with **removable 3M double-sided tape**, so it comes off cleanly when I move.

But sealing the window completely would be a problem.
I need to open and close it, and ventilate sometimes.
So I made a door in the board.
I bought hinges at Daiso and mounted them (any hinge works), and it's a bit crude.
I also rigged up a latch to lock the door, a rough one.
The door frame, hinges, and latch are fixed with M3 bolts and nuts.
I stuck adhesive gap seal rubber from Daiso along the door edge to stop air leaks.
It still opens and closes without any trouble.

![The door in the window board, closed](/assets/images/posts/3d-printer-exhaust-system/18-window-door-closed.jpg)

![Open. The original window handle is visible](/assets/images/posts/3d-printer-exhaust-system/19-window-door-open.jpg)

For the vent, I referred to RandomKhaos's model on MakerWorld.
The original attaches and detaches with magnets.
I had no reason to detach it, so I dropped the magnets and made it one piece.

The inner side is a flange and 100 mm spigot in one piece, and the outer side is a ring.
They clamp the board between them with four M4 bolts.
The outer ring has hex nut recesses, so I only need to turn a screwdriver from inside.

I drew the hole in the board by tracing the outer ring, then cut it out.
The ring works as a template, which made it easy.

![Tracing the hole position on the board with the outer ring](/assets/images/posts/3d-printer-exhaust-system/15-window-template.jpg)

![After cutting the hole, test-fitting the indoor piece (flange + 100 mm spigot)](/assets/images/posts/3d-printer-exhaust-system/16-window-port.jpg)

![The outer ring seen from the other side, tightened with four M4 bolts](/assets/images/posts/3d-printer-exhaust-system/17-window-port-ring.jpg)

Last is the white 100 mm duct.
I connected it to the vent at the top of the window first,

![The white duct connected to the window vent first. The exhaust fan end isn't connected yet](/assets/images/posts/3d-printer-exhaust-system/20-window-duct.jpg)

then routed the other end under the ceiling to the exhaust fan outlet.

![The duct running from the exhaust fan along the ceiling to the window vent](/assets/images/posts/3d-printer-exhaust-system/21-window-final.jpg)

## How It Looks Finished

The exhaust fan and the merger adapter sit side by side at the top of the shelf.

![The exhaust fan at the top of the shelf. The merger adapter is visible beyond the short white duct](/assets/images/posts/3d-printer-exhaust-system/22-blower-final.jpg)

The three 80 mm ducts from the merger adapter run down along the shelf posts to the back of each printer.

![80 mm ducts running down along the shelf posts](/assets/images/posts/3d-printer-exhaust-system/23-ducts-down.jpg)

## Takeaways

- Check the layout against a drawing from the start. I traded it back and forth in words only and had to redo a big piece.
- Print orientation decides both the supports and the prime tower. Cutting supports can make the tower bigger.
- You can adapt an official kit to your own situation. Dropping the fan and clips made everything much easier.

Some things are still open.
I want to watch a bit longer to see whether removing the X2D's external fan causes any firmware issues.

And I plan to build an enclosure for the A2L and connect it to this exhaust.
That means adding one more inlet to the merger adapter.
A fifth redesign, probably.

If you've built a similar exhaust setup, let me know in the comments.

The merge adapter and window port (plus fit-test rings) are [on MakerWorld](https://makerworld.com/models/3678886).
The P2S/X2D hood is not included because it uses the clip geometry from Bambu Lab's official kit.

I also put the whole install into a video.
Hours of installation footage, cut down into short clips.
The narration is in Korean, with English dubbing and subtitles (plus five more languages).

<div style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1.5rem auto;">
  <iframe src="https://www.youtube.com/embed/vhXm8nz6GXE?cc_lang_pref=en&cc_load_policy=1" title="3D Printer Exhaust | PETG Odors Out the Window (3 Printers, 1 Fan)" style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>
</div>

Or watch the short version.

<div style="position: relative; width: 100%; max-width: 360px; aspect-ratio: 9 / 16; margin: 1.5rem auto;">
  <iframe src="https://www.youtube.com/embed/LjdKEq_2nqs?cc_lang_pref=en&cc_load_policy=1" title="3D Printer Exhaust: Venting PETG Odors Out the Window" style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>
</div>

- YouTube video: [3D Printer Exhaust | PETG Odors Out the Window (3 Printers, 1 Fan)](https://www.youtube.com/watch?v=vhXm8nz6GXE)
- YouTube Shorts: [3D Printer Exhaust: Venting PETG Odors Out the Window](https://www.youtube.com/shorts/LjdKEq_2nqs)

## Print info

| Print | Qty | Layer height | Time (est.) | Filament (est.) |
|---|---|---|---|---|
| Printer hood (shared by P2S and X2D) | 2 | 0.20 mm | 3 h 3 min × 2 | 106.2 g × 2 |
| Merger adapter collector | 1 | 0.20 mm | 8 h 50 min | 359.2 g |
| Merger adapter channel | 1 | 0.20 mm | 4 h 50 min | 213.4 g |
| 100 mm spigot plate | 1 | 0.20 mm | 1 h 17 min | 48.2 g |
| Window vent (indoor piece + outer ring) | 1 set | 0.20 mm | 1 h 57 min | 80.5 g |
| Total | 6 | | 23 h 0 min | 913.7 g |

- Printer: Bambu Lab H3C settings (0.4 mm nozzle). The merger adapter collector needs a 300 mm plate, so it has to be printed on the H3C or A2L.
- Filament: Bambu PETG Basic. PLA Basic only for the hood's support contact layer.
- Time and filament weight are Bambu Studio slicer estimates. The hood figures include 5.6 g of supports and the prime tower. The claw fit-test piece is left out of the table.

## Sources

- P2S/X2D hood: Own design (only the claw shape that hooks onto the printer is taken from Bambu Lab's P2S Exhaust Fan Kit (X2D Pipe Connector))
- Merger adapter and 100 mm spigot plate: Own design
- H3C hood: Bambu Lab (E1 Air Purifier Hose Adapter, H3C profile)
- Window vent: RandomKhaos (Generic Magnetic Hose Adapter), redesigned to bolt together from both sides without magnets
