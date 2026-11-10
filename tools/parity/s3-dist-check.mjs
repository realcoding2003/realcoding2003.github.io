import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';
import { parseHtml, textOf, hasClass, ancestor, decode } from './html-tree.mjs';
import { loadWorks } from '../../src/lib/works-data.mjs';
const root = resolve(process.argv[2] || 'dist');
const failures = []; let pages = 0, internalLinks = 0, related = 0;
const check = (ok,path,message) => { if (!ok) failures.push({path,message}); };
const prefixes = ['', '/en','/ja'];
const portalPaths = prefixes.flatMap(p => ['', 'maker/','dev/','game/','life/','videos/','request/','about/','archive/','tags/','categories/'].map(s => `${p}/${s}`));
const newPaths = prefixes.flatMap(p => ['maker','dev','game','life','videos','request'].map(s => `${p}/${s}/`));
const sitemap = [...readFileSync(join(root,'sitemap.xml'),'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => new URL(decode(m[1])).pathname);
const works = loadWorks(); const relatedSlugs = new Set(works.flatMap(w => w.posts));
const fileFor = path => join(root,decodeURIComponent(path).replace(/^\//,''),path.endsWith('/') ? 'index.html' : '');
const idCache = new Map();
function idsFor(file) { if (!idCache.has(file)) idCache.set(file,new Set(parseHtml(readFileSync(file,'utf8')).nodes.filter(n => n.a.id).map(n => n.a.id))); return idCache.get(file); }
function* walk(dir) { for (const e of readdirSync(dir,{withFileTypes:true})) { const file=join(dir,e.name); if(e.isDirectory()) yield* walk(file); else if(e.name.endsWith('.html')) yield file; } }
check(sitemap.length === 495,'sitemap','URL count != 495');
for (const path of newPaths) {
 const file = fileFor(path); check(existsSync(file),path,'Missing new page'); if (!existsSync(file)) continue;
 const nodes = parseHtml(readFileSync(file,'utf8')).nodes;
 const game = path.endsWith('/game/'); check(sitemap.includes(path) !== game,path,'Sitemap indexability');
 if (game) check(nodes.some(n => n.tag === 'meta' && n.a.name === 'robots' && n.a.content === 'noindex'),path,'Empty game must be noindex');
}
for (const file of walk(root)) {
 const path = '/' + relative(root,file).replace(/index.html$/,''); const html = readFileSync(file,'utf8'); const {nodes} = parseHtml(html); pages++;
 for (const link of nodes.filter(n => n.tag === 'a' && n.a.href?.startsWith('/') && !n.a.href.startsWith('//'))) {
  internalLinks++; const url = new URL(link.a.href,'https://realcoding.blog'); let target = fileFor(url.pathname);
  if (existsSync(target) && statSync(target).isDirectory()) target = join(target,'index.html');
  check(existsSync(target) && !statSync(target).isDirectory(),path,`Broken internal link: ${path} → ${link.a.href}`);
  if (existsSync(target) && !statSync(target).isDirectory() && url.hash && !ancestor(link,n => hasClass(n,'post-content')) && (/^\/(?:en\/|ja\/)?(?:tags|categories)\/$/.test(url.pathname) || portalPaths.includes(url.pathname))) {
   check(idsFor(target).has(decodeURIComponent(url.hash.slice(1))),path,`Missing fragment: ${path} → ${link.a.href}`);
  }
 }
 const foot = nodes.find(n => n.tag === 'footer');
 const redirect = nodes.some(n => n.tag === 'meta' && n.a['http-equiv']?.toLowerCase() === 'refresh');
 if (!redirect) {
  const links = nodes.filter(n => n.tag === 'a' && ancestor(n,p => p === foot)).map(n => n.a.href);
  const profile = /^\/(en|ja)\//.test(path) ? 'https://makerworld.com/@realcoding' : 'https://makerworld.com/ko/@realcoding';
  for (const href of [profile,'https://www.youtube.com/@realcoding2003','https://github.com/realcoding2003','/feed.xml','/privacy/']) check(links.includes(href),path,`Footer missing ${href}`);
 }
 if (nodes.some(n => n.tag === 'article' && hasClass(n,'reader'))) {
  const slug = path.split('/').filter(Boolean).at(-1); const sections = nodes.filter(n => hasClass(n,'related-works'));
  check(sections.length === (relatedSlugs.has(slug) ? 1 : 0),path,'Related works selection'); if(sections.length) related++;
  if (slug === 'ams2-pro-sliding-speedrack-underrail') check(nodes.some(n => n.tag === 'a' && n.a.href === 'https://makerworld.com/models/3574866' && ancestor(n,p => hasClass(p,'related-works'))),path,'Related model link');
 }
 if (!portalPaths.includes(path)) continue;
 const htmlNode = nodes.find(n => n.tag === 'html'); check(htmlNode.a['data-theme'] === 'dark' && htmlNode.a['data-theme-mode'] === 'dark',path,'Portal must be dark');
 check(nodes.filter(n => 'data-theme-toggle' in n.a).length === 0,path,'Theme toggle on portal');
 check(nodes.filter(n => n.tag === 'h1').length === 1,path,'H1 count != 1');
 for (const n of nodes.filter(n => n.tag === 'img')) check('alt' in n.a && Number(n.a.width)>0 && Number(n.a.height)>0,path,`Image dimensions/alt ${n.a.src}`);
 check(nodes.filter(n => n.a.fetchpriority === 'high').length <= 1,path,'More than one high priority');
 check(nodes.filter(n => hasClass(n,'layer-rail')).length === 1,path,'Layer rail count');
 // Only authored UI strings carry data-copy. Post-title data (including original
 // English long dashes) is intentionally excluded; do not scan whole-page text.
 for (const n of nodes.filter(n => 'data-copy' in n.a)) check(!/[\u2013\u2014]/u.test(textOf(n)),path,'Long dash in UI copy');
 const header = nodes.find(n => n.tag === 'header' && hasClass(n,'site-header'));
 const headerLinks = nodes.filter(n => n.tag === 'a' && ancestor(n,p => p === header));
 check(!headerLinks.some(n => /\/game\/$/.test(n.a.href) && ancestor(n,p => hasClass(p,'main-nav'))),path,'Empty game menu');
 const realm = path.match(/\/(maker|dev|game|life|videos|request)\/$/)?.[1];
 if (realm && realm !== 'game') check(headerLinks.some(n => n.a.href === path && n.a['aria-current'] === 'page'),path,'Current menu not marked');
 if (prefixes.some(p => path === p+'/')) {
  const layers = nodes.filter(n => n.tag === 'section' && 'data-layer' in n.a).map(n => n.a['data-layer']); check(layers.join(',') === '1,2,3,4,5,6,7',path,'Home layers');
  check(nodes.filter(n => hasClass(n,'slice')).length === 3,path,'Realm slices'); check(nodes.filter(n => hasClass(n,'bento-cell')).length === 5,path,'Bento cells');
  const stats = nodes.find(n => hasClass(n,'stats-values')); check(!!stats && textOf(stats).replace(/\s+/g,' ').trim().replace(/\s*·\s*/g,' · ') === 'A2L · ~22h · ~700 g',path,'Exact stats strip');
  const rail = nodes.find(n => hasClass(n,'video-rail')); check(nodes.filter(n => n.tag === 'li' && n.parent === rail).length === 7,path,'Shorts rail count');
  check(nodes.some(n => n.a['aria-hidden'] === 'true' && textOf(n).includes('0.20')),path,'0.20 must be decorative');
  check(nodes.some(n => n.a.href === '#works') && nodes.some(n => n.a.id === 'works'),path,'Works anchor');
  check(/출력 완료|Print complete|印刷完了/.test(html),path,'Finish copy');
 }
 if (realm === 'request') {
  check(nodes.filter(n => n.tag === 'form').length === 1,path,'Form count');
  for (const name of ['name','email','phone','message','files','consent_required','consent_optional']) check(nodes.some(n => n.a.name === name),path,`Missing form field ${name}`);
  check(nodes.some(n => n.a.name === 'files' && n.a.accept === '.3mf,.stl' && 'multiple' in n.a),path,'File accept/multiple');
  check(nodes.filter(n => n.a.role === 'tablist').length === 1 && nodes.filter(n => n.a.role === 'tab').length === 2,path,'Tabs');
  const form = nodes.find(n => n.tag === 'form');
  if (!form.a['data-api']) { check(html.includes('mailto:kevinpark@okyc.kr'),path,'Offline mail'); check(nodes.some(n => hasClass(n,'submit-bar') && 'hidden' in n.a),path,'Submit bar must start hidden'); }
  check(/문의 처리 완료 후 1년|one year after the inquiry is closed|お問い合わせ対応完了後1年間/.test(html),path,'Retention notice');
  if(path === '/request/') check(html.includes('캐릭터 피규어 등 타인 저작물의 판매용 출력 대행'),path,'Copyright restriction');
 }
 if(realm === 'dev') { const rows = nodes.filter(n => 'data-post-row' in n.a); check(rows.length === 140 && rows.every(n => 'data-c1' in n.a),path,'Dev topic row data'); check(nodes.some(n => n.a.role === 'group'),path,'Filter groups'); }
 if(realm === 'maker') { check(nodes.filter(n => hasClass(n,'work-grid-card')).length === 8,path,'Works grid count'); check(nodes.filter(n => n.tag === 'dt').length === 6,path,'Gear count'); }
}
check(related === 18,'all','Expected 18 related-work reader pages');
console.log(JSON.stringify({pages,portalPages:portalPaths.length,newPages:newPaths.length,sitemap:sitemap.length,internalLinks,related,failures:failures.length,details:failures},null,2));
if (failures.length) process.exitCode = 1;
