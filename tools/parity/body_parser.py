"""HTML metrics within .post-content only; no layout/header/comment text.
Text is DOM textContent with whitespace collapsed (not syntax-highlighter spans).
"""
import html.parser, re
from urllib.parse import unquote

VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
BLOCK = {'p','div','li','pre','h1','h2','h3','h4','h5','h6','table','tr','td','th','blockquote','ul','ol','br','hr'}
class BodyParser(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(); self.depth=0; self.active=False; self.ignore=0; self.text=[]
        self.metrics={'img_count':0,'pre_count':0,'h2_count':0,'table_count':0,'br_count':0}
        self.ids=[]; self.anchors=[]; self.mermaid_count=0; self.mermaid_script=False; self.selector=None
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'data-has-mermaid' in a: self.mermaid_script=True
        if tag=='script' and ('mermaid' in a.get('src','')): self.mermaid_script=True
        if not self.active and 'post-content' in a.get('class','').split():
            self.active=True; self.depth=1; self.selector='.post-content'; return
        if not self.active: return
        if tag not in VOID: self.depth+=1
        if tag in ('script','style'): self.ignore+=1
        for k,t in [('img_count','img'),('pre_count','pre'),('h2_count','h2'),('table_count','table'),('br_count','br')]:
            if tag==t: self.metrics[k]+=1
        if a.get('id'): self.ids.append(a['id'])
        if tag=='a' and a.get('href','').startswith('#'): self.anchors.append(unquote(a['href'][1:]))
        if tag=='code' and 'language-mermaid' in a.get('class','').split(): self.mermaid_count+=1
        if tag in BLOCK: self.text.append('\n')
    def handle_startendtag(self,tag,attrs):
        self.handle_starttag(tag,attrs)
        if tag not in VOID: self.handle_endtag(tag)
    def handle_endtag(self,tag):
        if not self.active or tag in VOID: return
        if tag in BLOCK: self.text.append('\n')
        if tag in ('script','style'): self.ignore=max(0,self.ignore-1)
        self.depth-=1
        if self.depth==0: self.active=False
    def handle_data(self,data):
        if 'mermaid.esm' in data: self.mermaid_script=True
        if self.active and not self.ignore: self.text.append(data)
    def result(self):
        text=re.sub(r'\s+',' ',''.join(self.text)).strip()
        return {'body_selector':self.selector,'body_metrics':dict(self.metrics,text_len=len(text)),
                'body_text':text,'body_ids':self.ids,'body_anchor_targets':self.anchors,
                'mermaid_count':self.mermaid_count,'mermaid_script':self.mermaid_script}
