/** Single ink-panel theme, shared by collection and privacy rendering. */
export const shikiTheme = {
  name: 'realcoding-ink', type: /** @type {'dark'} */ ('dark'),
  colors: { 'editor.background': '#0C1130', 'editor.foreground': '#E7E9E2' },
  tokenColors: [
    { scope: ['keyword', 'storage', 'storage.type', 'storage.modifier', 'keyword.control', 'keyword.operator.new', 'entity.name.tag'], settings: { foreground: '#8FA2E8' } },
    { scope: ['string', 'string.quoted', 'string.template', 'markup.inline.raw'], settings: { foreground: '#C3CCF5' } },
    { scope: ['entity.name.type', 'entity.name.class', 'support.type', 'support.class', 'entity.other.attribute-name'], settings: { foreground: '#8FA2E8' } },
    { scope: ['entity.name.function', 'support.function', 'constant.numeric', 'constant.language', 'constant.character', 'support.constant'], settings: { foreground: '#F4F5F0' } },
    { scope: ['punctuation', 'keyword.operator', 'meta.brace'], settings: { foreground: '#A2A7BD' } },
    { scope: ['variable', 'variable.parameter'], settings: { foreground: '#E7E9E2' } },
    { scope: ['markup.heading'], settings: { foreground: '#E8C552', fontStyle: 'bold' } },
    { scope: ['markup.inserted'], settings: { foreground: '#E8C552' } },
    { scope: ['markup.deleted'], settings: { foreground: '#A2A7BD' } },
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#E8C552' } },
  ],
};
