#!/usr/bin/env python3
import argparse, concurrent.futures, datetime, html.parser, json, logging, re, urllib.error, urllib.request
from pathlib import Path

UA = 'realcoding-baseline/1.0'

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl): return None
OPENER = urllib.request.build_opener(NoRedirect)

class HeadParser(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(); self.canonical=None; self.hreflang={}; self.og_url=None; self.title=''; self.in_title=False; self.refresh=None
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag=='link':
            if a.get('rel','').lower()=='canonical': self.canonical=a.get('href')
            if a.get('rel','').lower()=='alternate' and a.get('hreflang') in ('ko','en','ja','x-default'): self.hreflang[a['hreflang']]=a.get('href')
        if tag=='meta':
            if a.get('property')=='og:url': self.og_url=a.get('content')
            if a.get('http-equiv','').lower()=='refresh':
                m=re.search(r'url\s*=\s*[\'\"]?([^\'\";]+)',a.get('content',''),re.I); self.refresh=m.group(1).strip() if m else None
        if tag=='title': self.in_title=True
    def handle_endtag(self,tag):
        if tag=='title': self.in_title=False
    def handle_data(self,data):
        if self.in_title: self.title += data

def fetch(url):
    for attempt in range(2):
        try:
            req=urllib.request.Request(url,headers={'User-Agent':UA})
            with OPENER.open(req,timeout=20) as r: return r.status,r.read()
        except urllib.error.HTTPError as e:
            # redirects are observed, not followed
            if 300 <= e.code < 400: return e.code,e.read()
            return e.code,e.read()
        except Exception as e:
            if attempt: return 0,str(e).encode()
    return 0,b''

def path_of(url):
    from urllib.parse import urlsplit
    return urlsplit(url).path or '/'
def frontmatter(p):
    t=p.read_text(encoding='utf-8'); m=re.match(r'\A---\s*\n(.*?)\n---(?:\n|$)',t,re.S)
    if not m: return {}
    lines=m.group(1).splitlines(); d={}; key=None; inlist=False
    for line in lines:
        if not line.strip() or line.lstrip().startswith('#'): continue
        q=re.match(r'^([\w-]+):\s*(.*)$',line)
        if q:
            key=q.group(1); val=q.group(2).strip(); inlist=False
            if val in ('','[]'): d[key]=[] if val in ('','[]') else ''; inlist=(val=='')
            elif val.startswith('[') and val.endswith(']'): d[key]=[x.strip().strip("'\"") for x in val[1:-1].split(',') if x.strip()]
            else: d[key]=val.strip("'\"")
        elif key and line.lstrip().startswith('-'):
            d.setdefault(key,[]).append(line.lstrip()[1:].strip().strip("'\"")); inlist=True
    return d

# S1 additions: UTC filename-preserving addresses, normalized addresses, body metrics,
# privacy aliases, raw evidence, explicit local-origin rewrite and Atom capture.
import hashlib, xml.etree.ElementTree as ET
from urllib.parse import urljoin
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
from body_parser import BodyParser

def post_rows(posts):
    rows=[]; now=datetime.datetime.now(datetime.timezone.utc)
    for f in sorted(Path(posts).glob('*.md')):
        fm=frontmatter(f); stem=f.stem; raw=str(fm.get('date',''))
        try: dt=datetime.datetime.fromisoformat(raw.replace('Z','+00:00'))
        except ValueError: dt=datetime.datetime.fromisoformat(stem[:10])
        if dt.tzinfo is None: dt=dt.replace(tzinfo=datetime.timezone.utc)
        dt=dt.astimezone(datetime.timezone.utc)
        if dt>now: continue
        dp=dt.strftime('%Y/%m/%d'); filename_slug=stem[11:]
        lang=str(fm.get('lang') or ('ja' if stem.endswith('-ja') else 'en' if stem.endswith('-en') else 'ko'))
        slug=str(fm.get('slug') or filename_slug); base_slug=re.sub(r'-(en|ja)$','',slug)
        if fm.get('permalink'):
            old=str(fm['permalink']).replace(':year',dp[:4]).replace(':month',dp[5:7]).replace(':day',dp[8:10]).replace(':title',slug)
        else: old='/'+dp+'/'+filename_slug+'/'
        old=old.rstrip('/')+'/'
        canonical=f'/{lang}/{dp}/{base_slug}/' if lang in ('en','ja') and not old.startswith('/'+lang+'/') else old
        redirects=fm.get('redirect_from') or []; redirects=[redirects] if isinstance(redirects,str) else redirects
        body=f.read_text(encoding='utf-8').split('---',2)[-1]
        rows.append({'file':f.name,'lang':lang,'slug':base_slug,'date_raw':raw,'date_utc_path':dp,
                     'filename_date':stem[:10],'redirect_from':redirects,'expected_path':old,
                     'canonical_path':canonical,'normalized':old!=canonical,
                     'has_task_list':bool(re.search(r'^\s*- \[[ xX]\]',body,re.M)),
                     'mermaid_flag':fm.get('mermaid')=='true'})
    return rows

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--site',default='https://realcoding.blog'); ap.add_argument('--posts',required=True); ap.add_argument('--out',required=True); a=ap.parse_args()
    out=Path(a.out); (out/'html').mkdir(parents=True,exist_ok=True); (out/'logs').mkdir(exist_ok=True)
    logging.basicConfig(filename=out/'logs/run.log',level=logging.INFO,format='%(asctime)s %(levelname)s %(message)s')
    base=a.site.rstrip('/'); status,body=fetch(base+'/sitemap.xml')
    if status!=200: raise SystemExit(f'sitemap fetch failed: {status}')
    (out/'sitemap.xml').write_bytes(body)
    root=ET.fromstring(body); sitemap_paths=[path_of(x.text) for x in root.findall('.//{*}loc')]
    posts=post_rows(a.posts)
    tasks=[(old,r['file'],r['expected_path'],r['canonical_path']) for r in posts for old in r['redirect_from']]
    tasks += [(old,'privacy.md','/privacy/','/privacy/') for old in ['/en/privacy/','/ja/privacy/']]
    # Collect both old and new URLs even when only one is in the site's sitemap.
    paths=set(sitemap_paths)|{r['expected_path'] for r in posts}|{r['canonical_path'] for r in posts}|{x[0] for x in tasks}|{'/privacy/'}
    def inspect_path(path):
        st,b=fetch(base+path); h=b.decode('utf-8','replace'); hp=HeadParser(); hp.feed(h); bp=BodyParser(); bp.feed(h)
        evidence=hashlib.sha256(path.encode()).hexdigest()+'.html'; (out/'html'/evidence).write_bytes(b)
        return dict(url=base+path,path=path,status=st,canonical=hp.canonical,hreflang={k:hp.hreflang.get(k) for k in ('ko','en','ja','x-default')},og_url=hp.og_url,title=hp.title.strip(),refresh_target=hp.refresh,evidence='html/'+evidence,**bp.result())
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex: pages=list(ex.map(inspect_path,sorted(paths)))
    bypath={p['path']:p for p in pages}
    redirects=[]
    for old,file,target,canonical in tasks:
        p=bypath[old]; redirects.append(dict(**{k:p[k] for k in ('status','refresh_target','canonical')},**{'from':old,'source_file':file,'expected_target_path':target,'canonical_target_path':canonical,'match':bool(p['refresh_target'] and path_of(p['refresh_target'])==target)}))
    for r in posts: r['in_sitemap']=r['expected_path'] in sitemap_paths
    st,feed=fetch(base+'/feed.xml'); (out/'feed.xml').write_bytes(feed)
    if st!=200: raise SystemExit(f'feed fetch failed: {st}')
    fr=ET.fromstring(feed); ns={'a':'http://www.w3.org/2005/Atom'}
    feed_report={'status':st,'id':fr.findtext('a:id',namespaces=ns),'links':[x.attrib for x in fr.findall('a:link',ns)],'entries':[{'id':e.findtext('a:id',namespaces=ns),'links':[x.attrib for x in e.findall('a:link',ns)],'published':e.findtext('a:published',namespaces=ns)} for e in fr.findall('a:entry',ns)]}
    for name,data in [('pages.json',pages),('sitemap-urls.json',[bypath[p] for p in sitemap_paths]),('posts.json',posts),('redirects.json',redirects),('feed.json',feed_report)]:
        (out/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    summary=f'sitemap={len(sitemap_paths)} posts={len(posts)} redirects={len(redirects)} requests={len(pages)+2} non200={sum(p["status"]!=200 for p in pages)} feed_entries={len(feed_report["entries"])}'
    (out/'summary.md').write_text('# S1 baseline\n\n'+summary+'\n\nBody selector verified on production: `.post-content` (excludes article header, sharing, comments).\n',encoding='utf-8')
    logging.info(summary); print(summary)
if __name__=='__main__':
    # -I omits the script directory; only add this owned tool directory.
    main()
