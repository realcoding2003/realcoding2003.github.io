// External verification runner, not a production dependency. Point
// RC_PLAYWRIGHT_MODULE to the verifier's installed Playwright index.mjs.
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
const origin = process.argv[2] || 'http://127.0.0.1:4323';
const out = resolve(process.argv[3] || '/private/tmp/rc-reader-browser');
const root = resolve('dist');
await mkdir(out, { recursive: true });
const { chromium } = await import(pathToFileURL(process.env.RC_PLAYWRIGHT_MODULE).href);
const pages = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (entry.name === 'index.html' && /<article\b[^>]*class="reader\b/.test(await readFile(file, 'utf8'))) pages.push('/' + file.slice(root.length + 1).replace(/index.html$/, ''));
  }
}
await walk(root);
const report = { pages: pages.length, checks: 0, failures: [], screenshots: [], blocked: null };
let browser;
try {
  browser = await chromium.launch({ headless: true, ...(process.env.RC_CHROME_PATH ? { executablePath: process.env.RC_CHROME_PATH } : { channel: 'chrome' }) });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  // Only local resources: never request production, analytics or live comments.
  await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const page = await context.newPage();
  for (const width of [360, 390]) {
    await page.setViewportSize({ width, height: 844 });
    for (const path of pages) {
      await page.goto(origin + path, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() => !document.querySelector('.post-content img:not(a img):not(.zoom-trigger img)'));
      const result = await page.evaluate(() => {
        const title = document.querySelector('.reader-head h1');
        return { width: innerWidth, scroll: document.documentElement.scrollWidth, lines: document.documentElement.lang === 'en' ? Math.round(title.getBoundingClientRect().height / parseFloat(getComputedStyle(title).lineHeight)) : 0 };
      });
      report.checks++;
      if (result.width !== result.scroll || result.lines > 3) report.failures.push({ path, width, ...result });
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const path of pages.filter(path => path.startsWith('/en/'))) {
    await page.goto(origin + path, { waitUntil: 'load' }); await page.evaluate(() => document.fonts.ready);
    const result = await page.evaluate(() => {
      const title = document.querySelector('.reader-head h1'), head = title.parentElement, rail = document.querySelector('.toc-rail');
      return { lines: Math.round(title.getBoundingClientRect().height / parseFloat(getComputedStyle(title).lineHeight)), aligned: !rail || Math.abs(head.getBoundingClientRect().top - rail.getBoundingClientRect().top) < 1, measure: document.querySelector('.post-content').clientWidth };
    });
    report.checks++;
    if (result.lines > 3 || !result.aligned || result.measure !== 656) report.failures.push({ path, ...result });
  }
  const samples = ['/2026/11/09/ams2-pro-sliding-speedrack-underrail/', '/2025/06/10/rag-mes-integration-guide/', '/2026/03/11/typescript-as-const-literal-type/'];
  // Posts are fixed dark: neither a light OS nor an old saved light toggle may switch them.
  for (const width of [390, 1440]) for (const lang of ['ko','en','ja']) for (const scheme of ['light','dark']) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto(origin + (lang === 'ko' ? '' : '/' + lang) + samples[0]);
    await page.evaluate(() => localStorage.setItem('theme', 'light')); await page.reload();
    await page.evaluate(() => document.fonts.ready);
    const filename = `${lang}-${width}-os-${scheme}.png`; await page.screenshot({ path: join(out, filename) }); report.screenshots.push(filename);
    const state = await page.evaluate(() => ({ theme: document.documentElement.dataset.theme, toggles: document.querySelectorAll('[data-theme-toggle]').length, bg: getComputedStyle(document.body).backgroundColor }));
    const links = await page.locator('.post-content a').evaluateAll(links => links.map(a => getComputedStyle(a).color));
    report.checks++; if (state.theme !== 'dark' || state.toggles || links.some(color => color !== 'rgb(232, 197, 82)')) report.failures.push({ lang, width, scheme, ...state, links });
  }
  await page.emulateMedia({ colorScheme: null });
  // Also exercise in-body panels/media after their lazy content has appeared.
  for (const width of [360, 390]) for (const path of samples) {
    await page.setViewportSize({ width, height: 844 }); await page.goto(origin + path);
    for (const media of await page.locator('.post-content :is(img,pre,table,iframe,video)').all()) {
      await media.scrollIntoViewIfNeeded();
      await page.waitForTimeout(150);
      const result = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
      report.checks++; if (result.width !== result.scroll) report.failures.push({ path, ...result });
    }
  }
} catch (error) { report.blocked = String(error); }
finally { await browser?.close(); }
await writeFile(join(out, 'browser-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (report.blocked || report.failures.length) process.exitCode = 1;
