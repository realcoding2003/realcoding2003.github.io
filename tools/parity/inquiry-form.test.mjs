import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { createHash, randomUUID } from 'node:crypto';
import { validateInquiry } from '../../src/lib/inquiry-validate.mjs';
import { buildMailto } from '../../src/lib/inquiry-mail.mjs';

const source = path => readFileSync(new URL('../../'+path,import.meta.url),'utf8');
const {portalCopy} = await import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source('src/lib/portal-copy.ts'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText).toString('base64'));
const code = ts.transpileModule(source('src/scripts/inquiry-form.ts'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const types = ['print','dev','ax','etc'];
class InquiryTransportError extends Error {
 constructor(kind,status=0,code='',fields=[]) { super(kind);Object.assign(this,{kind,status,code,fields}); }
}
function element(extra = {}) {
 return {attrs:{},events:{},hidden:false,textContent:'',value:'',checked:false,disabled:false,children:[],dataset:{},style:{setProperty(){}},
  append(...children){this.children.push(...children);},replaceChildren(){this.children=[];},focus(){this.focused=true;},
  querySelector(selector){return this.children.find(child=>selector==='button'&&child.type==='button');},
  addEventListener(name,fn) {this.events[name]=fn;},
  getAttribute(name) {return this.attrs[name] ?? null;},
  setAttribute(name,value) {this.attrs[name]=value;},
  removeAttribute(name) {delete this.attrs[name];},
  ...extra};
}
function session(copy,hash,{api='',search='',sendInquiry=()=>assert.fail('mailto mode must not call transport'),storage=new Map(),storageBlocked=false}={}) {
 const selectors = new Map(), inputs = {};
 for(const name of ['name','email','phone','company','message','files','consent_required','consent_optional','website']) {
  inputs[name]=element(); selectors.set(`[name="${name}"]`,inputs[name]);
  selectors.set(`#error-${name}`,element({id:`error-${name}`,hidden:true}));
 }
 for(const selector of ['[data-file-drop]','.error-summary','.submit-bar','[data-form-status]','[data-form-title]','[data-form-sub]','#consent-required-detail','[data-file-section]','[data-mail]','[data-file-list]','[data-mail-fallback]','[data-inquiry-receipt]','[data-progress]']) selectors.set(selector,element());
 const barChildren=new Map(['.submit-label','.submit-percent'].map(s=>[s,element()]));
 selectors.get('.submit-bar').querySelector=s=>barChildren.get(s);
 selectors.get('.submit-bar').hidden=!api;
 const notice=element();selectors.get('[data-mail-fallback]').querySelector=()=>notice;selectors.get('[data-mail-fallback]').hidden=!!api;
 const receiptBody=element();selectors.get('[data-inquiry-receipt]').querySelector=()=>receiptBody;selectors.get('[data-inquiry-receipt]').hidden=true;
 selectors.set('[data-inquiry-copy]',element({textContent:JSON.stringify(copy)}));
 const radios=types.map(value=>element({value}));
 const controls=[...Object.values(inputs),...radios,selectors.get('.submit-bar'),selectors.get('[data-mail]')];
 const form=element({dataset:{api,lang:Object.keys(portalCopy).find(lang=>portalCopy[lang]===copy),noticeVersion:'2026-11-12',contact:'kevinpark@okyc.kr'},querySelector:selector=>selector==='[aria-invalid=true]'?[...selectors.values()].find(el=>el.attrs['aria-invalid']==='true'):selectors.get(selector),querySelectorAll:selector=>selector==='input,textarea,button'?controls:radios});
 const events={},location={hash,search,href:''};let now=100,uuidCalls=0;
 const context=vm.createContext({exports:{},URLSearchParams,location,performance:{now:()=>now},TextEncoder,Uint8Array,
  crypto:{randomUUID(){uuidCalls++;return randomUUID();},subtle:{digest:async(_algorithm,bytes)=>createHash('sha256').update(bytes).digest()}},
  sessionStorage:{getItem(key){if(storageBlocked)throw Error('blocked');return storage.get(key)||null;},setItem(key,value){if(storageBlocked)throw Error('blocked');storage.set(key,value);},removeItem(key){if(storageBlocked)throw Error('blocked');storage.delete(key);}},
  DataTransfer:class {files=[];items={add:file=>this.files.push(file)};},
  require:path=>path.endsWith('inquiry-validate.mjs') ? {validateInquiry} : path.endsWith('inquiry-mail.mjs') ? {buildMailto} : {sendInquiry,InquiryTransportError},
  document:{querySelector:()=>form,createElement:()=>element(),addEventListener:(name,fn)=>{events[name]=fn;}}});
 vm.runInContext(code,context);
 now+=4200;
 return {form,inputs,selectors,radios,events,location,notice,receiptBody,storage,controls,barChildren,uuidCalls:()=>uuidCalls};
}
for(const lang of ['ko','en','ja']) test(`${lang}: all four form types initialize and switch fields, copy, consent and mailto`,()=>{
 const copy=portalCopy[lang];
 for(const initial of [...types,'unknown']) {
  const state=session(copy,'#'+initial);
  const check=type=>{
   const {form,inputs,selectors,radios}=state;
   assert.equal(form.dataset.type,type);
   assert.equal(inputs.company.disabled,type!=='ax');
   assert.equal(inputs.files.disabled,type!=='print');
   assert.equal(selectors.get('[data-file-section]').hidden,type!=='print');
   assert.equal(selectors.get('[data-form-title]').textContent,copy[`form.title.${type}`]);
   assert.equal(selectors.get('[data-form-sub]').textContent,copy[`form.sub.${type}`]);
   assert.equal(inputs.message.placeholder,copy[`ph.message.${type}`]);
   const key=type==='print'?'consent.requiredDetail.print':type==='ax'?'consent.requiredDetail.ax':'consent.requiredDetail';
   assert.equal(selectors.get('#consent-required-detail').textContent,copy[key].replace('{retention}',copy['consent.retention']));
   assert.deepEqual(radios.filter(r=>r.checked).map(r=>r.value),[type]);
  };
  check(initial==='unknown'?'print':initial);
  for(const type of ['etc','print','ax','dev','etc']) {state.events['inquiry:type']({detail:type});check(type);}
  for(const radio of state.radios) {radio.events.change();check(radio.value);}
  state.inputs.name.value='Kevin';state.inputs.email.value='a@example.com';state.inputs.message.value='Collaboration?';state.inputs.consent_required.checked=true;
  state.inputs.company.value='Retained company';
  state.selectors.get('[data-mail]').events.click();
  const url=new URL(state.location.href);
  assert.equal(url.protocol,'mailto:');assert.equal(url.searchParams.get('subject'),copy['form.mailSubject.etc']);
  assert.ok(!url.searchParams.get('body').includes('Retained company'));
 }
});

const tick=()=>new Promise(resolve=>setImmediate(resolve));
function fill(state) {
 state.inputs.name.value='Kevin';state.inputs.email.value='visitor@example.com';state.inputs.message.value='Please quote this';state.inputs.consent_required.checked=true;
}
function submit(state) { state.form.events.submit({preventDefault(){}}); }
for(const lang of ['ko','en','ja']) test(`${lang}: server sending locks controls, success displays reference and keeps inputs locked`,async()=>{
 const copy=portalCopy[lang];let resolve,captured;
 const state=session(copy,'#print',{api:'https://api.invalid',sendInquiry:(...args)=>{captured=args;return new Promise(r=>{resolve=r;});}});fill(state);
 assert.equal(state.selectors.get('#consent-required-detail').textContent,copy['consent.requiredDetail.print.server'].replace('{retention}',copy['consent.retention']));
 assert.equal(state.selectors.get('[data-mail-fallback]').hidden,true);assert.equal(state.selectors.get('[data-inquiry-receipt]').hidden,true);
 submit(state);submit(state);await tick();
 assert.equal(state.selectors.get('.submit-bar').dataset.state,'sending');assert.equal(state.barChildren.get('.submit-label').textContent,copy['form.sending']);assert.ok(state.controls.every(control=>control.disabled));
 assert.equal(captured[0],'https://api.invalid');assert.equal(captured[1].elapsedMs,4200);assert.equal(captured[1].website,'');assert.equal(captured[1].lang,lang);
 assert.deepEqual(Object.keys(captured[1]).sort(),['clientToken','type','lang','name','email','phone','company','message','consentRequired','consentOptional','elapsedMs','website'].sort());
 captured[3](0.25);assert.equal(state.selectors.get('.submit-bar').dataset.state,'uploading');assert.equal(state.selectors.get('[data-form-status]').textContent,copy['form.uploading'].replace('{percent}','25'));
 assert.equal(state.selectors.get('[data-progress]').attrs['aria-valuenow'],'25');
 state.events['inquiry:type']({detail:'ax'});assert.equal(state.form.dataset.type,'print');
 resolve({id:'RC-261112-7K3F'});await tick();
 assert.equal(state.selectors.get('.submit-bar').dataset.state,'done');assert.equal(state.selectors.get('[data-inquiry-receipt]').hidden,false);
 assert.equal(state.receiptBody.textContent,copy['form.done.body'].replace('{id}','RC-261112-7K3F'));assert.ok(state.controls.every(control=>control.disabled));assert.equal(state.storage.size,0);
 submit(state);assert.equal(state.uuidCalls(),1);
});
for(const kind of ['invalid','forbidden','expired','too_large','unsupported_media_type','busy','server','network','timeout']) test(`${kind}: show localized error and same-value email fallback, preserve retry token`,async()=>{
 const copy=portalCopy.ko,calls=[];
 const state=session(copy,'#ax',{api:'https://api.invalid',sendInquiry:async(...args)=>{calls.push(args);throw new InquiryTransportError(kind,0,'',kind==='invalid'?['email','unknown_field']:[]);}});fill(state);state.inputs.company.value='Team';
 submit(state);await tick();
 assert.equal(state.selectors.get('.submit-bar').dataset.state,'error');assert.equal(state.selectors.get('.submit-bar').disabled,false);
 assert.equal(state.selectors.get('[data-mail-fallback]').hidden,false);assert.equal(state.selectors.get('[data-inquiry-receipt]').hidden,true);
 const key=kind==='busy'?'form.busy':kind==='expired'?'form.expired':'form.error';assert.equal(state.notice.textContent,copy[key]);
 assert.equal(state.inputs.company.disabled,false);assert.equal(state.inputs.files.disabled,true);
 if(kind==='invalid'){assert.equal(state.inputs.email.attrs['aria-invalid'],'true');assert.equal(state.inputs.email.focused,true);}
 state.selectors.get('[data-mail]').events.click();const mail=new URL(state.location.href);assert.equal(mail.protocol,'mailto:');assert.ok(mail.searchParams.get('body').includes('Team'));assert.ok(mail.searchParams.get('body').includes('Please quote this'));
 submit(state);await tick();assert.equal(calls.length,2);
 assert.equal(calls[0][1].clientToken===calls[1][1].clientToken,kind!=='expired');
});
test('server company validation is renderable and unknown fields are not reflected',async()=>{
 const state=session(portalCopy.en,'#ax',{api:'https://api.invalid',sendInquiry:async()=>{throw new InquiryTransportError('invalid',400,'invalid',['company','unknown_field','website']);}});fill(state);submit(state);await tick();
 assert.equal(state.inputs.company.attrs['aria-invalid'],'true');assert.equal(state.inputs.company.focused,true);assert.equal(state.inputs.website.attrs['aria-invalid'],undefined);
});
test('pending token survives sessionStorage and unchanged retry; edited input gets a new token without storing values',async()=>{
 const calls=[],storage=new Map(),sendInquiry=async(_api,payload)=>{calls.push(payload);throw new InquiryTransportError('network');};
 const first=session(portalCopy.en,'#etc',{api:'https://api.invalid',sendInquiry,storage});fill(first);submit(first);await tick();assert.equal(storage.size,1);
 const serialized=[...storage.values()][0];for(const value of ['Kevin','visitor@example.com','Please quote this'])assert.ok(!serialized.includes(value));
 const second=session(portalCopy.en,'#etc',{api:'https://api.invalid',sendInquiry,storage});fill(second);submit(second);await tick();assert.equal(calls[0].clientToken,calls[1].clientToken);assert.equal(second.uuidCalls(),0);
 second.inputs.message.value='Changed request';submit(second);await tick();assert.notEqual(calls[1].clientToken,calls[2].clientToken);assert.equal(second.uuidCalls(),1);
});
test('blocked sessionStorage does not break server submissions or in-memory retry',async()=>{
 const calls=[],state=session(portalCopy.ja,'#dev',{api:'https://api.invalid',storageBlocked:true,sendInquiry:async(_api,payload)=>{calls.push(payload);throw new InquiryTransportError('network');}});fill(state);submit(state);await tick();submit(state);await tick();assert.equal(calls.length,2);assert.equal(calls[0].clientToken,calls[1].clientToken);
});
test('print sends original files only; non-print tabs exclude retained files and company',async()=>{
 const calls=[],state=session(portalCopy.en,'#print',{api:'https://api.invalid',sendInquiry:async(...args)=>{calls.push(args);throw new InquiryTransportError('network');}});fill(state);
 const original=new File(['solid'],'model.STL');state.inputs.files.files=[original];state.inputs.files.events.change();submit(state);await tick();assert.equal(calls[0][2][0],original);
 state.events['inquiry:type']({detail:'etc'});state.inputs.company.value='Not for etc';submit(state);await tick();assert.equal(calls[1][2].length,0);assert.equal(calls[1][1].company,'');assert.notEqual(calls[0][1].clientToken,calls[1][1].clientToken);
});
test('file count, extension and 200 MiB boundaries stay shared with validation before transport',async()=>{
 let calls=0;
 for(const [files,valid] of [[[...Array.from({length:5},(_,i)=>({name:`${i}.STL`,size:1,lastModified:1}))],true],[[{name:'part.3mf',size:209715200,lastModified:1}],true],[[{name:'part.3mf',size:209715201,lastModified:1}],false],[Array.from({length:6},()=>({name:'a.stl',size:1,lastModified:1})),false],[[{name:'part.exe',size:1,lastModified:1}],false]]) {
  const before=calls,state=session(portalCopy.en,'#print',{api:'https://api.invalid',sendInquiry:async()=>{calls++;throw new InquiryTransportError('network');}});fill(state);state.inputs.files.files=files;state.inputs.files.events.change();submit(state);await tick();assert.equal(calls-before,Number(valid));
 }
});
test('honeypot value is sent verbatim, not silently cleared',async()=>{
 let captured;const state=session(portalCopy.en,'#dev',{api:'https://api.invalid',sendInquiry:async(_api,payload)=>{captured=payload;return {id:'RC-261112-7K3F'};}});fill(state);state.inputs.website.value='bot';submit(state);await tick();assert.equal(captured.website,'bot');
});
test('done preview shows sample reference and never calls transport in offline or server mode',()=>{
 for(const api of ['','https://api.invalid']) {
  const state=session(portalCopy.ko,'#print',{api,search:'?inquiry-preview=done'});
  assert.equal(state.selectors.get('[data-inquiry-receipt]').hidden,false);assert.ok(state.receiptBody.textContent.includes('RC-261112-7K3F'));assert.equal(state.selectors.get('[data-mail-fallback]').hidden,true);submit(state);assert.equal(state.uuidCalls(),0);
 }
});
test('empty API keeps submit and fallback on mailto with no token generation',()=>{
 const state=session(portalCopy.ko,'#print');fill(state);submit(state);assert.equal(new URL(state.location.href).protocol,'mailto:');assert.equal(state.selectors.get('.submit-bar').hidden,true);assert.equal(state.uuidCalls(),0);assert.equal(state.storage.size,0);
});
