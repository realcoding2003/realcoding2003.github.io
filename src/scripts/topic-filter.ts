const filter = document.querySelector<HTMLElement>('[data-topic-filter]');
if (filter) {
  const rows = [...document.querySelectorAll<HTMLElement>('[data-post-row]')];
  const primary = [...filter.querySelectorAll<HTMLButtonElement>('[data-topic]')];
  const groups = [...filter.querySelectorAll<HTMLElement>('[data-subtopics]')];
  let topic = '', sub = '';
  function apply(update = true) {
    primary.forEach(b => b.setAttribute('aria-pressed',String(b.dataset.topic === topic)));
    groups.forEach(g => { g.hidden = g.dataset.subtopics !== topic; g.querySelectorAll<HTMLButtonElement>('[data-sub]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.sub === sub))); });
    let n = 0;
    rows.forEach(row => { row.hidden = !!((topic && row.dataset.c1 !== topic) || (sub && row.dataset.c2 !== sub)); if (!row.hidden) n++; });
    document.querySelectorAll<HTMLElement>('[data-year]').forEach(group => { group.hidden = !group.querySelector('[data-post-row]:not([hidden])'); });
    filter!.querySelector('[data-filter-count]')!.textContent = filter!.dataset.count!.replace('{n}',String(n));
    if (update) { const url = new URL(location.href); for (const [k,v] of [['topic',topic],['sub',sub]]) { if (v) url.searchParams.set(k,v); else url.searchParams.delete(k); } history.replaceState(null,'',url); }
  }
  const params = new URLSearchParams(location.search);
  if (primary.some(b => b.dataset.topic === params.get('topic'))) topic = params.get('topic')!;
  const group = groups.find(g => g.dataset.subtopics === topic);
  if (group && [...group.querySelectorAll<HTMLButtonElement>('[data-sub]')].some(b => b.dataset.sub === params.get('sub'))) sub = params.get('sub')!;
  primary.forEach(b => b.addEventListener('click', () => { topic = b.dataset.topic!; sub = ''; apply(); }));
  groups.forEach(g => g.querySelectorAll<HTMLButtonElement>('[data-sub]').forEach(b => b.addEventListener('click', () => { sub = b.dataset.sub!; apply(); })));
  apply();
}
