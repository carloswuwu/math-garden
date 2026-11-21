/* 核心邏輯測試：node tests/core.test.js */
'use strict';
const assert = require('assert');
const path = require('path');
const C = require(path.join(__dirname, '..', 'math-core.js'));

let checks = 0;
function check(cond, msg) {
  checks++;
  assert.ok(cond, msg);
}

/* 期望答案由 MathCore.answerFromMath（MATH_SPEC）推導：oracle 只有一份實作 */
function isIntNonNeg(v) {
  return Number.isInteger(v) && v >= 0;
}

const SKILLS = {
  count:          { id: 't.count',     types: ['count'],                     levels: [{ min: 1, max: 10 }] },
  compare:        { id: 't.compare',   types: ['compare'],                   levels: [{ min: 1, max: 10 }] },
  comparegroup:   { id: 't.compareg',  types: ['comparegroup'],              levels: [{ min: 1, max: 10 }] },
  placevalue:     { id: 't.pv',        types: ['placevalue'],                levels: [{ min: 10, max: 99 }] },
  identity:       { id: 't.ident',     types: ['identity'],                  levels: [{}] },
  circleprop:     { id: 't.cprop',     types: ['circleprop'],                levels: [{}] },
  dispersion:     { id: 't.disp',      types: ['dispersion'],                levels: [{}] },
  prism:          { id: 't.prism',     types: ['prism'],                     levels: [{}] },
  matrix:         { id: 't.matrix',    types: ['matrix'],                    levels: [{}] },
  calculus:       { id: 't.calc',      types: ['calculus'],                  levels: [{}] },
  expectation:    { id: 't.exp',       types: ['expectation'],               levels: [{}] },
  sector:         { id: 't.sector',    types: [{ t: 'arclen', opts: { mode: 'sector' } }], levels: [{}] },
  quadDisc:       { id: 't.qdisc',     types: [{ t: 'quadsolve', opts: { mode: 'disc' } }], levels: [{}] },
  lineEq:         { id: 't.lineq',     types: [{ t: 'line', opts: { mode: 'eq' } }], levels: [{}] },
  gpSum:          { id: 't.gpsum',     types: [{ t: 'gp', opts: { mode: 'sum' } }], levels: [{}] },
  gpInf:          { id: 't.gpinf',     types: [{ t: 'gp', opts: { mode: 'inf' } }], levels: [{}] },
  binGen:         { id: 't.bingen',    types: [{ t: 'binomial', opts: { general: true } }], levels: [{}] },
  probDice:       { id: 't.pdice',     types: [{ t: 'prob', opts: { mode: 'twoDice' } }], levels: [{}] },
  probComp:       { id: 't.pcomp',     types: [{ t: 'prob', opts: { mode: 'complement' } }], levels: [{}] },
  addition:       { id: 't.add',       types: ['addition'],                  levels: [{ max: 10 }, { max: 20 }] },
  subtraction:    { id: 't.sub',       types: ['subtraction'],               levels: [{ max: 10 }, { max: 20 }] },
  numberbonds:    { id: 't.bonds',     types: ['numberbonds'],               levels: [{ max: 10 }, { max: 20 }] },
  missing:        { id: 't.missing',   types: ['missing'],                   levels: [{ max: 20 }] },
  multiplication: { id: 't.mul',       types: [{ t: 'multiplication', opts: { table: 3 } }], levels: [{}] },
  multiplicationFree: { id: 't.mulf',  types: ['multiplication'],            levels: [{ maxFactor: 9 }] },
  division:       { id: 't.div',       types: ['division'],                  levels: [{ maxDivisor: 9, maxQuotient: 9 }] },
  fraction:       { id: 't.frac',      types: ['fraction'],                  levels: [{ minDen: 2, maxDen: 8 }] },
  word:           { id: 't.word',      types: ['word'],                      levels: [{ max: 20, maxFactor: 9 }] },
  wordTwoStep:    { id: 't.word2',     types: ['word'],                      levels: [{ ops: ['twoStep'], max: 100, maxFactor: 9 }] },
  multidigit:     { id: 't.muldig',    types: ['multidigit'],                levels: [{}] },
  fractionadd:    { id: 't.fradd',     types: ['fractionadd'],               levels: [{}] },
  decimal:        { id: 't.dec',       types: ['decimal'],                   levels: [{}] },
  decimalmul:     { id: 't.decmul',    types: ['decimalmul'],                levels: [{}] },
  average:        { id: 't.avg',       types: ['average'],                   levels: [{}] },
  equation:       { id: 't.eq',        types: ['equation'],                  levels: [{}] },
  percent:        { id: 't.pct',       types: ['percent'],                   levels: [{}] },
  ratio:          { id: 't.ratio',     types: ['ratio'],                     levels: [{}] },
  area:           { id: 't.area',      types: ['area'],                      levels: [{}] },
  fractionof:     { id: 't.frof',      types: ['fractionof'],                levels: [{}] },
  directed:       { id: 't.dir',       types: ['directed'],                  levels: [{}] },
  exprsub:        { id: 't.expr',      types: ['exprsub'],                   levels: [{}] },
  linear:         { id: 't.lin',       types: ['linear'],                    levels: [{}] },
  pythagoras:     { id: 't.pyth',      types: ['pythagoras'],                levels: [{}] },
  simul:          { id: 't.simul',     types: ['simul'],                     levels: [{}] },
  indices:        { id: 't.idx',       types: ['indices'],                   levels: [{}] },
  inequality:     { id: 't.ineq',      types: ['inequality'],                levels: [{}] },
  log:            { id: 't.log',       types: ['log'],                       levels: [{}] },
  fx:             { id: 't.fx',        types: ['fx'],                        levels: [{}] },
  trig:           { id: 't.trig',      types: ['trig'],                     levels: [{}] },
  ap:             { id: 't.ap',        types: ['ap'],                        levels: [{}] },
  gp:             { id: 't.gp',        types: ['gp'],                        levels: [{}] },
  prob:           { id: 't.prob',      types: ['prob'],                     levels: [{}] },
  quad:           { id: 't.quad',      types: ['quad'],                     levels: [{}] },
  stats:          { id: 't.stats',     types: ['stats'],                    levels: [{}] },
  triangle:       { id: 't.tri',       types: ['triangle'],                 levels: [{}] },
  circle:         { id: 't.circ',      types: ['circle'],                   levels: [{}] },
  volume:         { id: 't.vol',       types: ['volume'],                   levels: [{}] },
  coord:          { id: 't.coord',     types: ['coord'],                    levels: [{}] },
  word2:          { id: 't.word2',     types: ['word'],                     levels: [{ ops: ['area', 'percent', 'ratio', 'speed', 'profit', 'compound'], max: 1000, maxFactor: 9 }] },
  perimeter:      { id: 't.peri',      types: ['perimeter'],                 levels: [{}] },
  polygon:        { id: 't.poly',      types: ['polygon'],                   levels: [{}] },
  angle:          { id: 't.angle',     types: ['angle'],                     levels: [{}] },
  money:          { id: 't.money',     types: ['money'],                     levels: [{}] },
  fact:           { id: 't.fact',      types: ['fact'],                      levels: [{}] },
  quadsolve:      { id: 't.qsolve',    types: ['quadsolve'],                 levels: [{}] },
  line:           { id: 't.line',      types: ['line'],                      levels: [{}] },
  variation:      { id: 't.var',       types: ['variation'],                 levels: [{}] },
  oddeven:        { id: 't.oddeven',   types: ['oddeven'],                   levels: [{}] },
  shape:          { id: 't.shape',     types: ['shape'],                     levels: [{}] },
  symmetry:       { id: 't.sym',       types: ['symmetry'],                  levels: [{}] },
  liketerms:      { id: 't.lt',        types: ['liketerms'],                 levels: [{}] },
  polycoeff:      { id: 't.pc',        types: ['polycoeff'],                 levels: [{}] },
  arclen:         { id: 't.arc',       types: ['arclen'],                    levels: [{}] },
  mode:           { id: 't.mode',      types: ['mode'],                      levels: [{}] },
  asum:           { id: 't.asum',      types: ['asum'],                      levels: [{}] },
  invvar:         { id: 't.invvar',    types: ['invvar'],                    levels: [{}] },
  comb:           { id: 't.comb',      types: ['comb'],                      levels: [{}] },
  range:          { id: 't.range',     types: ['range'],                     levels: [{}] },
  circleeq:       { id: 't.ceq',       types: ['circleeq'],                  levels: [{}] },
  parallel:       { id: 't.par',       types: ['parallel'],                  levels: [{}] },
  sqrt:           { id: 't.sqrt',      types: ['sqrt'],                      levels: [{}] },
  congruent:      { id: 't.cong',      types: ['congruent'],                 levels: [{}] },
  similar:        { id: 't.sim',       types: ['similar'],                   levels: [{}] },
  quadshape:      { id: 't.quadshape', types: ['quadshape'],                 levels: [{}] },
  cylinder:       { id: 't.cyl',       types: ['cylinder'],                  levels: [{}] },
  sinterest:      { id: 't.si',        types: ['sinterest'],                 levels: [{}] },
  expand:         { id: 't.exp',       types: ['expand'],                    levels: [{}] },
  pichart:        { id: 't.pie',       types: ['pichart'],                   levels: [{}] },
  approx:         { id: 't.approx',    types: ['approx'],                    levels: [{}] },
  direction:      { id: 't.dir',       types: ['direction'],                 levels: [{}] },
  time24:         { id: 't.time24',    types: ['time24'],                    levels: [{}] },
  cone:           { id: 't.cone',      types: ['cone'],                      levels: [{}] },
  centre:         { id: 't.centre',    types: ['centre'],                    levels: [{}] },
  circleangle:    { id: 't.cang',      types: ['circleangle'],               levels: [{}] },
  binomial:       { id: 't.bin',       types: ['binomial'],                  levels: [{}] },
  derivative:     { id: 't.deriv',     types: ['derivative'],                levels: [{}] },
};

