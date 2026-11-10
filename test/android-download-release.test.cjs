'use strict';
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), vm = require('node:vm');
const root = path.resolve(process.env.ALPHASTAR_SITE_TEST_ROOT || path.join(__dirname, '..'));
const release = JSON.parse(fs.readFileSync(path.join(root, 'downloads/release.json'), 'utf8'));
test('published download payload matches its verified SHA-256 and declared testing version', () => {
  assert.equal(release.version, '1.0.79'); assert.equal(release.versionCode, 80); assert.equal(release.testingBuild, true);
  const apk = fs.readFileSync(path.join(root, 'downloads', release.filename));
  assert.equal(apk.length, release.sizeBytes); assert.equal(crypto.createHash('sha256').update(apk).digest('hex'), release.sha256);
  assert.match(fs.readFileSync(path.join(root, 'downloads', release.filename + '.sha256'), 'utf8'), new RegExp('^' + release.sha256));
});
test('HTML fallback, JavaScript settings and release metadata refer to the same existing APK', () => {
  const c = vm.createContext({ window: {} }); vm.runInContext(fs.readFileSync(path.join(root, 'assets/js/site-config.js'), 'utf8'), c);
  const config = c.window.ALPHASTAR_WEBSITE_CONFIG, html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.equal(config.androidApkUrl, 'downloads/' + release.filename);
  assert.equal(config.androidApkRelease.version, release.version); assert.equal(config.androidApkRelease.build, release.versionCode);
  assert.equal(config.androidApkRelease.bytes, release.sizeBytes);
  assert.ok(html.includes(`href="downloads/${release.filename}" download="${release.filename}"`));
  assert.match(html, /aria-disabled="false"/); assert.doesNotMatch(html, /Testing build/);
});
test('Firebase serves APKs as downloadable Android packages and excludes test/source directories', () => {
  const hosting = JSON.parse(fs.readFileSync(process.env.ALPHASTAR_SITE_TEST_CONFIG || path.join(root, 'firebase.json'), 'utf8')).hosting;
  const headers = Object.fromEntries(hosting.headers.find(rule => rule.source === '/downloads/*.apk').headers.map(header => [header.key, header.value]));
  assert.equal(headers['Content-Type'], 'application/vnd.android.package-archive'); assert.equal(headers['Content-Disposition'], 'attachment');
  assert.equal(headers['X-Content-Type-Options'], 'nosniff'); assert.match(headers['Cache-Control'], /immutable/);
  for (const folder of ['test/**', 'docs/**', 'scripts/**', '**/.*']) assert.ok(hosting.ignore.includes(folder), folder);
});
