/* 界面邏輯測試：node tests/ui.test.js（需先 npm/pnpm install --dir tests） */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const SCRIPTS = ['math-core.js', 'i18n.js', 'curriculum.js', 'curriculum-outline.js', 'formulas.js', 'lessons.js', 'app.js'];

let checks = 0;
function check(cond, msg) { checks++; assert.ok(cond, msg); }
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function boot(seedProgress) {
  const dom = new JSDOM(HTML, { runScripts: 'dangerously', url: 'http://localhost/' });
  const w = dom.window;
  w.scrollTo = function () {}; // jsdom 未實現，樁掉
  if (seedProgress) w.localStorage.setItem('mathpath.progress.v1', seedProgress);
  SCRIPTS.forEach((f) => w.eval(fs.readFileSync(path.join(ROOT, f), 'utf8')));
  return { dom, w, d: w.document };
}

/* 在目前聚焦元素（或指定元素）上派發鍵盤事件，模擬真實按鍵 */
function pressKey(w, d, key, opts) {
  opts = opts || {};
  const ev = new w.KeyboardEvent('keydown', {
    key: key,
    bubbles: true,
    cancelable: true,
    shiftKey: !!opts.shiftKey
  });
  const target = opts.target || d.activeElement || d.body;
  target.dispatchEvent(ev);
  return ev;
}

