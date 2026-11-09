export type Section = 'maker' | 'dev' | 'game' | 'life';
export function sectionOf(post: { data: Record<string, any> }): Section {
  const { section, categories = [] } = post.data;
  if (['maker', 'dev', 'game', 'life'].includes(section)) return section;
  if (categories.includes('Life') && categories.includes('3D Printing')) return 'maker';
  return categories[0] === 'Life' ? 'life' : 'dev';
}
