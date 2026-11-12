import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const code = ts.transpileModule(readFileSync(new URL('../../src/scripts/inquiry-transport.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const id = 'RC-261112-7K3F';
const payload = {clientToken:'d1d17b3b-2b1a-449e-8663-d51b1b40369c',type:'print',lang:'ko',name:'Kevin',email:'visitor@example.com',phone:'',company:'',message:'Quote',consentRequired:true,consentOptional:false,elapsedMs:4000,website:''};
const response = (status,body) => ({status,ok:status>=200&&status<300,json:async()=>{if(body instanceof Error) throw body; return body;}});
const upload = i => ({url:`https://uploads.invalid/${i}?signature=mock`,method:'PUT',headers:{'Content-Type':'application/octet-stream','If-None-Match':'*'}});
const file = (name,size) => new File([new Uint8Array(size)],name);
function session({responses=[response(200,{id})],puts=[200],timeout=false}={}) {
 const calls=[],xhrs=[],delays=[],timers=new Map(); let nextTimer=0;
 class XHR {
  upload={};headers={};
  constructor(){xhrs.push(this);}
  open(method,url){this.method=method;this.url=url;}
  setRequestHeader(name,value){this.headers[name]=value;}
  send(body){
   this.body=body;
   queueMicrotask(()=>{
    const result=puts.shift();
    if(result==='network') return this.onerror();
    if(result==='timeout') return this.ontimeout();
    if(result==='abort') return this.onabort();
    this.status=result;this.upload.onprogress?.({loaded:Math.floor(body.size/2)});this.onload();
   });
  }
  abort(){this.onabort();}
 }
 const context=vm.createContext({exports:{},AbortController,Date,encodeURIComponent,XMLHttpRequest:XHR,
  setTimeout(fn,ms){const timer=++nextTimer;timers.set(timer,fn);delays.push(ms);if(ms<15000||timeout)queueMicrotask(()=>{if(timers.delete(timer))fn();});return timer;},
  clearTimeout(timer){timers.delete(timer);},
  fetch:async(url,options)=>{
   calls.push({url,...options});
   const result=responses.shift();
   if(typeof result==='function') return result(url,options);
   if(result instanceof Error) throw result;
   assert.ok(result,'unexpected fetch');return result;
  },
 });
 vm.runInContext(code,context);
 return {...context.exports,calls,xhrs,delays,timers};
}
const plain=value=>JSON.parse(JSON.stringify(value));

test('no attachments: exact JSON contract, id and no PUT/complete',async()=>{
 const state=session();
 assert.deepEqual(plain(await state.sendInquiry('https://api.invalid/',payload,[],()=>assert.fail('no upload progress'))),{id});
 assert.equal(state.calls.length,1);assert.equal(state.xhrs.length,0);
 const call=state.calls[0];assert.equal(call.url,'https://api.invalid/inquiries');assert.equal(call.method,'POST');assert.equal(call.credentials,'omit');
 assert.deepEqual(plain(call.headers),{'Content-Type':'application/json'});
 assert.deepEqual(JSON.parse(call.body),{...payload,files:[]});assert.equal(state.timers.size,0);
});
test('attachments: original Files PUT once in order, exact headers, weighted progress, then complete',async()=>{
 const uploads=[upload(1),upload(2)],files=[file('one.3mf',8),file('two.stl',12)],progress=[];
 const state=session({responses:[response(200,{id,uploads}),response(200,{id})],puts:[200,204]});
 assert.deepEqual(plain(await state.sendInquiry('https://api.invalid',payload,files,p=>progress.push(p))),{id});
 assert.equal(state.xhrs.length,2);
 state.xhrs.forEach((xhr,i)=>{
  assert.equal(xhr.method,'PUT');assert.equal(xhr.url,uploads[i].url);assert.equal(xhr.body,files[i]);assert.equal(xhr.withCredentials,false);
  assert.deepEqual(xhr.headers,uploads[i].headers);assert.ok(xhr.timeout>=15000&&xhr.timeout<=900000);
 });
 assert.deepEqual(JSON.parse(state.calls[0].body).files,files.map(({name,size})=>({name,size})));
 assert.equal(state.calls[1].url,`https://api.invalid/inquiries/${id}/complete`);
 assert.deepEqual(JSON.parse(state.calls[1].body),{clientToken:payload.clientToken});
 assert.deepEqual(progress,[0,0.2,0.4,0.4,0.7,1]);
});
test('412 means uploaded: continue with complete, never parse S3 XML or overwrite',async()=>{
 const state=session({responses:[response(200,{id,uploads:[upload(1)]}),response(200,{id})],puts:[412]});
 await state.sendInquiry('https://api.invalid',payload,[file('part.stl',1)],()=>{});
 assert.equal(state.xhrs.length,1);assert.equal(state.calls.length,2);
});
for(const [status,kind] of [[400,'invalid'],[403,'forbidden'],[404,'server'],[410,'expired'],[413,'too_large'],[415,'unsupported_media_type'],[429,'busy'],[500,'server'],[502,'server'],[503,'server']]) test(`POST ${status}: typed error and no automatic retry`,async()=>{
 const state=session({responses:[response(status,{error:'example',fields:['email']})]});
 await assert.rejects(state.sendInquiry('https://api.invalid',payload,[],()=>{}),error=>error.kind===kind&&error.status===status&&error.code==='example'&&error.fields[0]==='email');
 assert.equal(state.calls.length,1);assert.equal(state.timers.size,0);
});
test('non-JSON Gateway error is still a busy error',async()=>{
 const state=session({responses:[response(429,new Error('not JSON'))]});
 await assert.rejects(state.sendInquiry('https://api.invalid',payload,[],()=>{}),{kind:'busy'});
});
test('network failure is not retried',async()=>{
 const state=session({responses:[new TypeError('offline')]});
 await assert.rejects(state.sendInquiry('https://api.invalid',payload,[],()=>{}),{kind:'network'});assert.equal(state.calls.length,1);
});
test('POST timeout aborts after 15 seconds and clears timer',async()=>{
 const state=session({timeout:true,responses:[(_url,{signal})=>new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('aborted')),{once:true}))]});
 await assert.rejects(state.sendInquiry('https://api.invalid',payload,[],()=>{}),{kind:'timeout'});assert.equal(state.delays[0],15000);assert.equal(state.timers.size,0);
});
test('503 retry: two bounded backoffs, same clientToken and identical JSON',async()=>{
 const state=session({responses:[response(503,{error:'retry'}),response(503,{error:'retry'}),response(200,{id})]});
 await state.sendInquiry('https://api.invalid',payload,[],()=>{});
 assert.equal(state.calls.length,3);assert.equal(new Set(state.calls.map(c=>c.body)).size,1);
 assert.deepEqual(state.delays.filter(ms=>ms<15000),[500,1000]);assert.equal(state.timers.size,0);
});
test('503 retry stops after two retries and manual retry retains token',async()=>{
 const state=session({responses:[response(503,{error:'retry'}),response(503,{error:'retry'}),response(503,{error:'retry'}),response(200,{id})]});
 await assert.rejects(state.sendInquiry('https://api.invalid',payload,[],()=>{}),{status:503});
 await state.sendInquiry('https://api.invalid',payload,[],()=>{});
 assert.equal(state.calls.length,4);assert.ok(state.calls.every(c=>JSON.parse(c.body).clientToken===payload.clientToken));
});
test('complete retries only POST, not the PUT, with same token',async()=>{
 const state=session({responses:[response(200,{id,uploads:[upload(1)]}),response(503,{error:'retry'}),response(200,{id})]});
 await state.sendInquiry('https://api.invalid',payload,[file('part.stl',1)],()=>{});
 assert.equal(state.xhrs.length,1);assert.equal(state.calls.length,3);assert.equal(state.calls[1].body,state.calls[2].body);
});
for(const [result,kind] of [[403,'forbidden'],[409,'upload'],[500,'upload'],['network','network'],['timeout','timeout'],['abort','aborted']]) test(`PUT ${result}: no complete or automatic PUT retry`,async()=>{
 const state=session({responses:[response(200,{id,uploads:[upload(1)]})],puts:[result]});
 await assert.rejects(state.sendInquiry('https://api.invalid',payload,[file('part.stl',1)],()=>{}),{kind});
 assert.equal(state.calls.length,1);assert.equal(state.xhrs.length,1);
});
test('complete 410 does not report a receipt',async()=>{
 const state=session({responses:[response(200,{id,uploads:[upload(1)]}),response(410,{error:'upload_expired'})]});
 await assert.rejects(state.sendInquiry('https://api.invalid',payload,[file('part.stl',1)],()=>{}),{kind:'expired'});
});
test('already completed replay with attachments skips PUT and complete',async()=>{
 const state=session();await state.sendInquiry('https://api.invalid',payload,[file('part.stl',1)],()=>{});assert.equal(state.calls.length,1);assert.equal(state.xhrs.length,0);
});
test('invalid success or upload descriptors fail closed',async()=>{
 for(const body of [{},{id,uploads:[]},{id,uploads:[{...upload(1),method:'POST'}]}]) {
  const state=session({responses:[response(200,body)]});
  await assert.rejects(state.sendInquiry('https://api.invalid',payload,[file('part.stl',1)],()=>{}),{kind:'server'});assert.equal(state.xhrs.length,0);
 }
});
test('aborted signal never starts a request',async()=>{
 const controller=new AbortController();controller.abort();const state=session();
 await assert.rejects(state.sendInquiry('https://api.invalid',payload,[],()=>{},controller.signal),{kind:'aborted'});assert.equal(state.calls.length,0);
});
