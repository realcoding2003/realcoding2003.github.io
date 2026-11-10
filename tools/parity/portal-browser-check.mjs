// External verifier only. Do not execute in the Codex environment.
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseHtml } from './html-tree.mjs';
import { checkS5 } from './s5-browser-check.mjs';
const origin = process.argv[2] || 'http://127.0.0.1:4325';
const out = resolve(process.argv[3] || '/private/tmp/rc-portal-browser');
await mkdir(out,{recursive:true});
// Brief's "24" does not cover its enumerated screens. Check all 33 portals,
// including the three noindex game placeholders, rather than omitting screens.
const prefixes = ['', '/en','/ja'];
const portals = prefixes.flatMap(p => ['', 'maker/','dev/','game/','life/','videos/','request/','about/','archive/','tags/','categories/'].map(s => `${p}/${s}`));
const slugs = ['ams2-pro-sliding-speedrack-underrail','bambulab-h3c-multicolor-figure','bowser-multipart-assembly'];
const days = ['09','08','07'];
const related = ['', '/en'].flatMap(p => slugs.map((s,i) => `${p}/2026/11/${days[i]}/${s}/`));
const paths = [...portals,...related,'/privacy/','/404.html'];
const report = {pages:paths.length,portalPages:portals.length,checks:0,failures:[],screenshots:[],blocked:null};
let browser;
const check = (ok,detail) => { report.checks++; if(!ok) report.failures.push(detail); };
const filename = path => path === '/' ? 'ko-home' : path.replace(/^\/|\/$/g,'').replaceAll('/','-');
try {
 if (!process.env.RC_PLAYWRIGHT_MODULE) throw new Error('Set RC_PLAYWRIGHT_MODULE to installed Playwright index.mjs');
 const {chromium} = await import(pathToFileURL(process.env.RC_PLAYWRIGHT_MODULE).href);
 browser = await chromium.launch({headless:true,...(process.env.RC_CHROME_PATH ? {executablePath:process.env.RC_CHROME_PATH} : {channel:'chrome'})});
 const context = await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,reducedMotion:'reduce'});
 // No live analytics, comments, MakerWorld, YouTube, or thumbnails are requested.
 await context.route('**/*',route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
 const page = await context.newPage();
 if (!await page.evaluate(() => document.createElement('video').canPlayType('video/mp4; codecs="avc1.640028"'))) throw new Error('H.264 미지원 브라우저 — RC_CHROME_PATH로 Chrome을 지정');
 for (const width of [360,390,1440]) {
  await page.setViewportSize({width,height:width === 1440 ? 1000 : 844});
  for (const path of paths) {
   await page.goto(origin+path,{waitUntil:'load'}); await page.evaluate(() => document.fonts.ready);
   const result = await page.evaluate(() => ({width:innerWidth,scroll:document.documentElement.scrollWidth}));
   check(result.width === result.scroll,{kind:'overflow',path,...result});
   if (portals.includes(path) && width !== 360) { const file = `${filename(path)}-${width}.png`; await page.screenshot({path:join(out,file),fullPage:true}); report.screenshots.push(file); }
  }
 }
 // Round 2 M4 regression: all collapsed labels must remain a single vertical
 // column inside their own slice, including the maker label after opening others.
 for (const width of [1100,1440]) for (const prefix of prefixes) {
  await page.setViewportSize({width,height:1000});
  await page.goto(origin+prefix+'/'); await page.evaluate(() => document.fonts.ready);
  const slices = page.locator('.slice');
  const measureLabels = async state => {
   const labels = await slices.evaluateAll(nodes => nodes.flatMap((slice,i) => {
    const heading = slice.querySelector('h3'), style = getComputedStyle(heading);
    if (style.writingMode !== 'vertical-rl') return [];
    const range = document.createRange(); range.selectNodeContents(heading.querySelector('a'));
    const text = range.getBoundingClientRect(), box = heading.getBoundingClientRect(), panel = slice.getBoundingClientRect();
    return [{i,label:heading.textContent,font:parseFloat(style.fontSize),nowrap:style.whiteSpace === 'nowrap',orientation:style.textOrientation,
     text:{left:text.left,right:text.right,top:text.top,bottom:text.bottom,width:text.width,height:text.height},
     box:{left:box.left,right:box.right,top:box.top,bottom:box.bottom,width:box.width,height:box.height},
     panel:{left:panel.left,right:panel.right,top:panel.top,bottom:panel.bottom}}];
   }));
   check(labels.length === await slices.count()-1,{kind:'accordion-collapsed-count',prefix,width,state,labels});
   for (const label of labels) {
    const {text,box,panel,font} = label;
    check(label.nowrap && box.width <= font*1.5 && text.width <= font*1.5 && text.height > text.width &&
     text.left >= panel.left-1 && text.right <= panel.right+1 && text.top >= panel.top-1 && text.bottom <= panel.bottom+1 &&
     text.top >= box.top-1 && text.bottom <= box.bottom+1 && label.orientation === (prefix === '/en' ? 'mixed' : 'upright'),
     {kind:'accordion-single-column',prefix,width,state,...label});
   }
  };
  await page.mouse.move(0,0); await measureLabels('default');
  for(let i=0;i<await slices.count();i++) {
   await slices.nth(i).hover(); await measureLabels(`hover-${i}`);
  }
  await page.mouse.move(0,0);
  for(let i=0;i<await slices.count();i++) {
   await slices.nth(i).locator('.slice-link').focus(); await measureLabels(`focus-${i}`);
  }
 }
 // Round 2: 0.20 stays on one line across the mobile photo/yellow boundary,
 // with at least 16 CSS px of clear space before the title in every language.
 for (const width of [360,390]) for (const prefix of prefixes) {
  await page.setViewportSize({width,height:844});
  await page.goto(origin+prefix+'/'); await page.evaluate(() => document.fonts.ready);
  const number = await page.locator('.diptych').evaluate(node => {
   const number = node.querySelector('.layer-number'), span = number.querySelector('span');
   const range = document.createRange(); range.selectNodeContents(span);
   const lines = range.getClientRects(), box = number.getBoundingClientRect(), panel = node.getBoundingClientRect();
   const photo = node.querySelector('.photo').getBoundingClientRect(), title = node.querySelector('h2').getBoundingClientRect();
   return {nowrap:getComputedStyle(number).whiteSpace === 'nowrap',lines:lines.length,
    fits:box.left >= panel.left-1 && box.right <= panel.right+1,
    crosses:box.top < photo.bottom && box.bottom > photo.bottom,
    centered:Math.abs((box.top+box.bottom)/2-photo.bottom) <= 1,gap:title.top-box.bottom};
  });
  check(number.nowrap && number.lines === 1 && number.fits && number.crosses && number.centered && number.gap >= 16,
   {kind:'diptych-mobile-number',prefix,width,...number});
 }
 await page.setViewportSize({width:1440,height:1000});
 for (const prefix of prefixes) {
  await page.goto(origin+prefix+'/'); await page.evaluate(() => document.fonts.ready); await page.mouse.move(5,5);
  const titles = page.locator('.slice-link');
  for(let i=0;i<await titles.count();i++) {
   await titles.nth(i).focus();
   const widths = await page.locator('.slice').evaluateAll(nodes => nodes.map(n => n.getBoundingClientRect().width));
   check(widths[i] > Math.max(...widths.filter((_,j) => i !== j)),{kind:'accordion-focus',prefix,i,widths});
  }
  const next = page.locator('[data-video-rail] [data-next]'); await next.scrollIntoViewIfNeeded();
  const before = await page.locator('.video-rail').evaluate(n => n.scrollLeft); await next.click();
  await page.waitForFunction(before => document.querySelector('.video-rail').scrollLeft > before,before);
  check(await page.locator('.video-rail').evaluate((n,before) => n.scrollLeft > before,before),{kind:'video-rail',prefix});
  await page.goto(origin+prefix+'/request/#print');
  const printTab = page.locator('#tab-print'), devTab = page.locator('#tab-dev');
  await printTab.focus(); await page.keyboard.press('ArrowRight');
  check(await devTab.getAttribute('aria-selected') === 'true' && new URL(page.url()).hash === '#dev',{kind:'request-right',prefix});
  await page.keyboard.press('ArrowLeft');
  check(await printTab.getAttribute('aria-selected') === 'true' && new URL(page.url()).hash === '#print',{kind:'request-left',prefix});
  await page.keyboard.press('End'); check(await devTab.getAttribute('aria-selected') === 'true',{kind:'request-end',prefix});
  await page.keyboard.press('Home'); check(await printTab.getAttribute('aria-selected') === 'true',{kind:'request-home',prefix});
  await page.locator('[data-mail]').click();
  check(await page.locator('[role=alert]').isVisible() && await page.locator('#inquiry-name').evaluate(n => n === document.activeElement),{kind:'empty-form',prefix});
  await page.goto(origin+prefix+'/dev/?topic=development&sub=ai');
  const source = await readFile(join('dist',prefix.slice(1),'dev/index.html'),'utf8');
  const expected = parseHtml(source).nodes.filter(n => 'data-post-row' in n.a && n.a['data-c1'] === 'development' && n.a['data-c2'] === 'ai').length;
  const count = await page.locator('[data-post-row]:visible').count();
  check(count === expected && expected > 0,{kind:'topic-query',prefix,count,expected});
 }
 for(const path of related) for(const theme of ['light','dark']) {
  await page.goto(origin+path); await page.evaluate(theme => {localStorage.setItem('theme',theme);document.documentElement.dataset.theme=theme;},theme); await page.evaluate(() => document.fonts.ready);
  const card = page.locator('.related-works'); await card.scrollIntoViewIfNeeded();
  const file = `${filename(path)}-related-${theme}.png`; await card.screenshot({path:join(out,file)}); report.screenshots.push(file);
  check(await card.count() === 1,{kind:'related',path,theme});
 }
 for(const prefix of prefixes) for(const state of ['idle','uploading:64','done','error']) {
  await page.goto(`${origin}${prefix}/request/?inquiry-preview=${state}`); await page.evaluate(() => document.fonts.ready);
  const bar = page.locator('.submit-bar');
  check(await bar.isVisible() && await bar.getAttribute('data-state') === state.split(':')[0],{kind:'preview-state',prefix,state});
  const file = `${filename(prefix+'/request/')}-${state.replace(':','-')}.png`; await page.screenshot({path:join(out,file),fullPage:true}); report.screenshots.push(file);
 }
 // Verify progressive enhancement without JavaScript as well.
 const nojs = await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
 await nojs.route('**/*',route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
 const fallback = await nojs.newPage(); await fallback.goto(origin+'/request/');
 check(await fallback.locator('[role=tabpanel]:visible').count() === 2 && await fallback.locator('.type-radios').isVisible() && await fallback.locator('noscript a[href^="mailto:"]').isVisible(),{kind:'no-js-request'});
 await nojs.close();
 await context.close();
 report.s5 = await checkS5(browser,origin,out);
} catch(error) { report.blocked=String(error); }
finally { await browser?.close(); }
await writeFile(join(out,'browser-report.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(report.blocked || report.failures.length || report.s5?.failures.length) process.exitCode=1;
