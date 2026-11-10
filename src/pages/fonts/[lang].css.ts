import type { APIRoute } from 'astro';
import { fontCss } from '../../lib/fonts.mjs';
export function getStaticPaths() {
  return Object.entries(fontCss).map(([lang, css]) => ({ params: { lang }, props: { css } }));
}
export const GET: APIRoute = ({ props }) => new Response(props.css, { headers: { 'Content-Type': 'text/css; charset=utf-8' } });
