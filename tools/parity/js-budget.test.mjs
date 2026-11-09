import test from 'node:test';
import assert from 'node:assert/strict';
import { imports } from './js-budget.mjs';
test('JS graph separates static imports/exports from dynamic imports and strings', () => {
  const result = imports('import"./side.js";import{x}from"./shared.js";export{x}from"./exports.js";const p=()=>import("./mermaid.js");const s=\'import("not-a-file")\';');
  assert.deepEqual(result.staticImports, ['./side.js', './shared.js', './exports.js']);
  assert.deepEqual(result.dynamicImports, ['./mermaid.js']);
});
