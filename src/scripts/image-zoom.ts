const article = document.querySelector<HTMLElement>('article.reader');
let dialog: HTMLDialogElement | undefined;
let viewport: HTMLDivElement;
let content: HTMLDivElement;
let opener: HTMLButtonElement | undefined;
let scale = 1, x = 0, y = 0;
function transform() { content.style.transform = `translate(${x}px,${y}px) scale(${scale})`; }
function reset() { scale = 1; x = 0; y = 0; transform(); }
function zoom(factor: number) { scale = Math.min(5, Math.max(.3, scale * factor)); transform(); }
function createDialog(): HTMLDialogElement {
  const modal = document.createElement('dialog'); modal.className = 'image-viewer'; modal.setAttribute('aria-label', article?.dataset.dialog || '');
  const controls = document.createElement('div'); controls.className = 'zoom-controls';
  const actions: [string, string | undefined, () => void][] = [
    ['+', article?.dataset.zoomIn, () => zoom(1.3)], ['−', article?.dataset.zoomOut, () => zoom(1/1.3)],
    ['↺', article?.dataset.reset, reset], ['✕', article?.dataset.close, () => modal.close()],
  ];
  for (const [symbol, label, action] of actions) {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = symbol; button.setAttribute('aria-label', label || ''); button.addEventListener('click', action); controls.appendChild(button);
  }
  viewport = document.createElement('div'); viewport.className = 'zoom-viewport';
  content = document.createElement('div'); content.className = 'zoom-content'; viewport.appendChild(content); modal.append(controls, viewport);
  let drag: { id: number; startX: number; startY: number; originX: number; originY: number } | undefined;
  let moved = false;
  viewport.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    drag = { id: event.pointerId, startX: event.clientX, startY: event.clientY, originX: x, originY: y }; moved = false;
    viewport.setPointerCapture(event.pointerId); event.preventDefault();
  });
  viewport.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.startX, dy = event.clientY - drag.startY;
    if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
    x = drag.originX + dx; y = drag.originY + dy; transform();
  });
  const end = () => { drag = undefined; };
  viewport.addEventListener('pointerup', end); viewport.addEventListener('pointercancel', end);
  modal.addEventListener('click', event => {
    if (!moved && (event.target === viewport || event.target === modal)) modal.close();
    moved = false;
  });
  viewport.addEventListener('wheel', event => { event.preventDefault(); zoom(event.deltaY > 0 ? .9 : 1.1); }, { passive: false });
  modal.addEventListener('keydown', event => {
    if (event.key === '+' || event.key === '=') { event.preventDefault(); zoom(1.3); }
    else if (event.key === '-') { event.preventDefault(); zoom(1/1.3); }
    else if (event.key === '0') { event.preventDefault(); reset(); }
    else if (event.key === 'Escape') { event.preventDefault(); modal.close(); }
  });
  modal.addEventListener('close', () => { content.replaceChildren(); opener?.focus(); });
  document.body.appendChild(modal); return modal;
}
export function attachZoom(target: HTMLImageElement | SVGSVGElement) {
  if (!article || target.closest('a,button')) return;
  const button = document.createElement('button'); button.type = 'button'; button.className = 'zoom-trigger';
  const alt = target instanceof HTMLImageElement ? target.alt : target.querySelector('title')?.textContent || '';
  button.setAttribute('aria-label', `${article.dataset.zoom}${alt ? ': ' + alt : ''}`);
  // Keep source and img together so responsive selection survives zoom wrapping.
  const media = target.closest('picture') || target;
  media.before(button); button.appendChild(media);
  button.addEventListener('click', event => {
    event.preventDefault(); opener = button; dialog ||= createDialog();
    const clone = target.cloneNode(true) as HTMLImageElement | SVGSVGElement;
    if (clone instanceof SVGSVGElement) {
      if (!clone.hasAttribute('viewBox')) {
        const bounds = target.getBoundingClientRect(); clone.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
      }
      clone.removeAttribute('width'); clone.removeAttribute('height'); clone.removeAttribute('style');
    } else {
      // The dialog deliberately opens the unchanged full-resolution original.
      clone.loading = 'eager'; clone.removeAttribute('fetchpriority'); clone.draggable = false;
    }
    content.replaceChildren(clone); reset(); dialog.showModal();
  });
}
article?.querySelectorAll<HTMLImageElement>('.post-content img').forEach(attachZoom);
