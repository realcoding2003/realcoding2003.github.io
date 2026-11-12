import { validateInquiry } from '../lib/inquiry-validate.mjs';
import { buildMailto } from '../lib/inquiry-mail.mjs';
import { InquiryTransportError, sendInquiry } from './inquiry-transport';
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
  const displayedAt = performance.now();
  const fallback = form.querySelector<HTMLElement>('[data-mail-fallback]')!;
  const receipt = form.querySelector<HTMLElement>('[data-inquiry-receipt]')!;
  const storageKey = `inquiry-submission:${form.dataset.noticeVersion}`;
  let pending: {token: string; fingerprint: string} | undefined;
  try {
    const stored = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
    if (stored && typeof stored.fingerprint === 'string' && /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(stored.token)) pending = stored;
  } catch { /* Storage may be unavailable. Keep the token in memory instead. */ }
  let busy = false, done = false, newSubmission = false;
  const disabledBefore = new Map<HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement,boolean>();
  let files: File[] = [];
  let type = ['dev','ax','etc'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'print';
  const preview = new URLSearchParams(location.search).get('inquiry-preview');
  const fixedPreview = !!preview && /^(idle|uploading:(?:100|\d{1,2})|done|error)$/.test(preview);
  function values() {
    return { type, company:type === 'ax' ? input('company').value : '', name:input('name').value,email:input('email').value,phone:input('phone').value,message:input('message').value,consent_required:(input('consent_required') as HTMLInputElement).checked,consent_optional:(input('consent_optional') as HTMLInputElement).checked };
  }
  const fieldFor = (key: string) => key.startsWith('file') ? 'files' : key === 'phoneConsent' || key === 'consentOptional' ? 'consent_optional' : key === 'consent' || key === 'consentRequired' ? 'consent_required' : key;
  function clear(name: string) {
    const field = input(name); field.removeAttribute('aria-invalid');
    const error = form!.querySelector<HTMLElement>(`#error-${name}`)!; error.hidden = true; error.textContent = '';
    const ids = (field.getAttribute('aria-describedby') || '').split(' ').filter(id => id && id !== error.id);
    if (ids.length) field.setAttribute('aria-describedby',ids.join(' ')); else field.removeAttribute('aria-describedby');
  }
  function showErrors(keys: string[], submitted = false) {
    for (const name of ['name','email','phone','company','message','files','consent_required','consent_optional']) clear(name);
    const grouped = new Map<string,string[]>();
    for (const key of keys) { const name = fieldFor(key); grouped.set(name,[...grouped.get(name) || [],t[`errors.${key}`] || t['form.error']]); }
    for (const [name,messages] of grouped) {
      const field = input(name), error = form!.querySelector<HTMLElement>(`#error-${name}`)!;
      error.textContent = messages.join(' '); error.hidden = false; field.setAttribute('aria-invalid','true');
      field.setAttribute('aria-describedby',[field.getAttribute('aria-describedby'),error.id].filter(Boolean).join(' '));
    }
    summary.hidden = !keys.length;
    if (submitted && keys.length) input(fieldFor(keys[0])).focus();
  }
  for (const name of ['name','email','phone','company','message','consent_required','consent_optional']) input(name).addEventListener('input', () => { clear(name); if (!form!.querySelector('[aria-invalid=true]')) summary.hidden = true; });
  function renderFiles() {
    const data = new DataTransfer(); files.forEach(file => data.items.add(file)); fileInput.files = data.files;
    const list = form!.querySelector('[data-file-list]')!; list.replaceChildren();
    files.forEach((file,i) => {
      const li = document.createElement('li'), name = document.createElement('span'), remove = document.createElement('button');
      name.textContent = `${file.name} · ${(file.size/1048576).toFixed(1)} MB`; remove.type = 'button'; remove.textContent = t['form.remove']; remove.setAttribute('aria-label',`${t['form.remove']}: ${file.name}`);
      remove.addEventListener('click', () => { if (busy || done) return; files.splice(i,1); renderFiles(); (list.querySelector('button') as HTMLButtonElement | null)?.focus(); if (!files.length) fileInput.focus(); });
      li.append(name,remove); list.append(li);
    });
    const errors = validateInquiry(values(),files).filter(key => key.startsWith('file')); clear('files');
    if (!form!.querySelector('[aria-invalid=true]')) summary.hidden = true;
    if (errors.length) { const error = form!.querySelector<HTMLElement>('#error-files')!; error.hidden = false; error.textContent = errors.map(key => t[`errors.${key}`]).join(' '); fileInput.setAttribute('aria-invalid','true'); fileInput.setAttribute('aria-describedby',error.id); }
  }
  fileInput.addEventListener('change', () => { if (busy || done) return; files = [...files,...Array.from(fileInput.files || [])]; renderFiles(); });
  drop.addEventListener('dragover', event => { event.preventDefault(); drop.dataset.drag = ''; });
  drop.addEventListener('dragleave', () => { delete drop.dataset.drag; });
  drop.addEventListener('drop', event => { event.preventDefault(); delete drop.dataset.drag; if (busy || done || type !== 'print') return; files = [...files,...Array.from(event.dataTransfer?.files || [])]; renderFiles(); });
  function changeType(next: string) {
    if (busy || done) return;
    type = ['dev','ax','etc'].includes(next) ? next : 'print';
    form!.dataset.type = type;
    (input('company') as HTMLInputElement).disabled = type !== 'ax';
    form!.querySelector('[data-form-title]')!.textContent = t[`form.title.${type}`];
    form!.querySelector('[data-form-sub]')!.textContent = t[`form.sub.${type}`];
    input('message').placeholder = t[`ph.message.${type}`];
    form!.querySelector('#consent-required-detail')!.textContent = t[type === 'print' ? api ? 'consent.requiredDetail.print.server' : 'consent.requiredDetail.print' : type === 'ax' ? 'consent.requiredDetail.ax' : 'consent.requiredDetail'].replace('{retention}',t['consent.retention']);
    form!.querySelector<HTMLElement>('[data-file-section]')!.hidden = type !== 'print'; fileInput.disabled = type !== 'print';
    form!.querySelectorAll<HTMLInputElement>('[name=type]').forEach(r => { r.checked = r.value === type; });
    clear('files');
  }
  document.addEventListener('inquiry:type', event => changeType((event as CustomEvent<string>).detail));
  form.querySelectorAll<HTMLInputElement>('[name=type]').forEach(r => r.addEventListener('change', () => changeType(r.value)));
  changeType(type);
  function lockInputs(locked: boolean) {
    if (locked) {
      form!.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement>('input,textarea,button').forEach(control => { if (!disabledBefore.has(control)) disabledBefore.set(control,control.disabled); control.disabled = true; });
    } else {
      disabledBefore.forEach((disabled,control) => { control.disabled = disabled; }); disabledBefore.clear();
    }
  }
  function setState(state: string, ratio = 0) {
    const progress = state === 'idle' || state === 'done' ? 1 : state === 'uploading' ? Math.min(1,Math.max(0,ratio)) : 0;
    bar.hidden = false; bar.dataset.state = state; bar.style.setProperty('--progress',String(progress));
    bar.disabled = state === 'sending' || state === 'uploading' || state === 'done'; bar.setAttribute('aria-busy',String(state === 'sending' || state === 'uploading'));
    bar.querySelector('.submit-label')!.textContent = state === 'sending' ? t['form.sending'] : state === 'uploading' ? t['form.uploading'].replace(' {percent}%','') : t[`form.state.${state}`];
    const percent = bar.querySelector<HTMLElement>('.submit-percent')!; percent.hidden = state !== 'uploading'; percent.textContent = `${Math.round(progress*100)}%`;
    const meter = form!.querySelector<HTMLElement>('[data-progress]')!; meter.hidden = state !== 'uploading'; meter.setAttribute('aria-valuenow',String(Math.round(progress*100))); meter.setAttribute('aria-label',t['form.state.uploading']);
    status.textContent = state === 'sending' ? t['form.sending'] : state === 'uploading' ? t['form.uploading'].replace('{percent}',String(Math.round(progress*100))) : t[`form.state.${state}`];
  }
  function showReceipt(id: string) {
    done = true; lockInputs(true); setState('done'); fallback.hidden = true;
    receipt.querySelector('[data-receipt-body]')!.textContent = t['form.done.body'].replace('{id}',id); receipt.hidden = false;
  }
  if (fixedPreview) {
    const [state,ratio] = preview!.split(':'); setState(state,Number(ratio || 0)/100);
    if (state === 'done') showReceipt('RC-261112-7K3F');
    fallback.hidden = true;
  }
  async function submit(mail: boolean) {
    if (fixedPreview || busy || done) return;
    const data = values(); const currentFiles = type === 'print' ? files : [];
    const errors = validateInquiry(data,currentFiles); showErrors(errors,true); if (errors.length) return;
    if (mail || !api) {
      location.href = buildMailto({contact:form!.dataset.contact!,subject:t[`form.mailSubject.${type}`],values:data,files:currentFiles,copy:t}); return;
    }
    busy = true; lockInputs(true); setState('sending'); fallback.hidden = true;
    try {
      const payload = {type:data.type,lang:form!.dataset.lang!,name:data.name,email:data.email,phone:data.phone,company:data.company,message:data.message,consentRequired:data.consent_required,consentOptional:data.consent_optional,website:input('website').value};
      // Persist only a digest, never the form values or original file names.
      const identity = JSON.stringify({...payload,files:currentFiles.map(file => [file.name,file.size,file.lastModified])});
      const fingerprint = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(identity))),byte => byte.toString(16).padStart(2,'0')).join('');
      if (!pending || pending.fingerprint !== fingerprint || newSubmission) {
        pending = {token:crypto.randomUUID(),fingerprint}; newSubmission = false;
        try { sessionStorage.setItem(storageKey,JSON.stringify(pending)); } catch { /* In-memory retry still works. */ }
      }
      const result = await sendInquiry(api,{...payload,clientToken:pending.token,elapsedMs:Math.max(0,performance.now() - displayedAt)},currentFiles,ratio => setState('uploading',ratio));
      showReceipt(result.id); pending = undefined;
      try { sessionStorage.removeItem(storageKey); } catch { /* No storage access is required. */ }
    } catch (error) {
      lockInputs(false); setState('error');
      const failure = error instanceof InquiryTransportError ? error : undefined;
      const key = failure?.kind === 'busy' ? 'form.busy' : failure?.kind === 'expired' ? 'form.expired' : 'form.error';
      status.textContent = t[key]; fallback.querySelector('[data-mail-notice]')!.textContent = t[key]; fallback.hidden = false;
      const fields = failure?.fields.filter(field => ['name','email','phone','company','message','files','consentRequired','consentOptional'].includes(field)) || [];
      if (fields.length) showErrors(fields,true);
      // Only a later, explicit user submission may start over after expiry/bad bytes.
      newSubmission = failure?.kind === 'expired' || failure?.code === 'file_size' || failure?.code === 'file_signature';
    } finally { busy = false; }
  }
  form.addEventListener('submit', event => { event.preventDefault(); void submit(false); });
  form.querySelector('[data-mail]')?.addEventListener('click', () => { void submit(true); });
}
