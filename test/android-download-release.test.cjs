'use strict';
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), vm = require('node:vm');
const root = path.resolve(process.env.ALPHASTAR_SITE_TEST_ROOT || path.join(__dirname, '..'));
const release = JSON.parse(fs.readFileSync(path.join(root, 'downloads/release.json'), 'utf8'));
test('published download payload matches its verified SHA-256 and declared testing version', () => {
  assert.equal(release.version, '1.0.93'); assert.equal(release.versionCode, 94); assert.equal(release.testingBuild, true);
  assert.equal(release.filename, 'Alphastar-1.0.93-build94.apk');
  assert.equal(release.url, 'https://github.com/sambal01/alphastar-web/releases/download/mobile-v1.0.93/Alphastar-1.0.93-build94.apk');
  assert.match(release.sha256, /^[a-f0-9]{64}$/);
  assert.match(fs.readFileSync(path.join(root, 'downloads', release.filename + '.sha256'), 'utf8'), new RegExp('^' + release.sha256 + '\\s{2}' + release.filename + '\\n?$'));
  assert.equal(release.sizeBytes, 100294977);
});
test('HTML fallback, JavaScript settings and release metadata refer to the public APK asset', () => {
  const c = vm.createContext({ window: {} }); vm.runInContext(fs.readFileSync(path.join(root, 'assets/js/site-config.js'), 'utf8'), c);
  const config = c.window.ALPHASTAR_WEBSITE_CONFIG, html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.equal(config.androidApkUrl, release.url);
  assert.equal(config.androidApkRelease.version, release.version); assert.equal(config.androidApkRelease.build, release.versionCode);
  assert.equal(config.androidApkRelease.bytes, release.sizeBytes);
  assert.equal(config.androidApkRelease.url, release.url);
  assert.equal(config.androidApkRelease.progressUrl, release.progressUrl);
  if (release.progressUrl) {
    assert.equal(release.progressUrl, 'https://sambal01.github.io/alphastar-web/downloads/' + release.filename);
    const apk = fs.readFileSync(path.join(root, 'downloads', release.filename));
    assert.equal(apk.length, release.sizeBytes);
    assert.equal(crypto.createHash('sha256').update(apk).digest('hex'), release.sha256);
  }
  assert.ok(html.includes(`href="${release.url}"`));
  assert.ok(html.includes('target="_blank" rel="noopener noreferrer"'));
  assert.match(html, /aria-disabled="false"/); assert.doesNotMatch(html, /Testing build/);
});
test('Firebase serves APKs as downloadable Android packages and excludes test/source directories', () => {
  const hosting = JSON.parse(fs.readFileSync(process.env.ALPHASTAR_SITE_TEST_CONFIG || path.join(root, 'firebase.json'), 'utf8')).hosting;
  const headers = Object.fromEntries(hosting.headers.find(rule => rule.source === '/downloads/*.apk').headers.map(header => [header.key, header.value]));
  assert.equal(headers['Content-Type'], 'application/vnd.android.package-archive'); assert.equal(headers['Content-Disposition'], 'attachment');
  assert.equal(headers['X-Content-Type-Options'], 'nosniff'); assert.match(headers['Cache-Control'], /immutable/);
  for (const folder of ['test/**', 'docs/**', 'scripts/**', '**/.*']) assert.ok(hosting.ignore.includes(folder), folder);
});
