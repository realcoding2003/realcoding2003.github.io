// Small static HTML inspector. It never executes scripts or requests resources.
export const decode = value => String(value || '').replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,(_,v) => v[0] === '#' ? String.fromCodePoint(v[1].toLowerCase() === 'x' ? parseInt(v.slice(2),16) : Number(v.slice(1))) : ({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '})[v.toLowerCase()]);
export const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>=]+)))?/g)].map(m => [m[1],decode(m[2] ?? m[3] ?? m[4] ?? '')]));
export function parseHtml(source) {
 const root = {tag:'#root',a:{},children:[],parent:null}; const nodes = []; const stack = [root];
 const voids = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
 source = source.replace(/<(script|style)\b([^>]*)>[\s\S]*?<\/\1>/gi,'<$1$2></$1>');
 for (const [token] of source.matchAll(/<!--[\s\S]*?-->|<![^>]*>|<\/?[a-z][\w:-]*\b(?:[^"'>]|"[^"]*"|'[^']*')*>|[^<]+/gi)) {
  if (token.startsWith('<!')) continue;
  if (token.startsWith('</')) { const tag = token.match(/^<\/([\w:-]+)/)[1].toLowerCase(); const i = stack.findLastIndex(n => n.tag === tag); if (i > 0) stack.length = i; }
  else if (token.startsWith('<')) {
   const tag = token.match(/^<([\w:-]+)/)[1].toLowerCase(); const node = {tag,a:attrs(token),children:[],parent:stack.at(-1)};
   stack.at(-1).children.push(node); nodes.push(node); if (!voids.has(tag) && !token.endsWith('/>')) stack.push(node);
  } else stack.at(-1).children.push(decode(token));
 }
 return {root,nodes};
}
export const textOf = node => node.children.map(c => typeof c === 'string' ? c : textOf(c)).join('');
export const hasClass = (node,cls) => (node.a.class || '').split(/\s+/).includes(cls);
export function ancestor(node,predicate) { for (let p=node.parent;p;p=p.parent) if (predicate(p)) return p; return null; }
