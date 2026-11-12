import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import { loadWorks } from './works-data.mjs';
const root = process.cwd();
function keys(value, allowed, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`Invalid ${label}`);
  for (const key of Object.keys(value)) if (!allowed.includes(key)) throw new Error(`Unknown key ${label}.${key}`);
}
function text(value, label) {
  if (typeof value !== 'string' || !value.trim() || /[\u2013\u2014]/u.test(value)) throw new Error(`Invalid text ${label}`);
}
/**
 * Pure Node loader; file and works-directory overrides permit isolated validation tests.
 * @returns {{src: string, work: string, alt: Record<string, string>}[]}
 */
export function loadGallery(file = resolve(root, 'src/data/gallery.yaml'), worksDirectory = resolve(root, 'src/data/works')) {
  const gallery = parse(readFileSync(file, 'utf8'));
  keys(gallery, ['items'], 'gallery');
  if (!Array.isArray(gallery.items) || !gallery.items.length) throw new Error('Invalid gallery.items');
  const works = new Set(loadWorks(worksDirectory).map(w => w.id));
  const sources = new Set();
  return gallery.items.map((item, i) => {
    const label = `gallery.items[${i}]`;
    keys(item, ['src','work','alt'], label);
    text(item.src, `${label}.src`);
    const image = resolve(root, '.' + item.src);
    if (!item.src.startsWith('/assets/') || !existsSync(image) || !statSync(image).isFile()) throw new Error(`Missing gallery image ${item.src}`);
    if (sources.has(item.src)) throw new Error(`Duplicate gallery src ${item.src}`);
    sources.add(item.src);
    if (!works.has(item.work)) throw new Error(`Unknown gallery work ${item.work}`);
    keys(item.alt, ['ko','en','ja'], `${label}.alt`);
    for (const lang of ['ko','en','ja']) text(item.alt[lang], `${label}.alt.${lang}`);
    return item;
  });
}
