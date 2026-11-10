import test from 'node:test';
import assert from 'node:assert/strict';
import { enhanceHtml } from '../../src/lib/html-enhance.ts';
import { readingMinutes, bodyText } from '../../src/lib/reading-time.ts';
import { sectionOf } from '../../src/lib/sections.ts';
import { shikiTheme } from '../../src/lib/shiki-theme.mjs';
import { responsiveImage } from '../../src/lib/responsive-images.mjs';
import { stat, readFile } from 'node:fs/promises';
import sharp from 'sharp';

test('image enhancement preserves originals, adds responsive pictures and prioritizes only the lead', async () => {
  const image = '<img src="/assets/images/posts/ams2-pro-sliding-speedrack-underrail/hero.jpg" alt="lead">';
  const input = `<p>${image}</p><h2 id="start">Start</h2>${image}<iframe src="about:blank"></iframe>`;
  const html = await enhanceHtml(input);
  assert.equal((html.match(/width="1050" height="1400"/g) || []).length, 2);
  assert.equal((html.match(/decoding="async"/g) || []).length, 2);
  assert.equal((html.match(/loading="eager"/g) || []).length, 1);
  assert.equal((html.match(/fetchpriority="high"/g) || []).length, 1);
  assert.match(html, /<iframe src="about:blank" loading="lazy">/);
  assert.equal((html.match(/<picture>/g) || []).length, 2);
  assert.equal((html.match(/<img /g) || []).length, 2);
  assert.match(html, /<source type="image\/webp" srcset="[^\"]+ 480w, [^\"]+ 768w, [^\"]+ 960w, [^\"]+ 1050w" sizes="/);
  assert.equal(html.replace(/<picture><source[^>]*>/g, '').replace(/<\/picture>/g, '').replace(/ (?:width|height|decoding|loading|fetchpriority)="[^"]*"/g, ''), input);
});
test('images after first h2 remain lazy; existing dimensions and iframe loading survive', async () => {
  const html = await enhanceHtml('<h2>First</h2><img src="/assets/custom.png" width="4" height="3" loading="lazy"><iframe loading="eager"></iframe>');
  assert.doesNotMatch(html, /fetchpriority/); assert.match(html, /width="4" height="3" loading="lazy" decoding="async"/);
  assert.match(html, /<iframe loading="eager">/);
});
test('responsive variants use actual widths without upscaling and reuse content-addressed files', async () => {
  const src = '/assets/images/posts/ams2-pro-sliding-speedrack-underrail/hero.jpg';
  const first = await responsiveImage(src);
  const paths = first.variants.map(v => 'node_modules/.cache/rc-images/' + v.src.split('/').at(-1));
  const before = await Promise.all(paths.map(path => stat(path)));
  const second = await responsiveImage(src);
  assert.deepEqual(first, second);
  for (let i = 0; i < paths.length; i++) {
    const meta = await sharp(await readFile(paths[i])).metadata();
    assert.equal(meta.format, 'webp'); assert.equal(meta.width, first.variants[i].width);
    assert.ok(meta.width <= first.width); assert.equal((await stat(paths[i])).mtimeMs, before[i].mtimeMs);
  }
  assert.equal(await responsiveImage('/assets/images/og-default.jpg'), null);
});
test('reading time uses DOM-style text, language rates, and minimum one minute', () => {
  assert.equal(bodyText('<span>con</span><span>sole</span> &amp; test'), 'console & test');
  assert.equal(readingMinutes('', 'en'), 1); assert.equal(readingMinutes('word '.repeat(231), 'en'), 2);
  assert.equal(readingMinutes('가 '.repeat(501), 'ko'), 2); assert.equal(readingMinutes('あ '.repeat(1000), 'ja'), 2);
});
test('section mapping honors explicit section and ordered category rules', () => {
  const of = data => sectionOf({ data });
  assert.equal(of({section:'game',categories:['Life']}), 'game');
  assert.equal(of({categories:['Life','3D Printing']}), 'maker');
  assert.equal(of({categories:['Life']}), 'life');
  assert.equal(of({categories:['Development','Life']}), 'dev');
});
test('Shiki ink panel uses yellow comments and no unrelated highlight theme', () => {
  assert.equal(shikiTheme.name, 'realcoding-ink');
  assert.equal(shikiTheme.tokenColors.find(t => t.scope.includes('comment')).settings.foreground, '#E8C552');
});
