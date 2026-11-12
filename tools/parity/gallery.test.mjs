import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parse } from 'yaml';
import { loadGallery } from '../../src/lib/gallery-data.mjs';
import { loadWorks } from '../../src/lib/works-data.mjs';

test('the curated gallery has 14 ordered photos, localized alt text and existing works', () => {
  const gallery = loadGallery();
  const works = new Set(loadWorks().map(w => w.id));
  assert.equal(gallery.length, 14);
  assert.deepEqual(gallery, parse(readFileSync('src/data/gallery.yaml', 'utf8')).items);
  assert.equal(new Set(gallery.map(item => item.src)).size, gallery.length);
  for (const item of gallery) {
    assert.ok(works.has(item.work));
    for (const lang of ['ko','en','ja']) assert.ok(item.alt[lang].trim());
  }
});

function invalid(mutator, message) {
  const dir = mkdtempSync(join(tmpdir(), 'rc-gallery-'));
  try {
    const input = { items: [structuredClone(loadGallery()[0])] };
    mutator(input);
    const file = join(dir, 'gallery.yaml');
    writeFileSync(file, JSON.stringify(input));
    assert.throws(() => loadGallery(file), message);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

test('gallery rejects an unknown work id', () => invalid(g => { g.items[0].work = 'not-a-work'; }, /Unknown gallery work/));
test('gallery rejects a missing image file', () => invalid(g => { g.items[0].src = '/assets/missing-gallery-image.jpg'; }, /Missing gallery image/));
test('gallery rejects sources outside assets', () => invalid(g => { g.items[0].src = '/package.json'; }, /Missing gallery image/));
test('gallery rejects a directory in place of an image', () => invalid(g => { g.items[0].src = '/assets/'; }, /Missing gallery image/));
test('gallery rejects duplicate sources', () => invalid(g => { g.items.push(structuredClone(g.items[0])); }, /Duplicate gallery src/));
test('gallery rejects unknown item keys', () => invalid(g => { g.items[0].typo = true; }, /Unknown key/));
test('gallery rejects unknown top-level keys', () => invalid(g => { g.typo = true; }, /Unknown key/));
test('gallery rejects unknown alt languages', () => invalid(g => { g.items[0].alt.fr = 'Photo'; }, /Unknown key/));
for (const lang of ['ko','en','ja']) {
  test(`gallery rejects missing ${lang} alt`, () => invalid(g => { delete g.items[0].alt[lang]; }, /Invalid text/));
  test(`gallery rejects blank ${lang} alt`, () => invalid(g => { g.items[0].alt[lang] = '  '; }, /Invalid text/));
}
for (const dash of ['\u2013','\u2014']) {
  test(`gallery rejects long dash U+${dash.codePointAt(0).toString(16)} in alt`, () => invalid(g => { g.items[0].alt.en += dash; }, /Invalid text/));
}
for (const [label, value] of [['empty', []], ['non-array', {}], ['missing', undefined]]) {
  test(`gallery rejects ${label} items`, () => invalid(g => { g.items = value; }, /Invalid gallery.items/));
}
test('gallery rejects a non-object item', () => invalid(g => { g.items[0] = null; }, /Invalid gallery.items\[0\]/));
test('gallery rejects a non-string alt', () => invalid(g => { g.items[0].alt.en = 123; }, /Invalid text/));
test('gallery accepts isolated gallery-file and works-directory overrides', () => {
  const dir = mkdtempSync(join(tmpdir(), 'rc-gallery-'));
  try {
    const worksDir = join(dir, 'works'); mkdirSync(worksDir);
    const work = loadWorks()[0];
    writeFileSync(join(worksDir, `${work.id}.yaml`), JSON.stringify(work));
    const item = { ...loadGallery()[0], work: work.id };
    const file = join(dir, 'gallery.yaml');
    writeFileSync(file, JSON.stringify({ items: [item] }));
    assert.deepEqual(loadGallery(file, worksDir), [item]);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
