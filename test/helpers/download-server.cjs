'use strict';
const fs = require('node:fs'), fsp = require('node:fs/promises'), path = require('node:path'), http = require('node:http');
module.exports = function downloadServer(root) {
  const hosting = JSON.parse(fs.readFileSync(process.env.ALPHASTAR_SITE_TEST_CONFIG || path.join(root, 'firebase.json'), 'utf8')).hosting;
  const matches = (pattern, value) => new RegExp('^' + pattern.split('*').map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[^/]*') + '$').test(value);
  return http.createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const relative = pathname.slice(1) || 'index.html', file = path.resolve(root, relative);
      if (!file.startsWith(root + path.sep) || !(relative === 'index.html' || relative.startsWith('assets/') || relative.startsWith('downloads/'))) throw Error('Outside test scope');
      const stat = await fsp.stat(file); if (!stat.isFile()) throw Error('Not a file');
      const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json' };
      const headers = { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'Accept-Ranges': 'bytes' };
      for (const rule of hosting.headers || []) if (matches(rule.source, '/' + relative)) for (const header of rule.headers) headers[header.key] = header.value;
      let start = 0, end = stat.size - 1, status = 200;
      if (req.headers.range) {
        const range = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
        if (!range || Number(range[1]) >= stat.size || (range[2] && Number(range[2]) < Number(range[1]))) {
          res.writeHead(416, { 'Content-Range': 'bytes */' + stat.size }); return res.end();
        }
        start = Number(range[1]); end = Math.min(range[2] ? Number(range[2]) : end, end); status = 206;
        headers['Content-Range'] = `bytes ${start}-${end}/${stat.size}`;
      }
      headers['Content-Length'] = end - start + 1;
      res.writeHead(status, headers);
      if (req.method === 'HEAD') return res.end();
      const stream = fs.createReadStream(file, { start, end }); stream.on('error', () => res.destroy());
      res.on('close', () => stream.destroy()); stream.pipe(res);
    } catch { if (!res.headersSent) res.writeHead(404); res.end(); }
  });
};
