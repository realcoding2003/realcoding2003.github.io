import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import ts from 'typescript';
import { loadWorks } from '../../src/lib/works-data.mjs';
import { validateInquiry } from '../../src/lib/inquiry-validate.mjs';
import { buildMailto } from '../../src/lib/inquiry-mail.mjs';
const expected = [
 ['2026-11-11_chiikawa-ice-cream-keychain',null,['chiikawa-ice-cream-keychain'],['RseZJz4l1g4',56],null,null,['X2D','H3C'],'PLA',null,null,'/assets/images/posts/chiikawa-ice-cream-keychain/hero.jpg'],
 ['2026-11-10_mario-luigi-multipart-assembly',null,['mario-luigi-multipart-assembly'],['ejELZAjMKug',63],['sedkCEygUiM',403],null,[],null,null,null,'/assets/images/posts/mario-luigi-multipart-assembly/08-brothers.jpg'],
 ['2026-11-09_ams2-pro-sliding-speedrack-underrail',1,['ams2-pro-sliding-speedrack-underrail'],['cgMnIAW3yCA',60],null,3574866,['A2L'],'PLA','~22h','~700 g','/assets/images/posts/ams2-pro-sliding-speedrack-underrail/hero.jpg'],
 ['2026-11-08_bambulab-h3c-multicolor-figure',3,['bambulab-h3c-multicolor-figure'],['CcLO_yhIbOU',55],null,null,['H3C'],null,'~8h',null,'/assets/images/posts/bambulab-h3c-multicolor-figure/hero.jpg'],
 ['2026-11-08_bambulab-ams3h-instant-recognition',null,['bambulab-ams3h-instant-recognition'],['uPyB9AImuz0',62],null,null,['H3C'],null,null,null,'/assets/images/posts/bambulab-ams3h-instant-recognition/hero.jpg'],
 ['2026-11-07_bowser-multipart-assembly',4,['bowser-multipart-assembly'],['X5TQIys0Tp4',39],['zcSouFcNGtQ',81],null,['P2S','X2D'],null,null,null,'/assets/images/posts/bowser-multipart-assembly/hero.jpg'],
 ['2026-11-07_bulbasaur-15cm-multipart-print',null,['bulbasaur-15cm-multipart-print'],['roiKAYF-dus',46],null,null,['X2D','P2S'],null,null,null,'/assets/images/posts/bulbasaur-15cm-multipart-print/hero.jpg'],
 ['2026-11-07_bambulab-h3c-ams3-unboxing',null,['bambulab-h3c-ams3-unboxing'],['wdej-f_pGgM',86],null,null,['H3C'],null,'1h 25m','24.7 g','/assets/images/posts/bambulab-h3c-ams3-unboxing/08-capybara-keyring.jpg'],
 ['2026-10-28_halloween-kinder-holder',5,[],['DsGxGqEg4P4',60],null,null,[],null,null,null,null],
 ['2026-10-20_okyc-sign',2,[],null,['lRF2YkJqRrE',88],null,['X2D'],'PLA','~66h',null,null],
];
test('all works exactly match the confirmed source table', () => {
 const works = loadWorks();
 const rows = works.map(w => [w.id,w.home ?? null,w.posts,w.shorts ? [w.shorts.id,w.shorts.seconds] : null,w.long ? [w.long.id,w.long.seconds] : null,w.makerworld ?? null,w.printers,w.material ?? null,w.time ?? null,w.filament ?? null,w.image?.src ?? null]);
 assert.deepEqual(rows,[...expected].sort((a,b) => b[0].localeCompare(a[0]))); works.forEach(w => { assert.equal('layer' in w,false); assert.equal(w.date,w.id.slice(0,10)); });
});
function invalid(mutator) {
 const dir = mkdtempSync(join(tmpdir(),'rc-works-'));
 try {
  const works = loadWorks().filter(w => w.home !== undefined).slice(0,2).map(w => structuredClone(w)); mutator(works);
  for (const w of works) writeFileSync(join(dir,`${w.id}.yaml`),JSON.stringify(w));
  assert.throws(() => loadWorks(dir));
 } finally { rmSync(dir,{recursive:true,force:true}); }
}
test('unknown keys fail', () => invalid(w => { w[0].typo = 'wrong'; }));
test('missing language fails', () => invalid(w => { delete w[0].title.ja; }));
test('duplicate home fails', () => invalid(w => { w[1].home = w[0].home; }));
async function sourceModule(file) {
 const source = readFileSync(new URL('../../src/lib/'+file,import.meta.url),'utf8');
 assert.doesNotMatch(source,/[\u2013\u2014]/u);
 return import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText).toString('base64'));
}
test('copy, gear and about have identical language key structures and no long dashes', async () => {
 const {portalCopy} = await sourceModule('portal-copy.ts'); const {gear} = await sourceModule('gear.ts'); const {aboutCopy} = await sourceModule('about.ts');
 for (const value of [portalCopy,aboutCopy]) for (const lang of ['en','ja']) assert.deepEqual(Object.keys(value[lang]).sort(),Object.keys(value.ko).sort());
 for (const g of gear) assert.deepEqual(Object.keys(g.description).sort(),['en','ja','ko']);
 assert.equal(gear.length,6); assert.equal(gear[3].name,'Bambu Lab A2L');
});
const good = {type:'print',name:' Kevin ',email:'a@example.com',phone:'',message:'Print this',consent_required:true,consent_optional:false};
const file = (name = 'model.STL',size = 100) => ({name,size});
test('valid form, case-insensitive file extensions and exact size boundary', () => {
 assert.deepEqual(validateInquiry(good,[file()]),[]); assert.deepEqual(validateInquiry(good,[file('max.3mf',209715200)]),[]);
});
for (const [name,values,files,key] of [
 ['name',{name:'  '},[],'name'], ['email',{email:'not-an-email'},[],'email'], ['phone format',{phone:'not phone',consent_optional:true},[],'phone'], ['phone consent',{phone:'+82 10-1234-5678'},[],'phoneConsent'], ['message',{message:' '},[],'message'],
 ['file extension',{},[file('evil.stl.exe')],'fileType'], ['six files',{},Array.from({length:6},() => file()),'fileCount'], ['file total',{},[file('a.stl',209715200),file('b.stl',1)],'fileSize'], ['required consent',{consent_required:false},[],'consent'],
]) test(`form rejects ${name}`, () => assert.ok(validateInquiry({...good,...values},files).includes(key)));
test('dev tab excludes retained print files from validation', () => assert.deepEqual(validateInquiry({...good,type:'dev'},[file('bad.exe',999999999)]),[]));
test('mailto encodes subject, body, consent and filenames without attaching files', async () => {
 const {portalCopy} = await sourceModule('portal-copy.ts');
 for (const lang of ['ko','en','ja']) {
  const copy = portalCopy[lang], subject = copy['form.mailSubject.print'];
  const url = new URL(buildMailto({contact:'kevinpark@okyc.kr',subject,values:{...good,message:'a & b\n한글 #?'},files:[file('part & body.3mf')],copy}));
  assert.equal(url.protocol,'mailto:'); assert.equal(url.pathname,'kevinpark@okyc.kr'); assert.equal(url.searchParams.get('subject'),subject);
  const body = url.searchParams.get('body'); assert.ok(body.includes('a & b\n한글 #?')); assert.ok(body.includes('part & body.3mf')); assert.ok(body.includes(copy['form.offlineFiles'])); assert.ok(body.includes(copy['consent.required']+': ✓'));
 }
});