const N = 400; // 每個類型的抽樣數量

function validateProblem(skill, p, label) {
  check(p && typeof p === 'object', `${label}: 題目為空`);
  check(p.type, `${label}: 缺少 type`);
  check(p.prompt && p.prompt.zh && p.prompt.en, `${label}: 缺少雙語 prompt`);

  // 答案與 math 元信息一致
  const expected = C.answerFromMath(p);
  const isColor = p.type === 'comparegroup';
  const isString = typeof p.answer === 'string';
  if (C.isFraction(expected)) {
    check(C.isFraction(p.answer), `${label}: 應為分數答案`);
    // 等值即可（2/3 與 6/9 同值）；計算型答案另須為最簡分數
    check(p.answer.n * expected.d === expected.n * p.answer.d, `${label}: 分數答案不等值 (${p.answer.n}/${p.answer.d} vs ${expected.n}/${expected.d})`);
    if (p.type !== 'fraction') {
      const red = C.reduceFraction(p.answer);
      check(red.n === p.answer.n && red.d === p.answer.d, `${label}: 計算型分數答案未約簡 (${p.answer.n}/${p.answer.d})`);
    }
    check(p.answer.n > 0 && p.answer.d > 0, `${label}: 分數分母必須為正`);
  } else if (isString) {
    check(typeof p.answer === 'string', `${label}: 字符串題答案應為字符串`);
    check(p.answer === expected, `${label}: 字符串答案不一致 (${p.answer} vs ${expected})`);
  } else {
    check(Number.isInteger(p.answer) || (p.math.op === 'stats' && Math.abs(p.answer * 2 - Math.round(p.answer * 2)) < 1e-9), `${label}: 答案應為整數（中位數可為 .5），得到 ${p.answer}`);
    check(p.answer === expected, `${label}: 答案不一致 (${p.answer} vs ${expected})`);
  }

  // 選項：含正確答案、互不重復；顏色題為 2 個，其余為 4 個
  check(Array.isArray(p.choices), `${label}: 應有選項數組`);
  const wantCount = isColor ? 2 : 4;
  check(p.choices.length === wantCount, `${label}: 應有 ${wantCount} 個選項，得到 ${p.choices.length}`);
  const keys = p.choices.map(C.valueKey);
  check(new Set(keys).size === wantCount, `${label}: 選項重復 ${JSON.stringify(p.choices)}`);
  check(keys.indexOf(C.valueKey(p.answer)) !== -1, `${label}: 選項缺少正確答案`);
  p.choices.forEach((c) => {
    if (C.isFraction(c)) {
      check(c.n > 0 && c.d > 0, `${label}: 分數選項分母必須為正`);
    } else if (isString) {
      check(typeof c === 'string', `${label}: 字符串選項應為字符串`);
    } else {
      check(Number.isInteger(c) || (p.math.op === 'stats' && Math.abs(c * 2 - Math.round(c * 2)) < 1e-9), `${label}: 選項應為整數（中位數可為 .5），得到 ${c}`);
    }
  });

  check(typeof p.sig === 'string' && p.sig.indexOf(p.type + ':') === 0, `${label}: sig 應帶類型前綴`);
}

