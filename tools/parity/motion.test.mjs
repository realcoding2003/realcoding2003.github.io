import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { decideMotion, applyMotionGate, chapterAt, timeAt, layerReadout, pickSource, MOBILE_MEDIA, LAYER_COUNT, CHAPTER_STARTS, FILM_END } from '../../src/lib/motion-math.mjs';
const cases = [
 [{reducedMotion:true},'static','reduced-motion'],[{saveData:true},'static','save-data'],
 ...['slow-2g','2g','3g'].map(effectiveType => [{effectiveType},'static','slow-connection']),
 [{effectiveType:'4g'},'full','none'],[{},'full','none'],
 [{override:'static'},'static','override'],[{override:'full',reducedMotion:true,saveData:true,effectiveType:'3g'},'full','override'],
 [{override:'static',reducedMotion:true},'static','override'],[{override:'unknown'},'full','none'],
 [{override:'unknown',saveData:true},'static','save-data'],[{reducedMotion:true,saveData:true},'static','reduced-motion'],
 [{saveData:true,effectiveType:'3g'},'static','save-data'],
];
test('motion gate priority table and serialized head gate are identical', () => {
 const serialized = new Function(`return (${applyMotionGate.toString()})`)();
 for (const [input,mode,reason] of cases) {
  assert.deepEqual(decideMotion(input),{mode,reason});
  for (const gate of [applyMotionGate,serialized]) {
   const doc = {documentElement:{dataset:{}}};
   const win = {matchMedia:query => { assert.equal(query,'(prefers-reduced-motion: reduce)'); return {matches:!!input.reducedMotion}; },navigator: input.effectiveType || input.saveData ? {connection:{saveData:input.saveData,effectiveType:input.effectiveType}} : {},location:{search:input.override ? '?motion='+input.override : ''}};
   assert.deepEqual(gate(doc,win),{mode,reason}); assert.deepEqual(doc.documentElement.dataset,{motion:mode,motionReason:reason});
  }
 }
});
test('chapter boundaries and clamping', () => {
 for (const [p,n] of [[-1,1],[0,1],[.189,1],[.19,2],[.469,2],[.47,3],[.689,3],[.69,4],[1,4],[2,4]]) assert.equal(chapterAt(p),n);
 assert.deepEqual(CHAPTER_STARTS,[0,.19,.47,.69]); assert.equal(FILM_END,.94);
});
test('film time holds the last scene and is monotonic in both directions', () => {
 const d=15.041667;
 assert.equal(timeAt(0,d),0); assert.ok(Math.abs(timeAt(.47,d)-7.5208335)<1e-6);
 assert.equal(timeAt(.94,d),.999*d); assert.equal(timeAt(1,d),.999*d);
 const values=Array.from({length:1001},(_,i)=>timeAt(i/1000,d));
 assert.ok(values.every((v,i)=>!i || v>=values[i-1])); assert.ok(values.reverse().every((v,i,a)=>!i || v<=a[i-1]));
});
test('240 layer readout uses exact decimal formatting and reversible completion', () => {
 assert.equal(LAYER_COUNT,240);
 assert.deepEqual(layerReadout(0),{layer:'001',z:'0.20',complete:false});
 assert.deepEqual(layerReadout(1),{layer:'240',z:'48.00',complete:true});
 assert.deepEqual(layerReadout(.5),{layer:'121',z:'24.20',complete:false});
 assert.equal(layerReadout(.994).complete,false); assert.equal(layerReadout(.995).complete,true);
 for(let i=1;i<=240;i++) { const v=layerReadout((i-1)/239); assert.equal(Number(v.layer),i); assert.equal(v.z,(i*.2).toFixed(2)); }
});
test('mobile is a source selection, not a static fallback', () => {
 assert.equal(MOBILE_MEDIA,'(max-width: 860px), (hover: none) and (pointer: coarse)');
 assert.equal(pickSource({desktop:'d',mobile:'m'},true),'m'); assert.equal(pickSource({desktop:'d',mobile:'m'},false),'d');
});
test('all seven motion copy keys exist in three languages, without together alt or long dashes', async () => {
 const source=readFileSync(new URL('../../src/lib/portal-copy.ts',import.meta.url),'utf8');
 assert.doesNotMatch(source,/[\u2013\u2014]/u);
 const {portalCopy}=await import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText).toString('base64'));
 for (const lang of ['ko','en','ja']) {
  for (const key of ['hero.alt',...['2','3','4'].flatMap(n=>[`hero.ch${n}.title`,`hero.ch${n}.line`])]) assert.ok(portalCopy[lang][key]);
  assert.equal('together.alt' in portalCopy[lang],false);
 }
});


test('video posters use the same content-addressed responsive pipeline without admitting videos', async () => {
 const { responsiveImage } = await import('../../src/lib/responsive-images.mjs');
 const image = await responsiveImage('/assets/video/portal/hero-desktop-poster.jpg');
 assert.equal(image.width,1920); assert.equal(image.height,1072);
 assert.deepEqual(image.variants.map(v=>v.width),[480,768,960,1440]);
 assert.equal(await responsiveImage('/assets/video/portal/hero-desktop.mp4'),null);
 assert.equal(await responsiveImage('/assets/video/portal/arbitrary.jpg'),null);
});
