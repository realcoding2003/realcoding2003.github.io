import { satteri } from '@astrojs/markdown-satteri';
import { postMetadata } from './site.mjs';
import { renderLiquid } from './liquid.mjs';

/** Astro 7 processor API: preprocess raw source before the Markdown parser.
 * A remark AST transform would be too late for Liquid-generated Markdown/HTML.
 * @param {string} pipelineDigest
 * @returns {import('astro/markdown').MarkdownProcessor} */
export function jekyllMarkdown(pipelineDigest = 'standalone') {
  return {
    name: 'jekyll-liquid-satteri',
    options: { pipelineDigest },
    async createRenderer(shared) {
      const renderer = await satteri().createRenderer(shared);
      return {
        async render(body, options) {
          const data = options?.frontmatter ?? {};
          const filename = options?.fileURL?.pathname.split('/').pop();
          const page = filename && /^\d{4}-\d{2}-\d{2}-/.test(filename)
            ? { ...data, url: postMetadata(filename, data).jekyllPath } : data;
          return renderer.render(await renderLiquid(body, page), options);
        },
      };
    },
  };
}
