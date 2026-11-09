const container = document.querySelector<HTMLElement>('[data-comments]');
const theme = () => document.documentElement.dataset.theme === 'dark' ? 'github-dark' : 'github-light';
if (container) {
  let loaded = false;
  const load = () => {
    if (loaded) return; loaded = true;
    const script = document.createElement('script'); script.src = 'https://utteranc.es/client.js';
    script.setAttribute('repo', 'realcoding2003/realcoding2003.github.io'); script.setAttribute('issue-term', 'pathname');
    script.setAttribute('theme', theme()); script.crossOrigin = 'anonymous'; script.async = true; container.appendChild(script);
  };
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); load(); } }, { rootMargin: '800px 0px' });
    observer.observe(container);
  } else load();
  document.addEventListener('themechange', () => {
    container.querySelector<HTMLIFrameElement>('.utterances-frame')?.contentWindow?.postMessage({ type: 'set-theme', theme: theme() }, 'https://utteranc.es');
  });
}
export {};
