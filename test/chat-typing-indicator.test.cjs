const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { chromium } = require('../.tmp/chat-browser-tools/node_modules/playwright-core');
const root = path.resolve(__dirname, '..');
const live = process.argv.includes('--live');
let browser, server;
(async () => {
  let origin = 'https://alphastarkasiglahan.com';
  if (!live) {
    server = http.createServer(async (req, res) => {
      try {
        const relative = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).slice(1) || 'index.html';
        const file = path.resolve(root, relative);
        if (!file.startsWith(root + path.sep) || !(relative.endsWith('.html') || relative.startsWith('assets/'))) throw new Error('Outside test scope');
        const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
        res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
        res.end(await fs.readFile(file));
      } catch { res.writeHead(404); res.end(); }
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    origin = `http://127.0.0.1:${server.address().port}`;
  } else {
    const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root }).toString().trim();
    const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
    for (const file of ['index.html', 'assets/js/clinic-assistant.js', 'assets/css/clinic-assistant.css']) {
      const response = await fetch(`${origin}/${file}?release=${commit.slice(0, 8)}`, { headers: { 'Cache-Control': 'no-cache' }, signal: AbortSignal.timeout(40000) });
      assert.equal(response.status, 200);
      assert.equal(hash(Buffer.from(await response.arrayBuffer())), hash(execFileSync('git', ['show', `${commit}:${file}`], { cwd: root, maxBuffer: 16 * 1024 * 1024 })), `${file}: live bytes match GitHub`);
    }
    console.log(`PASS: All changed public files on the custom domain match GitHub commit ${commit.slice(0, 8)} exactly.`);
  }
  browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const context = await browser.newContext({ viewport: { width: 360, height: 900 }, timezoneId: 'Asia/Manila' });
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    return url.origin === origin || ['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname) ? route.continue() : route.abort();
  });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  assert.equal((await page.goto(origin, { waitUntil: 'networkidle' })).status(), 200);
  await page.locator('#fab-main').click();
  await page.waitForFunction(() => !document.querySelector('#fab-menu').classList.contains('is-connecting'));
  const typing = page.locator('#clinic-chat-typing'), log = page.locator('#clinic-chat-messages');
  const idle = () => page.waitForFunction(() => document.querySelector('#clinic-chat-messages').getAttribute('aria-busy') === 'false');
  assert.equal(await typing.isVisible(), false, 'No typing bubble while idle');
  for (const width of [320, 360, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const language of ['en', 'tl']) {
      await page.evaluate(language => window.alphastarChat.setLanguage(language), language);
      await page.locator('#clinic-chat-input').fill('Main menu');
      await page.locator('#clinic-chat-input').press('Enter');
      await idle();
      const before = await log.locator(':scope > .clinic-chat-message').count();
      await page.locator('#clinic-chat-topics button').first().click();
      await typing.waitFor({ state: 'visible' });
      assert.equal(await typing.locator('.clinic-chat-typing-dot').count(), 3);
      assert.equal(await typing.locator('img').getAttribute('src'), 'assets/images/alphastarlogo.png');
      assert.equal(await typing.locator('.clinic-chat-typing-label').textContent(), language === 'en' ? 'Alphastar is typing…' : 'Sumasagot ang Alphastar…');
      assert.equal(await typing.locator('.clinic-chat-typing-dot').first().evaluate(node => getComputedStyle(node).animationName), 'clinic-typing-bounce');
      assert.equal(await page.locator('#clinic-chat-send').isDisabled(), true);
      await page.locator('#clinic-chat-input').fill('Duplicate request');
      await page.locator('#clinic-chat-input').press('Enter');
      await page.waitForTimeout(350);
      assert.equal(await log.locator(':scope > .clinic-chat-message').count(), before + 1, 'No duplicate or early reply');
      const metrics = await typing.evaluate(node => {
        const box = node.getBoundingClientRect(), body = document.querySelector('#clinic-chat-body').getBoundingClientRect();
        return { fits: box.left >= body.left && box.right <= body.right + 1 && box.top >= body.top - 1 && box.bottom <= body.bottom + 1, overflow: node.scrollWidth > node.clientWidth };
      });
      assert.ok(metrics.fits && !metrics.overflow, `${width}/${language}: avatar and dots stay visible inside the scroll area`);
      if (width === 360 && language === 'en') {
        const folder = path.join(root, 'test-results/chat-typing-20261012'); await fs.mkdir(folder, { recursive: true });
        await page.locator('#fab-menu').screenshot({ path: path.join(folder, live ? 'live-phone.png' : 'local-phone.png') });
      }
      await idle();
      assert.equal(await typing.isVisible(), false, 'Reply removes the typing bubble');
      assert.equal(await log.locator(':scope > .clinic-chat-message').count(), before + 2);
    }
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('#clinic-chat-input').fill('Main menu'); await page.locator('#clinic-chat-input').press('Enter'); await idle();
  await page.locator('#clinic-chat-topics button').first().click(); await typing.waitFor({ state: 'visible' });
  assert.equal(await typing.locator('.clinic-chat-typing-dot').first().evaluate(node => getComputedStyle(node).animationName), 'none');
  await page.evaluate(() => {
    window.__typingTestHidden = true;
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => window.__typingTestHidden });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  assert.equal(await typing.isVisible(), false, 'Backgrounding hides the indicator');
  await page.evaluate(() => { window.__typingTestHidden = false; document.dispatchEvent(new Event('visibilitychange')); });
  await typing.waitFor({ state: 'visible' });
  await page.locator('#clinic-chat-close').click();
  await page.waitForFunction(() => document.querySelector('#clinic-chat-typing').hidden);
  await idle();
  await page.locator('#fab-main').click();
  await page.waitForFunction(() => !document.querySelector('#fab-menu').classList.contains('is-connecting'));
  assert.equal(await typing.isVisible(), false, 'Close/reopen does not leave a stuck indicator');
  assert.deepEqual(errors, []);
  console.log('PASS: English/Tagalog typing bubble with transparent bot avatar and three dots at four phone/tablet/desktop widths; no early/duplicate replies; reduced motion; background/foreground and close/reopen cleanup; no runtime errors. No clinic requests or external messages sent.');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { if (browser) await browser.close(); if (server) await new Promise(resolve => server.close(resolve)); });
