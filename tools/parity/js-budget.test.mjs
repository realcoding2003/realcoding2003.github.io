import test from 'node:test';
import assert from 'node:assert/strict';
import { imports } from './js-budget.mjs';
test('JS graph separates static imports/exports from dynamic imports and strings', () => {
  const result = imports('import"./side.js";import{x}from"./shared.js";export{x}from"./exports.js";const p=()=>import("./mermaid.js");const s=\'import("not-a-file")\';');
  assert.deepEqual(result.staticImports, ['./side.js', './shared.js', './exports.js']);
  assert.deepEqual(result.dynamicImports, ['./mermaid.js']);
});

test('explicit JS budget limit is enforced without changing the default', async () => {
  const { mkdtempSync,writeFileSync,rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os'); const { join } = await import('node:path');
  const { measure } = await import('./js-budget.mjs');
  const root = mkdtempSync(join(tmpdir(),'rc-js-limit-'));
  try {
    writeFileSync(join(root,'index.html'),'<script>document.documentElement.classList.add("js")</script>');
    assert.equal(measure(root,'/').limit,51200);
    assert.equal(measure(root,'/',1).pass,false);
    assert.equal(measure(root,'/',30720).pass,true);
  } finally { rmSync(root,{recursive:true,force:true}); }
});

test('dynamic graph follows Vite preload, cycles and nested static imports exactly once', async () => {
 const { mkdtempSync,writeFileSync,rmSync } = await import('node:fs');
 const { tmpdir } = await import('node:os'); const { join } = await import('node:path');
 const { measure } = await import('./js-budget.mjs'); const { gzipSync } = await import('node:zlib');
 const root = mkdtempSync(join(tmpdir(),'rc-js-dynamic-'));
 try {
  const entry = 'import "./shared.js";__vitePreload(()=>import("./lazy.js"),[]);';
  const lazy = 'import "./shared.js";import "./nested.js";export const marker="lenis-smooth";';
  const shared = 'export const shared = 1;', nested = 'import "./lazy.js";export const n=2;';
  writeFileSync(join(root,'index.html'),'<script src="/entry.js"></script><script>const inline=1;</script>');
  for (const [name,code] of Object.entries({'entry.js':entry,'shared.js':shared,'lazy.js':lazy,'nested.js':nested})) writeFileSync(join(root,name),code);
  const base = measure(root,'/'); const all = measure(root,'/',51200,{withDynamic:true});
  assert.equal(base.gzip,all.firstLoadGzip); assert.deepEqual(all.staticFiles.sort(),['entry.js','shared.js']);
  assert.deepEqual(all.dynamicFiles.sort(),['lazy.js','nested.js']);
  assert.equal(all.gzip,base.gzip+[lazy,nested].reduce((s,c)=>s+gzipSync(c,{level:9}).length,0));
  assert.equal(measure(root,'/',51200,{withDynamic:true,firstLoadLimit:1}).pass,false);
  assert.equal(measure(root,'/',51200,{withDynamic:true,forbidMarkers:['lenis-smooth']}).pass,false);
  assert.equal(measure(root,'/',51200,{forbidMarkers:['lenis-smooth']}).pass,true);
  assert.equal(measure(root,'/',51200,{forbidMarkers:['inline=1','shared = 1']}).markerHits.length,2);
 } finally { rmSync(root,{recursive:true,force:true}); }
});
