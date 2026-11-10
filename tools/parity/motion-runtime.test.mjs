// Deterministic controller tests: no browser, network, or media decoder is started.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { MOBILE_MEDIA, pickSource } from '../../src/lib/motion-math.mjs';
const source=readFileSync(new URL('../../src/scripts/ambient-video.ts',import.meta.url),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace(/^import .*;\n/m,'').replace(/^export /gm,'');
function fixture({mode='full',realms=false}={}) {
 let callback, id=0, created=0; const frames=new Map(), win=new EventTarget();
 const group={}, widths=[800,100,100];
 const elements=Array.from({length:realms?3:1},(_,i)=>{
  const el=new EventTarget();
  el.dataset={srcDesktop:`desktop-${i}`,srcMobile:`mobile-${i}`,...(realms?{ambientGroup:'realms'}:{})};
  el.children=[];
  el.closest=selector=>selector==='[hidden]' ? null : selector==='.realms'?group:selector==='.slice'?el:null;
  el.getBoundingClientRect=()=>({width:widths[i]});
  el.append=v=>{el.children.push(v);v.owner=el;};
  return el;
 });
 const doc=new EventTarget(); doc.visibilityState='visible'; doc.documentElement={dataset:{motion:mode}};
 doc.querySelectorAll=()=>elements;
 class Video extends EventTarget {
  paused=true; owner=undefined;
  set src(value) { assert.equal(this.muted,true); assert.equal(this.playsInline,true); this.url=value; }
  setAttribute() {} removeAttribute() {} load() {}
  play() { this.paused=false; this.dispatchEvent(new Event('playing')); return Promise.resolve(); }
  pause() { this.paused=true; }
  remove() { this.owner.children=this.owner.children.filter(v=>v!==this); }
 }
 doc.createElement=tag=>{assert.equal(tag,'video');created++;return new Video();};
 const context={document:doc,window:{setTimeout},AbortController,Event,EventTarget,MOBILE_MEDIA,pickSource,
  matchMedia:q=>({matches:q==='(min-width:1100px)'}),
  requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:n=>frames.delete(n),setTimeout,clearTimeout,
  addEventListener:win.addEventListener.bind(win),
  IntersectionObserver:class { constructor(fn){callback=fn;} observe() {} disconnect() {} },
 };
 const init=runInNewContext(code+'\ninitAmbient;',context), controller=init(doc);
 const flush=()=>{for(const [id,fn] of [...frames]) {frames.delete(id);fn();}};
 return {controller,doc,elements,widths,flush,created:()=>created,
  visible:value=>{callback(elements.map(target=>({target,isIntersecting:value,intersectionRatio:value?1:0})));flush();}};
}
test('ambient static gate never constructs or requests video',()=>{
 const f=fixture({mode:'static'}); assert.equal(f.created(),0); assert.equal(f.elements[0].dataset.ambientState,'off'); f.controller.destroy();
});
test('ambient visibility pauses synchronously even if hidden tabs suspend rAF, then reuses media',()=>{
 const f=fixture(); assert.equal(f.created(),0);
 f.visible(true); const video=f.elements[0].children[0]; assert.equal(video.paused,false); assert.equal(video.url,'desktop-0');
 f.doc.visibilityState='hidden'; f.doc.dispatchEvent(new Event('visibilitychange'));
 // Deliberately do not flush rAF: background playback must stop immediately.
 assert.equal(video.paused,true); assert.equal(f.elements[0].dataset.ambientState,'paused');
 f.doc.visibilityState='visible'; f.doc.dispatchEvent(new Event('visibilitychange')); f.flush();
 assert.equal(video.paused,false); assert.equal(f.created(),1);
 f.visible(false); assert.equal(video.paused,true); f.controller.destroy(); assert.equal(f.elements[0].children.length,0);
});
test('only the widest visible desktop realm creates and plays media; collapsed media is retained paused',()=>{
 const f=fixture({realms:true}); f.visible(true);
 assert.equal(f.created(),1); assert.equal(f.elements[0].dataset.ambientState,'playing'); assert.equal(f.elements[1].children.length,0);
 f.widths.splice(0,3,100,800,100); f.elements[1].dispatchEvent(new Event('pointerenter')); f.flush();
 assert.equal(f.created(),2); assert.equal(f.elements[0].children[0].paused,true); assert.equal(f.elements[0].dataset.ambientState,'paused'); assert.equal(f.elements[1].dataset.ambientState,'playing');
 f.controller.destroy();
});
