/* 無障礙（a11y）契約測試：node tests/a11y.test.js
 *
 * 以 jsdom 載入整個應用，逐個畫面檢查：
 *  1. 每個畫面恰好一個 h1，section 有 aria-labelledby 指向存在的標題
 *  2. 所有 button / role=switch 都有可存取名稱；整頁沒有重複 id
 *  3. 導航後焦點在畫面標題、live region 有宣告
 *  4. 對話框開啟時背景 inert + aria-hidden，關閉後還原並交還焦點
 *  5. 語言切換會同步 <html lang> 與靜態 ARIA 文案
 *  6. 題目附圖有文字替代（role="img" + aria-label）
 *  7. axe-core（限制在 jsdom 支援的規則）在 8+ 畫面上 0 violations
 */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const axeCore = require('axe-core');

const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const SCRIPTS = ['math-core.js', 'i18n.js', 'curriculum.js', 'curriculum-outline.js', 'formulas.js', 'lessons.js', 'app.js'];

let checks = 0;
function check(cond, msg) {
  checks++;
  assert.ok(cond, msg);
}

function boot(seedProgress) {
  const dom = new JSDOM(HTML, { runScripts: 'dangerously', url: 'http://localhost/' });
  const w = dom.window;
  w.scrollTo = function () {};
  if (seedProgress) w.localStorage.setItem('mathpath.progress.v1', seedProgress);
  SCRIPTS.forEach((f) => w.eval(fs.readFileSync(path.join(ROOT, f), 'utf8')));
  return { w, d: w.document };
}

function accessibleName(el) {
  const aria = el.getAttribute('aria-label');
  if (aria && aria.trim()) return aria.trim();
  const labelledby = el.getAttribute('aria-labelledby');
  if (labelledby) {
    const text = labelledby.split(/\s+/).map((id) => {
      const node = el.ownerDocument.getElementById(id);
      return node ? node.textContent : '';
    }).join(' ').trim();
    if (text) return text;
  }
  const text = (el.textContent || '').trim();
  if (text) return text;
  const title = el.getAttribute('title');
  if (title && title.trim()) return title.trim();
  const img = el.querySelector('img[alt]');
  if (img && img.getAttribute('alt').trim()) return img.getAttribute('alt').trim();
  return '';
}

function visibleScreen(d) {
  return [...d.querySelectorAll('main .screen')].find((s) => !s.hidden) || null;
}

const ROUTES = [
  ['home', null, 'home'],
  ['stage', { screen: 'stage', stageId: 'prek' }, 'stage'],
  ['lesson', { screen: 'lesson', skillId: 'prek.count' }, 'lesson'],
  ['challenge', { screen: 'stage', stageId: 'challenge' }, 'stage'],
  ['challenge-quiz', { screen: 'quiz', skillId: 'challenge.nt' }, 'practice'],
  ['practice', { screen: 'practice', skillId: 'prek.count' }, 'practice'],
  ['quiz', { screen: 'quiz', skillId: 'prek.count' }, 'practice'],
  ['exam', { screen: 'exam', stageId: 'prek' }, 'practice'],
  ['parent', { screen: 'parent' }, 'parent'],
  ['settings', { screen: 'settings' }, 'settings'],
  ['outline', { screen: 'outline' }, 'outline'],
  ['formulas', { screen: 'formulas' }, 'formulas']
];

