import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';
import { parseHtml, textOf, hasClass, ancestor } from './html-tree.mjs';
const root = resolve(process.argv[2] || 'dist'), source = resolve('assets/video/portal');
const failures = []; let pages = 0, readers = 0;
const check = (ok, path, message) => { if (!ok) failures.push({ path, message }); };
const prefixes = ['', '/en', '/ja'];
const portals = prefixes.flatMap(p => ['', 'ai/', 'maker/', 'dev/', 'game/', 'life/', 'videos/', 'request/', 'about/', 'archive/', 'tags/', 'categories/'].map(s => `${p}/${s}`));
const copy = {
 ko: ['한 층씩 쌓는다.','만들고,','3D 프린터로 직접 만든 것들.','코딩하고,','실무에서 배운 개발 이야기.','플레이한다.','게임 공략과 일상까지.','빈 빌드판 위에서 노즐이 첫 층을 그리는 3D 프린터','출력 완료'],
 en: ['Layer by layer.','Make,','Things I make with 3D printers.','Code,','Development lessons from real work.','Play.','Game guides and everyday life, too.','A 3D printer nozzle drawing the first layer on an empty build plate','Print complete'],
 ja: ['一層ずつ積み上げる。','作って、','3Dプリンターで自作したもの。','コードを書いて、','実務で学んだ開発の話。','遊ぶ。','ゲーム攻略と日常まで。','空のビルドプレートに最初の層を描く3Dプリンターのノズル','印刷完了'],
};
function* walk(dir) { for (const e of readdirSync(dir,{withFileTypes:true})) { const file=join(dir,e.name); if(e.isDirectory()) yield* walk(file); else if(e.name.endsWith('.html')) yield file; } }
const get = (nodes, key) => nodes.filter(n => key in n.a);
const below = (nodes, parent) => nodes.filter(n => ancestor(n, a => a === parent));
for (const file of walk(root)) {
 const path = '/' + relative(root, file).replace(/index.html$/, ''), html = readFileSync(file, 'utf8');
 const {nodes} = parseHtml(html); pages++;
 check(!/<video\b/i.test(html),path,'SSR video must be absent');
 check(!nodes.some(n => n.tag === 'link' && /preload|prefetch/.test(n.a.rel || '') && /\.mp4/i.test(n.a.href || '')),path,'Video preload/prefetch');
 const stripped = html.replace(/\sdata-src-(?:desktop|mobile)\s*=\s*(?:"[^"]*"|'[^']*')/gi,'');
 check(!/\.mp4/i.test(stripped),path,'mp4 outside deferred source attributes');
 const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] || '';
 const gates = [...head.matchAll(/<script\b[^>]*data-motion-gate[^>]*>([\s\S]*?)<\/script>/gi)];
 check(gates.length === (portals.includes(path) ? 1 : 0),path,'Head motion gate count');
 if (gates.length) check(gates[0][1].includes('dataset.motion') && head.indexOf('classList.add') < head.indexOf('data-motion-gate'),path,'Gate follows theme and contains decision');
 if (nodes.some(n => hasClass(n,'reader'))) readers++;
 if (!portals.includes(path)) continue;
 const lang = path.startsWith('/en/') ? 'en' : path.startsWith('/ja/') ? 'ja' : 'ko', t = copy[lang];
 const rail = get(nodes,'data-layer-rail');
 check(rail.length === 1,path,'Layer rail count');
 check(get(nodes,'data-rail-layer').map(textOf).join() === 'L 001' && get(nodes,'data-rail-z').map(textOf).join() === 'Z 0.20',path,'Initial readout');
 const finish = get(nodes,'data-rail-finish'); check(finish.length === 1 && 'hidden' in finish[0].a && textOf(finish[0]) === t[8],path,'Rail finish hidden and localized');
 check(get(nodes,'data-rail-marker').length === 1,path,'Real tick marker');
 const home = prefixes.some(p => path === p + '/');
 if (home) {
  const heroes = get(nodes,'data-hero'), hero = heroes[0]; check(heroes.length === 1,path,'Hero count');
  check(hero?.a['data-src-desktop'] === '/assets/video/portal/hero-desktop.mp4' && hero?.a['data-src-mobile'] === '/assets/video/portal/hero-mobile.mp4',path,'Hero sources');
  check(get(nodes,'data-hero-track').length === 1 && get(nodes,'data-hero-stage').length === 1,path,'Hero track/stage');
  const chapters = nodes.filter(n => hasClass(n,'hero-chapter'));
  check(chapters.length === 4 && chapters.map(n => n.a['data-chapter']).join() === '1,2,3,4',path,'Chapter structure');
  for (const n of [2,3,4]) {
   const chapter = chapters.find(c => c.a['data-chapter'] === String(n)); const children = chapter ? below(nodes,chapter) : [];
   check(chapter?.a['aria-hidden'] === 'true',path,`Chapter ${n} accessibility`);
   check(children.some(c => hasClass(c,'chapter-title') && textOf(c) === t[(n-2)*2+1]) && children.some(c => hasClass(c,'chapter-line') && textOf(c) === t[(n-2)*2+2]),path,`Chapter ${n} exact copy`);
  }
  const h1 = nodes.filter(n => n.tag === 'h1'); check(h1.length === 1 && textOf(h1[0]) === t[0],path,'Exact hero H1');
  const poster = nodes.find(n => n.tag === 'img' && n.a.src === '/assets/video/portal/hero-desktop-poster.jpg');
  check(poster?.a.fetchpriority === 'high' && poster.a.loading === 'eager' && poster.a.width === '1920' && poster.a.height === '1072' && poster.a.alt === t[7],path,'Hero poster attributes');
  const picture = poster && ancestor(poster,n=>n.tag==='picture'); check(picture && below(nodes,picture).some(n=>n.tag==='source' && n.a.type==='image/webp'),path,'Hero responsive WebP');
  check(nodes.filter(n=>n.a.fetchpriority==='high').length === 1,path,'One high priority');
  const slices = nodes.filter(n=>hasClass(n,'slice')); check(slices.length === 4,path,'Four populated realm slices');
  check('data-open' in slices[0].a && below(nodes,slices[0]).some(n=>n.a['data-src-desktop']==='/assets/video/portal/realm-ai-desktop.mp4'),path,'AI default ambient slice');
  for (const slice of slices) {
   const children = below(nodes,slice), realm = children.find(n=>hasClass(n,'slice-link'))?.a.href.match(/\/(ai|maker|dev|game|life)\/$/)?.[1];
   const ambient = get(children,'data-ambient');
   check(ambient.length === 1 && ambient[0].a['data-ambient-group'] === 'realms' && ambient[0].a['data-src-desktop'] === `/assets/video/portal/realm-${realm}-desktop.mp4` && ambient[0].a['data-src-mobile'] === `/assets/video/portal/realm-${realm}-mobile.mp4`,path,'Matching slice sources');
   check(children.some(n=>n.tag==='img' && n.a.src===`/assets/video/portal/realm-${realm}-poster.jpg` && n.a.alt==='' && n.a.loading==='lazy'),path,'Matching decorative slice poster');
   check(!children.some(n=>hasClass(n,'line-field') || /bulbasaur/.test(n.a.src || '')),path,'No old realm image/texture');
  }
  const diptych = nodes.find(n=>hasClass(n,'diptych')), children = diptych ? below(nodes,diptych) : [];
  check(get(children,'data-ambient').length === 1 && children.some(n=>n.a['data-src-desktop']==='/assets/video/portal/request-desktop.mp4') && !children.some(n=>/02-original-parts-printed/.test(n.a.src || '')),path,'Diptych request footage');
  check(get(nodes,'data-finish').filter(n=>n.tag==='h2').length===1,path,'Footer finish heading');
 }
 if (/\/ai\/$/.test(path)) {
  const heroes=get(nodes,'data-hero'),hero=heroes[0],chapters=nodes.filter(n=>hasClass(n,'hero-chapter'));
  const titles={ko:['AI로 일합니다.','업무를 한 층씩 다시 쌓습니다.','기업의 AX·DX 전환까지.'],en:['I work with AI.','Rebuilding work, layer by layer.','All the way to AX and DX.'],ja:['AIと働く。','業務を一層ずつ積み直す。','企業のAX・DX転換まで。']}[lang];
  check(heroes.length===1 && hero.a['data-src-desktop']==='/assets/video/portal/ax-hero-desktop.mp4' && hero.a['data-src-mobile']==='/assets/video/portal/ax-hero-mobile.mp4',path,'AX hero sources');
  check(hero?.a['data-chapter-starts']==='0,0.19,0.56' && get(nodes,'data-hero-track').length===1 && get(nodes,'data-hero-stage').length===1,path,'AX pin/chapter boundaries');
  check(chapters.length===3 && chapters.every((n,i)=>n.a['data-chapter']===String(i+1) && below(nodes,n).some(c=>(c.tag==='h1' || hasClass(c,'chapter-title')) && textOf(c)===titles[i]) && (i===0 ? 'data-active' in n.a : n.a['aria-hidden']==='true')),path,'AX three localized chapters');
  const poster=nodes.find(n=>n.tag==='img' && n.a.fetchpriority==='high');
  check(poster?.a.src==='/assets/video/portal/ax-hero-desktop-poster.jpg' && poster.a.loading==='eager' && poster.a.width==='1920' && poster.a.height==='1072',path,'AX hero desktop poster');
  const picture=poster && ancestor(poster,n=>n.tag==='picture');
  check(picture && below(nodes,picture).some(n=>n.tag==='source' && n.a.type==='image/webp' && n.a.media) && below(nodes,picture).some(n=>n.tag==='source' && n.a.srcset==='/assets/video/portal/ax-hero-mobile-poster.jpg'),path,'AX mobile art direction and WebP');
  check(nodes.filter(n=>n.a.fetchpriority==='high').length===1,path,'AX single LCP priority');
 }
 if (/\/request\/$/.test(path)) {
  const dev = nodes.find(n=>n.a.id==='dev'), print = nodes.find(n=>n.a.id==='print');
  const children = dev ? below(nodes,dev) : [], ambient = get(children,'data-ambient');
  check(ambient.length===1 && hasClass(ambient[0],'request-poster') && ambient[0].a['data-src-desktop']==='/assets/video/portal/request-desktop.mp4' && ambient[0].a['data-src-mobile']==='/assets/video/portal/request-mobile.mp4',path,'Request dev ambient');
  check(!children.some(n=>hasClass(n,'line-field')),path,'No dev texture');
  const ax=nodes.find(n=>n.a.id==='ax');
  check(ax && below(nodes,ax).some(n=>n.tag==='img' && n.a.src==='/assets/video/portal/ax-hero-desktop-poster.jpg') && get(below(nodes,ax),'data-ambient').length===0,path,'AX static tab poster');
  check(print && below(nodes,print).some(n=>/05-a2l-plate/.test(n.a.src || '')),path,'Print photo retained');
 }
 const realm = path.match(/\/(ai|maker|dev|game|life)\/$/)?.[1];
 if (realm) {
  check(get(nodes,'data-ambient').length===0,path,'No realm ambient');
  if (realm==='dev' || realm==='life') {
   const head = nodes.find(n=>hasClass(n,'page-head'));
   check(head && below(nodes,head).some(n=>n.tag==='img' && n.a.src===`/assets/video/portal/realm-${realm}-poster.jpg` && n.a.fetchpriority==='high' && n.a.loading==='eager'),path,'Realm head poster');
   check(nodes.filter(n=>n.a.fetchpriority==='high').length===1,path,'Realm single LCP priority');
   check(!hasClass(head,'line-field'),path,'No realm head texture');
  } else check(!nodes.some(n=>/realm-.*-poster/.test(n.a.src || '')),path,'Maker/game unchanged media');
 }
}
check(readers===465,'all','465 reader pages retained');
for (const path of portals) check(existsSync(join(root,path,'index.html')),'all',`Missing portal ${path}`);
const files = readdirSync(source); check(files.length===26,'assets','26 source files');
for (const name of files) { const target=join(root,'assets/video/portal',name); check(existsSync(target) && statSync(target).size===statSync(join(source,name)).size,'assets',`Copied unchanged: ${name}`); }
const bytes = name => statSync(join(source,name)).size;
const sums = {heroDesktop:bytes('hero-desktop.mp4'),heroMobile:bytes('hero-mobile.mp4'),axHeroDesktop:bytes('ax-hero-desktop.mp4'),axHeroMobile:bytes('ax-hero-mobile.mp4'),loopsDesktop:files.filter(n=>/^(realm-.*|request)-desktop\.mp4$/.test(n)).reduce((s,n)=>s+bytes(n),0),loopsMobile:files.filter(n=>/^(realm-.*|request)-mobile\.mp4$/.test(n)).reduce((s,n)=>s+bytes(n),0)};
for (const [name,limit] of Object.entries({heroDesktop:20,heroMobile:8,axHeroDesktop:20,axHeroMobile:8,loopsDesktop:12,loopsMobile:6})) check(sums[name]<=limit*1024*1024,'assets',`${name} <= ${limit} MiB`);
const pkg=JSON.parse(readFileSync('package.json','utf8')); check(!!pkg.dependencies.lenis && !pkg.dependencies.gsap && !pkg.devDependencies.gsap,'package','Lenis only, no GSAP');
console.log(JSON.stringify({pages,readers,portalPages:portals.length,assetBytes:sums,failures:failures.length,details:failures},null,2));
if(failures.length) process.exitCode=1;
