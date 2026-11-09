import { getPosts } from '../lib/content';
import { absolute, config, escapeXml as x, SITE } from '../lib/site.mjs';
const cdata = (value: string) => '<![CDATA[' + value.replace(/]]>/g, ']]]]><![CDATA[>') + ']]>';
const date = (value: Date) => value.toISOString().replace('.000Z', '+00:00');
export async function GET() {
  // Jekyll-feed v0.17: ten newest posts, including all languages. Production
  // ties are en, ja, ko. Preserve the observed order for subscriber continuity.
  const priority: Record<string, number> = { en: 0, ja: 1, ko: 2 };
  const posts = (await getPosts()).filter(p => p.data.draft !== true).sort((a,b) => b.date.getTime() - a.date.getTime() || priority[a.lang] - priority[b.lang] || a.filename.localeCompare(b.filename)).slice(0, Number(config.feed?.posts_limit || 10));
  const entries = posts.map(post => {
    const d = post.data;
    const url = absolute(post.path);
    // post.id is its date-path URL without the final slash, NOT filename date.
    const id = url.replace(/\/$/, '');
    const summary = String(d.description || d.excerpt || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    const image = d.image?.path || d.image;
    return `<entry xml:lang="${x(post.lang)}"><title type="html">${x(d.title)}</title><link href="${x(url)}" rel="alternate" type="text/html" title="${x(d.title)}"/><published>${date(post.date)}</published><updated>${date(d.last_modified_at ? new Date(d.last_modified_at) : post.date)}</updated><id>${x(id)}</id><content type="html" xml:base="${x(url)}">${cdata(post.html)}</content><author><name>${x(d.author || config.author)}</name></author>${[...(d.categories || []), ...(d.tags || [])].map(term => `<category term="${x(term)}"/>`).join('')}${summary ? `<summary type="html">${cdata(summary)}</summary>` : ''}${image ? `<media:thumbnail xmlns:media="http://search.yahoo.com/mrss/" url="${x(String(image).startsWith('http') ? image : SITE + image)}"/><media:content xmlns:media="http://search.yahoo.com/mrss/" medium="image" url="${x(String(image).startsWith('http') ? image : SITE + image)}"/>` : ''}</entry>`;
  }).join('\n');
  const xml = `<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom"><generator uri="https://astro.build/" version="7.4.7">Astro</generator><link href="${SITE}/feed.xml" rel="self" type="application/atom+xml"/><link href="${SITE}/" rel="alternate" type="text/html"/><updated>${date(new Date())}</updated><id>${SITE}/feed.xml</id><title type="html">${x(config.title)}</title><subtitle>${x(config.description)}</subtitle><author><name>${x(config.author)}</name></author>\n${entries}\n</feed>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' } });
}
