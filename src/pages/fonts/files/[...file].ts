import type { APIRoute } from 'astro';
import { readFileSync } from 'node:fs';
import { fontFiles } from '../../../lib/fonts.mjs';
export function getStaticPaths() {
  return fontFiles.map(({ url, source }) => ({ params: { file: url.replace('/fonts/files/', '') }, props: { source } }));
}
export const GET: APIRoute = ({ props }) => new Response(new Uint8Array(readFileSync(props.source)), { headers: { 'Content-Type': 'font/woff2' } });
