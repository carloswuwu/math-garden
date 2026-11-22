#!/usr/bin/env node
/*
 * 真實瀏覽器無障礙檢查（Lighthouse，a11y ≥ 0.95）。
 * 用法：npm run lighthouse（需已 npm run build；會用 npx 下載 lighthouse，需 Chrome/Edge）
 * 這是 Phase 5 的部署前手動 gate：jsdom 的 axe 子集在 CI 跑，這裡用真瀏覽器跑完整 axe。
 */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const INDEX = path.join(DIST, 'index.html');
const THRESHOLD = 0.95;

if (!fs.existsSync(INDEX)) {
  console.error('缺少 dist/index.html，請先執行 npm run build');
  process.exit(2);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2'
};

const server = http.createServer(function (req, res) {
  let p = decodeURIComponent((req.url || '/').split('?')[0]);
  if (p === '/') p = '/index.html';
  const file = path.normalize(path.join(DIST, p));
  if (!file.startsWith(DIST)) { res.writeHead(403); res.end('Forbidden'); return; }
  fs.readFile(file, function (err, data) {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
});

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser'
  ];
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return null;
}

server.listen(0, '127.0.0.1', function () {
  const port = server.address().port;
  const url = 'http://127.0.0.1:' + port + '/';
  const out = path.join(os.tmpdir(), 'math-garden-lighthouse.json');
  const chrome = findChrome();
  if (!chrome) {
    console.error('找不到 Chrome/Edge；可設定 CHROME_PATH 後重跑。');
    server.close();
    process.exit(2);
    return;
  }
  const cmd = [
    'npx --yes lighthouse@12',
    JSON.stringify(url),
    '--only-categories=accessibility',
    '--chrome-flags="--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage"',
    '--output=json',
    '--output-path=' + JSON.stringify(out),
    '--quiet'
  ].join(' ');
  console.log('Lighthouse a11y: ' + url + ' (Chrome: ' + chrome + ')');
  const child = spawn(cmd, {
    stdio: 'inherit',
    env: Object.assign({}, process.env, { CHROME_PATH: chrome }),
    shell: true
  });
  child.on('error', function (err) {
    console.error('Lighthouse 無法啟動：' + err.message);
    server.close();
    process.exit(1);
  });
  child.on('close', function (code) {
    server.close();
    if (code !== 0 || !fs.existsSync(out)) {
      console.error('Lighthouse 執行失敗（exit ' + code + '）');
      process.exit(1);
      return;
    }
    const report = JSON.parse(fs.readFileSync(out, 'utf8'));
    const cat = report.categories && report.categories.accessibility;
    const score = cat && cat.score;
    const failed = (cat.auditRefs || [])
      .map(function (ref) { return report.audits[ref.id]; })
      .filter(function (a) { return a && a.score !== null && a.score < 1; })
      .map(function (a) { return a.id; });
    console.log('Accessibility score: ' + (score == null ? 'n/a' : score.toFixed(3)));
    if (failed.length) console.log('未滿分的 audit：' + failed.join(', '));
    if (!(score >= THRESHOLD)) {
      console.error('未達門檻 ' + THRESHOLD);
      process.exit(1);
      return;
    }
    console.log('✓ Lighthouse accessibility ≥ ' + THRESHOLD);
  });
});
