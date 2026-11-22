/*
 * 解題步驟（ESM）：SOLVERS（逐題型/mode 的解法）+ explain。
 * 依賴 rng? 無；使用 values/facts/display/generators 的標籤與 formatMathText。
 * p.solution 優先，其次 SOLVERS，最後 explainRaw 的 switch。
 */
import { formatMathText } from './format.js';
import { isFraction, gcdInt, reduceFraction, valueKey, renderValue, valuesEqual } from './values.js';
import { factInt } from './facts.js';
import { fmtDecimal, fmtNum, explainEquationZh, explainEquationEn } from './display.js';
import { DIR_LABEL, CENTRE_LABEL } from './generators.js';

  var SOLVERS = {
    gp: function (p) {
      var m = p.math, ans = renderValue(p.answer);
      if (m.mode === 'sum') {
        return {
          zh: ['前 $n$ 項和 $S_n = \\frac{a(r^{n}-1)}{r-1}$。', '= $' + m.a + ' \\times \\frac{' + m.r + '^{' + m.n + '}-1}{' + m.r + '-1} = ' + ans + '$。'],
          en: ['Sum of $n$ terms $S_n = \\frac{a(r^{n}-1)}{r-1}$.', '= $' + m.a + ' \\times \\frac{' + m.r + '^{' + m.n + '}-1}{' + m.r + '-1} = ' + ans + '$。']
        };
      }
      if (m.mode === 'inf') {
        return {
          zh: ['無限項之和 S∞ = a ÷ (1 − r)。', '= ' + m.a + ' ÷ (1 − 1/2) = ' + ans + '。'],
          en: ['Sum to infinity S∞ = a ÷ (1 − r).', '= ' + m.a + ' ÷ (1 − 1/2) = ' + ans + '.']
        };
      }
      return null;
    },
    arclen: function (p) {
      var m = p.math, ans = renderValue(p.answer);
      if (m.mode === 'sector') {
        return {
          zh: ['扇形面積 = πr² × (圓心角 ÷ 360°)。', '= π × ' + m.r + '² × (' + m.angle + ' ÷ 360) = ' + ans + '。'],
          en: ['Sector area = πr² × (angle ÷ 360°).', '= π × ' + m.r + '² × (' + m.angle + ' ÷ 360) = ' + ans + '.']
        };
      }
      return null;
    },
    quadsolve: function (p) {
      var m = p.math;
      if (m.mode === 'disc') {
        var ans = renderValue(p.answer);
        return {
          zh: ['判別式 = b² − 4ac，本題 a = 1。', 'b = ' + m.b + '，c = ' + m.c + '：b² − 4ac = ' + (m.b < 0 ? '(' + m.b + ')²' : m.b + '²') + ' − 4 × 1 × ' + m.c + ' = ' + ans + '。'],
          en: ['Discriminant = b² − 4ac; here a = 1.', 'b = ' + m.b + ', c = ' + m.c + ': b² − 4ac = ' + m.b + '² − 4 × 1 × ' + m.c + ' = ' + ans + '.']
        };
      }
      if (m.mode === 'nature') {
        var D = m.b * m.b - 4 * m.a * m.c;
        var cnt = renderValue(p.answer);
        return {
          zh: ['判別式 D = b² − 4ac。', 'D = ' + (m.b < 0 ? '(' + m.b + ')²' : m.b + '²') + ' − 4 × 1 × ' + m.c + ' = ' + D + '，所以有 ' + cnt + ' 個實根。'],
          en: ['Discriminant D = b² − 4ac.', 'D = ' + (m.b < 0 ? '(' + m.b + ')²' : m.b + '²') + ' − 4 × 1 × ' + m.c + ' = ' + D + ', so there are ' + cnt + ' real roots.']
        };
      }
      return null;
    },
    line: function (p) {
      var m = p.math;
      if (m.mode === 'eq') {
        var ans = renderValue(p.answer);
        return {
          zh: ['把點 (' + m.x + ', ' + m.y + ') 代入 y = ' + m.m + 'x + c：' + m.y + ' = ' + m.m + ' × ' + m.x + ' + c。', '所以 c = ' + ans + '。'],
          en: ['Substitute (' + m.x + ', ' + m.y + ') into y = ' + m.m + 'x + c: ' + m.y + ' = ' + m.m + ' × ' + m.x + ' + c.', 'So c = ' + ans + '.']
        };
      }
      return null;
    },
    prob: function (p) {
      var m = p.math, ans = renderValue(p.answer);
      if (m.mode === 'twoDice') {
        return {
          zh: ['兩枚骰子共有 36 個等可能結果。', '和為 ' + m.s + ' 的結果（有序數對）有 ' + m.good + ' 個，概率 = ' + m.good + '/36 = ' + ans + '。'],
          en: ['Two dice have 36 equally likely outcomes.', m.good + ' ordered outcomes give a sum of ' + m.s + ', so P = ' + m.good + '/36 = ' + ans + '.']
        };
      }
      if (m.mode === 'complement') {
        return {
          zh: ['P(不是紅球) = 1 − P(紅球)。', '= 1 − ' + (m.total - m.good) + '/' + m.total + ' = ' + ans + '。'],
          en: ['P(not red) = 1 − P(red).', '= 1 − ' + (m.total - m.good) + '/' + m.total + ' = ' + ans + '.']
        };
      }
      var raw = m.good + '/' + m.total;
      return {
        zh: ['概率 = 紅球數 ÷ 總數。', '= ' + m.good + ' ÷ ' + m.total + ' = ' + raw + (raw === ans ? '。' : ' = ' + ans + '。')],
        en: ['Probability = red ÷ total.', '= ' + m.good + ' ÷ ' + m.total + ' = ' + raw + (raw === ans ? '.' : ' = ' + ans + '.')]
      };
    },
    fractionadd: function (p) {
      var m = p.math, ans = renderValue(p.answer);
      var add = m.op === 'fadd';
      var rawN = add ? m.a + m.b : m.a - m.b;
      var raw = rawN + '/' + m.d;
      var tail = (rawN === p.answer.n && m.d === p.answer.d) ? raw + '。' : raw + ' = ' + ans + '。';
      return {
        zh: ['分母相同（都是 ' + m.d + '），分子直接' + (add ? '相加' : '相減') + '。', m.a + ' ' + (add ? '+' : '−') + ' ' + m.b + ' = ' + rawN + '。', '分母不變：' + tail],
        en: ['Same denominator (' + m.d + '): ' + (add ? 'add' : 'subtract') + ' the numerators.', m.a + ' ' + (add ? '+' : '−') + ' ' + m.b + ' = ' + rawN + '.', 'Keep the denominator: ' + tail]
      };
    },
    percent: function (p) {
      var m = p.math, ans = renderValue(p.answer);
      if (m.kind === 'of') {
        return { zh: ['百分數 = 除以 100。', m.whole + ' × ' + m.p + '% = ' + m.whole + ' × ' + m.p + ' ÷ 100 = ' + ans + '。'], en: ['Percent means divide by 100.', m.whole + ' × ' + m.p + '% = ' + m.whole + ' × ' + m.p + ' ÷ 100 = ' + ans + '.'] };
      }
      if (m.kind === 'what') {
        return { zh: ['百分率 = 部分 ÷ 整體 × 100%。', m.part + ' ÷ ' + m.whole + ' × 100% = ' + ans + '%。'], en: ['Percentage = part ÷ whole × 100%.', m.part + ' ÷ ' + m.whole + ' × 100% = ' + ans + '%.'] };
      }
      if (m.kind === 'increase' || m.kind === 'decrease') {
        var sign = m.kind === 'increase' ? '+' : '−';
        return {
          zh: ['新值 = 原值 × (1 ' + sign + ' 百分率)。', '= ' + m.whole + ' × (1 ' + sign + ' ' + m.p + '/100) = ' + ans + '。'],
          en: ['New value = original × (1 ' + sign + ' rate).', '= ' + m.whole + ' × (1 ' + sign + ' ' + m.p + '/100) = ' + ans + '.']
        };
      }
      return null;
    },
    binomial: function (p) {
      var m = p.math, ans = renderValue(p.answer);
      if (m.mode === 'gen') {
        return {
          zh: ['(x + a)ⁿ 中 xʳ 的係數 = C(n,r) × a^(n−r)。', '= C(' + m.n + ', ' + m.r + ') × ' + m.a + '^' + (m.n - m.r) + ' = ' + ans + '。'],
          en: ['In (x + a)ⁿ, the coefficient of xʳ is C(n,r) × a^(n−r).', '= C(' + m.n + ', ' + m.r + ') × ' + m.a + '^' + (m.n - m.r) + ' = ' + ans + '.']
        };
      }
      return null;
    },
    indices: function (p) {
      var m = p.math, ans = renderValue(p.answer);
      if (m.mode === 'power') {
        return { zh: ['重複相乘。', m.base + '^' + m.e + ' = ' + Array(m.e).fill(m.base).join(' × ') + ' = ' + ans + '。'], en: ['Repeated multiplication.', m.base + '^' + m.e + ' = ' + Array(m.e).fill(m.base).join(' × ') + ' = ' + ans + '.'] };
      }
      if (m.mode === 'prod') {
        return { zh: ['同底數相乘，指數相加。', m.base + '^' + m.e1 + ' × ' + m.base + '^' + m.e2 + ' = ' + m.base + '^' + (m.e1 + m.e2) + ' = ' + ans + '。'], en: ['Same base: add the exponents.', m.base + '^' + m.e1 + ' × ' + m.base + '^' + m.e2 + ' = ' + m.base + '^' + (m.e1 + m.e2) + ' = ' + ans + '.'] };
      }
      if (m.mode === 'quot') {
        return { zh: ['同底數相除，指數相減。', m.base + '^' + m.e1 + ' ÷ ' + m.base + '^' + m.e2 + ' = ' + m.base + '^' + (m.e1 - m.e2) + ' = ' + ans + '。'], en: ['Same base: subtract the exponents.', m.base + '^' + m.e1 + ' ÷ ' + m.base + '^' + m.e2 + ' = ' + m.base + '^' + (m.e1 - m.e2) + ' = ' + ans + '.'] };
      }
      return { zh: ['先算括號內的積，再取次方。', '= (' + m.b1 + ' × ' + m.b2 + ')^' + m.e + ' = ' + ans + '。'], en: ['Work out the product first, then the power.', '= (' + m.b1 + ' × ' + m.b2 + ')^' + m.e + ' = ' + ans + '.'] };
    },
    inequality: function (p) {
      var m = p.math, ans = renderValue(p.answer);
      var sign = m.a > 0 ? m.sign : (m.sign === '>' ? '<' : '>');
      var flip = m.a < 0 ? '（除以負數，不等號反向）' : '';
      var flipEn = m.a < 0 ? ' (dividing by a negative flips the sign)' : '';
      return {
        zh: ['先把 ' + m.b + ' 移到右邊：' + m.a + 'x ' + m.sign + ' ' + (m.a * m.x0) + '。', '兩邊除以 ' + m.a + flip + '：' + ans + '。'],
        en: ['Move ' + m.b + ' to the right: ' + m.a + 'x ' + m.sign + ' ' + (m.a * m.x0) + '.', 'Divide by ' + m.a + flipEn + ': ' + ans + '.']
      };
    },
    simul: function (p) {
      var m = p.math, ans = renderValue(p.answer);
      return {
        zh: ['用消元法：把兩式乘以適當倍數，消去 y。',
          '一式 × ' + m.d + '、二式 × ' + m.b + ' 後相減：(' + m.a + '×' + m.d + ' − ' + m.c + '×' + m.b + ')x = ' + m.s + '×' + m.d + ' − ' + m.t + '×' + m.b + ' → x = ' + ans + '。'],
        en: ['Use elimination: multiply the equations so the y terms cancel.',
          'Eq1 × ' + m.d + ', Eq2 × ' + m.b + ', then subtract: (' + m.a + '×' + m.d + ' − ' + m.c + '×' + m.b + ')x = ' + m.s + '×' + m.d + ' − ' + m.t + '×' + m.b + ' → x = ' + ans + '.']
      };
    },
    log: function (p) {
      var m = p.math, ans = renderValue(p.answer);
      if (m.mode === 'law') {
        return {
          zh: ['同底對數相加：log m + log n = log(mn)。', 'log_' + m.base + '(' + m.m + ' × ' + m.n + ') = log_' + m.base + ' ' + (m.m * m.n) + ' = ' + ans + '。'],
          en: ['Same base: log m + log n = log(mn).', 'log_' + m.base + '(' + m.m + ' × ' + m.n + ') = log_' + m.base + ' ' + (m.m * m.n) + ' = ' + ans + '.']
        };
      }
      return null;
    },
    stats: function (p) {
      var m = p.math, ans = renderValue(p.answer);
      if (m.mode === 'mean') return null; // 平均數由 explain() 的 stats 分支處理
      if (m.mode === 'even') {
        var a1 = m.sorted[m.sorted.length / 2 - 1], a2 = m.sorted[m.sorted.length / 2];
        return {
          zh: ['排序後共 6 個數據，取中間兩個。', '中間兩個是 ' + a1 + ' 和 ' + a2 + '，中位數 = (' + a1 + ' + ' + a2 + ') ÷ 2 = ' + ans + '。'],
          en: ['With 6 sorted values, take the two middle ones.', 'They are ' + a1 + ' and ' + a2 + ', so median = (' + a1 + ' + ' + a2 + ') ÷ 2 = ' + ans + '.']
        };
      }
      var mid = m.sorted[(m.sorted.length - 1) / 2];
      return { zh: ['排序後取中間那個。', '中間的是 ' + mid + '，中位數 = ' + ans + '。'], en: ['Sort, then take the middle value.', 'The middle value is ' + mid + ', so median = ' + ans + '.'] };
    },
    placevalue: function (p) {
      var m = p.math, ans = renderValue(p.answer);
      var zh, en;
      if (m.mode === 'tens') {
        zh = ['十位數字在左邊第二位。', '在 ' + m.n + ' 中，十位數字是 ' + ans + '。'];
        en = ['The tens digit is the second digit from the right.', 'In ' + m.n + ', the tens digit is ' + ans + '.'];
      } else if (m.mode === 'ones') {
        zh = ['個位數字在右邊第一位。', '在 ' + m.n + ' 中，個位數字是 ' + ans + '。'];
        en = ['The ones digit is the rightmost digit.', 'In ' + m.n + ', the ones digit is ' + ans + '.'];
      } else if (m.mode === 'value') {
        zh = ['十位上的數字代表幾個十。', m.n + ' 的十位是 ' + m.tens + '，代表 ' + ans + '。'];
        en = ['The tens digit counts tens.', 'The tens digit of ' + m.n + ' is ' + m.tens + ', worth ' + ans + '.'];
      } else {
        zh = ['十位和個位合起來就是這個數。', m.tens + ' 個十和 ' + m.ones + ' 個一 = ' + ans + '。'];
        en = ['Tens and ones together give the number.', m.tens + ' tens and ' + m.ones + ' ones = ' + ans + '.'];
      }
      return { zh: zh, en: en };
    },
    identity: function (p) {
      var m = p.math, ans = renderValue(p.answer);
      if (m.mode === 'mid') {
        return { zh: ['(x + a)(x + b) = x² + (a + b)x + ab。', 'x 的係數 = ' + m.a + ' + ' + m.b + ' = ' + ans + '。'], en: ['(x + a)(x + b) = x² + (a + b)x + ab.', 'Coefficient of x = ' + m.a + ' + ' + m.b + ' = ' + ans + '.'] };
      }
      if (m.mode === 'const') {
        return { zh: ['常數項 = a × b。', '= ' + m.a + ' × ' + m.b + ' = ' + ans + '。'], en: ['Constant term = a × b.', '= ' + m.a + ' × ' + m.b + ' = ' + ans + '.'] };
      }
      if (m.mode === 'square') {
        return { zh: ['(x + a)² = x² + 2ax + a²。', 'x 的係數 = 2 × ' + m.a + ' = ' + ans + '。'], en: ['(x + a)² = x² + 2ax + a².', 'Coefficient of x = 2 × ' + m.a + ' = ' + ans + '.'] };
      }
      return { zh: ['平方差：(a + b)(a − b) = a² − b²。', '= ' + (m.a + m.b) + ' × ' + (m.a - m.b) + ' = ' + ans + '。'], en: ['Difference of squares: (a + b)(a − b) = a² − b².', '= ' + (m.a + m.b) + ' × ' + (m.a - m.b) + ' = ' + ans + '.'] };
    },
    prism: function (p) {
      var m = p.math, ans = renderValue(p.answer);
      if (m.mode === 'pyramid') {
        return { zh: ['錐體體積 = 底面積 × 高 ÷ 3。', '= ' + m.area + ' × ' + m.h + ' ÷ 3 = ' + ans + ' cm³。'], en: ['Pyramid volume = base area × height ÷ 3.', '= ' + m.area + ' × ' + m.h + ' ÷ 3 = ' + ans + ' cm³.'] };
      }
      return { zh: ['柱體體積 = 底面積 × 高。', '= ' + m.area + ' × ' + m.h + ' = ' + ans + ' cm³。'], en: ['Prism volume = base area × height.', '= ' + m.area + ' × ' + m.h + ' = ' + ans + ' cm³.'] };
    },
    matrix: function (p) {
      var m = p.math, ans = renderValue(p.answer);
      if (m.mode === 'det') {
        return { zh: ['二階行列式 = ad − bc。', '= ' + m.a + ' × ' + m.d + ' − ' + m.b + ' × ' + m.c + ' = ' + ans + '。'], en: ['2×2 determinant = ad − bc.', '= ' + m.a + ' × ' + m.d + ' − ' + m.b + ' × ' + m.c + ' = ' + ans + '.'] };
      }
      var A = m.A, B = m.B;
      return { zh: ['(AB)₁₁ = A₁₁B₁₁ + A₁₂B₂₁。', '= ' + A[0][0] + '×' + B[0][0] + ' + ' + A[0][1] + '×' + B[1][0] + ' = ' + ans + '。'], en: ['(AB)₁₁ = A₁₁B₁₁ + A₁₂B₂₁.', '= ' + A[0][0] + '×' + B[0][0] + ' + ' + A[0][1] + '×' + B[1][0] + ' = ' + ans + '.'] };
    },
    calculus: function (p) {
      var m = p.math, ans = renderValue(p.answer);
      if (m.mode === 'dval') {
        return { zh: ['f′(x) = a·n·x^(n−1)。', 'f′(' + m.x + ') = ' + m.a + ' × ' + m.n + ' × ' + m.x + '^' + (m.n - 1) + ' = ' + ans + '。'], en: ['f′(x) = a·n·x^(n−1).', "f′(" + m.x + ') = ' + m.a + ' × ' + m.n + ' × ' + m.x + '^' + (m.n - 1) + ' = ' + ans + '.'] };
      }
      return { zh: ['∫ ax dx = a x² ÷ 2。', '由 0 到 ' + m.b + '：' + m.a + ' × ' + m.b + '² ÷ 2 = ' + ans + '。'], en: ['∫ ax dx = a x² ÷ 2.', 'From 0 to ' + m.b + ': ' + m.a + ' × ' + m.b + '² ÷ 2 = ' + ans + '.'] };
    },
    expectation: function (p) {
      var m = p.math, ans = renderValue(p.answer);
      if (m.mode === 'die') {
        return { zh: ['E(X) = (1 + 2 + … + 6) ÷ 6。', '= 21 ÷ 6 = ' + ans + '。'], en: ['E(X) = (1 + 2 + … + 6) ÷ 6.', '= 21 ÷ 6 = ' + ans + '.'] };
      }
      if (m.mode === 'spinner') {
        return { zh: ['E(X) = (1 + … + n) ÷ n。', '= (1 + … + ' + m.n + ') ÷ ' + m.n + ' = ' + ans + '。'], en: ['E(X) = (1 + … + n) ÷ n.', '= (1 + … + ' + m.n + ') ÷ ' + m.n + ' = ' + ans + '.'] };
      }
      return { zh: ['P = C(n, k) ÷ 2ⁿ。', '= C(' + m.n + ', ' + m.k + ') ÷ 2^' + m.n + ' = ' + ans + '。'], en: ['P = C(n, k) ÷ 2ⁿ.', '= C(' + m.n + ', ' + m.k + ') ÷ 2^' + m.n + ' = ' + ans + '.'] };
    },
    circleprop: function (p) {
      var m = p.math, ans = renderValue(p.answer);
      if (m.mode === 'cyclic') {
        return { zh: ['圓內接四邊形的對角互補。', '180° − ' + m.a + '° = ' + ans + '°。'], en: ['Opposite angles of a cyclic quadrilateral are supplementary.', '180° − ' + m.a + '° = ' + ans + '°.'] };
      }
      if (m.mode === 'sameseg') {
        return { zh: ['同弓形內的圓周角相等。', '所以另一個角也是 ' + ans + '°。'], en: ['Angles in the same segment are equal.', 'So the other angle is also ' + ans + '°.'] };
      }
      return { zh: ['半圓上的圓周角與切線－半徑夾角都是 90°。', '答案 = ' + ans + '°。'], en: ['The angle in a semicircle and the tangent–radius angle are both 90°.', 'Answer = ' + ans + '°.'] };
    },
    dispersion: function (p) {
      var m = p.math, ans = renderValue(p.answer);
      return {
        zh: ['排序後共 7 個數據：Q1 是第 2 個，Q3 是第 6 個。', 'Q1 = ' + m.q1 + '，Q3 = ' + m.q3 + '，IQR = ' + m.q3 + ' − ' + m.q1 + ' = ' + ans + '。'],
        en: ['With 7 sorted values, Q1 is the 2nd and Q3 the 6th.', 'Q1 = ' + m.q1 + ', Q3 = ' + m.q3 + ', IQR = ' + m.q3 + ' − ' + m.q1 + ' = ' + ans + '.']
      };
    }
  };

  /* 回傳 { zh: [步驟...], en: [步驟...] }；不支援的題型回傳 null */
  function explainRaw(p) {
    if (!p || !p.math) return null;
    if (p.solution) return p.solution;
    var solver = SOLVERS[p.type];
    if (solver) {
      var solved = solver(p);
      if (solved) return solved;
    }
    var m = p.math, a, b, sum, sym, t, tens, ones, sumN;
    switch (p.type) {
      case 'count':
        return {
          zh: ['用手指一個一個點著數：1 到 ' + m.n + '。', '一共有 ' + p.answer + ' 個。'],
          en: ['Point at each one and count: 1 to ' + m.n + '.', 'There are ' + p.answer + ' in all.']
        };
      case 'compare': {
        var big = Math.max(m.a, m.b), small = Math.min(m.a, m.b);
        return {
          zh: ['兩個數是 ' + m.a + ' 和 ' + m.b + '。', '比較後，' + big + ' 比 ' + small + ' 大。', '答案是 ' + p.answer + '。'],
          en: ['The two numbers are ' + m.a + ' and ' + m.b + '.', big + ' is bigger than ' + small + '.', 'The answer is ' + p.answer + '.']
        };
      }
      case 'comparegroup': {
        var green = m.a, orange = m.b, more = m.mode === 'max';
        var ansZh = p.answer === 'green' ? '綠色' : '橙色';
        var ansEn = p.answer === 'green' ? 'green' : 'orange';
        var nAns = p.answer === 'green' ? green : orange;
        return {
          zh: ['數一數：綠色 ' + green + ' 個，橙色 ' + orange + ' 個。', (more ? '更多' : '更少') + '的是' + ansZh + '（' + nAns + ' 個），所以選' + ansZh + '。'],
          en: ['Count: green ' + green + ', orange ' + orange + '.', 'The ' + (more ? 'greater' : 'smaller') + ' group is ' + ansEn + ' (' + nAns + '), so choose ' + ansEn + '.']
        };
      }
      case 'fraction':
        return {
          zh: ['分母 = 總份數 = ' + m.d + '。', '分子 = 塗色份數 = ' + m.n + '。', '分數 = ' + renderValue({ n: m.n, d: m.d }) + '。'],
          en: ['Denominator = total parts = ' + m.d + '.', 'Numerator = shaded parts = ' + m.n + '.', 'Fraction = ' + renderValue({ n: m.n, d: m.d }) + '.']
        };
      case 'missing':
        if (m.blank === 'b') {
          if (m.op === '+' || m.op === 'add') {
            return {
              zh: ['想一想：' + m.a + ' 加多少等於 ' + m.c + '？', m.c + ' − ' + m.a + ' = ' + p.answer + '。'],
              en: ['Think: ' + m.a + ' plus what makes ' + m.c + '?', m.c + ' − ' + m.a + ' = ' + p.answer + '.']
            };
          }
          return {
            zh: ['想一想：' + m.a + ' 減多少等於 ' + m.c + '？', m.a + ' − ' + m.c + ' = ' + p.answer + '。'],
            en: ['Think: ' + m.a + ' minus what makes ' + m.c + '?', m.a + ' − ' + m.c + ' = ' + p.answer + '.']
          };
        }
        if (m.blank === 'a') {
          if (m.op === '+' || m.op === 'add') {
            return {
              zh: ['想一想：什麼數加 ' + m.b + ' 等於 ' + m.c + '？', m.c + ' − ' + m.b + ' = ' + p.answer + '。'],
              en: ['Think: what plus ' + m.b + ' makes ' + m.c + '?', m.c + ' − ' + m.b + ' = ' + p.answer + '.']
            };
          }
          return {
            zh: ['想一想：什麼數減 ' + m.b + ' 等於 ' + m.c + '？', m.c + ' + ' + m.b + ' = ' + p.answer + '。'],
            en: ['Think: what minus ' + m.b + ' makes ' + m.c + '?', m.c + ' + ' + m.b + ' = ' + p.answer + '.']
          };
        }
        return null;
      case 'addition':
        a = m.a; b = m.b; sum = p.answer;
        if (a + b <= 20 && a < 10 && b < 10 && (10 - a) > 0 && (10 - a) < b) {
          t = 10 - a;
          return {
            zh: ['先把 ' + a + ' 湊成 10。', '把 ' + b + ' 分成 ' + t + ' 和 ' + (b - t) + '。', a + ' + ' + t + ' = 10。', '10 + ' + (b - t) + ' = ' + sum + '。'],
            en: ['Make 10 with ' + a + ' first.', 'Split ' + b + ' into ' + t + ' and ' + (b - t) + '.', a + ' + ' + t + ' = 10.', '10 + ' + (b - t) + ' = ' + sum + '.']
          };
        }
        return {
          zh: ['從 ' + a + ' 開始，再往後數 ' + b + ' 個。', a + ' + ' + b + ' = ' + sum + '。'],
          en: ['Start at ' + a + ' and count on ' + b + '.', a + ' + ' + b + ' = ' + sum + '.']
        };
      case 'subtraction':
        a = m.a; b = m.b;
        return {
          zh: ['想一想：' + b + ' 加多少等於 ' + a + '？', b + ' + ' + (a - b) + ' = ' + a + '。', '所以 ' + a + ' − ' + b + ' = ' + p.answer + '。'],
          en: ['Think: ' + b + ' plus what makes ' + a + '?', b + ' + ' + (a - b) + ' = ' + a + '.', 'So ' + a + ' − ' + b + ' = ' + p.answer + '.']
        };
      case 'numberbonds':
        a = m.a;
        return {
          zh: ['想一想：' + a + ' 加多少等於 ' + m.c + '？', m.c + ' − ' + a + ' = ' + p.answer + '。'],
          en: ['Think: ' + a + ' plus what makes ' + m.c + '?', m.c + ' − ' + a + ' = ' + p.answer + '.']
        };
      case 'multiplication':
        a = m.a; b = m.b;
        return {
          zh: [a + ' × ' + b + ' 表示 ' + b + ' 個 ' + a + '。', '把它們加起來：' + Array(b).fill(a).join(' + ') + ' = ' + p.answer + '。', '所以 ' + a + ' × ' + b + ' = ' + p.answer + '。'],
          en: [a + ' × ' + b + ' means ' + b + ' groups of ' + a + '.', 'Add them: ' + Array(b).fill(a).join(' + ') + ' = ' + p.answer + '.', 'So ' + a + ' × ' + b + ' = ' + p.answer + '.']
        };
      case 'division':
        a = m.a; b = m.b;
        return {
          zh: ['想一想：' + b + ' 乘多少等於 ' + a + '？', b + ' × ' + p.answer + ' = ' + a + '。', '所以 ' + a + ' ÷ ' + b + ' = ' + p.answer + '。'],
          en: ['Think: ' + b + ' times what makes ' + a + '?', b + ' × ' + p.answer + ' = ' + a + '.', 'So ' + a + ' ÷ ' + b + ' = ' + p.answer + '.']
        };
      case 'multidigit':
        a = m.a; b = m.b;
        if (m.op === '×') {
          tens = Math.floor(a / 10) * 10; ones = a % 10;
          return {
            zh: ['把 ' + a + ' 拆成 ' + tens + ' + ' + ones + '。', tens + ' × ' + b + ' = ' + (tens * b) + '。', ones + ' × ' + b + ' = ' + (ones * b) + '。', (tens * b) + ' + ' + (ones * b) + ' = ' + p.answer + '。'],
            en: ['Split ' + a + ' into ' + tens + ' + ' + ones + '.', tens + ' × ' + b + ' = ' + (tens * b) + '.', ones + ' × ' + b + ' = ' + (ones * b) + '.', (tens * b) + ' + ' + (ones * b) + ' = ' + p.answer + '.']
          };
        }
        return {
          zh: ['用直式，從個位開始一位一位地除。', a + ' ÷ ' + b + ' = ' + p.answer + '。'],
          en: ['Use long division, digit by digit from the ones.', a + ' ÷ ' + b + ' = ' + p.answer + '.']
        };
      case 'fractionadd':
        sym = m.op === 'fadd' ? '+' : '−';
        return {
          zh: ['分母相同（都是 ' + m.d + '），分子直接' + (m.op === 'fadd' ? '相加' : '相減') + '。', m.a + ' ' + sym + ' ' + m.b + ' = ' + p.answer.n + '。', '分母不變，所以是 ' + p.answer.n + '/' + m.d + '。'],
          en: ['Same denominator (' + m.d + '): ' + (m.op === 'fadd' ? 'add' : 'subtract') + ' the numerators.', m.a + ' ' + sym + ' ' + m.b + ' = ' + p.answer.n + '.', 'Keep the denominator: ' + p.answer.n + '/' + m.d + '.']
        };
      case 'decimal':
        sym = m.op === 'dadd' ? '+' : '−';
        return {
          zh: ['先把小數點上下對齊。', fmtDecimal(m.a) + ' ' + sym + ' ' + fmtDecimal(m.b) + '。', '一位一位地算，得到 ' + fmtDecimal(m.r) + '。'],
          en: ['Line up the decimal points.', fmtDecimal(m.a) + ' ' + sym + ' ' + fmtDecimal(m.b) + '.', 'Calculate digit by digit: ' + fmtDecimal(m.r) + '.']
        };
      case 'decimalmul':
        if (m.op === 'dmul') {
          return {
            zh: ['先當整數算：' + m.a + ' × ' + m.b + ' = ' + (m.a * m.b) + '。', '點回小數點（一位小數）：' + fmtDecimal(m.r) + '。'],
            en: ['Multiply as whole numbers: ' + m.a + ' × ' + m.b + ' = ' + (m.a * m.b) + '.', 'Put the point back: ' + fmtDecimal(m.r) + '.']
          };
        }
        return {
          zh: ['先當整數算：' + m.a + ' ÷ ' + m.b + ' = ' + (m.a / m.b) + '。', '點回小數點（一位小數）：' + fmtDecimal(m.r) + '。'],
          en: ['Divide as whole numbers: ' + m.a + ' ÷ ' + m.b + ' = ' + (m.a / m.b) + '.', 'Put the point back: ' + fmtDecimal(m.r) + '.']
        };
      case 'average':
        sumN = m.nums.reduce(function (x, y) { return x + y; }, 0);
        return {
          zh: ['全部加起來：' + m.nums.join(' + ') + ' = ' + sumN + '。', '再除以個數（' + m.nums.length + '）：' + sumN + ' ÷ ' + m.nums.length + ' = ' + p.answer + '。'],
          en: ['Add them up: ' + m.nums.join(' + ') + ' = ' + sumN + '.', 'Divide by how many (' + m.nums.length + '): ' + sumN + ' ÷ ' + m.nums.length + ' = ' + p.answer + '.']
        };
      case 'equation':
        return {
          zh: [explainEquationZh(m), 'x = ' + p.answer + '。'],
          en: [explainEquationEn(m), 'x = ' + p.answer + '.']
        };
      case 'percent':
        if (m.kind === 'reverse') {
          return {
            zh: ['售價 = 原價 × (100 − ' + m.p + ')% = 原價 × ' + (100 - m.p) + '%。', '原價 = ' + m.price + ' ÷ ' + (100 - m.p) + '% = ' + p.answer + '。'],
            en: ['Sale price = original × (100 − ' + m.p + ')% = original × ' + (100 - m.p) + '%.', 'Original = ' + m.price + ' ÷ ' + (100 - m.p) + '% = ' + p.answer + '.']
          };
        }
        if (m.kind === 'change') {
          return {
            zh: ['增加了 ' + (m.result - m.whole) + '。', '百分率 = (' + m.result + ' − ' + m.whole + ') ÷ ' + m.whole + ' × 100% = ' + p.answer + '%。'],
            en: ['The increase is ' + (m.result - m.whole) + '.', 'Percentage change = (' + m.result + ' − ' + m.whole + ') ÷ ' + m.whole + ' × 100% = ' + p.answer + '%.']
          };
        }
        if (m.kind === 'of') {
          return {
            zh: ['先算 1%：' + m.whole + ' ÷ 100 = ' + (m.whole / 100) + '。', '再乘 ' + m.p + '：' + (m.whole / 100) + ' × ' + m.p + ' = ' + p.answer + '。'],
            en: ['Find 1%: ' + m.whole + ' ÷ 100 = ' + (m.whole / 100) + '.', 'Multiply by ' + m.p + ': ' + (m.whole / 100) + ' × ' + m.p + ' = ' + p.answer + '.']
          };
        }
        return {
          zh: ['用「部分 ÷ 整體 × 100%」。', m.part + ' ÷ ' + m.whole + ' × 100% = ' + p.answer + '%。'],
          en: ['Use part ÷ whole × 100%.', m.part + ' ÷ ' + m.whole + ' × 100% = ' + p.answer + '%.']
        };
      case 'ratio':
        if (m.mode === 'threePart') {
          return {
            zh: ['三部分共 ' + (m.p + m.q + m.r) + ' 份，總額 $' + m.total + '。', '一份 = $' + m.total + ' ÷ ' + (m.p + m.q + m.r) + ' = $' + m.k + '。', '丙 = ' + m.r + ' 份 = ' + m.k + ' × ' + m.r + ' = ' + p.answer + '。'],
            en: ['There are ' + (m.p + m.q + m.r) + ' parts in total, $' + m.total + '.', 'One part = $' + m.total + ' ÷ ' + (m.p + m.q + m.r) + ' = $' + m.k + '.', 'C = ' + m.r + ' parts = ' + m.k + ' × ' + m.r + ' = ' + p.answer + '.']
          };
        }
        if (m.mode === 'share') {
          return {
            zh: ['共有 ' + (m.p + m.q) + ' 份，總和是 ' + m.total + '。', '一份 = ' + m.total + ' ÷ ' + (m.p + m.q) + ' = ' + m.k + '。', '甲 = ' + m.p + ' 份 = ' + m.p + ' × ' + m.k + ' = ' + p.answer + '。'],
            en: ['There are ' + (m.p + m.q) + ' parts; the total is ' + m.total + '.', 'One part = ' + m.total + ' ÷ ' + (m.p + m.q) + ' = ' + m.k + '.', 'A = ' + m.p + ' parts = ' + m.p + ' × ' + m.k + ' = ' + p.answer + '.']
          };
        }
        return {
          zh: ['比是 ' + m.p + ' : ' + m.q + '，甲有 ' + m.p + ' 份。', '一份 = ' + m.a + ' ÷ ' + m.p + ' = ' + m.k + '。', '乙 = ' + m.q + ' 份 = ' + m.k + ' × ' + m.q + ' = ' + p.answer + '。'],
          en: ['The ratio is ' + m.p + ' : ' + m.q + '; A has ' + m.p + ' parts.', 'One part = ' + m.a + ' ÷ ' + m.p + ' = ' + m.k + '.', 'B = ' + m.q + ' parts = ' + m.k + ' × ' + m.q + ' = ' + p.answer + '.']
        };
      case 'area':
        if (m.mode === 'area') {
          return {
            zh: ['面積 = 長 × 闊。', m.l + ' × ' + m.w + ' = ' + p.answer + ' cm²。'],
            en: ['Area = length × width.', m.l + ' × ' + m.w + ' = ' + p.answer + ' cm².']
          };
        }
        return {
          zh: ['周界 = (長 + 闊) × 2。', '(' + m.l + ' + ' + m.w + ') × 2 = ' + p.answer + ' cm。'],
          en: ['Perimeter = (length + width) × 2.', '(' + m.l + ' + ' + m.w + ') × 2 = ' + p.answer + ' cm.']
        };
      case 'fractionof':
        return {
          zh: ['先除以分母：' + m.whole + ' ÷ ' + m.d + ' = ' + (m.whole / m.d) + '。', '再乘分子：' + (m.whole / m.d) + ' × ' + m.n + ' = ' + p.answer + '。'],
          en: ['Divide by the denominator: ' + m.whole + ' ÷ ' + m.d + ' = ' + (m.whole / m.d) + '.', 'Multiply by the numerator: ' + (m.whole / m.d) + ' × ' + m.n + ' = ' + p.answer + '.']
        };
      case 'directed':
        return {
          zh: ['先按四則運算的符號規則決定正負。', fmtNum(m.a) + ' ' + m.op + ' ' + fmtNum(m.b) + ' = ' + p.answer + '。'],
          en: ['Use the sign rules for directed numbers.', fmtNum(m.a) + ' ' + m.op + ' ' + fmtNum(m.b) + ' = ' + p.answer + '.']
        };
      case 'exprsub':
        return {
          zh: ['把 x = ' + m.x + ' 代入。', (m.a === 1 ? 'x' : m.a + 'x') + ' + ' + m.b + ' = ' + m.a + ' × ' + m.x + ' + ' + m.b + ' = ' + p.answer + '。'],
          en: ['Substitute x = ' + m.x + '.', (m.a === 1 ? 'x' : m.a + 'x') + ' + ' + m.b + ' = ' + m.a + ' × ' + m.x + ' + ' + m.b + ' = ' + p.answer + '.']
        };
      case 'linear':
        if (m.form === '+') {
          return {
            zh: ['兩邊同時減 ' + m.b + '：' + m.a + 'x = ' + (m.c - m.b) + '。', '兩邊同時除以 ' + m.a + '：x = ' + p.answer + '。'],
            en: ['Subtract ' + m.b + ' from both sides: ' + m.a + 'x = ' + (m.c - m.b) + '.', 'Divide both sides by ' + m.a + ': x = ' + p.answer + '.']
          };
        }
        return {
          zh: ['兩邊同時加 ' + m.b + '：' + m.a + 'x = ' + (m.c + m.b) + '。', '兩邊同時除以 ' + m.a + '：x = ' + p.answer + '。'],
          en: ['Add ' + m.b + ' to both sides: ' + m.a + 'x = ' + (m.c + m.b) + '.', 'Divide both sides by ' + m.a + ': x = ' + p.answer + '.']
        };
      case 'pythagoras':
        if (m.mode === 'hyp') {
          return {
            zh: ['斜邊² = ' + m.a + '² + ' + m.b + '² = ' + (m.a * m.a) + ' + ' + (m.b * m.b) + ' = ' + (m.c * m.c) + '。', '斜邊 = ' + m.c + '。'],
            en: ['hyp² = ' + m.a + '² + ' + m.b + '² = ' + (m.a * m.a) + ' + ' + (m.b * m.b) + ' = ' + (m.c * m.c) + '.', 'hyp = ' + m.c + '.']
          };
        }
        return {
          zh: ['另一條邊² = ' + m.c + '² − ' + m.a + '² = ' + (m.c * m.c) + ' − ' + (m.a * m.a) + ' = ' + (m.b * m.b) + '。', '另一條直角邊 = ' + m.b + '。'],
          en: ['leg² = ' + m.c + '² − ' + m.a + '² = ' + (m.c * m.c) + ' − ' + (m.a * m.a) + ' = ' + (m.b * m.b) + '.', 'leg = ' + m.b + '.']
        };
      case 'simul':
        return {
          zh: ['兩式相加：2x = ' + (m.s + m.d) + '。', '兩邊除以 2：x = ' + p.answer + '。'],
          en: ['Add the equations: 2x = ' + (m.s + m.d) + '.', 'Divide by 2: x = ' + p.answer + '.']
        };
      case 'indices':
        if (m.e != null) {
          return {
            zh: [m.base + '^' + m.e + ' 表示 ' + Array(m.e).fill(m.base).join(' × ') + '。', '= ' + p.answer + '。'],
            en: [m.base + '^' + m.e + ' means ' + Array(m.e).fill(m.base).join(' × ') + '.', '= ' + p.answer + '.']
          };
        }
        return {
          zh: ['同底數相乘，指數相加：' + m.base + '^' + (m.e1 + m.e2) + '。', '= ' + p.answer + '。'],
          en: ['Same base: add the exponents, ' + m.base + '^' + (m.e1 + m.e2) + '.', '= ' + p.answer + '.']
        };
      case 'inequality':
        return {
          zh: ['兩邊同時減 ' + m.b + '：' + m.a + 'x ' + m.sign + ' ' + (m.a * m.x0) + '。', '兩邊同時除以 ' + m.a + '（正數，不變號）：' + p.answer + '。'],
          en: ['Subtract ' + m.b + ' from both sides: ' + m.a + 'x ' + m.sign + ' ' + (m.a * m.x0) + '.', 'Divide both sides by ' + m.a + ' (positive, keep the sign): ' + p.answer + '.']
        };
      case 'log':
        return {
          zh: ['想一想：' + m.base + ' 的幾次方等於 ' + m.val + '。', m.base + '^' + m.n + ' = ' + m.val + '，所以 = ' + p.answer + '。'],
          en: ['What power of ' + m.base + ' gives ' + m.val + '?', m.base + '^' + m.n + ' = ' + m.val + ', so = ' + p.answer + '.']
        };
      case 'fx':
        return {
          zh: ['把 x = ' + m.x + ' 代入 $f(x)$。', 'f(' + m.x + ') = ' + m.a + '×' + m.x + '² ' + (m.b >= 0 ? '+ ' + m.b : '− ' + (-m.b)) + '×' + m.x + ' ' + (m.c >= 0 ? '+ ' + m.c : '− ' + (-m.c)) + ' = ' + p.answer + '。'],
          en: ['Substitute x = ' + m.x + ' into $f(x)$.', 'f(' + m.x + ') = ' + m.a + '×' + m.x + '² ' + (m.b >= 0 ? '+ ' + m.b : '− ' + (-m.b)) + '×' + m.x + ' ' + (m.c >= 0 ? '+ ' + m.c : '− ' + (-m.c)) + ' = ' + p.answer + '.']
        };
      case 'trig':
        return {
          zh: [m.which + ' θ = ' + (m.which === 'sin' ? '對邊 ÷ 斜邊' : m.which === 'cos' ? '鄰邊 ÷ 斜邊' : '對邊 ÷ 鄰邊') + '。', '= ' + p.answer.n + '/' + p.answer.d + '。'],
          en: [m.which + ' θ = ' + (m.which === 'sin' ? 'opposite ÷ hypotenuse' : m.which === 'cos' ? 'adjacent ÷ hypotenuse' : 'opposite ÷ adjacent') + '.', '= ' + p.answer.n + '/' + p.answer.d + '.']
        };
      case 'ap':
        if (m.mode === 'sum') {
          return {
            zh: ['末項 = ' + m.a + ' + (' + m.n + ' − 1) × ' + m.d + ' = ' + (m.a + (m.n - 1) * m.d) + '。', '和 = n/2 × (首項 + 末項) = ' + m.n + '/2 × (' + m.a + ' + ' + (m.a + (m.n - 1) * m.d) + ') = ' + p.answer + '。'],
            en: ['Last term = ' + m.a + ' + (' + m.n + ' − 1) × ' + m.d + ' = ' + (m.a + (m.n - 1) * m.d) + '.', 'Sum = n/2 × (first + last) = ' + m.n + '/2 × (' + m.a + ' + ' + (m.a + (m.n - 1) * m.d) + ') = ' + p.answer + '.']
          };
        }
        if (m.mode === 'findN') {
          return {
            zh: ['由 ' + m.a + ' + (n − 1) × ' + m.d + ' = ' + m.value + '，得 (n − 1) × ' + m.d + ' = ' + (m.value - m.a) + '。', 'n − 1 = ' + ((m.value - m.a) / m.d) + '，所以 n = ' + p.answer + '。'],
            en: ['From ' + m.a + ' + (n − 1) × ' + m.d + ' = ' + m.value + ', (n − 1) × ' + m.d + ' = ' + (m.value - m.a) + '.', 'n − 1 = ' + ((m.value - m.a) / m.d) + ', so n = ' + p.answer + '.']
          };
        }
        return {
          zh: ['第 n 項 = 首項 + (n − 1) × 公差。', '= ' + m.a + ' + (' + m.n + ' − 1) × ' + m.d + ' = ' + p.answer + '。'],
          en: ['nth term = first + (n − 1) × difference.', '= ' + m.a + ' + (' + m.n + ' − 1) × ' + m.d + ' = ' + p.answer + '.']
        };
      case 'gp':
        return {
          zh: ['第 $n$ 項 $a_n = a r^{n-1}$。', '= $' + m.a + ' \\times ' + m.r + '^{' + (m.n - 1) + '} = ' + p.answer + '$。'],
          en: ['nth term $a_n = a r^{n-1}$.', '= $' + m.a + ' \\times ' + m.r + '^{' + (m.n - 1) + '} = ' + p.answer + '$.'],
        };
      case 'prob':
        return {
          zh: ['概率 = 紅球數 ÷ 總數。', '= ' + m.good + '/' + m.total + '。'],
          en: ['Probability = red ÷ total.', '= ' + m.good + '/' + m.total + '.']
        };
      case 'quad':
        return {
          zh: [m.askSum ? '兩根之和 = −(x 的係數)。' : '兩根之積 = 常數項。', '= ' + p.answer + '。'],
          en: [m.askSum ? 'Sum of roots = −(coefficient of x).' : 'Product of roots = constant term.', '= ' + p.answer + '.']
        };
      case 'stats':
        if (m.mode === 'mean') {
          var totalStats = m.nums.reduce(function (s, x) { return s + x; }, 0);
          return {
            zh: ['全部加起來：' + m.nums.join(' + ') + ' = ' + totalStats + '。', '平均數 = ' + totalStats + ' ÷ ' + m.nums.length + ' = ' + p.answer + '。'],
            en: ['Add them all: ' + m.nums.join(' + ') + ' = ' + totalStats + '.', 'Mean = ' + totalStats + ' ÷ ' + m.nums.length + ' = ' + p.answer + '.']
          };
        }
        return {
          zh: ['把數字由小到大排列：' + m.sorted.join('、') + '。', '取中間那個 = ' + p.answer + '。'],
          en: ['Sort the numbers: ' + m.sorted.join(', ') + '.', 'Take the middle one = ' + p.answer + '.']
        };
      case 'triangle':
        return {
          zh: ['三角形面積 = 底 × 高 ÷ 2。', '= ' + m.b + ' × ' + m.h + ' ÷ 2 = ' + p.answer + '。'],
          en: ['Triangle area = base × height ÷ 2.', '= ' + m.b + ' × ' + m.h + ' ÷ 2 = ' + p.answer + '.']
        };
      case 'circle':
        if (m.mode === 'area') {
          return {
            zh: ['圓面積 = π r²。', '= π × ' + m.r + '² = ' + p.answer + '。'],
            en: ['Area = π r².', '= π × ' + m.r + '² = ' + p.answer + '.']
          };
        }
        return {
          zh: ['圓周長 = 2π r。', '= 2 × π × ' + m.r + ' = ' + p.answer + '。'],
          en: ['Circumference = 2π r.', '= 2 × π × ' + m.r + ' = ' + p.answer + '.']
        };
      case 'volume':
        return {
          zh: ['體積 = 長 × 闊 × 高。', '= ' + m.l + ' × ' + m.w + ' × ' + m.h + ' = ' + p.answer + '。'],
          en: ['Volume = length × width × height.', '= ' + m.l + ' × ' + m.w + ' × ' + m.h + ' = ' + p.answer + '.']
        };
      case 'coord':
        if (m.mode === 'dist') {
          var dxv = m.b[0] - m.a[0], dyv = m.b[1] - m.a[1];
          return {
            zh: ['△x = ' + dxv + '，△y = ' + dyv + '。', '長度 = √(' + (dxv * dxv) + ' + ' + (dyv * dyv) + ') = ' + p.answer + '。'],
            en: ['△x = ' + dxv + ', △y = ' + dyv + '.', 'Length = √(' + (dxv * dxv) + ' + ' + (dyv * dyv) + ') = ' + p.answer + '.']
          };
        }
        return {
          zh: ['中點 x = (' + m.a[0] + ' + ' + m.b[0] + ') ÷ 2 = ' + m.mx + '。', '中點 y = (' + m.a[1] + ' + ' + m.b[1] + ') ÷ 2 = ' + m.my + '。', '中點 = ' + p.answer + '。'],
          en: ['mid x = (' + m.a[0] + ' + ' + m.b[0] + ') ÷ 2 = ' + m.mx + '.', 'mid y = (' + m.a[1] + ' + ' + m.b[1] + ') ÷ 2 = ' + m.my + '.', 'midpoint = ' + p.answer + '.']
        };
      case 'word':
        if (m.op === 'add') {
          return {
            zh: ['先看「又得到」，用加法。', m.a + ' + ' + m.b + ' = ' + p.answer + '。'],
            en: ['The key word is "more", so add.', m.a + ' + ' + m.b + ' = ' + p.answer + '.']
          };
        }
        if (m.op === 'sub') {
          return {
            zh: ['先看「用掉了」，用減法。', m.a + ' − ' + m.b + ' = ' + p.answer + '。'],
            en: ['The key word is "uses", so subtract.', m.a + ' − ' + m.b + ' = ' + p.answer + '.']
          };
        }
        if (m.op === 'mul') {
          return {
            zh: ['每盒有 ' + m.a + ' 個，共 ' + m.b + ' 盒，用乘法。', m.a + ' × ' + m.b + ' = ' + p.answer + '。'],
            en: ['Each box has ' + m.a + ', with ' + m.b + ' boxes, so multiply.', m.a + ' × ' + m.b + ' = ' + p.answer + '.']
          };
        }
        if (m.op === 'wtwostep') {
          return {
            zh: ['先算每盒的總數，再減去送出的。', m.a + ' × ' + m.b + ' − ' + m.c + ' = ' + p.answer + '。'],
            en: ['Find the total in the boxes first, then subtract what is given away.', m.a + ' × ' + m.b + ' − ' + m.c + ' = ' + p.answer + '.']
          };
        }
        if (m.op === 'warea') {
          return {
            zh: ['面積 = 長 × 闊。', '= ' + m.a + ' × ' + m.b + ' = ' + p.answer + '。'],
            en: ['Area = length × width.', '= ' + m.a + ' × ' + m.b + ' = ' + p.answer + '.']
          };
        }
        if (m.op === 'wpercent') {
          return {
            zh: ['減價後售價 = 原價 × (100 − ' + m.b + ')% 。', '= ' + m.a + ' × ' + (100 - m.b) + '% = ' + p.answer + '。'],
            en: ['New price = original × (100 − ' + m.b + ')%.', '= ' + m.a + ' × ' + (100 - m.b) + '% = ' + p.answer + '.']
          };
        }
        if (m.op === 'wratio') {
          return {
            zh: ['先求一份：' + m.a + ' ÷ 總份數。', '乙佔一份的比例，答案 = ' + p.answer + '。'],
            en: ['Find one share first.', 'B\'s share = ' + p.answer + '.']
          };
        }
        if (m.op === 'wspeed') {
          return {
            zh: ['距離 = 速率 × 時間。', '= ' + m.a + ' × (' + m.b + '/60) = ' + p.answer + ' km。'],
            en: ['Distance = speed × time.', '= ' + m.a + ' × (' + m.b + '/60) = ' + p.answer + ' km.']
          };
        }
        if (m.op === 'wprofit') {
          return {
            zh: ['盈利 = 售價 − 成本；盈利百分率 = 盈利 ÷ 成本 × 100%。', '= ' + p.answer + '%。'],
            en: ['Profit = selling − cost; profit % = profit ÷ cost × 100%.', '= ' + p.answer + '%.']
          };
        }
        if (m.op === 'wcompound') {
          return {
            zh: ['本利和 = 本金 × (1 + 利率)^年數。', '= ' + m.a + ' × (1 + ' + m.b + '%)² = ' + p.answer + '。'],
            en: ['Amount = principal × (1 + rate)^years.', '= ' + m.a + ' × (1 + ' + m.b + '%)² = ' + p.answer + '.']
          };
        }
        if (m.op === 'wunit') {
          return {
            zh: ['先求一件的價錢：' + m.cost1 + ' ÷ ' + m.n1 + ' = ' + m.unit + '。', m.n2 + ' 件 = ' + m.unit + ' × ' + m.n2 + ' = ' + p.answer + '。'],
            en: ['One item costs ' + m.cost1 + ' ÷ ' + m.n1 + ' = ' + m.unit + '.', m.n2 + ' items cost ' + m.unit + ' × ' + m.n2 + ' = ' + p.answer + '.']
          };
        }
        if (m.op === 'wmoney2') {
          return {
            zh: ['筆：' + m.p1 + ' × ' + m.n1 + ' = ' + (m.p1 * m.n1) + '；尺：' + m.p2 + ' × ' + m.n2 + ' = ' + (m.p2 * m.n2) + '。', '共 ' + m.total + '，找續 = ' + m.paid + ' − ' + m.total + ' = ' + p.answer + '。'],
            en: ['Pens: ' + m.p1 + ' × ' + m.n1 + ' = ' + (m.p1 * m.n1) + '; rulers: ' + m.p2 + ' × ' + m.n2 + ' = ' + (m.p2 * m.n2) + '.', 'Total ' + m.total + ', change = ' + m.paid + ' − ' + m.total + ' = ' + p.answer + '.']
          };
        }
        if (m.op === 'wreverse') {
          return {
            zh: ['售價 = 原價 × (100 − ' + m.disc + ')% = 原價 × ' + (100 - m.disc) + '%。', '原價 = ' + m.price + ' ÷ ' + (100 - m.disc) + '% = ' + p.answer + '。'],
            en: ['Sale price = original × (100 − ' + m.disc + ')% = original × ' + (100 - m.disc) + '%.', 'Original = ' + m.price + ' ÷ ' + (100 - m.disc) + '% = ' + p.answer + '.']
          };
        }
        if (m.op === 'wprofit2') {
          return {
            zh: ['總成本 = ' + m.n + ' × ' + m.cost + ' = ' + (m.n * m.cost) + '。', '盈利 = 售價 − 成本 = ' + m.sell + ' − ' + (m.n * m.cost) + ' = ' + p.answer + '。'],
            en: ['Total cost = ' + m.n + ' × ' + m.cost + ' = ' + (m.n * m.cost) + '.', 'Profit = selling − cost = ' + m.sell + ' − ' + (m.n * m.cost) + ' = ' + p.answer + '.']
          };
        }
        if (m.op === 'wratio2') {
          return {
            zh: ['相差 ' + (m.q - m.p) + ' 份 = ' + m.diff + ' 人，所以一份 = ' + m.k + ' 人。', '共有 (' + m.p + ' + ' + m.q + ') × ' + m.k + ' = ' + p.answer + ' 人。'],
            en: ['The difference is ' + (m.q - m.p) + ' parts = ' + m.diff + ', so one part = ' + m.k + '.', 'Total = (' + m.p + ' + ' + m.q + ') × ' + m.k + ' = ' + p.answer + '.']
          };
        }
        if (m.op === 'wrate2') {
          return {
            zh: ['速率 = 距離 ÷ 時間 = ' + (m.rate * m.t1) + ' ÷ ' + m.t1 + ' = ' + m.rate + ' km/h。', m.t2 + ' 小時 = ' + m.rate + ' × ' + m.t2 + ' = ' + p.answer + ' km。'],
            en: ['Speed = distance ÷ time = ' + (m.rate * m.t1) + ' ÷ ' + m.t1 + ' = ' + m.rate + ' km/h.', 'In ' + m.t2 + ' hours: ' + m.rate + ' × ' + m.t2 + ' = ' + p.answer + ' km.']
          };
        }
        if (m.op === 'wgeo2') {
          return {
            zh: ['面積 = ' + m.l + ' × ' + m.w + ' = ' + (m.l * m.w) + ' m²。', '費用 = ' + (m.l * m.w) + ' × ' + m.cost + ' = ' + p.answer + '。'],
            en: ['Area = ' + m.l + ' × ' + m.w + ' = ' + (m.l * m.w) + ' m².', 'Cost = ' + (m.l * m.w) + ' × ' + m.cost + ' = ' + p.answer + '.']
          };
        }
        if (m.op === 'wdata2') {
          var priorTotal = m.scores.reduce(function (s, x) { return s + x; }, 0);
          return {
            zh: ['目標總分 = ' + m.target + ' × ' + m.n + ' = ' + (m.target * m.n) + '。', '現有總分 = ' + priorTotal + '。', '所需分數 = ' + (m.target * m.n) + ' − ' + priorTotal + ' = ' + p.answer + ' 分。'],
            en: ['Target total = ' + m.target + ' × ' + m.n + ' = ' + (m.target * m.n) + '.', 'Current total = ' + priorTotal + '.', 'Needed score = ' + (m.target * m.n) + ' − ' + priorTotal + ' = ' + p.answer + '.']
          };
        }
        if (m.op === 'wtable') {
          return {
            zh: ['逐項計價：' + m.prices[0] + '×' + m.qty[0] + ' + ' + m.prices[1] + '×' + m.qty[1] + ' + ' + m.prices[2] + '×' + m.qty[2] + ' = ' + m.total + '。', '找續 = ' + m.paid + ' − ' + m.total + ' = ' + p.answer + '。'],
            en: ['Price each line: ' + m.prices[0] + '×' + m.qty[0] + ' + ' + m.prices[1] + '×' + m.qty[1] + ' + ' + m.prices[2] + '×' + m.qty[2] + ' = ' + m.total + '.', 'Change = ' + m.paid + ' − ' + m.total + ' = ' + p.answer + '.']
          };
        }
        if (m.op === 'wequation') {
          return {
            zh: ['先減去 ' + m.b + '：' + m.a + 'x = ' + (m.result - m.b) + '。', '兩邊除以 ' + m.a + '：x = ' + p.answer + '。'],
            en: ['Subtract ' + m.b + ' first: ' + m.a + 'x = ' + (m.result - m.b) + '.', 'Divide by ' + m.a + ': x = ' + p.answer + '.']
          };
        }
        if (m.op === 'wunitconv') {
          return {
            zh: ['1 ' + m.from + ' = ' + m.factor + ' ' + m.to + '。', m.value + ' × ' + m.factor + ' = ' + p.answer + '。'],
            en: ['1 ' + m.from + ' = ' + m.factor + ' ' + m.to + '.', m.value + ' × ' + m.factor + ' = ' + p.answer + '.']
          };
        }
        if (m.op === 'wremainder') {
          return m.mode === 'left'
            ? { zh: [m.n + ' ÷ ' + m.per + ' = ' + Math.floor(m.n / m.per) + ' 餘 ' + (m.n % m.per) + '。', '剩下 ' + p.answer + ' 個。'], en: [m.n + ' ÷ ' + m.per + ' = ' + Math.floor(m.n / m.per) + ' remainder ' + (m.n % m.per) + '.', 'There are ' + p.answer + ' left over.'] }
            : { zh: [m.n + ' ÷ ' + m.per + ' = ' + p.answer + ' 餘 ' + (m.n % m.per) + '。', '可以裝滿 ' + p.answer + ' 盒。'], en: [m.n + ' ÷ ' + m.per + ' = ' + p.answer + ' remainder ' + (m.n % m.per) + '.', 'That makes ' + p.answer + ' full boxes.'] };
        }
        if (m.op === 'wpctchain') {
          return {
            zh: ['先加價：' + m.base + ' × (1 + ' + m.p1 + '%) = ' + (m.base * (100 + m.p1) / 100) + '。', '再減價：× (1 − ' + m.p2 + '%) = ' + p.answer + '。'],
            en: ['Increase first: ' + m.base + ' × (1 + ' + m.p1 + '%) = ' + (m.base * (100 + m.p1) / 100) + '.', 'Then reduce: × (1 − ' + m.p2 + '%) = ' + p.answer + '.']
          };
        }
        if (m.op === 'wthreepart') {
          return {
            zh: ['總份數 = ' + m.a + ' + ' + m.b + ' + ' + m.c + ' = ' + (m.a + m.b + m.c) + '。', '一份 = ' + m.total + ' ÷ ' + (m.a + m.b + m.c) + ' = ' + m.unit + '；第一人得 ' + p.answer + '。'],
            en: ['Total parts = ' + m.a + ' + ' + m.b + ' + ' + m.c + ' = ' + (m.a + m.b + m.c) + '.', 'One part = ' + m.total + ' ÷ ' + (m.a + m.b + m.c) + ' = ' + m.unit + '; the first person gets ' + p.answer + '.']
          };
        }
        return null;
      case 'perimeter':
        return {
          zh: ['周界 = 2 × (長 + 闊)。', '= 2 × (' + m.l + ' + ' + m.w + ') = ' + p.answer + '。'],
          en: ['Perimeter = 2 × (length + width).', '= 2 × (' + m.l + ' + ' + m.w + ') = ' + p.answer + '.']
        };
      case 'polygon':
        return {
          zh: ['內角和 = (n − 2) × 180°。', '= (' + m.n + ' − 2) × 180° = ' + p.answer + '°。'],
          en: ['Sum = (n − 2) × 180°.', '= (' + m.n + ' − 2) × 180° = ' + p.answer + '°.']
        };
      case 'angle':
        return {
          zh: ['記住：直角 = 90°。', '所以答案是 ' + p.answer + '°。'],
          en: ['Remember: a right angle is 90°.', 'So the answer is ' + p.answer + '°.']
        };
      case 'money':
        return {
          zh: ['找續 = 付的錢 − 價錢。', '= ' + m.a + ' − ' + m.b + ' = ' + p.answer + '。'],
          en: ['Change = paid − price.', '= ' + m.a + ' − ' + m.b + ' = ' + p.answer + '.']
        };
      case 'fact':
        return {
          zh: ['想一想常用的單位換算。', '答案是 ' + p.answer + '。'],
          en: ['Recall the common conversion.', 'The answer is ' + p.answer + '.']
        };
      case 'quadsolve':
        return {
          zh: ['因式分解：(x − ' + m.p + ')(x − ' + m.q + ') = 0。', '根是 ' + m.p + ' 和 ' + m.q + '，較大的根 = ' + p.answer + '。'],
          en: ['Factorise: (x − ' + m.p + ')(x − ' + m.q + ') = 0.', 'Roots are ' + m.p + ' and ' + m.q + '; larger root = ' + p.answer + '.']
        };
      case 'line':
        return {
          zh: ['斜率 = (y2 − y1) ÷ (x2 − x1)。', '= (' + m.b[1] + ' − ' + m.a[1] + ') ÷ (' + m.b[0] + ' − ' + m.a[0] + ') = ' + p.answer + '。'],
          en: ['Slope = (y2 − y1) ÷ (x2 − x1).', '= (' + m.b[1] + ' − ' + m.a[1] + ') ÷ (' + m.b[0] + ' − ' + m.a[0] + ') = ' + p.answer + '.']
        };
      case 'variation':
        return {
          zh: ['y = kx；由 x = ' + m.a + '、y = ' + (m.k * m.a) + ' 得 k = ' + m.k + '。', '所以 y = ' + m.k + ' × ' + m.c + ' = ' + p.answer + '。'],
          en: ['y = kx; from x = ' + m.a + ', y = ' + (m.k * m.a) + ' we get k = ' + m.k + '.', 'So y = ' + m.k + ' × ' + m.c + ' = ' + p.answer + '.']
        };
      case 'oddeven':
        if (m.mode === 'nexteven') {
          return {
            zh: ['偶數是 2、4、6、8…，逐個加 2。', m.n + ' + 2 = ' + p.answer + '。'],
            en: ['Even numbers are 2, 4, 6, 8…; add 2 each time.', m.n + ' + 2 = ' + p.answer + '.']
          };
        }
        if (m.mode === 'nextodd') {
          return {
            zh: ['奇數是 1、3、5、7…，逐個加 2。', m.n + ' + 2 = ' + p.answer + '。'],
            en: ['Odd numbers are 1, 3, 5, 7…; add 2 each time.', m.n + ' + 2 = ' + p.answer + '.']
          };
        }
        return {
          zh: ['逐個數：' + (m.mode === 'counteven' ? '2、4、6…' : '1、3、5…'), '共有 ' + p.answer + ' 個。'],
          en: ['Count: ' + (m.mode === 'counteven' ? '2, 4, 6…' : '1, 3, 5…'), 'There are ' + p.answer + ' of them.']
        };
      case 'shape':
        return {
          zh: ['想一想這個圖形有幾條邊／幾個面。', '答案是 ' + p.answer + '。'],
          en: ['Think about how many sides / faces the shape has.', 'The answer is ' + p.answer + '.']
        };
      case 'symmetry':
        return {
          zh: ['想像沿著直線對摺，看兩邊能否完全重疊。', '對稱軸有 ' + p.answer + ' 條。'],
          en: ['Imagine folding along a line so both halves match.', 'There are ' + p.answer + ' lines of symmetry.']
        };
      case 'liketerms':
        return {
          zh: ['同類項相加減：係數相加減。', m.a + ' ' + (m.mode === 'sub' ? '− ' : '+ ') + m.b + ' = ' + p.answer + '。'],
          en: ['Add/subtract like terms by adding/subtracting coefficients.', m.a + ' ' + (m.mode === 'sub' ? '− ' : '+ ') + m.b + ' = ' + p.answer + '.']
        };
      case 'polycoeff':
        if (m.mode === 'deg') {
          return {
            zh: ['次數 = 最高次項的指數。', 'x^' + m.d + ' 的指數是 ' + m.d + '。'],
            en: ['Degree = the highest exponent.', 'The exponent of x^' + m.d + ' is ' + m.d + '.']
          };
        }
        return {
          zh: ['係數 = 該項前面的數。', 'x^' + m.d + ' 前面的數是 ' + p.answer + '。'],
          en: ['Coefficient = the number in front of the term.', 'The number in front of x^' + m.d + ' is ' + p.answer + '.']
        };
      case 'arclen':
        return {
          zh: ['弧長 = 2πr × (圓心角 ÷ 360°)。', '= 2π × ' + m.r + ' × (' + m.angle + '/360) = ' + p.answer + '。'],
          en: ['Arc length = 2πr × (angle ÷ 360°).', '= 2π × ' + m.r + ' × (' + m.angle + '/360) = ' + p.answer + '.']
        };
      case 'mode':
        return {
          zh: ['眾數 = 出現次數最多的數。', '答案是 ' + p.answer + '。'],
          en: ['Mode = the most frequent value.', 'The answer is ' + p.answer + '.']
        };
      case 'asum':
        return {
          zh: ['和 = n/2 × (首項 + 末項)。', '末項 = ' + (m.a + (m.n - 1) * m.d) + '，和 = ' + p.answer + '。'],
          en: ['Sum = n/2 × (first + last).', 'Last = ' + (m.a + (m.n - 1) * m.d) + ', sum = ' + p.answer + '.']
        };
      case 'invvar':
        return {
          zh: ['y = k/x；k = xy = ' + m.a + ' × ' + (m.k / m.a) + ' = ' + m.k + '。', 'x = ' + m.c + ' 時，y = ' + m.k + '/' + m.c + ' = ' + p.answer + '。'],
          en: ['y = k/x; k = xy = ' + m.a + ' × ' + (m.k / m.a) + ' = ' + m.k + '.', 'When x = ' + m.c + ', y = ' + m.k + '/' + m.c + ' = ' + p.answer + '.']
        };
      case 'comb':
        return {
          zh: [m.mode === 'P' ? '排列：n! ÷ (n−r)!' : '組合：n! ÷ (r!(n−r)!)', m.mode + '(' + m.n + ',' + m.r + ') = ' + p.answer + '。'],
          en: [m.mode === 'P' ? 'Permutation: n! ÷ (n−r)!' : 'Combination: n! ÷ (r!(n−r)!)', m.mode + '(' + m.n + ',' + m.r + ') = ' + p.answer + '.']
        };
      case 'range':
        return {
          zh: ['分佈域 = 最大 − 最小。', '= ' + Math.max.apply(null, m.nums) + ' − ' + Math.min.apply(null, m.nums) + ' = ' + p.answer + '。'],
          en: ['Range = max − min.', '= ' + Math.max.apply(null, m.nums) + ' − ' + Math.min.apply(null, m.nums) + ' = ' + p.answer + '.']
        };
      case 'circleeq':
        return {
          zh: ['圓方程 x² + y² = r²，半徑 = r。', 'r² = ' + (m.r * m.r) + '，所以 r = ' + p.answer + '。'],
          en: ['Circle equation x² + y² = r², radius = r.', 'r² = ' + (m.r * m.r) + ', so r = ' + p.answer + '.']
        };
      case 'parallel':
        return {
          zh: [m.mode === 'int' ? '同側內角互補（和 = 180°）。' : '平行線的同位角／內錯角相等。', m.mode === 'int' ? '180° − ' + m.a + '° = ' + p.answer + '°。' : '所以答案是 ' + p.answer + '°。'],
          en: [m.mode === 'int' ? 'Co-interior angles sum to 180°.' : 'Corresponding / alternate angles are equal.', m.mode === 'int' ? '180° − ' + m.a + '° = ' + p.answer + '°.' : 'So the answer is ' + p.answer + '°.']
        };
      case 'sqrt':
        return {
          zh: ['找一個數，自乘等於 ' + (m.base * m.base) + '。', m.base + ' × ' + m.base + ' = ' + (m.base * m.base) + '，所以 = ' + p.answer + '。'],
          en: ['Find a number whose square is ' + (m.base * m.base) + '.', m.base + ' × ' + m.base + ' = ' + (m.base * m.base) + ', so = ' + p.answer + '.']
        };
      case 'congruent':
        return {
          zh: ['全等三角形對應邊、對應角相等。', '答案是 ' + p.answer + '。'],
          en: ['Congruent triangles have equal sides and angles.', 'The answer is ' + p.answer + '.']
        };
      case 'similar':
        return {
          zh: [m.mode === 'scale' ? '放大 k 倍，對應邊也是 k 倍。' : '放大倍數 = 對應邊之比。', '答案是 ' + p.answer + '。'],
          en: [m.mode === 'scale' ? 'Enlarging by k makes sides k times longer.' : 'Scale factor = ratio of corresponding sides.', 'The answer is ' + p.answer + '.']
        };
      case 'quadshape':
        return {
          zh: ['想一想這個四邊形的性質。', '答案是 ' + p.answer + '。'],
          en: ['Think about the quadrilateral\'s properties.', 'The answer is ' + p.answer + '.']
        };
      case 'cylinder':
        return {
          zh: [m.mode === 'vol' ? '體積 = π r² h。' : '側面積 = 2π r h。', '= ' + p.answer + '。'],
          en: [m.mode === 'vol' ? 'Volume = π r² h.' : 'Curved surface area = 2π r h.', '= ' + p.answer + '.']
        };
      case 'sinterest':
        return {
          zh: ['單利息 = 本金 × 利率 × 年數。', '= ' + m.p + ' × ' + m.r + '% × ' + m.n + ' = ' + p.answer + '。'],
          en: ['Simple interest = principal × rate × years.', '= ' + m.p + ' × ' + m.r + '% × ' + m.n + ' = ' + p.answer + '.']
        };
      case 'expand':
        return {
          zh: ['(x + a)(x + b) = x² + (a+b)x + ab。', m.mode === 'coeff' ? 'x 的係數 = ' + m.a + ' + ' + m.b + ' = ' + p.answer + '。' : '常數項 = ' + m.a + ' × ' + m.b + ' = ' + p.answer + '。'],
          en: ['(x + a)(x + b) = x² + (a+b)x + ab.', m.mode === 'coeff' ? 'Coefficient of x = ' + m.a + ' + ' + m.b + ' = ' + p.answer + '.' : 'Constant term = ' + m.a + ' × ' + m.b + ' = ' + p.answer + '.']
        };
      case 'pichart':
        return {
          zh: ['圓心角 = 百分比 × 360°。', m.pct + '% × 360° = ' + p.answer + '°。'],
          en: ['Central angle = percentage × 360°.', m.pct + '% × 360° = ' + p.answer + '°.']
        };
      case 'approx':
        if (m.mode === 'range') {
          return {
            zh: ['四捨五入的範圍正好是一個單位。', '最大與最小可能值相差 ' + m.a + '。'],
            en: ['The rounding interval is one whole unit.', 'The largest and smallest possible values differ by ' + m.a + '.']
          };
        }
        return {
          zh: ['最大誤差 = 單位的一半。', m.a + ' ÷ 2 = ' + p.answer + '。'],
          en: ['Max error = half of the unit.', m.a + ' ÷ 2 = ' + p.answer + '.']
        };
      case 'direction':
        if (m.mode === 'turn') {
          return {
            zh: ['每個直角轉 90°，向右是順時針、向左是逆時針。', '最後面向 ' + DIR_LABEL[p.answer].zh + '。'],
            en: ['Each right angle is 90°; right turns are clockwise, left turns anticlockwise.', 'The final direction is ' + DIR_LABEL[p.answer].en + '.']
          };
        }
        if (m.mode === 'opposite') {
          return {
            zh: ['相對的指南針方向相差 180°。', '答案是 ' + DIR_LABEL[p.answer].zh + '。'],
            en: ['Opposite compass directions are 180° apart.', 'The answer is ' + DIR_LABEL[p.answer].en + '.']
          };
        }
        return {
          zh: ['想一想指南針的方向。', '答案是 ' + DIR_LABEL[p.answer].zh + '。'],
          en: ['Think about the compass directions.', 'The answer is ' + DIR_LABEL[p.answer].en + '.']
        };
      case 'time24':
        return {
          zh: ['下午 = 12 小時制 + 12。', '答案是 ' + p.answer + '。'],
          en: ['PM = 12-hour time + 12.', 'The answer is ' + p.answer + '.']
        };
      case 'cone':
        return {
          zh: [m.kind === 'coneV' ? '圓錐體積 = π r² h / 3。' : m.kind === 'sphereV' ? '球體積 = 4π r³ / 3。' : '球表面積 = 4π r²。', '= ' + p.answer + '。'],
          en: [m.kind === 'coneV' ? 'Cone volume = π r² h / 3.' : m.kind === 'sphereV' ? 'Sphere volume = 4π r³ / 3.' : 'Sphere surface area = 4π r².', '= ' + p.answer + '.']
        };
      case 'centre':
        return {
          zh: ['內心＝角平分線，外心＝垂直平分線，重心＝中線，垂心＝高。', '答案是 ' + CENTRE_LABEL[p.answer].zh + '。'],
          en: ['Incentre: angle bisectors; circumcentre: perpendicular bisectors; centroid: medians; orthocentre: altitudes.', 'The answer is ' + CENTRE_LABEL[p.answer].en + '.']
        };
      case 'circleangle':
        return {
          zh: ['圓心角 = 2 × 圓周角（同一弧）。', m.mode === 'centre' ? '2 × ' + m.a + '° = ' + p.answer + '°。' : '圓周角 = ' + (m.a * 2) + '° ÷ 2 = ' + p.answer + '°。'],
          en: ['Central angle = 2 × inscribed angle (same arc).', m.mode === 'centre' ? '2 × ' + m.a + '° = ' + p.answer + '°.' : 'Inscribed angle = ' + (m.a * 2) + '° ÷ 2 = ' + p.answer + '°.']
        };
      case 'binomial':
        return {
          zh: ['x^r 的係數 = C(n, r)。', 'C(' + m.n + ', ' + m.r + ') = ' + p.answer + '。'],
          en: ['Coefficient of x^r = C(n, r).', 'C(' + m.n + ', ' + m.r + ') = ' + p.answer + '.']
        };
      case 'derivative':
        return {
          zh: ['d/dx(ax^n) = a·n·x^(n−1)。', m.mode === 'coeff' ? '係數 = ' + m.a + ' × ' + m.n + ' = ' + p.answer + '。' : '次數 = ' + m.n + ' − 1 = ' + p.answer + '。'],
          en: ['d/dx(ax^n) = a·n·x^(n−1).', m.mode === 'coeff' ? 'Coefficient = ' + m.a + ' × ' + m.n + ' = ' + p.answer + '.' : 'Degree = ' + m.n + ' − 1 = ' + p.answer + '.']
        };
      case 'modpow': {
        var mp = 1;
        var mpZh = ['由 ' + m.a + '^1 開始，每步乘 ' + m.a + ' 並取除以 ' + m.m + ' 的餘數。'];
        var mpEn = ['Start from ' + m.a + '^1; multiply by ' + m.a + ' and take the remainder mod ' + m.m + ' each step.'];
        for (var mi = 0; mi < m.b; mi++) {
          mp = (mp * m.a) % m.m;
          mpZh.push('第 ' + (mi + 1) + ' 次：餘數 ' + mp + '。');
          mpEn.push('Step ' + (mi + 1) + ': remainder ' + mp + '.');
        }
        mpZh.push('所以 ' + m.a + '^' + m.b + ' ÷ ' + m.m + ' 的餘數 = ' + renderValue(p.answer) + '。');
        mpEn.push('So the remainder of ' + m.a + '^' + m.b + ' ÷ ' + m.m + ' is ' + renderValue(p.answer) + '.');
        return { zh: mpZh, en: mpEn };
      }
      case 'gcdlcm': {
        var gv = gcdInt(m.a, m.b);
        if (m.mode === 'gcd') {
          return {
            zh: [m.a + ' 和 ' + m.b + ' 的公因數中最大的是 ' + gv + '。', 'HCF = ' + renderValue(p.answer) + '。'],
            en: ['The largest common factor of ' + m.a + ' and ' + m.b + ' is ' + gv + '.', 'HCF = ' + renderValue(p.answer) + '.']
          };
        }
        return {
          zh: ['先求 HCF = ' + gv + '。', 'LCM = ' + m.a + ' × ' + m.b + ' ÷ ' + gv + ' = ' + renderValue(p.answer) + '。'],
          en: ['First find HCF = ' + gv + '.', 'LCM = ' + m.a + ' × ' + m.b + ' ÷ ' + gv + ' = ' + renderValue(p.answer) + '.']
        };
      }
      case 'remainderSystem':
        return {
          zh: ['逐個檢查滿足除以 ' + m.a + ' 餘 ' + m.r1 + ' 的數：' + m.r1 + '、' + (m.r1 + m.a) + '、' + (m.r1 + 2 * m.a) + '…', '第一個同時除以 ' + m.b + ' 餘 ' + m.r2 + ' 的數是 ' + renderValue(p.answer) + '。'],
          en: ['Check numbers leaving remainder ' + m.r1 + ' mod ' + m.a + ': ' + m.r1 + ', ' + (m.r1 + m.a) + ', ' + (m.r1 + 2 * m.a) + '…', 'The first one that also leaves remainder ' + m.r2 + ' mod ' + m.b + ' is ' + renderValue(p.answer) + '.']
        };
      case 'pathcount': {
        var ptotal = m.m + m.n;
        return {
          zh: ['共要走 ' + ptotal + ' 步，選其中 ' + m.m + ' 步向右。', '路徑數 = C(' + ptotal + ',' + m.m + ') = ' + renderValue(p.answer) + '。'],
          en: ['There are ' + ptotal + ' steps in total; choose ' + m.m + ' of them to go right.', 'Number of paths = C(' + ptotal + ',' + m.m + ') = ' + renderValue(p.answer) + '.']
        };
      }
      case 'handshake':
        return {
          zh: ['每人和其他 ' + (m.n - 1) + ' 人各握一次，共 ' + m.n + ' × ' + (m.n - 1) + ' 次，但每次被數了兩次。', '握手次數 = ' + m.n + ' × ' + (m.n - 1) + ' ÷ 2 = ' + renderValue(p.answer) + '。'],
          en: ['Each of the ' + m.n + ' people shakes ' + (m.n - 1) + ' hands, but every handshake is counted twice.', 'Handshakes = ' + m.n + ' × ' + (m.n - 1) + ' ÷ 2 = ' + renderValue(p.answer) + '.']
        };
      case 'arrange': {
        var countsA = {};
        for (var ai = 0; ai < m.word.length; ai++) countsA[m.word[ai]] = (countsA[m.word[ai]] || 0) + 1;
        var repeated = Object.keys(countsA).filter(function (ch) { return countsA[ch] > 1; }).map(function (ch) { return ch + '×' + countsA[ch]; });
        return {
          zh: ['字母數 ' + m.word.length + '，全排列 ' + m.word.length + '!；重複字母：' + (repeated.length ? repeated.join('、') : '沒有') + '。', '排列數 = ' + renderValue(p.answer) + '。'],
          en: ['There are ' + m.word.length + ' letters: ' + m.word.length + '! arrangements, divided by repeats (' + (repeated.length ? repeated.join(', ') : 'none') + ').', 'Arrangements = ' + renderValue(p.answer) + '.']
        };
      }
      case 'inclusion': {
        var lc = (m.a / gcdInt(m.a, m.b)) * m.b;
        return {
          zh: [m.a + ' 的倍數有 ' + Math.floor(m.n / m.a) + ' 個，' + m.b + ' 的倍數有 ' + Math.floor(m.n / m.b) + ' 個。', '同時是兩者倍數（' + lc + ' 的倍數）有 ' + Math.floor(m.n / lc) + ' 個，所以要減去。', '答案 = ' + renderValue(p.answer) + '。'],
          en: ['There are ' + Math.floor(m.n / m.a) + ' multiples of ' + m.a + ' and ' + Math.floor(m.n / m.b) + ' multiples of ' + m.b + '.', 'Those counted twice are the ' + Math.floor(m.n / lc) + ' multiples of ' + lc + ', so subtract them.', 'Answer = ' + renderValue(p.answer) + '.']
        };
      }
      case 'clockangle': {
        var hourDeg = 30 * m.h + 0.5 * m.m;
        var minDeg = 6 * m.m;
        return {
          zh: ['分針在 ' + minDeg + '°，時針在 ' + hourDeg + '°。', '較小夾角 = ' + renderValue(p.answer) + '°。'],
          en: ['The minute hand is at ' + minDeg + '° and the hour hand at ' + hourDeg + '°.', 'The smaller angle is ' + renderValue(p.answer) + '°.']
        };
      }
      case 'trapezoid':
        return {
          zh: ['梯形面積 = (上底 + 下底) × 高 ÷ 2。', '= (' + m.a + ' + ' + m.b + ') × ' + m.h + ' ÷ 2 = ' + renderValue(p.answer) + ' cm²。'],
          en: ['Area of a trapezium = (sum of parallel sides) × height ÷ 2.', '= (' + m.a + ' + ' + m.b + ') × ' + m.h + ' ÷ 2 = ' + renderValue(p.answer) + ' cm².']
        };
      case 'seqnext': {
        var ruleZh, ruleEn;
        if (m.mode === 'triangle') { ruleZh = '每項是 1+2+…+k（三角數）。'; ruleEn = 'Each term is a triangular number 1+2+…+k.'; }
        else if (m.mode === 'fib') { ruleZh = '每項是前兩項之和。'; ruleEn = 'Each term is the sum of the previous two.'; }
        else if (m.mode === 'mixed') { ruleZh = '每項 = 前一項 × 2 + ' + m.add + '。'; ruleEn = 'Each term = previous × 2 + ' + m.add + '.'; }
        else { ruleZh = '每項是 k² + 1。'; ruleEn = 'Each term is k² + 1.'; }
        return {
          zh: [ruleZh, '下一個數 = ' + renderValue(p.answer) + '。'],
          en: [ruleEn, 'The next number is ' + renderValue(p.answer) + '.']
        };
      }
      case 'pigeon':
        return {
          zh: ['最壞情況：先每種顏色各取 ' + (m.k - 1) + ' 隻，共 ' + m.colors + ' × ' + (m.k - 1) + ' = ' + (m.colors * (m.k - 1)) + ' 隻。', '再多取一隻就保證有 ' + m.k + ' 隻同色，所以最少 = ' + renderValue(p.answer) + ' 隻。'],
          en: ['Worst case: take ' + (m.k - 1) + ' of each colour = ' + m.colors + ' × ' + (m.k - 1) + ' = ' + (m.colors * (m.k - 1)) + '.', 'One more guarantees ' + m.k + ' of a colour, so the minimum is ' + renderValue(p.answer) + '.']
        };
      case 'workrate':
        return {
          zh: ['甲每天完成 1/' + m.a + '，乙每天完成 1/' + m.b + '。', '合作所需時間 = 1 ÷ (1/' + m.a + ' + 1/' + m.b + ') = ' + renderValue(p.answer) + ' 天。'],
          en: ['Ann does 1/' + m.a + ' of the job per day; Ben does 1/' + m.b + '.', 'Time together = 1 ÷ (1/' + m.a + ' + 1/' + m.b + ') = ' + renderValue(p.answer) + ' days.']
        };
      case 'mixture':
        return {
          zh: ['兩杯的糖量共 ' + m.x + ' × ' + m.p1 + '% + ' + m.y + ' × ' + m.p2 + '% = ' + (m.x * m.p1 / 100 + m.y * m.p2 / 100) + ' 升。', '濃度 = 糖量 ÷ 總體積 × 100% = ' + renderValue(p.answer) + '%。'],
          en: ['Sugar = ' + m.x + ' × ' + m.p1 + '% + ' + m.y + ' × ' + m.p2 + '% = ' + (m.x * m.p1 / 100 + m.y * m.p2 / 100) + ' litres.', 'Concentration = sugar ÷ total volume × 100% = ' + renderValue(p.answer) + '%.']
        };
      case 'diceprob': {
        var ways = 6 - Math.abs(m.s - 7);
        return {
          zh: ['和為 ' + m.s + ' 的組合有 ' + ways + ' 個，全部結果有 36 個。', '概率 = ' + ways + '/36 = ' + renderValue(p.answer) + '。'],
          en: ['There are ' + ways + ' outcomes with sum ' + m.s + ' out of 36 equally likely outcomes.', 'Probability = ' + ways + '/36 = ' + renderValue(p.answer) + '.']
        };
      }
      case 'coinprob': {
        var succ = factInt(m.n) / (factInt(m.k) * factInt(m.n - m.k));
        return {
          zh: ['剛好 ' + m.k + ' 個正面的組合有 C(' + m.n + ',' + m.k + ') = ' + succ + ' 個。', '概率 = ' + succ + '/2^' + m.n + ' = ' + renderValue(p.answer) + '。'],
          en: ['There are C(' + m.n + ',' + m.k + ') = ' + succ + ' ways to get exactly ' + m.k + ' heads.', 'Probability = ' + succ + '/2^' + m.n + ' = ' + renderValue(p.answer) + '.']
        };
      }
      case 'lastdigit': {
        var ld = 1;
        var ldZh = ['只看個位：每次乘 ' + m.a + ' 後取個位。'];
        var ldEn = ['Keep only the units digit: multiply by ' + m.a + ' and take the last digit each step.'];
        for (var li = 0; li < m.b; li++) {
          ld = (ld * m.a) % 10;
          ldZh.push('第 ' + (li + 1) + ' 次：個位 ' + ld + '。');
          ldEn.push('Step ' + (li + 1) + ': units digit ' + ld + '.');
        }
        ldZh.push('所以 ' + m.a + '^' + m.b + ' 的個位數字 = ' + renderValue(p.answer) + '。');
        ldEn.push('So the units digit of ' + m.a + '^' + m.b + ' is ' + renderValue(p.answer) + '.');
        return { zh: ldZh, en: ldEn };
      }
      case 'gridrect':
        return {
          zh: ['選兩條橫線：C(' + (m.m + 1) + ',2) = ' + (m.m * (m.m + 1) / 2) + ' 種。', '選兩條直線：C(' + (m.n + 1) + ',2) = ' + (m.n * (m.n + 1) / 2) + ' 種。', '長方形總數 = 兩者相乘 = ' + renderValue(p.answer) + '。'],
          en: ['Choose two horizontal lines: C(' + (m.m + 1) + ',2) = ' + (m.m * (m.m + 1) / 2) + '.', 'Choose two vertical lines: C(' + (m.n + 1) + ',2) = ' + (m.n * (m.n + 1) / 2) + '.', 'Total rectangles = product = ' + renderValue(p.answer) + '.']
        };
      case 'polygonsum':
        if (m.mode === 'sum') {
          return {
            zh: ['n 邊形可分成 (n − 2) 個三角形。', '(' + m.n + ' − 2) × 180° = ' + renderValue(p.answer) + '°。'],
            en: ['An n-gon can be split into (n − 2) triangles.', '(' + m.n + ' − 2) × 180° = ' + renderValue(p.answer) + '°.']
          };
        }
        return {
          zh: ['內角和 = (' + m.n + ' − 2) × 180° = ' + ((m.n - 2) * 180) + '°。', '正多邊形每個內角 = 內角和 ÷ ' + m.n + ' = ' + renderValue(p.answer) + '°。'],
          en: ['Sum = (' + m.n + ' − 2) × 180° = ' + ((m.n - 2) * 180) + '°.', 'Each angle of a regular polygon = sum ÷ ' + m.n + ' = ' + renderValue(p.answer) + '°.']
        };
      case 'train': {
        var rel = m.mode === 'towards' ? m.s1 + m.s2 : m.s1 - m.s2;
        return {
          zh: ['相對速率 = ' + (m.mode === 'towards' ? m.s1 + ' + ' + m.s2 : m.s1 + ' − ' + m.s2) + ' = ' + rel + ' km/h。', '時間 = 距離 ÷ 相對速率 = ' + m.d + ' ÷ ' + rel + ' = ' + renderValue(p.answer) + ' 小時。'],
          en: ['Relative speed = ' + (m.mode === 'towards' ? m.s1 + ' + ' + m.s2 : m.s1 + ' − ' + m.s2) + ' = ' + rel + ' km/h.', 'Time = distance ÷ relative speed = ' + m.d + ' ÷ ' + rel + ' = ' + renderValue(p.answer) + ' hours.']
        };
      }
      case 'dicecompare': {
        var dcWays = 0;
        for (var di = 1; di <= 6; di++) for (var dj = 1; dj <= 6; dj++) if (di + dj > m.k) dcWays++;
        return {
          zh: ['點數和大於 ' + m.k + ' 的組合有 ' + dcWays + ' 個（全部 36 個）。', '概率 = ' + dcWays + '/36 = ' + renderValue(p.answer) + '。'],
          en: ['There are ' + dcWays + ' outcomes with sum greater than ' + m.k + ' out of 36.', 'Probability = ' + dcWays + '/36 = ' + renderValue(p.answer) + '.']
        };
      }
      case 'fractiondiff': {
        var fdDen = m.b * m.d;
        var fdNum = m.a * m.d + m.sign * m.c * m.b;
        return {
          zh: ['通分：分母 ' + m.b + ' × ' + m.d + ' = ' + fdDen + '。', m.a + '/' + m.b + ' = ' + (m.a * m.d) + '/' + fdDen + '，' + m.c + '/' + m.d + ' = ' + (m.c * m.b) + '/' + fdDen + '。', '分子合併得 ' + fdNum + '/' + fdDen + ' = ' + renderValue(p.answer) + '。'],
          en: ['Common denominator ' + m.b + ' × ' + m.d + ' = ' + fdDen + '.', m.a + '/' + m.b + ' = ' + (m.a * m.d) + '/' + fdDen + ', ' + m.c + '/' + m.d + ' = ' + (m.c * m.b) + '/' + fdDen + '.', 'Combine numerators: ' + fdNum + '/' + fdDen + ' = ' + renderValue(p.answer) + '.']
        };
      }
      case 'fractionmul':
        return m.mode === 'mul'
          ? { zh: ['分子乘分子、分母乘分母。', '= ' + renderValue(p.answer) + '。'], en: ['Multiply numerators and denominators.', '= ' + renderValue(p.answer) + '.'] }
          : { zh: ['除以 ' + m.c + '/' + m.d + ' 等於乘以 ' + m.d + '/' + m.c + '。', '= ' + renderValue(p.answer) + '。'], en: ['Dividing by ' + m.c + '/' + m.d + ' is multiplying by ' + m.d + '/' + m.c + '.', '= ' + renderValue(p.answer) + '.'] };
      case 'area2':
        if (m.mode === 'parallelogram') return { zh: ['平行四邊形面積 = 底 × 高。', '= ' + m.b + ' × ' + m.h + ' = ' + p.answer + ' cm²。'], en: ['Parallelogram area = base × height.', '= ' + m.b + ' × ' + m.h + ' = ' + p.answer + ' cm².'] };
        if (m.mode === 'triangle') return { zh: ['三角形面積 = 底 × 高 ÷ 2。', '= ' + m.b + ' × ' + m.h + ' ÷ 2 = ' + p.answer + ' cm²。'], en: ['Triangle area = base × height ÷ 2.', '= ' + m.b + ' × ' + m.h + ' ÷ 2 = ' + p.answer + ' cm².'] };
        return { zh: ['梯形面積 = (上底 + 下底) × 高 ÷ 2。', '= (' + m.a + ' + ' + m.b + ') × ' + m.h + ' ÷ 2 = ' + p.answer + ' cm²。'], en: ['Trapezium area = (a + b) × height ÷ 2.', '= (' + m.a + ' + ' + m.b + ') × ' + m.h + ' ÷ 2 = ' + p.answer + ' cm².'] };
      case 'volume1':
        return { zh: ['體積 = 長 × 闊 × 高。', '= ' + m.l + ' × ' + m.w + ' × ' + m.h + ' = ' + p.answer + ' 個小正方體。'], en: ['Volume = length × width × height.', '= ' + m.l + ' × ' + m.w + ' × ' + m.h + ' = ' + p.answer + ' unit cubes.'] };
      case 'rotation':
        return m.mode === 'order'
          ? { zh: ['旋轉對稱的階數 = 邊數。', '正 ' + m.n + ' 邊形有 ' + p.answer + ' 個非零旋轉對稱。'], en: ['Order of rotational symmetry = number of sides.', 'A regular ' + m.n + '-gon has ' + p.answer + ' non-zero rotational symmetries.'] }
          : { zh: ['最小旋轉角 = 360° ÷ 邊數。', '= 360° ÷ ' + m.n + ' = ' + p.answer + '°。'], en: ['Smallest angle = 360° ÷ number of sides.', '= 360° ÷ ' + m.n + ' = ' + p.answer + '°.'] };
      case 'calculus2':
        if (m.mode === 'defint') {
          return {
            zh: ['積分：$\int ax^{n} dx = \frac{a x^{n+1}}{n+1}$。', '代入 0 與 ' + m.b + '：= ' + p.answer + '。'],
            en: ['Integrate: $\int ax^{n} dx = \frac{a x^{n+1}}{n+1}$.', 'Substitute 0 and ' + m.b + ': = ' + p.answer + '.']
          };
        }
        return {
          zh: ['求導：$f\'(x) = a n x^{n-1}$。', '代入 x = ' + m.x + '：= ' + p.answer + '。'],
          en: ['Differentiate: $f\'(x) = a n x^{n-1}$.', 'Substitute x = ' + m.x + ': = ' + p.answer + '.']
        };
      case 'linalg2':
        if (m.mode === 'det') return { zh: ['2×2 行列式 = ad − bc。', '= ' + m.a + '×' + m.d + ' − ' + m.b + '×' + m.c + ' = ' + p.answer + '。'], en: ['2×2 determinant = ad − bc.', '= ' + m.a + '×' + m.d + ' − ' + m.b + '×' + m.c + ' = ' + p.answer + '.'] };
        return { zh: ['矩陣乘法：行乘列。', '左上角 = ' + m.a + '×' + m.e + ' + ' + m.b + '×' + m.g + ' = ' + p.answer + '。'], en: ['Matrix product: row times column.', 'Top-left = ' + m.a + '×' + m.e + ' + ' + m.b + '×' + m.g + ' = ' + p.answer + '.'] };
      case 'stats2': {
        var sMean = m.nums.reduce(function (x, y) { return x + y; }, 0) / m.nums.length;
        var sVar = m.nums.reduce(function (x, y) { return x + (y - sMean) * (y - sMean); }, 0) / m.nums.length;
        return {
          zh: ['平均數 = ' + sMean + '。', '方差 = 各項與平均數差的平方的平均 = ' + sVar + '。', m.mode === 'variance' ? '方差 = ' + p.answer + '。' : '標準差 = √' + sVar + ' = ' + p.answer + '。'],
          en: ['Mean = ' + sMean + '.', 'Variance = average of squared deviations = ' + sVar + '.', m.mode === 'variance' ? 'Variance = ' + p.answer + '.' : 'Standard deviation = √' + sVar + ' = ' + p.answer + '.']
        };
      }
      case 'rounding':
        if (m.mode === 'round') {
          return { zh: ['看要捨入的單位：' + m.unit + '。', m.n + ' 四捨五入至最接近的 ' + m.unit + ' 是 ' + p.answer + '。'], en: ['Look at the rounding unit: ' + m.unit + '.', m.n + ' rounded to the nearest ' + m.unit + ' is ' + p.answer + '.'] };
        }
        return { zh: ['先把每個數取近似值至 ' + m.unit + '。', m.a + ' ≈ ' + (Math.round(m.a / m.unit) * m.unit) + '，' + m.b + ' ≈ ' + (Math.round(m.b / m.unit) * m.unit) + '，和 ≈ ' + p.answer + '。'], en: ['Round each number to the nearest ' + m.unit + '.', m.a + ' ≈ ' + (Math.round(m.a / m.unit) * m.unit) + ', ' + m.b + ' ≈ ' + (Math.round(m.b / m.unit) * m.unit) + ', sum ≈ ' + p.answer + '.'] };
      case 'chartread':
        if (m.mode === 'diff') return { zh: ['最大值減最小值。', '= ' + Math.max.apply(null, m.values) + ' − ' + Math.min.apply(null, m.values) + ' = ' + p.answer + '。'], en: ['Largest minus smallest.', '= ' + Math.max.apply(null, m.values) + ' − ' + Math.min.apply(null, m.values) + ' = ' + p.answer + '.'] };
        if (m.mode === 'total') return { zh: ['把各棒/各點的數值相加。', '總和 = ' + p.answer + '。'], en: ['Add the values.', 'Total = ' + p.answer + '.'] };
        return { zh: ['用最後一點減第一點。', '= ' + m.values[m.values.length - 1] + ' − ' + m.values[0] + ' = ' + p.answer + '。'], en: ['Subtract the first point from the last.', '= ' + m.values[m.values.length - 1] + ' − ' + m.values[0] + ' = ' + p.answer + '.'] };
      case 'circleparts':
        return m.mode === 'diameter'
          ? { zh: ['直徑 = 半徑 × 2。', '= ' + m.r + ' × 2 = ' + p.answer + ' cm。'], en: ['Diameter = radius × 2.', '= ' + m.r + ' × 2 = ' + p.answer + ' cm.'] }
          : { zh: ['半徑 = 直徑 ÷ 2。', '= ' + m.d + ' ÷ 2 = ' + p.answer + ' cm。'], en: ['Radius = diameter ÷ 2.', '= ' + m.d + ' ÷ 2 = ' + p.answer + ' cm.'] };
      case 'ode':
        return { zh: ['歐拉法一步：y₁ = y₀ + h·f(x₀, y₀)。', 'f(x₀, y₀) = ' + m.a + '×' + m.y0 + ' = ' + (m.a * m.y0) + '，所以 y₁ = ' + m.y0 + ' + 1×' + (m.a * m.y0) + ' = ' + p.answer + '。'], en: ['One Euler step: y₁ = y₀ + h·f(x₀, y₀).', 'f(x₀, y₀) = ' + m.a + '×' + m.y0 + ' = ' + (m.a * m.y0) + ', so y₁ = ' + m.y0 + ' + 1×' + (m.a * m.y0) + ' = ' + p.answer + '.'] };
      case 'numtheory':
        if (m.mode === 'phi') return { zh: ['數一數 1 至 ' + m.n + ' 中與 ' + m.n + ' 互質的數。', 'φ(' + m.n + ') = ' + p.answer + '。'], en: ['Count integers 1..' + m.n + ' coprime to ' + m.n + '.', 'φ(' + m.n + ') = ' + p.answer + '.'] };
        return { zh: ['找最小的 x 使 ' + m.a + 'x 除以 ' + m.m + ' 餘 1。', 'x = ' + p.answer + '。'], en: ['Find the smallest x with ' + m.a + 'x ≡ 1 (mod ' + m.m + ').', 'x = ' + p.answer + '.'] };
      case 'fraccompare':
        if (m.mode === 'simplify') return { zh: ['找分子分母的最大公因數。', m.n + '/' + m.d + ' 約至 ' + renderValue(p.answer) + '。'], en: ['Find the gcd of numerator and denominator.', m.n + '/' + m.d + ' simplifies to ' + renderValue(p.answer) + '.'] };
        if (m.mode === 'expand') return { zh: ['分母 ' + m.d + ' 擴成 ' + (m.d * m.k) + '，乘了 ' + m.k + '。', '分子也要乘 ' + m.k + '：' + m.n + ' × ' + m.k + ' = ' + p.answer + '。'], en: ['The denominator ' + m.d + ' becomes ' + (m.d * m.k) + ', multiplied by ' + m.k + '.', 'Multiply the numerator by ' + m.k + ': ' + m.n + ' × ' + m.k + ' = ' + p.answer + '.'] };
        return { zh: ['通分後比較：' + m.n1 + '/' + m.d1 + ' 與 ' + m.n2 + '/' + m.d2 + '。', '較大的是 ' + renderValue(p.answer) + '。'], en: ['Use a common denominator to compare ' + m.n1 + '/' + m.d1 + ' and ' + m.n2 + '/' + m.d2 + '.', 'The larger fraction is ' + renderValue(p.answer) + '.'] };
      case 'decimalmixed':
        if (m.mode === 'add' || m.mode === 'sub') return { zh: ['小數點對齊，再逐位計算。', '= ' + fmtDecimal(m.r) + '。'], en: ['Line up the decimal points and calculate column by column.', '= ' + fmtDecimal(m.r) + '.'] };
        return { zh: ['先當整數計算，再點回小數點。', '= ' + fmtDecimal(m.r) + '。'], en: ['Calculate as whole numbers, then place the decimal point.', '= ' + fmtDecimal(m.r) + '.'] };
      case 'gradanalysis':
        if (m.mode === 'limit') return { zh: ['分子分母同除以 n。', '最高次項係數比 = ' + m.a + ' ÷ ' + m.c + ' = ' + p.answer + '。'], en: ['Divide numerator and denominator by n.', 'Ratio of leading coefficients = ' + m.a + ' ÷ ' + m.c + ' = ' + p.answer + '.'] };
        return { zh: ['無窮等比級數和 = 首項 ÷ (1 − 公比)。', '= ' + m.first + ' ÷ (1 − 1/' + m.den + ') = ' + p.answer + '。'], en: ['Infinite geometric sum = first term ÷ (1 − ratio).', '= ' + m.first + ' ÷ (1 − 1/' + m.den + ') = ' + p.answer + '.'] };
      case 'gradalgebra':
        if (m.mode === 'order') return { zh: ['逐次乘 ' + m.a + ' 並取模 ' + m.p + '。', '第一次回到 1 的次數就是階：' + p.answer + '。'], en: ['Multiply by ' + m.a + ' repeatedly modulo ' + m.p + '.', 'The first return to 1 gives the order: ' + p.answer + '.'] };
        if (m.mode === 'symmetric') return { zh: ['n 個元素的排列數是 n!。', p.answer + ' 個元素。'], en: ['The number of permutations of n elements is n!.', p.answer + ' elements.'] };
        return { zh: ['循環群 Cₙ 的生成元數目 = φ(n)。', 'φ(' + m.n + ') = ' + p.answer + '。'], en: ['The number of generators of Cₙ is φ(n).', 'φ(' + m.n + ') = ' + p.answer + '.'] };
      case 'gradtopology':
        return m.mode === 'discrete'
          ? { zh: ['離散拓撲：所有子集都是開集。', '共 2^' + m.n + ' = ' + p.answer + ' 個。'], en: ['Discrete topology: every subset is open.', '2^' + m.n + ' = ' + p.answer + ' open sets.'] }
          : { zh: ['含指定點 p 的子集有 2^(n−1) 個，再加空集。', '= 1 + 2^' + (m.n - 1) + ' = ' + p.answer + '。'], en: ['There are 2^(n−1) subsets containing p, plus the empty set.', '= 1 + 2^' + (m.n - 1) + ' = ' + p.answer + '.'] };
      case 'gradmeasure':
        return m.mode === 'interval'
          ? { zh: ['區間 [a,b] 的勒貝格測度 = b − a。', '= ' + m.b + ' − ' + m.a + ' = ' + p.answer + '。'], en: ['Lebesgue measure of [a,b] = b − a.', '= ' + m.b + ' − ' + m.a + ' = ' + p.answer + '.'] }
          : { zh: ['計數測度 = 元素個數。', '= ' + m.n + '。'], en: ['Counting measure = number of elements.', '= ' + m.n + '.'] };
      case 'gradgeometry':
        return m.mode === 'curvature'
          ? { zh: ['圓的曲率 κ = 1/r。', 'κ = 1/' + m.r + ' = ' + renderValue(p.answer) + '。'], en: ['Circle curvature κ = 1/r.', 'κ = 1/' + m.r + ' = ' + renderValue(p.answer) + '.'] }
          : { zh: ['球面高斯曲率 K = 1/r²。', 'K = 1/' + (m.r * m.r) + ' = ' + renderValue(p.answer) + '。'], en: ['Sphere Gaussian curvature K = 1/r².', 'K = 1/' + (m.r * m.r) + ' = ' + renderValue(p.answer) + '.'] };
      case 'gradcategory':
        return m.mode === 'functions'
          ? { zh: ['每個輸入有 ' + m.n + ' 個選擇，共 ' + m.m + ' 個輸入。', '= ' + m.n + '^' + m.m + ' = ' + p.answer + '。'], en: ['Each of ' + m.m + ' inputs has ' + m.n + ' choices.', '= ' + m.n + '^' + m.m + ' = ' + p.answer + '.'] }
          : { zh: ['每個元素可映射到 ' + m.k + ' 個元素之一。', '= ' + m.k + '^' + m.k + ' = ' + p.answer + '。'], en: ['Each element maps to one of ' + m.k + ' elements.', '= ' + m.k + '^' + m.k + ' = ' + p.answer + '.'] };
      case 'trigident':
        if (m.mode === 'pythagorean') return { zh: ['$\sin^2\theta + \cos^2\theta = 1$。', '$\cos\theta = \sqrt{1 - (' + m.a + '/' + m.c + ')^2} = ' + renderValue(p.answer) + '$。'], en: ['$\sin^2\theta + \cos^2\theta = 1$.', '$\cos\theta = \sqrt{1 - (' + m.a + '/' + m.c + ')^2} = ' + renderValue(p.answer) + '$.' ] };
        if (m.mode === 'double') return { zh: ['二倍角公式：$\sin 2\theta = 2\sin\theta\cos\theta$。', '= 2 × ' + m.a + '/' + m.c + ' × ' + m.b + '/' + m.c + ' = ' + renderValue(p.answer) + '。'], en: ['Double angle: $\sin 2\theta = 2\sin\theta\cos\theta$.', '= 2 × ' + m.a + '/' + m.c + ' × ' + m.b + '/' + m.c + ' = ' + renderValue(p.answer) + '.'] };
        return { zh: ['$\tan\theta = \dfrac{\sin\theta}{\cos\theta}$。', '= ' + m.a + '/' + m.b + ' = ' + renderValue(p.answer) + '。'], en: ['$\tan\theta = \dfrac{\sin\theta}{\cos\theta}$.', '= ' + m.a + '/' + m.b + ' = ' + renderValue(p.answer) + '.'] };
      case 'sinerule':
        if (m.mode === 'cosine') return { zh: ['餘弦定理：$c^2 = a^2 + b^2 - 2ab\cos C$。', '$\cos C = \dfrac{a^2+b^2-c^2}{2ab} = ' + renderValue(p.answer) + '$。'], en: ['Cosine rule: $c^2 = a^2 + b^2 - 2ab\cos C$.', '$\cos C = \dfrac{a^2+b^2-c^2}{2ab} = ' + renderValue(p.answer) + '$.' ] };
        if (m.mode === 'area') return { zh: ['面積 = $\dfrac{1}{2}ab\sin C$。', '= ½ × ' + m.a + ' × ' + m.b + ' × ' + m.x + '/' + m.z + ' = ' + renderValue(p.answer) + '。'], en: ['Area = $\dfrac{1}{2}ab\sin C$.', '= ½ × ' + m.a + ' × ' + m.b + ' × ' + m.x + '/' + m.z + ' = ' + renderValue(p.answer) + '.'] };
        return { zh: ['正弦定理：$\dfrac{a}{\sin A} = \dfrac{b}{\sin B}$。', '$a = b\sin A / \sin B = ' + p.answer + '$。'], en: ['Sine rule: $\dfrac{a}{\sin A} = \dfrac{b}{\sin B}$.', '$a = b\sin A / \sin B = ' + p.answer + '$.' ] };
      case 'triggraph':
        return m.mode === 'amplitude'
          ? { zh: ['$y = a\sin(bx)$ 的振幅是 |a|。', '振幅 = ' + m.a + '。'], en: ['The amplitude of $y = a\sin(bx)$ is |a|.', 'Amplitude = ' + m.a + '.'] }
          : { zh: ['週期 = 360° ÷ |b|。', '週期 = 360° ÷ ' + m.b + ' = ' + p.answer + '°。'], en: ['Period = 360° ÷ |b|.', 'Period = 360° ÷ ' + m.b + ' = ' + p.answer + '°.'] };
      case 'compound':
        if (m.mode === 'sinSum') return { zh: ['$\sin(A+B)=\sin A\cos B+\cos A\sin B$。', '= ' + m.a + '/' + m.c + '×' + m.e + '/' + m.f + ' + ' + m.b + '/' + m.c + '×' + m.d + '/' + m.f + ' = ' + renderValue(p.answer) + '。'], en: ['$\sin(A+B)=\sin A\cos B+\cos A\sin B$.', '= ' + m.a + '/' + m.c + '×' + m.e + '/' + m.f + ' + ' + m.b + '/' + m.c + '×' + m.d + '/' + m.f + ' = ' + renderValue(p.answer) + '.'] };
        if (m.mode === 'sinDiff') return { zh: ['$\sin(A-B)=\sin A\cos B-\cos A\sin B$。', '= ' + renderValue(p.answer) + '。'], en: ['$\sin(A-B)=\sin A\cos B-\cos A\sin B$.', '= ' + renderValue(p.answer) + '.'] };
        if (m.mode === 'cosSum') return { zh: ['$\cos(A+B)=\cos A\cos B-\sin A\sin B$。', '= ' + renderValue(p.answer) + '。'], en: ['$\cos(A+B)=\cos A\cos B-\sin A\sin B$.', '= ' + renderValue(p.answer) + '.'] };
        return { zh: ['$\tan(A+B)=\dfrac{\tan A+\tan B}{1-\tan A\tan B}$。', '= ' + renderValue(p.answer) + '。'], en: ['$\tan(A+B)=\dfrac{\tan A+\tan B}{1-\tan A\tan B}$.', '= ' + renderValue(p.answer) + '.'] };
      case 'radian':
        if (m.mode === 'convert') return { zh: ['$180^\circ=\pi$，所以 $' + m.deg + '^\circ=' + renderValue(p.answer) + '\pi$。'], en: ['$180^\circ=\pi$, so $' + m.deg + '^\circ=' + renderValue(p.answer) + '\pi$.'] };
        if (m.mode === 'arc') return { zh: ['$s=r\theta$，角度先化成弧度。', '=$' + renderValue(p.answer) + '\pi$ cm。'], en: ['$s=r\theta$ after converting the angle to radians.', '=$' + renderValue(p.answer) + '\pi$ cm.'] };
        return { zh: ['用單位圓特殊角座標。', '答案是 ' + renderValue(p.answer) + '。'], en: ['Use the unit-circle coordinates for special angles.', 'The answer is ' + renderValue(p.answer) + '.'] };
      case 'trigeq':
        if (m.mode === 'sin') return { zh: ['$\sin\theta=\sin ' + m.base + '^\circ$ 的兩解為 $' + m.base + '^\circ$ 與 $' + (180 - m.base) + '^\circ$。', '和 = 180°。'], en: ['$\sin\theta=\sin ' + m.base + '^\circ$ has solutions $' + m.base + '^\circ$ and $' + (180 - m.base) + '^\circ$.', 'Sum = 180°.'] };
        if (m.mode === 'cos') return { zh: ['$\cos\theta=\cos ' + m.base + '^\circ$ 的兩解和為 360°。'], en: ['$\cos\theta=\cos ' + m.base + '^\circ$ has solutions summing to 360°.'] };
        return { zh: ['$\tan\theta=\tan ' + m.base + '^\circ$ 的兩解相差 180°。', '和 = 180° + 2×' + m.base + '° = ' + p.answer + '°。'], en: ['$\tan\theta=\tan ' + m.base + '^\circ$ has solutions differing by 180°.', 'Sum = 180° + 2×' + m.base + '° = ' + p.answer + '°.'] };
      default:
        return null;
    }
  }

  /* 位值：十位、個位、位值與合成（P1「100 以內的數」） */

  /* 對外 explain：把解題步驟中的純文字 caret 也轉成 KaTeX 式子 */
  function explain(p) {
    var ex = explainRaw(p);
    if (!ex) return null;
    return {
      zh: ex.zh.map(formatMathText),
      en: ex.en.map(formatMathText)
    };
  }

export { explain };
