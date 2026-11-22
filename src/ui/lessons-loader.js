/*
 * 課堂內容按需載入（ESM）。
 *
 * 建置時 `lessons.js` 被切成獨立的 hashed chunk（`lessons.<buildHash>.js`），
 * 不在開機 bundle 內：首頁/階段/練習/測驗都不需要教學文字，只有進入小課堂
 * 才注入這個 chunk。Service Worker 會 precache 它，所以離線時仍可載入；
 * dist/index.html 亦加了 <link rel="prefetch">，通常在使用者點進課堂前已下載好。
 *
 * root classic 模式（file://、legacy 分支部署、Node 測試）在 app.js 之前
 * 已同步載入 lessons.js，因此 `window.Lessons` 存在時直接解析，零延遲。
 */
var root = typeof window !== 'undefined' ? window : globalThis;

var pending = null;

/* chunk 檔名由建置寫入 <meta name="math-garden-lessons">，與 build hash 同步 */
function chunkUrl() {
  var meta = root.document && root.document.querySelector
    ? root.document.querySelector('meta[name="math-garden-lessons"]')
    : null;
  return meta ? meta.getAttribute('content') : null;
}

/* 回傳 Promise<Lessons>；重複呼叫共用同一個載入中的請求，失敗後可重試。 */
function ensureLessons() {
  if (root.Lessons) return Promise.resolve(root.Lessons);
  if (pending) return pending;
  var src = chunkUrl();
  if (!src) return Promise.reject(new Error('lessons chunk 未設定'));
  pending = new Promise(function (resolve, reject) {
    var script = root.document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = function () {
      pending = null;
      if (root.Lessons) resolve(root.Lessons);
      else reject(new Error('lessons chunk 沒有提供 Lessons'));
    };
    script.onerror = function () {
      pending = null;
      reject(new Error('lessons chunk 載入失敗'));
    };
    (root.document.head || root.document.documentElement).appendChild(script);
  });
  return pending;
}

export { ensureLessons, chunkUrl };
