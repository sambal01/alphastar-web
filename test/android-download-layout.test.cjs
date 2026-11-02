'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs/promises'), path = require('node:path'), crypto = require('node:crypto');
const { chromium } = require('../.tmp/chat-browser-tools/node_modules/playwright-core');
const downloadServer = require('./helpers/download-server.cjs');
const root = path.resolve(process.env.ALPHASTAR_SITE_TEST_ROOT || path.join(__dirname, '..'));
const release = JSON.parse(require('node:fs').readFileSync(path.join(root, 'downloads/release.json'), 'utf8'));
let browser, server;
(async () => {
  server = downloadServer(root);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const context = await browser.newContext({ timezoneId: 'Asia/Manila', reducedMotion: 'reduce', acceptDownloads: true });
  await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin, { waitUntil: 'networkidle' });
  const folder = path.join(root, 'test-results/android-download'); await fs.mkdir(folder, { recursive: true });
  for (const width of [320, 390, 768, 1440]) for (const language of ['en', 'tl']) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(language => window.AlphastarSiteLanguage.setLanguage(language), language);
    const download = page.locator('[data-app-download]');
    await download.scrollIntoViewIfNeeded();
    const result = await download.evaluate(link => {
      const icon = link.querySelector('.android-logo'), box = link.getBoundingClientRect(), iconBox = icon.getBoundingClientRect();
      const text = link.querySelector('.chrome-btn-text').getBoundingClientRect(), arrow = link.querySelector('.chrome-btn-arrow').getBoundingClientRect();
      return { text: link.textContent.replace(/\s+/g, ' ').trim(), imageLoaded: icon.complete && icon.naturalWidth > 0 && icon.src.endsWith('/assets/images/android-logo.svg'),
        background: getComputedStyle(icon).backgroundColor, decorative: icon.alt === '' && icon.getAttribute('aria-hidden') === 'true',
        fits: box.left >= 0 && box.right <= innerWidth && box.height >= 38 && iconBox.left >= box.left && iconBox.right <= text.left && text.right <= arrow.left && arrow.right <= box.right,
        activeLink: link.getAttribute('aria-disabled') === 'false' && !!link.getAttribute('download') && !link.hasAttribute('target'), noOverflow: document.documentElement.scrollWidth <= innerWidth };
    });
    assert.equal(result.text, language === 'en' ? 'Download for Android' : 'I-download para sa Android');
    assert.equal(result.imageLoaded, true); assert.equal(result.background, 'rgba(0, 0, 0, 0)'); assert.equal(result.decorative, true);
    assert.equal(result.fits, true, `${width} ${language}: icon, text and arrow fit`); assert.equal(result.noOverflow, true);
    assert.equal(result.activeLink, true, 'Verified APK downloads directly rather than opening a blank tab');
    assert.equal(await download.getAttribute('download'), release.filename);
    const label = await page.locator('[data-app-download-release]').textContent();
    assert.ok(label.includes(release.version)); assert.match(label, /MB/); assert.doesNotMatch(label, /Testing build/i);
    await page.locator('#app-download').screenshot({ path: path.join(folder, `${width}-${language}.png`) });
  }
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, acceptDownloads: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36' });
  await mobile.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const phone = await mobile.newPage(); await phone.goto(origin, { waitUntil: 'networkidle' });
  const event = phone.waitForEvent('download'); await phone.locator('[data-app-download]').tap(); const downloaded = await event;
  assert.equal(downloaded.suggestedFilename(), release.filename); assert.equal(await downloaded.failure(), null);
  const bytes = await fs.readFile(await downloaded.path()); assert.equal(bytes.length, release.sizeBytes);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), release.sha256, 'Downloaded file is the exact verified APK');
  assert.equal(phone.url(), origin + '/', 'Android download keeps the clinic website open');
  const head = await fetch(origin + '/downloads/' + release.filename, { method: 'HEAD' });
  assert.equal(head.status, 200); assert.equal(head.headers.get('content-type'), 'application/vnd.android.package-archive');
  assert.equal(head.headers.get('content-disposition'), 'attachment'); assert.equal(Number(head.headers.get('content-length')), release.sizeBytes);
  const range = await fetch(origin + '/downloads/' + release.filename, { headers: { Range: 'bytes=0-3' } });
  assert.equal(range.status, 206); assert.equal(Buffer.from(await range.arrayBuffer()).toString('hex'), '504b0304');
  // Blank/unsafe configurations still fail closed and never show stale version details.
  await phone.evaluate(() => { window.ALPHASTAR_WEBSITE_CONFIG = { androidApkUrl: 'javascript:alert(1)' }; syncAppDownloadLinks(); });
  assert.equal(await phone.locator('[data-app-download]').getAttribute('aria-disabled'), 'true');
  assert.equal(await phone.locator('[data-app-download]').getAttribute('href'), null);
  assert.equal(await phone.locator('[data-app-download-release]').isVisible(), false);
  await mobile.close();
  assert.deepEqual(errors, []);
  console.log(`PASS: Android logo, bilingual version label and active download at four widths; Android-emulated touch downloads all ${release.sizeBytes} bytes with exact APK checksum, correct filename/type/attachment and range support. Unsafe URLs remain disabled. No external requests or deployment.`);
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { if (browser) await browser.close(); if (server) await new Promise(resolve => server.close(resolve)); });
