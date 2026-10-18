const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('../.tmp/chat-browser-tools/node_modules/playwright-core');
const root = path.resolve(__dirname, '..');
let browser, server;
(async () => {
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
  const origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const context = await browser.newContext({ viewport: { width: 393, height: 900 }, timezoneId: 'Asia/Manila', reducedMotion: 'reduce' });
  await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  assert.equal((await page.goto(origin, { waitUntil: 'networkidle' })).status(), 200);
  await page.locator('#fab-main').click();
  await page.waitForFunction(() => !document.querySelector('#fab-menu').classList.contains('is-connecting'));
  const idle = () => page.waitForFunction(() => document.querySelector('#clinic-chat-messages').getAttribute('aria-busy') === 'false');
  const send = async text => { await page.locator('#clinic-chat-input').fill(text); await page.locator('#clinic-chat-input').press('Enter'); await idle(); };
  for (const [width, height] of [[280, 740], [320, 900], [393, 900], [639, 900], [640, 900], [768, 900], [1440, 900], [740, 390], [393, 500]]) {
    await page.setViewportSize({ width, height });
    await send('main menu');
    const metrics = await page.evaluate(() => {
      const panel = document.querySelector('#fab-menu'), box = panel.getBoundingClientRect(), composer = document.querySelector('#clinic-chat-form').getBoundingClientRect();
      return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height, overflow: panel.scrollWidth > panel.clientWidth, composerFits: composer.bottom <= box.bottom + 1 && composer.top >= box.top };
    });
    assert.ok(metrics.left >= -1 && metrics.right <= width + 1 && metrics.top >= -1 && metrics.bottom <= height + 1, `${width}x${height}: chat fits viewport ${JSON.stringify(metrics)}`);
    assert.equal(metrics.overflow, false); assert.equal(metrics.composerFits, true);
    const mobile = width <= 639;
    assert.equal(Math.round(metrics.width), Math.min(mobile ? 340 : 325, width - (mobile ? 32 : 60)), `${width}: phone widths use the compact size; desktop is unchanged`);
    assert.equal(Math.round(metrics.height), Math.min(mobile ? 450 : 392, height - (height < 540 ? 24 : mobile ? 36 : 58)), `${width}x${height}: height respects the current viewport`);
  }
  await page.setViewportSize({ width: 393, height: 900 });
  await send('main menu');
  const topics = page.locator('#clinic-chat-topics');
  const labels = await topics.locator('button').allTextContents();
  assert.equal(labels[labels.indexOf('Privacy Policy') + 1], 'Terms and Conditions');
  await topics.getByRole('button', { name: 'Terms and Conditions', exact: true }).click(); await idle();
  for (const file of ['privacy-policy.html', 'terms-and-conditions.html']) {
    const link = topics.locator(`a[href="${file}"]`);
    assert.equal(await link.getAttribute('href'), file);
    assert.equal(await link.getAttribute('target'), '_blank');
    assert.equal(await link.getAttribute('rel'), 'noopener noreferrer');
  }
  await send('I have book appointment');
  assert.match(await page.locator('#clinic-chat-messages .clinic-chat-message:not(.is-patient) .clinic-chat-bubble').last().textContent(), /Profile > Appointment Schedule/);
  await send('I lost my authenticator and recovery codes');
  assert.match(await page.locator('#clinic-chat-messages .clinic-chat-message:not(.is-patient) .clinic-chat-bubble').last().textContent(), /identity-checked account recovery/);
  await send('my code is 123456');
  assert.doesNotMatch(await page.locator('#clinic-chat-messages').textContent(), /123456/);
  const folder = path.join(root, 'test-results/chat-mobile-compact-20261019'); await fs.mkdir(folder, { recursive: true });
  for (const width of [393, 1440]) {
    await page.setViewportSize({ width, height: 900 }); await send('main menu');
    await page.locator('#fab-menu').screenshot({ path: path.join(folder, `${width}.png`) });
  }
  assert.deepEqual(errors, []);
  console.log('PASS: compact 340 x 450 phone chat, unchanged 325 x 392 desktop size and keyboard-height constraints at nine viewport sizes; legal links, appointment/security conversations and code redaction still work; no external requests sent.');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { if (browser) await browser.close(); if (server) await new Promise(resolve => server.close(resolve)); });
