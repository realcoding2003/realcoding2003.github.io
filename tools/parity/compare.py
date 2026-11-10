#!/usr/bin/env python3
"""Strict URL/metadata/body/Atom parity check. Standard library only.
Expected URL changes are derived from post language/path rules. IMPROVED_BODY
is the explicitly approved S2 Markdown correction list, with exact target metrics.
Other mismatches still fail, including inside these groups.
The only additional sitemap category is 신규 페이지 (the explicit S3 NEW_PAGES).
"""
import argparse, json, sys
from pathlib import Path
from urllib.parse import urlsplit

ORIGIN='https://realcoding.blog'
LANGS=('ko','en','ja','x-default')

NEW_PAGES = {
    '/ai/', '/en/ai/', '/ja/ai/',
    '/maker/', '/dev/', '/life/', '/videos/', '/request/',
    '/en/maker/', '/en/dev/', '/en/life/', '/en/videos/', '/en/request/',
    '/ja/maker/', '/ja/dev/', '/ja/life/', '/ja/videos/', '/ja/request/',
}
NEW_PAGE_REASON = 'S3 포털 신규 화면'

def compare_sitemap(desired, local, pages):
    errors=[]; expected=[]
    for missing in sorted((desired | NEW_PAGES)-local): errors.append(('sitemap missing',missing))
    for extra in sorted(local-desired):
        if extra in NEW_PAGES: expected.append(('신규 페이지', f'{extra}: {NEW_PAGE_REASON}'))
        else: errors.append(('sitemap extra',extra))
    for path in sorted(NEW_PAGES):
        page=pages.get(path,{})
        suffix=path.removeprefix('/en').removeprefix('/ja')
        hreflang={lang:ORIGIN+(suffix if lang in ('ko','x-default') else '/'+lang+suffix) for lang in LANGS}
        for ok,kind in ((page.get('status')==200,'new page status'), (page.get('canonical')==ORIGIN+path,'new page canonical'), (page.get('hreflang')==hreflang,'new page hreflang')):
            if not ok: errors.append((kind,path))
    return errors,expected

# Explicit S2 acceptance values, not an unrestricted exemption.
IMPROVED_BODY = {
    prefix + path: {'pre_count': pres, 'table_count': 0, 'reason': reason}
    for prefix in ('', '/en', '/ja')
    for path, pres, reason in (
        ('/2023/06/03/chrome-autocomplete-bug-fix/', 9, 'GFM preserves the complete nested-list fenced code block'),
        ('/2023/12/10/bitbucket-ssh-access-key-setup/', 15, 'Indented steps preserve code blocks inside one five-item ordered list'),
        ('/2026/11/07/bambulab-ams3h-instant-recognition/', 0, 'GFM preserves the video link with a pipe in its label instead of a headerless table'),
        ('/2025/06/07/vertex-ai-imagen-mcp-blog-automation/', 21, 'Orchestrator-approved GFM list/fence correction removes literal fences and restores __init__ and triple quotes inside code'),
    )
}
# 2026-11-10 사용자 결정: 원본이 없는(운영도 404) 대표 이미지 줄 삭제 — 본문 img 1 → 0, 나머지 지표는 운영과 동일해야 한다.
IMPROVED_BODY.update({
    prefix + '/2025/06/19/ai-powered-github-pages-blog-series/': {'img_count': 0, 'reason': 'User removed the missing hero image (404 in production too)'}
    for prefix in ('', '/en', '/ja')
})

