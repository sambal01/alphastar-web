'use strict';
// Stage only the verified chat/download release; preserve unrelated index.html edits.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const git = (args, input) => execFileSync('git', args, { cwd: root, input, windowsHide: true, maxBuffer: 32 * 1024 * 1024 });
assert.equal(git(['diff', '--cached', '--name-only']).toString().trim(), '', 'Review the existing staged changes first');
assert.equal(git(['branch', '--show-current']).toString().trim(), 'main');
const release = JSON.parse(fs.readFileSync(path.join(root, 'downloads/release.json'), 'utf8'));
assert.equal(release.version, '1.0.70'); assert.equal(release.versionCode, 71);
const working = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
let html = git(['show', 'HEAD:index.html']).toString('utf8');
for (const expression of [
  /<a class="app-download-btn android-download-btn"[^>]*>/,
  /<p class="download-release"[^>]*>[^<]*<\/p>/,
  /<link rel="stylesheet" href="assets\/css\/clinic-assistant\.css\?[^>]*>/,
  /<script src="assets\/js\/(?:site-config|human-chat)\.js\?[^>]*><\/script>/g,
]) {
  const previous = html.match(expression), next = working.match(expression);
  assert.ok(previous && next && previous.length === next.length, 'Required release HTML markers must match');
  previous.forEach((value, index) => { html = html.replace(value, next[index]); });
}
assert.ok(html.includes('downloads/' + release.filename));
assert.ok(!html.includes('assets/css/mobile-chrome.css'), 'Unrelated footer/menu changes must stay local');
const blob = git(['hash-object', '-w', '--stdin'], html).toString().trim();
git(['update-index', '--cacheinfo', '100644,' + blob + ',index.html']);
const allow = ['assets/js/site-config.js', 'assets/css/clinic-assistant.css', 'assets/js/human-chat.js',
  'docs/human-chat-lifecycle.md', 'downloads/release.json', 'downloads/' + release.filename,
  'downloads/' + release.filename + '.sha256', 'test/human-chat-layout.cjs', 'test/android-download-release.test.cjs',
  'test/android-download-layout.test.cjs', 'test/android-download-live.cjs', 'test/helpers/download-server.cjs',
  'scripts/stage-android-download.cjs', 'scripts/prepare-chat-download-release.cjs'];
git(['add', '--', ...allow]);
const staged = git(['diff', '--cached', '--name-only']).toString().trim().split(/\r?\n/);
assert.ok(staged.every(name => name === 'index.html' || allow.includes(name)), 'Unexpected staged file');
console.log('Staged chat/download release only. Other working-tree changes are preserved.');
console.log(staged.join('\n'));
