import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';
const root = resolve(process.argv[2] || 'dist');
const failures = [], warnings = []; let pages = 0, images = 0;
const variants = new Set(); let pictures = 0;
const KNOWN_MISSING = new Set(); // 2026-11-10: ai-powered-blog-series/hero.png 줄을 글에서 삭제(사용자 결정)
const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>=]+)))?/g)].map(m => [m[1], m[2] ?? m[3] ?? m[4] ?? '']));
function check(ok, path, message) { if (!ok) failures.push({ path, message }); }
function* walk(dir) { for (const entry of readdirSync(dir, { withFileTypes: true })) { const path = join(dir, entry.name); if (entry.isDirectory()) yield* walk(path); else if (entry.name.endsWith('.html')) yield path; } }
for (const file of walk(root)) {
  const html = readFileSync(file, 'utf8');
  if (!/<article\b[^>]*class="reader\b/.test(html)) continue;
  pages++;
  const path = '/' + relative(root, file).replace(/index.html$/, '');
  check((html.match(/class="post-content"/g) || []).length === 1, path, 'post-content count != 1');
  const article = html.match(/<article\b[^>]*>/)?.[0] || '';
  check(/language-mermaid/.test(html) === /data-has-mermaid/.test(article), path, 'mermaid flag mismatch');
  check(!html.includes('cdn.jsdelivr.net/npm/mermaid'), path, 'Mermaid CDN');
  // Track the actual body element, including nested raw-HTML divs.
  const voids = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
  let depth = 0; const bodyImages = [];
  for (const [tag, name] of html.matchAll(/<\/?([a-z][\w:-]*)\b(?:[^"'>]|"[^"]*"|'[^']*')*>/gi)) {
    const closing = tag.startsWith('</'), lower = name.toLowerCase();
    if (!depth) { if (!closing && (attrs(tag).class || '').split(/\s+/).includes('post-content')) depth = 1; continue; }
    if (closing) { if (!voids.has(lower)) depth--; }
    else { if (lower === 'img') bodyImages.push(attrs(tag)); if (!voids.has(lower) && !tag.endsWith('/>')) depth++; }
  }
  for (const a of bodyImages) {
    images++;
    check(a.decoding === 'async' && !!a.loading, path, `Image decode/loading: ${a.src}`);
    // 운영에서도 404인 원본 누락 이미지(글 내용 문제, 2026-11-10 확인) — 경고만. 새 누락은 실패.
    if (KNOWN_MISSING.has(a.src)) { warnings.push({ path, message: `Known missing source image: ${a.src}` }); continue; }
    check(!a.src?.startsWith('/assets/') || (Number(a.width) > 0 && Number(a.height) > 0), path, `Image dimensions: ${a.src}`);
    if (a.src?.startsWith('/assets/images/posts/')) {
      const picture = [...html.matchAll(/<picture><source\b[^>]*><img\b[^>]*><\/picture>/g)].find(([tag]) => tag.includes(`src="${a.src}"`))?.[0];
      check(!!picture, path, `Responsive picture missing: ${a.src}`);
      if (picture) {
        pictures++;
        const source = attrs(picture.match(/<source\b[^>]*>/)[0]);
        check(source.type === 'image/webp' && !!source.sizes, path, `Responsive source type/sizes: ${a.src}`);
        const items = (source.srcset || '').split(',').map(s => s.trim().match(/^(\/_images\/rc\/[a-f0-9]{64}-(\d+)\.webp) (\d+)w$/));
        check(items.length > 0 && items.every(m => m && Number(m[2]) === Number(m[3]) && Number(m[3]) <= Number(a.width)), path, `Responsive widths/upscale: ${a.src}`);
        for (const item of items.filter(Boolean)) { variants.add(item[1]); check(existsSync(join(root, item[1].slice(1))), path, `Responsive file missing: ${item[1]}`); }
      }
    }
  }
  check((html.match(/fetchpriority="high"/g) || []).length <= 1, path, 'Multiple high-priority images');
  const jsons = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  try { check(jsons.length > 0 && jsons.every(m => JSON.parse(m[1])['@type'] === 'BlogPosting'), path, 'BlogPosting JSON-LD'); } catch { check(false, path, 'Invalid JSON-LD'); }
  const tags = [...html.matchAll(/<meta\b[^>]*>/g)].map(([tag]) => attrs(tag));
  check(tags.some(a => a.property === 'og:type' && a.content === 'article'), path, 'og:type');
  check(html.includes('G-MEFBMHM6FK'), path, 'Missing GA4');
  check(![...html.matchAll(/<script\b[^>]*>/g)].some(([tag]) => /utteranc\.es\/client\.js/.test(attrs(tag).src || '')), path, 'Static Utterances script');
  const noComments = /^\/(?:en\/|ja\/)?2025\/06\/13\/mcp-giscus-comments-setup\/$/.test(path);
  check([...html.matchAll(/<[a-z][^>]*>/gi)].some(([tag]) => attrs(tag).id === 'comments') !== noComments, path, 'comments:false mismatch');
  check(/<a\b[^>]*href="#main"/.test(html), path, 'Missing skip link');
  check([...html.matchAll(/<nav\b[^>]*>/g)].filter(([tag]) => attrs(tag)['aria-label']).length >= 2, path, 'Labeled navs');
  check([...html.matchAll(/<a\b[^>]*>/g)].filter(([tag]) => attrs(tag).hreflang).length === 3, path, 'Language links != 3');
  check(!/<a\b[^>]*href="\/(?:en\/|ja\/)?game\/"/.test(html), path, 'Empty game menu');
}
check(pages >= 465, '<all>', `Expected at least 465 reader pages, got ${pages}`);
for (const lang of ['ko', 'en', 'ja']) {
  const file = join(root, 'fonts', `${lang}.css`);
  check(existsSync(file), lang, 'Font CSS missing'); if (!existsSync(file)) continue;
  const css = readFileSync(file, 'utf8');
  check(!/url\(\s*["']?(?:https?:|\/\/)/i.test(css), lang, 'External font URL');
  for (const [, url] of css.matchAll(/url\(["']?([^)'"\s]+)["']?\)/g)) check(url.startsWith('/fonts/files/') && existsSync(join(root, url.slice(1))), lang, `Font file missing: ${url}`);
}
console.log(JSON.stringify({ pages, images, pictures, variants: variants.size, failures: failures.length, details: failures, warnings }, null, 2));
if (failures.length) process.exitCode = 1;