/* 1. 每個類型大量抽樣驗證 */
for (const name of Object.keys(SKILLS)) {
  const skill = SKILLS[name];
  for (let seed = 1; seed <= N; seed++) {
    const p = C.generateProblem(skill, { seed });
    validateProblem(skill, p, `${name}#${seed}`);
  }
}

/* 2. 約束性檢查 */
for (let seed = 1; seed <= N; seed++) {
  const add = C.generateProblem(SKILLS.addition, { seed, difficultyStep: 0 });
  check(add.answer <= 10, `addition step0 和不應超過 10，得到 ${add.answer}`);
  const sub = C.generateProblem(SKILLS.subtraction, { seed, difficultyStep: 0 });
  check(sub.answer >= 0, `subtraction 差不應為負`);
  const mul = C.generateProblem(SKILLS.multiplication, { seed, difficultyStep: 0 });
  check(mul.math.a === 3 || mul.math.b === 3, `multiplication table 應含因數 3，得到 ${mul.math.a}x${mul.math.b}`);
  const div = C.generateProblem(SKILLS.division, { seed, difficultyStep: 0 });
  check(Number.isInteger(div.answer) && div.answer >= 1, `division 商應為正整數`);
  check(div.math.a === div.math.b * div.answer, `division 被除數不滿足 a = b * q`);
}

