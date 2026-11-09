/** Compatibility for the two kramdown block rules that differ from CommonMark.
 * No post names or saved production HTML are used at build time.
 *
 * kramdown collects list items (and splits off nested lists) BEFORE parsing
 * fenced code. A fence must close within that collected segment. CommonMark
 * instead lets a fence protect list-looking lines and accepts unclosed fences.
 * Keep valid code untouched; make only rejected delimiters literal before the
 * Astro parser runs. The source files themselves are never rewritten.
 * @param {string} source
 */
export function normalizeKramdownFences(source) {
  const original = source.split('\n');
  const rejected = new Set();
  const marker = /^( {0,3})(\d+\.|[+*-])([ \t]+)(.*)$/;
  const fence = /^ {0,3}(`{3,}|~{3,})[ \t]*(\S+)?[ \t]*$/;
  const blank = line => !line.text.trim();
  const rule = text => /^ {0,3}(?:(?:\* *){3,}|(?:- *){3,}|(?:_ *){3,})$/.test(text);

  function visit(lines) {
    for (let i = 0; i < lines.length;) {
      const opening = lines[i].text.match(fence);
      if (opening) {
        const end = new RegExp('^ {0,3}' + opening[1][0] + '{' + opening[1].length + ',}[ \\t]*$');
        let close = i + 1;
        while (close < lines.length && !end.test(lines[close].text)) close++;
        if (close < lines.length) { i = close + 1; continue; }
        rejected.add(lines[i].index);
        i++;
        continue;
      }
      // Do not interpret raw HTML (including pipes/backticks in attributes).
      const html = lines[i].text.match(/^ {0,3}<(script|style|pre|div|iframe)\b/i);
      if (html) {
        const end = new RegExp('</' + html[1] + '>', 'i');
        do { i++; } while (i < lines.length && !end.test(lines[i - 1].text));
        continue;
      }
      const start = lines[i].text.match(marker);
      if (!start || rule(lines[i].text)) { i++; continue; }
      const ordered = /\d/.test(start[2]);
      let indent = 0, nested = false, lastBlank = false;
      let segments = [];
      let segment;
      let j = i;
      for (; j < lines.length; j++) {
        const line = lines[j];
        const next = line.text.match(marker);
        const sibling = next && /\d/.test(next[2]) === ordered &&
          (j === i || next[1].length < Math.min(indent, 4));
        if (lastBlank && rule(line.text)) break;
        if (sibling) {
          indent = next[1].length + next[2].length + next[3].length;
          segment = [{ ...line, text: next[4] }];
          segments.push(segment);
          nested = marker.test(next[4]);
          lastBlank = false;
        } else if (blank(line)) {
          segment.push(line);
          nested = true;
          lastBlank = true;
        } else {
          const indented = line.text.startsWith(' '.repeat(indent));
          // Blank lines end a list unless the following content is indented.
          // Unindented HTML also terminates lazy list continuation.
          if ((!indented && lastBlank) || (!indented && /^ {0,3}<\/?\w/.test(line.text))) break;
          let text = indented ? line.text.slice(indent) : line.text;
          if (!nested && indented && marker.test(text)) {
            segment = [];
            segments.push(segment);
            nested = true;
          } else if (nested && !indented && marker.test(text)) {
            text = ' '.repeat(indent + 4) + text;
          }
          segment.push({ ...line, text });
          lastBlank = false;
        }
      }
      for (const content of segments) visit(content);
      i = j;
    }
  }
  visit(original.map((text, index) => ({ text, index })));
  return original.map((line, index) => rejected.has(index)
    ? line.replace(/[`~]/g, char => '\\' + char) : line).join('\n');
}

/** Split BEFORE inline parsing: even a pipe in a link label separates cells.
 * Escaped pipes, code spans and HTML <code> are not delimiters in kramdown.
 * @param {string} row @returns {string[] | null}
 */
export function pipeCells(row) {
  const cells = [''];
  const tokens = row.match(/<code\b[^>]*>[\s\S]*?<\/code>|(`+)[\s\S]*?\1(?!`)|\\.|[^\\`<|]+|[\s\S]/g) || [];
  for (const token of tokens) {
    if (token === '|') cells.push('');
    else cells[cells.length - 1] += token;
  }
  if (cells.length === 1) return null;
  if (!cells[0].trim()) cells.shift();
  if (!cells[cells.length - 1].trim()) cells.pop();
  return cells.map(cell => cell.trim());
}

/** kramdown permits tables without a header or separator row. GFM does not.
 * The ordinary GFM tables are already table nodes and are left untouched.
 * @param {(cell: string) => Promise<string>} renderInline
 * @returns {import('satteri').MdastPluginDefinition}
 */
export function kramdownHeaderlessTables(renderInline) {
  return {
    name: 'kramdown-headerless-tables',
    options: { position: true },
    async paragraph(node, ctx) {
      const start = node.position?.start.offset, end = node.position?.end.offset;
      if (start === undefined || end === undefined) return;
      const rows = ctx.source.slice(start, end).split('\n').map(pipeCells);
      if (rows.some(row => !row || !row.length)) return;
      const columns = Math.max(...rows.map(row => row.length));
      const rendered = [];
      for (const row of rows) {
        const cells = await Promise.all(Array.from({ length: columns }, (_, i) => renderInline(row[i] || '')));
        rendered.push('<tr>' + cells.map(cell => '<td>' + cell + '</td>').join('') + '</tr>');
      }
      ctx.replaceNode(node, { type: 'html', value: '<table><tbody>' + rendered.join('') + '</tbody></table>' });
    },
  };
}
