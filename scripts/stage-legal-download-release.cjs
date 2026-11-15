'use strict';
// Stage only legal notices and the verified APK. Never publish unrelated chat,
// backend, cleanup, credentials, patient data or working index.html changes.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const git = (args, input) => execFileSync('git', args, { cwd: root, input, encoding: 'utf8', windowsHide: true, maxBuffer: 4 * 1024 * 1024 });
assert.equal(git(['diff', '--cached', '--name-only']).trim(), '', "Preserve the user's existing index.");
assert.equal(git(['branch', '--show-current']).trim(), 'main');
assert.equal(git(['remote', 'get-url', 'origin']).trim(), 'https://github.com/sambal01/alphastar-web.git');
const release = JSON.parse(fs.readFileSync(path.join(root, 'downloads/release.json'), 'utf8'));
assert.equal(release.version, '1.0.86'); assert.equal(release.versionCode, 87);
const verified = JSON.parse(fs.readFileSync(path.resolve(root, '../alphastar-mobile/.expo/apk87-verification.json'), 'utf8'));
assert.equal(verified.version, release.version); assert.equal(verified.build, release.versionCode);
assert.equal(verified.signatureVerified, true); assert.equal(verified.certificateMatchesPrevious, true);
const apk = fs.readFileSync(path.join(root, 'downloads', release.filename));
assert.equal(apk.length, release.sizeBytes);
assert.equal(crypto.createHash('sha256').update(apk).digest('hex'), release.sha256);
assert.equal(release.sha256, verified.sha256);
execFileSync(process.execPath, ['scripts/build-legal-pages.cjs', '--check'], { cwd: root, stdio: 'pipe', windowsHide: true });
let html = git(['show', 'HEAD:index.html']);
const working = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const expression of [/<a class="app-download-btn android-download-btn"[^>]*>/, /<p class="download-release"[^>]*>[^<]*<\/p>/, /<script src="assets\/js\/site-config\.js\?[^>]*><\/script>/]) {
  const before = html.match(expression), after = working.match(expression);
  assert.ok(before && after && before.length === 1 && after.length === 1, 'Required unique release HTML marker');
  html = html.replace(before[0], after[0]);
}
assert.ok(html.includes('downloads/' + release.filename));
const blob = git(['hash-object', '-w', '--stdin'], html).trim();
git(['update-index', '--cacheinfo', '100644,' + blob + ',index.html']);
const allow = ['privacy-policy.html', 'terms-and-conditions.html', 'assets/js/legal-translations.js', 'assets/js/site-config.js',
  'scripts/build-legal-pages.cjs', 'scripts/legal-tagalog.cjs', 'scripts/stage-legal-download-release.cjs',
  'test/legal-pages.test.cjs', 'test/android-download-release.test.cjs', 'docs/android-release-1.0.86.md',
  'downloads/release.json', 'downloads/' + release.filename, 'downloads/' + release.filename + '.sha256'];
git(['add', '--', ...allow]);
const staged = git(['diff', '--cached', '--name-only']).trim().split(/\r?\n/);
assert.ok(staged.every(file => file === 'index.html' || allow.includes(file)), 'Unexpected staged change');
git(['diff', '--cached', '--check']);
console.log(JSON.stringify({ version: release.version, build: release.versionCode, staged, unrelatedChangesPreserved: true }, null, 2));
