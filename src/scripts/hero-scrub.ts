import { MOBILE_MEDIA, chapterAt, timeAt, pickSource } from '../lib/motion-math.mjs';

export function initHeroScrub(root: HTMLElement): { destroy(): void } {
  if (document.documentElement.dataset.motion !== 'full') {
    root.dataset.videoState = 'off'; return { destroy() {} };
  }
  const track = root.querySelector<HTMLElement>('[data-hero-track]')!;
  const stage = root.querySelector<HTMLElement>('[data-hero-stage]')!;
  const chapters = [...root.querySelectorAll<HTMLElement>('.hero-chapter')];
  const starts = root.dataset.chapterStarts?.split(',').map(Number);
  const media = matchMedia(MOBILE_MEDIA), listeners = new AbortController();
  const options = { passive: true, signal: listeners.signal };
  let trackStart = 0, range = 1, target = 0, current = 0, progress = 0;
  let isMobile = media.matches, video: HTMLVideoElement | undefined;
  let objectUrl: string | undefined, abort: AbortController | undefined;
  let ready = false, painted = false, failed = false, intent = scrollY > 0, near = false;
  let dirty = true, raf = 0, destroyed = false, gesture = false, primed = false, generation = 0;
  const wake = () => { if (!raf && !destroyed) raf = requestAnimationFrame(frame); };
  function release() {
    generation++; abort?.abort(); abort = undefined;
    video?.pause(); video?.removeAttribute('src'); video?.load(); video?.remove(); video = undefined;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = undefined; ready = painted = primed = false; current = 0;
    root.dataset.videoState = 'idle';
  }
  function fail() { release(); failed = true; root.dataset.videoState = 'failed'; }
  function prime() {
    if (!isMobile || !gesture || !video || primed || video.readyState < 2) return;
    primed = true;
    const active = video;
    const play = active.play(); active.pause();
    play?.then(() => { active.pause(); dirty = true; wake(); }).catch(() => {});
  }
  async function load() {
    if (abort || video || failed || destroyed || !intent || !near) return;
    const token = generation;
    abort = new AbortController(); root.dataset.videoState = 'loading';
    try {
      // Future CSP must allow media-src 'self' blob: and connect-src 'self'.
      const response = await fetch(pickSource({ desktop: root.dataset.srcDesktop!, mobile: root.dataset.srcMobile! }, isMobile), { signal: abort.signal });
      if (!response.ok) throw new Error(`Hero HTTP ${response.status}`);
      const blob = await response.blob();
      if (destroyed || token !== generation) return;
      objectUrl = URL.createObjectURL(blob);
      const el = document.createElement('video'); video = el;
      el.className = 'hero-video'; el.muted = true; el.defaultMuted = true; el.playsInline = true;
      el.setAttribute('muted', ''); el.setAttribute('playsinline', '');
      el.preload = 'auto'; el.disablePictureInPicture = true;
      el.setAttribute('disablepictureinpicture', ''); el.setAttribute('aria-hidden', 'true'); el.tabIndex = -1;
      el.addEventListener('loadedmetadata', () => {
        if (video !== el) return;
        ready = Number.isFinite(el.duration) && el.duration > 0;
        if (!ready) { fail(); return; }
        root.dataset.videoState = 'ready'; dirty = true; wake();
      }, { signal: listeners.signal });
      el.addEventListener('loadeddata', () => {
        if (video !== el) return;
        prime(); target = timeAt(progress, el.duration); current = target;
        try { el.currentTime = Math.max(target, 0.001); } catch { /* Keep the poster until a successful seek. */ }
        wake();
      }, { once: true, signal: listeners.signal });
      el.addEventListener('seeked', () => {
        if (video !== el) return;
        if (!painted && el.readyState >= 2) { painted = true; root.dataset.videoState = 'painted'; }
        wake();
      }, { signal: listeners.signal });
      el.addEventListener('error', () => { if (video === el) fail(); }, { signal: listeners.signal });
      stage.querySelector('.hero-poster')!.after(el); el.src = objectUrl; el.load();
    } catch (error) {
      if (!destroyed && token === generation && !(error instanceof DOMException && error.name === 'AbortError')) fail();
    }
  }
  function read() {
    progress = Math.max(0, Math.min(1, (scrollY - trackStart) / range));
    root.dataset.progress = progress.toFixed(3);
    const chapter = String(chapterAt(progress, starts));
    if (root.dataset.chapter !== chapter) {
      root.dataset.chapter = chapter;
      chapters.forEach(el => el.toggleAttribute('data-active', el.dataset.chapter === chapter));
    }
    root.style.setProperty('--hero-head', `${Math.max(0, trackStart - scrollY)}px`);
    if (ready && video) target = timeAt(progress, video.duration);
    if (scrollY > 0) intent = true;
    void load();
  }
  function frame() {
    raf = 0;
    if (dirty) { dirty = false; read(); }
    if (!ready || !video || !near) return;
    if (video.seeking) return; // seeked wakes us; never queue pending seeks.
    current += (target - current) * 0.2;
    const tolerance = isMobile ? 0.02 : 0.008;
    if (Math.abs(video.currentTime - current) > tolerance) {
      try { video.currentTime = Math.max(0, Math.min(current, video.duration * 0.999)); }
      catch { /* Keep the last painted frame. */ }
    }
    if (Math.abs(current - target) > 0.002) wake();
  }
  function layout() {
    if (destroyed) return;
    // Sticky begins when the track reaches the header bottom: home starts at y=0.
    trackStart = track.getBoundingClientRect().top + scrollY - parseFloat(getComputedStyle(stage).top);
    range = Math.max(1, track.offsetHeight - stage.offsetHeight);
    if (isMobile !== media.matches) {
      const loaded = !!abort || !!video; isMobile = media.matches;
      if (loaded) release();
    }
    dirty = true; wake();
  }
  function scroll() { dirty = true; wake(); }
  function firstIntent() { intent = true; void load(); }
  function firstGesture() { gesture = true; prime(); firstIntent(); }
  for (const name of ['wheel', 'keydown']) addEventListener(name, firstIntent, { ...options, once: true });
  for (const name of ['pointerdown', 'touchstart']) addEventListener(name, firstGesture, { ...options, once: true });
  addEventListener('scroll', scroll, options);
  addEventListener('load', layout, options);
  addEventListener('resize', layout, options);
  addEventListener('orientationchange', layout, options);
  media.addEventListener('change', layout, { signal: listeners.signal });
  const observer = new IntersectionObserver(entries => {
    near = entries[0].isIntersecting;
    if (near) { dirty = true; wake(); void load(); }
  }, { rootMargin: '150% 0px' });
  observer.observe(track); layout(); void document.fonts.ready.then(layout);
  function destroy() {
    if (destroyed) return;
    destroyed = true; listeners.abort(); observer.disconnect(); cancelAnimationFrame(raf); release();
  }
  addEventListener('pagehide', event => { if (!event.persisted) destroy(); }, { signal: listeners.signal });
  return { destroy };
}
