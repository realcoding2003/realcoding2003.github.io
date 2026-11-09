import { satteri } from '@astrojs/markdown-satteri';
import { postMetadata } from './site.mjs';
import { renderLiquid } from './liquid.mjs';
import { normalizeKramdownFences, kramdownHeaderlessTables } from './kramdown.mjs';

/** Astro 7 processor API: preprocess raw source before the Markdown parser.
 * A remark AST transform would be too late for Liquid-generated Markdown/HTML.
 * @param {string} pipelineDigest
 * @returns {import('astro/markdown').MarkdownProcessor} */
export function jekyllMarkdown(pipelineDigest = 'standalone') {
  return {
    name: 'jekyll-liquid-satteri',
    options: { pipelineDigest },
    async createRenderer(shared) {
      const inline = await satteri({ mdastPlugins: [{
        name: 'kramdown-cell-links',
        options: { position: true },
        link(node, ctx) {
          // kramdown does not autolink bare URLs in these cells. Keep explicit
          // Markdown/angle-bracket links, but not GFM's literal-URL extension.
          if (ctx.source.slice(node.position?.start.offset, node.position?.end.offset) === node.url) {
            ctx.replaceNode(node, { type: 'text', value: node.url });
          }
        },
      }] }).createRenderer(shared);
      const markdown = satteri({ mdastPlugins: [kramdownHeaderlessTables(async cell => {
        const result = await inline.render(cell);
        return result.code.trim().replace(/^<p>([\s\S]*)<\/p>$/, '$1');
      })] });
      const renderer = await markdown.createRenderer(shared);
      return {
        async render(body, options) {
          const data = options?.frontmatter ?? {};
          const filename = options?.fileURL?.pathname.split('/').pop();
          const page = filename && /^\d{4}-\d{2}-\d{2}-/.test(filename)
            ? { ...data, url: postMetadata(filename, data).jekyllPath } : data;
          return renderer.render(normalizeKramdownFences(await renderLiquid(body, page)), options);
        },
      };
    },
  };
}