async function main() {
  /* ---------------- 1–6：結構、名稱、焦點、對話框、語言、附圖 ---------------- */
  const ctx = boot();
  const w = ctx.w, d = ctx.d;
  const app = w.__mathApp;
  w.Date.now = function () { return 1700000000000; };

  check(d.querySelectorAll('h1').length === 1, '初始文件只有一個 h1（主內容標題）');
  check(d.querySelector('#topbarTitle').tagName === 'H2', '頂欄標題是 heading（h2）');

  let lastAnnouncement = '';
  for (const [name, route, expected] of ROUTES) {
    if (route) app.navigate(route);
    const screen = visibleScreen(d);
    check(!!screen, name + '：應有可見畫面');
    if (!screen) continue;
    check(screen.id === 'screen-' + expected, name + '：可見畫面 id 正確，得到 ' + screen.id);

    const h1s = screen.querySelectorAll('h1');
    check(h1s.length === 1, name + '：畫面恰好一個 h1，得到 ' + h1s.length);
    const labelId = screen.getAttribute('aria-labelledby');
    check(!!labelId && !!d.getElementById(labelId), name + '：aria-labelledby 指向存在的標題');
    if (h1s.length === 1) {
      check(d.activeElement === h1s[0], name + '：導航後焦點在畫面 h1');
      check(h1s[0].textContent.trim().length > 0, name + '：h1 有文字');
    }

    const ids = [...d.querySelectorAll('[id]')].map((el) => el.id);
    check(new Set(ids).size === ids.length, name + '：整頁沒有重複 id');

    const interactive = [...d.querySelectorAll('button, [role="switch"]')].filter((el) => {
      if (el.hidden) return false;
      if (el.closest('[hidden]')) return false;
      if (el.closest('[aria-hidden="true"]')) return false;
      return true;
    });
    interactive.forEach((el) => {
      check(accessibleName(el).length > 0, name + '：可互動元素缺可存取名稱 <' + el.tagName.toLowerCase() + ' id=' + (el.id || '?') + '>');
    });

    const announcer = d.getElementById('announcer');
    check(announcer.textContent.trim().length > 0, name + '：live region 有宣告');
    if (name !== 'home') check(announcer.textContent !== lastAnnouncement, name + '：live region 文字有更新');
    lastAnnouncement = announcer.textContent;
  }

  /* 練習畫面附圖有文字替代 */
  app.navigate({ screen: 'practice', skillId: 'prek.count' });
  const visual = d.getElementById('qVisual');
  check(!!visual && visual.getAttribute('role') === 'img', '練習附圖 role="img"');
  check((visual.getAttribute('aria-label') || '').trim().length > 0, '練習附圖有 aria-label 文字替代');
  check(/\d/.test(visual.getAttribute('aria-label')), '數圓點附圖的文字替代包含數量');

  /* 對話框：背景 inert + aria-hidden、Esc 關閉、焦點還原 */
  app.navigate({ screen: 'parent' });
  const resetBtn = d.getElementById('parentReset');
  resetBtn.focus();
  resetBtn.click();
  const modal = d.getElementById('modal');
  check(!modal.hidden, '對話框已開啟');
  check(d.getElementById('main').hasAttribute('inert'), '對話框開啟時主內容 inert');
  check(d.getElementById('topbar').hasAttribute('inert'), '對話框開啟時頂欄 inert');
  check(d.getElementById('main').getAttribute('aria-hidden') === 'true', '主內容 aria-hidden');
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
  check(modal.hidden, 'Esc 關閉對話框');
  check(!d.getElementById('main').hasAttribute('inert'), '關閉後主內容解除 inert');
  check(!d.getElementById('main').hasAttribute('aria-hidden'), '關閉後主內容移除 aria-hidden');
  check(d.activeElement === resetBtn, '關閉後焦點交還開啟者');

  /* 語言切換同步靜態 ARIA 文案 */
  check(d.documentElement.getAttribute('lang') === 'zh-Hant-HK', '預設 <html lang="zh-Hant-HK">');
  const skip = d.getElementById('skipLink');
  check(skip.textContent.includes('跳至'), '中文 skip link 文案');
  d.getElementById('langBtn').click();
  check(d.documentElement.getAttribute('lang') === 'en', '切英文後 <html lang="en">');
  check(skip.textContent.toLowerCase().includes('skip'), '英文 skip link 文案');
  check(d.getElementById('backBtn').getAttribute('aria-label') === 'Back', '英文返回按鈕名稱');
  d.getElementById('langBtn').click();
  check(skip.textContent.includes('跳至'), '切回中文後 skip link 還原');

  /* 結果畫面也是一個 h1 畫面 */
  const ctx2 = boot();
  const w2 = ctx2.w, d2 = ctx2.d;
  const st = w2.__mathApp.getState();
  st.examStage = 'prek';
  st.mode = 'exam';
  st.quizStart = Date.now();
  st.results = [];
  for (let i = 0; i < 20; i++) st.results.push({ correct: true });
  w2.__mathApp.finishExam();
  const resultScreen = visibleScreen(d2);
  check(!!resultScreen && resultScreen.querySelectorAll('h1').length === 1, '考試結果畫面恰好一個 h1');
  check((d2.getElementById('announcer').textContent || '').includes('模擬試卷'), '考試結果有 live region 宣告');

  /* ---------------- 7：axe-core（jsdom 可支援的規則） ---------------- */
  const AXE_RULES = [
    'aria-command-name', 'aria-hidden-focus', 'aria-input-field-name', 'aria-prohibited-attr',
    'aria-required-attr', 'aria-required-children', 'aria-required-parent', 'aria-roles',
    'aria-toggle-field-name', 'aria-valid-attr', 'aria-valid-attr-value',
    'button-name', 'duplicate-id', 'duplicate-id-aria', 'empty-heading', 'image-alt',
    'label', 'link-name', 'page-has-heading-one', 'role-img-alt'
  ];
  w.eval(axeCore.source);
  check(!!w.axe && typeof w.axe.run === 'function', 'axe-core 已注入');
  const axeViolations = [];
  for (const [name, route] of ROUTES) {
    if (route) app.navigate(route);
    const res = await w.axe.run(d, { runOnly: { type: 'rule', values: AXE_RULES } });
    res.violations.forEach((v) => {
      axeViolations.push(name + ':' + v.id + '(' + v.impact + ')×' + v.nodes.length);
    });
  }
  check(axeViolations.length === 0, 'axe 應 0 violations，得到：' + axeViolations.join(', '));

  console.log('✓ a11y 全部通過（' + checks + ' 項斷言，' + (ROUTES.length + 1) + ' 個畫面）');
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
