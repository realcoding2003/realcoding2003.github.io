import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

export const SITE = 'https://realcoding.blog';
export const languages = /** @type {const} */ (['ko', 'en', 'ja']);
export const config = parse(readFileSync('_config.yml', 'utf8'));
export const translations = Object.fromEntries(languages.map(lang => [lang, parse(readFileSync(`_data/${lang}.yml`, 'utf8'))]));
export const prefix = (/** @type {string} */ lang) => lang === 'ko' ? '' : `/${lang}`;
export const absolute = (/** @type {string} */ path) => SITE + path;
export const escapeXml = (/** @type {unknown} */ value) => String(value ?? '').replace(/[<>&"']/g, c => ({ '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;', "'":'&apos;' })[c]);

/** @param {string} source */
export function parseDocument(source) {
  const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  return { data: match ? parse(match[1]) : {}, body: match ? source.slice(match[0].length) : source };
}

/** Jekyll's unset timezone is UTC. Dates in filenames are only a fallback.
 * @param {unknown} raw @param {string} filename */
export function postDate(raw, filename) {
  let value = String(raw || filename.slice(0, 10));
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) value += 'T00:00:00Z';
  value = value.replace(/^(\d{4}-\d{2}-\d{2})\s+/, '$1T').replace(/\s+([+-]\d{2})(\d{2})$/, '$1:$2');
  if (!/(Z|[+-]\d{2}:?\d{2})$/.test(value)) value += 'Z';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) throw new Error(`Invalid post date: ${filename}: ${raw}`);
  return date;
}

/** @param {string} path */
export function htmlPath(path) {
  if (!path.startsWith('/') || /[?#\\]|\/\//.test(path) || path.split('/').includes('..')) throw new Error(`Unsafe route: ${path}`);
  return path.endsWith('/') || /\.[a-z]+$/i.test(path) ? path : path + '/';
}

/** @param {string} filename @param {Record<string, any>} data */
export function postMetadata(filename, data) {
  const stem = filename.replace(/\.md$/, '');
  const filenameSlug = stem.slice(11);
  const lang = String(data.lang || (/-en$/.test(stem) ? 'en' : /-ja$/.test(stem) ? 'ja' : 'ko'));
  const date = postDate(data.date, filename);
  const [year, month, day] = date.toISOString().slice(0,10).split('-');
  const slug = String(data.slug || filenameSlug);
  const baseSlug = slug.replace(/-(en|ja)$/, '');
  const jekyllPath = htmlPath(data.permalink
    ? String(data.permalink).replace(/:year/g, year).replace(/:month/g, month).replace(/:day/g, day).replace(/:title/g, slug)
    : `/${year}/${month}/${day}/${filenameSlug}/`);
  const path = (lang === 'en' || lang === 'ja') && !jekyllPath.startsWith(`/${lang}/`)
    ? `/${lang}/${year}/${month}/${day}/${baseSlug}/` : jekyllPath;
  const redirects = (Array.isArray(data.redirect_from) ? data.redirect_from : data.redirect_from ? [data.redirect_from] : []).map(htmlPath);
  if (path !== jekyllPath && !redirects.includes(jekyllPath)) redirects.push(jekyllPath);
  return { filename, data, lang, date, path, jekyllPath, baseSlug, redirects, normalized: path !== jekyllPath };
}

/** Route uniqueness is based on output filenames, not only URL spelling. */
export class RouteRegistry {
  paths = new Map();
  /** @param {string} path @param {string} owner */
  add(path, owner) {
    path = htmlPath(path);
    const output = decodeURIComponent(path.endsWith('/') ? path + 'index.html' : path).replace(/^\//, '');
    if (this.paths.has(output)) throw new Error(`Route collision at ${path}: ${this.paths.get(output)} / ${owner}`);
    this.paths.set(output, owner);
  }
}

/** Jekyll sorts equal dates by filename (without its locale-sensitive collation).
 * @param {ReturnType<typeof postMetadata>[]} posts */
export function sortPosts(posts) {
  return posts.sort((a,b) => b.date.getTime() - a.date.getTime() || (a.filename < b.filename ? 1 : a.filename > b.filename ? -1 : 0));
}