/* 3. checkAnswer：數字、字符串、分數 */
(function () {
  const p = C.generateProblem(SKILLS.addition, { seed: 42 });
  check(C.checkAnswer(p, p.answer).correct === true, 'checkAnswer 數字應判對');
  check(C.checkAnswer(p, String(p.answer)).correct === true, 'checkAnswer 字符串應判對');
  check(C.checkAnswer(p, ' ' + p.answer + ' ').correct === true, 'checkAnswer 帶空格應判對');
  check(C.checkAnswer(p, p.answer + 1).correct === false, 'checkAnswer 錯誤答案應判錯');
  check(C.checkAnswer(p, 'abc').correct === false, 'checkAnswer 非數字應判錯');

  const f = C.generateProblem(SKILLS.fraction, { seed: 7 });
  check(C.checkAnswer(f, { n: f.answer.n, d: f.answer.d }).correct === true, '分數對象應判對');
  check(C.checkAnswer(f, f.answer.n + '/' + f.answer.d).correct === true, '分數字符串應判對');
  check(C.checkAnswer(f, '2/9').correct === (f.answer.n === 2 && f.answer.d === 9), '分數錯誤應判錯');

  const cg = C.generateProblem(SKILLS.comparegroup, { seed: 5 });
  check(C.checkAnswer(cg, cg.answer).correct === true, '顏色題應判對');
  check(C.checkAnswer(cg, cg.answer === 'green' ? 'orange' : 'green').correct === false, '顏色題錯誤應判錯');
})();

/* 4. generateSet 唯一性與數量 */
(function () {
  const set = C.generateSet(SKILLS.addition, 20, { seed: 9, difficultyStep: 0 });
  check(set.length === 20, 'generateSet 應生成指定數量');
  const sigs = set.map((p) => p.sig);
  check(new Set(sigs).size === 20, 'generateSet 題目應唯一');
  set.forEach((p) => validateProblem(SKILLS.addition, p, 'set'));
})();

