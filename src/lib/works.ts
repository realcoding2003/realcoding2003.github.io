import type { Post } from './content';
export interface RelatedWork {
  id: string; title: string; summary: string;
  image: { src: string; alt: string; width: number; height: number };
  link?: { href: string; label: string };
  stats: { material?: string; layer?: string; infill?: string; time?: string; filament?: string };
}
export function getRelatedWorks(_post: Post): RelatedWork[] { return []; }
