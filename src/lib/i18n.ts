const ko = {
  wordmark: '실전코딩', homeLabel: '실전코딩 홈', skip: '본문 바로가기', mainNav: '주요 메뉴',
  nav: { ai: 'AI', maker: '메이커', dev: '개발', game: '게임 공략', life: '생활', videos: '영상' },
  request: '의뢰하기', menu: '메뉴', language: '언어 선택', theme: '어두운 테마', section: '영역', reading: '읽는 시간',
  toc: '목차', tags: '태그', related: '관련 작업물', relatedLink: '모델 다운로드', postNav: '이전 글과 다음 글',
  prev: '이전 글', next: '다음 글', comments: '댓글', copy: '복사', copied: '복사됨', zoom: '크게 보기', dialog: '이미지 크게 보기',
  zoomIn: '확대', zoomOut: '축소', reset: '원래 크기', close: '닫기', copyright: '실전코딩', privacy: '개인정보 처리방침(11.19 개정)',
  notFoundTitle: '페이지를 찾을 수 없어요', notFoundBody: '페이지를 찾을 수 없어요. Page not found.', notFoundLink: '홈으로 가기',
};
const en: typeof ko = {
  wordmark: 'RealCoding', homeLabel: 'RealCoding home', skip: 'Skip to content', mainNav: 'Main menu',
  nav: { ai: 'AI', maker: 'Maker', dev: 'Dev', game: 'Game Guides', life: 'Life', videos: 'Videos' },
  request: 'Request', menu: 'Menu', language: 'Language', theme: 'Dark theme', section: 'Section', reading: 'Reading time',
  toc: 'Contents', tags: 'Tags', related: 'Related builds', relatedLink: 'Download model', postNav: 'Previous and next posts',
  prev: 'Previous', next: 'Next', comments: 'Comments', copy: 'Copy', copied: 'Copied', zoom: 'View larger', dialog: 'Image viewer',
  zoomIn: 'Zoom in', zoomOut: 'Zoom out', reset: 'Reset', close: 'Close', copyright: 'RealCoding', privacy: 'Privacy Policy (updated Nov 19)',
  notFoundTitle: ko.notFoundTitle, notFoundBody: ko.notFoundBody, notFoundLink: ko.notFoundLink,
};
const ja: typeof ko = {
  wordmark: 'RealCoding', homeLabel: 'RealCoding ホーム', skip: '本文へ移動', mainNav: 'メインメニュー',
  nav: { ai: 'AI', maker: 'メイカー', dev: '開発', game: 'ゲーム攻略', life: '日常', videos: '動画' },
  request: '依頼する', menu: 'メニュー', language: '言語', theme: 'ダークテーマ', section: '分野', reading: '読了時間',
  toc: '目次', tags: 'タグ', related: '関連作品', relatedLink: 'モデルをダウンロード', postNav: '前後の記事',
  prev: '前の記事', next: '次の記事', comments: 'コメント', copy: 'コピー', copied: 'コピーしました', zoom: '拡大表示', dialog: '画像ビューア',
  zoomIn: '拡大', zoomOut: '縮小', reset: '元のサイズ', close: '閉じる', copyright: 'RealCoding', privacy: 'プライバシーポリシー(11/19改定)',
  notFoundTitle: ko.notFoundTitle, notFoundBody: ko.notFoundBody, notFoundLink: ko.notFoundLink,
};
export const i18n: Record<string, typeof ko> = { ko, en, ja };
export const languageNames: Record<string, string> = { ko: '한국어', en: 'English', ja: '日本語' };
