#!/usr/bin/env python3
"""
다국어 포스트 URL 구조 개선 스크립트

변경 내용:
1. slug front matter 추가 (-en/-ja suffix 제거)
2. permalink 추가 (없는 경우)
3. redirect_from에 기존 URL 패턴 추가 (중복 방지)

결과:
- 변경 전: /en/2026/02/19/okaibox-dev-diary-day2-en/
- 변경 후: /en/2026/02/19/okaibox-dev-diary-day2/
"""

import glob
import os
import re
import sys


def parse_front_matter(content):
    """YAML front matter를 파싱하여 (front_matter_text, body) 반환"""
    match = re.match(r'^---\n(.*?)\n---\n?(.*)', content, re.DOTALL)
    if not match:
        return None, content
    return match.group(1), match.group(2)


def extract_field(fm_text, field):
    """front matter에서 특정 필드 값 추출"""
    match = re.search(rf'^{field}:\s*(.+)$', fm_text, re.MULTILINE)
    if match:
        return match.group(1).strip().strip('"').strip("'")
    return None


def extract_redirect_from(fm_text):
    """redirect_from 배열 추출"""
    redirects = []
    match = re.search(r'^redirect_from:\s*\n((?:\s+-\s+.+\n?)*)', fm_text, re.MULTILINE)
    if match:
        for line in match.group(1).strip().split('\n'):
            line = line.strip()
            if line.startswith('- '):
                redirects.append(line[2:].strip())
    return redirects


def extract_date_from_filename(filename):
    """파일명에서 날짜 추출: 2026-02-19-slug-en.md -> (2026, 02, 19)"""
    match = re.match(r'^(\d{4})-(\d{2})-(\d{2})-', os.path.basename(filename))
    if match:
        return match.group(1), match.group(2), match.group(3)
    return None, None, None


def extract_slug_from_filename(filename):
    """파일명에서 slug 추출: 2026-02-19-slug-en.md -> slug-en"""
    basename = os.path.basename(filename)
    match = re.match(r'^\d{4}-\d{2}-\d{2}-(.+)\.md$', basename)
    if match:
        return match.group(1)
    return None


def process_file(filepath, lang_suffix, lang_prefix, dry_run=False):
    """단일 파일 처리"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    fm_text, body = parse_front_matter(content)
    if fm_text is None:
        print(f"  SKIP (no front matter): {filepath}")
        return False

    file_slug = extract_slug_from_filename(filepath)
    if not file_slug:
        print(f"  SKIP (no slug): {filepath}")
        return False

    # base slug: -en/-ja suffix 제거
    if file_slug.endswith(lang_suffix):
        base_slug = file_slug[:-len(lang_suffix)]
    else:
        print(f"  SKIP (no {lang_suffix} suffix): {filepath}")
        return False

    year, month, day = extract_date_from_filename(filepath)
    if not year:
        print(f"  SKIP (no date): {filepath}")
        return False

    date_path = f"/{year}/{month}/{day}"

    # 현재 상태 확인
    has_slug = re.search(r'^slug:\s', fm_text, re.MULTILINE) is not None
    has_permalink = re.search(r'^permalink:\s', fm_text, re.MULTILINE) is not None
    existing_redirects = extract_redirect_from(fm_text)

    # 이미 slug가 base_slug로 설정되어 있으면 스킵
    current_slug = extract_field(fm_text, 'slug')
    if current_slug == base_slug and has_permalink:
        # redirect_from만 확인
        pass

    changes = []
    new_fm = fm_text

    # 1. slug 추가/수정
    if has_slug:
        if current_slug != base_slug:
            new_fm = re.sub(
                r'^slug:\s*.+$',
                f'slug: {base_slug}',
                new_fm,
                flags=re.MULTILINE
            )
            changes.append(f"slug: {current_slug} -> {base_slug}")
    else:
        # lang 필드 뒤에 slug 추가
        new_fm = re.sub(
            r'^(lang:\s*.+)$',
            rf'\1\nslug: {base_slug}',
            new_fm,
            flags=re.MULTILINE
        )
        changes.append(f"slug: {base_slug} (추가)")

    # 2. permalink 추가 (없으면)
    if not has_permalink:
        # slug 필드 뒤에 permalink 추가
        new_fm = re.sub(
            rf'^(slug:\s*.+)$',
            rf'\1\npermalink: /{lang_prefix}/:year/:month/:day/:title/',
            new_fm,
            flags=re.MULTILINE
        )
        changes.append(f"permalink: /{lang_prefix}/:year/:month/:day/:title/ (추가)")

    # 3. redirect_from 처리
    # 필요한 리다이렉트 URL들
    old_url_with_prefix = f"/{lang_prefix}{date_path}/{file_slug}/"
    old_url_without_prefix = f"{date_path}/{file_slug}/"

    needed_redirects = []
    if old_url_with_prefix not in existing_redirects:
        needed_redirects.append(old_url_with_prefix)
    if old_url_without_prefix not in existing_redirects:
        needed_redirects.append(old_url_without_prefix)

    if needed_redirects:
        if existing_redirects:
            # 기존 redirect_from에 추가
            all_redirects = existing_redirects + needed_redirects
            redirect_block = "redirect_from:\n" + "\n".join(f"  - {r}" for r in all_redirects)
            new_fm = re.sub(
                r'^redirect_from:\s*\n(?:\s+-\s+.+\n?)*',
                redirect_block + "\n",
                new_fm,
                flags=re.MULTILINE
            )
        else:
            # redirect_from 신규 추가 (permalink 뒤에)
            redirect_block = "redirect_from:\n" + "\n".join(f"  - {r}" for r in needed_redirects)
            new_fm = re.sub(
                rf'^(permalink:\s*.+)$',
                rf'\1\n{redirect_block}',
                new_fm,
                flags=re.MULTILINE
            )
        changes.append(f"redirect_from: +{len(needed_redirects)} 항목")

    if not changes:
        return False

    new_content = f"---\n{new_fm}\n---\n{body}"

    if dry_run:
        print(f"  WOULD CHANGE: {os.path.basename(filepath)}")
        for c in changes:
            print(f"    - {c}")
    else:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"  CHANGED: {os.path.basename(filepath)}")
        for c in changes:
            print(f"    - {c}")

    return True


def main():
    dry_run = '--dry-run' in sys.argv

    posts_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '_posts')

    if not os.path.isdir(posts_dir):
        print(f"Error: {posts_dir} not found")
        sys.exit(1)

    print(f"Posts directory: {posts_dir}")
    print(f"Mode: {'DRY RUN' if dry_run else 'LIVE'}")
    print()

    # EN 포스트 처리
    en_files = sorted(glob.glob(os.path.join(posts_dir, '*-en.md')))
    print(f"=== EN 포스트 ({len(en_files)}개) ===")
    en_changed = 0
    for f in en_files:
        if process_file(f, '-en', 'en', dry_run):
            en_changed += 1

    print()

    # JA 포스트 처리
    ja_files = sorted(glob.glob(os.path.join(posts_dir, '*-ja.md')))
    print(f"=== JA 포스트 ({len(ja_files)}개) ===")
    ja_changed = 0
    for f in ja_files:
        if process_file(f, '-ja', 'ja', dry_run):
            ja_changed += 1

    print()
    print(f"=== 완료 ===")
    print(f"EN: {en_changed}/{len(en_files)}개 변경")
    print(f"JA: {ja_changed}/{len(ja_files)}개 변경")
    print(f"총: {en_changed + ja_changed}개 변경")


if __name__ == '__main__':
    main()
