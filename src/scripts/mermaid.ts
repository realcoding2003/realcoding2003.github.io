import { attachZoom } from './image-zoom';
const article = document.querySelector('article[data-has-mermaid]');
if (article) {
  const blocks = [...article.querySelectorAll<HTMLElement>('pre:has(> code.language-mermaid)')].map(pre => ({ pre, source: pre.textContent || '', figure: undefined as HTMLElement | undefined }));
  let library: ReturnType<typeof importLibrary> | undefined;
  const importLibrary = () => import('mermaid').then(module => module.default);
  let queue = Promise.resolve(); let sequence = 0;
  const render = (block: typeof blocks[number]) => {
    queue = queue.then(async () => {
      try {
        const mermaid = await (library ||= importLibrary());
        const dark = document.documentElement.dataset.theme === 'dark';
        mermaid.initialize({ startOnLoad: false, securityLevel: 'loose', theme: 'base', fontFamily: getComputedStyle(article).fontFamily,
          themeVariables: dark ? { darkMode: true, background: 'transparent', primaryColor: '#121A44', primaryBorderColor: '#A2A7BD', primaryTextColor: '#E7E9E2', secondaryColor: '#26306B', tertiaryColor: '#0C1130', lineColor: '#A2A7BD', textColor: '#E7E9E2' }
          : { background: 'transparent', primaryColor: '#FFFFFF', primaryBorderColor: '#26306B', primaryTextColor: '#0C1130', secondaryColor: '#E7E9E2', tertiaryColor: '#F4F5F0', lineColor: '#26306B', textColor: '#0C1130' },
        });
        const { svg, bindFunctions } = await mermaid.render(`rc-diagram-${++sequence}`, block.source);
        const figure = document.createElement('figure'); figure.className = 'mermaid-figure'; figure.dataset.source = block.source; figure.innerHTML = svg;
        if (block.figure) block.figure.replaceWith(figure); else block.pre.after(figure);
        block.figure = figure; block.pre.dataset.source = block.source; block.pre.hidden = true;
        bindFunctions?.(figure); const rendered = figure.querySelector<SVGSVGElement>('svg'); if (rendered) attachZoom(rendered);
      } catch (error) { block.pre.hidden = false; block.figure?.remove(); block.figure = undefined; console.warn('Mermaid render failed', error); }
    });
  };
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) { const block = blocks.find(b => b.pre === entry.target); if (block) render(block); observer.unobserve(entry.target); }
    }, { rootMargin: '200px 0px' });
    blocks.forEach(block => observer.observe(block.pre));
  } else blocks.forEach(render);
  document.addEventListener('themechange', () => blocks.filter(block => block.figure).forEach(render));
}
export {};
