import { createHash } from 'node:crypto';
import { readFile, mkdir, access, copyFile, readdir } from 'node:fs/promises';
import { resolve, join, sep, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const cache = resolve(process.env.RC_IMAGE_CACHE || 'node_modules/.cache/rc-images');
const prefix = '/_images/rc/';
const options = { widths: [480, 768, 960, 1440], quality: 75, effort: 4, version: sharp.versions.sharp, vips: sharp.versions.vips, webp: sharp.versions.webp };
const pending = new Map();

// Content and encoder settings, not pathname or mtime, identify reusable output.
export function responsiveImage(src) {
  if (!src.startsWith('/assets/images/posts/')) return Promise.resolve(null);
  if (!pending.has(src)) pending.set(src, generate(src));
  return pending.get(src);
}
async function generate(src) {
  try {
    const path = resolve(decodeURIComponent(src.slice(1)));
    if (!path.startsWith(resolve('assets/images/posts') + sep)) throw new Error('Outside post images');
    const input = await readFile(path);
    const meta = await sharp(input).metadata();
    // Preserve animation/vector originals rather than flattening their content.
    if (!['jpeg', 'png', 'webp'].includes(meta.format) || (meta.pages || 1) > 1) return null;
    const rotated = [5, 6, 7, 8].includes(meta.orientation);
    const width = rotated ? meta.height : meta.width, height = rotated ? meta.width : meta.height;
    const hash = createHash('sha256').update(input).update(JSON.stringify(options)).digest('hex');
    const widths = [...new Set(options.widths.map(value => Math.min(value, width)))];
    await mkdir(cache, { recursive: true });
    const variants = await Promise.all(widths.map(async width => {
      const name = `${hash}-${width}.webp`, target = join(cache, name);
      try { await access(target); } catch {
        await sharp(input).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: options.quality, effort: options.effort }).toFile(target);
      }
      return { width, src: prefix + name };
    }));
    return { width, height, variants };
  } catch (error) {
    console.warn(`[responsive-image] ${src}: ${String(error)}`);
    return null;
  }
}

async function* htmlFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(path);
    else if (entry.name.endsWith('.html')) yield path;
  }
}
export function responsiveImages() {
  return { name: 'rc-responsive-images', hooks: {
    'astro:build:done': async ({ dir, logger }) => {
      const root = fileURLToPath(dir), names = new Set();
      for await (const file of htmlFiles(root)) {
        const html = await readFile(file, 'utf8');
        for (const [url] of html.matchAll(/\/_images\/rc\/[a-f0-9]{64}-\d+\.webp/g)) names.add(basename(url));
      }
      await mkdir(join(root, prefix), { recursive: true });
      for (const name of names) await copyFile(join(cache, name), join(root, prefix, name));
      logger.info(`Emitted ${names.size} cached responsive WebP variants`);
    },
  } };
}
