/* 選項／干擾項生成（ESM）：由 generateProblem 使用，依賴 rng/values。 */
import { seedRandom, randInt, pick, shuffle } from './rng.js';
import { isFraction, reduceFraction, renderValue, valueKey, valuesEqual } from './values.js';

  function fractionDistractor(rng, ans) {
    var d = randInt(rng, 2, Math.max(ans.d + 2, 4));
    var n = randInt(rng, 1, d - 1);
    return { n: n, d: d };
  }

  function buildChoices(rng, answer, opts) {
    opts = opts || {};
    var min = opts.min != null ? opts.min : 0;
    var max = opts.max != null ? opts.max : 20;
    var base = opts.base || [answer];
    var frac = isFraction(answer);
    var seen = {};
    var out = [];
    base.forEach(function (v) {
      var k = valueKey(v);
      if (!seen[k]) { seen[k] = true; out.push(v); }
    });
    var guard = 0;
    while (out.length < 4 && guard++ < 1000) {
      var cand;
      if (frac) {
        cand = fractionDistractor(rng, answer);
      } else {
        cand = answer + pick(rng, [-3, -2, -1, 1, 2, 3]);
        if (cand < min || cand > max) cand = randInt(rng, min, max);
        if (cand === answer) cand = answer + pick(rng, [-2, -1, 1, 2]);
        if (cand < min || cand > max) cand = randInt(rng, min, max);
      }
      if (!frac && cand < min) continue;
      if (valuesEqual(cand, answer)) continue;
      var k = valueKey(cand);
      if (!seen[k]) { seen[k] = true; out.push(cand); }
    }
    return shuffle(rng, out);
  }

  /* 每個類型合理的干擾項數值上界 */
  function distractorMax(p, o) {
    if (isFraction(p.answer)) return 20;
    if (['modpow', 'gcdlcm', 'remainderSystem', 'pathcount', 'handshake', 'arrange', 'inclusion', 'clockangle', 'trapezoid', 'seqnext', 'pigeon', 'workrate', 'mixture', 'lastdigit', 'gridrect', 'polygonsum', 'train'].indexOf(p.type) !== -1) {
      return Math.max(30, Math.ceil(Number(p.answer) * 2) + 10);
    }
    if (p.type === 'quadsolve') return 120;
    if (p.type === 'binomial') return 500;
    if (p.type === 'circleprop') return 200;
    if (p.type === 'calculus') return 400;
    if (p.type === 'expectation') return 10;
    if (p.type === 'division') return o.maxQuotient != null ? o.maxQuotient : 9;
    if (p.type === 'multiplication') {
      var f = o.maxFactor != null ? o.maxFactor : 9;
      return f * f;
    }
    if (p.type === 'word') {
      var ansNum = Number(p.answer);
      if (!isFinite(ansNum)) return 99;
      return Math.max(40, Math.ceil(Math.abs(ansNum) * 1.6) + 10);
    }
    if (o.max != null) return o.max;
    if (p.type === 'multidigit') return 999;
    if (p.type === 'average') return 30;
    if (p.type === 'equation') return 120;
    if (p.type === 'percent') return 300;
    if (p.type === 'ratio') return 200;
    if (p.type === 'area') return 500;
    if (p.type === 'fractionof') return 200;
    if (p.type === 'directed') return 100;
    if (p.type === 'exprsub') return 80;
    if (p.type === 'linear') return 30;
    if (p.type === 'pythagoras') return 40;
    if (p.type === 'simul') return 20;
    if (p.type === 'indices') return 4000;
    if (p.type === 'log') return 10;
    if (p.type === 'fx') return 80;
    if (p.type === 'ap') return 100;
    if (p.type === 'gp') return 500;
    if (p.type === 'quad') return 100;
    if (p.type === 'stats') return 30;
    if (p.type === 'triangle') return 200;
    if (p.type === 'volume') return 300;
    if (p.type === 'coord') return p.math && p.math.mode === 'dist' ? 20 : 80;
    if (p.type === 'perimeter') return 100;
    if (p.type === 'polygon') return 2000;
    if (p.type === 'angle') return 400;
    if (p.type === 'money') return 100;
    if (p.type === 'fact') return 2000;
    if (p.type === 'quadsolve') return 20;
    if (p.type === 'line') return 10;
    if (p.type === 'variation') return 50;
    if (p.type === 'oddeven') return 50;
    if (p.type === 'shape') return 10;
    if (p.type === 'symmetry') return 10;
    if (p.type === 'liketerms') return 20;
    if (p.type === 'polycoeff') return 12;
    if (p.type === 'mode') return 12;
    if (p.type === 'asum') return 600;
    if (p.type === 'invvar') return 20;
    if (p.type === 'comb') return 300;
    if (p.type === 'range') return 40;
    if (p.type === 'circleeq') return 15;
    if (p.type === 'parallel') return 200;
    if (p.type === 'sqrt') return 20;
    if (p.type === 'congruent') return 10;
    if (p.type === 'similar') return 10;
    if (p.type === 'quadshape') return 10;
    if (p.type === 'sinterest') return 2000;
    if (p.type === 'expand') return 40;
    if (p.type === 'pichart') return 300;
    if (p.type === 'approx') return 600;
    if (p.type === 'direction') return 10;
    if (p.type === 'time24') return 24;
    if (p.type === 'centre') return 6;
    if (p.type === 'circleangle') return 150;
    if (p.type === 'binomial') return 30;
    if (p.type === 'derivative') return 40;
    return 99;
  }

  /* 每個類型合理的干擾項數值下界（有向數可為負） */
  function distractorMin(p, o) {
    if (p.type === 'directed') return -100;
    if (p.type === 'fx') return -40;
    return 0;
  }

  /* ---------------- 技能配置輔助 ---------------- */

  /* 穩定序列化：物件鍵排序、陣列保留次序。
   * 用於題目標識與去重，避免像舊版那樣靠一份「欄位白名單」而漏掉新欄位。 */

export { fractionDistractor, buildChoices, distractorMax, distractorMin };
