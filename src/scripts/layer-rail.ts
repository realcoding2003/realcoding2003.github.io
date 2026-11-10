import { layerReadout } from '../lib/motion-math.mjs';
const rail = document.querySelector<HTMLElement>('[data-layer-rail]');
if (rail) {
  const layer = rail.querySelector<HTMLElement>('[data-rail-layer]')!, z = rail.querySelector<HTMLElement>('[data-rail-z]')!;
  const finish = rail.querySelector<HTMLElement>('[data-rail-finish]')!, marker = rail.querySelector<HTMLElement>('[data-rail-marker]')!;
  const ticks = marker.parentElement!, footer = document.querySelector('[data-finish]');
  const wide = matchMedia('(min-width:1100px)'), listeners = new AbortController();
  let range = 1, height = 0, raf = 0, measure = true;
  function frame() {
    raf = 0;
    if (measure) { range = Math.max(1, document.documentElement.scrollHeight - innerHeight); height = Math.max(0, ticks.clientHeight - 2); measure = false; }
    const p = Math.max(0, Math.min(1, scrollY / range)), value = layerReadout(p);
    footer?.toggleAttribute('data-complete', value.complete);
    if (!wide.matches) return;
    if (layer.textContent !== `L ${value.layer}`) layer.textContent = `L ${value.layer}`;
    if (z.textContent !== `Z ${value.z}`) z.textContent = `Z ${value.z}`;
    rail!.dataset.state = value.complete ? 'complete' : 'printing'; finish.hidden = !value.complete;
    marker.style.transform = `translateY(${p * height}px)`;
  }
  function schedule() { if (!raf) raf = requestAnimationFrame(frame); }
  function layout() { measure = true; schedule(); }
  addEventListener('scroll', schedule, { passive: true, signal: listeners.signal });
  addEventListener('resize', layout, { passive: true, signal: listeners.signal });
  addEventListener('load', layout, { signal: listeners.signal });
  const observer = new ResizeObserver(layout); observer.observe(document.body);
  addEventListener('pagehide', event => { if (!event.persisted) { listeners.abort(); observer.disconnect(); cancelAnimationFrame(raf); } }, { signal: listeners.signal });
  layout();
}
