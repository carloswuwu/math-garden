/* 題目生成器性質測試：node tests/generators.test.js
 *
 * 針對「生成器」而非 UI 做性質檢驗（property-based）：
 *  1. 每題都有答案、選項恰好 4 個、選項兩兩等值不同、正解恰出現一次
 *  2. 計算得出的分數答案必須是最簡分數；等值分數（2/4 與 1/2）必須判對
 *  3. 概率選項必須落在 [0, 1]，且干擾項留在同一樣本空間
 *  4. 題幹/提示不得含 undefined/NaN；提示不得與顯示方式矛盾（圓點 vs 數字）
 *  5. 提示英文不得是中文
 *  6. 題庫池大小不得倒退（記錄目前已知偏小的回憶型題庫）
 *  7. 難度階梯確實變難
 */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const M = require('../math-core.js');

const ROOT = path.join(__dirname, '..');
const ctx = {};
vm.createContext(ctx);
ctx.window = ctx;
ctx.globalThis = ctx;
vm.runInContext(fs.readFileSync(path.join(ROOT, 'curriculum.js'), 'utf8'), ctx, { filename: 'curriculum.js' });
const C = ctx.Curriculum;

let checks = 0;
function check(cond, msg) {
  checks++;
  assert.ok(cond, msg);
}

const CJK = /[\u4e00-\u9fff]/;
const GARBAGE = /undefined|NaN|Infinity/;

/* 目前已知偏小的題庫（內容債）；值為「各題型合併後」在最高難度下的實測下限。
 * 若再下降即屬回歸；新技能若低於 10 而沒有列在這裡，測試會失敗。
 * g2.direction 受指南針只有四個方向所限，合併後最多 4 個不同答案。 */
const KNOWN_SMALL_POOLS = {
  'ms.s2.polygon': 6,
  'ms.s2.congruent': 3,
  'ms.s2.quad': 5,
  'ms.s2.approx': 3,
  'ms.s3.pichart': 7,
  'g2.direction': 4,
  'ms.s3.cone': 6,
  'ms.s3.centre': 4
};

const skills = Object.values(C.skills).filter((s) => !s.scaffold && (s.types || []).length);
check(skills.length > 90, '應載入 90+ 個有題目的技能');

/* 0. 題型目錄必須涵蓋課程實際使用的每一個 type */
{
  const declared = new Set(M.GENERATOR_TYPES);
  const used = new Set();
  for (const s of skills) for (const t of s.types) used.add(typeof t === 'string' ? t : t.t);
  [...used].forEach((t) => check(declared.has(t), 'GENERATOR_TYPES 缺少題型 ' + t));
  check(declared.size > 0, 'GENERATOR_TYPES 不應為空');
}

