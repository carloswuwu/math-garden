#!/usr/bin/env node
/*
 * 建置腳本：把 7 個按加載順序排列的 classic script 用 esbuild 壓縮並合併成
 * 單一 IIFE `dist/app.<hash>.js`，再生成 `dist/index.html` 與 `dist/sw.js`。
 *
 * 設計約束：
 *  - 保留 static / file:// 模型：輸出仍是 classic <script>，KaTeX 維持獨立 classic script；
 *    沒有 import/export、沒有需要伺服器的路徑。
 *  - 決定性：所有文字檔先正規化為 LF，esbuild 版本也納入 hash，因此同一份 repo
 *    在 Windows/CI 產生完全相同的 dist（CI 用 `git diff --exit-code -- dist` 驗證）。
 *  - SW 的 precache 清單與 cache 版本由建置產出，不再手動維護。
 *
 * 用法：node tools/build.js（或 npm run build）
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const esbuild = require('esbuild');
const renderServiceWorker = require('./sw-template.js');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

/* 必須按此順序合併（app.js 最後，因為它讀取前面掛在 window 上的全局） */
const SOURCE_SCRIPTS = [
  'math-core.js',
  'i18n.js',
  'curriculum.js',
  'curriculum-outline.js',
  'formulas.js',
  'lessons.js',
  'app.js'
];

/* Phase 5 Stage C：內容模組以 ESM（src/data/*.js）為來源，
 * 建置時再生成 root classic wrapper，讓 file:// / legacy 分支部署照舊載入。
 * 生成的 root 檔案是建置產物，CI 會驗證它們與來源同步。 */
const DATA_MODULES = [
  { source: 'src/data/i18n.js', rootFile: 'i18n.js', exportName: 'I18N', globalName: 'I18N' },
  { source: 'src/data/curriculum.js', rootFile: 'curriculum.js', exportName: 'Curriculum', globalName: 'Curriculum' },
  { source: 'src/data/curriculum-outline.js', rootFile: 'curriculum-outline.js', exportName: 'CurriculumOutline', globalName: 'CurriculumOutline' },
  { source: 'src/data/formulas.js', rootFile: 'formulas.js', exportName: 'Formulas', globalName: 'Formulas' },
  { source: 'src/data/lessons.js', rootFile: 'lessons.js', exportName: 'Lessons', globalName: 'Lessons' },
  /* Stage D：引擎 ESM 來源；生成 UMD root wrapper（瀏覽器 window.MathCore、Node require）。 */
  { source: 'src/core/index.js', rootFile: 'math-core.js', exportName: 'MathCore', globalName: 'MathCore', umd: true },
  /* Stage E：UI ESM 來源；生成 classic app.js（side-effect IIFE，自行掛 window.__mathApp） */
  { source: 'src/ui/index.js', rootFile: 'app.js', sideEffect: true }
];

/* 直接複製到 dist 的根目錄檔案 */
const ROOT_ASSETS = [
  'style.css',
  'manifest.webmanifest',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png',
  'icon.ico'
];

const TEXT_EXTS = new Set(['.js', '.css', '.html', '.webmanifest', '.json', '.svg', '.txt']);

/* 只複製現代瀏覽器需要的 KaTeX 資源：woff2 字型 + js/css（與舊 SW 的 20 個 woff2 一致） */
const VENDOR_EXT = new Set(['.woff2', '.js', '.css']);

function isVendorFile(file) {
  return VENDOR_EXT.has(path.extname(file).toLowerCase());
}

function isTextFile(file) {
  return TEXT_EXTS.has(path.extname(file).toLowerCase());
}

/* 讀檔並把文字檔的 CRLF/CR 正規化成 LF，保證跨平台 hash 與輸出穩定 */
function readNormalized(absPath) {
  const buf = fs.readFileSync(absPath);
  if (!isTextFile(absPath)) return buf;
  return buf.toString('utf8').replace(/\r\n?/g, '\n');
}

