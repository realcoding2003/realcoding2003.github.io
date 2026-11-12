// Called only by the orchestrator's Chrome runner, never during self-check.
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { timeAt } from '../../src/lib/motion-math.mjs';
export async function checkS5(browser, origin, out) {
 const report = { checks:0, failures:[], screenshots:[], samples:[], console:[] };
 const check = (ok, detail) => { report.checks++; if (!ok) report.failures.push(detail); };
 const directory=join(out,'s5'); await mkdir(directory,{recursive:true});
 const prefixes=['','/en','/ja'], titles={ '':['한 층씩 쌓는다.','만들고,','코딩하고,','플레이한다.'], '/en':['Layer by layer.','Make,','Code,','Play.'], '/ja':['一層ずつ積み上げる。','作って、','コードを書いて、','遊ぶ。'] };
 const firstBottom = new Map();
 async function session(options={}) {
  const ctx=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1,reducedMotion:'no-preference',...options});
  await ctx.route('**/*',route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  await ctx.addInitScript(() => {
   window.__s5CLS=0;
   new PerformanceObserver(list=>{for(const e of list.getEntries()) if(!e.hadRecentInput) window.__s5CLS+=e.value;}).observe({type:'layout-shift',buffered:true});
  });
  const page=await ctx.newPage(), requests=[];
  page.on('request',r=>{ if(/\.mp4(?:[?#]|$)/.test(r.url())) requests.push(r.url()); });
  page.on('console',m=>{ if(m.type()==='error' && !/net::ERR_FAILED/.test(m.text())) report.console.push({type:'console.error',message:m.text(),url:page.url()}); });
  page.on('pageerror',e=>report.console.push({type:'pageerror',message:String(e),url:page.url()}));
  return {ctx,page,requests};
 }
 // 2026-11-10 메인: Lenis가 진행 중인 부드러운 스크롤이 프로그램 scrollTo를 덮어쓸 수 있다 → 실제 도착할 때까지 재시도.
 const top=async(page,y)=>{ for(let i=0;i<20;i++){ await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),y); await page.waitForTimeout(150); const at=await page.evaluate(()=>scrollY); const max=await page.evaluate(()=>document.documentElement.scrollHeight-innerHeight); if(Math.abs(at-Math.min(y,max))<2) return; } };
 const bottom=async page=>top(page,await page.evaluate(()=>document.documentElement.scrollHeight-innerHeight));
 const goto=async(page,path)=>{ await page.goto(origin+path,{waitUntil:'load'}); await page.evaluate(()=>document.fonts.ready); };
 async function photo(page,name,selector) {
  const file=`s5/${name}.png`; if(selector) await page.locator(selector).screenshot({path:join(out,file)}); else await page.screenshot({path:join(out,file),fullPage:true});
  report.screenshots.push(file);
 }
 async function pscroll(page,p) {
  // Map the actual pin interval: track top minus its sticky header offset.
  if(p===0) { await top(page,0); return; }
  const y=await page.locator('[data-hero-track]').evaluate((track,p)=>track.getBoundingClientRect().top+scrollY-parseFloat(getComputedStyle(track.querySelector('[data-hero-stage]')).top)+p*(track.offsetHeight-track.querySelector('[data-hero-stage]').offsetHeight),p);
  await top(page,y);
 }
 async function settle(page) {
  let last=-1, consecutive=0, sample;
  for(let i=0;i<54;i++) {
   await page.waitForTimeout(150);
   sample=await page.locator('[data-hero] video').evaluate(v=>({time:v.currentTime,duration:v.duration,seeking:v.seeking}));
   consecutive=!sample.seeking && Math.abs(sample.time-last)<.01 ? consecutive+1 : 0;
   last=sample.time; if(consecutive>=3) return {...sample,settled:true};
  }
  return {...sample,settled:false};
 }
 async function scrub(page,points,label) {
  const samples=[];
  for(const p of points) {
   await pscroll(page,p); const s=await settle(page); samples.push({p,...s});
   const pin=await page.locator('[data-hero-stage]').evaluate(n=>({top:n.getBoundingClientRect().top,header:document.querySelector('.site-header').getBoundingClientRect().bottom,progress:Number(document.querySelector('[data-hero]').dataset.progress)}));
   check(Math.abs(pin.top-pin.header)<=1 && Math.abs(pin.progress-p)<=.002,{kind:'hero-header-pin',label,p,...pin});
   check(s.settled && Math.abs(s.time-timeAt(p,s.duration))<=.15,{kind:'scrub-target',label,p,...s,target:timeAt(p,s.duration)});
   if(p===0) check(s.time<=.05,{kind:'scrub-zero',label,...s});
   if(p===1) check(s.time>=.95*s.duration,{kind:'scrub-end',label,...s});
  }
  for(let i=1;i<samples.length;i++) {
   const a=samples[i-1],b=samples[i];
   if(a.p!==b.p) check(b.p>a.p ? b.time>a.time : b.time<a.time,{kind:'scrub-monotonic',label,from:a,to:b});
  }
  report.samples.push({label,samples});
 }
 async function overflow(page,label) {
  const v=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
  check(v.width===v.scrollWidth,{kind:'s5-overflow',label,...v});
 }
 async function visibleTarget(page,selector) {
  const y=await page.locator(selector).evaluate(el=>el.getBoundingClientRect().top+scrollY-40);
  await top(page,y); await page.waitForTimeout(800);
 }
 async function ambient(page,selector) {
  return page.locator(selector).first().evaluate(el=>({state:el.dataset.ambientState,paused:el.querySelector('video')?.paused ?? true,poster:getComputedStyle(el.querySelector('picture') || el.querySelector('img')).opacity}));
 }
 async function staticChecks(page,requests,label,reason='reduced-motion',hasJs=true) {
  await page.waitForTimeout(300);
  const s=await page.locator('[data-hero]').evaluate(el=>{
   const stage=el.querySelector('[data-hero-stage]');
   return {mode:document.documentElement.dataset.motion,reason:document.documentElement.dataset.motionReason,position:getComputedStyle(stage).position,height:stage.getBoundingClientRect().height,
    expected:Math.min(Math.max(innerHeight-document.querySelector('.site-header').getBoundingClientRect().height,innerWidth<640?480:544),992),
    top:stage.getBoundingClientRect().top,header:document.querySelector('.site-header').getBoundingClientRect().bottom,
    chapters:[...el.querySelectorAll('.hero-chapter')].slice(1).map(n=>getComputedStyle(n).display),
    bottom:el.querySelector('h1').getBoundingClientRect().bottom,poster:getComputedStyle(el.querySelector('.hero-poster img')).opacity};
  });
  if(hasJs) check(s.mode==='static' && s.reason===reason,{kind:'static-gate',label,...s});
  else check(!s.mode,{kind:'nojs-gate',label,...s});
  check(s.position!=='sticky' && s.top>=s.header-1 && Math.abs(s.height-s.expected)<=2 && s.chapters.every(v=>v==='none') && s.poster==='1',{kind:'static-layout',label,...s});
  if(firstBottom.has(label)) check(Math.abs(firstBottom.get(label)-s.bottom)<=2,{kind:'hero-first-position',label,full:firstBottom.get(label),static:s.bottom});
  await bottom(page); await page.waitForTimeout(350);
  check(requests.length===0 && await page.locator('video').count()===0 && !await page.locator('html').evaluate(n=>n.classList.contains('lenis')),{kind:'static-no-motion',label,requests});
  check(await page.locator('[data-reveal]').evaluateAll(nodes=>nodes.every(n=>getComputedStyle(n).opacity==='1')),{kind:'static-reveal',label});
  if(hasJs && await page.locator('[data-layer-rail]').isVisible()) {
   check(await page.locator('[data-rail-layer]').textContent()==='L 240' && await page.locator('[data-rail-z]').textContent()==='Z 48.00',{kind:'static-rail',label});
  }
  return s;
 }
 // A: full desktop, all language versions.
 for(const prefix of prefixes) {
  const {ctx,page,requests}=await session();
  try {
   await goto(page,prefix+'/'); await page.waitForTimeout(3000);
   check(await page.evaluate(()=>window.__s5CLS)<0.001,{kind:'full-home-initial-cls',prefix});
   firstBottom.set(`${prefix}:1440`,await page.locator('#hero-title').evaluate(n=>n.getBoundingClientRect().bottom));
   check(await page.locator('html').getAttribute('data-motion')==='full' && requests.length===0 && await page.locator('[data-hero]').getAttribute('data-video-state')==='idle',{kind:'initial-idle',prefix,requests});
   check(await page.locator('html').evaluate(n=>n.classList.contains('lenis')),{kind:'home-lenis',prefix});
   await overflow(page,`full:${prefix}:1440`);
   await page.mouse.wheel(0,120);
   await page.waitForFunction(()=>['ready','painted'].includes(document.querySelector('[data-hero]').dataset.videoState),null,{timeout:20000});
   check(requests.filter(u=>u.endsWith('/hero-desktop.mp4')).length===1 && !requests.some(u=>u.endsWith('/hero-mobile.mp4')),{kind:'desktop-source',prefix,requests});
   await scrub(page,[0,.25,.5,.75,1,.75,.5,.25,0],`desktop:${prefix}`);
   check(await page.locator('[data-hero]').getAttribute('data-video-state')==='painted',{kind:'rewind-painted',prefix});
   for(const [i,p] of [.1,.3,.6,.9].entries()) {
    await pscroll(page,p); await page.waitForTimeout(350);
    const chapters=await page.locator('.hero-chapter').evaluateAll(nodes=>nodes.map(n=>({chapter:n.dataset.chapter,active:n.hasAttribute('data-active'),opacity:getComputedStyle(n).opacity,title:n.querySelector('h1,.chapter-title').textContent})));
    check(await page.locator('[data-hero]').getAttribute('data-chapter')===String(i+1) && chapters.every((c,j)=>c.active===(j===i) && c.opacity===(j===i?'1':'0')) && chapters[i].title===titles[prefix][i],{kind:'chapter',prefix,p,chapters});
   }
   await pscroll(page,.5);
   const pin=await page.locator('[data-hero-stage]').evaluate(n=>({top:n.getBoundingClientRect().top,header:document.querySelector('.site-header').getBoundingClientRect().bottom})); check(Math.abs(pin.top-pin.header)<=1,{kind:'sticky',prefix,...pin});
   const end=await page.locator('[data-hero-track]').evaluate(n=>n.getBoundingClientRect().bottom+scrollY+innerHeight*.5); await top(page,end);
   check(await page.locator('[data-hero-stage]').evaluate(n=>n.getBoundingClientRect().top)<-100,{kind:'sticky-release',prefix});
   if(prefix==='') for(const p of [0,.3,.6,.9,1]) { await pscroll(page,p); await settle(page); await photo(page,`hero-ko-1440-${p}`,'[data-hero-stage]'); }
   await page.mouse.move(0,0); await visibleTarget(page,'.realms');
   await page.waitForFunction(()=>document.querySelector('[data-ambient-group=realms]').dataset.ambientState==='playing',null,{timeout:20000});
   const initial=await page.locator('[data-ambient-group=realms]').evaluateAll(nodes=>nodes.map(n=>({state:n.dataset.ambientState,paused:n.querySelector('video')?.paused ?? true,src:n.dataset.srcDesktop})));
   check(initial[0].state==='playing' && !initial[0].paused && initial.slice(1).every(s=>s.paused) && requests.filter(u=>/realm-.*\.mp4$/.test(u)).every(u=>u.endsWith('realm-ai-desktop.mp4')),{kind:'ambient-default',prefix,initial,requests});
   if(prefix==='') await photo(page,'realms-ai','.realms');
   const dev=page.locator('.slice').filter({has:page.locator('a.slice-link[href$="/dev/"]')}); await dev.hover(); await page.waitForTimeout(500);
   const devMedia=dev.locator('[data-ambient]');
   await page.waitForFunction(()=>document.querySelector('[data-src-desktop$="realm-dev-desktop.mp4"]').dataset.ambientState==='playing',null,{timeout:20000});
   const maker=await ambient(page,'[data-ambient-group=realms]'), development=await ambient(page,'[data-src-desktop$="realm-dev-desktop.mp4"]');
   check(development.state==='playing' && !development.paused && maker.state==='paused' && maker.paused && maker.poster==='1',{kind:'ambient-hover',prefix,maker,development});
   if(prefix==='') await photo(page,'realms-dev','.realms');
   await bottom(page); await page.waitForTimeout(700);
   // 2026-11-10 메인: 페이지 맨 아래에서는 의뢰 diptych 영상이 화면 안이라 재생이 정상 — 화면 밖 영상만 멈춤을 확인.
   check(await page.locator('[data-ambient] video').evaluateAll(nodes=>nodes.filter(v=>{const r=v.getBoundingClientRect();return r.bottom<0||r.top>innerHeight;}).every(v=>v.paused)),{kind:'ambient-offscreen',prefix});
   await visibleTarget(page,'.diptych'); await page.waitForFunction(()=>document.querySelector('.diptych [data-ambient]').dataset.ambientState==='playing',null,{timeout:20000});
   check(requests.some(u=>u.endsWith('/request-desktop.mp4')),{kind:'diptych-source',prefix});
   if(prefix==='') await photo(page,'diptych','.diptych');
   await top(page,0);
   check(await page.locator('[data-rail-layer]').textContent()==='L 001' && await page.locator('[data-rail-z]').textContent()==='Z 0.20',{kind:'rail-start',prefix});
   await top(page,await page.evaluate(()=>(document.documentElement.scrollHeight-innerHeight)/2));
   const mid=await page.locator('[data-layer-rail]').evaluate(n=>({layer:Number(n.querySelector('[data-rail-layer]').textContent.slice(2)),z:Number(n.querySelector('[data-rail-z]').textContent.slice(2))}));
   check(mid.layer>1 && mid.layer<240 && Math.abs(mid.z-mid.layer*.2)<1e-8,{kind:'rail-middle',prefix,...mid});
   await bottom(page);
   check(await page.locator('[data-layer-rail]').getAttribute('data-state')==='complete' && await page.locator('[data-rail-finish]').isVisible() && await page.locator('[data-finish][data-complete]').count()===1 && await page.locator('[data-rail-layer]').textContent()==='L 240' && await page.locator('[data-rail-z]').textContent()==='Z 48.00',{kind:'rail-complete',prefix});
   await top(page,0); check(await page.locator('[data-layer-rail]').getAttribute('data-state')==='printing',{kind:'rail-rewind',prefix});
   await pscroll(page,.6); await page.locator('.hero-actions a').first().focus(); await page.waitForTimeout(350);
   check(await page.locator('.hero-chapter').first().evaluate(n=>getComputedStyle(n).opacity)==='1',{kind:'keyboard-hero',prefix});
   await page.locator('.hero-actions a').first().blur();
   await top(page,0); await page.locator('.see-work').click(); await page.waitForTimeout(2500);
   const anchor=await page.locator('#works').evaluate(n=>({top:n.getBoundingClientRect().top,header:document.querySelector('.site-header').getBoundingClientRect().bottom,padding:parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)}));
   check(Math.abs(anchor.top-anchor.padding)<=2 && anchor.top>=anchor.header,{kind:'lenis-anchor-header',prefix,...anchor});
   await visibleTarget(page,'[data-video-rail]'); const before=await page.locator('.video-rail').evaluate(n=>n.scrollLeft);
   await page.locator('[data-video-rail] [data-next]').click(); await page.waitForTimeout(600);
   check(await page.locator('.video-rail').evaluate((n,b)=>n.scrollLeft>b,before),{kind:'full-horizontal-rail',prefix});
  } finally { await ctx.close(); }
 }
 // B: reduced motion matches the original S3 heights and copy positions.
 for(const width of [1440,390]) for(const prefix of prefixes) {
  const {ctx,page,requests}=await session({reducedMotion:'reduce',viewport:{width,height:width===1440?900:844}});
  try {
   await goto(page,prefix+'/'); await staticChecks(page,requests,`${prefix}:${width}`);
   if(prefix==='') { await top(page,0); await photo(page,`static-ko-${width}`); }
   await overflow(page,`static:${prefix}:${width}`);
  } finally { await ctx.close(); }
 }
 // C: network gate, including real user scrolling after the initial load.
 for(const [connection,reason] of [[{saveData:true,effectiveType:'4g'},'save-data'],[{saveData:false,effectiveType:'3g'},'slow-connection']]) {
  const {ctx,page,requests}=await session();
  try { await ctx.addInitScript(connection=>Object.defineProperty(navigator,'connection',{configurable:true,value:connection}),connection); await goto(page,'/'); await staticChecks(page,requests,reason,reason); }
  finally { await ctx.close(); }
 }
 // D: no-JS SSR remains usable, including all four request panels.
 for(const width of [1440,390]) for(const path of ['/','/ai/','/request/#dev']) {
  const {ctx,page,requests}=await session({javaScriptEnabled:false,viewport:{width,height:width===1440?900:844}});
  try {
   await goto(page,path);
   if(path!=='/request/#dev') await staticChecks(page,requests,`nojs:${width}`,null,false);
   else {
    await bottom(page); check(await page.locator('[role=tabpanel]:visible').count()===4 && await page.locator('#dev .request-poster img').isVisible() && await page.locator('#etc .request-poster img').isVisible() && await page.locator('noscript a[href^="mailto:"]').isVisible() && !await page.locator('html').getAttribute('data-motion') && requests.length===0 && await page.locator('video').count()===0,{kind:'nojs-request-s5',width,requests});
   }
  } finally { await ctx.close(); }
 }
 // E: touch and narrow screens still use the complete film, with mobile assets.
 {
  const {ctx,page,requests}=await session({isMobile:true,hasTouch:true,viewport:{width:390,height:844}});
  try {
   await goto(page,'/'); await top(page,50); await page.waitForFunction(()=>['ready','painted'].includes(document.querySelector('[data-hero]').dataset.videoState),null,{timeout:20000});
   check(requests.filter(u=>u.endsWith('/hero-mobile.mp4')).length===1 && !requests.some(u=>u.endsWith('/hero-desktop.mp4')),{kind:'mobile-source',requests});
   await scrub(page,[0,.5,1,.5,0],'mobile');
   for(const p of [0,.6]) { await pscroll(page,p); await settle(page); await photo(page,`hero-mobile-${p}`,'[data-hero-stage]'); }
   for(const realm of ['ai','maker','dev','life']) {
    const selector=`[data-src-mobile$="realm-${realm}-mobile.mp4"]`; await visibleTarget(page,selector);
    await page.waitForFunction(selector=>document.querySelector(selector).dataset.ambientState==='playing',selector,{timeout:20000});
    const states=await page.locator('[data-ambient-group=realms]').evaluateAll(nodes=>nodes.map(el=>{const r=el.getBoundingClientRect(),visible=Math.max(0,Math.min(r.bottom,innerHeight)-Math.max(r.top,0))/r.height;return{state:el.dataset.ambientState,paused:el.querySelector('video')?.paused ?? true,visible};}));
    check(states.every(s=>s.state!=='playing' || (s.visible>=.25 && !s.paused)),{kind:'mobile-visible-only',realm,states});
   }
   check(requests.filter(u=>/realm-.*\.mp4$/.test(u)).every(u=>/-mobile\.mp4$/.test(u)),{kind:'mobile-loop-sources',requests});
   await overflow(page,'mobile-full');
  } finally { await ctx.close(); }
 }
 // F: the print panel never requests footage; only the visible dev panel plays.
 {
  const {ctx,page,requests}=await session();
  try {
   await goto(page,'/request/'); await bottom(page); await page.waitForTimeout(500);
   check(requests.length===0,{kind:'request-print-no-mp4',requests});
   await page.locator('#tab-dev').click(); await visibleTarget(page,'#dev .request-poster');
   await page.waitForFunction(()=>document.querySelector('#dev [data-ambient]').dataset.ambientState==='playing',null,{timeout:20000});
   check(requests.some(u=>u.endsWith('/request-desktop.mp4')) && !await page.locator('html').evaluate(n=>n.classList.contains('lenis')),{kind:'request-dev-playing',requests});
   await photo(page,'request-dev','#dev .request-poster');
   await page.locator('#tab-print').click(); await page.waitForTimeout(350);
   const paused=await ambient(page,'#dev [data-ambient]'); check(paused.paused && paused.state==='paused' && paused.poster==='1',{kind:'request-hidden-paused',...paused});
  } finally { await ctx.close(); }
 }
 // G: language/viewport matrix in all three motion contexts.
 for(const mode of ['full','static','touch']) for(const width of [360,390,1440]) for(const prefix of prefixes) {
  const {ctx,page}=await session({viewport:{width,height:width===1440?900:844},reducedMotion:mode==='static'?'reduce':'no-preference',...(mode==='touch'?{isMobile:true,hasTouch:true}:{})});
  try {
   await goto(page,prefix+'/'); await page.waitForTimeout(500); await overflow(page,`${mode}:${width}:${prefix}`);
   const initial=await page.locator('[data-hero-stage]').evaluate(n=>({top:n.getBoundingClientRect().top,header:document.querySelector('.site-header').getBoundingClientRect().bottom,cls:window.__s5CLS,head:parseFloat(document.querySelector('[data-hero]').style.getPropertyValue('--hero-head'))||0}));
   check(initial.cls<0.001 && Math.abs(initial.top-initial.header)<=1 && initial.head===0,{kind:'matrix-hero-initial',mode,width,prefix,...initial});
  } finally { await ctx.close(); }
 }
 for(const realm of ['dev','life']) for(const width of [1440,390]) {
  const {ctx,page}=await session({viewport:{width,height:width===1440?900:844}});
  try { await goto(page,`/${realm}/`); await photo(page,`${realm}-head-${width}`,'.page-head'); } finally { await ctx.close(); }
 }
 // AI: same controller and fallbacks, distinct film and three chapters.
 const axTitles={ '':['AI로 일합니다.','업무를 한 층씩 다시 쌓습니다.','기업의 AX·DX 전환까지.'], '/en':['I work with AI.','Rebuilding work, layer by layer.','All the way to AX and DX.'], '/ja':['AIと働く。','業務を一層ずつ積み直す。','企業のAX・DX転換まで。'] };
 for(const width of [360,1440]) for(const prefix of prefixes) {
  const mobile=width===360;
  const {ctx,page,requests}=await session({viewport:{width,height:mobile?844:900},...(mobile?{isMobile:true,hasTouch:true}:{})});
  try {
   await goto(page,prefix+'/ai/'); await page.waitForTimeout(2000);
   check(requests.length===0 && await page.locator('[data-hero]').getAttribute('data-video-state')==='idle',{kind:'ax-initial-idle',prefix,width,requests});
   const initial=await page.locator('[data-hero-stage]').evaluate(n=>({top:n.getBoundingClientRect().top,header:document.querySelector('.site-header').getBoundingClientRect().bottom,cls:window.__s5CLS}));
   check(Math.abs(initial.top-initial.header)<=1 && initial.cls<.001,{kind:'ax-initial-pin-cls',prefix,width,...initial});
   await top(page,80);
   await page.waitForFunction(()=>['ready','painted'].includes(document.querySelector('[data-hero]').dataset.videoState),null,{timeout:20000});
   check(requests.length===1 && requests[0].endsWith(`/ax-hero-${mobile?'mobile':'desktop'}.mp4`),{kind:'ax-source',prefix,width,requests});
   await scrub(page,[0,.2,.4,.6,.8,1,.8,.6,.4,.2,0],`ax:${prefix}:${width}`);
   for(const [i,p] of [.1,.35,.8].entries()) {
    await pscroll(page,p); await page.waitForTimeout(350);
    const chapters=await page.locator('.hero-chapter').evaluateAll(nodes=>nodes.map(n=>({active:n.hasAttribute('data-active'),opacity:getComputedStyle(n).opacity,title:n.querySelector('h1,.chapter-title').textContent})));
    check(chapters.length===3 && await page.locator('[data-hero]').getAttribute('data-chapter')===String(i+1) && chapters.every((c,j)=>c.active===(j===i) && c.opacity===(j===i?'1':'0')) && chapters[i].title===axTitles[prefix][i],{kind:'ax-chapter',prefix,width,p,chapters});
    if(prefix==='') await photo(page,`ax-hero-${width}-${i+1}`,'[data-hero-stage]');
   }
   await overflow(page,`ax:${prefix}:${width}`);
   await top(page,0); await page.locator('.see-work').click(); await page.waitForTimeout(2500);
   const anchor=await page.locator('#posts').evaluate(n=>({top:n.getBoundingClientRect().top,padding:parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop),header:document.querySelector('.site-header').getBoundingClientRect().bottom}));
   check(Math.abs(anchor.top-anchor.padding)<=2 && anchor.top>=anchor.header,{kind:'ax-posts-anchor',prefix,width,...anchor});
  } finally { await ctx.close(); }
 }
 for(const width of [360,1440]) for(const prefix of prefixes) {
  const {ctx,page,requests}=await session({reducedMotion:'reduce',viewport:{width,height:width===360?844:900}});
  try { await goto(page,prefix+'/ai/'); await staticChecks(page,requests,`ax-static:${prefix}:${width}`); await overflow(page,`ax-static:${prefix}:${width}`); }
  finally { await ctx.close(); }
 }
 for(const [connection,reason] of [[{saveData:true,effectiveType:'4g'},'save-data'],[{saveData:false,effectiveType:'3g'},'slow-connection']]) for(const prefix of prefixes) {
  const {ctx,page,requests}=await session();
  try { await ctx.addInitScript(connection=>Object.defineProperty(navigator,'connection',{configurable:true,value:connection}),connection); await goto(page,prefix+'/ai/'); await staticChecks(page,requests,`ax:${prefix}:${reason}`,reason); }
  finally { await ctx.close(); }
 }
 // H: reading pages remain entirely outside the portal graph.
 {
  const {ctx,page,requests}=await session();
  try {
   await goto(page,'/2026/11/09/ams2-pro-sliding-speedrack-underrail/'); await bottom(page); await page.waitForTimeout(1000);
   check(!await page.locator('html').getAttribute('data-motion') && requests.length===0 && !await page.locator('html').evaluate(n=>n.classList.contains('lenis')),{kind:'post-no-portal-motion',requests});
  } finally { await ctx.close(); }
 }
 check(report.console.length===0,{kind:'s5-console',errors:report.console});
 return report;
}