/* 5. 進度與掌握度 */
(function () {
  const progress = C.newProgress();
  const skill = SKILLS.addition;
  const p = C.generateProblem(skill, { seed: 1 });

  C.applyResult(progress, skill, p, true);
  let sp = progress.skills[skill.id];
  check(sp.attempts === 1 && sp.correct === 1, 'applyResult 計次正確');
  check(sp.typeAcc.addition.a === 1 && sp.typeAcc.addition.c === 1, 'applyResult typeAcc 正確');

  // 連續 3 次正確 → 難度上升
  C.applyResult(progress, skill, p, true);
  C.applyResult(progress, skill, p, true);
  check(sp.difficultyStep === 1, '3 連對應升級難度 step=1');
  // 再連續兩次錯誤 → 難度下降
  C.applyResult(progress, skill, p, false);
  C.applyResult(progress, skill, p, false);
  check(sp.difficultyStep === 0, '2 連錯應降級難度 step=0');
  // 難度不會越界
  for (let i = 0; i < 30; i++) C.applyResult(progress, skill, p, true);
  check(sp.difficultyStep === SKILLS.addition.levels.length - 1, '難度應被 clamp 到上限');

  // masteryStatus 閾值：練習給星星，但只有通過測驗（≧2 星）才解鎖
  const prog2 = C.newProgress();
  const sp2 = prog2.skills[skill.id] = C.defaultSkillProgress();
  sp2.correct = 3;  check(C.masteryStatus(prog2, skill).stars === 0, '練習 3/10 應 0 星');
  sp2.correct = 4;  check(C.masteryStatus(prog2, skill).stars === 1, '練習 4/10 應 1 星');
  sp2.correct = 7;  check(C.masteryStatus(prog2, skill).stars === 2, '練習 7/10 應 2 星');
  sp2.correct = 10; check(C.masteryStatus(prog2, skill).mastered === false, '僅練習不通過測驗不應解鎖');
  sp2.quizStars = 1; check(C.masteryStatus(prog2, skill).mastered === false, '測驗 1 星不足以解鎖');
  sp2.quizStars = 2; check(C.masteryStatus(prog2, skill).mastered === true, '測驗 2 星應解鎖');

  check(C.quizStars(0.55) === 0, 'quiz 55% 應 0 星');
  check(C.quizStars(0.65) === 1, 'quiz 65% 應 1 星');
  check(C.quizStars(0.85) === 2, 'quiz 85% 應 2 星');
  check(C.quizStars(0.96) === 3, 'quiz 96% 應 3 星');

  const g = C.gradeQuiz([{ correct: true }, { correct: false }, { correct: true }, { correct: true }]);
  check(g.correct === 3 && g.total === 4 && Math.abs(g.percent - 0.75) < 1e-9 && g.stars === 1, 'gradeQuiz 計算正確');

  // applyQuizResult 覆蓋
  const prog3 = C.newProgress();
  C.applyQuizResult(prog3, skill, 0.9);
  check(prog3.skills[skill.id].quizStars === 2, 'applyQuizResult 90% 應 2 星');
  check(prog3.skills[skill.id].mastered === true, 'quiz 2 星應視為掌握');
})();

/* 6. nextProblem 類型合法且避開最近題 */
(function () {
  const progress = C.newProgress();
  const skill = SKILLS.addition;
  const seenTypes = new Set();
  for (let i = 0; i < 50; i++) {
    const p = C.nextProblem(skill, progress, { seed: 1000 + i });
    seenTypes.add(p.type);
    validateProblem(skill, p, 'next');
    C.applyResult(progress, skill, p, i % 2 === 0);
  }
  check([...seenTypes].every((t) => SKILLS.addition.types.includes(t)), 'nextProblem 只產生已配置的類型');
})();

/* 7. 選項生成：小數字場景也能湊滿 4 個非負選項 */
(function () {
  const skill = { id: 'small', types: ['addition'], levels: [{ max: 4 }] };
  for (let seed = 1; seed <= 200; seed++) {
    const p = C.generateProblem(skill, { seed, difficultyStep: 0 });
    check(p.choices.length === 4, `小范圍應仍能生成 4 個選項 (seed=${seed})`);
    check(p.choices.every((c) => Number.isInteger(c) && c >= 0), `小范圍選項應非負 (seed=${seed})`);
  }
})();

