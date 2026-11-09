import { defineConfig } from 'astro/config';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { jekyllMarkdown } from './src/lib/markdown.mjs';
// Collection HTML is cached by source/config digest, not imported processor
// implementation. Fingerprint it here, before Vite bundles runtime modules.
const pipelineDigest = createHash('sha256');
for (const file of ['markdown.mjs', 'kramdown.mjs', 'liquid.mjs', 'site.mjs']) {
  pipelineDigest.update(readFileSync(new URL('./src/lib/' + file, import.meta.url)));
}
export default defineConfig({
  site: 'https://realcoding.blog',
  output: 'static',
  prerenderConflictBehavior: 'error',
  trailingSlash: 'always',
  build: { format: 'directory' },
  markdown: { processor: jekyllMarkdown(pipelineDigest.digest('hex')), syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid', 'math'] } },
});