for (const skill of skills) {
  const specs = skill.types.map((t) => (typeof t === 'string' ? { t } : t));
  const steps = Math.max(1, Math.min(3, (skill.levels || []).length));
  for (const spec of specs) {
    for (let step = 0; step < steps; step++) {
      for (let i = 0; i < 40; i++) {
        const tag = skill.id + '/' + spec.t + '/step' + step + '/#' + i;
        const p = M.generateProblem(skill, { type: spec.t, seed: 100 + i * 37 + step * 11, difficultyStep: step });

        /* 1. 結構 */
        check(p.answer !== undefined && p.answer !== null, '缺少答案 ' + tag);
        if (typeof p.answer === 'number') check(Number.isFinite(p.answer), '答案非有限數 ' + tag);
        /* 鍵入答案題（挑戰區）不提供選項；其餘題型固定選項數 */
        if (p.input) {
          check(typeof p.input === 'string', 'input 題應標記型別 ' + tag);
          check(!Array.isArray(p.choices) || p.choices.length === 0, '鍵入答案題不應提供選項 ' + tag);
          check(M.checkAnswer(p, String(M.renderValue(p.answer))).correct, '鍵入答案題自己的答案應判對 ' + tag);
        } else {
          /* 比大小（顏色版）刻意只有兩個選項（綠組／橙組），其餘題型一律 4 個 */
          const expectedChoices = spec.t === 'comparegroup' ? 2 : 4;
          check(Array.isArray(p.choices) && p.choices.length === expectedChoices, '選項數不是 ' + expectedChoices + ' ' + tag);
          for (let x = 0; x < p.choices.length; x++) {
            for (let y = x + 1; y < p.choices.length; y++) {
              check(!M.valuesEqual(p.choices[x], p.choices[y]), '選項等值重複 ' + tag + ' ' + JSON.stringify(p.choices));
            }
          }
          const correct = p.choices.filter((c) => M.valuesEqual(c, p.answer));
          check(correct.length === 1, '正解在選項中出現 ' + correct.length + ' 次 ' + tag);
        }
        check(!GARBAGE.test(p.prompt.zh) && !GARBAGE.test(p.prompt.en), '題幹含垃圾值 ' + tag);
        check(!!p.prompt.zh && !!p.prompt.en, '題幹缺語言 ' + tag);

        /* 2. 分數 */
        if (M.isFraction(p.answer) && spec.t !== 'fraction') {
          const r = M.reduceFraction(p.answer);
          check(r.n === p.answer.n && r.d === p.answer.d,
            '計算型分數答案未約簡 ' + tag + ' ' + p.answer.n + '/' + p.answer.d);
        }
        if (M.isFraction(p.answer) && p.answer.d > 0) {
          const n = p.answer.n, d = p.answer.d;
          check(M.checkAnswer(p, n + '/' + d).correct, '自己的答案應判對 ' + tag);
          check(M.checkAnswer(p, Math.round(n * 2) + '/' + Math.round(d * 2)).correct, '等值分數應判對 ' + tag);
          if (n !== d - 1) check(!M.checkAnswer(p, (n + 1) + '/' + d).correct, '非等值分數不應判對 ' + tag);
        }

        /* 3. 概率 */
        if (spec.t === 'prob') {
          const m = p.math;
          check(M.valuesEqual(p.answer, { n: m.good, d: m.total }), '概率答案應為 good/total ' + tag);
          p.choices.forEach((c) => {
            const v = M.isFraction(c) ? c.n / c.d : c;
            check(v >= 0 && v <= 1, '概率選項超出 [0,1] ' + tag + ' ' + JSON.stringify(c));
            /* 化簡後的分母必須整除總數（或「數錯總數」的 total−1），才算留在同一樣本空間 */
            const r = M.reduceFraction(c);
            const sameSpace = (m.total % r.d === 0) || ((m.total - 1) % r.d === 0);
            check(M.isFraction(c) && sameSpace, '概率干擾項脫離樣本空間 ' + tag + ' ' + JSON.stringify(c));
          });
        }

        /* 4. 提示與顯示一致 */
        if (spec.t === 'compare' && Math.max(p.math.a, p.math.b) > 20) {
          check(!/圓點|dots/.test(p.hint.zh + p.hint.en), '數字題仍在講圓點提示 ' + tag);
        }

        /* 4b. 位值與百分數應用的一致性 */
        if (spec.t === 'placevalue') {
          const m = p.math;
          const exp = m.mode === 'tens' ? m.tens : m.mode === 'ones' ? m.ones : m.mode === 'value' ? m.tens * 10 : m.n;
          check(p.answer === exp, '位值答案與模式不一致 ' + tag);
        }
        if (spec.t === 'percent' && (p.math.kind === 'increase' || p.math.kind === 'decrease')) {
          const m = p.math;
          const exp = m.whole * (m.kind === 'increase' ? 1 + m.p / 100 : 1 - m.p / 100);
          check(Math.abs(p.answer - exp) < 1e-9, '百分數增減答案錯誤 ' + tag);
        }

        /* 4c. π 一律寫成 π，不是 1π */
        const piPieces = (typeof p.answer === 'string' && p.answer.indexOf('π') >= 0 ? [p.answer] : []).concat(
          (p.choices || []).filter((c) => typeof c === 'string' && c.indexOf('π') >= 0)
        );
        piPieces.forEach((v) => check(v !== '1π', 'π 標籤不應寫成 1π ' + tag));

        /* 5. 英文提示不得是中文 */
        check(!(p.hint && p.hint.en && CJK.test(p.hint.en)), '英文提示含中文 ' + tag);

        /* 6. 解題步驟：不得拋錯、不得為空、不得含垃圾值 */
        let ex = null;
        try { ex = M.explain(p); } catch (e) { check(false, 'explain 拋錯 ' + tag + ' :: ' + e.message); }
        if (ex) {
          ['zh', 'en'].forEach((lang) => {
            check(Array.isArray(ex[lang]) && ex[lang].length > 0, '解題步驟為空 ' + lang + ' ' + tag);
            ex[lang].forEach((s) => check(typeof s === 'string' && s.trim().length > 0 && !GARBAGE.test(s), '解題步驟含垃圾值 ' + lang + ' ' + tag));
          });
        }
      }
    }
  }
}

/* 2b. 挑戰區：所有題目都必須是鍵入答案（無選項、答案可辨識），避免用猜的 */
{
  const challengeSkills = Object.values(C.skills).filter((sk) => sk.stage === 'challenge');
  check(challengeSkills.length === 6, '挑戰區應有 6 個技能，得到 ' + challengeSkills.length);
  let typedCount = 0;
  challengeSkills.forEach((skill) => {
    for (let i = 0; i < 40; i++) {
      const p = M.generateProblem(skill, { seed: 3000 + i * 17, difficultyStep: i % 3 });
      check(p.input === 'text', '挑戰題應為鍵入答案 ' + skill.id + '#' + i);
      check(!Array.isArray(p.choices) || p.choices.length === 0, '挑戰題不應有選項 ' + skill.id + '#' + i);
      check(M.checkAnswer(p, String(M.renderValue(p.answer))).correct, '挑戰題答案可判對 ' + skill.id + '#' + i);
      typedCount++;
    }
  });
  check(typedCount === 240, '挑戰題抽樣數應為 240，得到 ' + typedCount);
}

