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
    'equation', 'percent', 'ratio', 'area', 'fractionof'
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
    var a, b, answer, prompt;
    if (op === 'add') {
      a = randInt(rng, o.min != null ? o.min : 1, o.max != null ? o.max : 20);
      b = randInt(rng, 1, o.max != null ? o.max : 20);
      answer = a + b;
      prompt = {
        zh: '小明有 ' + a + ' 個蘋果，媽媽又給了他 ' + b + ' 個，一共有幾個？',
        en: 'Sam has ' + a + ' apples and gets ' + b + ' more. How many in all?'
      };
    } else if (op === 'sub') {
      a = randInt(rng, 2, o.max != null ? o.max : 20);
      b = randInt(rng, 1, a);
      answer = a - b;
      prompt = {
        zh: '小明有 ' + a + ' 個蘋果，吃了 ' + b + ' 個，還剩幾個？',
        en: 'Sam has ' + a + ' apples and eats ' + b + '. How many are left?'
      };
    } else {
      a = randInt(rng, 2, o.maxFactor != null ? o.maxFactor : 9);
      b = randInt(rng, 2, o.maxFactor != null ? o.maxFactor : 9);
      answer = a * b;
      prompt = {
        zh: '每盒有 ' + a + ' 個，一共有 ' + b + ' 盒，一共有幾個？',
        en: 'There are ' + a + ' in each box and ' + b + ' boxes. How many in all?'
      };
    }
    return {
      type: 'word',
      prompt: prompt,
      visual: null,
      answer: answer,
      math: { op: op, a: a, b: b },
      hint: { zh: '先想想用加法、減法還是乘法。', en: 'Decide: add, subtract, or multiply?' }
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
    fractionof: genFractionOf
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
      if (!frac && cand < 0) continue;
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
    return 99;
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
    var keys = ['a', 'b', 'c', 'd', 'r', 'mode', 'form', 'n', 'whole', 'p', 'q', 'k', 'kind', 'pct', 'part', 'result', 'l', 'w'];
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
      p.choices = buildChoices(rng, p.answer, { min: 0, max: distractorMax(p, o), base: p.base });
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