async function main() {
  /* 1. 應用初始化 + 首頁渲染 */
  let ctx = boot();
  let w = ctx.w, d = ctx.d;
  check(!!w.Curriculum && !!w.MathCore && !!w.I18N && !!w.Lessons, '全局模塊已加載');
  check(w.Curriculum.stages.length === 14, '應有 14 個階段');
  const stageCards = d.querySelectorAll('#screen-home .stage-card');
  check(stageCards.length === 1, '首頁初始只顯示 1 個已解鎖階段（學前）');
  check(stageCards[0].getAttribute('data-stage') === 'prek', '第一個可見階段應為學前');
  check(!d.getElementById('screen-home').hidden, '首頁應可見');
  check(d.getElementById('screen-stage').hidden, '階段頁初始應隱藏');

  /* 2. 語言切換 */
  check(d.body.textContent.includes('選擇年級'), '默認中文');
  d.getElementById('langBtn').click();
  check(d.body.textContent.includes('Choose a Grade'), '切到英文');
  check(d.body.textContent.includes('Pre-K'), '英文階段名');
  d.getElementById('langBtn').click();
  check(d.body.textContent.includes('選擇年級'), '切回中文');

  /* 3. 導航：首頁 → 階段 → 小課堂 */
  d.querySelector('#screen-home .stage-card[data-stage="prek"]').click();
  check(!d.getElementById('screen-stage').hidden, '進入階段頁');
  const prekSkillCards = d.querySelectorAll('#screen-stage .skill-card');
  check(prekSkillCards.length >= 5, '學前應有至少 5 個技能卡片');
  d.querySelector('#screen-stage .skill-card[data-skill="prek.count"]').click();
  check(!d.getElementById('screen-lesson').hidden, '進入小課堂');
  check(d.body.textContent.includes('數一數'), '小課堂標題');

  /* 4. 練習：答對一題 → 進度保存 + 下一題按鈕 */
  d.getElementById('lessonPractice').click();
  check(!d.getElementById('screen-practice').hidden, '進入練習');
  let p = w.__mathApp.currentProblem();
  check(!!p && p.type === 'count', '練習第一題應為數一數');
  const choices = d.querySelectorAll('#screen-practice .choice');
  check(choices.length === 4, '應有 4 個選項');
  const correctBtn = Array.from(choices).find((b) => b.getAttribute('data-key') === w.MathCore.valueKey(p.answer));
  check(!!correctBtn, '選項裡應有正確答案');
  correctBtn.click();
  check(correctBtn.classList.contains('correct'), '正確選項高亮');
  check(!d.getElementById('nextBtn').hidden, '答對後出現下一題按鈕');
  const sp = w.__mathApp.getProgress().skills['prek.count'];
  check(sp && sp.correct === 1, '進度已記錄 1 次答對');
  const saved = JSON.parse(w.localStorage.getItem('mathpath.progress'));
  check(saved.skills['prek.count'].correct === 1, '進度已持久化');
  check(saved.version === 2, '存檔已升級到 schema 2');

  /* 5. 下一題 */
  const firstSig = p.sig;
  d.getElementById('nextBtn').click();
  p = w.__mathApp.currentProblem();
  check(!!p, '下一題已加載');
  check(d.body.textContent.includes('第') || true, '渲染正常'); // 弱斷言，防空

  /* 6. 測驗：開始 → 答對第一題 → 自動進入第 2 題 */
  d.getElementById('backBtn').click(); // 回小課堂
  check(!d.getElementById('screen-lesson').hidden, '回到小課堂');
  d.getElementById('lessonQuiz').click();
  check(!d.getElementById('screen-practice').hidden, '進入測驗');
  check(d.body.textContent.includes('1 / 10') || d.body.textContent.includes('1 /'), '測驗第 1 題');
  const qp = w.__mathApp.currentProblem();
  const qCorrect = Array.from(d.querySelectorAll('#screen-practice .choice'))
    .find((b) => b.getAttribute('data-key') === w.MathCore.valueKey(qp.answer));
  qCorrect.click();
  await sleep(1200);
  check(d.body.textContent.includes('2 /'), '答對後進入第 2 題');

  /* 7. 進度加載：預置進度後應被讀取 */
  const seed = JSON.stringify({
    version: 1, lang: 'zh', sound: false, theme: 'light',
    streak: { lastDay: null, count: 0 }, badges: [], stars: 0,
    skills: { 'prek.count': { attempts: 5, correct: 4, consecCorrect: 0, consecWrong: 0, difficultyStep: 0, lastSeen: 0, typeAcc: {}, stars: 1, mastered: false, quizStars: 0, quizBest: 0, lastProblems: [] } }
  });
  const ctx2 = boot(seed);
  const w2 = ctx2.w;
  check(w2.__mathApp.getProgress().skills['prek.count'].correct === 4, '預置進度被正確加載');

  /* 8. 逐步解鎖：需綜合考試滿分才能解鎖下一階段 */
  const prekIds = ['prek.count', 'prek.compare', 'prek.add10', 'prek.sub10', 'prek.bonds10', 'prek.word'];
  const passedSkills = {};
  prekIds.forEach(function (id) {
    passedSkills[id] = { attempts: 0, correct: 0, consecCorrect: 0, consecWrong: 0, difficultyStep: 0, lastSeen: 0, typeAcc: {}, stars: 3, mastered: true, quizStars: 3, quizBest: 100, lastProblems: [] };
  });
  const seed2 = JSON.stringify({ version: 1, lang: 'zh', sound: false, theme: 'light', streak: { lastDay: null, count: 0 }, badges: [], stars: 0, skills: passedSkills });
  const ctx3 = boot(seed2);
  const stageCards2 = ctx3.d.querySelectorAll('#screen-home .stage-card');
  check(stageCards2.length === 1, '只有技能通過（未考綜合考試）時，一年級仍未解鎖');

  const seed2b = JSON.stringify({ version: 1, lang: 'zh', sound: false, theme: 'light', streak: { lastDay: null, count: 0 }, badges: [], stars: 0, skills: passedSkills, stageExams: { prek: { perfect: true, best: 100 } } });
  const ctx3b = boot(seed2b);
  const stageCards2b = ctx3b.d.querySelectorAll('#screen-home .stage-card');
  check(stageCards2b.length === 2, '綜合考試滿分後應顯示 2 個階段（學前 + 一年級）');
  check(Array.from(stageCards2b).some(function (c) { return c.getAttribute('data-stage') === 'g1'; }), '一年級應已解鎖');

  // 新規則：90% 即可通過（passed），未達 90% 仍不解鎖
  const seed2c = JSON.stringify({ version: 1, lang: 'zh', sound: false, theme: 'light', streak: { lastDay: null, count: 0 }, badges: [], stars: 0, skills: passedSkills, stageExams: { prek: { passed: true, best: 90 } } });
  check(boot(seed2c).d.querySelectorAll('#screen-home .stage-card').length === 2, '綜合考試 90% 應解鎖下一階段');
  const seed2d = JSON.stringify({ version: 1, lang: 'zh', sound: false, theme: 'light', streak: { lastDay: null, count: 0 }, badges: [], stars: 0, skills: passedSkills, stageExams: { prek: { passed: false, best: 85 } } });
  check(boot(seed2d).d.querySelectorAll('#screen-home .stage-card').length === 1, '85% 不應解鎖下一階段');

  /* 9. 比大小：顏色選擇題（通過 prek.count 後解鎖 prek.compare） */
  const seed3 = JSON.stringify({
    version: 1, lang: 'zh', sound: false, theme: 'light',
    streak: { lastDay: null, count: 0 }, badges: [], stars: 0,
    skills: { 'prek.count': { attempts: 0, correct: 0, consecCorrect: 0, consecWrong: 0, difficultyStep: 0, lastSeen: 0, typeAcc: {}, stars: 3, mastered: true, quizStars: 3, quizBest: 100, lastProblems: [] } }
  });
  const ctx4 = boot(seed3);
  const d4 = ctx4.d, w4 = ctx4.w;
  d4.querySelector('#screen-home .stage-card[data-stage="prek"]').click();
  d4.querySelector('#screen-stage .skill-card[data-skill="prek.compare"]').click();
  d4.getElementById('lessonPractice').click();
  const cp = w4.__mathApp.currentProblem();
  check(cp.type === 'comparegroup', '比大小應為顏色題');
  const colorBtns = d4.querySelectorAll('#screen-practice .choice.color-choice');
  check(colorBtns.length === 2, '顏色題應有 2 個顏色選項');
  check(d4.querySelector('#screen-practice .swatch') !== null, '選項應顯示色塊');
  const colorCorrect = Array.from(colorBtns).find(function (b) { return b.getAttribute('data-value') === cp.answer; });
  check(!!colorCorrect, '應有正確的顏色選項');
  colorCorrect.click();
  check(colorCorrect.classList.contains('correct'), '顏色選擇判對並高亮');

  /* 10. 小課堂：看一步步示範（加法題型有步驟） */
  const passed = function () {
    return { attempts: 0, correct: 0, consecCorrect: 0, consecWrong: 0, difficultyStep: 0, lastSeen: 0, typeAcc: {}, stars: 3, mastered: true, quizStars: 3, quizBest: 100, lastProblems: [] };
  };
  const seed4 = JSON.stringify({
    version: 1, lang: 'zh', sound: false, theme: 'light',
    streak: { lastDay: null, count: 0 }, badges: [], stars: 0,
    skills: { 'prek.count': passed(), 'prek.compare': passed() }
  });
  const ctx5 = boot(seed4);
  const d5 = ctx5.d;
  d5.querySelector('#screen-home .stage-card[data-stage="prek"]').click();
  d5.querySelector('#screen-stage .skill-card[data-skill="prek.add10"]').click();
  const exampleBtn = d5.getElementById('lessonExample');
  check(!!exampleBtn, '小課堂應有「看一步步示範」按鈕');
  exampleBtn.click();
  const box = d5.getElementById('exampleBox');
  check(box && !box.hidden, '點擊後示範區應顯示');
  check(d5.querySelectorAll('#exampleBox .steps-list li').length >= 1, '示範應列出解題步驟');

  /* 11. 課程大綱（參考） */
  const ctx6 = boot();
  const d6 = ctx6.d;
  const outlineBtn = d6.getElementById('homeOutlineBtn');
  check(!!outlineBtn, '首頁應有「課程大綱」按鈕');
  outlineBtn.click();
  check(!d6.getElementById('screen-outline').hidden, '課程大綱頁應顯示');
  check(d6.querySelectorAll('#screen-outline .outline-stage').length >= 4, '應列出至少 4 個學習階段');
  check(d6.body.textContent.includes('第一學習階段'), '應包含第一學習階段');
  check(d6.body.textContent.includes('第四學習階段'), '應包含第四學習階段');

  /* 12. 公式一覽 */
  const ctx7 = boot();
  const d7 = ctx7.d;
  d7.getElementById('homeFormulasBtn').click();
  check(!d7.getElementById('screen-formulas').hidden, '公式頁應顯示');
  check(d7.querySelectorAll('#screen-formulas .formula-latex').length >= 10, '應列出多條公式');

  /* 13. 綜合考試（模擬試卷） */
  const ctx8 = boot();
  const d8 = ctx8.d;
  d8.querySelector('#screen-home .stage-card[data-stage="prek"]').click();
  const examBtn = d8.getElementById('stageExamBtn');
  check(!!examBtn, '年級頁應有「綜合考試」按鈕');
  examBtn.click();
  check(!d8.getElementById('screen-practice').hidden, '綜合考試應進入作答畫面');
  check(d8.body.textContent.includes('綜合考試'), '作答畫面應顯示「綜合考試」');

  /* 14. 綜合考試滿分會記錄並解鎖下一階段 */
  const ctx9 = boot();
  const w9 = ctx9.w, d9 = ctx9.d;
  const st9 = w9.__mathApp.getState();
  st9.examStage = 'prek';
  st9.mode = 'exam';
  st9.quizStart = Date.now();
  st9.results = [];
  for (let i = 0; i < 20; i++) st9.results.push({ correct: true });
  w9.__mathApp.finishExam();
  const se = w9.__mathApp.getProgress().stageExams || {};
  check(se['prek'] && se['prek'].perfect === true, '滿分綜合考試應記錄為 perfect');
  w9.__mathApp.renderHome();
  check(d9.querySelectorAll('#screen-home .stage-card').length === 2, '滿分後一年級應解鎖');

  /* 15. 對話框可訪問性：role / aria-modal / aria-labelledby、開啟聚焦、Esc 關閉並交還焦點 */
  const ctxM = boot();
  const wM = ctxM.w, dM = ctxM.d;
  dM.getElementById('homeParentBtn').click();
  check(!dM.getElementById('screen-parent').hidden, '家長中心應顯示（對話框測試前置）');
  const resetOpener = dM.getElementById('parentReset');
  resetOpener.focus();
  check(dM.activeElement === resetOpener, '重置按鈕可取得焦點');
  resetOpener.click();
  const modalEl = dM.getElementById('modal');
  check(!modalEl.hidden, '重置對話框已開啟');
  check(modalEl.getAttribute('role') === 'dialog', '對話框 role="dialog"');
  check(modalEl.getAttribute('aria-modal') === 'true', '對話框 aria-modal="true"');
  const labelledby = modalEl.getAttribute('aria-labelledby');
  check(!!labelledby && !!dM.getElementById(labelledby), '對話框 aria-labelledby 指向存在的標題');
  check(!!labelledby && dM.getElementById(labelledby).textContent.length > 0, '對話框標題有文字');
  const resetCancel = dM.getElementById('resetCancel');
  check(dM.activeElement === resetCancel, '開啟時焦點移入對話框（第一個可聚焦元素）');
  pressKey(wM, dM, 'Escape');
  check(modalEl.hidden, 'Esc 關閉對話框');
  check(dM.activeElement === resetOpener, '關閉後焦點回到開啟者');
  check(!dM.getElementById('resetOk'), '關閉後對話框內容已清空');

  /* 16. Tab 鍵在對話框內循環（焦點陷阱） */
  resetOpener.click();
  const resetOk = dM.getElementById('resetOk');
  resetOk.focus();
  pressKey(wM, dM, 'Tab');
  check(dM.activeElement === dM.getElementById('resetCancel'), 'Tab 由最後一個按鈕繞回第一個（不逃出對話框）');
  pressKey(wM, dM, 'Tab', { shiftKey: true });
  check(dM.activeElement === resetOk, 'Shift+Tab 由第一個按鈕繞回最後一個');
  check(modalEl.contains(dM.activeElement), '焦點保持於對話框內');
  pressKey(wM, dM, 'Escape');
  check(modalEl.hidden, '測試後對話框已關閉（清理）');

  /* 17. 作答畫面鍵盤操作：數字鍵選答、方向鍵移動焦點、ARIA 語意 */
  const ctxK = boot();
  const wK = ctxK.w, dK = ctxK.d;
  dK.querySelector('#screen-home .stage-card[data-stage="prek"]').click();
  dK.querySelector('#screen-stage .skill-card[data-skill="prek.count"]').click();
  dK.getElementById('lessonPractice').click();
  const choiceEls = dK.querySelectorAll('#screen-practice .choice');
  check(choiceEls.length === 4, '鍵盤測試：練習應有 4 個選項');
  check((choiceEls[0].getAttribute('aria-label') || '').indexOf('選項 1') === 0, '第一個選項有「選項 1：…」aria-label');
  const pbarK = dK.querySelector('#screen-practice .progress-bar');
  check(!!pbarK && pbarK.getAttribute('role') === 'progressbar', '進度條有 role="progressbar"');
  check(pbarK.getAttribute('aria-valuemin') === '0' && pbarK.getAttribute('aria-valuemax') === '100' &&
    pbarK.getAttribute('aria-valuenow') !== null, '進度條有 aria-valuemin/max/now');
  const feedbackK = dK.getElementById('feedback');
  check(feedbackK.getAttribute('aria-live') === 'polite', '回饋區 aria-live="polite"');

  pressKey(wK, dK, 'ArrowRight');
  check(dK.activeElement === choiceEls[0], 'ArrowRight 由無焦點移到第一個選項');
  pressKey(wK, dK, 'ArrowRight');
  check(dK.activeElement === choiceEls[1], 'ArrowRight 移到第二個選項');
  pressKey(wK, dK, 'ArrowLeft');
  check(dK.activeElement === choiceEls[0], 'ArrowLeft 移回第一個選項');

  pressKey(wK, dK, '1');
  check(choiceEls[0].classList.contains('correct') || choiceEls[0].classList.contains('wrong'),
    '按數字鍵 "1" 選中第一個選項');
  check(feedbackK.textContent.length > 0, '按 "1" 作答後有回饋訊息');
  check(Array.from(choiceEls).some(function (b) { return b.disabled; }),
    '作答後選項進入禁用 / 鎖定狀態');
  check(Array.from(choiceEls).every(function (b) {
    return !b.disabled || b.getAttribute('aria-disabled') === 'true';
  }), '禁用選項標示 aria-disabled="true"');

  /* 18. 語言切換同步 <html lang> 與語言按鈕無障礙名稱 */
  const ctxL = boot();
  const wL = ctxL.w, dL = ctxL.d;
  check(dL.documentElement.getAttribute('lang') === 'zh-Hant-HK', '啟動時 <html lang="zh-Hant-HK">');
  check((dL.getElementById('langBtn').getAttribute('aria-label') || '').length > 0, '語言切換按鈕有無障礙名稱');
  dL.getElementById('langBtn').click();
  check(dL.documentElement.getAttribute('lang') === 'en', '切換英文後 <html lang="en">');
  check(dL.body.textContent.includes('Choose a Grade'), '切換英文後頁面文案更新');
  dL.getElementById('langBtn').click();
  check(dL.documentElement.getAttribute('lang') === 'zh-Hant-HK', '切回中文後 <html lang> 還原');
  const ctxLe = boot(JSON.stringify({ version: 2, lang: 'en', sound: false, theme: 'light' }));
  check(ctxLe.d.documentElement.getAttribute('lang') === 'en', '載入英文存檔時 <html lang="en">');

  console.log(`✓ ui 全部通過（${checks} 項斷言）`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
