/* 效能預算測試：node tests/perf.test.js
 * 目的不是追求絕對時間（CI 機器差異大），而是防止回歸：
 * - 引擎單題/組卷/考試生成 p95
 * - jsdom 開機 + 主要路線渲染
 * - 交付體積（bundle gzip、SW precache 總大小）
 * 預算刻意比本機實測寬鬆 3–8 倍，避免 CI 抖動造成假失敗。 */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const zlib = require('zlib');
const { performance } = require('perf_hooks');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const SCRIPTS = ['math-core.js', 'i18n.js', 'curriculum.js', 'curriculum-outline.js', 'formulas.js', 'lessons.js', 'app.js'];

let checks = 0;
function check(cond, msg) { checks++; assert.ok(cond, msg); }
function p95(values) {
  const sorted = values.slice().sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1)];
}
function ms(fn, n) {
  fn(0); // warmup
  const samples = [];
  for (let i = 0; i < n; i++) {
    const t0 = performance.now();
    fn(i);
    samples.push(performance.now() - t0);
  }
  return { p95: p95(samples), median: samples.slice().sort((a, b) => a - b)[Math.floor(n / 2)], max: Math.max.apply(null, samples) };
}

const ctx = {};
vm.createContext(ctx);
ctx.window = ctx;
ctx.globalThis = ctx;
['curriculum.js', 'lessons.js', 'i18n.js', 'formulas.js'].forEach((f) => {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
});
const M = require('../math-core.js');
const C = ctx.Curriculum;
const skills = Object.values(C.skills).filter((s) => !s.scaffold && (s.types || []).length);

function loadAppScript(w) {
  /* Phase 5：優先載入建置後的單一 IIFE（dist/app.<hash>.js）；未建置時才退回 7 個 root wrappers。 */
  const distIndex = path.join(ROOT, 'dist', 'index.html');
  if (fs.existsSync(distIndex)) {
    const m = fs.readFileSync(distIndex, 'utf8').match(/src="(app\.[0-9a-f]+\.js)"/);
    if (m && fs.existsSync(path.join(ROOT, 'dist', m[1]))) {
      w.eval(fs.readFileSync(path.join(ROOT, 'dist', m[1]), 'utf8'));
      return;
    }
  }
  loadAppScript(w);
}
function boot() {
  const dom = new JSDOM(HTML, { runScripts: 'dangerously', url: 'http://localhost/' });
  const w = dom.window;
  w.scrollTo = function () {};
  loadAppScript(w);
  return { w, d: w.document };
}

/* ---------------- 1. 引擎生成 p95 ---------------- */
(() => {
  /* 先攤平 (skill, type) 清單，避免生成過程共用 index 造成抖動 */
  const cases = [];
  skills.forEach((skill) => {
    skill.types.forEach((t) => cases.push({ skill: skill, type: typeof t === 'string' ? t : t.t }));
  });
  let ci = 0;
  const gen = ms((i) => {
    const item = cases[(ci++) % cases.length];
    M.generateProblem(item.skill, {
      type: item.type,
      seed: 9000 + i,
      difficultyStep: i % Math.max(1, Math.min(3, (item.skill.levels || []).length))
    });
  }, 800);
  check(gen.p95 < 30, 'generateProblem p95 應 < 30 ms，實際 ' + gen.p95.toFixed(2));
  check(gen.median < 10, 'generateProblem median 應 < 10 ms，實際 ' + gen.median.toFixed(2));

  const setRes = ms((i) => {
    const skill = skills[i % skills.length];
    M.generateSet(skill, 20, { seed: 5000 + i });
  }, 60);
  check(setRes.p95 < 200, 'generateSet(20) p95 應 < 200 ms，實際 ' + setRes.p95.toFixed(1));

  const examRes = ms((i) => {
    M.composeExam(skills.slice(0, 12), 20, { seed: 7000 + i, maxPerSkill: 3 });
  }, 40);
  check(examRes.p95 < 400, 'composeExam(20) p95 應 < 400 ms，實際 ' + examRes.p95.toFixed(1));
  console.log('  engine: generateProblem p95 ' + gen.p95.toFixed(2) + ' ms · generateSet(20) p95 ' + setRes.p95.toFixed(1) + ' ms · composeExam(20) p95 ' + examRes.p95.toFixed(1) + ' ms');
})();