function walkFiles(dir) {
  const out = [];
  (function rec(current) {
    fs.readdirSync(current, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((entry) => {
        const abs = path.join(current, entry.name);
        if (entry.isDirectory()) rec(abs);
        else out.push(path.relative(ROOT, abs).split(path.sep).join('/'));
      });
  })(dir);
  return out;
}

function generateDataModules() {
  const header = (m) => '/* 由 tools/build.js 從 ' + m.source + ' 生成 —— 請勿手改；改 ' + m.source + ' 後重新 npm run build。 */\n';
  DATA_MODULES.forEach((m) => {
    if (m.sideEffect) {
      const result = esbuild.buildSync({
        stdin: {
          contents: "import './" + m.source + "';\n",
          resolveDir: ROOT,
          sourcefile: 'ui-entry.js',
          loader: 'js'
        },
        bundle: true,
        format: 'iife',
        platform: 'browser',
        target: ['es2020'],
        write: false,
        legalComments: 'none',
        charset: 'utf8'
      });
      fs.writeFileSync(path.join(ROOT, m.rootFile), header(m) + result.outputFiles[0].text.replace(/\r\n?/g, '\n'));
      return;
    }
    if (m.umd) {
      /* 引擎：先 bundle 成 globalName IIFE，再用 UMD 外殼接上 Node require 與 window 全局 */
      const result = esbuild.buildSync({
        stdin: {
          contents: "export { " + m.exportName + " } from './" + m.source + "';\n",
          resolveDir: ROOT,
          sourcefile: 'core-entry.js',
          loader: 'js'
        },
        bundle: true,
        format: 'iife',
        globalName: '__MathCoreBundle',
        platform: 'browser',
        target: ['es2020'],
        write: false,
        legalComments: 'none',
        charset: 'utf8'
      });
      const code = result.outputFiles[0].text.replace(/\r\n?/g, '\n');
      const umd = '(function (root) {\n' +
        '  var factory = function () {\n' + code + '\n  return __MathCoreBundle.' + m.exportName + ';\n  };\n' +
        "  if (typeof module === 'object' && module.exports) { module.exports = factory(); }\n" +
        '  else { root.' + m.globalName + ' = factory(); }\n' +
        "})(typeof globalThis !== 'undefined' ? globalThis : this);\n";
      fs.writeFileSync(path.join(ROOT, m.rootFile), header(m) + umd);
      return;
    }
    const entry = "import { " + m.exportName + " } from './" + m.source + "';\n" +
      "(typeof window !== 'undefined' ? window : globalThis)." + m.globalName + " = " + m.exportName + ";\n";
    const result = esbuild.buildSync({
      stdin: {
        contents: entry,
        resolveDir: ROOT,
        sourcefile: 'data-entry.js',
        loader: 'js'
      },
      bundle: true,
      format: 'iife',
      platform: 'browser',
      target: ['es2020'],
      write: false,
      legalComments: 'none',
      charset: 'utf8'
    });
    fs.writeFileSync(path.join(ROOT, m.rootFile), header(m) + result.outputFiles[0].text.replace(/\r\n?/g, '\n'));
  });
}

function build() {
  /* ---- 0. 內容模組：ESM → root classic wrapper ---- */
  generateDataModules();

  /* ---- 1. 收集所有輸入（正規化後） ---- */
  const inputs = new Map();
  inputs.set('index.html', readNormalized(path.join(ROOT, 'index.html')));
  SOURCE_SCRIPTS.forEach((file) => {
    inputs.set(file, readNormalized(path.join(ROOT, file)));
  });
  ROOT_ASSETS.forEach((file) => {
    inputs.set(file, readNormalized(path.join(ROOT, file)));
  });
  walkFiles(path.join(ROOT, 'vendor', 'katex')).filter(isVendorFile).forEach((file) => {
    inputs.set(file, readNormalized(path.join(ROOT, file)));
  });

  /* ---- 2. 內容 hash（含 esbuild 版本，工具升級也會換檔名/快取） ---- */
  const hasher = crypto.createHash('sha256');
  [...inputs.keys()].sort().forEach((key) => {
    hasher.update(key);
    hasher.update('\0');
    hasher.update(inputs.get(key));
    hasher.update('\0');
  });
  hasher.update('esbuild\0' + esbuild.version + '\0');
  const hash = hasher.digest('hex').slice(0, 12);
  const bundleName = 'app.' + hash + '.js';

  /* ---- 3. 合併 + esbuild 壓縮成單一 IIFE ---- */
  const scripts = SOURCE_SCRIPTS.map((file) => inputs.get(file));
  const wrapped = '(function () {\n' + scripts.join('\n;\n') + '\n})();\n';
  const bundled = esbuild.transformSync(wrapped, {
    minify: true,
    target: ['es2018'],
    charset: 'utf8',
    legalComments: 'none',
    loader: 'js'
  }).code;
  const banner = '/*! Math Garden build ' + hash + ' — 由 tools/build.js 生成，請勿手改。 */\n';
  const bundle = banner + bundled;

  /* ---- 4. 生成 index.html（腳本區塊換成 vendor KaTeX + 單一 bundle） ---- */
  const scriptBlock = /  <script src="math-core\.js"><\/script>\n[\s\S]*?  <script src="app\.js"><\/script>/;
  if (!scriptBlock.test(inputs.get('index.html'))) {
    throw new Error('index.html 的 script 區塊格式改變了，請更新 tools/build.js');
  }
  let indexHtml = inputs.get('index.html').replace(
    scriptBlock,
    '  <script src="vendor/katex/katex.min.js"></script>\n' +
    '  <script src="' + bundleName + '"></script>'
  );
  indexHtml = indexHtml.replace(
    '<head>',
    '<head>\n  <meta name="math-garden-build" content="' + hash + '">'
  );

  /* ---- 5. 組裝 dist ---- */
  const files = new Map();
  files.set('index.html', indexHtml);
  files.set(bundleName, bundle);
  ROOT_ASSETS.forEach((file) => {
    files.set(file, inputs.get(file));
  });
  walkFiles(path.join(ROOT, 'vendor', 'katex')).filter(isVendorFile).forEach((file) => {
    files.set(file, inputs.get(file));
  });

  const precache = [...files.keys()].sort();
  const cacheName = 'math-garden-' + hash;
  files.set('sw.js', renderServiceWorker(cacheName, precache));
  files.set('.nojekyll', '');

  if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true, force: true });
  [...files.keys()].sort().forEach((file) => {
    const abs = path.join(DIST, file);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, files.get(file));
  });

  const bundleBytes = Buffer.byteLength(bundle, 'utf8');
  const gzipBytes = zlib.gzipSync(Buffer.from(bundle, 'utf8')).length;
  const advisory = 140 * 1024;
  console.log('Math Garden build ' + hash);
  console.log('  dist/' + bundleName + ': ' + (bundleBytes / 1024).toFixed(1) + ' KB (' +
    (gzipBytes / 1024).toFixed(1) + ' KB gzip)');
  console.log('  precache: ' + precache.length + ' files · cache ' + cacheName);
  if (gzipBytes > advisory) {
    console.warn('  ⚠ bundle gzip ' + (gzipBytes / 1024).toFixed(1) + ' KB 超過建議的 140 KB');
  }

  return { hash, bundleName, size: bundleBytes, gzipSize: gzipBytes, precache, cacheName };
}

if (require.main === module) {
  build();
}

module.exports = { build, SOURCE_SCRIPTS, ROOT_ASSETS };
