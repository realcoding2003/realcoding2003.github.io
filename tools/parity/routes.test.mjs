import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { postMetadata, parseDocument, postDate, RouteRegistry } from '../../src/lib/site.mjs';
import { renderLiquid } from '../../src/lib/liquid.mjs';

const post = (name, data) => postMetadata(name, data);
test('UTC calendar date, both directions, and filename fallback', () => {
  assert.equal(post('2023-02-10-apache.md', { date: '2023-02-10 00:00:00 +0900' }).path, '/2023/02/09/apache/');
  assert.equal(post('2025-06-03-blog.md', { date: '2025-06-03 23:30:00 -0600' }).path, '/2025/06/04/blog/');
  assert.equal(postDate(undefined, '2020-01-02-test.md').toISOString(), '2020-01-02T00:00:00.000Z');
});
test('filename title without permalink, explicit slug in permalink, normalization', () => {
  assert.equal(post('2020-01-01-file.md', { slug: 'ignored' }).path, '/2020/01/01/file/');
  assert.equal(post('2020-01-01-file-en.md', { lang: 'en', slug: 'custom', permalink: '/en/:year/:month/:day/:title/' }).path, '/en/2020/01/01/custom/');
  const p = post('2020-01-01-file-ja.md', { lang: 'ja' });
  assert.equal(p.jekyllPath, '/2020/01/01/file-ja/');
  assert.equal(p.path, '/ja/2020/01/01/file/');
  assert.deepEqual(p.redirects, [p.jekyllPath]);
});
test('scalar/list redirects and future-date detection', () => {
  assert.deepEqual(post('2020-01-01-file.md', {redirect_from:'/old/'}).redirects, ['/old/']);
  assert.deepEqual(post('2020-01-01-file.md', {redirect_from:['/one/','/two/']}).redirects, ['/one/','/two/']);
  assert.ok(postDate('2999-01-01', '').getTime() > Date.now());
});
test('output collision fails for post/page/redirect and equivalent output filenames', () => {
  for (const owner of ['post', 'page', 'redirect']) {
    const r = new RouteRegistry(); r.add('/path/', 'post');
    assert.throws(() => r.add('/path/', owner), /Route collision/);
  }
  const r = new RouteRegistry(); r.add('/path/', 'post');
  assert.throws(() => r.add('/path/index.html', 'alias'), /Route collision/);
  assert.throws(() => r.add('/unsafe/../other/', 'alias'), /Unsafe route/);
});
test('all current source routes: unique, 20 normalized, 2 self aliases, 465 posts', () => {
  const registry = new RouteRegistry();
  const posts = readdirSync('_posts').filter(n=>n.endsWith('.md')).map(name=>post(name,parseDocument(readFileSync('_posts/'+name,'utf8')).data));
  assert.ok(posts.length >= 465, `기존 465편 보존: ${posts.length}`);
  assert.equal(posts.filter(p=>p.normalized).length,20);
  assert.equal(posts.flatMap(p=>p.redirects.filter(r=>r===p.path)).length,2);
  for (const p of posts) registry.add(p.path,p.filename);
  for (const p of posts) for (const from of p.redirects) if (from!==p.path) registry.add(from,'redirect '+p.filename);
});
test('Liquid precedes Markdown, raw blocks (including mid-line JSX) stay literal', async () => {
  const body = '```html\n{{ site.url }} {{ missing }}\n{% raw %}{{ content }}{% endraw %}\n```\nstyle={% raw %}{{ opacity: 0.5 }}{% endraw %}';
  assert.equal(await renderLiquid(body,{}), '```html\nhttps://realcoding.blog \n{{ content }}\n```\nstyle={{ opacity: 0.5 }}');
  assert.equal(await renderLiquid('style={{ opacity: isStale ? 0.7 : 1 }}',{}),'style=');
  assert.equal(await renderLiquid('${{ secrets.AWS_ACCESS_KEY_ID }}',{}),'$');
});
