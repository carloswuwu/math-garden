/* Service Worker：離線快取
 * 策略：網路優先（network-first）——上線時永遠取得最新版本；
 *       離線時自動退回快取。快取版本號每次更新時遞增，舊快取會被清除。 */
const CACHE = 'math-garden-v4';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './math-core.js',
  './i18n.js',
  './curriculum.js',
  './curriculum-outline.js',
  './lessons.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './vendor/katex/katex.min.js',
  './vendor/katex/katex.min.css'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
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

  e.respondWith(
    fetch(req).then((res) => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
      }
      return res;
    }).catch(() =>
      caches.match(req).then((hit) => hit || caches.match('./index.html'))
    )
  );
});
