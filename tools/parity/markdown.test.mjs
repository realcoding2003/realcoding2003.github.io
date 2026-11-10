import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { jekyllMarkdown } from '../../src/lib/markdown.mjs';
import { parseDocument } from '../../src/lib/site.mjs';
const renderer = await jekyllMarkdown().createRenderer({ syntaxHighlight: false });
const render = async body => (await renderer.render(body)).code;
const count = (html, tag) => (html.match(new RegExp('<' + tag + '\\b', 'g')) || []).length;

test('valid list fences, tildes, Mermaid, and raw HTML remain intact', async () => {
  const body = '```mermaid\ngraph TD\n  A --> B\n```\n\n1. Commands\n   ~~~sh\n   echo ok\n   ~~~\n\n<div style="width: 100%">literal | ```</div>\n';
  const html = await render(body);
  assert.equal(count(html, 'pre'), 2);
  assert.match(html, /<code class="language-mermaid">/);
  assert.match(html, /<div style="width: 100%">literal \| ```<\/div>/);
  assert.equal(count(html, 'table'), 0);
});
test('pipe in link text remains a link, not a headerless table', async () => {
  const html = await render('- Video: [Title | detail](https://example.com/video)\n- AI voice\n');
  assert.equal(count(html, 'table'), 0); assert.equal(count(html, 'a'), 1);
  assert.match(html, /<a href="https:\/\/example.com\/video">Title \| detail<\/a>/);
  assert.equal(count(await render('ordinary \\| text and `code | span`'), 'table'), 0);
});
test('normal GFM tables retain their header and cells', async () => {
  const html = await render('| One | Two |\n| --- | --- |\n| 1 | 2 |\n');
  assert.equal(count(html, 'table'), 1); assert.equal(count(html, 'th'), 2); assert.equal(count(html, 'td'), 2);
});
test('Liquid-generated syntax is processed before Markdown, raw protects contents', async () => {
  const html = await render('{% assign separator = "|" %}\n{{ separator }} One {{ separator }} Two {{ separator }}\n| --- | --- |\n| first | {% raw %}{{ literal }}{% endraw %} |\n');
  assert.match(html, /<td>first<\/td>/); assert.match(html, /<td>{{ literal }}<\/td>/);
});
test('processor implementation fingerprint participates in Astro config caching', () => {
  assert.equal(jekyllMarkdown('first').options.pipelineDigest, 'first');
  assert.notDeepEqual(jekyllMarkdown('first').options, jekyllMarkdown('changed').options);
  const config = readFileSync('astro.config.mjs', 'utf8');
  assert.match(config, /'shiki-theme.mjs'/);
});
for (const lang of ['', '-en', '-ja']) {
  for (const [stem, pres] of [
    ['2023-06-03-chrome-autocomplete-bug-fix', 9],
    ['2023-12-10-bitbucket-ssh-access-key-setup', 15],
    ['2026-11-08-bambulab-ams3h-instant-recognition', 0],
  ]) {
    test(`GFM corrected block structure: ${stem}${lang}.md`, async () => {
      const { body, data } = parseDocument(readFileSync(`_posts/${stem}${lang}.md`, 'utf8'));
      const { code } = await renderer.render(body, { frontmatter: data });
      assert.equal(count(code, 'pre'), pres); assert.equal(count(code, 'table'), 0);
      if (stem.includes('chrome-')) assert.doesNotMatch(code, /```/);
      if (stem.includes('bitbucket-')) {
        assert.equal(count(code, 'h1'), 1);
        const steps = code.match(/<h3[^>]*>[^<]*(?:핵심 단계|Key Steps|主要手順)<\/h3>\s*<ol>([\s\S]*?)<\/ol>/)?.[1];
        assert.ok(steps); const topSteps = steps.replace(/<ul>[\s\S]*?<\/ul>/g, ''); assert.equal(count(topSteps, 'li'), 5); assert.equal(count(steps, 'pre'), 4);
        assert.doesNotMatch(steps, /<ol\b/);
        const items = [...topSteps.matchAll(/<li>([\s\S]*?)<\/li>/g)];
        assert.equal(items.length, 5);
        [0, 1, 2, 4].forEach(i => assert.match(items[i][1], /<pre>/));
      }
      if (stem.includes('ams3h-')) assert.match(code, /<a href="https:\/\/www.youtube.com\/[^\"]+">[^<]*\|[^<]*<\/a>/);
    });
  }
}
