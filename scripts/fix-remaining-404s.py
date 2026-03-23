#!/usr/bin/env python3
"""
CSV의 미해결 404 URL들에 대해 redirect_from 추가.
날짜 불일치, 크로스 언어, prefix 누락 등의 케이스를 처리.
"""

import csv
import glob
import os
import re
import sys

posts_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '_posts')
csv_path = os.path.expanduser('~/Downloads/realcoding.blog-Coverage-Validation-2026-03-16/테이블.csv')
site_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '_site')

dry_run = '--dry-run' in sys.argv
print(f"Mode: {'DRY RUN' if dry_run else 'LIVE'}")

# 모든 포스트 파일 인덱싱: slug -> filepath
post_index = {}  # base_slug -> {lang: filepath}
for filepath in glob.glob(os.path.join(posts_dir, '*.md')):
    basename = os.path.basename(filepath)
    match = re.match(r'^\d{4}-\d{2}-\d{2}-(.+)\.md$', basename)
    if not match:
        continue
    slug = match.group(1)

    # lang 판별
    if slug.endswith('-en'):
        lang = 'en'
        base = slug[:-3]
    elif slug.endswith('-ja'):
        lang = 'ja'
        base = slug[:-3]
    else:
        lang = 'ko'
        base = slug

    if base not in post_index:
        post_index[base] = {}
    post_index[base][lang] = filepath


def get_existing_redirects(filepath):
    """파일의 기존 redirect_from 목록 반환"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    match = re.search(r'^redirect_from:\s*\n((?:\s+-\s+.+\n?)*)', content, re.MULTILINE)
    if match:
        redirects = []
        for line in match.group(1).strip().split('\n'):
            line = line.strip()
            if line.startswith('- '):
                redirects.append(line[2:].strip())
        return redirects
    return []


def add_redirect_to_file(filepath, redirect_url):
    """파일에 redirect_from 항목 추가"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    existing = get_existing_redirects(filepath)
    if redirect_url in existing:
        return False

    if existing:
        # 기존 redirect_from에 추가
        all_redirects = existing + [redirect_url]
        redirect_block = "redirect_from:\n" + "\n".join(f"  - {r}" for r in all_redirects)
        new_content = re.sub(
            r'^redirect_from:\s*\n(?:\s+-\s+.+\n?)*',
            redirect_block + "\n",
            content,
            flags=re.MULTILINE
        )
    else:
        # redirect_from 신규 추가 (permalink 뒤에, 없으면 lang 뒤에)
        redirect_block = f"redirect_from:\n  - {redirect_url}"
        if 'permalink:' in content:
            new_content = re.sub(
                r'^(permalink:\s*.+)$',
                rf'\1\n{redirect_block}',
                content,
                flags=re.MULTILINE
            )
        else:
            new_content = re.sub(
                r'^(lang:\s*.+)$',
                rf'\1\n{redirect_block}',
                content,
                flags=re.MULTILINE
            )

    if not dry_run:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
    return True


def parse_404_url(url):
    """404 URL을 파싱하여 (lang_prefix, date, slug) 반환"""
    from urllib.parse import urlparse
    path = urlparse(url).path.strip('/')

    # /en/YYYY/MM/DD/slug or /ja/YYYY/MM/DD/slug
    match = re.match(r'^(en|ja)/(\d{4}/\d{2}/\d{2})/(.+)$', path)
    if match:
        return match.group(1), match.group(2), match.group(3)

    # /YYYY/MM/DD/slug (no prefix)
    match = re.match(r'^(\d{4}/\d{2}/\d{2})/(.+)$', path)
    if match:
        return None, match.group(1), match.group(2)

    return None, None, None


# UUID 패턴
uuid_pattern = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')

added = 0
skipped_broken = 0
skipped_uuid = 0
skipped_already = 0

with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    next(reader)  # header
    for row in reader:
        url = row[0].strip()

        # UUID URLs
        from urllib.parse import urlparse
        path = urlparse(url).path.strip('/')
        if uuid_pattern.match(path.split('/')[-1] if '/' in path else path):
            skipped_uuid += 1
            continue

        # 깨진 URL (10vascript 등)
        if '10vascript' in url:
            skipped_broken += 1
            continue

        lang_prefix, date_str, slug = parse_404_url(url)
        if not date_str or not slug:
            skipped_broken += 1
            continue

        # slug에서 suffix 제거하여 base_slug 찾기
        if slug.endswith('-en'):
            target_lang = 'en'
            base_slug = slug[:-3]
        elif slug.endswith('-ja'):
            target_lang = 'ja'
            base_slug = slug[:-3]
        else:
            # suffix 없는 경우, prefix로 언어 결정
            if lang_prefix:
                target_lang = lang_prefix
            else:
                target_lang = 'ko'
            base_slug = slug

        # 해당 포스트 찾기
        if base_slug not in post_index:
            print(f"  SKIP (포스트 없음): {url}")
            skipped_broken += 1
            continue

        if target_lang not in post_index[base_slug]:
            # target_lang 포스트가 없으면, 크로스 언어 시도
            if lang_prefix and lang_prefix in post_index[base_slug]:
                target_lang = lang_prefix
            else:
                print(f"  SKIP (언어 버전 없음): {url} -> {target_lang}")
                skipped_broken += 1
                continue

        filepath = post_index[base_slug][target_lang]

        # 이미 _site에 존재하는지 확인
        redirect_path = '/' + urlparse(url).path.strip('/')  + '/'
        # 중복 슬래시 제거
        redirect_path = re.sub(r'/+', '/', redirect_path)

        check_path = os.path.join(site_dir, redirect_path.lstrip('/'), 'index.html')
        if os.path.exists(check_path):
            skipped_already += 1
            continue

        if add_redirect_to_file(filepath, redirect_path):
            print(f"  ADD: {redirect_path} -> {os.path.basename(filepath)}")
            added += 1
        else:
            skipped_already += 1

print(f"\n=== 결과 ===")
print(f"추가: {added}")
print(f"이미 존재: {skipped_already}")
print(f"UUID 스킵: {skipped_uuid}")
print(f"수정 불가 스킵: {skipped_broken}")
