import type { Post } from './content';
import { loadWorks } from './works-data.mjs';
import { imageDimensions } from './html-enhance';
import { makerworldModel, languages } from './site.mjs';
import { portalCopy } from './portal-copy';
import { i18n } from './i18n';
export interface Work {
  id: string; date: string; home?: number; title: string; summary: string;
  posts: { baseSlug: string; path: string; title: string }[];
  image?: { src: string; alt: string; width: number; height: number };
  thumb: { src: string; width: number; height: number; external: boolean };
  shorts?: { id: string; seconds: number; url: string };
  long?: { id: string; seconds: number; url: string };
  makerworld?: { id: number; url: string };
  printers: string[]; material?: string; time?: string; filament?: string; layer?: string;
}
export interface RelatedWork {
  id: string; title: string; summary: string;
  image: { src: string; alt: string; width: number; height: number; external?: boolean };
  link?: { href: string; label: string };
  stats: { printer?: string; material?: string; layer?: string; infill?: string; time?: string; filament?: string };
}
const raw = loadWorks();
export function getWorks(lang: string, posts: Post[]): Work[] {
  return raw.map(w => {
    for (const slug of w.posts) for (const code of languages) {
      if (posts.filter(p => p.baseSlug === slug && p.lang === code).length !== 1) throw new Error(`Work ${w.id}: missing/duplicate ${slug} ${code}`);
    }
    const image = w.image ? { src: w.image.src, alt: w.image.alt[lang], ...imageDimensions(w.image.src) } : undefined;
    return { ...w, title: w.title[lang], summary: w.summary[lang], image,
      posts: w.posts.map((slug: string) => { const post = posts.find(p => p.baseSlug === slug && p.lang === lang)!; return { baseSlug: slug, path: post.path, title: String(post.data.title) }; }),
      thumb: image ? { ...image, external: false } : w.long
        ? { src: `https://i.ytimg.com/vi/${w.long.id}/maxresdefault.jpg`, width: 1280, height: 720, external: true }
        : { src: `https://i.ytimg.com/vi/${w.shorts.id}/hqdefault.jpg`, width: 480, height: 360, external: true },
      shorts: w.shorts ? { ...w.shorts, url: `https://www.youtube.com/shorts/${w.shorts.id}` } : undefined,
      long: w.long ? { ...w.long, url: `https://www.youtube.com/watch?v=${w.long.id}` } : undefined,
      makerworld: w.makerworld ? { id: w.makerworld, url: makerworldModel(w.makerworld) } : undefined,
    };
  });
}
export function getRelatedWorks(post: Post, posts: Post[]): RelatedWork[] {
  return getWorks(post.lang, posts).filter(w => w.posts.some(p => p.baseSlug === post.baseSlug)).map(w => ({
    id: w.id, title: w.title, summary: w.summary, image: { ...w.thumb, alt: w.image?.alt || w.title },
    link: w.makerworld ? { href: w.makerworld.url, label: i18n[post.lang].relatedLink }
      : { href: (w.shorts || w.long)!.url, label: portalCopy[post.lang]['work.watch'] },
    stats: { printer: w.printers.join(' · ') || undefined, material: w.material, time: w.time, filament: w.filament, layer: w.layer },
  }));
}
