import { getRoutes } from '../lib/content';
import { absolute, escapeXml } from '../lib/site.mjs';
export async function GET() {
  const urls = (await getRoutes()).filter(route => route.kind !== 'redirect' && route.path !== '/privacy/');
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.map(route => `  <url><loc>${escapeXml(absolute(route.path))}</loc></url>`).join('\n') + '\n</urlset>\n';
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
