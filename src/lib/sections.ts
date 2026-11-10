export type Section = 'ai' | 'maker' | 'dev' | 'game' | 'life';
export const AI_TAGS = ['AI', 'Claude', 'MCP', 'LLM', 'ChatGPT', 'GPT', 'Codex', 'Gemini', 'AI에이전트'] as const;
export function sectionOf(post: { data: Record<string, any> }): Section {
  const { section, categories = [], tags = [] } = post.data;
  if (['ai', 'maker', 'dev', 'game', 'life'].includes(section)) return section;
  if (categories.includes('Life') && categories.includes('3D Printing')) return 'maker';
  if (categories.includes('AI') || tags.some((tag: string) => (AI_TAGS as readonly string[]).includes(tag))) return 'ai';
  return categories[0] === 'Life' ? 'life' : 'dev';
}

/** Korean is the translation group's source of truth; explicit per-file overrides win. */
export function sectionsForPosts(posts: { baseSlug: string; lang: string; data: Record<string, any> }[], warn: (message: string) => void = console.warn): Section[] {
  const originals = new Map(posts.filter(post => post.lang === 'ko').map(post => [post.baseSlug, post]));
  const groups = new Map<string, Set<Section>>();
  const sections = posts.map(post => {
    const explicit = ['ai', 'maker', 'dev', 'game', 'life'].includes(post.data.section);
    const section = sectionOf(explicit ? post : originals.get(post.baseSlug) || post);
    if (!groups.has(post.baseSlug)) groups.set(post.baseSlug, new Set());
    groups.get(post.baseSlug)!.add(section);
    return section;
  });
  for (const [slug, values] of groups) {
    if (values.size > 1) warn(`[sections] Translation group ${slug} has conflicting sections: ${[...values].join(', ')} (explicit per-file section preserved)`);
  }
  return sections;
}
