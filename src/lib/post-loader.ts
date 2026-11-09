import { glob } from 'astro/loaders';
// The built-in default prefers data.slug; all three translations share that slug.
export function postLoader() {
  return glob({ base: './_posts', pattern: '*.md', generateId: ({ entry }) => entry.replace(/\.md$/, '') });
}
