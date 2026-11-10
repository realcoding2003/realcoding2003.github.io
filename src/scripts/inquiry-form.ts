import { validateInquiry } from '../lib/inquiry-validate.mjs';
import { buildMailto } from '../lib/inquiry-mail.mjs';
import { sendInquiry } from './inquiry-transport';
const form = document.querySelector<HTMLFormElement>('[data-inquiry-form]');
if (form) {
  // Native required/email validation remains enabled when JavaScript is absent.
  form.noValidate = true;
  const t: Record<string,string> = JSON.parse(form.querySelector('[data-inquiry-copy]')!.textContent!);
  const input = (name: string) => form.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`)!;
  const fileInput = input('files') as HTMLInputElement;
  const drop = form.querySelector<HTMLElement>('[data-file-drop]')!;
  const summary = form.querySelector<HTMLElement>('.error-summary')!;
  const bar = form.querySelector<HTMLButtonElement>('.submit-bar')!;
  const status = form.querySelector<HTMLElement>('[data-form-status]')!;
  const api = form.dataset.api || '';
  let files: File[] = [];
  let type = ['dev','ax'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'print';
  const preview = new URLSearchParams(location.search).get('inquiry-preview');
  const fixedPreview = !!preview && /^(idle|uploading:(?:100|\d{1,2})|done|error)$/.test(preview);
  function values() {
    return { type, company:type === 'ax' ? input('company').value : '', name:input('name').value,email:input('email').value,phone:input('phone').value,message:input('message').value,consent_required:(input('consent_required') as HTMLInputElement).checked,consent_optional:(input('consent_optional') as HTMLInputElement).checked };
  }
  const fieldFor = (key: string) => key.startsWith('file') ? 'files' : key === 'phoneConsent' ? 'consent_optional' : key === 'consent' ? 'consent_required' : key;
  function clear(name: string) {
    const field = input(name); field.removeAttribute('aria-invalid');
    const error = form!.querySelector<HTMLElement>(`#error-${name}`)!; error.hidden = true; error.textContent = '';
    const ids = (field.getAttribute('aria-describedby') || '').split(' ').filter(id => id && id !== error.id);
    if (ids.length) field.setAttribute('aria-describedby',ids.join(' ')); else field.removeAttribute('aria-describedby');
  }
  function showErrors(keys: string[], submitted = false) {
    for (const name of ['name','email','phone','message','files','consent_required','consent_optional']) clear(name);
    const grouped = new Map<string,string[]>();
    for (const key of keys) { const name = fieldFor(key); grouped.set(name,[...grouped.get(name) || [],t[`errors.${key}`]]); }
    for (const [name,messages] of grouped) {
      const field = input(name), error = form!.querySelector<HTMLElement>(`#error-${name}`)!;
      error.textContent = messages.join(' '); error.hidden = false; field.setAttribute('aria-invalid','true');
      field.setAttribute('aria-describedby',[field.getAttribute('aria-describedby'),error.id].filter(Boolean).join(' '));
    }
    summary.hidden = !keys.length;
    if (submitted && keys.length) input(fieldFor(keys[0])).focus();
  }
  for (const name of ['name','email','phone','message','consent_required','consent_optional']) input(name).addEventListener('input', () => { clear(name); if (!form!.querySelector('[aria-invalid=true]')) summary.hidden = true; });
  function renderFiles() {
    const data = new DataTransfer(); files.forEach(file => data.items.add(file)); fileInput.files = data.files;
    const list = form!.querySelector('[data-file-list]')!; list.replaceChildren();
    files.forEach((file,i) => {
      const li = document.createElement('li'), name = document.createElement('span'), remove = document.createElement('button');
      name.textContent = `${file.name} · ${(file.size/1048576).toFixed(1)} MB`; remove.type = 'button'; remove.textContent = t['form.remove']; remove.setAttribute('aria-label',`${t['form.remove']}: ${file.name}`);
      remove.addEventListener('click', () => { files.splice(i,1); renderFiles(); (list.querySelector('button') as HTMLButtonElement | null)?.focus(); if (!files.length) fileInput.focus(); });
      li.append(name,remove); list.append(li);
    });
    const errors = validateInquiry(values(),files).filter(key => key.startsWith('file')); clear('files');
    if (!form!.querySelector('[aria-invalid=true]')) summary.hidden = true;
    if (errors.length) { const error = form!.querySelector<HTMLElement>('#error-files')!; error.hidden = false; error.textContent = errors.map(key => t[`errors.${key}`]).join(' '); fileInput.setAttribute('aria-invalid','true'); fileInput.setAttribute('aria-describedby',error.id); }
  }
  fileInput.addEventListener('change', () => { files = [...files,...Array.from(fileInput.files || [])]; renderFiles(); });
  drop.addEventListener('dragover', event => { event.preventDefault(); drop.dataset.drag = ''; });
  drop.addEventListener('dragleave', () => { delete drop.dataset.drag; });
  drop.addEventListener('drop', event => { event.preventDefault(); delete drop.dataset.drag; files = [...files,...Array.from(event.dataTransfer?.files || [])]; renderFiles(); });
  function changeType(next: string) {
    type = ['dev','ax'].includes(next) ? next : 'print';
    form!.dataset.type = type;
    (input('company') as HTMLInputElement).disabled = type !== 'ax';
    form!.querySelector('[data-form-title]')!.textContent = t[`form.title.${type}`];
    form!.querySelector('[data-form-sub]')!.textContent = t[`form.sub.${type}`];
    input('message').placeholder = t[`ph.message.${type}`];
    form!.querySelector('#consent-required-detail')!.textContent = t[type === 'ax' ? 'consent.requiredDetail.ax' : 'consent.requiredDetail'].replace('{retention}',t['consent.retention']);
    form!.querySelector<HTMLElement>('[data-file-section]')!.hidden = type !== 'print'; fileInput.disabled = type !== 'print';
    form!.querySelectorAll<HTMLInputElement>('[name=type]').forEach(r => { r.checked = r.value === type; });
    clear('files');
  }
  document.addEventListener('inquiry:type', event => changeType((event as CustomEvent<string>).detail));
  form.querySelectorAll<HTMLInputElement>('[name=type]').forEach(r => r.addEventListener('change', () => changeType(r.value)));
  changeType(type);
  function setState(state: string, ratio = 0) {
    const progress = state === 'idle' || state === 'done' ? 1 : state === 'uploading' ? Math.min(1,Math.max(0,ratio)) : 0;
    bar.hidden = false; bar.dataset.state = state; bar.style.setProperty('--progress',String(progress));
    bar.disabled = state === 'uploading' || state === 'done'; bar.setAttribute('aria-busy',String(state === 'uploading'));
    bar.querySelector('.submit-label')!.textContent = t[`form.state.${state}`];
    const percent = bar.querySelector<HTMLElement>('.submit-percent')!; percent.hidden = state !== 'uploading'; percent.textContent = `${Math.round(progress*100)}%`;
    const meter = form!.querySelector<HTMLElement>('[data-progress]')!; meter.hidden = state !== 'uploading'; meter.setAttribute('aria-valuenow',String(Math.round(progress*100))); meter.setAttribute('aria-label',t['form.state.uploading']);
    status.textContent = t[`form.state.${state}`];
  }
  if (fixedPreview) {
    const [state,ratio] = preview!.split(':'); setState(state,Number(ratio || 0)/100);
    form.querySelector<HTMLElement>('.offline-notice')?.setAttribute('hidden','');
  }
  async function submit(mail: boolean) {
    if (fixedPreview) return;
    const data = values(); const currentFiles = type === 'print' ? files : [];
    const errors = validateInquiry(data,currentFiles); showErrors(errors,true); if (errors.length) return;
    if (mail || !api) {
      location.href = buildMailto({contact:form!.dataset.contact!,subject:t[`form.mailSubject.${type}`],values:data,files:currentFiles,copy:t}); return;
    }
    setState('uploading',0);
    try { await sendInquiry(api,new FormData(form!),ratio => setState('uploading',ratio)); setState('done'); }
    catch { setState('error'); }
  }
  form.addEventListener('submit', event => { event.preventDefault(); void submit(false); });
  form.querySelector('[data-mail]')?.addEventListener('click', () => { void submit(true); });
}
