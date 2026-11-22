/* 由 tools/build.js 生成 —— 請勿手改；改 tools/sw-template.js 後重新 build。 */
const CACHE = 'math-garden-7567a4eebd4b';
const NAV_TIMEOUT_MS = 3000;
const ASSETS = [
  './app.7567a4eebd4b.js',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png',
  './icon.ico',
  './index.html',
  './manifest.webmanifest',
  './style.css',
  './vendor/katex/fonts/KaTeX_AMS-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Caligraphic-Bold.woff2',
  './vendor/katex/fonts/KaTeX_Caligraphic-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Fraktur-Bold.woff2',
  './vendor/katex/fonts/KaTeX_Fraktur-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Main-Bold.woff2',
  './vendor/katex/fonts/KaTeX_Main-BoldItalic.woff2',
  './vendor/katex/fonts/KaTeX_Main-Italic.woff2',
  './vendor/katex/fonts/KaTeX_Main-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Math-BoldItalic.woff2',
  './vendor/katex/fonts/KaTeX_Math-Italic.woff2',
  './vendor/katex/fonts/KaTeX_SansSerif-Bold.woff2',
  './vendor/katex/fonts/KaTeX_SansSerif-Italic.woff2',
  './vendor/katex/fonts/KaTeX_SansSerif-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Script-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Size1-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Size2-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Size3-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Size4-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Typewriter-Regular.woff2',
  './vendor/katex/katex.min.css',
  './vendor/katex/katex.min.js'
];

const VERSIONED = /\/app\.[0-9a-f]+\.js$/;

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