/* 8. 一步步示範（explain）：支援的題型都應給出步驟 */
(function () {
  const supported = ['addition', 'subtraction', 'numberbonds', 'multiplication', 'division',
    'multidigit', 'fractionadd', 'decimal', 'decimalmul', 'average', 'equation', 'percent', 'ratio', 'area', 'fractionof',
    'directed', 'exprsub', 'linear', 'pythagoras', 'simul', 'indices', 'inequality',
    'log', 'fx', 'trig', 'ap', 'gp', 'prob', 'quad', 'stats',
    'triangle', 'circle', 'volume', 'coord',
    'perimeter', 'polygon', 'angle', 'money', 'fact', 'quadsolve', 'line', 'variation',
    'oddeven', 'shape', 'symmetry', 'liketerms', 'polycoeff', 'arclen', 'mode', 'asum', 'invvar', 'comb', 'range', 'circleeq',
    'parallel', 'sqrt', 'congruent', 'similar', 'quadshape', 'cylinder', 'sinterest', 'expand', 'pichart', 'approx',
    'direction', 'time24', 'cone', 'centre', 'circleangle', 'binomial', 'derivative'];
  supported.forEach((t) => {
    for (let seed = 1; seed <= 60; seed++) {
      const p = C.generateProblem(SKILLS[t], { seed });
      const ex = C.explain(p);
      check(ex && Array.isArray(ex.zh) && Array.isArray(ex.en), `explain ${t}: 應有 zh/en 步驟`);
      check(ex.zh.length >= 1 && ex.zh.length === ex.en.length, `explain ${t}: zh/en 步驟數應一致`);
      ex.zh.forEach((s) => check(typeof s === 'string' && s.trim().length > 0, `explain ${t}: 中文步驟非空`));
      ex.en.forEach((s) => check(typeof s === 'string' && s.trim().length > 0, `explain ${t}: 英文步驟非空`));
    }
  });
  const c = C.generateProblem(SKILLS.count, { seed: 1 });
  const cEx = C.explain(c);
  check(!!cEx && cEx.zh.length > 0 && cEx.zh[cEx.zh.length - 1].indexOf(String(c.answer)) >= 0, 'explain: 數一數也應提供步驟並交代答案');
})();

/* 進度資料清洗：壞資料不得令進度出現 NaN／超界值 */
(() => {
  const empty = C.sanitizeProgress(null);
  check(empty.version === 2 && empty.lang === 'zh' && empty.sound === true, 'sanitize: null 給預設值');
  check(empty.stageExams && typeof empty.stageExams === 'object', 'sanitize: 應有 stageExams');

  const junky = C.sanitizeProgress({
    version: 1, lang: 'xx', sound: 'yes', theme: 'pink', stars: -5,
    streak: { lastDay: null, count: -1 }, badges: [1, 'first', null],
    skills: {
      ok: { attempts: -3, correct: 1.7, stars: 9, quizBest: 250, consecCorrect: 200, typeAcc: { add: { a: 'x', c: 2 } } },
      bad: null
    },
    stageExams: { prek: { perfect: true, best: 200 } }
  });
  check(junky.lang === 'zh' && junky.sound === true && junky.theme === 'light', 'sanitize: 語言／音效／主題回預設');
  check(junky.stars === 0 && junky.streak.count === 0, 'sanitize: 負數夾到 0');
  check(junky.badges.length === 1 && junky.badges[0] === 'first', 'sanitize: 只留字串徽章');
  check(junky.skills.ok.attempts === 0 && junky.skills.ok.correct === 1, 'sanitize: 技能數值夾限');
  check(junky.skills.ok.stars === 3 && junky.skills.ok.quizBest === 100 && junky.skills.ok.consecCorrect === 100, 'sanitize: 星數／最佳分數上限');
  check(junky.skills.ok.typeAcc.add.a === 0 && junky.skills.ok.typeAcc.add.c === 2, 'sanitize: typeAcc 數值清洗');
  check(!junky.skills.bad, 'sanitize: 丟棄非物件技能');
  check(junky.stageExams.prek.passed === true && junky.stageExams.prek.best === 100, 'sanitize: 舊 perfect 轉 passed、分數夾限');
  check(junky.version === 2, 'sanitize: 版本升級到 2');

  const migrated = C.sanitizeProgress({ version: 1, lang: 'en', skills: { 'g1.add20': { correct: 5 } } });
  check(migrated.lang === 'en' && migrated.skills['g1.add20'].correct === 5 && migrated.version === 2, 'sanitize: v1→v2 保留資料');
})();

