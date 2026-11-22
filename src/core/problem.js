/* 題目生成（ESM）：levelFor/typeList、generateProblem（選項、格式、自檢）與 generateSet。
 * 依賴 generators/math-spec/choices/signatures/format/values/rng。
 */
import { seedRandom } from './rng.js';
import { isFraction, reduceFraction, renderValue, valuesEqual } from './values.js';
import { answerFromMath } from './math-spec.js';
import { GENERATORS } from './generators.js';
import { buildChoices, distractorMax, distractorMin } from './choices.js';
import { formatMathText } from './format.js';
import { mathSig } from './signatures.js';

  function levelFor(skill, difficultyStep) {
    var levels = skill.levels || [{ min: skill.min, max: skill.max }];
    var idx = Math.max(0, Math.min(difficultyStep || 0, levels.length - 1));
    var lvl = levels[idx] || {};
    var out = {};
    /* 轉發題級別提供的所有選項（modes/nMax/sign/maxScale… 不再靠白名單而漏掉） */
    Object.keys(lvl).forEach(function (k) { out[k] = lvl[k]; });
    if (out.min == null) out.min = skill.min;
    if (out.max == null) out.max = skill.max;
    out.forms = out.forms || skill.forms;
    out.ops = out.ops || skill.ops;
    return out;
  }

  function typeList(skill) {
    return (skill.types || []).map(function (t) {
      return typeof t === 'string' ? { t: t } : t;
    });
  }

  /* ---------------- 生成單題 ---------------- */

  function generateProblem(skill, opts) {
    opts = opts || {};
    var types = typeList(skill);
    if (!types.length) throw new Error('技能缺少題目類型: ' + (skill.id || '?'));
    var typeSpec = null;
    if (opts.typeIndex != null) {
      typeSpec = types[opts.typeIndex];
      if (!typeSpec) throw new Error('題目類型索引越界: ' + opts.typeIndex);
    } else if (opts.type) {
      for (var i = 0; i < types.length; i++) if (types[i].t === opts.type) { typeSpec = types[i]; break; }
      if (!typeSpec) throw new Error('未知題目類型: ' + opts.type);
    } else {
      typeSpec = types[0];
    }
    var rng = opts.rng || seedRandom(opts.seed != null ? opts.seed : 1);
    var step = opts.difficultyStep != null ? opts.difficultyStep : 0;
    var lvl = levelFor(skill, step);
    var o = {};
    for (var k in lvl) o[k] = lvl[k];
    if (typeSpec.opts) for (var k2 in typeSpec.opts) o[k2] = typeSpec.opts[k2];

    var gen = GENERATORS[typeSpec.t];
    if (!gen) throw new Error('未實現的題目類型: ' + typeSpec.t);
    var p = gen(rng, o);
    p.type = typeSpec.t;
    /* 計算得出的分數答案一律化簡；「看圖寫分數」保留圖示的等份數 */
    if (isFraction(p.answer) && p.type !== 'fraction') p.answer = reduceFraction(p.answer);
    p.difficultyStep = step;
    /* 顯示格式：純文字 caret 式子轉成 $...$（KaTeX） */
    if (p.prompt) {
      p.prompt = { zh: formatMathText(p.prompt.zh), en: formatMathText(p.prompt.en) };
    }
    if (p.hint) {
      p.hint = { zh: formatMathText(p.hint.zh), en: formatMathText(p.hint.en) };
    }
    p.answerMax = o.max;
    p.answerMin = o.min;
    /* 題級別可設 input:true → 鍵入答案（不提供選項，避免用猜的）。
     * 引擎仍用同一個 checkAnswer，所以等值分數、小數、負數都照常判分。 */
    if (o.input) p.input = 'text';
    if (p.input) {
      delete p.choices;
    } else if (!p.choices) {
      p.choices = buildChoices(rng, p.answer, { min: distractorMin(p, o), max: distractorMax(p, o), base: p.base });
    }
    delete p.base;
    p.sig = p.type + ':' + mathSig(p.math);
    /* 開發／契約測試用自檢：p.math 推導出的答案必須與生成器給的答案一致 */
    if (opts.selfCheck) {
      var expected = answerFromMath(p);
      if (!valuesEqual(p.answer, expected)) {
        throw new Error('答案與 MATH_SPEC 不一致: ' + p.type + ' ' + p.sig + ' answer=' + renderValue(p.answer) + ' expected=' + renderValue(expected));
      }
    }
    return p;
  }

  function generateSet(skill, count, opts) {
    opts = opts || {};
    var rng = opts.rng || seedRandom(opts.seed != null ? opts.seed : 1);
    var step = opts.difficultyStep != null ? opts.difficultyStep : 0;
    var types = typeList(skill);
    var out = [];
    var seen = {};
    var guardTotal = 0;
    while (out.length < count && guardTotal++ < count * 200) {
      var idx = types.length > 1 ? Math.floor(rng() * types.length) : 0;
      var p = generateProblem(skill, { rng: rng, difficultyStep: step, typeIndex: idx });
      if (!seen[p.sig]) {
        seen[p.sig] = true;
        out.push(p);
      }
    }
    return out;
  }

export { levelFor, typeList, generateProblem, generateSet };
