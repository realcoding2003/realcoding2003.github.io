import { bodyText } from './reading-time';
export interface Heading { depth: number; slug: string; text: string }
export function postHeadings(html: string, metadata?: Record<string, unknown>): Heading[] {
  if (Array.isArray(metadata?.headings)) return metadata.headings.filter((h): h is Heading => h && (h.depth === 2 || h.depth === 3) && typeof h.slug === 'string' && typeof h.text === 'string');
  return [...html.matchAll(/<h([23])\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g)]
    .map(m => ({ depth: Number(m[1]), slug: bodyText(m[2]), text: bodyText(m[3]) }));
}
