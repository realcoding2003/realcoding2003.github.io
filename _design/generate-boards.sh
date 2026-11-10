#!/usr/bin/env bash
# 실전코딩 포털 레퍼런스 보드 생성 (Phase 1) — design-brief.md의 고정 선택을 그대로 쓴다.
# 사용: bash _design/generate-boards.sh [보드번호...]   (번호 없으면 9장 전부)
# 모델: gpt_image_2_6 · 2k · quality high · 16:9 (장당 2.75 크레딧, 2026-11-09 조회)
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p refs
CHAR="../assets/images/character.png"
MODEL=gpt_image_2_6

PRE="website design mockup, desktop 1440px wide, dark theme with deep ultramarine-ink background #0C1130, raised panels #121A44, thin horizontal hairline layer-lines #26306B like 3D-print layer lines, limestone text #E7E9E2, secondary text #A2A7BD, exactly one accent color sunflower yellow #E8C552 used sparingly, extra-wide extended bold grotesk headlines (Monument Extended or Archivo Expanded style), heavy Korean gothic sans for Korean words, monospace terminal font (Geist Mono style) for labels and numbers, a narrow vertical rail at the far right edge showing a layer counter in monospace like 'L 012  Z 2.40', all corners sharp, narrative motif of a 3D printer building something layer by layer, professional layout, clear hierarchy, generous spacing, award-winning web design, no watermark, no browser chrome"
NAV="single-line top nav: wordmark '>| 실전코딩' with a small solid yellow block cursor at top-left, menu '메이커  개발  게임 공략  생활  영상', one pill button '의뢰하기', language switch 'KO EN JA'"

