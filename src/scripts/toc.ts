const links = [...document.querySelectorAll<HTMLAnchorElement>('.toc-rail [data-toc-id]')];
const headings = links.map(link => document.getElementById(link.dataset.tocId || '')).filter((h): h is HTMLElement => !!h);
if (headings.length && 'IntersectionObserver' in window) {
  const update = () => {
    const passed = headings.filter(heading => heading.getBoundingClientRect().top <= 1);
    const current = passed.at(-1) || headings[0];
    links.forEach(link => { if (link.dataset.tocId === current.id) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
  };
  const observer = new IntersectionObserver(update, { rootMargin: '0px 0px -70% 0px' });
  headings.forEach(heading => observer.observe(heading)); update();
}
export {};
