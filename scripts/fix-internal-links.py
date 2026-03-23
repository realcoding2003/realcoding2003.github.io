#!/usr/bin/env python3
"""
포스트 본문의 내부 링크에서 -en/-ja suffix 제거

변경 예:
- (/en/2026/02/14/okaibox-dev-diary-day1-en/) → (/en/2026/02/14/okaibox-dev-diary-day1/)
- (/ja/2025/06/08/claude-desktop-mcp-blog-setup-ja/) → (/ja/2025/06/08/claude-desktop-mcp-blog-setup/)
"""

import glob
import os
import re
import sys


def fix_internal_links(content):
    """본문에서 /en/.../-en/ 또는 /ja/.../-ja/ 패턴의 내부 링크를 수정"""
    changes = 0

    def replace_en(match):
        nonlocal changes
        prefix = match.group(1)
        date_path = match.group(2)
        slug = match.group(3)
        suffix = match.group(4)
        # slug에서 -en 제거
        if slug.endswith('-en'):
            changes += 1
            return f'{prefix}/en/{date_path}{slug[:-3]}{suffix}'
        return match.group(0)

    def replace_ja(match):
        nonlocal changes
        prefix = match.group(1)
        date_path = match.group(2)
        slug = match.group(3)
        suffix = match.group(4)
        # slug에서 -ja 제거
        if slug.endswith('-ja'):
            changes += 1
            return f'{prefix}/ja/{date_path}{slug[:-3]}{suffix}'
        return match.group(0)

    # /en/YYYY/MM/DD/slug-en/ 패턴
    content = re.sub(
        r'(\(|")/en/(\d{4}/\d{2}/\d{2}/)([a-z0-9][a-z0-9-]*-en)(/?\)|\/?"|/)',
        replace_en,
        content
    )

    # /ja/YYYY/MM/DD/slug-ja/ 패턴
    content = re.sub(
        r'(\(|")/ja/(\d{4}/\d{2}/\d{2}/)([a-z0-9][a-z0-9-]*-ja)(/?\)|\/?"|/)',
        replace_ja,
        content
    )

    return content, changes


def main():
    dry_run = '--dry-run' in sys.argv
    posts_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '_posts')

    print(f"Mode: {'DRY RUN' if dry_run else 'LIVE'}")

    total_files = 0
    total_changes = 0

    for filepath in sorted(glob.glob(os.path.join(posts_dir, '*.md'))):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # front matter와 본문 분리
        match = re.match(r'^(---\n.*?\n---\n?)(.*)', content, re.DOTALL)
        if not match:
            continue

        front_matter = match.group(1)
        body = match.group(2)

        new_body, changes = fix_internal_links(body)

        if changes > 0:
            total_files += 1
            total_changes += changes
            basename = os.path.basename(filepath)
            print(f"  {basename}: {changes}개 링크 수정")

            if not dry_run:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(front_matter + new_body)

    print(f"\n총 {total_files}개 파일, {total_changes}개 링크 수정")


if __name__ == '__main__':
    main()
