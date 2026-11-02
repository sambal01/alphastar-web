'use strict';
// Build an isolated static-site payload from the last published Git baseline,
// overlaying the support-chat/download release. Never publish the whole working tree.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const git = args => execFileSync('git', args, { cwd: root, windowsHide: true, maxBuffer: 128 * 1024 * 1024 });
const fromIndex = process.argv.includes('--from-index');
const sha = data => crypto.createHash('sha256').update(data).digest('hex');
const release = JSON.parse(fs.readFileSync(path.join(root, 'downloads/release.json'), 'utf8'));
const overlays = ['index.html', 'assets/css/section-layout.css', 'assets/js/site-config.js', 'assets/js/site-language.js', 'assets/js/main.js',
  'assets/css/clinic-assistant.css', 'assets/js/human-chat.js', 'assets/js/clinic-assistant.js', 'assets/js/floating-btn.js',
  'assets/images/android-logo.svg', 'assets/images/android-logo.LICENSE.txt', 'downloads/release.json',
  'downloads/' + release.filename, 'downloads/' + release.filename + '.sha256'];
const baselineFiles = git(['ls-files', '-z']).toString().split('\0').filter(file => /^(?:index\.html|privacy-policy\.html|terms-and-conditions\.html|assets\/[^\0]+)$/.test(file));
// Compare origin bytes: the custom domain's Cloudflare Polish can transform
// PNGs without a source change. Never write optimized CDN images back to Git.
const origin = 'https://alphastar-web.onrender.com/';
const normalize = (name, bytes) => /\.(?:html|js|css|svg)$/.test(name) ? bytes.toString('utf8').replace(/\r\n/g, '\n').trim() : sha(bytes);
(async () => {
  assert.equal(release.filename, `Alphastar-${release.version}-build${release.versionCode}.apk`);
  assert.match(release.filename, /^Alphastar-\d+\.\d+\.\d+-build\d+\.apk$/);
  const apk = fs.readFileSync(path.join(root, 'downloads', release.filename));
  assert.equal(apk.length, release.sizeBytes); assert.equal(sha(apk), release.sha256);
  const baseline = new Map();
  for (let offset = 0; offset < baselineFiles.length; offset += 6) {
    await Promise.all(baselineFiles.slice(offset, offset + 6).map(async name => {
      const bytes = git(['show', 'HEAD:' + name]);
      const url = new URL(name, origin); url.searchParams.set('download_release_audit', '20261024');
      const response = await fetch(url, { headers: { 'Cache-Control': 'no-cache' }, signal: AbortSignal.timeout(25000) });
      assert.equal(response.status, 200, 'Live baseline asset missing: ' + name);
      const live = Buffer.from(await response.arrayBuffer());
      const polished = response.headers.get('cf-polished') || '';
      const etag = (response.headers.get('etag') || '').replace(/^W\//, '').replace(/"/g, '');
      const sourceImageMatches = /\.(?:png|jpe?g)$/.test(name) && polished.includes('orig_size=' + bytes.length) &&
        etag === crypto.createHash('md5').update(bytes).digest('hex');
      if (!sourceImageMatches) assert.equal(normalize(name, live), normalize(name, bytes), 'Live site differs from published Git baseline: ' + name);
      // The origin's source fingerprint must match. Keep original Git bytes,
      // never recompress a Cloudflare-optimized image into the release.
      baseline.set(name, bytes);
    }));
  }
  const temp = path.join(root, '.tmp'); fs.mkdirSync(temp, { recursive: true });
  const folder = fs.mkdtempSync(path.join(temp, 'android-download-release-')), publicRoot = path.join(folder, 'public');
  const put = (name, bytes) => {
    const target = path.resolve(publicRoot, name); assert.ok(target.startsWith(publicRoot + path.sep), 'Unsafe staging target');
    fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, bytes, { flag: 'wx' });
  };
  for (const [name, bytes] of baseline) if (!overlays.includes(name)) put(name, bytes);
  for (const name of overlays) put(name, fromIndex ? git(['show', ':' + name]) : fs.readFileSync(path.join(root, name)));
  const config = JSON.parse(fs.readFileSync(path.join(root, 'firebase.json'), 'utf8'));
  delete config.$schema; config.hosting.public = 'public';
  assert.equal(config.hosting.site, 'alpha-star-clinic-mobile');
  fs.writeFileSync(path.join(folder, 'firebase.json'), JSON.stringify(config, null, 2));
  const manifest = { preparedAt: new Date().toISOString(), service: 'alphastar-web', serviceId: 'srv-db27v9vlot8c73e6t720', priorCommit: git(['rev-parse', 'HEAD']).toString().trim(),
    liveBaselineFilesVerified: baseline.size, apkVersion: release.version, apkBuild: release.versionCode, apkSha256: release.sha256,
    changedOrAddedPublicFiles: overlays, preservedPublicFiles: [...baseline.keys()].filter(name => !overlays.includes(name)),
    publicFileCount: baseline.size + overlays.filter(name => !baseline.has(name)).length, includesUnrelatedLocalPhoneImage: false,
    backendOrRulesDeployment: false, publicRoot };
  fs.writeFileSync(path.join(folder, 'stage-manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(JSON.stringify({ ...manifest, preservedPublicFiles: manifest.preservedPublicFiles.length }, null, 2));
})().catch(error => { console.error(error.message); process.exitCode = 1; });