/* ---------------- 2. jsdom 開機與路線渲染 ---------------- */
(() => {
  const boots = [];
  for (let i = 0; i < 8; i++) {
    const t0 = performance.now();
    boot();
    boots.push(performance.now() - t0);
  }
  const bootP95 = p95(boots);
  check(bootP95 < 5000, 'jsdom 開機 p95 應 < 5000 ms，實際 ' + bootP95.toFixed(0));
  check(boots[boots.length - 1] < 8000, 'jsdom 開機應 < 8000 ms，實際 ' + boots[boots.length - 1].toFixed(0));

  const seed = JSON.stringify({
    version: 2, lang: 'zh', sound: false, theme: 'light', skills: {},
    stageExams: {
      prek: { passed: true }, g1: { passed: true }, g2: { passed: true }, g3: { passed: true },
      g4: { passed: true }, g5: { passed: true }, g6: { passed: true }
    }
  });
  const dom = new JSDOM(HTML, { runScripts: 'dangerously', url: 'http://localhost/' });
  const w = dom.window, d = w.document;
  w.scrollTo = function () {};
  w.localStorage.setItem('mathpath.progress.v1', seed);
  loadAppScript(w);
  const routes = [
    { screen: 'home' },
    { screen: 'stage', stageId: 'g6' },
    { screen: 'lesson', skillId: 'g6.equation' },
    { screen: 'practice', skillId: 'g6.equation' },
    { screen: 'quiz', skillId: 'g6.equation' },
    { screen: 'exam', stageId: 'g6' },
    { screen: 'stage', stageId: 'challenge' },
    { screen: 'lesson', skillId: 'challenge.nt' },
    { screen: 'practice', skillId: 'challenge.nt' },
    { screen: 'parent' },
    { screen: 'settings' },
    { screen: 'outline' },
    { screen: 'formulas' }
  ];
  const routeTimes = [];
  routes.forEach((route) => {
    const t0 = performance.now();
    w.__mathApp.navigate(route);
    routeTimes.push(performance.now() - t0);
    const screenId = (route.screen === 'quiz' || route.screen === 'exam') ? 'practice' : route.screen;
    check(!d.getElementById('screen-' + screenId).hidden, '路線應渲染：' + route.screen);
  });
  const routeP95 = p95(routeTimes);
  check(routeP95 < 2000, 'jsdom 路線渲染 p95 應 < 2000 ms，實際 ' + routeP95.toFixed(0));
  check(routeTimes.reduce((a, b) => a + b, 0) < 6000, '13 個路線總渲染應 < 6000 ms，實際 ' + routeTimes.reduce((a, b) => a + b, 0).toFixed(0));
  console.log('  render: jsdom boot p95 ' + bootP95.toFixed(0) + ' ms · route render p95 ' + routeP95.toFixed(0) + ' ms · 13 routes ' + routeTimes.reduce((a, b) => a + b, 0).toFixed(0) + ' ms');
})();

/* ---------------- 3. 交付體積 ---------------- */
(() => {
  const idx = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
  const m = idx.match(/(app\.[0-9a-f]+\.js)/);
  check(!!m, 'dist/index.html 應引用 hashed bundle');
  const bundlePath = path.join(DIST, m[1]);
  const gzip = zlib.gzipSync(fs.readFileSync(bundlePath)).length;
  check(gzip <= 150 * 1024, 'bundle gzip 應 ≤ 150 KB，實際 ' + (gzip / 1024).toFixed(1) + ' KB');

  const sw = fs.readFileSync(path.join(DIST, 'sw.js'), 'utf8');
  const assets = [...sw.matchAll(/'\.\/([^']+)'/g)].map((x) => x[1]);
  check(assets.length >= 20, 'SW precache 清單應有 20+ 資產，實際 ' + assets.length);
  const total = assets.reduce((sum, rel) => {
    const abs = path.join(DIST, rel);
    if (!fs.existsSync(abs)) throw new Error('precache 資產不存在：' + rel);
    return sum + fs.statSync(abs).size;
  }, 0);
  check(total <= 1.2 * 1024 * 1024, 'precache 總大小應 ≤ 1.2 MB，實際 ' + (total / 1024 / 1024).toFixed(2) + ' MB');
  check(total > 0, 'precache 總大小應 > 0');

  console.log('  bundle gzip ' + (gzip / 1024).toFixed(1) + ' KB · precache ' + (total / 1024 / 1024).toFixed(2) + ' MB · ' + assets.length + ' assets');
})();

console.log(`✓ 效能預算全部通過（${checks} 項檢查）`);
