const links = [...document.querySelectorAll<HTMLAnchorElement>('.toc-rail [data-toc-id]')];
const headings = links.map(link => document.getElementById(link.dataset.tocId || '')).filter((h): h is HTMLElement => !!h);
if (headings.length) {
  const update = () => {
    // Match native anchor landing: scroll-padding plus the heading's extra gap.
    const offset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) + parseFloat(getComputedStyle(headings[0]).scrollMarginTop);
    const current = headings.findLast(heading => heading.getBoundingClientRect().top <= offset + 1) || headings[0];
    links.forEach(link => link.setAttribute('aria-current', link.dataset.tocId === current.id ? 'location' : 'false'));
  };
  // Track top crossings, not the bottom of a still-intersecting heading.
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
}
export {};
