#!/usr/bin/env python3
"""CSV의 404 URL들이 빌드 결과에서 해결되었는지 확인"""
import csv
import os
from urllib.parse import urlparse

site_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '_site')
csv_path = os.path.expanduser('~/Downloads/realcoding.blog-Coverage-Validation-2026-03-16/테이블.csv')

resolved = []
unresolved = []

with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    next(reader)  # header
    for row in reader:
        url = row[0].strip()
        parsed = urlparse(url)
        path = parsed.path.rstrip('/')
        if not path:
            path = ''

        # UUID URLs - skip
        if len(path.split('/')[-1]) > 30 and '-' in path.split('/')[-1]:
            unresolved.append((url, "UUID (이전 플랫폼)"))
            continue

        # Check if exists in _site
        check_path = os.path.join(site_dir, path.lstrip('/'), 'index.html')
        if os.path.exists(check_path):
            resolved.append(url)
        else:
            # Check without trailing index.html
            check_path2 = os.path.join(site_dir, path.lstrip('/') + '.html')
            if os.path.exists(check_path2):
                resolved.append(url)
            else:
                unresolved.append((url, "NOT FOUND"))

print(f"=== 해결됨: {len(resolved)}/{len(resolved)+len(unresolved)} ===")
print(f"=== 미해결: {len(unresolved)} ===\n")
for url, reason in unresolved:
    print(f"  {reason}: {url}")
