export interface InquiryPayload {
  clientToken: string;
  type: string;
  lang: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  consentRequired: boolean;
  consentOptional: boolean;
  elapsedMs: number;
  website: string;
}
type ErrorKind = 'invalid' | 'forbidden' | 'expired' | 'too_large' | 'unsupported_media_type' | 'busy' | 'server' | 'upload' | 'network' | 'timeout' | 'aborted';
export class InquiryTransportError extends Error {
  constructor(public kind: ErrorKind, public status = 0, public code = '', public fields: string[] = []) {
    super(kind);
    this.name = 'InquiryTransportError';
  }
}
interface Upload { url: string; method: string; headers: Record<string,string> }
interface Receipt { id: string; uploads?: Upload[] }
const httpError = (status: number, code = '', fields: string[] = []) => new InquiryTransportError(
  status === 400 ? 'invalid' : status === 403 ? 'forbidden' : status === 410 ? 'expired' : status === 413 ? 'too_large' : status === 415 ? 'unsupported_media_type' : status === 429 ? 'busy' : 'server', status, code, fields,
);
function backoff(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve,reject) => {
    const abort = () => { clearTimeout(timer); signal?.removeEventListener('abort',abort); reject(new InquiryTransportError('aborted')); };
    const timer = setTimeout(() => { signal?.removeEventListener('abort',abort); resolve(); },ms);
    signal?.addEventListener('abort',abort,{once:true});
    if (signal?.aborted) abort();
  });
}
async function post(url: string, payload: object, signal?: AbortSignal): Promise<Receipt> {
  // Retry only the API's explicit processing-lock response, never a generic 5xx.
  for (let attempt = 0; ; attempt++) {
    const controller = new AbortController();
    let timedOut = false;
    const abort = () => controller.abort();
    signal?.addEventListener('abort',abort,{once:true});
    if (signal?.aborted) controller.abort();
    const timer = setTimeout(() => { timedOut = true; controller.abort(); },15_000);
    let response: Response;
    let body: Record<string,unknown> = {};
    try {
      if (signal?.aborted) throw new InquiryTransportError('aborted');
      response = await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),credentials:'omit',signal:controller.signal});
      try {
        const json: unknown = await response.json();
        if (json && typeof json === 'object' && !Array.isArray(json)) body = json as Record<string,unknown>;
      } catch { /* Gateway errors need not be JSON. Check timeout/abort below. */ }
      if (controller.signal.aborted) throw new InquiryTransportError(timedOut ? 'timeout' : 'aborted');
    } catch (error) {
      if (error instanceof InquiryTransportError) throw error;
      throw new InquiryTransportError(timedOut ? 'timeout' : signal?.aborted ? 'aborted' : 'network');
    } finally {
      clearTimeout(timer); signal?.removeEventListener('abort',abort);
    }
    if (response.status === 503 && body.error === 'retry' && attempt < 2) { await backoff(500 * 2 ** attempt,signal); continue; }
    if (!response.ok) throw httpError(response.status,typeof body.error === 'string' ? body.error : '',Array.isArray(body.fields) ? body.fields.filter((field): field is string => typeof field === 'string') : []);
    if (typeof body.id !== 'string' || !body.id) throw new InquiryTransportError('server');
    return body as unknown as Receipt;
  }
}
function put(upload: Upload, file: File, onProgress: (loaded: number) => void, timeout: number, signal?: AbortSignal) {
  return new Promise<void>((resolve,reject) => {
    const xhr = new XMLHttpRequest();
    const finish = (error?: InquiryTransportError) => { signal?.removeEventListener('abort',abort); error ? reject(error) : resolve(); };
    const abort = () => xhr.abort();
    if (signal?.aborted) { reject(new InquiryTransportError('aborted')); return; }
    xhr.open('PUT',upload.url);
    xhr.withCredentials = false;
    xhr.timeout = timeout;
    for (const [name,value] of Object.entries(upload.headers)) {
      // Content-Length is controlled by the browser, never set it manually.
      if (name.toLowerCase() !== 'content-length') xhr.setRequestHeader(name,value);
    }
    xhr.upload.onprogress = event => onProgress(Math.min(file.size,event.loaded));
    xhr.onload = () => {
      if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 412) { onProgress(file.size); finish(); }
      else finish(xhr.status === 403 ? new InquiryTransportError('forbidden',403,'upload_expired_or_signature_mismatch') : new InquiryTransportError('upload',xhr.status));
    };
    xhr.onerror = () => finish(new InquiryTransportError('network'));
    xhr.ontimeout = () => finish(new InquiryTransportError('timeout'));
    xhr.onabort = () => finish(new InquiryTransportError('aborted'));
    signal?.addEventListener('abort',abort,{once:true});
    xhr.send(file);
  });
}
export async function sendInquiry(api: string, payload: InquiryPayload, files: File[], onProgress: (ratio: number) => void, signal?: AbortSignal): Promise<{id: string}> {
  const endpoint = `${api.replace(/\/+$/,'')}/inquiries`;
  const deadline = Date.now() + 15 * 60_000;
  const receipt = await post(endpoint,{...payload,files:files.map(({name,size}) => ({name,size}))},signal);
  // A replay of an already completed submission also returns only {id}.
  if (receipt.uploads === undefined) return {id:receipt.id};
  if (!Array.isArray(receipt.uploads) || !files.length || receipt.uploads.length !== files.length) throw new InquiryTransportError('server');
  const total = files.reduce((sum,file) => sum + file.size,0);
  let completed = 0;
  for (const [i,upload] of receipt.uploads.entries()) {
    if (!upload || upload.method !== 'PUT' || typeof upload.url !== 'string' || !upload.headers || typeof upload.headers !== 'object' || Array.isArray(upload.headers) || Object.values(upload.headers).some(value => typeof value !== 'string')) throw new InquiryTransportError('server');
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw new InquiryTransportError('expired',410,'upload_expired');
    // Allow larger files more time, without exceeding the upload window.
    const timeout = Math.min(remaining,15_000 + Math.ceil(files[i].size / 262144) * 1000);
    onProgress(completed / total);
    await put(upload,files[i],loaded => onProgress((completed + loaded) / total),timeout,signal);
    completed += files[i].size;
  }
  return {id:(await post(`${endpoint}/${encodeURIComponent(receipt.id)}/complete`,{clientToken:payload.clientToken},signal)).id};
}
