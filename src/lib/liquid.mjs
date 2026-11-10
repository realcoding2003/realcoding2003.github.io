import { Liquid } from 'liquidjs';
import { config, translations, SITE } from './site.mjs';
// No filesystem includes, custom plugins, strict undefined variables, or writes.
const engine = new Liquid({ strictVariables: false, strictFilters: false, jekyllInclude: true });
engine.registerFilter('relative_url', value => `${config.baseurl || ''}${String(value || '').replace(/^([^/])/, '/$1')}`);
engine.registerFilter('absolute_url', value => SITE + String(value || '').replace(/^([^/])/, '/$1'));
engine.registerFilter('slugify', value => String(value || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, ''));
/** Liquid is evaluated on the complete raw body, BEFORE Markdown tokenization.
 * This deliberately includes code fences: Jekyll executes unprotected examples.
 * @param {string} body @param {Record<string, any>} page */
export async function renderLiquid(body, page) {
  if (!body.includes('{{') && !body.includes('{%')) return body;
  // Ruby Liquid defaults to lax parsing: malformed output tails such as JSX
  // `{{ opacity: isStale ? 0.7 : 1 }}` resolve the leading variable (undefined).
  // Preserve raw blocks first; only emulate this fallback when LiquidJS rejects
  // an individual output token. Valid expressions/filters are left untouched.
  body = body.replace(/({%[-]?\s*raw\s*[-]?%}[\s\S]*?{%[-]?\s*endraw\s*[-]?%})|{{([\s\S]*?)}}/g, (token, raw, expression) => {
    if (raw) return token;
    try { engine.parse(token); return token; } catch (error) {
      const variable = expression.trim().match(/^[\w.-]+/u)?.[0];
      if (!variable) throw error;
      return '{{ ' + variable + ' }}';
    }
  });
  return engine.parseAndRender(body, { site: { ...config, data: translations }, page });
}
