import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { parseDocument, postMetadata, AI_FLAGSHIP_SLUG } from '../../src/lib/site.mjs';
import { chapterAt, AX_CHAPTER_STARTS, timeAt } from '../../src/lib/motion-math.mjs';
import { validateInquiry } from '../../src/lib/inquiry-validate.mjs';
import { buildMailto } from '../../src/lib/inquiry-mail.mjs';
const source = path => readFileSync(new URL('../../'+path,import.meta.url),'utf8');
async function module(path) {
 const code=ts.transpileModule(source(path),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText.replaceAll("'./site.mjs'",JSON.stringify(new URL('../../src/lib/site.mjs',import.meta.url).href));
 return import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
}
const {sectionOf,sectionsForPosts,AI_TAGS}=await module('src/lib/sections.ts');
const {portalCopy}=await module('src/lib/portal-copy.ts');
const {i18n}=await module('src/lib/i18n.ts');
const {realms}=await module('src/lib/portal.ts');
test('AI classification preserves explicit and maker priority and exact tag spelling',()=>{
 const of=data=>sectionOf({data});
 for(const section of realms) assert.equal(of({section,categories:['AI'],tags:['Claude']}),section);
 assert.equal(of({categories:['Life','3D Printing','AI'],tags:['MCP']}),'maker');
 assert.equal(of({categories:['Life','AI']}),'ai');
 for(const tag of AI_TAGS) {assert.equal(of({tags:[tag]}),'ai');assert.equal(of({tags:[tag.toLowerCase()]}),'dev');}
 assert.equal(of({categories:['AI']}),'ai');assert.equal(of({categories:['ai']}),'dev');
});
test('Korean source classifies the same 30 AI posts in every translation: 22 categories and 8 tags',()=>{
 const all=readdirSync('_posts').filter(f=>f.endsWith('.md')).map(filename=>postMetadata(filename,parseDocument(readFileSync('_posts/'+filename,'utf8')).data));
 const sections=sectionsForPosts(all, message=>assert.fail(message));
 const sets=[];
 for(const slug of new Set(all.map(p=>p.baseSlug))) {
  const group=all.filter(p=>p.baseSlug===slug);
  assert.equal(group.length,3,slug);
  assert.equal(new Set(group.map(p=>sections[all.indexOf(p)])).size,1,slug);
 }
 for(const lang of ['ko','en','ja']) {
  const posts=all.filter((p,i)=>p.lang===lang && sections[i]==='ai');
  assert.equal(posts.length,30);assert.equal(posts.filter(p=>p.data.categories.includes('AI')).length,22);
  sets.push(posts.map(p=>p.baseSlug).sort());
 }
 assert.deepEqual(sets[0],sets[1]);assert.deepEqual(sets[0],sets[2]);
});
test('translation sections preserve explicit overrides and warn only for conflicts',()=>{
 const post=(lang,data,baseSlug='group')=>({lang,data,baseSlug});
 const warnings=[];
 assert.deepEqual(sectionsForPosts([post('en',{}),post('ko',{tags:['AI에이전트']}),post('ja',{})],m=>warnings.push(m)),['ai','ai','ai']);
 assert.equal(warnings.length,0);
 assert.deepEqual(sectionsForPosts([post('ko',{section:'maker'}),post('en',{section:'dev'}),post('ja',{})],m=>warnings.push(m)),['maker','dev','maker']);
 assert.equal(warnings.length,1);assert.match(warnings[0],/group.*maker, dev/);
 assert.deepEqual(sectionsForPosts([post('en',{categories:['AI']},'no-ko')]),['ai']);
 assert.match(source('src/lib/content.ts'),/sectionsForPosts\(metadata\)/);
});
test('AI is first, labels and count-driven titles exist in all three languages, UI has zero long dashes',()=>{
 assert.deepEqual(realms,['ai','maker','dev','game','life']);
 assert.match(source('src/components/SiteHeader.astro'),/\['ai', 'maker', 'dev', 'game', 'life', 'videos'\]/);
 assert.match(source('src/components/portal/Realms.astro'),/const latest = slices\[0\]\?\.realm/);
 for(const lang of ['ko','en','ja']) {
  assert.equal(i18n[lang].nav.ai,'AI');
  for(const n of [3,4,5]) assert.ok(portalCopy[lang][`realms.title${n}`]);
  for(const text of Object.values(portalCopy[lang])) assert.doesNotMatch(text,/[\u2013\u2014]/);
  assert.equal(portalCopy[lang]['form.mailSubject.ax'],{ko:'[AI 도입·AX 문의]',en:'[AI & AX Inquiry]',ja:'[AI導入・AXのお問い合わせ]'}[lang]);
 }
 assert.equal(AI_FLAGSHIP_SLUG,'');
});
test('AX has three monotone chapters and keeps the home chapter defaults',()=>{
 assert.equal(AX_CHAPTER_STARTS.length,3);
 assert.deepEqual([0,.3,.8,1,.8,.3,0].map(p=>chapterAt(p,AX_CHAPTER_STARTS)),[1,2,3,3,3,2,1]);
 assert.equal(chapterAt(.8),4);
 for(let i=1;i<=100;i++) assert.ok(timeAt(i/100,15)>=timeAt((i-1)/100,15));
});
test('all request hashes, keyboard navigation and history hashchange select the matching panel and radio',()=>{
 for(const hash of ['#print','#dev','#ax','#unknown']) {
  const events=new Map(), docEvents=[], panels=Object.fromEntries(['print','dev','ax'].map(id=>[id,{hidden:false}]));
  const tabs=['print','dev','ax'].map(id=>({attrs:{'aria-controls':id},events:{},setAttribute(k,v){this.attrs[k]=v},getAttribute(k){return this.attrs[k]},addEventListener(k,fn){this.events[k]=fn},focus(){this.focused=true}}));
  const radios=['print','dev','ax'].map(value=>({value,checked:false}));
  const location={hash,pathname:'/en/request/',search:''};const history=[];
  const context=vm.createContext({document:{querySelectorAll:s=>s.startsWith('.request-tabs')?tabs:radios,getElementById:id=>panels[id],dispatchEvent:e=>docEvents.push(e.detail)},location,history:{replaceState:(_,__,url)=>history.push(url)},CustomEvent:class{constructor(_,v){this.detail=v.detail}},addEventListener:(k,fn)=>events.set(k,fn)});
  vm.runInContext(ts.transpileModule(source('src/scripts/request-tabs.ts'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,context);
  const check=type=>{assert.equal(tabs.find(t=>t.attrs['aria-selected']==='true').attrs['aria-controls'],type);assert.deepEqual(Object.keys(panels).filter(id=>!panels[id].hidden),[type]);assert.equal(radios.find(r=>r.checked).value,type);assert.equal(docEvents.at(-1),type);};
  check(hash==='#unknown'?'print':hash.slice(1));assert.equal(history.length,0);
  tabs[0].events.keydown({key:'End',preventDefault(){}});check('ax');assert.equal(history.at(-1),'/en/request/#ax');
  tabs[2].events.keydown({key:'ArrowRight',preventDefault(){}});check('print');
  tabs[0].events.keydown({key:'ArrowLeft',preventDefault(){}});check('ax');
  location.hash='#dev';events.get('hashchange')();check('dev');
 }
});
test('AX mail includes optional company, exact prefix and no retained print files',()=>{
 const values={type:'ax',name:'Kevin',email:'a@example.com',message:'Workflow',company:' Team & Co ',consent_required:true};
 assert.deepEqual(validateInquiry(values,[{name:'bad.exe',size:999999999}]),[]);
 for(const lang of ['ko','en','ja']) {
  const copy=portalCopy[lang],url=new URL(buildMailto({contact:'kevinpark@okyc.kr',subject:copy['form.mailSubject.ax'],values,files:[{name:'bad.exe'}],copy}));
  assert.equal(url.searchParams.get('subject'),copy['form.mailSubject.ax']);
  const body=url.searchParams.get('body');assert.ok(body.includes(copy['label.company']+': Team & Co'));assert.ok(body.includes(copy['tab.ax']));assert.ok(!body.includes('bad.exe'));
 }
 const script=source('src/scripts/inquiry-form.ts');
 assert.match(script,/fileInput.disabled = type !== 'print'/);assert.match(script,/disabled = type !== 'ax'/);
});

test('AX consent discloses optional company in all languages without changing purpose or retention',()=>{
 for(const lang of ['ko','en','ja']) {
  const t=portalCopy[lang], normal=t['consent.requiredDetail'], ax=t['consent.requiredDetail.ax'];
  const company={ko:'회사·팀명(선택)',en:'company or team (optional)',ja:'会社・チーム名(任意)'}[lang];
  const attachment={ko:'첨부 파일',en:'attachments',ja:'添付ファイル'}[lang];
  assert.ok(ax.includes(company));assert.ok(!ax.includes(attachment));
  assert.equal(ax,normal.replace(attachment,company));
  assert.ok(ax.includes('{retention}'));assert.ok(t['consent.retention']);
 }
 assert.match(source('src/scripts/inquiry-form.ts'),/type === 'ax' \? 'consent.requiredDetail.ax' : 'consent.requiredDetail'/);
});
