import { languages, prefix } from './site.mjs';
import type { Post, Page } from './content';
export const realms = ['ai','maker','dev','game','life'] as const;
export const slug = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');
export const alternatesFor = (suffix: string) => Object.fromEntries([...languages.map(lang => [lang,`${prefix(lang)}/${suffix}`]), ['x-default',`/${suffix}`]]);
export const pageAlternates = (page: Page) => alternatesFor(page.kind === 'index' ? '' : page.kind + '/');
export function years(posts: Post[]) {
  const map = new Map<string, Post[]>();
  for (const post of posts) { const year = String(post.date.getUTCFullYear()); map.set(year,[...map.get(year) || [],post]); }
  return [...map].sort(([a],[b]) => b.localeCompare(a));
}
export const duration = (seconds: number) => `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
