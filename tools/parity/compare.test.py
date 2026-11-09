#!/usr/bin/env python3
"""Regression checks for production-aware comment URLs; no network or fixtures."""
import sys, unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from compare import compare_comment_paths

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

if __name__=='__main__': unittest.main()
