import { readFileSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
export const DISPLAY = { body: 'swap', heading: 'optional', mono: 'swap' };
const files = new Map();
function fileUrl(family, source) {
  const url = `/fonts/files/${family}/${basename(source)}`;
  if (files.has(url) && files.get(url) !== source) throw new Error(`Font filename collision: ${url}`);
  files.set(url, source);
  return url;
}
function faces(source, family, role) {
  const css = readFileSync(source, 'utf8');
  return [...css.matchAll(/@font-face\s*\{([^}]+)\}/g)].map(([, body]) => {
    const original = body.match(/url\(\s*['"]?([^)'"\s]+\.woff2)['"]?\s*\)/)?.[1];
    if (!original) throw new Error(`No woff2 source in ${source}`);
    const url = fileUrl(family, resolve(dirname(source), original));
    body = body.replace(/src\s*:[^;]+;/g, `src:url("${url}") format("woff2");`)
      .replace(/font-display\s*:[^;]+;/g, `font-display:${DISPLAY[role]};`);
    if (!body.includes('font-display:')) body += `font-display:${DISPLAY[role]};`;
    return '@font-face{' + body.replace(/\s+/g, ' ').trim() + '}';
  }).join('\n');
}
const node = path => resolve('node_modules', path);
const pretendard = faces(node('pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css'), 'pretendard', 'body');
const wanted = faces(node('wanted-sans/fonts/webfonts/static/split/WantedSans-ExtraBold.css'), 'wanted', 'heading');
const line = [400, 700].map(weight => faces(node(`@fontsource/line-seed-jp/${weight}.css`), 'line-seed-jp', weight === 400 ? 'body' : 'heading')).join('\n');
export const archivoUrl = fileUrl('archivo', resolve('src/assets/fonts/archivo/archivo-rc-wide-800-latin.woff2'));
const archivo = `@font-face{font-family:"Archivo RC Wide";font-style:normal;font-weight:800;font-display:${DISPLAY.heading};src:url("${archivoUrl}") format("woff2");unicode-range:U+0020-007E,U+00A0-00FF,U+2013-2014,U+2018-201F,U+2026,U+20A9,U+20AC;}`;
// See src/assets/fonts/archivo/README.md for measured hmtx/hhea calculations.
const fallback = '@font-face{font-family:"Archivo RC Fallback";src:local("Arial Bold"),local("Arial-BoldMT"),local("Arial");font-weight:800;size-adjust:132.263997%;ascent-override:66.382388%;descent-override:15.877337%;line-gap-override:0%;}';
const monoUrl = fileUrl('geist-mono', node('@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2'));
const mono = `@font-face{font-family:"Geist Mono";font-style:normal;font-weight:100 900;font-display:${DISPLAY.mono};src:url("${monoUrl}") format("woff2");}`;
export const fontCss = { ko: [pretendard, wanted, archivo, mono].join('\n'), en: [pretendard, archivo, fallback, mono].join('\n'), ja: [line, archivo, fallback, mono].join('\n') };
export const fontFiles = [...files].map(([url, source]) => ({ url, source }));
