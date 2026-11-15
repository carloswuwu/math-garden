/*
 * 數學核心邏輯（純函數，無 DOM 依賴）
 * 題目生成、判分、掌握度、自適應難度、間隔復習。
 * 瀏覽器中掛載為 window.MathCore，Node 中通過 module.exports 導出。
 *
 * 設計約定：
 *  - 一道題 = { type, prompt:{zh,en}, visual, answer, choices, hint:{zh,en}, difficultyStep, sig }
 *  - answer / choices 元素為「值」：數字，或分數對象 { n, d }。
 *  - 所有隨機都來自可播種的 rng，保證可復現、可測試。
 */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.MathCore = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var GENERATOR_TYPES = [
    'count', 'compare', 'comparegroup', 'addition', 'subtraction', 'numberbonds',
    'missing', 'multiplication', 'division', 'fraction', 'word',
    'multidigit', 'fractionadd', 'decimal', 'decimalmul', 'average',
    'equation', 'percent', 'ratio', 'area', 'fractionof',
    'directed', 'exprsub', 'linear', 'pythagoras', 'simul', 'indices', 'inequality',
    'log', 'fx', 'trig', 'ap', 'gp', 'prob', 'quad', 'stats',
    'triangle', 'circle', 'volume', 'coord'
  ];

  /* ---------------- 可播種隨機數 ---------------- */

  function seedRandom(seed) {
    var a = (seed >>> 0) || 1;
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function randInt(rng, min, max) {
    if (max < min) { var tmp = min; min = max; max = tmp; }
    return min + Math.floor(rng() * (max - min + 1));
  }

  function pick(rng, arr) {
    return arr[randInt(rng, 0, arr.length - 1)];
  }

  function shuffle(rng, arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = randInt(rng, 0, i);
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ---------------- 值的表示與比較 ---------------- */

  function isFraction(v) {
    return v && typeof v === 'object' && typeof v.n === 'number' && typeof v.d === 'number';
  }

  function valueKey(v) {
    return isFraction(v) ? v.n + '/' + v.d : String(v);
  }

  function renderValue(v) {
    return isFraction(v) ? v.n + '/' + v.d : String(v);
  }

  function valuesEqual(a, b) {
    if (isFraction(a) && isFraction(b)) return a.n === b.n && a.d === b.d;
    return a === b;
  }

  /* 把用戶輸入規整為「值」；無法解析返回 null */
  function normalizeInput(input, expected) {
    if (input === null || input === undefined) return null;
    if (typeof input === 'object') {
      return (typeof input.n === 'number' && typeof input.d === 'number') ? { n: input.n, d: input.d } : null;
    }
    if (typeof input === 'number') return Number.isFinite(input) ? input : null;
    var s = String(input).trim();
    if (isFraction(expected)) {
      var m = /^(\d+)\s*\/\s*(\d+)$/.exec(s);
      return m ? { n: Number(m[1]), d: Number(m[2]) } : null;
    }
    if (typeof expected === 'string') return s; // 顏色/文字答案
    if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
    return null;
  }

  /* ---------------- 題目生成器 ---------------- */

  function eqPrompt(a, op, b) {
    var s = a + ' ' + op + ' ' + b + ' = ?';
    return { zh: s, en: s };
  }

  function genCount(rng, o) {
    var min = o.min != null ? o.min : 1;
    var max = o.max != null ? o.max : 10;
    var n = randInt(rng, min, max);
    return {
      type: 'count',
      prompt: { zh: '數一數，一共有幾個？', en: 'Count. How many in all?' },
      visual: { kind: 'count', n: n },
      answer: n,
      math: { op: 'count', n: n },
      hint: { zh: '用手指一個一個點著數。', en: 'Point and count one by one.' }
    };
  }

  function genCompare(rng, o) {
    var min = o.min != null ? o.min : 1;
    var max = o.max != null ? o.max : 10;
    var a = randInt(rng, min, max);
    var b = randInt(rng, min, max);
    var guard = 0;
    while (b === a && guard++ < 50) b = randInt(rng, min, max);
    var more = rng() < 0.5;
    var answer = more ? Math.max(a, b) : Math.min(a, b);
    return {
      type: 'compare',
      prompt: {
        zh: more ? '哪個數更大？' : '哪個數更小？',
        en: more ? 'Which number is bigger?' : 'Which number is smaller?'
      },
      visual: { kind: 'compare', a: a, b: b },
      answer: answer,
      math: { op: 'compare', a: a, b: b, mode: more ? 'max' : 'min' },
      base: [a, b],
      hint: { zh: '比較兩組圓點，多的那組數更大。', en: 'The group with more dots is the bigger number.' }
    };
  }

  /* 比大小（顏色版）：兩堆彩色圓點，選「更多/更少」的那一組顏色 */
  function genCompareGroup(rng, o) {
    var min = o.min != null ? o.min : 1;
    var max = o.max != null ? o.max : 10;
    var a = randInt(rng, min, max);
    var b = randInt(rng, min, max);
    var guard = 0;
    while (b === a && guard++ < 50) b = randInt(rng, min, max);
    var more = rng() < 0.5;
    var answer = more ? (a > b ? 'green' : 'orange') : (a < b ? 'green' : 'orange');
    return {
      type: 'comparegroup',
      prompt: {
        zh: more ? '哪一組更多？' : '哪一組更少？',
        en: more ? 'Which group has more?' : 'Which group has fewer?'
      },
      visual: { kind: 'compare', a: a, b: b, colorA: 'green', colorB: 'orange' },
      answer: answer,
      math: { op: 'comparegroup', a: a, b: b, mode: more ? 'max' : 'min' },
      choices: ['green', 'orange'],
      hint: { zh: '數一數兩組各有多少個圓點。', en: 'Count the dots in each group.' }
    };
  }

  function genAddition(rng, o) {
    var max = o.max != null ? o.max : 10;
    var minSum = o.minSum != null ? o.minSum : 2;
    var a, b;
    var guard = 0;
    do {
      b = randInt(rng, 1, max - 1);
      a = randInt(rng, 1, max - b);
      guard++;
    } while (a + b < minSum && guard < 100);
    var visual = (max <= 20) ? { kind: 'counters', a: a, b: b } : null;
    return {
      type: 'addition',
      prompt: eqPrompt(a, '+', b),
      visual: visual,
      answer: a + b,
      math: { op: '+', a: a, b: b },
      hint: { zh: '先數 ' + a + ' 個，再數 ' + b + ' 個。', en: 'Count ' + a + ', then count ' + b + ' more.' }
    };
  }

  function genSubtraction(rng, o) {
    var max = o.max != null ? o.max : 10;
    var a = randInt(rng, 2, max);
    var b = randInt(rng, 1, a);
    var visual = (max <= 20) ? { kind: 'counters', a: a, b: b } : null;
    return {
      type: 'subtraction',
      prompt: eqPrompt(a, '−', b),
      visual: visual,
      answer: a - b,
      math: { op: '−', a: a, b: b },
      hint: { zh: '從 ' + a + ' 個裡拿走 ' + b + ' 個。', en: 'Take ' + b + ' away from ' + a + '.' }
    };
  }

  function genNumberBonds(rng, o) {
    var max = o.max != null ? o.max : 10;
    var c = randInt(rng, 2, max);
    var a = randInt(rng, 1, c - 1);
    var s = a + ' + ? = ' + c;
    return {
      type: 'numberbonds',
      prompt: { zh: s, en: s },
      visual: null,
      answer: c - a,
      math: { op: '+', a: a, b: null, c: c, blank: 'b' },
      hint: { zh: '想一想 ' + a + ' 加幾等於 ' + c + '？', en: 'What added to ' + a + ' makes ' + c + '?' }
    };
  }

  function genMissing(rng, o) {
    var max = o.max != null ? o.max : 20;
    var form = pick(rng, o.forms || ['a+?=c', '?+b=c', 'a-?=c', '?-b=c']);
    var a, b, c, s, answer, math;
    if (form === 'a+?=c') {
      c = randInt(rng, 2, max); a = randInt(rng, 1, c - 1); answer = c - a;
      s = a + ' + ? = ' + c;
      math = { op: '+', a: a, b: null, c: c, blank: 'b' };
    } else if (form === '?+b=c') {
      c = randInt(rng, 2, max); b = randInt(rng, 1, c - 1); answer = c - b;
      s = '? + ' + b + ' = ' + c;
      math = { op: '+', a: null, b: b, c: c, blank: 'a' };
    } else if (form === 'a-?=c') {
      a = randInt(rng, 2, max); c = randInt(rng, 0, a - 1); answer = a - c;
      s = a + ' − ? = ' + c;
      math = { op: '−', a: a, b: null, c: c, blank: 'b' };
    } else {
      b = randInt(rng, 1, max - 1); c = randInt(rng, 0, max - b); answer = c + b;
      s = '? − ' + b + ' = ' + c;
      math = { op: '−', a: null, b: b, c: c, blank: 'a' };
    }
    return {
      type: 'missing',
      prompt: { zh: s, en: s },
      visual: null,
      answer: answer,
      math: math,
      hint: { zh: '想反過來的運算。', en: 'Think of the opposite operation.' }
    };
  }

  function genMultiplication(rng, o) {
    var a, b;
    if (o.table) {
      a = o.table;
      b = randInt(rng, 1, o.maxFactor != null ? o.maxFactor : 9);
    } else {
      a = randInt(rng, o.minFactor != null ? o.minFactor : 2, o.maxFactor != null ? o.maxFactor : 9);
      b = randInt(rng, 2, o.maxFactor != null ? o.maxFactor : 9);
    }
    var visual = (a <= 10 && b <= 10) ? { kind: 'grid', a: a, b: b } : null;
    return {
      type: 'multiplication',
      prompt: eqPrompt(a, '×', b),
      visual: visual,
      answer: a * b,
      math: { op: '×', a: a, b: b },
      hint: { zh: a + ' 個 ' + b + ' 相加，' + b + ' 個 ' + a + ' 相加也一樣。', en: a + ' groups of ' + b + ' is the same as ' + b + ' groups of ' + a + '.' }
    };
  }

  function genDivision(rng, o) {
    var b = randInt(rng, 2, o.maxDivisor != null ? o.maxDivisor : 9);
    var q = randInt(rng, 2, o.maxQuotient != null ? o.maxQuotient : 9);
    var a = b * q;
    return {
      type: 'division',
      prompt: eqPrompt(a, '÷', b),
      visual: null,
      answer: q,
      math: { op: '÷', a: a, b: b },
      hint: { zh: '把 ' + a + ' 平均分成 ' + b + ' 份。', en: 'Share ' + a + ' equally into ' + b + ' groups.' }
    };
  }

  function genFraction(rng, o) {
    var d = randInt(rng, o.minDen != null ? o.minDen : 2, o.maxDen != null ? o.maxDen : 8);
    var n = randInt(rng, 1, d - 1);
    return {
      type: 'fraction',
      prompt: { zh: '涂色部分用分數表示是多少？', en: 'What fraction is shaded?' },
      visual: { kind: 'fraction', n: n, d: d },
      answer: { n: n, d: d },
      math: { op: 'frac', n: n, d: d },
      hint: { zh: '分母是總份數，分子是涂色的份數。', en: 'Denominator = total parts, numerator = shaded parts.' }
    };
  }

  function genWord(rng, o) {
    var op = pick(rng, o.ops || ['add', 'sub', 'mul']);
    var a, b, c = null, answer, prompt, mathOp;
    if (op === 'add') {
      a = randInt(rng, o.min != null ? o.min : 1, o.max != null ? o.max : 20);
      b = randInt(rng, 1, o.max != null ? o.max : 20);
      answer = a + b;
      mathOp = 'add';
      prompt = {
        zh: '小明有 ' + a + ' 個蘋果，媽媽又給了他 ' + b + ' 個，一共有幾個？',
        en: 'Sam has ' + a + ' apples and gets ' + b + ' more. How many in all?'
      };
    } else if (op === 'sub') {
      a = randInt(rng, 2, o.max != null ? o.max : 20);
      b = randInt(rng, 1, a);
      answer = a - b;
      mathOp = 'sub';
      prompt = {
        zh: '小明有 ' + a + ' 個蘋果，吃了 ' + b + ' 個，還剩幾個？',
        en: 'Sam has ' + a + ' apples and eats ' + b + '. How many are left?'
      };
    } else if (op === 'mul') {
      a = randInt(rng, 2, o.maxFactor != null ? o.maxFactor : 9);
      b = randInt(rng, 2, o.maxFactor != null ? o.maxFactor : 9);
      answer = a * b;
      mathOp = 'mul';
      prompt = {
        zh: '每盒有 ' + a + ' 個，一共有 ' + b + ' 盒，一共有幾個？',
        en: 'There are ' + a + ' in each box and ' + b + ' boxes. How many in all?'
      };
    } else if (op === 'area') {
      a = randInt(rng, 2, 12);
      b = randInt(rng, 2, 12);
      answer = a * b;
      mathOp = 'warea';
      prompt = {
        zh: '長方形花園長 ' + a + ' m，闊 ' + b + ' m，面積是多少？',
        en: 'A rectangular garden is ' + a + ' m by ' + b + ' m. What is its area?'
      };
    } else if (op === 'percent') {
      var orig = randInt(rng, 2, 10) * 10;
      var off = pick(rng, [10, 20, 50]);
      a = orig; b = off;
      answer = orig * (100 - off) / 100;
      mathOp = 'wpercent';
      prompt = {
        zh: '一件貨品原價 $' + orig + '，減價 ' + off + '% 後售價多少？',
        en: 'An item costs $' + orig + ' and is reduced by ' + off + '%. What is the new price?'
      };
    } else if (op === 'speed') {
      var sp = pick(rng, [20, 40, 60, 80, 100]);
      var min = pick(rng, [30, 60, 90, 120]);
      a = sp; b = min;
      answer = sp * min / 60;
      mathOp = 'wspeed';
      prompt = {
        zh: '一輛車以 ' + sp + ' km/h 的速率行駛 ' + min + ' 分鐘，共行了多少 km？',
        en: 'A car travels at ' + sp + ' km/h for ' + min + ' minutes. How far does it travel?'
      };
    } else if (op === 'profit') {
      var cost = pick(rng, [100, 200, 500]);
      var pp = pick(rng, [10, 20, 25, 50]);
      a = cost; b = pp;
      answer = pp;
      mathOp = 'wprofit';
      prompt = {
        zh: '一件貨品成本 $' + cost + '，以 $' + Math.round(cost * (1 + pp / 100)) + ' 出售，盈利百分率是多少？',
        en: 'An item costs $' + cost + ' and is sold for $' + Math.round(cost * (1 + pp / 100)) + '. What is the profit percentage?'
      };
    } else if (op === 'compound') {
      var prin = pick(rng, [1000, 2000]);
      var rate = pick(rng, [10, 20]);
      a = prin; b = rate; c = 2;
      answer = Math.round(prin * Math.pow(1 + rate / 100, c));
      mathOp = 'wcompound';
      prompt = {
        zh: '把 $' + prin + ' 存入銀行，年利率 ' + rate + '%（複利息），' + c + ' 年後本利和是多少？',
        en: '$' + prin + ' is deposited at ' + rate + '% p.a. compounded annually. What is the amount after ' + c + ' years?'
      };
    } else {
      var p = randInt(rng, 1, 3), q = randInt(rng, 1, 3);
      while (q === p) q = randInt(rng, 1, 3);
      var kk = randInt(rng, 1, 10);
      var total = (p + q) * kk;
      a = total; b = q * kk;
      answer = q * kk;
      mathOp = 'wratio';
      prompt = {
        zh: '把 $' + total + ' 按 ' + p + ' : ' + q + ' 分給甲、乙，乙得多少？',
        en: 'Share $' + total + ' between A and B in the ratio ' + p + ' : ' + q + '. How much does B get?'
      };
    }
    return {
      type: 'word',
      prompt: prompt,
      visual: null,
      answer: answer,
      math: { op: mathOp, a: a, b: b, c: c },
      hint: { zh: '先想想用哪種運算。', en: 'Decide which operation to use.' }
    };
  }

  /* ================= 進階題型（小四～小六） ================= */

  function fmtDecimal(tenths) {
    var neg = tenths < 0;
    var v = Math.abs(tenths);
    return (neg ? '-' : '') + Math.floor(v / 10) + '.' + (v % 10);
  }

  function decimalChoices(rng, rTenths) {
    var out = [fmtDecimal(rTenths)];
    var seen = {};
    seen[String(rTenths)] = true;
    var guard = 0;
    while (out.length < 4 && guard++ < 200) {
      var off = pick(rng, [1, 2, 3, 10]) * (rng() < 0.5 ? -1 : 1);
      var cand = rTenths + off;
      if (cand < 0) cand = rTenths + 1;
      if (!seen[String(cand)]) { seen[String(cand)] = true; out.push(fmtDecimal(cand)); }
    }
    return shuffle(rng, out);
  }

  /* 多位數乘除 */
  function genMultiDigit(rng, o) {
    var mul = rng() < 0.5;
    var a, b, answer, sym;
    if (mul) {
      a = randInt(rng, 11, 99);
      b = randInt(rng, 2, 9);
      answer = a * b;
      sym = '×';
    } else {
      b = randInt(rng, 2, 9);
      answer = randInt(rng, 11, 99);
      a = b * answer;
      sym = '÷';
    }
    return {
      type: 'multidigit',
      prompt: eqPrompt(a, sym, b),
      visual: null,
      answer: answer,
      math: { op: sym, a: a, b: b },
      hint: { zh: '用直式（豎式）計算，從個位算起。', en: 'Use the column method, starting from the ones place.' }
    };
  }

  /* 同分母分數加減（真分數） */
  function genFractionAdd(rng, o) {
    var d = randInt(rng, 4, 10);
    var add = rng() < 0.5;
    var a, b, answer, sym;
    if (add) {
      a = randInt(rng, 1, d - 2);
      b = randInt(rng, 1, d - 1 - a);
      answer = a + b;
      sym = '+';
    } else {
      a = randInt(rng, 2, d - 1);
      b = randInt(rng, 1, a - 1);
      answer = a - b;
      sym = '−';
    }
    var s = a + '/' + d + ' ' + sym + ' ' + b + '/' + d + ' = ?';
    return {
      type: 'fractionadd',
      prompt: { zh: s, en: s },
      visual: null,
      answer: { n: answer, d: d },
      math: { op: add ? 'fadd' : 'fsub', a: a, b: b, d: d },
      hint: { zh: '分母相同，分子直接相加（減）。', en: 'Same denominator: add (or subtract) the numerators.' }
    };
  }

  /* 小數加減（一位小數，答案用字串表示避免浮點誤差） */
  function genDecimal(rng, o) {
    var add = rng() < 0.5;
    var a = randInt(rng, 1, 90);
    var b = add ? randInt(rng, 1, 90) : randInt(rng, 1, a);
    var r = add ? a + b : a - b;
    var sym = add ? '+' : '−';
    return {
      type: 'decimal',
      prompt: { zh: fmtDecimal(a) + ' ' + sym + ' ' + fmtDecimal(b) + ' = ?', en: fmtDecimal(a) + ' ' + sym + ' ' + fmtDecimal(b) + ' = ?' },
      visual: null,
      answer: fmtDecimal(r),
      math: { op: add ? 'dadd' : 'dsub', a: a, b: b, r: r },
      choices: decimalChoices(rng, r),
      hint: { zh: '小數點對齊，再一位一位地加（減）。', en: 'Line up the decimal points, then add/subtract column by column.' }
    };
  }

  /* 小數乘除 */
  function genDecimalMul(rng, o) {
    if (rng() < 0.5) {
      var dec = randInt(rng, 11, 99);
      var n = randInt(rng, 2, 9);
      var r = dec * n;
      return {
        type: 'decimalmul',
        prompt: { zh: fmtDecimal(dec) + ' × ' + n + ' = ?', en: fmtDecimal(dec) + ' × ' + n + ' = ?' },
        visual: null,
        answer: fmtDecimal(r),
        math: { op: 'dmul', a: dec, b: n, r: r },
        choices: decimalChoices(rng, r),
        hint: { zh: '先當整數乘，再點上小數點。', en: 'Multiply as whole numbers, then place the decimal point.' }
      };
    }
    var q = randInt(rng, 11, 99);
    var d = randInt(rng, 2, 9);
    var dividend = q * d;
    return {
      type: 'decimalmul',
      prompt: { zh: fmtDecimal(dividend) + ' ÷ ' + d + ' = ?', en: fmtDecimal(dividend) + ' ÷ ' + d + ' = ?' },
      visual: null,
      answer: fmtDecimal(q),
      math: { op: 'ddiv', a: dividend, b: d, r: q },
      choices: decimalChoices(rng, q),
      hint: { zh: '先當整數除，再點上小數點。', en: 'Divide as whole numbers, then place the decimal point.' }
    };
  }

  /* 平均數 */
  function genAverage(rng, o) {
    var n = randInt(rng, 3, 5);
    var nums = [];
    var sum = 0;
    var guard = 0;
    do {
      nums = [];
      for (var i = 0; i < n; i++) nums.push(randInt(rng, 1, 20));
      sum = nums.reduce(function (s, x) { return s + x; }, 0);
      guard++;
    } while (sum % n !== 0 && guard < 50);
    if (sum % n !== 0) {
      nums[n - 1] += (n - (sum % n));
      sum = nums.reduce(function (s, x) { return s + x; }, 0);
    }
    return {
      type: 'average',
      prompt: { zh: nums.join('、') + ' 的平均數是多少？', en: 'What is the average of ' + nums.join(', ') + '?' },
      visual: null,
      answer: sum / n,
      math: { op: 'avg', nums: nums, avg: sum / n },
      hint: { zh: '全部加起來，再除以個數。', en: 'Add them all up, then divide by how many there are.' }
    };
  }

  /* 簡易方程：求 x */
  function genEquation(rng, o) {
    var form = pick(rng, ['x+a=c', 'x-a=c', 'ax=c', 'x/a=c']);
    var a, c, answer, s;
    if (form === 'x+a=c') {
      a = randInt(rng, 2, 30); answer = randInt(rng, 1, 30); c = answer + a;
      s = 'x + ' + a + ' = ' + c;
    } else if (form === 'x-a=c') {
      a = randInt(rng, 2, 30); c = randInt(rng, 1, 30); answer = c + a;
      s = 'x − ' + a + ' = ' + c;
    } else if (form === 'ax=c') {
      a = randInt(rng, 2, 9); answer = randInt(rng, 2, 12); c = a * answer;
      s = a + 'x = ' + c;
    } else {
      a = randInt(rng, 2, 9); c = randInt(rng, 2, 12); answer = a * c;
      s = 'x ÷ ' + a + ' = ' + c;
    }
    return {
      type: 'equation',
      prompt: { zh: '求 x：' + s, en: 'Solve for x: ' + s },
      visual: null,
      answer: answer,
      math: { op: 'equation', form: form, a: a, c: c },
      hint: { zh: '把 x 單獨留在等號的一邊。', en: 'Get x alone on one side of the equals sign.' }
    };
  }

  /* 百分數 */
  function genPercent(rng, o) {
    if (rng() < 0.5) {
      var p = pick(rng, [5, 10, 15, 20, 25, 30, 40, 50, 60, 75]);
      var k = randInt(rng, 1, 3);
      var whole = 100 * k;
      var result = p * k;
      return {
        type: 'percent',
        prompt: { zh: whole + ' 的 ' + p + '% 是多少？', en: 'What is ' + p + '% of ' + whole + '?' },
        visual: null,
        answer: result,
        math: { op: 'percent', kind: 'of', p: p, whole: whole, result: result },
        hint: { zh: '先算 1%（除以 100），再乘以 ' + p + '。', en: 'Find 1% (divide by 100), then multiply by ' + p + '.' }
      };
    }
    var pct = pick(rng, [10, 20, 25, 50, 75]);
    var whole2 = pick(rng, [40, 60, 80, 120, 200]);
    var part = whole2 * pct / 100;
    return {
      type: 'percent',
      prompt: { zh: part + ' 是 ' + whole2 + ' 的百分之幾？', en: part + ' is what percent of ' + whole2 + '?' },
      visual: null,
      answer: pct,
      math: { op: 'percent', kind: 'what', pct: pct, whole: whole2, part: part },
      hint: { zh: '用「部分 ÷ 整體 × 100%」。', en: 'Use part ÷ whole × 100%.' }
    };
  }

  /* 比與比例 */
  function genRatio(rng, o) {
    var p = randInt(rng, 2, 9);
    var q = randInt(rng, 2, 9);
    while (q === p) q = randInt(rng, 2, 9);
    var k = randInt(rng, 2, 12);
    var a = p * k;
    return {
      type: 'ratio',
      prompt: { zh: '甲、乙兩數的比是 ' + p + ' : ' + q + '，甲是 ' + a + '，乙是多少？', en: 'The ratio of A to B is ' + p + ' : ' + q + '. If A is ' + a + ', what is B?' },
      visual: null,
      answer: q * k,
      math: { op: 'ratio', p: p, q: q, k: k, a: a },
      hint: { zh: '甲分成 ' + p + ' 份，每份是 ' + k + '。', en: 'A is ' + p + ' parts; each part is ' + k + '.' }
    };
  }

  /* 長方形面積 / 周長 */
  function genArea(rng, o) {
    var l = randInt(rng, 2, 20);
    var w = randInt(rng, 2, 20);
    var askArea = rng() < 0.5;
    var answer = askArea ? l * w : 2 * (l + w);
    return {
      type: 'area',
      prompt: {
        zh: '長方形的長是 ' + l + ' cm，闊是 ' + w + ' cm，' + (askArea ? '面積' : '周長') + '是多少？',
        en: 'A rectangle is ' + l + ' cm by ' + w + ' cm. What is its ' + (askArea ? 'area' : 'perimeter') + '?'
      },
      visual: null,
      answer: answer,
      math: { op: 'area', l: l, w: w, mode: askArea ? 'area' : 'perimeter' },
      hint: { zh: askArea ? '面積 = 長 × 闊。' : '周長 = (長 + 闊) × 2。', en: askArea ? 'Area = length × width.' : 'Perimeter = (length + width) × 2.' }
    };
  }

  /* 求一個數的幾分之幾 */
  function genFractionOf(rng, o) {
    var d = randInt(rng, 2, 9);
    var n = randInt(rng, 1, d - 1);
    var k = randInt(rng, 2, 12);
    var whole = d * k;
    return {
      type: 'fractionof',
      prompt: { zh: whole + ' 的 ' + n + '/' + d + ' 是多少？', en: 'What is ' + n + '/' + d + ' of ' + whole + '?' },
      visual: null,
      answer: n * k,
      math: { op: 'fractionof', n: n, d: d, whole: whole, k: k },
      hint: { zh: '先除以 ' + d + '，再乘以 ' + n + '。', en: 'Divide by ' + d + ', then multiply by ' + n + '.' }
    };
  }

  /* ================= 中學題型（中一至中三） ================= */

  function fmtNum(n) { return n < 0 ? '(' + n + ')' : '' + n; }

  var RIGHT_TRIPLES = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [7, 24, 25], [9, 12, 15], [12, 16, 20], [20, 21, 29]];

  /* 有向數四則運算 */
  function genDirected(rng, o) {
    var op = pick(rng, ['+', '−', '×', '÷']);
    var a, b, ans;
    if (op === '×' || op === '÷') {
      var mag = randInt(rng, 2, 9);
      var sb = rng() < 0.5 ? 1 : -1;
      b = mag * sb;
      if (op === '×') { a = randInt(rng, 2, 9) * (rng() < 0.5 ? 1 : -1); ans = a * b; }
      else { ans = randInt(rng, 2, 9) * (rng() < 0.5 ? 1 : -1); a = b * ans; }
    } else {
      a = randInt(rng, -10, 10);
      b = randInt(rng, -10, 10);
      ans = op === '+' ? a + b : a - b;
    }
    var s = fmtNum(a) + ' ' + op + ' ' + fmtNum(b) + ' = ?';
    return {
      type: 'directed',
      prompt: { zh: s, en: s },
      visual: null,
      answer: ans,
      math: { op: op, a: a, b: b },
      hint: { zh: '先決定正負號，再算絕對值。', en: 'Decide the sign first, then the magnitude.' }
    };
  }

  /* 代數式求值（代入法） */
  function genExprSub(rng, o) {
    var a = randInt(rng, 1, 6);
    var b = randInt(rng, 1, 10);
    var x = randInt(rng, 1, 8);
    var ans = a * x + b;
    var expr = (a === 1 ? 'x' : a + 'x') + ' + ' + b;
    return {
      type: 'exprsub',
      prompt: { zh: '已知 x = ' + x + '，求 ' + expr + ' 的值。', en: 'Given x = ' + x + ', find the value of ' + expr + '.' },
      visual: null,
      answer: ans,
      math: { op: 'exprsub', a: a, b: b, x: x },
      hint: { zh: '把 x 代入，再計算。', en: 'Substitute x, then calculate.' }
    };
  }

  /* 一元一次方程（兩步） */
  function genLinear(rng, o) {
    var a = randInt(rng, 2, 9);
    var x = randInt(rng, 1, 15);
    var b = randInt(rng, 1, 20);
    var plus = rng() < 0.5;
    var c = plus ? a * x + b : a * x - b;
    var s = a + 'x ' + (plus ? '+' : '−') + ' ' + b + ' = ' + c;
    return {
      type: 'linear',
      prompt: { zh: '求 x：' + s, en: 'Solve for x: ' + s },
      visual: null,
      answer: x,
      math: { op: 'linear', a: a, b: b, c: c, x: x, form: plus ? '+' : '−' },
      hint: { zh: '先把常數移到右邊，再兩邊除以 x 的係數。', en: 'Move the constant to the right, then divide both sides by the coefficient of x.' }
    };
  }

  /* 畢氏定理 */
  function genPythagoras(rng, o) {
    var t = pick(rng, RIGHT_TRIPLES);
    var a = t[0], b = t[1], c = t[2];
    if (rng() < 0.5) {
      return {
        type: 'pythagoras',
        prompt: { zh: '直角三角形的兩條直角邊是 ' + a + ' 和 ' + b + '，斜邊是多少？', en: 'A right triangle has legs ' + a + ' and ' + b + '. What is the hypotenuse?' },
        visual: null,
        answer: c,
        math: { op: 'pythagoras', a: a, b: b, c: c, mode: 'hyp' },
        hint: { zh: '畢氏定理：斜邊² = ' + a + '² + ' + b + '²。', en: 'Pythagoras: hyp² = ' + a + '² + ' + b + '².' }
      };
    }
    return {
      type: 'pythagoras',
      prompt: { zh: '直角三角形的斜邊是 ' + c + '，一條直角邊是 ' + a + '，另一條是多少？', en: 'A right triangle has hypotenuse ' + c + ' and one leg ' + a + '. Find the other leg.' },
      visual: null,
      answer: b,
      math: { op: 'pythagoras', a: a, b: b, c: c, mode: 'leg' },
      hint: { zh: '另一條直角邊² = 斜邊² − 已知邊²。', en: 'Other leg² = hyp² − known leg².' }
    };
  }

  /* 聯立方程 */
  function genSimul(rng, o) {
    var x = randInt(rng, 1, 10);
    var y = randInt(rng, 1, 10);
    var s = x + y;
    var d = x - y;
    return {
      type: 'simul',
      prompt: { zh: '已知 x + y = ' + s + '，x − y = ' + d + '，求 x。', en: 'Given x + y = ' + s + ' and x − y = ' + d + ', find x.' },
      visual: null,
      answer: x,
      math: { op: 'simul', x: x, y: y, s: s, d: d },
      hint: { zh: '兩式相加得 2x = ' + (s + d) + '，再除以 2。', en: 'Add the equations: 2x = ' + (s + d) + ', then divide by 2.' }
    };
  }

  /* 指數定律 */
  function genIndices(rng, o) {
    var base = pick(rng, [2, 3, 4, 5]);
    var e1 = randInt(rng, 2, 3);
    var e2 = randInt(rng, 2, 3);
    if (rng() < 0.5) {
      var val = Math.pow(base, e1);
      return {
        type: 'indices',
        prompt: { zh: base + '^' + e1 + ' = ?', en: base + '^' + e1 + ' = ?' },
        visual: null,
        answer: val,
        math: { op: 'indices', base: base, e: e1 },
        hint: { zh: base + '^' + e1 + ' 表示 ' + Array(e1).fill(base).join(' × ') + '。', en: base + '^' + e1 + ' means ' + Array(e1).fill(base).join(' × ') + '.' }
      };
    }
    return {
      type: 'indices',
      prompt: { zh: base + '^' + e1 + ' × ' + base + '^' + e2 + ' = ?', en: base + '^' + e1 + ' × ' + base + '^' + e2 + ' = ?' },
      visual: null,
      answer: Math.pow(base, e1 + e2),
      math: { op: 'indices', base: base, e1: e1, e2: e2 },
      hint: { zh: '同底數相乘，指數相加：' + base + '^' + (e1 + e2) + '。', en: 'Same base: add the exponents, ' + base + '^' + (e1 + e2) + '.' }
    };
  }

  /* 一元一次不等式（答案為「x > k」等字串） */
  function genInequality(rng, o) {
    var a = randInt(rng, 2, 5);
    var b = randInt(rng, 1, 10);
    var x0 = randInt(rng, 1, 10);
    var greater = rng() < 0.5;
    var sign = greater ? '>' : '<';
    var c = a * x0 + b;
    var answer = 'x ' + sign + ' ' + x0;
    var choices = [
      answer,
      'x ' + (greater ? '<' : '>') + ' ' + x0,
      'x ' + sign + ' ' + (x0 + 1),
      'x ' + sign + ' ' + (x0 - 1)
    ];
    return {
      type: 'inequality',
      prompt: { zh: '解不等式：' + a + 'x + ' + b + ' ' + sign + ' ' + c, en: 'Solve the inequality: ' + a + 'x + ' + b + ' ' + sign + ' ' + c },
      visual: null,
      answer: answer,
      math: { op: 'inequality', a: a, b: b, x0: x0, sign: sign },
      choices: shuffle(rng, choices),
      hint: { zh: '先把 ' + b + ' 移到右邊，再兩邊除以 ' + a + '。', en: 'Move ' + b + ' to the right, then divide both sides by ' + a + '.' }
    };
  }

  /* ================= 高中題型（中四至中六） ================= */

  var TRIG_TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]];

  /* 對數 */
  function genLog(rng, o) {
    var base = pick(rng, [2, 3, 5, 10]);
    var n = randInt(rng, 2, 4);
    var val = Math.pow(base, n);
    return {
      type: 'log',
      prompt: { zh: '$\\log_{' + base + '} ' + val + ' = ?$', en: '$\\log_{' + base + '} ' + val + ' = ?$' },
      visual: null,
      answer: n,
      math: { op: 'log', base: base, n: n, val: val },
      hint: { zh: '想一想：' + base + ' 的幾次方等於 ' + val + '？', en: 'What power of ' + base + ' gives ' + val + '?' }
    };
  }

  /* 函數求值 */
  function genFx(rng, o) {
    var a = randInt(rng, 1, 3);
    var b = randInt(rng, -5, 5);
    var c = randInt(rng, -5, 5);
    var x = randInt(rng, 1, 4);
    var ans = a * x * x + b * x + c;
    var bx = (b >= 0 ? '+ ' + b : '- ' + (-b));
    var cc = (c >= 0 ? '+ ' + c : '- ' + (-c));
    var expr = a + 'x^2 ' + bx + 'x ' + cc;
    return {
      type: 'fx',
      prompt: { zh: '設 $f(x) = ' + expr + '$，求 $f(' + x + ')$。', en: 'If $f(x) = ' + expr + '$, find $f(' + x + ')$.' },
      visual: null,
      answer: ans,
      math: { op: 'fx', a: a, b: b, c: c, x: x },
      hint: { zh: '把 x = ' + x + ' 代入 f(x)。', en: 'Substitute x = ' + x + ' into f(x).' }
    };
  }

  /* 三角比 */
  function genTrig(rng, o) {
    var t = pick(rng, TRIG_TRIPLES);
    var a = t[0], b = t[1], c = t[2];
    var which = pick(rng, ['sin', 'cos', 'tan']);
    var num, den;
    if (which === 'sin') { num = a; den = c; }
    else if (which === 'cos') { num = b; den = c; }
    else { num = a; den = b; }
    return {
      type: 'trig',
      prompt: {
        zh: '在直角三角形中，對邊 = ' + a + '，鄰邊 = ' + b + '，斜邊 = ' + c + '。求 $\\' + which + '\\theta$。',
        en: 'In a right triangle, opposite = ' + a + ', adjacent = ' + b + ', hypotenuse = ' + c + '. Find $\\' + which + '\\theta$.'
      },
      visual: null,
      answer: { n: num, d: den },
      math: { op: 'trig', a: a, b: b, c: c, which: which },
      hint: {
        zh: which + ' θ = ' + (which === 'sin' ? '對邊 ÷ 斜邊' : which === 'cos' ? '鄰邊 ÷ 斜邊' : '對邊 ÷ 鄰邊') + '。',
        en: which + ' θ = ' + (which === 'sin' ? 'opposite ÷ hypotenuse' : which === 'cos' ? 'adjacent ÷ hypotenuse' : 'opposite ÷ adjacent') + '.'
      }
    };
  }

  /* 等差數列 */
  function genAp(rng, o) {
    var a = randInt(rng, 1, 10);
    var d = randInt(rng, 2, 6);
    var n = randInt(rng, 5, 12);
    return {
      type: 'ap',
      prompt: { zh: '等差數列首項是 ' + a + '，公差是 ' + d + '。求第 ' + n + ' 項。', en: 'An arithmetic sequence has first term ' + a + ' and common difference ' + d + '. Find the ' + n + 'th term.' },
      visual: null,
      answer: a + (n - 1) * d,
      math: { op: 'ap', a: a, d: d, n: n },
      hint: { zh: '第 n 項 = 首項 + (n − 1) × 公差。', en: 'nth term = first + (n − 1) × difference.' }
    };
  }

  /* 等比數列 */
  function genGp(rng, o) {
    var a = randInt(rng, 1, 5);
    var r = pick(rng, [2, 3]);
    var n = randInt(rng, 3, 5);
    return {
      type: 'gp',
      prompt: { zh: '等比數列首項是 ' + a + '，公比是 ' + r + '。求第 ' + n + ' 項。', en: 'A geometric sequence has first term ' + a + ' and common ratio ' + r + '. Find the ' + n + 'th term.' },
      visual: null,
      answer: a * Math.pow(r, n - 1),
      math: { op: 'gp', a: a, r: r, n: n },
      hint: { zh: '第 n 項 = 首項 × 公比^(n−1)。', en: 'nth term = first × ratio^(n−1).' }
    };
  }

  /* 概率 */
  function genProb(rng, o) {
    var total = pick(rng, [6, 8, 10, 12]);
    var good = randInt(rng, 1, total - 1);
    return {
      type: 'prob',
      prompt: { zh: '袋中有 ' + total + ' 個球，其中 ' + good + ' 個是紅球。隨機抽一個，抽到紅球的概率是多少？', en: 'A bag has ' + total + ' balls, ' + good + ' of them red. What is the probability of drawing a red ball?' },
      visual: null,
      answer: { n: good, d: total },
      math: { op: 'prob', good: good, total: total },
      hint: { zh: '概率 = 紅球數 ÷ 總數。', en: 'Probability = red ÷ total.' }
    };
  }

  /* 二次方程的根之和 / 積 */
  function genQuad(rng, o) {
    var p = randInt(rng, 1, 8);
    var q = randInt(rng, 1, 8);
    var sum = p + q;
    var prod = p * q;
    var askSum = rng() < 0.5;
    var bx = (sum > 0 ? '- ' + sum : '+ ' + (-sum));
    var cs = (prod > 0 ? '+ ' + prod : '- ' + (-prod));
    var eq = 'x^2 ' + bx + 'x ' + cs + ' = 0';
    return {
      type: 'quad',
      prompt: { zh: '設二次方程 $' + eq + '$ 的兩根為 α 和 β。求 $' + (askSum ? '\\alpha + \\beta' : '\\alpha\\beta') + '$。', en: 'The quadratic $' + eq + '$ has roots α and β. Find $' + (askSum ? '\\alpha + \\beta' : '\\alpha\\beta') + '$.' },
      visual: null,
      answer: askSum ? sum : prod,
      math: { op: 'quad', p: p, q: q, sum: sum, prod: prod, askSum: askSum },
      hint: { zh: '兩根之和 = −(x 的係數)；兩根之積 = 常數項。', en: 'Sum = −(coefficient of x); product = constant term.' }
    };
  }

  /* 中位數 */
  function genStats(rng, o) {
    var n = pick(rng, [5, 7]);
    var nums = [];
    for (var i = 0; i < n; i++) nums.push(randInt(rng, 1, 20));
    var sorted = nums.slice().sort(function (x, y) { return x - y; });
    return {
      type: 'stats',
      prompt: { zh: '求 ' + nums.join('、') + ' 的中位數。', en: 'Find the median of ' + nums.join(', ') + '.' },
      visual: null,
      answer: sorted[(n - 1) / 2],
      math: { op: 'stats', nums: nums, sorted: sorted },
      hint: { zh: '先把數字由小到大排列，再取中間那個。', en: 'Sort the numbers, then take the middle one.' }
    };
  }

  /* ---------------- 解題步驟（小課堂「一步步示範」用） ---------------- */

  function explainEquationZh(m) {
    if (m.form === 'x+a=c') return '兩邊同時減 ' + m.a + '：x = ' + m.c + ' − ' + m.a + '。';
    if (m.form === 'x-a=c') return '兩邊同時加 ' + m.a + '：x = ' + m.c + ' + ' + m.a + '。';
    if (m.form === 'ax=c') return '兩邊同時除以 ' + m.a + '：x = ' + m.c + ' ÷ ' + m.a + '。';
    return '兩邊同時乘 ' + m.a + '：x = ' + m.c + ' × ' + m.a + '。';
  }
  function explainEquationEn(m) {
    if (m.form === 'x+a=c') return 'Subtract ' + m.a + ' from both sides: x = ' + m.c + ' − ' + m.a + '.';
    if (m.form === 'x-a=c') return 'Add ' + m.a + ' to both sides: x = ' + m.c + ' + ' + m.a + '.';
    if (m.form === 'ax=c') return 'Divide both sides by ' + m.a + ': x = ' + m.c + ' ÷ ' + m.a + '.';
    return 'Multiply both sides by ' + m.a + ': x = ' + m.c + ' × ' + m.a + '.';
  }

  /* ================= 幾何與座標（含圖示） ================= */

  function fpt(p) { return '(' + p[0] + ', ' + p[1] + ')'; }

  /* 三角形面積 */
  function genTriangle(rng, o) {
    var b = randInt(rng, 2, 12);
    var h = randInt(rng, 2, 12) * 2; // 高為偶數 → 面積整數
    return {
      type: 'triangle',
      prompt: { zh: '三角形的底是 ' + b + ' cm，高是 ' + h + ' cm，面積是多少？', en: 'A triangle has base ' + b + ' cm and height ' + h + ' cm. What is its area?' },
      visual: { kind: 'triangle', b: b, h: h },
      answer: b * h / 2,
      math: { op: 'triangle', b: b, h: h },
      hint: { zh: '三角形面積 = 底 × 高 ÷ 2。', en: 'Triangle area = base × height ÷ 2.' }
    };
  }

  /* 圓的周長 / 面積（以 π 表示，答案為字串） */
  function genCircle(rng, o) {
    var r = randInt(rng, 1, 6);
    var suf = 'π';
    if (rng() < 0.5) {
      return {
        type: 'circle',
        prompt: { zh: '圓的半徑是 ' + r + ' cm，面積是多少？（以 π 表示）', en: 'A circle has radius ' + r + ' cm. What is its area? (in terms of π)' },
        visual: { kind: 'circle', r: r },
        answer: (r * r) + suf,
        math: { op: 'circle', r: r, mode: 'area' },
        choices: circleChoices(rng, r * r, suf),
        hint: { zh: '圓面積 = π r²。', en: 'Area = π r².' }
      };
    }
    return {
      type: 'circle',
      prompt: { zh: '圓的半徑是 ' + r + ' cm，周長是多少？（以 π 表示）', en: 'A circle has radius ' + r + ' cm. What is its circumference? (in terms of π)' },
      visual: { kind: 'circle', r: r },
      answer: (2 * r) + suf,
      math: { op: 'circle', r: r, mode: 'circ' },
      choices: circleChoices(rng, 2 * r, suf),
      hint: { zh: '圓周長 = 2π r。', en: 'Circumference = 2π r.' }
    };
  }

  function circleChoices(rng, k, suf) {
    var out = [k + suf];
    var seen = {}; seen[k] = true;
    var guard = 0;
    while (out.length < 4 && guard++ < 100) {
      var cand = k + pick(rng, [1, 2, -1, 3, -2]);
      if (cand <= 0) cand = k + 1;
      if (!seen[cand]) { seen[cand] = true; out.push(cand + suf); }
    }
    return shuffle(rng, out);
  }

  /* 長方體體積 */
  function genVolume(rng, o) {
    var l = randInt(rng, 2, 6);
    var w = randInt(rng, 2, 6);
    var h = randInt(rng, 2, 6);
    return {
      type: 'volume',
      prompt: { zh: '長方體的長 ' + l + ' cm、闊 ' + w + ' cm、高 ' + h + ' cm，體積是多少？', en: 'A cuboid is ' + l + ' cm by ' + w + ' cm by ' + h + ' cm. What is its volume?' },
      visual: { kind: 'cuboid', l: l, w: w, h: h },
      answer: l * w * h,
      math: { op: 'volume', l: l, w: w, h: h },
      hint: { zh: '體積 = 長 × 闊 × 高。', en: 'Volume = length × width × height.' }
    };
  }

  /* 座標：兩點距離 / 中點 */
  function genCoord(rng, o) {
    if (rng() < 0.5) {
      var t = pick(rng, [[3, 4, 5], [6, 8, 10], [5, 12, 13]]);
      var dx = t[0], dy = t[1], dist = t[2];
      var x0 = randInt(rng, 0, 3), y0 = randInt(rng, 0, 3);
      var A = [x0, y0], B = [x0 + dx, y0 + dy];
      return {
        type: 'coord',
        prompt: { zh: 'A' + fpt(A) + '，B' + fpt(B) + '。求 AB 的長度。', en: 'A' + fpt(A) + ', B' + fpt(B) + '. Find the length of AB.' },
        visual: { kind: 'plane', a: A, b: B },
        answer: dist,
        math: { op: 'coord', a: A, b: B, mode: 'dist', dist: dist },
        hint: { zh: '長度 = √((△x)² + (△y)²)。', en: 'Length = √((△x)² + (△y)²).' }
      };
    }
    var k = randInt(rng, 1, 3), m = randInt(rng, 1, 3);
    var x1 = randInt(rng, 0, 2), y1 = randInt(rng, 0, 2);
    var A2 = [x1, y1], B2 = [x1 + 2 * k, y1 + 2 * m];
    var mx = x1 + k, my = y1 + m;
    var answer = '(' + mx + ', ' + my + ')';
    return {
      type: 'coord',
      prompt: { zh: 'A' + fpt(A2) + '，B' + fpt(B2) + '。求 AB 的中點。', en: 'A' + fpt(A2) + ', B' + fpt(B2) + '. Find the midpoint of AB.' },
      visual: { kind: 'plane', a: A2, b: B2 },
      answer: answer,
      math: { op: 'coord', a: A2, b: B2, mode: 'mid', mx: mx, my: my },
      choices: midpointChoices(rng, mx, my),
      hint: { zh: '中點 = ((x1+x2)/2, (y1+y2)/2)。', en: 'Midpoint = ((x1+x2)/2, (y1+y2)/2).' }
    };
  }

  function midpointChoices(rng, mx, my) {
    var out = [
      '(' + mx + ', ' + my + ')',
      '(' + (mx + 1) + ', ' + my + ')',
      '(' + mx + ', ' + (my + 1) + ')',
      '(' + (mx - 1) + ', ' + my + ')'
    ];
    return shuffle(rng, out);
  }

  /* 回傳 { zh: [步驟...], en: [步驟...] }；不支援的題型回傳 null */
  function explain(p) {
    if (!p || !p.math) return null;
    var m = p.math, a, b, sum, sym, t, tens, ones, sumN;
    switch (p.type) {
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
          zh: ['周長 = (長 + 闊) × 2。', '(' + m.l + ' + ' + m.w + ') × 2 = ' + p.answer + ' cm。'],
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
        return {
          zh: ['第 n 項 = 首項 + (n − 1) × 公差。', '= ' + m.a + ' + (' + m.n + ' − 1) × ' + m.d + ' = ' + p.answer + '。'],
          en: ['nth term = first + (n − 1) × difference.', '= ' + m.a + ' + (' + m.n + ' − 1) × ' + m.d + ' = ' + p.answer + '.']
        };
      case 'gp':
        return {
          zh: ['第 n 項 = 首項 × 公比^(n−1)。', '= ' + m.a + ' × ' + m.r + '^(' + m.n + ' − 1) = ' + p.answer + '。'],
          en: ['nth term = first × ratio^(n−1).', '= ' + m.a + ' × ' + m.r + '^(' + m.n + ' − 1) = ' + p.answer + '.']
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
        return null;
      default:
        return null;
    }
  }

  var GENERATORS = {
    count: genCount,
    compare: genCompare,
    comparegroup: genCompareGroup,
    addition: genAddition,
    subtraction: genSubtraction,
    numberbonds: genNumberBonds,
    missing: genMissing,
    multiplication: genMultiplication,
    division: genDivision,
    fraction: genFraction,
    word: genWord,
    multidigit: genMultiDigit,
    fractionadd: genFractionAdd,
    decimal: genDecimal,
    decimalmul: genDecimalMul,
    average: genAverage,
    equation: genEquation,
    percent: genPercent,
    ratio: genRatio,
    area: genArea,
    fractionof: genFractionOf,
    directed: genDirected,
    exprsub: genExprSub,
    linear: genLinear,
    pythagoras: genPythagoras,
    simul: genSimul,
    indices: genIndices,
    inequality: genInequality,
    log: genLog,
    fx: genFx,
    trig: genTrig,
    ap: genAp,
    gp: genGp,
    prob: genProb,
    quad: genQuad,
    stats: genStats,
    triangle: genTriangle,
    circle: genCircle,
    volume: genVolume,
    coord: genCoord
  };

  /* ---------------- 選項（干擾項）生成 ---------------- */

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
      var k = valueKey(cand);
      if (!seen[k]) { seen[k] = true; out.push(cand); }
    }
    return shuffle(rng, out);
  }

  /* 每個類型合理的干擾項數值上界 */
  function distractorMax(p, o) {
    if (isFraction(p.answer)) return 20;
    if (p.type === 'division') return o.maxQuotient != null ? o.maxQuotient : 9;
    if (p.type === 'multiplication') {
      var f = o.maxFactor != null ? o.maxFactor : 9;
      return f * f;
    }
    if (p.type === 'word') {
      var ops = o.ops || ['add', 'sub', 'mul'];
      var bound = 0;
      if (ops.indexOf('add') >= 0) bound = Math.max(bound, (o.max != null ? o.max : 20) * 2);
      if (ops.indexOf('sub') >= 0) bound = Math.max(bound, o.max != null ? o.max : 20);
      if (ops.indexOf('mul') >= 0) bound = Math.max(bound, Math.pow(o.maxFactor != null ? o.maxFactor : 9, 2));
      return bound || 99;
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
    return 99;
  }

  /* 每個類型合理的干擾項數值下界（有向數可為負） */
  function distractorMin(p, o) {
    if (p.type === 'directed') return -100;
    if (p.type === 'fx') return -40;
    return 0;
  }

  /* ---------------- 技能配置輔助 ---------------- */

  /* 題目的穩定標識（含操作數，用於去重與「避開最近題」） */
  function mathSig(math) {
    switch (math.op) {
      case 'count': return 'n' + math.n;
      case 'frac': return math.n + '/' + math.d;
      case 'compare': return math.a + '_' + math.b + '_' + math.mode;
      case 'comparegroup': return math.a + '_' + math.b + '_' + math.mode;
    }
    var parts = [math.op];
    var keys = ['a', 'b', 'c', 'd', 'r', 'mode', 'form', 'n', 'x', 'whole', 'p', 'q', 'k', 'kind', 'pct', 'part', 'result', 'l', 'w', 'base', 'val', 'which', 'good', 'total', 'askSum', 'sum', 'prod'];
    keys.forEach(function (k) {
      if (math[k] != null) parts.push(k + '=' + math[k]);
    });
    if (math.nums) parts.push('nums=' + math.nums.join(','));
    if (math.blank) parts.push('blank=' + math.blank);
    return parts.join('_');
  }

  function levelFor(skill, difficultyStep) {
    var levels = skill.levels || [{ min: skill.min, max: skill.max }];
    var idx = Math.max(0, Math.min(difficultyStep || 0, levels.length - 1));
    var lvl = levels[idx] || {};
    return {
      min: lvl.min != null ? lvl.min : skill.min,
      max: lvl.max != null ? lvl.max : skill.max,
      table: lvl.table, minFactor: lvl.minFactor, maxFactor: lvl.maxFactor,
      maxDivisor: lvl.maxDivisor, maxQuotient: lvl.maxQuotient,
      minDen: lvl.minDen, maxDen: lvl.maxDen, minSum: lvl.minSum,
      forms: lvl.forms || skill.forms, ops: lvl.ops || skill.ops
    };
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
    p.difficultyStep = step;
    p.answerMax = o.max;
    p.answerMin = o.min;
    if (!p.choices) {
      p.choices = buildChoices(rng, p.answer, { min: distractorMin(p, o), max: distractorMax(p, o), base: p.base });
    }
    delete p.base;
    p.sig = p.type + ':' + mathSig(p.math);
    return p;
  }

  function generateSet(skill, count, opts) {
    opts = opts || {};
    var rng = opts.rng || seedRandom(opts.seed != null ? opts.seed : 1);
    var step = opts.difficultyStep != null ? opts.difficultyStep : 0;
    var out = [];
    var seen = {};
    var guardTotal = 0;
    while (out.length < count && guardTotal++ < count * 200) {
      var p = generateProblem(skill, { rng: rng, difficultyStep: step });
      if (!seen[p.sig]) {
        seen[p.sig] = true;
        out.push(p);
      }
    }
    return out;
  }

  /* ---------------- 判分 ---------------- */

  function checkAnswer(problem, input) {
    var expected = problem.answer;
    var parsed = normalizeInput(input, expected);
    return { correct: valuesEqual(expected, parsed), expected: expected };
  }

  /* ---------------- 進度、掌握度、自適應 ---------------- */

  function defaultSkillProgress() {
    return {
      attempts: 0, correct: 0,
      consecCorrect: 0, consecWrong: 0,
      difficultyStep: 0, lastSeen: 0,
      typeAcc: {}, stars: 0, mastered: false,
      quizStars: 0, quizBest: 0,
      lastProblems: []
    };
  }

  function newProgress() {
    return { version: 1, lang: 'zh', sound: true, stars: 0, streak: { lastDay: null, count: 0 }, badges: [], skills: {} };
  }

  function practiceStars(correct, practice) {
    if (correct >= practice) return 3;
    if (correct >= Math.ceil(practice * 0.66)) return 2;
    if (correct >= Math.ceil(practice * 0.33)) return 1;
    return 0;
  }

  function quizStars(percent) {
    if (percent >= 0.95) return 3;
    if (percent >= 0.8) return 2;
    if (percent >= 0.6) return 1;
    return 0;
  }

  function masteryStatus(progress, skill) {
    var sp = progress.skills[skill.id] || defaultSkillProgress();
    var practice = (skill.mastery && skill.mastery.practice) || 10;
    var pStars = practiceStars(sp.correct, practice);
    var qStars = sp.quizStars || 0;
    var stars = Math.max(pStars, qStars);
    var mastered = qStars >= 2; // 通過測驗（≧80%）才算掌握，用於解鎖下一關
    return { practiceStars: pStars, quizStars: qStars, stars: stars, mastered: mastered, practice: practice };
  }

  function applyResult(progress, skill, problem, correct) {
    if (!progress.skills[skill.id]) progress.skills[skill.id] = defaultSkillProgress();
    var sp = progress.skills[skill.id];
    sp.attempts += 1;
    sp.lastSeen = Date.now();
    var acc = sp.typeAcc[problem.type] || { a: 0, c: 0 };
    acc.a += 1;
    if (correct) {
      acc.c += 1;
      sp.correct += 1;
      sp.consecCorrect += 1;
      sp.consecWrong = 0;
      if (sp.consecCorrect >= 3) {
        sp.difficultyStep += 1;
        sp.consecCorrect = 0;
      }
    } else {
      sp.consecWrong += 1;
      sp.consecCorrect = 0;
      if (sp.consecWrong >= 2) {
        sp.difficultyStep = Math.max(0, sp.difficultyStep - 1);
        sp.consecWrong = 0;
      }
    }
    var levels = skill.levels || [{ min: skill.min, max: skill.max }];
    sp.difficultyStep = Math.max(0, Math.min(sp.difficultyStep, levels.length - 1));
    sp.typeAcc[problem.type] = acc;
    sp.lastProblems.push({ type: problem.type, sig: problem.sig });
    if (sp.lastProblems.length > 3) sp.lastProblems.shift();
    var st = masteryStatus(progress, skill);
    sp.stars = st.stars;
    sp.mastered = st.mastered;
    return progress;
  }

  function applyQuizResult(progress, skill, percent) {
    if (!progress.skills[skill.id]) progress.skills[skill.id] = defaultSkillProgress();
    var sp = progress.skills[skill.id];
    var qs = quizStars(percent);
    sp.quizStars = Math.max(sp.quizStars || 0, qs);
    sp.quizBest = Math.max(sp.quizBest || 0, Math.round(percent * 100));
    var st = masteryStatus(progress, skill);
    sp.stars = st.stars;
    sp.mastered = st.mastered;
    return progress;
  }

  function gradeQuiz(results) {
    var correct = 0, total = results.length;
    results.forEach(function (r) { if (r.correct) correct++; });
    var percent = total ? correct / total : 0;
    return { correct: correct, total: total, percent: percent, stars: quizStars(percent) };
  }

  /* ---------------- 自適應選題 ---------------- */

  function nextProblem(skill, progress, opts) {
    opts = opts || {};
    var rng = opts.rng || seedRandom(Date.now() & 0xffffffff);
    var sp = progress.skills[skill.id] || defaultSkillProgress();
    var step = sp.difficultyStep;
    var types = typeList(skill);

    // 按正確率加權：正確率低的類型更常出現（間隔復習精簡版）
    var weights = types.map(function (ts) {
      var acc = sp.typeAcc[ts.t];
      if (!acc || acc.a === 0) return 1;
      return Math.max(0.05, 1 - acc.c / acc.a);
    });
    var totalW = weights.reduce(function (s, w) { return s + w; }, 0);
    var roll = rng() * totalW;
    var chosenIdx = 0;
    for (var i = 0; i < types.length; i++) {
      roll -= weights[i];
      if (roll <= 0) { chosenIdx = i; break; }
    }

    var recent = sp.lastProblems || [];
    var p = null;
    var guard = 0;
    while (guard++ < 12) {
      p = generateProblem(skill, { rng: rng, difficultyStep: step, typeIndex: chosenIdx });
      var seenRecent = recent.some(function (r) { return r.sig === p.sig; });
      if (!seenRecent) break;
    }
    return p;
  }

  /* ---------------- 導出 ---------------- */

  return {
    GENERATOR_TYPES: GENERATOR_TYPES,
    seedRandom: seedRandom,
    randInt: randInt,
    pick: pick,
    shuffle: shuffle,
    isFraction: isFraction,
    valueKey: valueKey,
    renderValue: renderValue,
    normalizeInput: normalizeInput,
    generateProblem: generateProblem,
    generateSet: generateSet,
    explain: explain,
    checkAnswer: checkAnswer,
    defaultSkillProgress: defaultSkillProgress,
    newProgress: newProgress,
    practiceStars: practiceStars,
    quizStars: quizStars,
    masteryStatus: masteryStatus,
    applyResult: applyResult,
    applyQuizResult: applyQuizResult,
    gradeQuiz: gradeQuiz,
    nextProblem: nextProblem
  };
});
