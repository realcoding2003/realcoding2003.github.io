import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { validateInquiry } from '../../src/lib/inquiry-validate.mjs';
import { buildMailto } from '../../src/lib/inquiry-mail.mjs';

const source = path => readFileSync(new URL('../../'+path,import.meta.url),'utf8');
const {portalCopy} = await import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source('src/lib/portal-copy.ts'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText).toString('base64'));
const code = ts.transpileModule(source('src/scripts/inquiry-form.ts'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const types = ['print','dev','ax','etc'];
function element(extra = {}) {
 return {attrs:{},events:{},hidden:false,textContent:'',value:'',checked:false,
  addEventListener(name,fn) {this.events[name]=fn;},
  getAttribute(name) {return this.attrs[name] ?? null;},
  setAttribute(name,value) {this.attrs[name]=value;},
  removeAttribute(name) {delete this.attrs[name];},
  ...extra};
}
function session(copy,hash) {
 const selectors = new Map(), inputs = {};
 for(const name of ['name','email','phone','company','message','files','consent_required','consent_optional']) {
  inputs[name]=element(); selectors.set(`[name="${name}"]`,inputs[name]);
  selectors.set(`#error-${name}`,element({id:`error-${name}`,hidden:true}));
 }
 for(const selector of ['[data-file-drop]','.error-summary','.submit-bar','[data-form-status]','[data-form-title]','[data-form-sub]','#consent-required-detail','[data-file-section]','[data-mail]']) selectors.set(selector,element());
 selectors.set('[data-inquiry-copy]',element({textContent:JSON.stringify(copy)}));
 const radios=types.map(value=>element({value}));
 const form=element({dataset:{api:'',contact:'kevinpark@okyc.kr'},querySelector:selector=>selectors.get(selector),querySelectorAll:()=>radios});
 const events={},location={hash,search:'',href:''};
 const context=vm.createContext({exports:{},URLSearchParams,location,
  require:path=>path.endsWith('inquiry-validate.mjs') ? {validateInquiry} : path.endsWith('inquiry-mail.mjs') ? {buildMailto} : {sendInquiry:()=>assert.fail('mailto mode must not call transport')},
  document:{querySelector:()=>form,addEventListener:(name,fn)=>{events[name]=fn;}}});
 vm.runInContext(code,context);
 return {form,inputs,selectors,radios,events,location};
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
