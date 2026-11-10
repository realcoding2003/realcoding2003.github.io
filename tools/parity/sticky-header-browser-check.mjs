// External Chrome verification only; imported by portal-browser-check.mjs.
export async function checkStickyHeader(browser, origin) {
 const report = {checks:0,failures:[],console:[]};
 const check = (ok,detail) => { report.checks++; if(!ok) report.failures.push(detail); };
 const post = '/2026/11/09/ams2-pro-sliding-speedrack-underrail/';
 const context = await browser.newContext({viewport:{width:360,height:844},reducedMotion:'reduce'});
 await context.route('**/*',route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
 // Record initial, non-input layout shifts. No browser metrics are claimed by self-check.
 await context.addInitScript(() => {
  window.__headerCLS = 0;
  new PerformanceObserver(list => { for(const e of list.getEntries()) if(!e.hadRecentInput) window.__headerCLS += e.value; }).observe({type:'layout-shift',buffered:true});
 });
 const page = await context.newPage();
 page.on('pageerror',e => report.console.push({path:page.url(),message:String(e)}));
 page.on('console',m => { if(m.type()==='error' && !/net::ERR_FAILED/.test(m.text())) report.console.push({path:page.url(),message:m.text()}); });
 const go = async path => { await page.goto(origin+path,{waitUntil:'load'}); await page.evaluate(() => document.fonts.ready); };
 const scroll = async y => { await page.evaluate(y => scrollTo({top:y,behavior:'instant'}),y); await page.waitForTimeout(200); };
 const visibleAnchor = async (path,width,kind,id) => {
  const result = await page.evaluate(id => {
   const target=document.getElementById(id), header=document.querySelector('.site-header').getBoundingClientRect();
   return {top:target.getBoundingClientRect().top,header:header.bottom};
  },id);
  check(result.top >= result.header-1,{kind,path,width,id,...result});
 };
 try {
  for(const width of [360,390,1440]) for(const prefix of ['','/en','/ja']) for(const suffix of ['/',post,'/maker/','/request/']) {
   const path=prefix+suffix;
   await page.setViewportSize({width,height:width===1440?1000:844}); await go(path);
   if(suffix==='/') {
    await page.waitForTimeout(500);
    const cls=await page.evaluate(() => window.__headerCLS);
    // 첫 화면 CLS: 고정폭 글꼴 교체 잡음(약 2e-5) 허용, 0.001 미만
    check(cls<0.001,{kind:'sticky-home-initial-cls',path,width,cls});
   }
   await scroll(1500);
   const result=await page.evaluate(() => {
    const header=document.querySelector('.site-header'), box=header.getBoundingClientRect(), rail=document.querySelector('.layer-rail');
    const probe=document.createElement('div'); probe.style.height='var(--site-header-h)'; header.append(probe); const expected=probe.getBoundingClientRect().height; probe.remove();
    return {top:box.top,bottom:box.bottom,height:box.height,expected,variable:getComputedStyle(document.documentElement).getPropertyValue('--site-header-h').trim(),
     overflow:document.documentElement.scrollWidth-innerWidth,
     railTop:rail && getComputedStyle(rail).display!=='none' ? rail.getBoundingClientRect().top : null};
   });
   check(result.top===0 && result.height===result.expected,{kind:'sticky-after-1500',path,width,...result});
   check(result.overflow===0 && (result.railTop===null || result.railTop>=result.bottom),{kind:'sticky-overflow-rail',path,width,...result});
   if(width<640) {
    check(await page.locator('.menu-toggle:visible').count()===0,{kind:'sticky-mobile-no-toggle',path,width});
    const nav=page.locator('.main-nav'), links=nav.locator('a');
    const rows=await nav.evaluate(n=>{
     const box=n.getBoundingClientRect(), header=document.querySelector('.site-header').getBoundingClientRect();
     const top=[...document.querySelectorAll('.site-header .wordmark,.site-header .language-nav a,.site-header .request,.site-header .theme-toggle')].map(a=>{const r=a.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,height:r.height};});
     return {top,navTop:box.top,navBottom:box.bottom,header:header.bottom,width:innerWidth,nowrap:[...n.querySelectorAll('a')].every(a=>getComputedStyle(a).whiteSpace==='nowrap')};
    });
    check(rows.nowrap && rows.navBottom<=rows.header && rows.top.every(r=>r.height>=40 && r.bottom<=rows.navTop && r.left>=0 && r.right<=rows.width),{kind:'sticky-mobile-two-rows',path,width,...rows});
    for(let i=0;i<await links.count();i++) {
     const link=links.nth(i);
     // Trial clicks exercise Playwright's visibility, enabled and hit-target checks without navigation.
     await link.click({trial:true});
     check(await link.isVisible() && await link.evaluate(n=>n.getBoundingClientRect().height>=40),{kind:'sticky-mobile-link',path,width,index:i});
    }
    if(suffix==='/maker/') {
     const current=nav.locator('[aria-current="page"] span');
     check(await current.evaluate(n=>getComputedStyle(n,'::after').transform==='matrix(1, 0, 0, 1, 0, 0)'),{kind:'sticky-mobile-current',path,width});
    }
    // Force a longer row as well as checking today's labels (the game link is conditional).
    const horizontal=await nav.evaluate(n=>{
     const copies=Array.from({length:5},()=>{const a=n.lastElementChild.cloneNode(true);a.removeAttribute('aria-current');n.append(a);return a;});
     n.scrollLeft=n.scrollWidth;
     const result={scrolled:n.scrollLeft>0,overflow:document.documentElement.scrollWidth-innerWidth,overflowX:getComputedStyle(n).overflowX,scrollbar:getComputedStyle(n).scrollbarWidth};
     copies.forEach(a=>a.remove()); n.scrollLeft=0; return result;
    });
    check(horizontal.scrolled && horizontal.overflow===0 && horizontal.overflowX==='auto' && horizontal.scrollbar==='none',{kind:'sticky-mobile-nav-scroll',path,width,...horizontal});
   }
   if(suffix===post) {
    if(width===1440) {
     const toc=await page.locator('.toc-rail nav').evaluate(n=>({top:n.getBoundingClientRect().top,header:document.querySelector('.site-header').getBoundingClientRect().bottom}));
     check(toc.top>=toc.header,{kind:'sticky-toc',path,width,...toc});
    }
    // Use the actual desktop or inline mobile TOC, not a synthetic scrollTo.
    if(width<1200) await page.locator('.toc-inline').evaluate(n=>n.open=true);
    const link=page.locator(width>=1200?'.toc-rail a':'.toc-inline a').nth(1);
    const id=decodeURIComponent((await link.getAttribute('href')).slice(1));
    await link.click(); await page.waitForTimeout(300);
    await visibleAnchor(path,width,'sticky-toc-click',id);
    if(width>=1200) check(await link.getAttribute('aria-current')==='location',{kind:'sticky-toc-current',path,width,id});
    await go(path+'#'+encodeURIComponent(id));
    await visibleAnchor(path,width,'sticky-direct-hash',id);
   }
   // Skip links must retain focus navigation and land below the pinned bar.
   await scroll(0); await page.locator('.skip-link').focus(); await page.keyboard.press('Enter');
   await page.waitForTimeout(200); await visibleAnchor(path,width,'sticky-skip-link','main');
  }
  // Non-post anchors: year headings, category groups and tag groups.
  for(const width of [360,1440]) for(const prefix of ['','/en','/ja']) for(const suffix of ['/maker/','/categories/','/tags/']) {
   const path=prefix+suffix; await page.setViewportSize({width,height:width===1440?1000:844}); await go(path);
   if(suffix==='/maker/') {
    const id=await page.locator('.year-group[id]').first().getAttribute('id');
    check(!!id,{kind:'sticky-year-anchor-present',path,width});
    if(id) { await go(path+'#'+encodeURIComponent(id)); await visibleAnchor(path,width,'sticky-year-hash',id); }
   } else {
    const link=page.locator('main a[href^="#"]').first(), href=await link.getAttribute('href');
    check(!!href,{kind:'sticky-index-anchor-present',path,width});
    if(href) { await link.click(); await page.waitForTimeout(200); await visibleAnchor(path,width,'sticky-index-anchor',decodeURIComponent(href.slice(1))); }
   }
  }
  // Always-visible rows fit even in a short landscape viewport; there is no overlay.
  for(const width of [360,390]) {
   await page.setViewportSize({width,height:320}); await go('/');
   const menu=await page.locator('.main-nav').evaluate(n=>({bottom:n.getBoundingClientRect().bottom,header:document.querySelector('.site-header').getBoundingClientRect().bottom,height:innerHeight,overflow:document.documentElement.scrollWidth-innerWidth}));
   check(menu.bottom<=menu.header && menu.header<=menu.height && menu.overflow===0 && await page.locator('.menu-toggle:visible').count()===0,{kind:'sticky-short-menu',width,...menu});
  }
  check(report.console.length===0,{kind:'sticky-console',errors:report.console});
 } finally { await context.close(); }
 return report;
}