def compare_body_metrics(target, pm, lm):
    errors=[]; expected=[]; improved=IMPROVED_BODY.get(target)
    for metric in ('img_count','pre_count','h2_count','table_count','br_count'):
        desired=improved[metric] if improved and metric in improved else pm.get(metric)
        if desired!=lm.get(metric):
            errors.append(('body '+metric,f'{target}: expected={desired}, prod={pm.get(metric)}, local={lm.get(metric)}'))
    plen=pm.get('text_len',0); llen=lm.get('text_len',0)
    delta=abs(llen-plen)/max(plen,1)
    if improved:
        expected.append(('Markdown 원문 교정(개선)', f'{target}: pre {pm.get("pre_count")} → {lm.get("pre_count")}, table {pm.get("table_count")} → {lm.get("table_count")}, text_len {plen} → {llen}; {improved["reason"]}'))
    elif delta>0.03:
        errors.append(('body text_len',f'{target}: prod={plen}, local={llen}, delta={delta:.2%}'))
    return errors,expected

def path_of(url): return urlsplit(url or '').path or '/'
def load(root,name): return json.loads((root/name).read_text(encoding='utf-8'))

def compare_comment_paths(prod_pages, local_pages, comments):
    """Comment issue paths may already be redirects in production.
    The comment count is informational, never a reason to skip a path.
    """
    errors=[]; observations=[]
    for comment in comments:
        path=comment['path']; p=prod_pages.get(path,{}); l=local_pages.get(path,{})
        target=p.get('refresh_target')
        if p.get('status')!=200:
            errors.append(('baseline comment URL',f'{path}: status={p.get("status")}'))
        elif target:
            if (l.get('status')!=200 or l.get('refresh_target')!=target or
                l.get('canonical')!=p.get('canonical')):
                errors.append(('comment redirect',f'{path}: local={l.get("refresh_target")} expected={target}'))
        elif not p.get('body_selector'):
            errors.append(('baseline comment URL',f'{path}: neither a post nor a redirect'))
        elif l.get('status')!=200 or l.get('refresh_target') or not l.get('body_selector'):
            errors.append(('comment post URL',path))
        observations.append((path,comment.get('comments'),f'redirect → {target}' if target else 'post'))
    return errors,observations

