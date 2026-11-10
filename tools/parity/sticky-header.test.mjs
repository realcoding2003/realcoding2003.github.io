import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as motion from '../../src/lib/motion-math.mjs';
import { DISPLAY, fontCss, archivoUrl, fontFiles } from '../../src/lib/fonts.mjs';
const source = path => readFileSync(new URL('../../'+path,import.meta.url),'utf8');
function script(path, globals) {
 const code=ts.transpileModule(source(path),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 const context=vm.createContext({exports:{},require:()=>motion,...globals});
 vm.runInContext(code,context); return context;
}
function events() {
 const listeners=new Map(), frames=new Map(); let id=0;
 return {
  addEventListener(name,fn) { const list=listeners.get(name)||[]; list.push(fn); listeners.set(name,list); },
  requestAnimationFrame(fn) { frames.set(++id,fn); return id; },
  cancelAnimationFrame(id) { frames.delete(id); },
  dispatch(name) { for(const fn of listeners.get(name)||[]) fn({}); },
  flush() { const pending=[...frames.values()]; frames.clear(); pending.forEach(fn=>fn()); },
 };
}
test('hero pin interval starts at document zero and ends at sticky release for both header sizes', async () => {
 for(const [header,viewport] of [[96,844],[64,900]]) {
  const ev=events(), style=new Map(); let h=header, v=viewport, context;
  const stage={get offsetHeight(){return v-h;}};
  const track={get offsetHeight(){return v*4;},getBoundingClientRect:()=>({top:h-context.scrollY})};
  const chapters=[1,2,3,4].map(n=>({dataset:{chapter:String(n)},toggleAttribute(name,value){this.active=value;}}));
  const root={dataset:{chapter:'1'},style:{setProperty:(key,value)=>style.set(key,value)},querySelector:s=>s==='[data-hero-track]'?track:stage,querySelectorAll:()=>chapters};
  context=script('src/scripts/hero-scrub.ts',{
   ...ev,scrollY:0,AbortController,document:{documentElement:{dataset:{motion:'full'}},fonts:{ready:Promise.resolve()}},
   matchMedia:()=>({matches:header===96,addEventListener(){}}),getComputedStyle:()=>({top:h+'px'}),
   IntersectionObserver:class {observe(){} disconnect(){}},
  });
  const controller=context.exports.initHeroScrub(root); await Promise.resolve(); ev.flush();
  assert.equal(root.dataset.progress,'0.000'); assert.equal(style.get('--hero-head'),'0px');
  const range=4*v-stage.offsetHeight;
  for(const p of [0,.1,.19,.47,.69,1,.69,.47,.19,0]) {
   // Scroll positions are pixels; land on/after chapter boundaries, not a floating-point ulp before them.
   context.scrollY=Math.ceil(p*range); ev.dispatch('scroll'); ev.flush();
   assert.equal(Number(root.dataset.progress),p);
   assert.equal(Number(root.dataset.chapter),motion.chapterAt(p));
   assert.equal(style.get('--hero-head'),'0px');
  }
  context.scrollY=range+200; ev.dispatch('scroll'); ev.flush(); assert.equal(root.dataset.progress,'1.000');
  // CSS svh/header changes must refresh the interval even without a width change.
  context.scrollY=0; v+=100; h=header===96?64:96; ev.dispatch('resize'); ev.flush();
  context.scrollY=(4*v-stage.offsetHeight)*.5; ev.dispatch('scroll'); ev.flush();
  assert.equal(root.dataset.progress,'0.500'); controller.destroy();
 }
});
test('TOC current item follows the header-aware anchor landing line and updates on resize', () => {
 const ev=events(); let padding=80, margin=8;
 const headings=[{id:'one',top:50},{id:'two',top:400},{id:'three',top:800}].map(h=>({...h,getBoundingClientRect(){return {top:this.top};}}));
 const links=headings.map(h=>({dataset:{tocId:h.id},setAttribute(name,value){this.current=value;},removeAttribute(){delete this.current;}}));
 script('src/scripts/toc.ts',{
  ...ev,
  document:{documentElement:{},querySelectorAll:()=>links,getElementById:id=>headings.find(h=>h.id===id)},
  getComputedStyle:()=>({scrollPaddingTop:String(padding),scrollMarginTop:String(margin)}),
 });
 assert.equal(links[0].current,'location');
 headings[1].top=90; ev.dispatch('scroll'); ev.flush(); assert.equal(links[0].current,'location');
 headings[1].top=88; ev.dispatch('scroll'); ev.flush(); assert.equal(links[1].current,'location');
 padding=72; ev.dispatch('resize'); assert.equal(links[0].current,'location');
});
test('shared CSS reserves both mobile rows before script and contains horizontal navigation', () => {
 const tokens=source('src/styles/tokens.css'), header=source('src/components/SiteHeader.astro');
 assert.match(tokens,/--site-header-h: 6rem/); assert.match(tokens,/@media \(min-width:768px\).*--site-header-h: 4rem/);
 assert.match(header,/position: sticky; top: 0; height: var\(--site-header-h\); z-index: 10/);
 assert.match(header,/@media \(max-width:767px\)/);
 assert.match(header,/grid-template-rows: minmax\(0,1fr\) 2\.5rem/);
 assert.match(header,/min-width: 0; height: 2\.5rem; flex-direction: row; overflow-x: auto/);
 assert.match(header,/scrollbar-width: none/);
 assert.match(header,/min-height: 2\.5rem; padding-inline: \.5rem; border: 0; font-size: \.875rem; white-space: nowrap/);
 assert.match(header,/data-lenis-prevent/);
 assert.match(source('src/styles/global.css'),/scroll-padding-top: calc\(var\(--site-header-h\) \+ 1rem\)/);
 assert.match(source('src/styles/reader.css'),/scroll-margin-top: \.5rem/);
 assert.match(source('src/components/Toc.astro'),/top: calc\(var\(--site-header-h\) \+ 1rem\); max-height: calc\(100vh - var\(--site-header-h\) - 2rem\)/);
 assert.match(source('src/components/portal/HeroStage.astro'),/position: sticky; top: var\(--site-header-h\); height: calc\(100svh - var\(--site-header-h\)\)/);
});

test('heading fonts are optional, body/mono stay swap, and only en/ja preload Archivo', () => {
 assert.deepEqual(DISPLAY,{body:'swap',heading:'optional',mono:'swap'});
 for(const lang of ['ko','en','ja']) {
  for(const [,face] of fontCss[lang].matchAll(/@font-face\{([^}]+)\}/g)) {
   if(/src:local/.test(face)) continue;
   const heading=/Archivo RC Wide|Wanted Sans/.test(face) || (/LINE Seed JP/.test(face) && /font-weight: 700/.test(face));
   assert.match(face,new RegExp('font-display:'+ (heading?'optional':'swap')+';'));
  }
 }
 const layout=source('src/layouts/Document.astro');
 assert.match(layout,/\(lang === 'en' \|\| lang === 'ja'\) && <link rel="preload" href=\{archivoUrl\} as="font" type="font\/woff2" crossorigin/);
 const archivo=fontFiles.find(f=>f.url===archivoUrl);
 assert.ok(archivo); assert.ok(readFileSync(archivo.source).length<13000);
});
