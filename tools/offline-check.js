#!/usr/bin/env node
/*
 * 真實瀏覽器冷啟動離線檢查（Chrome + service worker）。
 * 用法：npm run offline-check（需先 npm run build；使用本機 Chrome/Edge）
 * 流程：載入 dist → 等 SW 控制頁面 → 關閉頁面 → 斷網 → 新開頁面重載 → 檢查 app 仍可渲染。
 */
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer-core');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('缺少 dist/index.html，請先執行 npm run build');
  process.exit(2);
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json',
  '.png': 'image/png', '.ico': 'image/x-icon', '.svg': 'image/svg+xml', '.woff2': 'font/woff2'
};
const server = http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || '/').split('?')[0]);
  if (p === '/') p = '/index.html';
  const file = path.normalize(path.join(DIST, p));
  if (!file.startsWith(DIST)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
});

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'
  ];
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return null;
}

(async () => {
  const chrome = findChrome();
  if (!chrome) { console.error('找不到 Chrome/Edge；可設定 CHROME_PATH 後重跑。'); process.exit(2); }
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const url = 'http://127.0.0.1:' + server.address().port + '/';
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
    const controlled = await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.ready;
      // 等控制器接手（首次載入可能尚未 claim；reload 一次讓 SW 接管）
      if (!navigator.serviceWorker.controller) {
        await new Promise((resolve) => {
          navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true });
          setTimeout(resolve, 3000);
        });
      }
      return !!(reg && navigator.serviceWorker.controller);
    });
    if (!controlled) throw new Error('service worker 未接管頁面');
    const titleOnline = await page.title();
    await page.close();

    /* 冷啟動：新頁面 + 完全斷網 */
    const offlinePage = await browser.newPage();
    await offlinePage.setOfflineMode(true);
    await offlinePage.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await offlinePage.waitForSelector('#screen-home', { timeout: 30000 });
    const titleOffline = await offlinePage.title();
    const heading = await offlinePage.$eval('#screen-home h1', (el) => el.textContent.trim());
    if (!heading) throw new Error('離線首頁沒有標題');
    const swCount = await offlinePage.evaluate(() => (navigator.serviceWorker.controller ? 1 : 0));
    console.log('online title:  ' + titleOnline);
    console.log('offline title: ' + titleOffline);
    console.log('offline home:  ' + heading + ' (SW controller=' + swCount + ')');
    console.log('✓ cold offline start renders from cache');
  } finally {
    await browser.close();
    server.close();
  }
})().catch((err) => {
  console.error('離線檢查失敗：' + err.message);
  process.exit(1);
});
