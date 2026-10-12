const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const { chromium } = require(path.join(root, '.tmp/chat-browser-tools/node_modules/playwright-core'));
const ts = require(path.resolve(root, '../alphastar-mobile/node_modules/typescript'));
const postcss = require(path.resolve(root, '../alphastar-mobile/node_modules/postcss'));
const server = http.createServer(async (req, res) => {
  try {
    const relative = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname).slice(1) || 'index.html';
    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep) || !(relative.endsWith('.html') || relative.startsWith('assets/'))) throw new Error('Outside test scope');
    const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(await fs.readFile(file));
  } catch { res.writeHead(404); res.end(); }
});
let browser;
(async () => {
  console.log(execFileSync(process.execPath, ['scripts/build-legal-pages.cjs', '--check'], { cwd: root, encoding: 'utf8' }).trim());
  const source = await fs.readFile(path.resolve(root, '../alphastar-mobile/src/lib/legalNotices.ts'), 'utf8');
  const mobileModule = { exports: {} };
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: mobileModule.exports, module: mobileModule }, { timeout: 1000 });
  const notices = { privacy: mobileModule.exports.privacyPolicyNotice, terms: mobileModule.exports.termsAndConditionsNotice };
  const files = { privacy: 'privacy-policy.html', terms: 'terms-and-conditions.html' };
  for (const file of ['index.html', ...Object.values(files)]) {
    const html = await fs.readFile(path.join(root, file), 'utf8');
    assert.doesNotMatch(html, /Terms of Service|Sitemap|data-coming-soon/);
    for (const [, css] of html.matchAll(/href="(assets\/css\/[^"?]+)(?:\?[^\"]*)?"/g)) postcss.parse(await fs.readFile(path.join(root, css), 'utf8'), { from: css });
  }
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const context = await browser.newContext({ viewport: { width: 360, height: 900 }, timezoneId: 'Asia/Manila', reducedMotion: 'reduce' });
  const errors = [], unexpectedRequests = [];
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin === origin || ['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) return route.continue();
    // Home's lazy Google Map is expected when its footer scrolls into view.
    if (/api|firebase|tawk/.test(url.hostname + url.pathname)) unexpectedRequests.push(url.href);
    return route.abort();
  });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  const settle = () => page.evaluate(async () => { await document.fonts.ready; await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
  await page.goto(origin, { waitUntil: 'networkidle' });
  const footerLinks = await page.locator('.footer-legal a').evaluateAll(nodes => nodes.map(node => ({ text: node.textContent, href: node.getAttribute('href'), height: node.getBoundingClientRect().height })));
  assert.deepEqual(footerLinks.map(({ text, href }) => ({ text, href })), [{ text: 'Privacy Policy', href: files.privacy }, { text: 'Terms and Conditions', href: files.terms }]);
  assert.ok(footerLinks.every(link => link.height >= 44), 'Footer links have usable touch targets');
  await page.locator('.footer-legal a[href="privacy-policy.html"]').click();
  await page.waitForURL('**/privacy-policy.html');
  await settle();
  assert.equal(await page.title(), 'Privacy Policy | Alphastar');
  await page.locator('#site-language-toggle').click();
  await settle();
  assert.equal(await page.locator('html').getAttribute('lang'), 'tl');
  assert.equal(await page.title(), 'Privacy ng Datos | Alphastar');
  await page.locator('.legal-footer a[href="terms-and-conditions.html"]').click();
  await page.waitForURL('**/terms-and-conditions.html');
  await settle();
  assert.equal(await page.locator('html').getAttribute('lang'), 'tl', 'Language survives page navigation');
  assert.equal(await page.title(), 'Mga Tuntunin at Kondisyon | Alphastar');
  await page.locator('.legal-home-link').click();
  await page.waitForURL('**/index.html#home');
  await settle();
  assert.equal(await page.locator('.footer-legal a[href="terms-and-conditions.html"]').textContent(), 'Mga Tuntunin at Kondisyon');
  const screenshots = path.join(root, 'test-results/legal-pages-20261012');
  await fs.mkdir(screenshots, { recursive: true });
  for (const kind of Object.keys(files)) {
    await page.goto(`${origin}/${files[kind]}`, { waitUntil: 'networkidle' });
    for (const width of [320, 360, 390, 414, 767, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      for (const language of ['en', 'tl']) {
        await page.evaluate(next => window.AlphastarSiteLanguage.setLanguage(next), language);
        await settle();
        const metrics = await page.evaluate(() => {
          const ids = [...document.querySelectorAll('[id]')].map(node => node.id);
          const targets = [...document.querySelectorAll('.legal-contents a')].map(link => link.getAttribute('href').slice(1));
          const title = document.querySelector('#legal-title').getBoundingClientRect();
          const intro = document.querySelector('.legal-lead').getBoundingClientRect();
          const logo = document.querySelector('.legal-brand-logo').getBoundingClientRect();
          const range = document.createRange(); range.selectNodeContents(document.querySelector('#legal-title'));
          const titleFits = [...range.getClientRects()].filter(rect => rect.width).every(rect => rect.right <= title.right + 1 && rect.bottom <= intro.top);
          const languageBindings = [...document.querySelectorAll('[data-i18n], [data-i18n-aria-label], [data-i18n-content]')].map(node => node.getAttribute('data-i18n') || node.getAttribute('data-i18n-aria-label') || node.getAttribute('data-i18n-content')).filter(key => key.startsWith('legal.'));
          return {
            overflow: document.documentElement.scrollWidth > innerWidth,
            clippedParagraph: [...document.querySelectorAll('.legal-section p, .legal-section li')].some(node => node.scrollWidth > node.clientWidth + 1),
            titleFits, logoFits: logo.right <= title.left + 1,
            idsUnique: ids.length === new Set(ids).size,
            targetsValid: targets.every(id => document.getElementById(id)),
            contentsOpen: document.querySelector('.legal-contents').open,
            missingTranslations: languageBindings.filter(key => !window.AlphastarLegalTranslations[key]),
            footer: [...document.querySelectorAll('.legal-footer a')].map(node => node.textContent),
            activeLink: document.querySelector('.legal-footer a[aria-current="page"]').getAttribute('href'),
            forms: document.querySelectorAll('form, input[type="checkbox"]').length,
            storageKeys: Object.keys(localStorage),
          };
        });
        const scope = `${kind}/${width}/${language}`;
        assert.ok(!metrics.overflow && !metrics.clippedParagraph && metrics.titleFits && metrics.logoFits, `${scope}: no clipping/overlap (${JSON.stringify(metrics)})`);
        assert.ok(metrics.idsUnique && metrics.targetsValid, `${scope}: valid contents anchors`);
        assert.equal(metrics.contentsOpen, width >= 1000, `${scope}: compact contents on mobile`);
        assert.deepEqual(metrics.missingTranslations, [], `${scope}: full Tagalog coverage`);
        assert.equal(metrics.activeLink, files[kind]);
        assert.equal(metrics.forms, 0, 'No new acceptance or consent workflow');
        assert.deepEqual(metrics.storageKeys, ['alphastar_site_language_v1'], 'Only existing language preference is stored');
        if (language === 'en') {
          const actual = await page.evaluate(ids => ({
            introduction: document.querySelector('.legal-lead').textContent,
            sections: ids.map(id => {
              const section = document.getElementById(id);
              return { title: section.querySelector('h2').textContent, body: section.querySelector(':scope > p').textContent, bullets: [...section.querySelectorAll('li')].map(li => li.textContent), links: [...section.querySelectorAll('.legal-references a')].map(a => ({ label: a.textContent, url: a.getAttribute('href') })) };
            }),
          }), notices[kind].sections.map(section => section.id));
          assert.equal(actual.introduction, notices[kind].introduction);
          for (let i = 0; i < actual.sections.length; i++) {
            const expected = notices[kind].sections[i];
            assert.deepEqual(actual.sections[i], { title: expected.title, body: expected.body, bullets: Array.from(expected.bullets || []), links: Array.from(expected.links || [], link => ({ label: link.label, url: link.url })) }, `${scope}: English mobile text preserved exactly`);
          }
        }
        if ([360, 1440].includes(width)) {
          await page.evaluate(() => scrollTo(0, 0));
          await page.screenshot({ path: path.join(screenshots, `${kind}-${width}-${language}.png`) });
        }
      }
    }
    for (const language of ['en', 'tl']) {
      await page.setViewportSize({ width: 320, height: 900 });
      await page.evaluate(next => { window.AlphastarSiteLanguage.setLanguage(next); document.documentElement.style.zoom = '2'; }, language);
      await settle();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${kind}/${language}: 200% zoom fits`);
      await page.evaluate(() => { document.documentElement.style.zoom = ''; });
    }
    await page.setViewportSize({ width: 360, height: 900 });
    await page.locator('.legal-contents summary').click();
    await page.locator('.legal-contents a[href="#' + notices[kind].sections[0].id + '"]').click();
    assert.ok((await page.locator('#' + notices[kind].sections[0].id).boundingBox()).y >= 60, 'Jump target is not covered by sticky header');
    await page.emulateMedia({ media: 'print' });
    assert.equal(await page.locator('.legal-toolbar').isVisible(), false);
    assert.equal(await page.locator('.legal-sections').isVisible(), true);
    await page.emulateMedia({ media: 'screen' });
  }
  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 360, height: 900 } });
  await noJs.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const staticPage = await noJs.newPage();
  for (const file of Object.values(files)) {
    await staticPage.goto(`${origin}/${file}`, { waitUntil: 'networkidle' });
    assert.ok(await staticPage.locator('.legal-section').count() >= 12);
    assert.equal(await staticPage.locator('#site-language-toggle').isVisible(), false);
    assert.equal(await staticPage.locator('.legal-footer a').count(), 2);
  }
  await noJs.close();
  assert.deepEqual(errors, []);
  assert.deepEqual(unexpectedRequests, [], 'Legal pages do not contact account/support APIs');
  console.log('PASS: Real footer navigation; exact mobile English notices; complete English/Tagalog pages; nine mobile/tablet/desktop widths; 200% zoom; contents links, back navigation, print and no-JavaScript fallback; no new consent/storage/account requests.');
})().catch(error => { console.error(error); process.exitCode = 1; })
  .finally(async () => { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)); });
