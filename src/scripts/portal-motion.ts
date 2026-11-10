import { initHeroScrub } from './hero-scrub';
import { initAmbient } from './ambient-video';
import { initReveal } from './reveal';
document.querySelectorAll<HTMLElement>('[data-hero]').forEach(hero => initHeroScrub(hero));
initAmbient(document);
if (document.documentElement.dataset.motion === 'full') {
  initReveal();
  let destroyed = false, idle: number | undefined, timer: ReturnType<typeof globalThis.setTimeout> | undefined, lenis: { destroy(): void } | undefined;
  async function boot() {
    const { default: Lenis } = await import('lenis');
    // Lenis 1.3 reads html scroll-padding + target scroll-margin in scrollTo.
    // Keep offset at zero: adding the header here would subtract it twice,
    // and a captured pixel offset would go stale across the 640px breakpoint.
    if (!destroyed) lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false, anchors: true, autoRaf: true });
  }
  function schedule() {
    if ('requestIdleCallback' in window) idle = requestIdleCallback(() => { void boot().catch(() => {}); }, { timeout: 2000 });
    else timer = globalThis.setTimeout(() => { void boot().catch(() => {}); }, 1500);
  }
  if (document.readyState === 'complete') schedule(); else addEventListener('load', schedule, { once: true });
  addEventListener('pagehide', event => {
    if (!event.persisted) { destroyed = true; if (idle !== undefined) cancelIdleCallback(idle); clearTimeout(timer); lenis?.destroy(); removeEventListener('load', schedule); }
  });
}
