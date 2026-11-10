const article = document.querySelector<HTMLElement>('article.reader');
if (article) {
  const live = document.createElement('span'); live.className = 'sr-only'; live.setAttribute('aria-live', 'polite'); article.appendChild(live);
  article.querySelectorAll<HTMLPreElement>('.post-content pre').forEach(pre => {
    const code = pre.querySelector('code');
    if (!code || code.classList.contains('language-mermaid')) return;
    const frame = document.createElement('div'); frame.className = 'code-frame'; pre.before(frame); frame.appendChild(pre);
    if (!pre.hasAttribute('tabindex')) pre.tabIndex = 0;
    const button = document.createElement('button'); button.type = 'button'; button.className = 'code-copy'; button.textContent = article.dataset.copy || '';
    frame.appendChild(button);
    let timer: ReturnType<typeof setTimeout>;
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.textContent || '');
        clearTimeout(timer); button.textContent = article.dataset.copied || ''; live.textContent = button.textContent; button.classList.add('copied');
        timer = setTimeout(() => { button.textContent = article.dataset.copy || ''; button.classList.remove('copied'); live.textContent = ''; }, 2000);
      } catch (error) { console.warn('Clipboard write failed', error); }
    });
  });
}
export {};
