#!/usr/bin/env python3
"""Regression checks for production-aware comment URLs; no network or fixtures."""
import sys, unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from compare import compare_comment_paths, compare_body_metrics, IMPROVED_BODY, compare_sitemap, NEW_PAGES, ORIGIN, LANGS

POST={'status':200,'body_selector':'.post-content','refresh_target':None}
REDIRECT={'status':200,'refresh_target':'https://realcoding.blog/target/','canonical':'https://realcoding.blog/target/'}

class CommentPaths(unittest.TestCase):
    def check_paths(self,prod,local,count=0):
        return compare_comment_paths({'/issue/':prod},{'/issue/':local},[{'path':'/issue/','comments':count}])
    def test_production_post_remains_post(self):
        self.assertEqual(self.check_paths(POST,POST,2)[0],[])
    def test_zero_comment_redirect_is_preserved_and_reported(self):
        errors,info=self.check_paths(REDIRECT,REDIRECT)
        self.assertEqual(errors,[])
        self.assertEqual(info,[('/issue/',0,'redirect → https://realcoding.blog/target/')])
    def test_zero_comments_do_not_skip_missing_path(self):
        self.assertTrue(self.check_paths(REDIRECT,{'status':404})[0])
    def test_changed_redirect_target_or_canonical_fails(self):
        for key in ('refresh_target','canonical'):
            self.assertTrue(self.check_paths(REDIRECT,dict(REDIRECT,**{key:'https://realcoding.blog/wrong/'}))[0])
    def test_post_and_redirect_are_not_interchangeable(self):
        self.assertTrue(self.check_paths(POST,REDIRECT)[0])
        self.assertTrue(self.check_paths(REDIRECT,POST)[0])
    def test_unverified_production_path_fails(self):
        self.assertTrue(self.check_paths({'status':404},POST)[0])
        self.assertTrue(self.check_paths({'status':200},POST)[0])

class ImprovedBody(unittest.TestCase):
    def test_exact_corrected_metrics_are_expected(self):
        path='/2023/06/03/chrome-autocomplete-bug-fix/'
        prod={'pre_count':8,'table_count':0,'img_count':1,'h2_count':2,'br_count':0,'text_len':100}
        local=dict(prod,pre_count=9,text_len=80)
        errors,expected=compare_body_metrics(path,prod,local)
        self.assertEqual(errors,[])
        self.assertEqual(expected[0][0],'Markdown 원문 교정(개선)')
        self.assertIn('100 → 80',expected[0][1])
    def test_incorrect_values_and_unrelated_metrics_fail(self):
        path='/2023/06/03/chrome-autocomplete-bug-fix/'
        prod={'pre_count':8,'table_count':0,'img_count':1,'h2_count':2,'br_count':0,'text_len':100}
        for key,value in [('pre_count',8),('table_count',1),('img_count',2),('h2_count',3),('br_count',1)]:
            local=dict(prod,pre_count=9,**({key:value} if key!='pre_count' else {}))
            if key=='pre_count': local[key]=value
            self.assertTrue(compare_body_metrics(path,prod,local)[0],key)
        self.assertTrue(compare_body_metrics('/other/',prod,dict(prod,text_len=80))[0])

class NewPages(unittest.TestCase):
    def setUp(self):
        self.pages={}
        for path in NEW_PAGES:
            suffix=path.removeprefix('/en').removeprefix('/ja')
            self.pages[path]={'status':200,'canonical':ORIGIN+path,'hreflang':{lang:ORIGIN+(suffix if lang in ('ko','x-default') else '/'+lang+suffix) for lang in LANGS}}
    def test_explicit_new_pages_are_expected_only(self):
        errors,expected=compare_sitemap({'/'},{'/'}|NEW_PAGES,self.pages)
        self.assertEqual(errors,[])
        self.assertEqual(len(expected),18)
        self.assertEqual({kind for kind,_ in expected},{'신규 페이지'})
    def test_unknown_extra_fails(self):
        errors,_=compare_sitemap({'/'},{'/','/surprise/'}|NEW_PAGES,self.pages)
        self.assertIn(('sitemap extra','/surprise/'),errors)
    def test_missing_new_page_fails(self):
        errors,_=compare_sitemap({'/'},({'/'}|NEW_PAGES)-{'/maker/'},self.pages)
        self.assertIn(('sitemap missing','/maker/'),errors)
    def test_new_metadata_is_strict(self):
        for key in ('status','canonical','hreflang'):
            pages={k:dict(v) for k,v in self.pages.items()}; pages['/maker/'][key]=None
            self.assertTrue(compare_sitemap(set(),NEW_PAGES,pages)[0])

if __name__=='__main__': unittest.main()
