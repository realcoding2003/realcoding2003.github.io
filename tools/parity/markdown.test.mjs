import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { jekyllMarkdown } from '../../src/lib/markdown.mjs';
import { normalizeKramdownFences, pipeCells } from '../../src/lib/kramdown.mjs';
import { parseDocument } from '../../src/lib/site.mjs';

const renderer = await jekyllMarkdown().createRenderer({ syntaxHighlight: false });
const render = async body => (await renderer.render(body)).code;
const count = (html, tag) => (html.match(new RegExp('<' + tag + '\\b', 'g')) || []).length;

test('list collection splits a fence before a nested ordered list (kramdown order)', async () => {
  const body = '1. **Steps**\n   ```\n   Order matters:\n   1. First\n   2. Second\n   ```\n';
  const html = await render(body);
  assert.equal(count(html, 'pre'), 0);
  assert.equal(count(html, 'ol'), 2);
  assert.match(html, /```\nOrder matters:/);
  assert.match(html, /Second\n```/);
});

test('a blank + unindented line ends the collected list before the closing fence', async () => {
  const body = '2. **Agent**\n```bash\n# Start\neval agent\n\n# Register\nssh-add key\n```\n\n3. **Copy**\n```bash\ncat key.pub\n```\n';
  const html = await render(body);
  assert.equal(count(html, 'pre'), 1);
  assert.match(html, /<h1[^>]*>Start<\/h1>/);
  assert.match(html, /3\. \*\*Copy\*\*\n```bash\ncat key.pub/);
});

test('valid root/list fences, tildes, Mermaid, and raw HTML remain intact', async () => {
  const body = '```mermaid\ngraph TD\n  A --> B\n```\n\n1. Commands\n   ~~~sh\n   echo ok\n   ~~~\n\n<div style="width: 100%">literal | ```</div>\n';
  assert.equal(normalizeKramdownFences(body), body);
  const html = await render(body);
  assert.equal(count(html, 'pre'), 2);
  assert.match(html, /<code class="language-mermaid">/);
  assert.match(html, /<div style="width: 100%">literal \| ```<\/div>/);
  assert.equal(count(html, 'table'), 0);
});

test('headerless tables split pipes before inline links, not inside escaped/code pipes', async () => {
  const html = await render('- Video: [Title | detail](https://example.com/video)\n- AI voice\n');
  assert.equal(count(html, 'table'), 1);
  assert.equal(count(html, 'th'), 0);
  assert.match(html, /<td>Video: \[Title<\/td><td>detail\]\(/);
  assert.equal(count(html, 'a'), 0);
  assert.match(await render('**one** | [link](https://example.com/)'), /<td><strong>one<\/strong><\/td><td><a href=/);
  assert.equal(count(await render('ordinary \\| text and `code | span`'), 'table'), 0);
  assert.deepEqual(pipeCells('one | `two | three` | <code>four | five</code> | six \\| seven'),
    ['one', '`two | three`', '<code>four | five</code>', 'six \\| seven']);
  const table = await render('| One | Two |\n| --- | --- |\n| 1 | 2 |\n');
  assert.equal(count(table, 'table'), 1);
  assert.equal(count(table, 'th'), 2);
});

test('Liquid-generated table syntax is processed after Liquid, raw protects its contents', async () => {
  const html = await render('{% assign separator = "|" %}\n- first {{ separator }} {% raw %}{{ literal }}{% endraw %}\n');
  assert.match(html, /<td>first<\/td><td>{{ literal }}<\/td>/);
});

test('processor implementation fingerprint participates in Astro config caching', () => {
  assert.equal(jekyllMarkdown('first').options.pipelineDigest, 'first');
  assert.notDeepEqual(jekyllMarkdown('first').options, jekyllMarkdown('changed').options);
});

for (const lang of ['', '-en', '-ja']) {
  for (const [stem, pres, tables] of [
    ['2023-06-03-chrome-autocomplete-bug-fix', 8, 0],
    ['2023-12-10-bitbucket-ssh-access-key-setup', 14, 0],
    ['2026-11-08-bambulab-ams3h-instant-recognition', 0, 1],
  ]) {
    test(`production block structure: ${stem}${lang}.md`, async () => {
      const { body, data } = parseDocument(readFileSync(`_posts/${stem}${lang}.md`, 'utf8'));
      const { code } = await renderer.render(body, { frontmatter: data });
      assert.equal(count(code, 'pre'), pres);
      assert.equal(count(code, 'table'), tables);
    });
  }
}
