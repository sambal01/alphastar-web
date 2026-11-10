const assert = require('node:assert/strict'), fs = require('node:fs/promises'), path = require('node:path'), http = require('node:http');
const { chromium } = require('../.tmp/chat-browser-tools/node_modules/playwright-core');
const root = path.resolve(__dirname, '..');
let server, browser;
(async () => {
  server = http.createServer(async (req, res) => {
    try {
      const relative = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html', file = path.resolve(root, relative);
      if (!file.startsWith(root + path.sep) || !(relative.endsWith('.html') || relative.startsWith('assets/'))) throw Error('Outside test scope');
      res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' })[path.extname(file)] || 'application/octet-stream');
      res.end(await fs.readFile(file));
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  for (const width of [393, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, timezoneId: 'America/New_York', reducedMotion: 'reduce' });
    await context.addInitScript(() => {
      const Original = Date;
      window.__supportClock = Original.parse('2026-11-10T00:00:00Z');
      window.Date = class extends Original { constructor(...args) { super(...(args.length ? args : [window.__supportClock])); } static now() { return window.__supportClock; } };
    });
    const page = await context.newPage(), errors = [], requests = [];
    page.on('pageerror', error => errors.push(error.message));
    const conversation = { id: 'a'.repeat(64), provider: 'alphastar', status: 'welcome', cycle: 1, visitorName: 'Synthetic Patient', updatedAt: '2026-11-10T00:00:00Z', before: '', messages: [{ id: 'saved', sender: 'system', text: 'Saved support conversation', time: '2026-11-10T00:00:00Z' }] };
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.pathname.includes('/api/support/chats')) {
        requests.push(url.pathname);
        if (url.pathname.endsWith('/request')) conversation.status = 'waiting';
        if (url.pathname.endsWith('/end')) conversation.status = 'ended';
        const now = await page.evaluate(() => Date.now());
        return route.fulfill({ json: { ok: true, id: conversation.id, token: 'b'.repeat(64), conversation: { ...conversation, supportHours: { open: now < Date.parse('2026-11-10T09:00:00Z') } } } });
      }
      return url.origin === origin ? route.continue() : route.abort();
    });
    await page.goto(origin, { waitUntil: 'networkidle' });
    assert.doesNotMatch(await page.locator('body').innerText(), /Home Service|home-service|Queue|4:00 PM/i);
    assert.match(await page.locator('#hours').innerText(), /5:00 PM/);
    await page.locator('#fab-main').click();
    await page.waitForFunction(() => !document.querySelector('#fab-menu').classList.contains('is-connecting'));
    await page.locator('#clinic-chat-input').fill('Saved draft');
    assert.equal(await page.locator('#fab-menu').isVisible(), true);
    await page.mouse.click(10, 10);
    await page.waitForFunction(() => document.querySelector('#fab-menu').hidden);
    assert.equal(await page.evaluate(() => document.body.classList.contains('chat-page-locked')), false);
    await page.locator('#fab-main').click();
    await page.waitForFunction(() => !document.querySelector('#fab-menu').classList.contains('is-connecting'));
    assert.equal(await page.locator('#clinic-chat-input').inputValue(), 'Saved draft');
    await page.evaluate(() => window.AlphastarHumanChat.open({ name: 'Synthetic Patient', email: 'synthetic@example.test', consent: true }));
    await page.getByRole('button', { name: 'Yes, connect me to support', exact: true }).click();
    const input = page.locator('.native-chat-composer textarea');
    await input.fill('A saved unsent draft');
    await page.evaluate(() => { window.__supportClock = Date.parse('2026-11-10T09:00:00Z'); });
    await page.locator('.native-chat-hours').waitFor();
    assert.match(await page.locator('.native-chat-hours').innerText(), /7:00 AM to 5:00 PM/);
    assert.equal(await input.count(), 0);
    assert.match(await page.locator('.native-chat-log').innerText(), /Saved support conversation/);
    assert.equal(requests.some(url => url.endsWith('/messages')), false);
    await page.mouse.click(10, 10);
    await page.waitForFunction(() => document.querySelector('#fab-menu').hidden);
    assert.equal(requests.some(url => url.endsWith('/end') || url.endsWith('/exit')), false, 'Outside tap minimizes without ending');
    assert.deepEqual(errors, []);
    await context.close();
  }
  console.log('PASS: Phone/desktop outside-tap dismissal, saved drafts/conversations, updated clinic hours, no retired service text, and automatic after-hours read-only support. All API calls were synthetic.');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { await browser?.close(); if (server) await new Promise(resolve => server.close(resolve)); });
