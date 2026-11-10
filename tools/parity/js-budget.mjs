import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, relative, sep } from 'node:path';
import { gzipSync } from 'node:zlib';
import ts from 'typescript';
import { pathToFileURL } from 'node:url';
export function imports(code) {
  const staticImports = [], dynamicImports = [];
  const source = ts.createSourceFile('bundle.js', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  function walk(node) {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteralLike(node.moduleSpecifier)) staticImports.push(node.moduleSpecifier.text);
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const arg = node.arguments[0]; dynamicImports.push(arg && ts.isStringLiteralLike(arg) ? arg.text : '<computed>');
    }
    ts.forEachChild(node, walk);
  }
  walk(source); return { staticImports, dynamicImports };
}
export function measure(root, path, limit = 51200) {
  const html = readFileSync(resolve(root, '.' + path, path.endsWith('/') ? 'index.html' : ''), 'utf8');
  const files = new Map(), inlines = [], dynamics = new Set(), external = new Set();
  function visit(specifier, parent) {
    if (/^(?:[a-z]+:|\/\/)/i.test(specifier)) { external.add(specifier); return; }
    if (specifier === '<computed>') return;
    const file = resolve(specifier.startsWith('/') ? root : dirname(parent), specifier.replace(/^\//, '').split(/[?#]/)[0]);
    if (!file.startsWith(root + sep)) throw new Error(`Outside dist: ${file}`);
    if (files.has(file)) return;
    if (!existsSync(file)) throw new Error(`Missing JS: ${file}`);
    const code = readFileSync(file, 'utf8'); files.set(file, code); scan(code, file);
  }
  function scan(code, parent) {
    const { staticImports, dynamicImports } = imports(code);
    dynamicImports.forEach(spec => dynamics.add(`${relative(root, parent) || '<inline>'}: ${spec}`));
    staticImports.forEach(spec => visit(spec, parent));
  }
  for (const [, attrs, code] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/type\s*=\s*["']application\/ld\+json["']/i.test(attrs)) continue;
    const src = attrs.match(/\bsrc=["']([^"']+)["']/)?.[1];
    if (src) visit(src, resolve(root, 'index.html'));
    else if (code.trim()) { inlines.push(code); scan(code, resolve(root, 'index.html')); }
  }
  const gzip = [...files.values(), ...inlines].reduce((sum, code) => sum + gzipSync(code, { level: 9 }).length, 0);
  const staticFiles = [...files.keys()].map(file => relative(root, file));
  const forbidden = staticFiles.filter(file => /mermaid|utteranc|gtag|googletagmanager/i.test(file));
  return { path, gzip, limit, staticFiles, inlineScripts: inlines.length, dynamicImports: [...dynamics], external: [...external], pass: gzip <= limit && !forbidden.length && !external.size };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  const option = args.find(arg => arg.startsWith('--limit='));
  const limit = option ? Number(option.slice(8)) : 51200;
  if (!Number.isInteger(limit) || limit < 1) throw new Error('Invalid --limit');
  const [dist, ...paths] = args.filter(arg => arg !== option);
  if (!dist || !paths.length) throw new Error('Usage: js-budget.mjs <dist> <path>...');
  let failed = false;
  for (const path of paths) { const result = measure(resolve(dist), path, limit); console.log(JSON.stringify(result, null, 2)); if (!result.pass) failed = true; }
  if (failed) process.exitCode = 1;
}
