'use strict';
// Publish only the verified APK and its website download identity.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const git = (args, input) => execFileSync('git', args, { cwd: root, input, encoding: 'utf8', windowsHide: true, maxBuffer: 4 * 1024 * 1024 });
assert.equal(git(['diff', '--cached', '--name-only']).trim(), '', 'Preserve the existing index');
assert.equal(git(['branch', '--show-current']).trim(), 'main');
assert.equal(git(['remote', 'get-url', 'origin']).trim(), 'https://github.com/sambal01/alphastar-web.git');
const release = JSON.parse(fs.readFileSync(path.join(root, 'downloads/release.json'), 'utf8'));
assert.equal(release.version, '1.0.82'); assert.equal(release.versionCode, 83);
const verified = JSON.parse(fs.readFileSync(path.resolve(root, '../alphastar-mobile/.expo/apk83-verification.json'), 'utf8'));
assert.equal(verified.version, release.version); assert.equal(verified.build, release.versionCode);
assert.equal(verified.signatureVerified, true); assert.equal(verified.certificateMatchesPrevious, true);
const apk = fs.readFileSync(path.join(root, 'downloads', release.filename));
assert.equal(apk.length, release.sizeBytes); assert.equal(crypto.createHash('sha256').update(apk).digest('hex'), release.sha256);
assert.equal(release.sha256, verified.sha256);
let html = git(['show', 'HEAD:index.html']);
const working = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const expression of [/<a class="app-download-btn android-download-btn"[^>]*>/, /<p class="download-release"[^>]*>[^<]*<\/p>/, /<script src="assets\/js\/site-config\.js\?[^>]*><\/script>/]) {
  const before = html.match(expression), after = working.match(expression);
  assert.ok(before && after, 'Missing release marker'); html = html.replace(before[0], after[0]);
}
assert.ok(html.includes('downloads/' + release.filename));
const blob = git(['hash-object', '-w', '--stdin'], html).trim();
git(['update-index', '--cacheinfo', '100644,' + blob + ',index.html']);
const files = ['assets/js/site-config.js', 'downloads/release.json', 'downloads/' + release.filename,
  'downloads/' + release.filename + '.sha256', 'docs/android-release-1.0.82.md',
  'test/android-download-release.test.cjs', 'scripts/stage-form-download-release.cjs'];
git(['add', '--', ...files]);
const staged = git(['diff', '--cached', '--name-only']).trim().split(/\r?\n/);
assert.ok(staged.every(name => name === 'index.html' || files.includes(name))); git(['diff', '--cached', '--check']);
console.log(JSON.stringify({ staged, version: release.version, build: release.versionCode, unrelatedChangesPreserved: true }, null, 2));
