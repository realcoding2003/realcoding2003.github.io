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
export function measure(root, path, limit = 51200, options = {}) {
  root = resolve(root);
  const html = readFileSync(resolve(root, '.' + path, path.endsWith('/') ? 'index.html' : ''), 'utf8');
  const files = new Map(), first = new Set(), inlines = [], dynamics = new Set(), external = new Set();
  const scanned = new Set();
  function visit(specifier, parent, isDynamic = false) {
    if (/^(?:[a-z]+:|\/\/)/i.test(specifier)) { external.add(specifier); return; }
    if (specifier === '<computed>') return;
    const file = resolve(specifier.startsWith('/') ? root : dirname(parent), specifier.replace(/^\//, '').split(/[?#]/)[0]);
    if (!file.startsWith(root + sep)) throw new Error(`Outside dist: ${file}`);
    if (!existsSync(file)) throw new Error(`Missing JS: ${file}`);
    if (!files.has(file)) files.set(file, readFileSync(file, 'utf8'));
    if (!isDynamic) first.add(file);
    const key = `${file}:${isDynamic}`;
    if (scanned.has(key)) return;
    scanned.add(key); scan(files.get(file), file, isDynamic);
  }
  function scan(code, parent, isDynamic = false) {
    const { staticImports, dynamicImports } = imports(code);
    dynamicImports.forEach(spec => {
      dynamics.add(`${relative(root, parent) || '<inline>'}: ${spec}`);
      if (options.withDynamic) visit(spec, parent, true);
    });
    staticImports.forEach(spec => visit(spec, parent, isDynamic));
  }
  for (const [, attrs, code] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/type\s*=\s*["']application\/ld\+json["']/i.test(attrs)) continue;
    const src = attrs.match(/\bsrc=["']([^"']+)["']/)?.[1];
    if (src) visit(src, resolve(root, 'index.html'));
    else if (code.trim()) { inlines.push(code); scan(code, resolve(root, 'index.html')); }
  }
  const size = codes => codes.reduce((sum, code) => sum + gzipSync(code, { level: 9 }).length, 0);
  const gzip = size([...files.values(), ...inlines]);
  const firstLoadGzip = size([...first].map(file => files.get(file)).concat(inlines));
  const staticFiles = [...first].map(file => relative(root, file));
  const dynamicFiles = [...files.keys()].filter(file => !first.has(file)).map(file => relative(root, file));
  const forbidden = [...staticFiles, ...dynamicFiles].filter(file => /mermaid|utteranc|gtag|googletagmanager/i.test(file));
  const markerHits = (options.forbidMarkers || []).flatMap(marker => [
    ...[...files].filter(([, code]) => code.includes(marker)).map(([file]) => ({ marker, file: relative(root, file) })),
    ...inlines.flatMap((code, i) => code.includes(marker) ? [{ marker, file: `<inline:${i}>` }] : []),
  ]);
  return { path, gzip, firstLoadGzip, limit, ...(options.firstLoadLimit ? { firstLoadLimit: options.firstLoadLimit } : {}), staticFiles, dynamicFiles, inlineScripts: inlines.length, dynamicImports: [...dynamics], external: [...external], markerHits,
    pass: gzip <= limit && (!options.firstLoadLimit || firstLoadGzip <= options.firstLoadLimit) && !forbidden.length && !external.size && !markerHits.length };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  const numeric = (key, fallback) => {
    const arg = args.find(arg => arg.startsWith(key + '=')); const n = arg ? Number(arg.slice(key.length + 1)) : fallback;
    if (n !== undefined && (!Number.isInteger(n) || n < 1)) throw new Error(`Invalid ${key}`);
    return n;
  };
  const limit = numeric('--limit', 51200), firstLoadLimit = numeric('--first-load-limit');
  const options = { withDynamic: args.includes('--with-dynamic'), firstLoadLimit, forbidMarkers: args.filter(arg => arg.startsWith('--forbid-marker=')).map(arg => arg.slice(16)) };
  const [dist, ...paths] = args.filter(arg => !arg.startsWith('--'));
  if (!dist || !paths.length) throw new Error('Usage: js-budget.mjs [--with-dynamic] [--limit=N] [--first-load-limit=N] [--forbid-marker=text] <dist> <path>...');
  let failed = false;
  for (const path of paths) { const result = measure(resolve(dist), path, limit, options); console.log(JSON.stringify(result, null, 2)); if (!result.pass) failed = true; }
  if (failed) process.exitCode = 1;
}
