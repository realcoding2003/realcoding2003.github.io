const root = document.documentElement;
const buttons = document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]');
const system = matchMedia('(prefers-color-scheme: dark)');
let saved = false;
try { saved = ['light', 'dark'].includes(localStorage.getItem('theme') || ''); } catch { /* Storage may be blocked. */ }
function update(theme: string) {
  if (root.dataset.themeMode === 'dark') return;
  root.dataset.theme = theme;
  buttons.forEach(button => button.setAttribute('aria-pressed', String(theme === 'dark')));
  document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
}
buttons.forEach(button => {
  button.setAttribute('aria-pressed', String(root.dataset.theme === 'dark'));
  button.addEventListener('click', () => {
    const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    saved = true;
    try { localStorage.setItem('theme', theme); } catch { /* Keep the in-memory selection. */ }
    update(theme);
  });
});
system.addEventListener('change', event => { if (!saved) update(event.matches ? 'dark' : 'light'); });
export {};
