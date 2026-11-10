const tabs = [...document.querySelectorAll<HTMLButtonElement>('.request-tabs [role=tab]')];
if (tabs.length) {
  function activate(type: string, focus = false, update = true) {
    if (!['print','dev','ax'].includes(type)) type = 'print';
    for (const tab of tabs) {
      const active = tab.getAttribute('aria-controls') === type;
      tab.setAttribute('aria-selected',String(active)); tab.tabIndex = active ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')!)!.hidden = !active;
      if (active && focus) tab.focus();
    }
    document.querySelectorAll<HTMLInputElement>('input[name=type]').forEach(radio => { radio.checked = radio.value === type; });
    if (update) history.replaceState(null,'',`${location.pathname}${location.search}#${type}`);
    document.dispatchEvent(new CustomEvent('inquiry:type',{ detail:type }));
  }
  tabs.forEach((tab,i) => {
    tab.addEventListener('click', () => activate(tab.getAttribute('aria-controls')!));
    tab.addEventListener('keydown', event => {
      const index = event.key === 'ArrowRight' ? (i+1)%tabs.length : event.key === 'ArrowLeft' ? (i+tabs.length-1)%tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length-1 : -1;
      if (index >= 0) { event.preventDefault(); activate(tabs[index].getAttribute('aria-controls')!,true); }
    });
  });
  activate(location.hash.slice(1),false,false);
  addEventListener('hashchange', () => activate(location.hash.slice(1),false,false));
}