declare -a NAMES PROMPTS REFS
NAMES[1]="01-hero"
PROMPTS[1]="$PRE. SECTION: hero. $NAV. A massive full-bleed cinematic film still fills the whole viewport: in a dark ultramarine studio a glowing hot 3D-printer nozzle prints a small figure of the referenced cartoon developer (yellow hoodie, black glasses), the figure is half-built with visible layer lines, warm nozzle glow, shallow depth of field, subject centered with negative space. Restrained text at bottom-left over the image: huge extended bold headline '한 층씩 쌓는다.', one sub-line '만들고, 코딩하고, 플레이한다.', a large text link '작업 보기' ending in a yellow block cursor, and a thin outlined box button '의뢰하기'. Maximum four text elements in the hero."
REFS[1]="$CHAR"
NAMES[2]="02-realms"
PROMPTS[2]="$PRE. SECTION: four workbenches. Headline top-left '네 개의 작업대'. Below, a full-width horizontal hover-accordion of four tall vertical slices, each slice a muted cinematic video still: (1) macro of a 3D printer nozzle and colorful filament, (2) a dim monitor with lines of code glowing, (3) a game controller lit by screen light, (4) a calm workshop window at dusk. The second slice is expanded wide (hover state) with a thin yellow top border, label '개발' in extended bold, monospace count '140 posts', and three recent post titles in small limestone text. The collapsed slices show only rotated vertical labels '메이커', '게임 공략', '생활'."
REFS[2]=""
NAMES[3]="03-works"
PROMPTS[3]="$PRE. SECTION: works showcase. Headline top-left '출력한 것들' and a small underlined link with arrow '작업 전체 보기'. A gapless edge-to-edge bento grid of realistic product photos of original 3D-printed objects: a multicolor articulated dragon, a wavy wall sign made of 108 thin ribbons, a sliding shelf under a printer holding a filament system box, a set of magnetic filament label tags, a Halloween candy holder; one tile is large. Under the bento, an oversized full-width metrics strip in monospace between hairlines: 'H3C  ·  1h 25m  ·  25 g  ·  0.20 mm'. No cartoon characters from games or films."
REFS[3]=""
NAMES[4]="04-writing"
PROMPTS[4]="$PRE. SECTION: recent writing. Large extended headline '최근 글' in a narrow left column. An editorial index list offset off-grid to the right two-thirds, rows separated by thin hairlines, each row: monospace date like '2026.11.09', a small realm tag in yellow text like 'MAKER' or 'DEV', and a Korean post title in medium weight: 'AMS 2 Pro 슬라이딩 수납, 10만원 안에 끝냈다', 'GitHub Actions 캐시가 안 먹을 때', 'MCP로 블로그 다국어 자동화', '뱀부랩 H3C 개봉부터 첫 출력까지', 'Lambda 콜드 스타트 줄이기'. Faint horizontal layer-line hairlines in the background. An underlined inline link with arrow '글 전체 보기'."
REFS[4]=""
NAMES[5]="05-videos"
PROMPTS[5]="$PRE. SECTION: videos. Stacked centered headline '영상으로 보기'. Below, a horizontal rail of vertical 9:16 short-video cards showing 3D printing timelapse thumbnails (printer toolhead close-ups, colorful multicolor prints, a tool-changer docking), each card with a monospace duration like '0:55' in a corner and a one-line Korean caption under it. The rail bleeds off the right edge. Two square monospace arrow buttons at bottom-right. Solid ink background."
REFS[5]=""
NAMES[6]="06-request"
PROMPTS[6]="$PRE. SECTION: commission request. A color-blocked diptych: left half is a cinematic still of a pencil sketch on paper beside a laptop showing a 3D model and a finished 3D-printed mechanical part; right half is a solid sunflower yellow #E8C552 block with dark ink #0C1130 text. A giant numeral '0.20' in extended bold works as a structural element crossing the split. Headline '같이 만들어요'. Two offerings, each with one short line: '3D 출력 의뢰' and '개발 외주 문의'. An outlined box button '의뢰하기' whose lower half is filled with horizontal ink layer lines (hover state)."
REFS[6]=""
NAMES[7]="07-reader-light"
PROMPTS[7]="website design mockup, desktop 1440px wide blog article page, light theme: paper background #F4F5F0, deep ultramarine ink text #0C1130, hairlines #D5D8E3, links and small highlights in dark mustard #7A6100, extended bold grotesk and heavy Korean gothic headings, Pretendard-like body text, monospace meta, all corners sharp. Same top nav as the site in light colors: wordmark '>| 실전코딩' with a yellow block cursor, menu '메이커  개발  게임 공략  생활  영상', pill button '의뢰하기'. Article header: monospace meta '2026.11.09  ·  MAKER  ·  5 min', title 'AMS 2 Pro 슬라이딩 수납, 스피드랙이랑 언더레일로 10만원 안에 끝냈다', a wide hero photo of a sliding drawer shelf under a 3D printer. Body column about 65 characters wide with Korean paragraphs, one code block in monospace on an ink #0C1130 panel, a sticky table of contents on the right with a thin hairline, and at the bottom a 'related work' card with print stats in monospace. Calm and highly readable, no decoration, no watermark, no browser chrome."
REFS[7]=""
NAMES[8]="08-request-page"
PROMPTS[8]="$PRE. PAGE: commission request page. $NAV. Two tabs at top: '3D 출력' (active, yellow underline) and '개발 외주'. Left column: a 3-step process with monospace numerals '01 문의', '02 견적 회신', '03 진행', then two short lists '가능한 것' and '받지 않는 것'. Right column: a form with sharp-cornered fields '이름', '이메일', '연락처 (선택)', a textarea '문의 내용', a dashed file drop zone '3MF · STL 파일을 끌어다 놓으세요 (최대 200MB)', two personal-information consent checkboxes with small notice text, and a full-width submit bar '접수하기' filled 64% with yellow like a print progress bar."
REFS[8]=""
NAMES[9]="09-hero-film-storyboard"
PROMPTS[9]="A single 16:9 storyboard image laid out as a 3 by 2 grid of six keyframes of ONE continuous camera move, NOT six different scenes. Dark ultramarine-ink studio background #0C1130, soft cool rim light, one warm practical light from the hot nozzle, shallow depth of field, 50mm lens, locked exposure, cinematic macro product film look. Frame 1: empty textured build plate, the glowing hot nozzle drawing the first layer. Frame 2: the bottom layers of a small figure appear. Frame 3: the referenced cartoon developer figure (yellow hoodie, black glasses) half printed with visible layer lines. Frame 4: figure almost complete, nozzle lifting away. Frame 5: camera slowly pulling back and rising, the printer frame enters view. Frame 6: wide view, finished figure centered on the build plate, dim workshop behind with soft monitor glow at the edges and a game controller on the desk. Consistent lens, palette and light direction across frames. No text anywhere, no logos, no panel numbers, no watermark."
REFS[9]="$CHAR"

SEL=("$@"); [ ${#SEL[@]} -eq 0 ] && SEL=(1 2 3 4 5 6 7 8 9)
for i in "${SEL[@]}"; do
  args=(--prompt "${PROMPTS[$i]}" --aspect_ratio 16:9 --resolution 2k --quality high)
  [ -n "${REFS[$i]}" ] && args+=(--image-references "${REFS[$i]}")
  # 응답 형식: ["<job id>"] (2026-11-09 확인). 파싱 실패해도 원문을 남겨 중복 제출을 막는다.
  raw=$(higgsfield generate create "$MODEL" "${args[@]}" --json)
  echo "${NAMES[$i]} $raw" >> refs/jobs-raw.txt
  id=$(printf '%s' "$raw" | python3 -I -c 'import json,sys;d=json.load(sys.stdin);d=d[0] if isinstance(d,list) else d;print(d if isinstance(d,str) else (d.get("id") or d.get("job_id")))')
  echo "${NAMES[$i]} $id" | tee -a refs/jobs.txt
done
