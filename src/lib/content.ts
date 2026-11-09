import { sectionOf, type Section } from './sections';
import { readingMinutes } from './reading-time';
import { postHeadings, type Heading } from './headings';
import { getCollection } from 'astro:content';
import { readFileSync } from 'node:fs';
import { postMetadata, RouteRegistry, languages, prefix, parseDocument } from './site.mjs';

export type Post = ReturnType<typeof postMetadata> & { html: string; hasMermaid: boolean; headings: Heading[]; section: Section; readingMinutes: number };
export type Page = { path: string; lang: string; kind: string; data: Record<string, any>; body: string };
export type Route = { path: string } & ({ kind: 'post'; post: Post } | { kind: 'redirect'; target: string } | { kind: 'page'; page: Page });

export async function getPosts(): Promise<Post[]> {
  const entries = await getCollection('posts');
  const now = Date.now();
  return entries.map(entry => {
    const meta = postMetadata(entry.id + '.md', entry.data);
    const html = entry.rendered?.html;
    if (html === undefined) throw new Error(`Missing rendered Markdown: ${entry.id}`);
    return { ...meta, html, headings: postHeadings(html, entry.rendered?.metadata), section: sectionOf(meta), readingMinutes: readingMinutes(html, meta.lang), hasMermaid: /<code\b[^>]*class="[^"]*language-mermaid/.test(html) };
  }).filter(post => post.date.getTime() <= now)
    .sort((a,b) => b.date.getTime() - a.date.getTime() || (a.filename < b.filename ? 1 : a.filename > b.filename ? -1 : 0));
}

export function getPages(): Page[] {
  const pages: Page[] = [];
  for (const lang of languages) {
    for (const kind of ['index', 'about', 'archive', 'categories', 'tags']) {
      const doc = parseDocument(readFileSync(`${lang === 'ko' ? '' : lang + '/'}${kind}.html`, 'utf8'));
      pages.push({ path: `${prefix(lang)}/${kind === 'index' ? '' : kind + '/'}`, lang, kind, ...doc });
    }
  }
  const privacy = parseDocument(readFileSync('privacy.md','utf8'));
  pages.push({ path: '/privacy/', lang: 'ko', kind: 'privacy', ...privacy });
  return pages;
}

/** This is the sole HTML route plan. Fail before Astro can overwrite a page. */
export async function getRoutes(): Promise<Route[]> {
  const posts = await getPosts(); const pages = getPages();
  const registry = new RouteRegistry(); const routes: Route[] = [];
  for (const path of ['/feed.xml', '/sitemap.xml', '/404.html', '/CNAME', '/ads.txt', '/robots.txt']) registry.add(path, 'static endpoint');
  for (const post of posts) {
    registry.add(post.path, post.filename);
    routes.push({ path: post.path, kind: 'post', post });
  }
  for (const page of pages) {
    registry.add(page.path, `page ${page.kind} ${page.lang}`);
    routes.push({ path: page.path, kind: 'page', page });
  }
  for (const post of posts) {
    for (const from of post.redirects) {
      if (from === post.path) continue; // Jekyll's two self-aliases are real posts.
      registry.add(from, `redirect from ${post.filename}`);
      routes.push({ path: from, kind: 'redirect', target: post.path });
    }
  }
  for (const page of pages) {
    const aliases = page.data.redirect_from || [];
    for (const from of typeof aliases === 'string' ? [aliases] : aliases) {
      if (from === page.path) continue;
      registry.add(from, `redirect from ${page.kind}`);
      routes.push({ path: from, kind: 'redirect', target: page.path });
    }
  }
  return routes;
}

export function postAlternates(post: Post, posts: Post[]) {
  const group = posts.filter(p => p.baseSlug === post.baseSlug);
  const alternates: Record<string, string> = {};
  for (const lang of languages) {
    const matches = group.filter(p => p.lang === lang);
    if (matches.length !== 1) throw new Error(`Translation group ${post.baseSlug}: ${lang} has ${matches.length} posts`);
    alternates[lang] = matches[0].path;
  }
  alternates['x-default'] = alternates.ko;
  return alternates;
}
