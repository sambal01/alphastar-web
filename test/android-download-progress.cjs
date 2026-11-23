'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('../.tmp/chat-browser-tools/node_modules/playwright-core');
const downloadServer = require('./helpers/download-server.cjs');
const release = require('../downloads/release.json');

let browser;
const root = path.resolve(process.env.ALPHASTAR_SITE_TEST_ROOT || path.join(__dirname, '..'));
const server = downloadServer(root);
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true,
  });
  const context = await browser.newContext({
    viewport: { width: 320, height: 844 }, isMobile: true, hasTouch: true, acceptDownloads: true,
  });
  await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const config = await fs.readFile(path.join(root, 'assets/js/site-config.js'), 'utf8');
  await context.route('**/assets/js/site-config.js?*', route => route.fulfill({
    contentType: 'text/javascript', body: config.replace('bytes: ' + release.sizeBytes, 'bytes: 1024'),
  }));
  await context.addInitScript(source => {
    const requests = [];
    window.testApkRequests = requests;
    const nativeFetch = window.fetch;
    window.fetch = (input, options) => {
      if (String(input) !== source) return nativeFetch(input, options);
      let streamController;
      const stream = new ReadableStream({ start(controller) { streamController = controller; } });
      options.signal.addEventListener('abort', () => {
        try { streamController.error(new DOMException('Aborted', 'AbortError')); } catch {}
      }, { once: true });
      requests.push(streamController);
      return Promise.resolve(new Response(stream));
    };
  }, release.progressUrl);

  const page = await context.newPage();
  await page.goto(origin);
  const panel = page.locator('[data-apk-progress]');
  const button = page.locator('[data-app-download]');
  const percent = page.locator('[data-apk-percent]');
  const cancel = page.locator('[data-apk-cancel]');
  const status = page.locator('[data-apk-status]');
  assert.equal(await panel.isVisible(), false);
  await button.tap();
  assert.equal(await percent.textContent(), '0%');
  assert.equal(await button.getAttribute('aria-busy'), 'true');
  await page.evaluate(() => testApkRequests[0].enqueue(new Uint8Array(512).fill(42)));
  await page.waitForFunction(() => document.querySelector('[data-apk-bar]').value === 50);
  assert.equal(await percent.textContent(), '50%');
  assert.equal(await panel.evaluate(node => node.getBoundingClientRect().right <= innerWidth), true);
  await page.evaluate(() => window.AlphastarSiteLanguage.setLanguage('tl'));
  assert.equal(await percent.textContent(), '50%');
  assert.match(await status.textContent(), /Dina-download/);
  await page.evaluate(() => window.AlphastarSiteLanguage.setLanguage('en'));
  await cancel.tap();
  await page.waitForFunction(() => document.querySelector('[data-apk-status]').textContent.includes('canceled'));
  assert.equal(await button.getAttribute('aria-busy'), 'false');

  await button.tap();
  await page.evaluate(() => {
    testApkRequests[1].enqueue(new Uint8Array(512));
    testApkRequests[1].close();
  });
  await page.waitForFunction(() => document.querySelector('[data-apk-status]').textContent.includes('could not finish'));
  assert.equal(await page.locator('[data-apk-direct]').getAttribute('href'), release.url);
  assert.equal(await page.locator('[data-apk-direct]').isVisible(), true);
  assert.equal(await page.locator('[data-apk-save]').isVisible(), false);

  await button.tap();
  const downloaded = page.waitForEvent('download');
  await page.evaluate(() => {
    testApkRequests[2].enqueue(new Uint8Array(512).fill(42));
    testApkRequests[2].enqueue(new Uint8Array(512).fill(13));
    testApkRequests[2].close();
  });
  const file = await downloaded;
  assert.equal(file.suggestedFilename(), release.filename);
  assert.deepEqual(await fs.readFile(await file.path()), Buffer.concat([Buffer.alloc(512, 42), Buffer.alloc(512, 13)]));
  assert.equal(await percent.textContent(), '100%');
  assert.match(await status.textContent(), /Open the APK from Downloads to install/);
  assert.equal(await page.locator('[data-apk-save]').isVisible(), true);
  console.log('PASS: Android touch download shows 0%, 50%, and 100%; language, cancel, retry, incomplete stream, and saved file verified.');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
});
