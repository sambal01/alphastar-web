'use strict';
// Public website checks only: no sign-in, patient records, support messages or installation.
const assert = require('node:assert/strict'), fs = require('node:fs/promises'), path = require('node:path'), crypto = require('node:crypto');
const { chromium } = require('../.tmp/chat-browser-tools/node_modules/playwright-core');
const root = path.resolve(__dirname, '..'), origin = 'https://alphastarkasiglahan.com';
const localRelease = require('../downloads/release.json');
const expected = { version: localRelease.version, build: localRelease.versionCode, filename: localRelease.filename,
  bytes: localRelease.sizeBytes, sha256: localRelease.sha256 };
let browser;
(async () => {
  const response = await fetch(origin + '/downloads/release.json', { signal: AbortSignal.timeout(40000) });
  assert.equal(response.status, 200); const metadata = await response.json();
  assert.equal(metadata.version, expected.version); assert.equal(metadata.versionCode, expected.build); assert.equal(metadata.testingBuild, true);
  assert.equal(metadata.sha256, expected.sha256); assert.equal(metadata.sizeBytes, expected.bytes);
  const url = origin + '/downloads/' + expected.filename;
  const head = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(40000) });
  assert.equal(head.status, 200); assert.equal(head.headers.get('content-type'), 'application/vnd.android.package-archive');
  assert.equal(Number(head.headers.get('content-length')), expected.bytes);
  const range = await fetch(url, { headers: { Range: 'bytes=0-3' }, signal: AbortSignal.timeout(40000) });
  assert.equal(range.status, 206); assert.equal(Buffer.from(await range.arrayBuffer()).toString('hex'), '504b0304');
  browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, acceptDownloads: true,
    reducedMotion: 'reduce', timezoneId: 'Asia/Manila',
    userAgent: 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36' });
  await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const page = await context.newPage(), errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin, { waitUntil: 'networkidle', timeout: 60000 });
  const button = page.locator('[data-app-download]');
  assert.equal(await button.getAttribute('aria-disabled'), 'false');
  assert.equal(await button.getAttribute('download'), expected.filename); assert.equal(await button.getAttribute('target'), null);
  assert.equal(await page.locator('.android-logo').evaluate(img => img.complete && img.naturalWidth > 0), true);
  for (const language of ['en', 'tl']) {
    await page.evaluate(language => window.AlphastarSiteLanguage.setLanguage(language), language);
    const label = await page.locator('[data-app-download-release]').textContent();
    assert.ok(label.includes(expected.version)); assert.match(label, /MB/); assert.doesNotMatch(label, /Testing build/i);
    const geometry = await page.locator('#app-download').evaluate(node => {
      const box = node.getBoundingClientRect(); return box.left >= 0 && box.right <= innerWidth && node.scrollWidth <= node.clientWidth;
    });
    assert.equal(geometry, true, language + ' download fits phone');
  }
  await page.evaluate(() => window.AlphastarSiteLanguage.setLanguage('en'));
  const folder = path.join(root, 'test-results/android-download-live'); await fs.mkdir(folder, { recursive: true });
  await page.locator('#app-download').screenshot({ path: path.join(folder, 'android-download-390.png') });
  const event = page.waitForEvent('download', { timeout: 120000 }); await button.tap(); const download = await event;
  assert.equal(download.suggestedFilename(), expected.filename); assert.equal(await download.failure(), null);
  const saved = await fs.readFile(await download.path()); assert.equal(saved.length, expected.bytes);
  assert.equal(crypto.createHash('sha256').update(saved).digest('hex'), expected.sha256);
  assert.equal(page.url(), origin + '/'); assert.deepEqual(errors, []);
  const report = { checkedAt: new Date().toISOString(), origin, apkUrl: url, ...expected, bytesDownloaded: saved.length,
    checksumMatches: true, androidEmulatedTouchDownload: true, bilingualLayout: true, rangeRequests: true,
    physicalPhoneTest: false, installedApp: false, patientOrAccountOperations: false, errors };
  await fs.writeFile(path.join(folder, 'verification.json'), JSON.stringify(report, null, 2));
  console.log(`PASS: Live custom-domain Android touch download completed; exact ${expected.bytes} bytes and SHA-256 match, correct filename/type, range support, Android logo and English/Tagalog version labels without Testing build text. No app installation or patient/account operations.`);
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { if (browser) await browser.close(); });
