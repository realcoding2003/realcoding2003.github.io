export function bodyText(html: string): string {
  return html.replace(/<\/?(?:p|div|li|h[1-6]|pre|table|tr|td|th|ul|ol|br|hr|blockquote)\b[^>]*>/gi, ' ').replace(/<[^>]*>/g, '').replace(/&#(x[\da-f]+|\d+);/gi, (_, n) => String.fromCodePoint(n[0].toLowerCase() === 'x' ? parseInt(n.slice(1), 16) : Number(n)))
    .replace(/&(nbsp|amp|lt|gt|quot|apos);/g, (_, n: string) => ({nbsp:' ', amp:'&', lt:'<', gt:'>', quot:'"', apos:"'"})[n] || ' ');
}
export function readingMinutes(html: string, lang: string): number {
  const text = bodyText(html);
  return Math.max(1, Math.ceil(lang === 'en' ? (text.match(/\S+/g) || []).length / 230 : text.replace(/\s/g, '').length / 500));
}