/* 9. sanitizeProgress 模糊測試：任意 JSON 不拋錯、上限成立、清洗冪等 */
(() => {
  let seed = 12345;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const junkKeys = ['skills', 'stageExams', 'typeAcc', 'lastProblems', 'streak', 'badges', 'lang',
    'sound', 'theme', 'stars', 'attempts', 'correct', 'version', 'lastDay', 'ok', 'a', 'c',
    'passed', 'perfect', 'best'];
  function randomValue(depth) {
    const r = rnd();
    if (depth <= 0 || r < 0.45) {
      if (r < 0.12) return null;
      if (r < 0.2) return String(rnd());
      if (r < 0.3) return Math.floor(rnd() * 1000000) - 500000;
      if (r < 0.36) return rnd() < 0.5;
      if (r < 0.42) return NaN;
      if (r < 0.44) return Infinity;
      return {};
    }
    if (r < 0.6) {
      const arr = [];
      const n = Math.floor(rnd() * 6);
      for (let i = 0; i < n; i++) arr.push(randomValue(depth - 1));
      return arr;
    }
    const obj = {};
    const n = Math.floor(rnd() * 6);
    for (let i = 0; i < n; i++) obj[junkKeys[Math.floor(rnd() * junkKeys.length)]] = randomValue(depth - 1);
    return obj;
  }
  for (let i = 0; i < 400; i++) {
    const r = rnd();
    let input;
    if (r < 0.1) input = [];
    else if (r < 0.2) input = 'junk';
    else if (r < 0.3) input = NaN;
    else input = randomValue(4);
    let out;
    try { out = C.sanitizeProgress(input); }
    catch (e) { check(false, 'sanitize 拋錯: ' + e.message); continue; }
    check(!!out && out.version === 2, '模糊: 清洗後版本為 2');
    const again = C.sanitizeProgress(JSON.parse(JSON.stringify(out)));
    check(JSON.stringify(again) === JSON.stringify(out), '模糊: JSON 往返後再次清洗冪等');
    check(Object.keys(out.skills).length <= 500, '模糊: skills 上限 500');
    check(Object.keys(out.stageExams).length <= 100, '模糊: stageExams 上限 100');
    Object.keys(out.skills).forEach((id) => {
      const sp = out.skills[id];
      check(Object.keys(sp.typeAcc).length <= 60, '模糊: typeAcc 上限 60');
      check(sp.lastProblems.length <= 20, '模糊: lastProblems 上限 20');
    });
  }

  /* 超量輸入必須被截斷到上限 */
  const big = { version: 2, skills: {}, stageExams: {} };
  for (let i = 0; i < 600; i++) {
    const ta = {};
    for (let j = 0; j < 80; j++) ta['t' + j] = { a: j, c: j };
    big.skills['s' + i] = { typeAcc: ta, lastProblems: Array.from({ length: 30 }, (_, j) => ({ type: 'x', sig: 'y' + j })) };
  }
  for (let i = 0; i < 150; i++) big.stageExams['st' + i] = { passed: true, best: 100 };
  const capped = C.sanitizeProgress(big);
  check(Object.keys(capped.skills).length === 500, '上限: skills 截到 500');
  check(Object.keys(capped.stageExams).length === 100, '上限: stageExams 截到 100');
  Object.values(capped.skills).forEach((sp) => {
    check(Object.keys(sp.typeAcc).length === 60, '上限: typeAcc 截到 60');
    check(sp.lastProblems.length === 20, '上限: lastProblems 截到 20');
  });

  /* 1 MB 級輸入（家長匯入的量級）：不拋錯，上限照樣成立 */
  const pad = 'x'.repeat(2000);
  const huge = { version: 2, lang: 'zh', skills: {}, stageExams: {} };
  for (let i = 0; i < 500; i++) {
    huge.skills['s' + i] = { attempts: 1, correct: 1, junk: pad, typeAcc: { t: { a: 1, c: 1 } }, lastProblems: [{ type: pad, sig: pad }] };
  }
  const hugeText = JSON.stringify(huge);
  check(hugeText.length > 1000000, '1MB: 測試輸入應超過 1 MB，實際 ' + hugeText.length);
  let hugeOut;
  try { hugeOut = C.sanitizeProgress(JSON.parse(hugeText)); }
  catch (e) { check(false, '1MB: sanitize 拋錯 ' + e.message); }
  if (hugeOut) {
    check(Object.keys(hugeOut.skills).length === 500, '1MB: 技能上限仍成立');
    check(Object.keys(hugeOut.skills).every((id) => hugeOut.skills[id].junk === undefined), '1MB: 未知欄位被丟棄');
  }
})();

console.log(`✓ math-core 全部通過（${checks} 項斷言）`);
