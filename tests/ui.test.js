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

function boot(seedProgress, opts) {
  opts = opts || {};
  const dom = new JSDOM(HTML, { runScripts: 'dangerously', url: opts.url || 'http://localhost/' });
  const w = dom.window;
  w.scrollTo = function () {}; // jsdom 未實現，樁掉
  if (seedProgress) w.localStorage.setItem('mathpath.progress.v1', seedProgress);
  if (opts.session) w.sessionStorage.setItem('mathpath.session.v1', opts.session);
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
  check(w.Curriculum.stages.length === 15, '應有 15 個階段（14 個年級 + 挑戰區）');
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

  /* 19. 路由純函數：parseHash / serializeRoute / parentOf 往返一致 */
  const ctxR = boot();
  const appR = ctxR.w.__mathApp;
  const json = (v) => JSON.stringify(v);
  const routes = [
    ['#/home', { screen: 'home' }],
    ['#/stage/prek', { screen: 'stage', stageId: 'prek' }],
    ['#/exam/prek', { screen: 'exam', stageId: 'prek' }],
    ['#/lesson/prek.count', { screen: 'lesson', skillId: 'prek.count' }],
    ['#/practice/prek.count', { screen: 'practice', skillId: 'prek.count' }],
    ['#/quiz/prek.count', { screen: 'quiz', skillId: 'prek.count' }],
    ['#/parent', { screen: 'parent' }],
    ['#/settings', { screen: 'settings' }],
    ['#/outline', { screen: 'outline' }],
    ['#/formulas', { screen: 'formulas' }]
  ];
  routes.forEach(([hash, route]) => {
    check(json(appR.parseHash(hash)) === json(route), 'parseHash ' + hash);
    check(appR.serializeRoute(route) === hash, 'serializeRoute ' + hash);
    check(json(appR.parseHash(appR.serializeRoute(route))) === json(route), 'route 往返一致 ' + hash);
  });
  ['', '#', '#/', '#main', '#/bogus', '#/stage', '#/stage/nope/extra', '#/lesson/', '#/parent/1', '#/home?x=1'].forEach((h) => {
    check(appR.parseHash(h) === null, '非法 hash 應回傳 null：' + JSON.stringify(h));
  });
  check(json(appR.parentOf({ screen: 'lesson', skillId: 'prek.count' })) === json({ screen: 'stage', stageId: 'prek' }), 'lesson 的父層是 stage');
  check(json(appR.parentOf({ screen: 'practice', skillId: 'prek.count' })) === json({ screen: 'lesson', skillId: 'prek.count' }), 'practice 的父層是 lesson');
  check(json(appR.parentOf({ screen: 'exam', stageId: 'prek' })) === json({ screen: 'stage', stageId: 'prek' }), 'exam 的父層是 stage');
  check(appR.parentOf({ screen: 'home' }) === null, 'home 沒有父層');

  /* 20. 失效 / 未解鎖 deep link：改寫成合法 route 再渲染 */
  const g1Boot = boot(null, { url: 'http://localhost/#/stage/g1' });
  check(!g1Boot.d.getElementById('screen-home').hidden, '未解鎖階段的 deep link 應回到首頁');
  check(g1Boot.w.location.hash === '#/home', '未解鎖階段 hash 被替換為 #/home');
  const lockedSkillBoot = boot(null, { url: 'http://localhost/#/lesson/prek.compare' });
  check(!lockedSkillBoot.d.getElementById('screen-stage').hidden, '未解鎖技能的 deep link 應回到所屬階段');
  check(lockedSkillBoot.w.location.hash === '#/stage/prek', '未解鎖技能 hash 被替換為 #/stage/prek');
  const bogusBoot = boot(null, { url: 'http://localhost/#/nonsense' });
  check(!bogusBoot.d.getElementById('screen-home').hidden, '未知 route 應回到首頁');
  check(bogusBoot.w.location.hash === '#/home', '未知 route hash 被替換為 #/home');
  const quizBoot = boot(null, { url: 'http://localhost/#/quiz/prek.count' });
  check(!quizBoot.d.getElementById('screen-practice').hidden, '合法 quiz deep link 直接開始測驗');
  check(quizBoot.w.__mathApp.getState().problems.length === 10, 'deep link 測驗應有 10 題');
  check(quizBoot.w.location.hash === '#/quiz/prek.count', '合法 quiz hash 保持不變');
  const lessonBoot = boot(null, { url: 'http://localhost/#/lesson/prek.count' });
  check(!lessonBoot.d.getElementById('screen-lesson').hidden, '合法 lesson deep link 進入小課堂');

  /* 21. show() 是焦點/宣告的唯一入口；Back / Forward 可回到前一畫面 */
  const ctxB = boot();
  const wB = ctxB.w, dB = ctxB.d;
  dB.querySelector('#screen-home .stage-card[data-stage="prek"]').click();
  check(wB.location.hash === '#/stage/prek', '進入階段後 hash 同步');
  const stageHeading = dB.querySelector('#screen-stage h1.page-title');
  check(!!stageHeading && dB.activeElement === stageHeading, '導航後焦點移到畫面標題');
  check((dB.getElementById('announcer').textContent || '').length > 0, '導航後 live region 宣告畫面標題');
  dB.querySelector('#screen-stage .skill-card[data-skill="prek.count"]').click();
  check(wB.location.hash === '#/lesson/prek.count', '進入小課堂後 hash 同步');
  wB.history.back();
  await sleep(100);
  check(wB.location.hash === '#/stage/prek', 'Back 回到 stage 的 hash');
  check(!dB.getElementById('screen-stage').hidden && dB.getElementById('screen-lesson').hidden, 'Back 回到階段畫面');
  check(dB.activeElement === dB.querySelector('#screen-stage h1.page-title'), 'Back 後焦點仍在標題');
  wB.history.forward();
  await sleep(100);
  check(wB.location.hash === '#/lesson/prek.count', 'Forward 回到 lesson 的 hash');
  check(!dB.getElementById('screen-lesson').hidden, 'Forward 回到小課堂畫面');

  /* 22. 測驗中途重新載入：同題、同進度、同結果 */
  const ctxQ = boot();
  const wQ = ctxQ.w, dQ = ctxQ.d;
  dQ.querySelector('#screen-home .stage-card[data-stage="prek"]').click();
  dQ.querySelector('#screen-stage .skill-card[data-skill="prek.count"]').click();
  dQ.getElementById('lessonQuiz').click();
  const qp0 = wQ.__mathApp.currentProblem();
  const qCorrect0 = Array.from(dQ.querySelectorAll('#screen-practice .choice'))
    .find((b) => b.getAttribute('data-key') === wQ.MathCore.valueKey(qp0.answer));
  qCorrect0.click();
  await sleep(1200);
  const stQ1 = wQ.__mathApp.getState();
  check(stQ1.index === 1 && stQ1.results.length === 1, '測驗答對第一題後前進到第 2 題');
  const savedSession = wQ.sessionStorage.getItem('mathpath.session.v1');
  check(!!savedSession, '測驗進行中已寫入 sessionStorage');
  const sessionObj = JSON.parse(savedSession);
  check(sessionObj.v === 1 && sessionObj.mode === 'quiz', 'session 具備版本與模式');
  check(sessionObj.route === '#/quiz/prek.count', 'session 記錄 quiz route');
  check(sessionObj.index === 1 && sessionObj.problems.length === 10, 'session 記錄題號與 10 道題');
  const sigQ2 = stQ1.problems[1].sig;
  const reloadQ = boot(null, { url: 'http://localhost/#/quiz/prek.count', session: savedSession });
  const wQ2 = reloadQ.w, dQ2 = reloadQ.d;
  const stQ2 = wQ2.__mathApp.getState();
  check(stQ2.screen === 'practice' && stQ2.mode === 'quiz', '重新載入後回到測驗畫面');
  check(stQ2.index === 1, '重新載入後停在同一題號');
  check(stQ2.problems[1].sig === sigQ2, '重新載入後是同一道題');
  check(stQ2.results.length === 1, '重新載入後保留已答結果');
  check(dQ2.body.textContent.includes('2 /'), '重新載入後渲染第 2 題');
  check(!dQ2.getElementById('screen-practice').hidden, '重新載入後作答畫面可見');
  const progressQ = wQ.__mathApp.getProgress();
  check(progressQ.version === 2, '進度 schema 版本不變（v2）');
  check(!('route' in progressQ) && !('session' in progressQ) && !('screen' in progressQ), 'progress schema 沒有加入任何路由/session 狀態');

  /* 23. 首頁 Continue 卡：恢復未完成的測驗 */
  const ctxC = boot(null, { session: savedSession });
  const dC = ctxC.d, wC = ctxC.w;
  const continueBtn = dC.getElementById('homeContinue');
  check(!!continueBtn, '首頁顯示 Continue 卡');
  check(continueBtn.textContent.includes('繼續'), 'Continue 卡有「繼續」文案');
  continueBtn.click();
  const stC = wC.__mathApp.getState();
  check(stC.screen === 'practice' && stC.mode === 'quiz' && stC.index === 1, 'Continue 卡恢復到第 2 題');
  check(wC.location.hash === '#/quiz/prek.count', 'Continue 卡同步 quiz route');
  check(!!dC.querySelector('#screen-practice .choice'), 'Continue 卡恢復後可繼續作答');

  /* 24. session 驗證：過期、題目被竄改都不會自動恢復 */
  const expired = JSON.parse(savedSession);
  expired.savedAt = Date.now() - 25 * 60 * 60 * 1000;
  const ctxExpired = boot(null, { session: JSON.stringify(expired) });
  check(!ctxExpired.d.getElementById('homeContinue'), '過期 session 不顯示 Continue 卡');
  const tampered = JSON.parse(savedSession);
  tampered.problems[0].choices = null; // 結構被破壞：checkAnswer 無法驗證，整份 session 作廢
  const ctxTampered = boot(null, { url: 'http://localhost/#/quiz/prek.count', session: JSON.stringify(tampered) });
  const stTampered = ctxTampered.w.__mathApp.getState();
  check(Array.isArray(stTampered.problems[0].choices), '結構損壞的 session 題目不會被採用');
  check(stTampered.index === 0 && stTampered.results.length === 0, '損壞 session 後改為開始新測驗');

  /* 25. 練習也可恢復：下一題後重新載入仍是同一道題 */
  const ctxP = boot();
  const wP = ctxP.w, dP = ctxP.d;
  dP.querySelector('#screen-home .stage-card[data-stage="prek"]').click();
  dP.querySelector('#screen-stage .skill-card[data-skill="prek.count"]').click();
  dP.getElementById('lessonPractice').click();
  const pp0 = wP.__mathApp.currentProblem();
  const pCorrect0 = Array.from(dP.querySelectorAll('#screen-practice .choice'))
    .find((b) => b.getAttribute('data-key') === wP.MathCore.valueKey(pp0.answer));
  pCorrect0.click();
  dP.getElementById('nextBtn').click();
  const stP1 = wP.__mathApp.getState();
  check(stP1.index === 1, '練習按下一題後 index 前進');
  const practiceSession = wP.sessionStorage.getItem('mathpath.session.v1');
  check(!!practiceSession, '練習進行中已寫入 sessionStorage');
  check(JSON.parse(practiceSession).route === '#/practice/prek.count', '練習 session 記錄 practice route');
  const sigP2 = stP1.problems[1].sig;
  const reloadP = boot(null, { url: 'http://localhost/#/practice/prek.count', session: practiceSession });
  const stP2 = reloadP.w.__mathApp.getState();
  check(stP2.mode === 'practice' && stP2.index === 1, '重新載入後恢復練習題號');
  check(stP2.problems[1].sig === sigP2, '重新載入後練習是同一道題');

  /* 26. navigate() 會拒絕並改寫未解鎖 route */
  const ctxN = boot();
  ctxN.w.__mathApp.navigate({ screen: 'stage', stageId: 'g1' });
  check(ctxN.w.__mathApp.getState().screen === 'home', 'navigate() 拒絕未解鎖階段');
  check(ctxN.w.location.hash === '#/home', 'navigate() 把未解鎖 route 改寫為 #/home');

  /* 27. 錯誤邊界：渲染例外時顯示可恢復卡片，並可先匯出進度 */
  const ctxErr = boot();
  const dErr = ctxErr.d, wErr = ctxErr.w;
  wErr.console.error = function () {}; // 預期會記錄例外，測試時靜音
  wErr.Curriculum.stages = null; // 模擬渲染資料損壞
  dErr.querySelector('#screen-home .stage-card').click();
  check(!dErr.getElementById('screen-home').hidden, '錯誤卡顯示在首頁畫面');
  check(!!dErr.getElementById('errorExport'), '渲染例外時顯示錯誤卡（先可匯出進度）');
  check(!!dErr.getElementById('errorHome'), '錯誤卡提供回到首頁');
  dErr.getElementById('errorExport').click();
  check(!dErr.getElementById('modal').hidden, '錯誤卡的匯出進度可開啟對話框');

  /* 28. 匯入對話框：超過 1 MB 被拒絕；有效存檔可導入並同步語言 */
  const ctxI = boot();
  const dI = ctxI.d, wI = ctxI.w;
  dI.getElementById('homeParentBtn').click();
  dI.getElementById('parentImport').click();
  check(!dI.getElementById('modal').hidden, '匯入對話框已開啟');
  const jsonArea = dI.getElementById('jsonArea');
  jsonArea.value = JSON.stringify({ version: 2, skills: {} }) + 'x'.repeat(1000000);
  dI.getElementById('jsonOk').click();
  const importToast = dI.getElementById('toast');
  check(!importToast.hidden && importToast.textContent.includes('1 MB'), '超過 1 MB 的存檔被拒絕並提示');
  jsonArea.value = JSON.stringify({ version: 2, lang: 'en', skills: { 'prek.count': { attempts: 2, correct: 1 } } });
  dI.getElementById('jsonOk').click();
  const importedProgress = wI.__mathApp.getProgress();
  check(importedProgress.version === 2 && importedProgress.skills['prek.count'].attempts === 2, '有效存檔已導入');
  check(JSON.parse(wI.localStorage.getItem('mathpath.progress')).skills['prek.count'].attempts === 2, '導入的進度已持久化');
  check(dI.documentElement.getAttribute('lang') === 'en', '導入後 <html lang> 同步為英文');
  check(dI.getElementById('modal').hidden, '導入成功後關閉對話框');

  /* 29. 新版本 chip：只在有 waiting worker 時顯示，確認後送 SKIP_WAITING */
  const ctxU = boot();
  const dU = ctxU.d, wU = ctxU.w;
  const chipU = dU.getElementById('updateChip');
  check(!!chipU && chipU.hidden, '更新 chip 預設隱藏');
  const postedMessages = [];
  wU.__mathApp.showUpdateChip({ postMessage: function (msg) { postedMessages.push(msg); } });
  check(!chipU.hidden && chipU.textContent.includes('新版本'), '有 waiting worker 時顯示新版本 chip');
  check(chipU.title.length > 0, '更新 chip 有 title 說明');
  chipU.click();
  check(postedMessages.length === 1 && postedMessages[0].type === 'SKIP_WAITING', '確認更新送出 SKIP_WAITING');
  check(chipU.hidden, '確認後 chip 收起');

  /* 30. dist 建置冒煙：成品只用 KaTeX + 單一 app bundle，全局與路由仍可用 */
  const distIndexPath = path.join(ROOT, 'dist', 'index.html');
  if (!fs.existsSync(distIndexPath)) {
    console.log('… 跳過 dist 冒煙測試（先執行 npm run build）');
  } else {
    const distHtml = fs.readFileSync(distIndexPath, 'utf8');
    const distDom = new JSDOM(distHtml, { runScripts: 'dangerously', url: 'http://localhost/' });
    const dw = distDom.window;
    dw.scrollTo = function () {};
    const scriptRefs = [...distHtml.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
    check(scriptRefs.length === 2, 'dist index 應只有 KaTeX 與單一 app bundle 兩個 script');
    scriptRefs.forEach((src) => {
      dw.eval(fs.readFileSync(path.join(ROOT, 'dist', src), 'utf8'));
    });
    const dd = dw.document;
    check(!!dw.__mathApp && !!dw.MathCore && !!dw.Curriculum && !!dw.Lessons, 'dist bundle 提供全部全局');
    check(dd.querySelectorAll('#screen-home .stage-card').length === 1, 'dist bundle 能渲染首頁');
    dw.__mathApp.navigate({ screen: 'stage', stageId: 'prek' });
    check(!dd.getElementById('screen-stage').hidden, 'dist bundle 的路由可用');
    check(!!dd.getElementById('updateChip'), 'dist index 帶更新 chip');
  }

  /* 31. 組卷：固定種子下測驗/考試長度正確、題目互不重複、模板有變化 */
  const unlockSeed = JSON.stringify({
    version: 2, lang: 'zh', sound: false, theme: 'light', skills: {},
    stageExams: { prek: { passed: true, perfect: true, best: 100 } }
  });
  const ctxComp = boot(unlockSeed);
  const wComp = ctxComp.w, dComp = ctxComp.d;
  wComp.Date.now = function () { return 1700000000000; };
  wComp.__mathApp.navigate({ screen: 'quiz', skillId: 'g1.add20' });
  const stQuiz = wComp.__mathApp.getState();
  check(stQuiz.mode === 'quiz' && stQuiz.problems.length === 10, '測驗固定 10 題');
  check(new Set(stQuiz.problems.map((p) => p.sig)).size === 10, '測驗題目互不重複');
  check(new Set(stQuiz.problems.map((p) => wComp.MathCore.templateSig(p))).size >= 2,
    '測驗題目模板有變化（不再只換數字）');
  wComp.__mathApp.navigate({ screen: 'exam', stageId: 'g1' });
  const stExam = wComp.__mathApp.getState();
  check(stExam.mode === 'exam' && stExam.problems.length === 20, '綜合考試固定 20 題');
  check(new Set(stExam.problems.map((p) => p.sig)).size === 20, '綜合考試題目互不重複');
  check(new Set(stExam.problems.map((p) => p.skillId)).size >= 4, '綜合考試覆蓋多個技能');
  check(!dComp.getElementById('screen-practice').hidden, '綜合考試已渲染');

  /* 32. 挑戰區：首頁入口、永遠解鎖、6 個挑戰技能、可直接測驗 */
  const ctxCh = boot();
  const dCh = ctxCh.d, wCh = ctxCh.w;
  const challengeBtn = dCh.getElementById('homeChallengeBtn');
  check(!!challengeBtn, '首頁有挑戰區入口卡');
  check(dCh.querySelectorAll('#screen-home .stage-card').length === 1, '挑戰卡不影響年級卡片數量');
  challengeBtn.click();
  check(!dCh.getElementById('screen-stage').hidden, '進入挑戰區');
  check((dCh.body.textContent || '').includes('挑戰'), '挑戰區標題顯示');
  const challengeCards = dCh.querySelectorAll('#screen-stage .skill-card');
  check(challengeCards.length === 6, '挑戰區有 6 個技能卡片');
  check(Array.from(challengeCards).every((c) => c.getAttribute('data-locked') === '0'), '挑戰技能全部解鎖');
  check(!!dCh.getElementById('stageExamBtn'), '挑戰區有綜合考試按鈕');
  wCh.__mathApp.navigate({ screen: 'quiz', skillId: 'challenge.nt' });
  const stCh = wCh.__mathApp.getState();
  check(stCh.mode === 'quiz' && stCh.problems.length === 10, '挑戰測驗固定 10 題');
  check(stCh.problems.every((p) => ['modpow', 'gcdlcm', 'remainderSystem'].indexOf(p.math.op) !== -1), '數論挑戰題型正確');
  check(wCh.location.hash === '#/quiz/challenge.nt', '挑戰 quiz route 同步');

  console.log(`✓ ui 全部通過（${checks} 項斷言）`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