/* 6b. 曾出錯／新加入的模式：解題步驟必須存在，且最後一步要交代答案 */
[['hs.s5.gpsum', 'gp'], ['ms.s3.sector', 'arclen'], ['hs.s4.quad2', 'quadsolve'],
 ['hs.s4.line2', 'line'], ['hs.s6.prob2', 'prob'], ['ms.s2.identity', 'identity'],
 ['ms.s3.prism', 'prism'], ['col.linalg', 'matrix'], ['col.calculus', 'calculus'],
 ['col.prob', 'expectation'], ['hs.s4.circleprop', 'circleprop'],
 ['hs.s5.dispersion', 'dispersion'], ['g1.place100', 'placevalue'],
 ['g4.fractionadd', 'fractionadd'], ['ms.s3.prob', 'prob'], ['g6.percent', 'percent'],
 ['ms.s3.indices', 'indices'], ['ms.s3.inequality', 'inequality'], ['ms.s2.simul', 'simul'],
 ['hs.s4.log', 'log'], ['hs.s6.stats', 'stats'], ['hs.s6.derivative', 'derivative'],
 ['hs.s6.binomial2', 'binomial']].forEach(([sid, type]) => {
  const skill = C.skills[sid];
  check(!!skill, '缺少技能 ' + sid);
  for (let i = 0; i < 20; i++) {
    const p = M.generateProblem(skill, { type, seed: 500 + i });
    const ex = M.explain(p);
    check(!!ex, '應有解題步驟 ' + sid + '/' + type);
    if (!ex) continue;
    const shown = M.renderValue(p.answer);
    check(ex.zh[ex.zh.length - 1].indexOf(shown) >= 0, '解題最後一步未包含答案 ' + sid + '/' + type + ' ans=' + shown + ' step=' + ex.zh[ex.zh.length - 1]);
    check(ex.en[ex.en.length - 1].indexOf(shown) >= 0, '解題最後一步未包含答案(en) ' + sid + '/' + type + ' ans=' + shown);
    if (sid === 'hs.s6.binomial2') {
      check(ex.zh.join(' ').indexOf('C(') >= 0 && ex.zh.join(' ').indexOf('×') >= 0,
        '一般二項式解題須顯示 C(n,r) × a^(n−r)');
    }
  }
});

/* 6. 題庫池大小：把該技能所有題型合併，最高難度下應能出 10 道不重複的題 */
for (const skill of skills) {
  const step = Math.max(0, (skill.levels || []).length - 1);
  const sigs = new Set();
  for (const spec of skill.types.map((t) => (typeof t === 'string' ? { t } : t))) {
    const probe = { id: skill.id, types: [spec.t], levels: skill.levels };
    M.generateSet(probe, 10, { seed: 7, difficultyStep: step }).forEach((p) => sigs.add(p.sig));
  }
  const floor = KNOWN_SMALL_POOLS[skill.id] != null ? KNOWN_SMALL_POOLS[skill.id] : 10;
  check(sigs.size >= floor, '題庫池太小 ' + skill.id + '：' + sigs.size + ' < ' + floor);
}

/* 8. 題目標識：不同 math 內容不得共用同一個 sig（防止去重失效） */
function stableOf(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(stableOf).join(',') + ']';
  return '{' + Object.keys(value).sort().map((k) => JSON.stringify(k) + ':' + stableOf(value[k])).join(',') + '}';
}
for (const skill of skills) {
  for (const spec of skill.types.map((t) => (typeof t === 'string' ? { t } : t))) {
    const maths = new Set();
    const sigs = new Set();
    for (let i = 0; i < 120; i++) {
      const p = M.generateProblem(skill, { type: spec.t, seed: 800 + i });
      maths.add(stableOf(p.math));
      sigs.add(p.sig);
    }
    check(sigs.size === maths.size, 'sig 碰撞 ' + skill.id + '/' + spec.t + '：maths=' + maths.size + ' sigs=' + sigs.size);
  }
}

/* 7. 難度階梯：同一技能高階平均答案應大於低階 */
['prek.count', 'g1.add20', 'g1.place100', 'g2.addsub100r'].forEach((sid) => {
  const skill = C.skills[sid];
  if (!skill) return;
  const mean = (step) => {
    let sum = 0, n = 0;
    for (let i = 0; i < 120; i++) {
      const p = M.generateProblem(skill, { seed: 300 + i, difficultyStep: step });
      const v = M.isFraction(p.answer) ? p.answer.n / p.answer.d : Number(p.answer);
      if (Number.isFinite(v)) { sum += Math.abs(v); n++; }
    }
    return sum / Math.max(1, n);
  };
  const steps = Math.min(3, (skill.levels || []).length);
  if (steps >= 2) check(mean(steps - 1) > mean(0), '難度階梯沒有變難 ' + sid);
});

console.log('✓ 生成器性質測試全部通過（' + checks + ' 項斷言，' + skills.length + ' 個技能）');
