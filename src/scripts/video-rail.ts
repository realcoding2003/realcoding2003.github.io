for (const root of document.querySelectorAll<HTMLElement>('[data-video-rail]')) {
  const rail = root.querySelector<HTMLUListElement>('.video-rail')!;
  const prev = root.querySelector<HTMLButtonElement>('[data-prev]')!, next = root.querySelector<HTMLButtonElement>('[data-next]')!;
  const move = (sign: number) => rail.scrollBy({ left: sign * 2 * (rail.children[0].getBoundingClientRect().width + 16), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  prev.addEventListener('click', () => move(-1)); next.addEventListener('click', () => move(1));
  const observer = new IntersectionObserver(entries => { for (const e of entries) { if (e.target === rail.firstElementChild) prev.disabled = e.isIntersecting; if (e.target === rail.lastElementChild) next.disabled = e.isIntersecting; } }, { root: rail, threshold: .99 });
  if (rail.firstElementChild) observer.observe(rail.firstElementChild); if (rail.lastElementChild) observer.observe(rail.lastElementChild);
}
