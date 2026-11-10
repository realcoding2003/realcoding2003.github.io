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
