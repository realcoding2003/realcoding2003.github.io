export const MOBILE_MEDIA = '(max-width: 860px), (hover: none) and (pointer: coarse)';
export const LAYER_COUNT = 240;
export const CHAPTER_STARTS = [0, 0.19, 0.47, 0.69];
export const FILM_END = 0.94;
const clamp = p => Math.max(0, Math.min(1, p));
export function decideMotion({ reducedMotion, saveData, effectiveType, override } = {}) {
  if (override === 'static' || override === 'full') return { mode: override, reason: 'override' };
  if (reducedMotion) return { mode: 'static', reason: 'reduced-motion' };
  if (saveData === true) return { mode: 'static', reason: 'save-data' };
  if (['slow-2g', '2g', '3g'].includes(effectiveType)) return { mode: 'static', reason: 'slow-connection' };
  return { mode: 'full', reason: 'none' };
}
export function applyMotionGate(doc, win) {
  // Choose once per load; preference changes take effect on the next load.
  var connection = win.navigator.connection || {};
  var override = new URLSearchParams(win.location.search).get('motion');
  var mode = 'full', reason = 'none';
  if (override === 'static' || override === 'full') { mode = override; reason = 'override'; }
  else if (win.matchMedia('(prefers-reduced-motion: reduce)').matches) { mode = 'static'; reason = 'reduced-motion'; }
  else if (connection.saveData === true) { mode = 'static'; reason = 'save-data'; }
  else if (['slow-2g', '2g', '3g'].includes(connection.effectiveType)) { mode = 'static'; reason = 'slow-connection'; }
  doc.documentElement.dataset.motion = mode;
  doc.documentElement.dataset.motionReason = reason;
  return { mode: mode, reason: reason };
}
// AX: first frame, workflow construction (~3s), office pullback (~9s).
export const AX_CHAPTER_STARTS = [0, 0.19, 0.56];
export function chapterAt(p, starts = CHAPTER_STARTS) { return starts.filter(start => clamp(p) >= start).length; }
export function timeAt(p, duration) { return Math.min(0.999, clamp(p / FILM_END)) * duration; }
export function layerReadout(p) {
  const layer = 1 + Math.round(clamp(p) * (LAYER_COUNT - 1)), z = layer * 20;
  return { layer: String(layer).padStart(3, '0'), z: `${Math.floor(z / 100)}.${String(z % 100).padStart(2, '0')}`, complete: p >= 0.995 };
}
export function pickSource(sources, isMobile) { return isMobile ? sources.mobile : sources.desktop; }
