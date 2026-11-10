export function initReveal(): { destroy(): void } {
  const html = document.documentElement, elements = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
  if (html.dataset.motion !== 'full' || !('IntersectionObserver' in window)) return { destroy() {} };
  let armed = false;
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.setAttribute('data-revealed', ''); observer.unobserve(entry.target);
    }
    if (!armed) {
      // Existing visible content is marked before arming the hidden state.
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.top < innerHeight && rect.bottom > 0) { el.setAttribute('data-revealed', ''); observer.unobserve(el); }
      }
      requestAnimationFrame(() => { if (armed) html.setAttribute('data-reveal-armed', ''); }); armed = true;
    }
  }, { threshold: 0.15 });
  elements.forEach(el => observer.observe(el));
  function destroy() { armed = false; observer.disconnect(); html.removeAttribute('data-reveal-armed'); removeEventListener('pagehide', pagehide); }
  function pagehide(event: PageTransitionEvent) { if (!event.persisted) destroy(); }
  addEventListener('pagehide', pagehide);
  return { destroy };
}
