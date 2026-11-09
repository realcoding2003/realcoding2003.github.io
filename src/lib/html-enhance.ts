import { readFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { imageSize } from 'image-size';
import { responsiveImage } from './responsive-images.mjs';
const dimensions = new Map<string, { width: number; height: number } | null>();
function attribute(tag: string, name: string): string | undefined {
  return tag.match(new RegExp('\\s' + name + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i'))?.slice(1).find(v => v !== undefined);
}
function setAttribute(tag: string, name: string, value: string): string {
  const re = new RegExp('\\s' + name + '(?:\\s*=\\s*(?:"[^"]*"|\'[^\']*\'|[^\\s>]+))?', 'i');
  return re.test(tag) ? tag.replace(re, ` ${name}="${value}"`) : tag.replace(/\s*\/?>$/, end => ` ${name}="${value}"${end}`);
}
export async function enhanceHtml(html: string): Promise<string> {
  const firstH2 = html.search(/<h2\b/i);
  let lead = false;
  const replacements = await Promise.all([...html.matchAll(/<(img|iframe)\b[^>]*>/gi)].map(async match => {
    let [tag, element] = match; const offset = match.index;
    if (element.toLowerCase() === 'iframe') return attribute(tag, 'loading') === undefined ? setAttribute(tag, 'loading', 'lazy') : tag;
    tag = setAttribute(tag, 'decoding', 'async');
    if (attribute(tag, 'loading') === undefined) tag = setAttribute(tag, 'loading', 'lazy');
    if (!lead && (firstH2 < 0 || offset < firstH2)) {
      tag = setAttribute(setAttribute(tag, 'loading', 'eager'), 'fetchpriority', 'high'); lead = true;
    } else tag = tag.replace(/\sfetchpriority\s*=\s*(["'])high\1/gi, '');
    const src = attribute(tag, 'src');
    if (src?.startsWith('/assets/') && (!attribute(tag, 'width') || !attribute(tag, 'height'))) {
      if (!dimensions.has(src)) {
        try {
          const path = resolve(decodeURIComponent(src.slice(1)));
          if (!path.startsWith(resolve('assets') + sep)) throw new Error('Outside assets');
          const { width, height } = imageSize(readFileSync(path));
          dimensions.set(src, { width, height });
        } catch (error) { dimensions.set(src, null); console.warn(`[image-size] ${src}: ${String(error)}`); }
      }
      const size = dimensions.get(src);
      if (size) {
        if (!attribute(tag, 'width')) tag = setAttribute(tag, 'width', String(size.width));
        if (!attribute(tag, 'height')) tag = setAttribute(tag, 'height', String(size.height));
      }
    }
    if (src) {
      const image = await responsiveImage(src);
      if (image) {
        const srcset = image.variants.map((v: { src: string; width: number }) => `${v.src} ${v.width}w`).join(', ');
        // Mobile leads use the viewport; all other media retain the reading measure.
        const sizes = attribute(tag, 'fetchpriority') === 'high'
          ? '(max-width: 639px) 100vw, min(41rem, calc(100vw - clamp(2.5rem, 8vw, 4rem)))'
          : 'min(41rem, calc(100vw - clamp(2.5rem, 8vw, 4rem)))';
        return `<picture><source type="image/webp" srcset="${srcset}" sizes="${sizes}">${tag}</picture>`;
      }
    }
    return tag;
  }));
  let index = 0;
  return html.replace(/<(img|iframe)\b[^>]*>/gi, () => replacements[index++]);
}
