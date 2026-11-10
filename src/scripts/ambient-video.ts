import { MOBILE_MEDIA, pickSource } from '../lib/motion-math.mjs';
export function initAmbient(root: ParentNode = document): { destroy(): void } {
  const elements = [...root.querySelectorAll<HTMLElement>('[data-ambient]')];
  if (document.documentElement.dataset.motion !== 'full') {
    elements.forEach(el => { el.dataset.ambientState = 'off'; }); return { destroy() {} };
  }
  const listeners = new AbortController(), mobile = matchMedia(MOBILE_MEDIA), wide = matchMedia('(min-width:1100px)');
  const states = elements.map(el => ({ el, video: undefined as HTMLVideoElement | undefined, visible: false, eligible: false, failed: false, tries: 0, token: 0 }));
  let isMobile = mobile.matches, timer = 0, raf = 0, destroyed = false;
  function evaluate() {
    raf = 0;
    if (destroyed) return;
    const winners = new Map<Element, HTMLElement>();
    if (wide.matches) for (const state of states) {
      if (state.el.dataset.ambientGroup !== 'realms') continue;
      const group = state.el.closest('.realms')!;
      const winner = winners.get(group);
      if (!winner || state.el.closest('.slice')!.getBoundingClientRect().width > winner.closest('.slice')!.getBoundingClientRect().width) winners.set(group, state.el);
    }
    for (const state of states) {
      const { el } = state;
      const expanded = !wide.matches || el.dataset.ambientGroup !== 'realms' || winners.get(el.closest('.realms')!) === el;
      const eligible = state.visible && expanded && document.visibilityState === 'visible' && !el.closest('[hidden]');
      const fresh = eligible && !state.eligible; state.eligible = !!eligible;
      if (!eligible) {
        state.token++; state.video?.pause();
        if (state.video && !state.failed) el.dataset.ambientState = 'paused';
        continue;
      }
      if (!fresh || state.failed || state.tries >= 3) continue;
      if (!state.video) {
        const video = document.createElement('video'); state.video = video;
        video.muted = true; video.defaultMuted = true; video.playsInline = true; video.loop = true;
        video.setAttribute('muted', ''); video.setAttribute('playsinline', ''); video.preload = 'auto';
        video.disablePictureInPicture = true; video.setAttribute('disablepictureinpicture', '');
        video.setAttribute('aria-hidden', 'true'); video.tabIndex = -1;
        video.addEventListener('playing', () => {
          if (state.eligible && !state.failed) el.dataset.ambientState = 'playing';
          else video.pause();
        }, { signal: listeners.signal });
        video.addEventListener('error', () => {
          state.failed = true; state.token++; video.pause(); video.removeAttribute('src'); video.load(); video.remove();
          state.video = undefined; el.dataset.ambientState = 'failed';
        }, { signal: listeners.signal });
        el.append(video); el.dataset.ambientState = 'loading';
        video.src = pickSource({ desktop: el.dataset.srcDesktop!, mobile: el.dataset.srcMobile! }, isMobile);
      }
      const token = ++state.token;
      state.video.play().catch(() => {
        if (!destroyed && state.token === token && !state.failed) { state.tries++; el.dataset.ambientState = 'blocked'; }
      });
    }
  }
  function schedule() { if (!raf && !destroyed) raf = requestAnimationFrame(evaluate); }
  function changed() { schedule(); clearTimeout(timer); timer = window.setTimeout(schedule, 320); }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) { const state = states.find(s => s.el === entry.target)!; state.visible = entry.isIntersecting && entry.intersectionRatio >= 0.25; }
    schedule();
  }, { threshold: [0, 0.25] });
  for (const { el } of states) {
    el.dataset.ambientState = 'idle'; observer.observe(el);
    const slice = el.closest('.slice');
    for (const event of ['pointerenter', 'pointerleave', 'focusin', 'focusout']) slice?.addEventListener(event, changed, { signal: listeners.signal });
    slice?.addEventListener('transitionend', event => { if ((event as TransitionEvent).propertyName === 'flex-basis') changed(); }, { signal: listeners.signal });
  }
  document.addEventListener('visibilitychange', () => {
    // A hidden document can suspend rAF, so pause immediately rather than queueing it.
    if (document.visibilityState !== 'visible') {
      for (const state of states) {
        state.eligible = false; state.token++; state.video?.pause();
        if (state.video && !state.failed) state.el.dataset.ambientState = 'paused';
      }
    } else schedule();
  }, { signal: listeners.signal });
  document.addEventListener('inquiry:type', changed, { signal: listeners.signal });
  addEventListener('resize', () => {
    if (isMobile !== mobile.matches) {
      isMobile = mobile.matches;
      for (const s of states) {
        s.token++; s.video?.pause(); s.video?.removeAttribute('src'); s.video?.load(); s.video?.remove();
        s.video = undefined; s.eligible = false; s.tries = 0;
        s.el.dataset.ambientState = s.failed ? 'failed' : 'idle';
      }
    }
    changed();
  }, { passive: true, signal: listeners.signal });
  function destroy() {
    destroyed = true; listeners.abort(); observer.disconnect(); clearTimeout(timer); cancelAnimationFrame(raf);
    for (const s of states) { s.video?.pause(); s.video?.removeAttribute('src'); s.video?.load(); s.video?.remove(); }
  }
  addEventListener('pagehide', event => { if (!event.persisted) destroy(); }, { signal: listeners.signal });
  return { destroy };
}