def compare(prod,local,comments):
    errors=[]; expected=[]; checks=[]
    def check(ok,kind,detail):
        if not ok: errors.append((kind,detail))
    pp={r['path']:r for r in load(prod,'pages.json')}; lp={r['path']:r for r in load(local,'pages.json')}
    posts=load(prod,'posts.json'); normalized={r['expected_path']:r['canonical_path'] for r in posts if r['normalized']}
    ps={r['path'] for r in load(prod,'sitemap-urls.json')}; ls={r['path'] for r in load(local,'sitemap-urls.json')}
    check(len(ps)==480,'baseline',f'Production sitemap count {len(ps)} != 480')
    check(len(ls)==480+len(NEW_PAGES),'sitemap',f'Local sitemap count {len(ls)} != {480+len(NEW_PAGES)}')
    desired=(ps-set(normalized))|set(normalized.values())
    sitemap_errors,sitemap_expected=compare_sitemap(desired,ls,lp)
    errors.extend(sitemap_errors); expected.extend(sitemap_expected)
    checks.append(('S3 new pages, canonical and hreflang',len(NEW_PAGES)))
    for path in sorted(ps): check(lp.get(path,{}).get('status')==200,'missing URL',f'{path}: {lp.get(path,{}).get("status")}')
    checks.append(('Production sitemap URLs returning local 200',len(ps)))
    for path,target in normalized.items():
        r=lp.get(path,{})
        check(path_of(r.get('refresh_target'))==target and r.get('canonical')==ORIGIN+target,'normalization redirect',f'{path} -> {r.get("refresh_target")} != {target}')
        expected.append(('Normalized canonical/old URL',f'{path} → {target}'))
    redirects=load(prod,'redirects.json'); self_aliases=[]
    for r in redirects:
        path=r['from']; target=normalized.get(r['expected_target_path'],r['expected_target_path']); p=pp.get(path,{}); l=lp.get(path,{})
        check(l.get('status')==200,'redirect status',f'{path}: {l.get("status")}')
        if path==target:
            self_aliases.append(path)
            check(l.get('refresh_target') is None and bool(l.get('body_selector')),'self redirect',path)
        else:
            check(l.get('refresh_target')==ORIGIN+target,'redirect target',f'{path}: {l.get("refresh_target")} != {ORIGIN+target}')
            check(l.get('canonical')==ORIGIN+target,'redirect canonical',path)
            check(p.get('refresh_target')==ORIGIN+r['expected_target_path'],'baseline redirect',f'{path}: {p.get("refresh_target")}')
            if target!=r['expected_target_path']: expected.append(('Redirect normalized target',f'{path} → {target}'))
    checks.append(('Declared aliases (including privacy)',len(redirects)))
    checks.append(('Self-referencing aliases remain posts',len(self_aliases)))
    comment_errors,comment_observations=compare_comment_paths(pp,lp,comments)
    errors.extend(comment_errors)
    checks.append(('Comment URLs preserve production post/redirect behavior',len(comments)))
    groups={}
    for r in posts: groups.setdefault(r['slug'],{})[r['lang']]=r['canonical_path']
    # Compare canonical and all hreflangs exactly to production except for the
    # actual normalized pair changes. Even within those 30 pages, require the
    # correct new path for every alternate, not an unconditional exemption.
    changed_groups={r['slug'] for r in posts if r['normalized']}
    for r in posts:
        path=r['expected_path']; target=r['canonical_path']; p=pp.get(path,{}); l=lp.get(target,{})
        check(p.get('status')==200 and bool(p.get('body_selector')),'baseline post',path)
        check(l.get('status')==200 and bool(l.get('body_selector')) and not l.get('refresh_target'),'local post',target)
        check(l.get('canonical')==ORIGIN+target,'post canonical',f'{target}: {l.get("canonical")}')
        check(l.get('og_url')==ORIGIN+target,'post og:url',target)
        if not r['normalized']: check(l.get('canonical')==p.get('canonical'),'canonical parity',target)
        group=groups[r['slug']]
        desired_h={lang:ORIGIN+group[lang if lang!='x-default' else 'ko'] for lang in LANGS}
        check(l.get('hreflang')==desired_h,'local hreflang correctness',f'{target}: {l.get("hreflang")} != {desired_h}')
        if r['slug'] not in changed_groups:
            check(l.get('hreflang')==p.get('hreflang'),'hreflang parity',f'{target}: {p.get("hreflang")} != {l.get("hreflang")}')
        elif l.get('hreflang')!=p.get('hreflang'): expected.append(('Hreflang normalized group',f'{target}: {json.dumps(desired_h,ensure_ascii=False)}'))
        pm=p.get('body_metrics',{}); lm=l.get('body_metrics',{})
        body_errors,body_expected=compare_body_metrics(target,pm,lm)
        errors.extend(body_errors); expected.extend(body_expected)
        if r['has_task_list']: expected.append(('Task-list checkbox rendering',target))
        if p.get('body_ids')!=l.get('body_ids'): expected.append(('Heading ID format',target))
        for anchor in p.get('body_anchor_targets',[]):
            check(anchor in l.get('body_ids',[]),'anchor target',f'{target}#{anchor}')
        # Also validate local links, so neither dropped links nor newly broken
        # fragments can be hidden by only checking production's href values.
        check(l.get('body_anchor_targets')==p.get('body_anchor_targets'),'anchor link preservation',target)
        for anchor in l.get('body_anchor_targets',[]): check(anchor in l.get('body_ids',[]),'local anchor target',f'{target}#{anchor}')
        check(l.get('mermaid_count')==p.get('mermaid_count'),'mermaid blocks',target)
        check(bool(l.get('mermaid_script'))==bool(l.get('mermaid_count')),'mermaid loader selection',target)
        if l.get('mermaid_count') and not r['mermaid_flag']: expected.append(('Mermaid script without frontmatter flag',target))
    checks.append(('Post canonical, hreflang, body metrics',len(posts)))
    checks.append(('Posts with same-page anchor links',sum(bool(pp[r['expected_path']]['body_anchor_targets']) for r in posts)))
    for path in ps-{r['expected_path'] for r in posts}:
        p=pp[path]; l=lp.get(path,{})
        for key in ('canonical','hreflang'): check(l.get(key)==p.get(key),'non-post '+key,f'{path}: {p.get(key)} != {l.get(key)}')
    pf=load(prod,'feed.json'); lf=load(local,'feed.json')
    for key in ('id','links'): check(pf[key]==lf[key],'feed '+key,f'{pf[key]} != {lf[key]}')
    pe=pf['entries']; le=lf['entries']; check(len(pe)==len(le) and len(le)>=10,'feed count',f'{len(pe)} / {len(le)}')
    for index,e in enumerate(pe):
        desired_id=ORIGIN+normalized.get(path_of(e['id'])+'/',path_of(e['id'])+'/').rstrip('/')
        expected_links=[dict(link,href=ORIGIN+normalized.get(path_of(link['href']),path_of(link['href']))) for link in e['links']]
        local_e=le[index] if index<len(le) else {}
        check(local_e.get('id')==desired_id,'feed entry id/order',f'#{index}: {e["id"]} / {local_e.get("id")}')
        check(local_e.get('links')==expected_links,'feed entry links/order',f'#{index}: {expected_links} / {local_e.get("links")}')
        check(local_e.get('published')==e.get('published'),'feed published',f'#{index}')
    checks.append(('Atom entries, IDs, links, ordering',len(pe)))
    return errors,expected,checks,comment_observations

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--prod',required=True,type=Path); ap.add_argument('--local',required=True,type=Path); ap.add_argument('--comments',required=True,type=Path); ap.add_argument('--out',required=True,type=Path); a=ap.parse_args()
    errors,expected,checks,comments=compare(a.prod,a.local,json.loads(a.comments.read_text()))
    def safe(s): return str(s).replace('|','&#124;').replace('\n',' ')
    lines=['# Astro parity report','',f'**Unexpected differences: {len(errors)} — {"FAIL" if errors else "PASS"}**','', 'Self-check only; not an independent reviewer verdict.','', '## Checks','', '| Check | Count |','|---|---:|']
    lines += [f'| {safe(k)} | {v} |' for k,v in checks]
    lines += ['', '## Comment URL observations', '', 'Comment counts are informational only; every URL is checked against its production behavior.', '', '| Path | Comments | Production behavior |', '|---|---:|---|']
    lines += [f'| {safe(path)} | {count} | {safe(behavior)} |' for path,count,behavior in comments]
    lines += ['',f'## Unexpected differences ({len(errors)})','', '| Type | Details |','|---|---|']
    lines += [f'| {safe(k)} | {safe(v)} |' for k,v in errors] or ['| None | — |']
    lines += ['',f'## Expected differences ({len(expected)})','', 'Allowed categories only: normalized URLs/alternate links, task checkboxes, Mermaid loader detection, GitHub-style heading IDs, Markdown 원문 교정(개선), 신규 페이지 (S3 포털 신규 화면). Only the explicitly approved Markdown paths use exact corrected pre/table values and report text-length changes; all other body checks remain strict.','', '| Type | Details |','|---|---|']
    lines += [f'| {safe(k)} | {safe(v)} |' for k,v in expected]
    a.out.parent.mkdir(parents=True,exist_ok=True); a.out.write_text('\n'.join(lines)+'\n',encoding='utf-8')
    a.out.with_suffix('.json').write_text(json.dumps({'unexpected':errors,'expected':expected,'checks':checks,'comments':comments},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f'unexpected={len(errors)} expected={len(expected)} report={a.out}')
    return 1 if errors else 0
if __name__=='__main__': sys.exit(main())
