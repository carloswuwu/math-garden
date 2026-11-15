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

/* 用 math 元信息重新計算期望答案，用於交叉驗證 */
function applyOp(op, a, b) {
  if (op === '+') return a + b;
  if (op === '−') return a - b;
  if (op === '×') return a * b;
  if (op === '÷') return a / b;
}

function computeAnswer(math) {
  if (math.op === 'count') return math.n;
  if (math.op === 'frac') return { n: math.n, d: math.d };
  if (math.op === 'compare') return math.mode === 'max' ? Math.max(math.a, math.b) : Math.min(math.a, math.b);
  if (math.op === 'comparegroup') return math.mode === 'max' ? (math.a > math.b ? 'green' : 'orange') : (math.a < math.b ? 'green' : 'orange');
  if (math.op === 'fadd') return { n: math.a + math.b, d: math.d };
  if (math.op === 'fsub') return { n: math.a - math.b, d: math.d };
  if (math.op === 'dadd' || math.op === 'dsub' || math.op === 'dmul' || math.op === 'ddiv') return (math.r / 10).toFixed(1);
  if (math.op === 'avg') return math.nums.reduce(function (s, x) { return s + x; }, 0) / math.nums.length;
  if (math.op === 'equation') {
    if (math.form === 'x+a=c') return math.c - math.a;
    if (math.form === 'x-a=c') return math.c + math.a;
    if (math.form === 'ax=c') return math.c / math.a;
    return math.a * math.c; // x/a=c
  }
  if (math.op === 'percent') {
    if (math.kind === 'of') return math.p * math.whole / 100;
    return math.pct;
  }
  if (math.op === 'ratio') return math.q * math.k;
  if (math.op === 'area') return math.mode === 'area' ? math.l * math.w : 2 * (math.l + math.w);
  if (math.op === 'fractionof') return math.n * math.k;
  if (math.op === 'exprsub') return math.a * math.x + math.b;
  if (math.op === 'linear') return math.form === '+' ? (math.c - math.b) / math.a : (math.c + math.b) / math.a;
  if (math.op === 'pythagoras') return math.mode === 'hyp' ? math.c : math.b;
  if (math.op === 'simul') return (math.s + math.d) / 2;
  if (math.op === 'indices') return math.e != null ? Math.pow(math.base, math.e) : Math.pow(math.base, math.e1 + math.e2);
  if (math.op === 'inequality') return 'x ' + math.sign + ' ' + math.x0;
  if (math.op === 'log') return math.n;
  if (math.op === 'fx') return math.a * math.x * math.x + math.b * math.x + math.c;
  if (math.op === 'trig') {
    if (math.which === 'sin') return { n: math.a, d: math.c };
    if (math.which === 'cos') return { n: math.b, d: math.c };
    return { n: math.a, d: math.b };
  }
  if (math.op === 'ap') return math.a + (math.n - 1) * math.d;
  if (math.op === 'gp') return math.a * Math.pow(math.r, math.n - 1);
  if (math.op === 'prob') return { n: math.good, d: math.total };
  if (math.op === 'quad') return math.askSum ? math.sum : math.prod;
  if (math.op === 'stats') { var s = math.nums.slice().sort(function (x, y) { return x - y; }); return s[(s.length - 1) / 2]; }
  if (math.op === 'triangle') return math.b * math.h / 2;
  if (math.op === 'circle') return math.mode === 'area' ? (math.r * math.r) + 'π' : (2 * math.r) + 'π';
  if (math.op === 'volume') return math.l * math.w * math.h;
  if (math.op === 'coord') return math.mode === 'dist' ? math.dist : '(' + math.mx + ', ' + math.my + ')';
  if (math.op === 'warea') return math.a * math.b;
  if (math.op === 'wpercent') return math.a * (100 - math.b) / 100;
  if (math.op === 'wratio') return math.b;
  if (math.op === 'wspeed') return math.a * math.b / 60;
  if (math.op === 'wprofit') return math.b;
  if (math.op === 'wcompound') return Math.round(math.a * Math.pow(1 + math.b / 100, math.c));
  if (math.op === 'perimeter') return 2 * (math.l + math.w);
  if (math.op === 'polygon') return (math.n - 2) * 180;
  if (math.op === 'angle') return math.a;
  if (math.op === 'money') return math.a - math.b;
  if (math.op === 'fact') return math.a;
  if (math.op === 'quadsolve') return Math.max(math.p, math.q);
  if (math.op === 'line') return (math.b[1] - math.a[1]) / (math.b[0] - math.a[0]);
  if (math.op === 'variation') return math.k * math.c;
  if (math.op === 'add') return math.a + math.b;
  if (math.op === 'sub') return math.a - math.b;
  if (math.op === 'mul') return math.a * math.b;
  if (math.blank) {
    if (math.blank === 'a') return math.op === '+' ? math.c - math.b : math.c + math.b;
    if (math.blank === 'b') return math.op === '+' ? math.c - math.a : math.a - math.c;
    return applyOp(math.op, math.a, math.b);
  }
  return applyOp(math.op, math.a, math.b);
}

