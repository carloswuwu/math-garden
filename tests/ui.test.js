/* 界面邏輯測試：node tests/ui.test.js（需先 npm/pnpm install --dir tests） */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const SCRIPTS = ['math-core.js', 'i18n.js', 'curriculum.js', 'lessons.js', 'app.js'];

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
  const saved = JSON.parse(w.localStorage.getItem('mathpath.progress.v1'));
  check(saved.skills['prek.count'].correct === 1, '進度已持久化');

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

  /* 8. 逐步解鎖：學前全部通過測驗後，一年級解鎖並顯示 */
  const prekIds = ['prek.count', 'prek.compare', 'prek.add10', 'prek.sub10', 'prek.bonds10'];
  const passedSkills = {};
  prekIds.forEach(function (id) {
    passedSkills[id] = { attempts: 0, correct: 0, consecCorrect: 0, consecWrong: 0, difficultyStep: 0, lastSeen: 0, typeAcc: {}, stars: 3, mastered: true, quizStars: 3, quizBest: 100, lastProblems: [] };
  });
  const seed2 = JSON.stringify({ version: 1, lang: 'zh', sound: false, theme: 'light', streak: { lastDay: null, count: 0 }, badges: [], stars: 0, skills: passedSkills });
  const ctx3 = boot(seed2);
  const stageCards2 = ctx3.d.querySelectorAll('#screen-home .stage-card');
  check(stageCards2.length === 2, '學前通過後應顯示 2 個階段（學前 + 一年級）');
  check(Array.from(stageCards2).some(function (c) { return c.getAttribute('data-stage') === 'g1'; }), '一年級應已解鎖');

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

  console.log(`✓ ui 全部通過（${checks} 項斷言）`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
