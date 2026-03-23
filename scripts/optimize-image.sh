#!/bin/bash
# 블로그 이미지 최적화 스크립트 (macOS sips 기반)
# 사용법: ./scripts/optimize-image.sh <입력파일> <포스트-slug> [최대너비=1200] [최대용량KB=300]
#
# 예시:
#   ./scripts/optimize-image.sh dropbox/photo.jpg my-post-slug
#   ./scripts/optimize-image.sh dropbox/screenshot.png my-post-slug 800 200

set -e

INPUT_FILE="$1"
POST_SLUG="$2"
MAX_WIDTH="${3:-1200}"
MAX_SIZE_KB="${4:-300}"

if [ -z "$INPUT_FILE" ] || [ -z "$POST_SLUG" ]; then
    echo "사용법: $0 <입력파일> <포스트-slug> [최대너비=1200] [최대용량KB=300]"
    echo ""
    echo "예시:"
    echo "  $0 dropbox/photo.jpg my-post-slug"
    echo "  $0 dropbox/screenshot.png my-post-slug 800 200"
    exit 1
fi

if [ ! -f "$INPUT_FILE" ]; then
    echo "오류: 파일을 찾을 수 없습니다: $INPUT_FILE"
    exit 1
fi

# 프로젝트 루트 (스크립트 위치 기준)
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT_DIR="$PROJECT_ROOT/assets/images/posts/$POST_SLUG"

mkdir -p "$OUTPUT_DIR"

# 파일명 처리
BASENAME=$(basename "$INPUT_FILE")
EXTENSION="${BASENAME##*.}"
FILENAME="${BASENAME%.*}"

# 원본 정보
CURRENT_WIDTH=$(sips -g pixelWidth "$INPUT_FILE" | tail -1 | awk '{print $2}')
CURRENT_HEIGHT=$(sips -g pixelHeight "$INPUT_FILE" | tail -1 | awk '{print $2}')
ORIGINAL_SIZE=$(du -h "$INPUT_FILE" | cut -f1)
echo "원본: ${CURRENT_WIDTH}x${CURRENT_HEIGHT}, ${ORIGINAL_SIZE}"

# 1. 리사이즈
OUTPUT_FILE="$OUTPUT_DIR/$BASENAME"
if [ "$CURRENT_WIDTH" -gt "$MAX_WIDTH" ]; then
    sips --resampleWidth "$MAX_WIDTH" "$INPUT_FILE" --out "$OUTPUT_FILE" > /dev/null 2>&1
    echo "리사이즈: ${MAX_WIDTH}px 너비로 조정"
else
    cp "$INPUT_FILE" "$OUTPUT_FILE"
    echo "리사이즈: 불필요 (${CURRENT_WIDTH}px <= ${MAX_WIDTH}px)"
fi

# 2. 용량 확인 및 JPEG 변환
FILE_SIZE_KB=$(du -k "$OUTPUT_FILE" | cut -f1)
if [ "$FILE_SIZE_KB" -gt "$MAX_SIZE_KB" ]; then
    JPEG_FILE="$OUTPUT_DIR/${FILENAME}.jpg"
    sips -s format jpeg -s formatOptions 80 "$OUTPUT_FILE" --out "$JPEG_FILE" > /dev/null 2>&1

    JPEG_SIZE_KB=$(du -k "$JPEG_FILE" | cut -f1)

    if [ "$JPEG_SIZE_KB" -gt "$MAX_SIZE_KB" ]; then
        sips -s format jpeg -s formatOptions 65 "$OUTPUT_FILE" --out "$JPEG_FILE" > /dev/null 2>&1
        JPEG_SIZE_KB=$(du -k "$JPEG_FILE" | cut -f1)
    fi

    if [ "$JPEG_SIZE_KB" -gt "$MAX_SIZE_KB" ]; then
        sips -s format jpeg -s formatOptions 50 "$OUTPUT_FILE" --out "$JPEG_FILE" > /dev/null 2>&1
        JPEG_SIZE_KB=$(du -k "$JPEG_FILE" | cut -f1)
    fi

    # JPEG로 대체
    if [ "$OUTPUT_FILE" != "$JPEG_FILE" ]; then
        rm "$OUTPUT_FILE"
    fi
    OUTPUT_FILE="$JPEG_FILE"
    echo "JPEG 변환: ${JPEG_SIZE_KB}KB"
else
    echo "용량 OK: ${FILE_SIZE_KB}KB (<= ${MAX_SIZE_KB}KB)"
fi

# 3. 결과 출력
FINAL_WIDTH=$(sips -g pixelWidth "$OUTPUT_FILE" | tail -1 | awk '{print $2}')
FINAL_HEIGHT=$(sips -g pixelHeight "$OUTPUT_FILE" | tail -1 | awk '{print $2}')
FINAL_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)

echo ""
echo "===== 최적화 완료 ====="
echo "출력: $OUTPUT_FILE"
echo "크기: ${FINAL_WIDTH}x${FINAL_HEIGHT}"
echo "용량: $FINAL_SIZE"
echo ""
echo "마크다운:"
echo "![설명](/assets/images/posts/$POST_SLUG/$(basename "$OUTPUT_FILE"))"