function isIntNonNeg(v) {
  return Number.isInteger(v) && v >= 0;
}

const SKILLS = {
  count:          { id: 't.count',     types: ['count'],                     levels: [{ min: 1, max: 10 }] },
  compare:        { id: 't.compare',   types: ['compare'],                   levels: [{ min: 1, max: 10 }] },
  comparegroup:   { id: 't.compareg',  types: ['comparegroup'],              levels: [{ min: 1, max: 10 }] },
  addition:       { id: 't.add',       types: ['addition'],                  levels: [{ max: 10 }, { max: 20 }] },
  subtraction:    { id: 't.sub',       types: ['subtraction'],               levels: [{ max: 10 }, { max: 20 }] },
  numberbonds:    { id: 't.bonds',     types: ['numberbonds'],               levels: [{ max: 10 }, { max: 20 }] },
  missing:        { id: 't.missing',   types: ['missing'],                   levels: [{ max: 20 }] },
  multiplication: { id: 't.mul',       types: [{ t: 'multiplication', opts: { table: 3 } }], levels: [{}] },
  multiplicationFree: { id: 't.mulf',  types: ['multiplication'],            levels: [{ maxFactor: 9 }] },
  division:       { id: 't.div',       types: ['division'],                  levels: [{ maxDivisor: 9, maxQuotient: 9 }] },
  fraction:       { id: 't.frac',      types: ['fraction'],                  levels: [{ minDen: 2, maxDen: 8 }] },
  word:           { id: 't.word',      types: ['word'],                      levels: [{ max: 20, maxFactor: 9 }] },
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
};

const N = 400; // 每個類型的抽樣數量

function validateProblem(skill, p, label) {
  check(p && typeof p === 'object', `${label}: 題目為空`);
  check(p.type, `${label}: 缺少 type`);
  check(p.prompt && p.prompt.zh && p.prompt.en, `${label}: 缺少雙語 prompt`);

  // 答案與 math 元信息一致
  const expected = computeAnswer(p.math);
  const isColor = p.type === 'comparegroup';
  const isString = typeof p.answer === 'string';
  if (C.isFraction(expected)) {
    check(C.isFraction(p.answer), `${label}: 應為分數答案`);
    check(p.answer.n === expected.n && p.answer.d === expected.d, `${label}: 分數答案不一致 (${p.answer.n}/${p.answer.d} vs ${expected.n}/${expected.d})`);
    check(p.answer.n > 0 && p.answer.n < p.answer.d, `${label}: 分數應真分數`);
  } else if (isString) {
    check(typeof p.answer === 'string', `${label}: 字符串題答案應為字符串`);
    check(p.answer === expected, `${label}: 字符串答案不一致 (${p.answer} vs ${expected})`);
  } else {
    check(Number.isInteger(p.answer), `${label}: 答案應為整數，得到 ${p.answer}`);
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
      check(c.n > 0 && c.n < c.d, `${label}: 分數選項應為真分數`);
    } else if (isString) {
      check(typeof c === 'string', `${label}: 字符串選項應為字符串`);
    } else {
      check(Number.isInteger(c), `${label}: 選項應為整數，得到 ${c}`);
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
    'perimeter', 'polygon', 'angle', 'money', 'fact', 'quadsolve', 'line', 'variation'];
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
  check(C.explain(c) === null, 'explain: 數一數暫不提供步驟');
})();

console.log(`✓ math-core 全部通過（${checks} 項斷言）`);
