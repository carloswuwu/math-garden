/*
 * Service Worker 範本（由 tools/build.js 注入 CACHE 與 ASSETS 後輸出 dist/sw.js）。
 * 策略：
 *   - 導覽請求（HTML）：網路優先，3 秒超時或失敗才回退已快取外殼
 *   - 帶 build hash 的 app bundle 與 KaTeX 字型：cache-first（內容不可變）
 *   - 其他同源資源：網路優先，失敗回退快取；沒有快取就回傳錯誤
 *     （絕不以 index.html 冒充 JS/CSS）
 *   - 新版本安裝後停在 waiting，等使用者按「新版本」chip 才 SKIP_WAITING。
 */
'use strict';

module.exports = function renderServiceWorker(cacheName, assets) {
  const list = assets.map((a) => "  './" + a + "'").join(',\n');
  return `/* 由 tools/build.js 生成 —— 請勿手改；改 tools/sw-template.js 後重新 build。 */
const CACHE = '${cacheName}';
const NAV_TIMEOUT_MS = 3000;
const ASSETS = [
${list}
];

const VERSIONED = /\\/app\\.[0-9a-f]+\\.js$/;

function isNavigation(req) {
  return req.mode === 'navigate' ||
    (req.headers && (req.headers.get('accept') || '').indexOf('text/html') !== -1);
}

function isImmutable(url) {
  return VERSIONED.test(url.pathname) || url.pathname.indexOf('/vendor/katex/fonts/') !== -1;
}

function putInCache(req, res) {
  if (!res || !res.ok) return;
  const copy = res.clone();
  caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
}

function networkFirst(req) {
  return fetch(req).then((res) => {
    putInCache(req, res);
    return res;
  }).catch(() => caches.match(req).then((hit) => hit || Response.error()));
}

function cacheFirst(req) {
  return caches.match(req).then((hit) => hit || fetch(req).then((res) => {
    putInCache(req, res);
    return res;
  }));
}

function navigationFetch(req) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('navigation timeout')), NAV_TIMEOUT_MS);
    fetch(req).then((res) => {
      clearTimeout(timer);
      putInCache(req, res);
      resolve(res);
    }, (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

self.addEventListener('install', (e) => {
  /* 不自動 skipWaiting：更新要等使用者從「新版本」chip 確認 */
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(ASSETS.map((url) => c.add(url))))
  );
});

self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // 只處理本站資源

  if (isNavigation(req)) {
    e.respondWith(
      navigationFetch(req).catch(() =>
        caches.match(req).then((hit) => hit || caches.match('./index.html'))
      )
    );
    return;
  }

  e.respondWith(isImmutable(url) ? cacheFirst(req) : networkFirst(req));
});
`;
};
