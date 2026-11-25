'use strict';
// Explicit APK-only publication. Preserve unrelated working files/index edits.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const git = (args, input) => execFileSync('git', args, { cwd: root, input, encoding: 'utf8', windowsHide: true, maxBuffer: 4 * 1024 * 1024 });
assert.equal(git(['diff', '--cached', '--name-only']).trim(), '', 'Preserve existing staged changes.');
assert.equal(git(['branch', '--show-current']).trim(), 'main');
assert.equal(git(['remote', 'get-url', 'origin']).trim(), 'https://github.com/sambal01/alphastar-web.git');
const release = JSON.parse(fs.readFileSync(path.join(root, 'downloads/release.json'), 'utf8'));
const verified = JSON.parse(fs.readFileSync(path.resolve(root, '../alphastar-mobile/.expo/apk' + release.versionCode + '-verification.json'), 'utf8'));
const hostedExternally = /^https:\/\//i.test(String(release.url || ''));
const publicDownloadUrl = hostedExternally ? release.url : 'downloads/' + release.filename;
assert.match(release.filename, /^Alphastar-\d+\.\d+\.\d+-build\d+\.apk$/);
assert.equal(verified.version, release.version); assert.equal(verified.build, release.versionCode);
assert.equal(verified.signatureVerified, true); assert.equal(verified.certificateMatchesPrevious, true);
assert.equal(verified.packagedBundleMatchesGeneratedBundle, true);
const apk = fs.readFileSync(path.join(root, 'downloads', release.filename));
assert.equal(apk.length, release.sizeBytes);
assert.equal(crypto.createHash('sha256').update(apk).digest('hex'), release.sha256);
assert.equal(release.sha256, verified.sha256);
assert.ok(apk.length < 100 * 1024 * 1024, 'APK exceeds the existing Git publication limit.');
let html = git(['show', 'HEAD:index.html']);
const working = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const expression of [/<a class="app-download-btn android-download-btn"[^>]*>/, /<script src="assets\/js\/site-config\.js\?[^>]*><\/script>/]) {
  const before = html.match(expression), after = working.match(expression);
  assert.ok(before && after && before.length === 1 && after.length === 1, 'Required unique download HTML marker.');
  html = html.replace(before[0], after[0]);
}
assert.ok(html.includes(publicDownloadUrl), 'Website download link must match the published APK URL.');
const blob = git(['hash-object', '-w', '--stdin'], html).trim();
git(['update-index', '--cacheinfo', '100644,' + blob + ',index.html']);
const allow = ['assets/js/site-config.js', 'downloads/release.json', ...(!hostedExternally ? ['downloads/' + release.filename] : []), 'downloads/' + release.filename + '.sha256',
  'docs/android-release-' + release.version + '.md', 'test/android-download-release.test.cjs', 'scripts/stage-apk-download-release.cjs'];
git(['add', '--', ...allow]);
const staged = git(['diff', '--cached', '--name-only']).trim().split(/\r?\n/);
assert.ok(staged.every(file => file === 'index.html' || allow.includes(file)), 'Unexpected staged change.');
git(['diff', '--cached', '--check']);
console.log(JSON.stringify({ version: release.version, build: release.versionCode, staged, unrelatedChangesPreserved: true }));
if (process.argv.includes('--preview')) {
  const temp = path.join(root, '.tmp'); fs.mkdirSync(temp, { recursive: true });
  const preview = fs.mkdtempSync(path.join(temp, 'apk-download-preview-'));
  const downloadFiles = new Set(['downloads/release.json', 'downloads/' + release.filename + '.sha256']);
  if (!hostedExternally) downloadFiles.add('downloads/' + release.filename);
  const names = git(['ls-files', '-z']).split('\0').filter(name =>
    /^(?:index\.html|privacy-policy\.html|terms-and-conditions\.html|firebase\.json|assets\/[^\0]+)$/.test(name) || downloadFiles.has(name));
  for (const name of names) {
    const target = path.resolve(preview, name);
    assert.ok(target.startsWith(preview + path.sep), 'Unsafe preview path');
    const bytes = execFileSync('git', ['show', ':' + name], { cwd: root, windowsHide: true, maxBuffer: 128 * 1024 * 1024 });
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, bytes, { flag: 'wx' });
  }
  console.log(JSON.stringify({ preview, files: names.length, fromStagedIndex: true, includesUnrelatedWorkingChanges: false }));
}
