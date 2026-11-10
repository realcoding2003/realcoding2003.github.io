import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { parse } from 'yaml';
const root = process.cwd();
function keys(value, allowed, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`Invalid ${label}`);
  for (const key of Object.keys(value)) if (!allowed.includes(key)) throw new Error(`Unknown key ${label}.${key}`);
}
function text(value, label) {
  if (typeof value !== 'string' || !value.trim() || /[\u2013\u2014]/u.test(value)) throw new Error(`Invalid text ${label}`);
}
function translated(value, label) {
  keys(value, ['ko','en','ja'], label);
  for (const lang of ['ko','en','ja']) text(value[lang], `${label}.${lang}`);
}
/** Pure Node loader; a directory override permits isolated validation tests. */
export function loadWorks(directory = resolve(root, 'src/data/works')) {
  const homes = new Set();
  return readdirSync(directory).filter(file => file.endsWith('.yaml')).map(file => {
    const w = parse(readFileSync(resolve(directory,file), 'utf8'));
    keys(w, ['id','date','home','title','summary','posts','image','shorts','long','makerworld','printers','material','time','filament','layer'], file);
    if (!/^\d{4}-\d{2}-\d{2}_[a-z0-9-]+$/.test(w.id) || w.id !== basename(file,'.yaml') || w.date !== w.id.slice(0,10) || !Number.isFinite(Date.parse(w.date))) throw new Error(`Invalid id/date ${file}`);
    translated(w.title, 'title'); translated(w.summary, 'summary');
    for (const key of ['posts','printers']) if (!Array.isArray(w[key]) || w[key].some(v => typeof v !== 'string' || !v)) throw new Error(`Invalid ${key}`);
    if (w.home !== undefined) {
      if (!Number.isInteger(w.home) || w.home < 1 || w.home > 5 || homes.has(w.home)) throw new Error(`Invalid/duplicate home ${w.home}`);
      homes.add(w.home);
    }
    if (w.image !== undefined) {
      keys(w.image,['src','alt'],'image'); text(w.image.src,'image.src'); translated(w.image.alt,'image.alt');
      if (!w.image.src.startsWith('/assets/') || !existsSync(resolve(root,'.'+w.image.src))) throw new Error(`Missing image ${w.image.src}`);
    }
    for (const key of ['shorts','long']) if (w[key] !== undefined) {
      keys(w[key], ['id','seconds'], key);
      if (!/^[\w-]{11}$/.test(w[key].id) || !Number.isInteger(w[key].seconds) || w[key].seconds <= 0) throw new Error(`Invalid ${key}`);
    }
    if (!w.image && !w.shorts && !w.long) throw new Error(`No thumbnail ${file}`);
    if (w.makerworld !== undefined && (!Number.isInteger(w.makerworld) || w.makerworld <= 0)) throw new Error('Invalid makerworld');
    for (const key of ['material','time','filament','layer']) if (w[key] !== undefined) text(w[key], key);
    return w;
  }).sort((a,b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}
