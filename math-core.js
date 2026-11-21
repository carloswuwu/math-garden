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

  /* 題型目錄由 GENERATORS 的鍵自動產生，避免清單與實作脫節 */
  var GENERATOR_TYPES;

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

  function gcdInt(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { var t = a % b; a = b; b = t; }
    return a || 1;
  }

  /* 化簡為最簡分數；分母保持正數 */
  function reduceFraction(f) {
    var sign = f.d < 0 ? -1 : 1;
    var g = gcdInt(f.n, f.d);
    return { n: (f.n * sign) / g, d: (f.d * sign) / g };
  }

  /* 值鍵：等值分數共用同一鍵（2/4 與 1/2 相同），用於選項去重 */
  function valueKey(v) {
    if (!isFraction(v)) return String(v);
    var r = reduceFraction(v);
    return r.n + '/' + r.d;
  }

  function renderValue(v) {
    if (!isFraction(v)) return String(v);
    var r = reduceFraction(v);
    return r.d === 1 ? String(r.n) : r.n + '/' + r.d;
  }

  /* 等值分數視為相等：2/4 = 1/2 */
  function valuesEqual(a, b) {
    if (isFraction(a) && isFraction(b)) return a.n * b.d === b.n * a.d;
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
    var dots = a <= 20 && b <= 20;
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
      hint: dots
        ? { zh: '比較兩組圓點，多的那組數更大。', en: 'The group with more dots is the bigger number.' }
        : { zh: '先比較十位，十位相同再比個位。', en: 'Compare the tens first, then the ones if the tens are equal.' }
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
      prompt: pick(rng, [
        eqPrompt(a, '+', b),
        { zh: a + ' 再加 ' + b + ' 等於多少？', en: 'What is ' + a + ' plus ' + b + '?' },
        { zh: '有 ' + a + ' 個，再來 ' + b + ' 個，一共幾個？', en: 'There are ' + a + ' and ' + b + ' more arrive. How many in all?' }
      ]),
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
      prompt: pick(rng, [
        eqPrompt(a, '−', b),
        { zh: a + ' 減 ' + b + ' 等於多少？', en: 'What is ' + a + ' minus ' + b + '?' },
        { zh: '有 ' + a + ' 個，拿走 ' + b + ' 個，還剩幾個？', en: 'There are ' + a + ' and ' + b + ' are taken away. How many are left?' }
      ]),
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
      prompt: pick(rng, [
        eqPrompt(a, '×', b),
        { zh: '每盒 ' + a + ' 個，共 ' + b + ' 盒，一共有幾個？', en: 'There are ' + a + ' in each box and ' + b + ' boxes. How many in all?' },
        { zh: '有 ' + a + ' 排，每排 ' + b + ' 個，一共有幾個？', en: 'There are ' + a + ' rows with ' + b + ' in each row. How many in all?' },
        { zh: '求 ' + a + ' 和 ' + b + ' 的積。', en: 'What is the product of ' + a + ' and ' + b + '?' }
      ]),
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
      prompt: pick(rng, [
        eqPrompt(a, '÷', b),
        { zh: '把 ' + a + ' 個平均分成 ' + b + ' 份，每份幾個？', en: 'Share ' + a + ' equally into ' + b + ' groups. How many in each group?' },
        { zh: a + ' 個，每 ' + b + ' 個一份，可以分成幾份？', en: 'How many groups of ' + b + ' can be made from ' + a + '?' }
      ]),
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
      prompt: { zh: '塗色部分用分數表示是多少？', en: 'What fraction is shaded?' },
      visual: { kind: 'fraction', n: n, d: d },
      answer: { n: n, d: d },
      math: { op: 'frac', n: n, d: d },
      hint: { zh: '分母是總份數，分子是塗色的份數。', en: 'Denominator = total parts, numerator = shaded parts.' }
    };
  }

  var WORD_NAMES = [
    { zh: '小明', en: 'Sam' }, { zh: '小美', en: 'Mia' },
    { zh: '志強', en: 'Kai' }, { zh: '家寶', en: 'Bo' },
    { zh: '小欣', en: 'Ann' }, { zh: '子軒', en: 'Jay' },
    { zh: '嘉怡', en: 'Eva' }, { zh: '浩然', en: 'Leo' }
  ];
  var WORD_ITEMS = [
    { zh: '蘋果', en: 'apples', en1: 'apple' },
    { zh: '貼紙', en: 'stickers', en1: 'sticker' },
    { zh: '波子', en: 'marbles', en1: 'marble' },
    { zh: '書', en: 'books', en1: 'book' },
    { zh: '鉛筆', en: 'pencils', en1: 'pencil' },
    { zh: '郵票', en: 'stamps', en1: 'stamp' },
    { zh: '糖果', en: 'sweets', en1: 'sweet' },
    { zh: '卡片', en: 'cards', en1: 'card' },
    { zh: '貝殼', en: 'shells', en1: 'shell' },
    { zh: '玻璃珠', en: 'beads', en1: 'bead' }
  ];

  function genWordBasic(rng, o, forcedOp) {
    var op = forcedOp || pick(rng, o.ops || ['add', 'sub', 'mul']);
    var a, b, c = null, answer, prompt, mathOp;
    var who = pick(rng, WORD_NAMES);
    var item = pick(rng, WORD_ITEMS);
    var pl = function (n) { return n === 1 ? item.en1 : item.en; };
    if (op === 'add') {
      a = randInt(rng, o.min != null ? o.min : 1, o.max != null ? o.max : 20);
      b = randInt(rng, 1, o.max != null ? o.max : 20);
      answer = a + b;
      mathOp = 'add';
      prompt = pick(rng, [
        {
          zh: who.zh + '有 ' + a + ' 個' + item.zh + '，又得到了 ' + b + ' 個，一共有幾個？',
          en: who.en + ' has ' + a + ' ' + pl(a) + ' and gets ' + b + ' more. How many in all?'
        },
        {
          zh: '盒子裡有 ' + a + ' 個' + item.zh + '，再放入 ' + b + ' 個，現在共有幾個？',
          en: 'A box has ' + a + ' ' + pl(a) + ' and ' + b + ' more are added. How many are there now?'
        },
        {
          zh: who.zh + '上午用了 ' + a + ' 個' + item.zh + '，下午用了 ' + b + ' 個，一共用了幾個？',
          en: who.en + ' uses ' + a + ' ' + pl(a) + ' in the morning and ' + b + ' in the afternoon. How many in all?'
        }
      ]);
    } else if (op === 'sub') {
      a = randInt(rng, 2, o.max != null ? o.max : 20);
      b = randInt(rng, 1, a);
      answer = a - b;
      mathOp = 'sub';
      prompt = pick(rng, [
        {
          zh: who.zh + '有 ' + a + ' 個' + item.zh + '，用掉了 ' + b + ' 個，還剩幾個？',
          en: who.en + ' has ' + a + ' ' + pl(a) + ' and uses ' + b + '. How many are left?'
        },
        {
          zh: '一共有 ' + a + ' 個' + item.zh + '，送出了 ' + b + ' 個，還剩幾個？',
          en: 'There are ' + a + ' ' + pl(a) + ' and ' + b + ' are given away. How many are left?'
        },
        {
          zh: who.zh + '要收集 ' + a + ' 張' + item.zh + '，已經有 ' + b + ' 張，還差幾張？',
          en: who.en + ' needs ' + a + ' ' + pl(a) + ' and already has ' + b + '. How many more are needed?'
        }
      ]);
    } else if (op === 'mul') {
      a = randInt(rng, 2, o.maxFactor != null ? o.maxFactor : 9);
      b = randInt(rng, 2, o.maxFactor != null ? o.maxFactor : 9);
      answer = a * b;
      mathOp = 'mul';
      prompt = pick(rng, [
        {
          zh: '每盒有 ' + a + ' 個' + item.zh + '，共有 ' + b + ' 盒，一共有幾個？',
          en: 'There are ' + a + ' ' + pl(a) + ' in each box and ' + b + ' boxes. How many in all?'
        },
        {
          zh: '有 ' + b + ' 排座位，每排 ' + a + ' 個，一共多少個座位？',
          en: 'There are ' + b + ' rows with ' + a + ' seats in each row. How many seats in all?'
        },
        {
          zh: who.zh + '每天做 ' + a + ' 個' + item.zh + '，做了 ' + b + ' 天，一共做了幾個？',
          en: who.en + ' makes ' + a + ' ' + pl(a) + ' each day for ' + b + ' days. How many in all?'
        }
      ]);
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
    } else if (op === 'twoStep') {
      a = randInt(rng, 2, o.maxFactor != null ? o.maxFactor : 9);
      b = randInt(rng, 2, o.maxFactor != null ? o.maxFactor : 9);
      c = randInt(rng, 1, a * b - 1);
      answer = a * b - c;
      mathOp = 'wtwostep';
      prompt = {
        zh: '每盒有 ' + a + ' 個' + item.zh + '，共有 ' + b + ' 盒，送出了 ' + c + ' 個，還剩幾個？',
        en: 'There are ' + a + ' ' + pl(a) + ' in each box and ' + b + ' boxes. ' + c + ' are given away. How many are left?'
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

  /* ---------------- 深度應用題（多步／跨概念，仍然只有 type 'word'） ----------------
   * 與基本題共用同一題型；以 math.op 區分，答案一律為整數。
   * 每個 op 都必須同時出現在 MATH_SPEC、explain() 的 word 分支與 distractorMax。 */
  var DEEP_WORD_OPS = ['wunit', 'wmoney2', 'wreverse', 'wprofit2', 'wratio2', 'wrate2', 'wgeo2', 'wdata2', 'wtable', 'wequation'];
  var BASIC_WORD_OPS = ['add', 'sub', 'mul', 'area', 'percent', 'speed', 'profit', 'compound', 'twoStep', 'ratio'];

  function genWord(rng, o) {
    var ops = (o.ops || ['add', 'sub', 'mul']).slice();
    var op = pick(rng, ops);
    if (DEEP_WORD_OPS.indexOf(op) !== -1) return genWordDeep(rng, o, op);
    if (BASIC_WORD_OPS.indexOf(op) === -1) throw new Error('未知 word 模式: ' + op);
    return genWordBasic(rng, o, op);
  }

  function genWordDeep(rng, o, op) {
    var who = pick(rng, WORD_NAMES);
    var item = pick(rng, WORD_ITEMS);
    function money(n) { return '$' + n; }
    if (op === 'wunit') {
      var unit = randInt(rng, 2, 25);
      var n1 = randInt(rng, 2, 8);
      var n2 = randInt(rng, 2, 12);
      while (n2 === n1) n2 = randInt(rng, 2, 12);
      var cost1 = unit * n1;
      var unitAnswer = unit * n2;
      return {
        type: 'word',
        prompt: {
          zh: n1 + ' 件相同的' + item.zh + '共 ' + money(cost1) + '，買 ' + n2 + ' 件要付多少錢？',
          en: n1 + ' identical ' + item.en + ' cost ' + money(cost1) + ' in total. How much do ' + n2 + ' of them cost?'
        },
        visual: null,
        answer: unitAnswer,
        math: { op: 'wunit', n1: n1, n2: n2, cost1: cost1, unit: unit },
        hint: { zh: '先求一件的價錢（總價 ÷ 件數），再乘要買的件數。', en: 'Find the price of one first, then multiply by how many you buy.' }
      };
    }
    if (op === 'wmoney2') {
      var pen = randInt(rng, 2, 15);
      var pens = randInt(rng, 2, 5);
      var ruler = randInt(rng, 1, 10);
      var rulers = randInt(rng, 2, 5);
      var totalCost = pen * pens + ruler * rulers;
      var change = randInt(rng, 1, 20);
      var paid = totalCost + change;
      return {
        type: 'word',
        prompt: {
          zh: '一支筆 ' + money(pen) + '，一把尺 ' + money(ruler) + '。' + who.zh + '買了 ' + pens + ' 支筆和 ' + rulers + ' 把尺，付了 ' + money(paid) + '，應找回多少錢？',
          en: 'A pen costs ' + money(pen) + ' and a ruler costs ' + money(ruler) + '. ' + who.en + ' buys ' + pens + ' pens and ' + rulers + ' rulers and pays ' + money(paid) + '. How much change is there?'
        },
        visual: null,
        answer: change,
        math: { op: 'wmoney2', p1: pen, n1: pens, p2: ruler, n2: rulers, paid: paid, total: totalCost },
        hint: { zh: '先算兩樣貨品的總價，再用付的錢減去總價。', en: 'Find the total cost first, then subtract it from what was paid.' },
        base: [change, paid - pen * pens, paid - ruler * rulers, totalCost]
      };
    }
    if (op === 'wreverse') {
      var discPick = pick(rng, [{ p: 20, m: 5, r: 40 }, { p: 25, m: 4, r: 40 }, { p: 50, m: 2, r: 60 }]);
      var original = discPick.m * randInt(rng, 8, discPick.r);
      var salePrice = original * (100 - discPick.p) / 100;
      return {
        type: 'word',
        prompt: {
          zh: '一件' + item.zh + '減價 ' + discPick.p + '% 後售 ' + money(salePrice) + '，原價是多少？',
          en: 'After a ' + discPick.p + '% discount, an item costs ' + money(salePrice) + '. What was the original price?'
        },
        visual: null,
        answer: original,
        math: { op: 'wreverse', disc: discPick.p, price: salePrice },
        hint: { zh: '售價 = 原價 × (100 − 折扣)%，所以原價 = 售價 ÷ (100 − 折扣)%。', en: 'Sale price = original × (100 − discount)%, so original = sale price ÷ (100 − discount)%.' }
      };
    }
    if (op === 'wprofit2') {
      var pcs = randInt(rng, 2, 8);
      var unitCost = randInt(rng, 10, 50);
      var profit = randInt(rng, 5, 60);
      var income = pcs * unitCost + profit;
      return {
        type: 'word',
        prompt: {
          zh: '店鋪以每件 ' + money(unitCost) + ' 買入 ' + pcs + ' 件貨品，全部售出共得 ' + money(income) + '。盈利是多少？',
          en: 'A shop buys ' + pcs + ' items at ' + money(unitCost) + ' each and sells them all for ' + money(income) + '. What is the profit?'
        },
        visual: null,
        answer: profit,
        math: { op: 'wprofit2', n: pcs, cost: unitCost, sell: income },
        hint: { zh: '盈利 = 全部售價 − 全部成本。', en: 'Profit = total selling price − total cost.' }
      };
    }
    if (op === 'wratio2') {
      var rp = randInt(rng, 1, 3);
      var rq = randInt(rng, rp + 1, 6);
      var rk = randInt(rng, 2, 8);
      var diff = (rq - rp) * rk;
      var totalStudents = (rp + rq) * rk;
      return {
        type: 'word',
        prompt: {
          zh: '男、女生人數的比是 ' + rp + ' : ' + rq + '，女生比男生多 ' + diff + ' 人。男女生共有多少人？',
          en: 'The ratio of boys to girls is ' + rp + ' : ' + rq + '. There are ' + diff + ' more girls than boys. How many students are there in total?'
        },
        visual: null,
        answer: totalStudents,
        math: { op: 'wratio2', p: rp, q: rq, k: rk, diff: diff },
        hint: { zh: '相差 ' + (rq - rp) + ' 份 = ' + diff + ' 人，先求一份。', en: 'The difference is ' + (rq - rp) + ' parts = ' + diff + ', so find one part first.' }
      };
    }
    if (op === 'wrate2') {
      var rate = randInt(rng, 30, 90);
      var t1 = randInt(rng, 2, 4);
      var t2 = randInt(rng, 2, 6);
      while (t2 === t1) t2 = randInt(rng, 2, 6);
      var distance = rate * t1;
      return {
        type: 'word',
        prompt: {
          zh: '汽車 ' + t1 + ' 小時行了 ' + distance + ' km（速率固定），' + t2 + ' 小時可行多少 km？',
          en: 'A car travels ' + distance + ' km in ' + t1 + ' hours at a steady speed. How far does it travel in ' + t2 + ' hours?'
        },
        visual: null,
        answer: rate * t2,
        math: { op: 'wrate2', rate: rate, t1: t1, t2: t2 },
        hint: { zh: '先求速率（距離 ÷ 時間），再乘新的時間。', en: 'Find the speed first, then multiply by the new time.' }
      };
    }
    if (op === 'wgeo2') {
      var len = randInt(rng, 3, 12);
      var wid = randInt(rng, 3, 12);
      var perSqm = randInt(rng, 5, 20);
      return {
        type: 'word',
        prompt: {
          zh: '長方形房間長 ' + len + ' m、闊 ' + wid + ' m，鋪地磚每平方米 ' + money(perSqm) + '，共需多少錢？',
          en: 'A rectangular room is ' + len + ' m by ' + wid + ' m. Flooring costs ' + money(perSqm) + ' per square metre. What is the total cost?'
        },
        visual: null,
        answer: len * wid * perSqm,
        math: { op: 'wgeo2', l: len, w: wid, cost: perSqm },
        hint: { zh: '先求面積，再乘每平方米的費用。', en: 'Find the area first, then multiply by the cost per square metre.' }
      };
    }
    if (op === 'wdata2') {
      var testCount = 5;
      var targetMean = randInt(rng, 60, 90);
      var prior = [];
      var priorSum = 0;
      var needed = 0;
      var guard = 0;
      do {
        prior = [];
        priorSum = 0;
        for (var pi = 0; pi < testCount - 1; pi++) {
          var sc = randInt(rng, 50, 90);
          prior.push(sc);
          priorSum += sc;
        }
        needed = targetMean * testCount - priorSum;
        guard++;
      } while ((needed < 0 || needed > 100) && guard < 60);
      return {
        type: 'word',
        prompt: {
          zh: who.zh + ' 首 ' + (testCount - 1) + ' 次測驗的分數是 ' + prior.join('、') + ' 分。他想 ' + testCount + ' 次測驗的平均分是 ' + targetMean + ' 分，第 ' + testCount + ' 次要考多少分？',
          en: who.en + "'s scores in the first " + (testCount - 1) + ' tests are ' + prior.join(', ') + '. What score does ' + who.en + ' need in test ' + testCount + ' for a mean of ' + targetMean + '?'
        },
        visual: null,
        answer: needed,
        math: { op: 'wdata2', scores: prior, n: testCount, target: targetMean },
        hint: { zh: '先求總分目標（平均 × 次數），再減去已有的總分。', en: 'Find the target total (mean × number of tests), then subtract the scores so far.' }
      };
    }
    if (op === 'wtable') {
      var prices = [randInt(rng, 2, 12), randInt(rng, 2, 12), randInt(rng, 2, 12)];
      var qty = [randInt(rng, 1, 3), randInt(rng, 1, 3), randInt(rng, 1, 3)];
      var tableTotal = prices[0] * qty[0] + prices[1] * qty[1] + prices[2] * qty[2];
      var tableChange = randInt(rng, 1, 25);
      var tablePaid = tableTotal + tableChange;
      return {
        type: 'word',
        prompt: {
          zh: '價目表：鉛筆 ' + money(prices[0]) + '、橡皮 ' + money(prices[1]) + '、記事簿 ' + money(prices[2]) + '。' + who.zh + '買鉛筆 ' + qty[0] + ' 支、橡皮 ' + qty[1] + ' 塊、記事簿 ' + qty[2] + ' 本，付了 ' + money(tablePaid) + '，應找回多少錢？',
          en: 'Price list: pencil ' + money(prices[0]) + ', eraser ' + money(prices[1]) + ', notebook ' + money(prices[2]) + '. ' + who.en + ' buys ' + qty[0] + ' pencils, ' + qty[1] + ' erasers and ' + qty[2] + ' notebooks and pays ' + money(tablePaid) + '. How much change is there?'
        },
        visual: null,
        answer: tableChange,
        math: { op: 'wtable', prices: prices, qty: qty, paid: tablePaid, total: tableTotal },
        hint: { zh: '逐項計價後加起來，再用付的錢減去總價。', en: 'Price each line, add them up, then subtract from what was paid.' }
      };
    }
    if (op === 'wequation') {
      var coef = randInt(rng, 2, 9);
      var unknown = randInt(rng, 2, 12);
      var addend = randInt(rng, 1, 20);
      var result = coef * unknown + addend;
      return {
        type: 'word',
        prompt: {
          zh: '一個數的 ' + coef + ' 倍加 ' + addend + ' 等於 ' + result + '，求這個數。',
          en: 'When ' + coef + ' times a number is increased by ' + addend + ', the result is ' + result + '. Find the number.'
        },
        visual: null,
        answer: unknown,
        math: { op: 'wequation', a: coef, b: addend, result: result },
        hint: { zh: '先減去 ' + addend + '，再除以 ' + coef + '。', en: 'Subtract ' + addend + ' first, then divide by ' + coef + '.' }
      };
    }
    throw new Error('未知 word 模式: ' + op);
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
      visual: { kind: 'barchart' },
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

  /* 百分數（難度級別可指定 modes：of/what/increase/decrease/change/reverse） */
  function genPercent(rng, o) {
    var modes = (o.modes && o.modes.length) ? o.modes : ['of', 'what', 'increase', 'decrease'];
    var mode = pick(rng, modes);
    if (mode === 'reverse') {
      var disc = pick(rng, [20, 25, 50]);
      var mult = disc === 20 ? 5 : disc === 25 ? 4 : 2;
      var original = mult * randInt(rng, 8, 60);
      var salePrice = original * (100 - disc) / 100;
      return {
        type: 'percent',
        prompt: {
          zh: '一件貨品減價 ' + disc + '% 後售 $' + salePrice + '，原價是多少？',
          en: 'After a ' + disc + '% discount, an item costs $' + salePrice + '. What was the original price?'
        },
        visual: null,
        answer: original,
        math: { op: 'percent', kind: 'reverse', p: disc, price: salePrice },
        hint: { zh: '原價 = 售價 ÷ (100 − 折扣)%。', en: 'Original = sale price ÷ (100 − discount)%.' }
      };
    }
    if (mode === 'change') {
      var rate = pick(rng, [10, 20, 25, 50]);
      var whole = pick(rng, [100, 200, 400, 500]);
      var changed = whole * (100 + rate) / 100;
      return {
        type: 'percent',
        prompt: {
          zh: '某數由 ' + whole + ' 變成 ' + changed + '，增加了百分之幾？',
          en: 'A number changes from ' + whole + ' to ' + changed + '. What is the percentage increase?'
        },
        visual: { kind: 'percentgrid', pct: rate },
        answer: rate,
        math: { op: 'percent', kind: 'change', whole: whole, result: changed },
        hint: { zh: '百分率 = (新值 − 舊值) ÷ 舊值 × 100%。', en: 'Percentage change = (new − old) ÷ old × 100%.' }
      };
    }
    if (mode === 'what') {
      var pct = pick(rng, [10, 20, 25, 50, 75]);
      var whole2 = pick(rng, [40, 60, 80, 120, 200]);
      var part = whole2 * pct / 100;
      return {
        type: 'percent',
        prompt: { zh: part + ' 是 ' + whole2 + ' 的百分之幾？', en: part + ' is what percent of ' + whole2 + '?' },
        visual: { kind: 'percentgrid', pct: pct },
        answer: pct,
        math: { op: 'percent', kind: 'what', pct: pct, whole: whole2, part: part },
        hint: { zh: '用「部分 ÷ 整體 × 100%」。', en: 'Use part ÷ whole × 100%.' }
      };
    }
    if (mode === 'increase' || mode === 'decrease') {
      var base = pick(rng, [40, 80, 120, 200, 500]);
      var pct2 = pick(rng, [10, 20, 25, 50]);
      var up = mode === 'increase';
      var result = base * (up ? 100 + pct2 : 100 - pct2) / 100;
      return {
        type: 'percent',
        prompt: {
          zh: '某數是 ' + base + '，' + (up ? '增加' : '減少') + ' ' + pct2 + '% 後是多少？',
          en: 'A number is ' + base + '. What is it after a ' + pct2 + '% ' + (up ? 'increase' : 'decrease') + '?'
        },
        visual: { kind: 'percentgrid', pct: pct2 },
        answer: result,
        math: { op: 'percent', kind: up ? 'increase' : 'decrease', p: pct2, whole: base, result: result },
        hint: {
          zh: up ? '增加 ' + pct2 + '%：原數 × (1 + ' + pct2 + '/100)。' : '減少 ' + pct2 + '%：原數 × (1 − ' + pct2 + '/100)。',
          en: up ? 'Increase: multiply by (1 + ' + pct2 + '/100).' : 'Decrease: multiply by (1 − ' + pct2 + '/100).'
        }
      };
    }
    var pof = pick(rng, [5, 10, 15, 20, 25, 30, 40, 50, 60, 75]);
    var k = randInt(rng, 1, 3);
    var wholeOf = 100 * k;
    return {
      type: 'percent',
      prompt: { zh: wholeOf + ' 的 ' + pof + '% 是多少？', en: 'What is ' + pof + '% of ' + wholeOf + '?' },
      visual: { kind: 'percentgrid', pct: pof },
      answer: pof * k,
      math: { op: 'percent', kind: 'of', p: pof, whole: wholeOf, result: pof * k },
      hint: { zh: '先算 1%（除以 100），再乘以 ' + pof + '。', en: 'Find 1% (divide by 100), then multiply by ' + pof + '.' }
    };
  }

  /* 比與比例（modes: findB/share/threePart） */
  function genRatio(rng, o) {
    var modes = (o.modes && o.modes.length) ? o.modes : ['findB'];
    var mode = pick(rng, modes);
    var p = randInt(rng, 2, 9);
    var q = randInt(rng, 2, 9);
    while (q === p) q = randInt(rng, 2, 9);
    var k = randInt(rng, 2, 12);
    if (mode === 'threePart') {
      var r = randInt(rng, 2, 9);
      while (r === p || r === q) r = randInt(rng, 2, 9);
      var k3 = randInt(rng, 2, 8);
      var total3 = (p + q + r) * k3;
      return {
        type: 'ratio',
        prompt: {
          zh: '把 $' + total3 + ' 按 ' + p + ' : ' + q + ' : ' + r + ' 分給甲、乙、丙，丙得多少？',
          en: 'Share $' + total3 + ' among A, B and C in the ratio ' + p + ' : ' + q + ' : ' + r + '. How much does C get?'
        },
        visual: null,
        answer: r * k3,
        math: { op: 'ratio', mode: 'threePart', p: p, q: q, r: r, k: k3, total: total3 },
        hint: { zh: '總共 ' + p + '+' + q + '+' + r + ' 份，先求一份。', en: 'There are ' + p + '+' + q + '+' + r + ' parts in total; find one part.' }
      };
    }
    if (mode === 'share') {
      var total2 = (p + q) * k;
      return {
        type: 'ratio',
        prompt: {
          zh: '甲、乙兩數的比是 ' + p + ' : ' + q + '，兩數之和是 ' + total2 + '，甲是多少？',
          en: 'A : B = ' + p + ' : ' + q + ' and A + B = ' + total2 + '. What is A?'
        },
        visual: null,
        answer: p * k,
        math: { op: 'ratio', mode: 'share', p: p, q: q, k: k, total: total2 },
        hint: { zh: '共有 ' + (p + q) + ' 份，先求一份。', en: 'There are ' + (p + q) + ' parts in total; find one part.' }
      };
    }
    var a = p * k;
    return {
      type: 'ratio',
      prompt: { zh: '甲、乙兩數的比是 ' + p + ' : ' + q + '，甲是 ' + a + '，乙是多少？', en: 'The ratio of A to B is ' + p + ' : ' + q + '. If A is ' + a + ', what is B?' },
      visual: null,
      answer: q * k,
      math: { op: 'ratio', mode: 'findB', p: p, q: q, k: k, a: a },
      hint: { zh: '甲分成 ' + p + ' 份，每份是 ' + k + '。', en: 'A is ' + p + ' parts; each part is ' + k + '.' }
    };
  }

  /* 長方形面積 / 周界 */
  function genArea(rng, o) {
    var l = randInt(rng, 2, 20);
    var w = randInt(rng, 2, 20);
    var askArea = rng() < 0.5;
    var answer = askArea ? l * w : 2 * (l + w);
    return {
      type: 'area',
      prompt: {
        zh: '長方形的長是 ' + l + ' cm，闊是 ' + w + ' cm，' + (askArea ? '面積' : '周界') + '是多少？',
        en: 'A rectangle is ' + l + ' cm by ' + w + ' cm. What is its ' + (askArea ? 'area' : 'perimeter') + '?'
      },
      visual: null,
      answer: answer,
      math: { op: 'area', l: l, w: w, mode: askArea ? 'area' : 'perimeter' },
      hint: { zh: askArea ? '面積 = 長 × 闊。' : '周界 = (長 + 闊) × 2。', en: askArea ? 'Area = length × width.' : 'Perimeter = (length + width) × 2.' }
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
      visual: { kind: 'numberline' },
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
        visual: { kind: 'righttri' },
        answer: c,
        math: { op: 'pythagoras', a: a, b: b, c: c, mode: 'hyp' },
        hint: { zh: '畢氏定理：斜邊² = ' + a + '² + ' + b + '²。', en: 'Pythagoras: hyp² = ' + a + '² + ' + b + '².' }
      };
    }
    return {
      type: 'pythagoras',
      prompt: { zh: '直角三角形的斜邊是 ' + c + '，一條直角邊是 ' + a + '，另一條是多少？', en: 'A right triangle has hypotenuse ' + c + ' and one leg ' + a + '. Find the other leg.' },
      visual: { kind: 'righttri' },
      answer: b,
      math: { op: 'pythagoras', a: a, b: b, c: c, mode: 'leg' },
      hint: { zh: '另一條直角邊² = 斜邊² − 已知邊²。', en: 'Other leg² = hyp² − known leg².' }
    };
  }

  /* 聯立方程 */
  function genSimul(rng, o) {
    var x = randInt(rng, 1, 9);
    var y = randInt(rng, 1, 9);
    var a, b, c, d, det;
    do {
      a = randInt(rng, 2, 5); b = randInt(rng, 2, 5);
      c = randInt(rng, 2, 5); d = randInt(rng, 2, 5);
      det = a * d - b * c;
    } while (det === 0);
    var s = a * x + b * y, t = c * x + d * y;
    return {
      type: 'simul',
      prompt: {
        zh: '已知 ' + a + 'x + ' + b + 'y = ' + s + '，' + c + 'x + ' + d + 'y = ' + t + '，求 x。',
        en: 'Given ' + a + 'x + ' + b + 'y = ' + s + ' and ' + c + 'x + ' + d + 'y = ' + t + ', find x.'
      },
      visual: null,
      answer: x,
      math: { op: 'simul', mode: 'gen', a: a, b: b, c: c, d: d, s: s, t: t },
      hint: { zh: '用消元法：把一條方程乘以適當倍數，消去 y。', en: 'Use elimination: multiply one equation so the y terms cancel.' }
    };
  }

  /* 指數定律：乘、除、冪的乘方 */
  function genIndices(rng, o) {
    var base = pick(rng, [2, 3, 4, 5]);
    var mode = pick(rng, ['power', 'prod', 'quot', 'pwrprod']);
    if (mode === 'power') {
      var e = randInt(rng, 2, 3);
      return {
        type: 'indices',
        prompt: { zh: base + '^' + e + ' = ?', en: base + '^' + e + ' = ?' },
        visual: null,
        answer: Math.pow(base, e),
        math: { op: 'indices', mode: 'power', base: base, e: e },
        hint: { zh: base + '^' + e + ' 表示 ' + Array(e).fill(base).join(' × ') + '。', en: base + '^' + e + ' means ' + Array(e).fill(base).join(' × ') + '.' }
      };
    }
    if (mode === 'prod') {
      var e1 = randInt(rng, 2, 3), e2 = randInt(rng, 2, 3);
      return {
        type: 'indices',
        prompt: { zh: base + '^' + e1 + ' × ' + base + '^' + e2 + ' = ?', en: base + '^' + e1 + ' × ' + base + '^' + e2 + ' = ?' },
        visual: null,
        answer: Math.pow(base, e1 + e2),
        math: { op: 'indices', mode: 'prod', base: base, e1: e1, e2: e2 },
        hint: { zh: '同底數相乘，指數相加：' + base + '^' + (e1 + e2) + '。', en: 'Same base: add exponents, ' + base + '^' + (e1 + e2) + '.' }
      };
    }
    if (mode === 'quot') {
      var q1 = randInt(rng, 3, 4), q2 = randInt(rng, 1, q1 - 1);
      return {
        type: 'indices',
        prompt: { zh: base + '^' + q1 + ' ÷ ' + base + '^' + q2 + ' = ?', en: base + '^' + q1 + ' ÷ ' + base + '^' + q2 + ' = ?' },
        visual: null,
        answer: Math.pow(base, q1 - q2),
        math: { op: 'indices', mode: 'quot', base: base, e1: q1, e2: q2 },
        hint: { zh: '同底數相除，指數相減：' + base + '^' + (q1 - q2) + '。', en: 'Same base: subtract exponents, ' + base + '^' + (q1 - q2) + '.' }
      };
    }
    var b1 = randInt(rng, 2, 4), b2 = randInt(rng, 2, 3), pe = randInt(rng, 2, 3);
    return {
      type: 'indices',
      prompt: { zh: '(' + b1 + ' × ' + b2 + ')^' + pe + ' = ?', en: '(' + b1 + ' × ' + b2 + ')^' + pe + ' = ?' },
      visual: null,
      answer: Math.pow(b1 * b2, pe),
      math: { op: 'indices', mode: 'pwrprod', b1: b1, b2: b2, e: pe },
      hint: { zh: '先算括號內的積，再取次方。', en: 'Work out the product in the bracket, then raise it to the power.' }
    };
  }

  /* 一元一次不等式（答案為「x > k」等字串） */
  function genInequality(rng, o) {
    var a = pick(rng, [-4, -3, -2, 2, 3, 4, 5]);
    var b = randInt(rng, 1, 10);
    var x0 = randInt(rng, 1, 10);
    var greater = rng() < 0.5;
    var inSign = greater ? '>' : '<';
    var c = a * x0 + b;
    var solveSign = a > 0 ? inSign : (greater ? '<' : '>');
    var answer = 'x ' + solveSign + ' ' + x0;
    var choices = [
      answer,
      'x ' + (solveSign === '<' ? '>' : '<') + ' ' + x0,
      'x ' + solveSign + ' ' + (x0 + 1),
      'x ' + solveSign + ' ' + (x0 - 1)
    ];
    return {
      type: 'inequality',
      prompt: { zh: '解不等式：' + (a < 0 ? '−' + (-a) : a) + 'x + ' + b + ' ' + inSign + ' ' + c, en: 'Solve the inequality: ' + (a < 0 ? '−' + (-a) : a) + 'x + ' + b + ' ' + inSign + ' ' + c },
      visual: null,
      answer: answer,
      math: { op: 'inequality', a: a, b: b, x0: x0, sign: inSign },
      choices: shuffle(rng, choices),
      hint: {
        zh: a > 0 ? '先把 ' + b + ' 移到右邊，再兩邊除以 ' + a + '。' : '先把 ' + b + ' 移到右邊，兩邊除以負數（' + a + '）時不等號要反向。',
        en: a > 0 ? 'Move ' + b + ' to the right, then divide by ' + a + '.' : 'Move ' + b + ' to the right; dividing by ' + a + ' flips the inequality sign.'
      }
    };
  }

  /* ================= 高中題型（中四至中六） ================= */

  var TRIG_TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]];

  /* 對數 */
  function genLog(rng, o) {
    if (rng() < 0.5) {
      var lb = pick(rng, [2, 3, 5]);
      var l1 = randInt(rng, 1, 3), l2 = randInt(rng, 1, 3);
      return {
        type: 'log',
        prompt: {
          zh: '$\\log_{' + lb + '} ' + Math.pow(lb, l1) + ' + \\log_{' + lb + '} ' + Math.pow(lb, l2) + ' = ?$',
          en: '$\\log_{' + lb + '} ' + Math.pow(lb, l1) + ' + \\log_{' + lb + '} ' + Math.pow(lb, l2) + ' = ?$'
        },
        visual: null,
        answer: l1 + l2,
        math: { op: 'log', mode: 'law', base: lb, m: Math.pow(lb, l1), n: Math.pow(lb, l2) },
        hint: { zh: '同底對數相加：log m + log n = log(mn)。', en: 'Same base: log m + log n = log(mn).' }
      };
    }
    var base = pick(rng, [2, 3, 5, 10]);
    var n = randInt(rng, 2, 4);
    var val = Math.pow(base, n);
    return {
      type: 'log',
      prompt: { zh: '$\\log_{' + base + '} ' + val + ' = ?$', en: '$\\log_{' + base + '} ' + val + ' = ?$' },
      visual: null,
      answer: n,
      math: { op: 'log', mode: 'value', base: base, n: n, val: val },
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
      visual: { kind: 'righttri' },
      answer: { n: num, d: den },
      math: { op: 'trig', a: a, b: b, c: c, which: which },
      hint: {
        zh: which + ' θ = ' + (which === 'sin' ? '對邊 ÷ 斜邊' : which === 'cos' ? '鄰邊 ÷ 斜邊' : '對邊 ÷ 鄰邊') + '。',
        en: which + ' θ = ' + (which === 'sin' ? 'opposite ÷ hypotenuse' : which === 'cos' ? 'adjacent ÷ hypotenuse' : 'opposite ÷ adjacent') + '.'
      }
    };
  }

  /* 等差數列（modes: term/sum/findN） */
  function genAp(rng, o) {
    var modes = (o.modes && o.modes.length) ? o.modes : ['term'];
    var mode = pick(rng, modes);
    var a = randInt(rng, 1, 10);
    var d = randInt(rng, 2, 6);
    var n = randInt(rng, 5, 12);
    if (mode === 'sum') {
      n = pick(rng, [6, 8, 10, 12]);
      var sum = n * (2 * a + (n - 1) * d) / 2;
      return {
        type: 'ap',
        prompt: {
          zh: '等差數列首項是 ' + a + '，公差是 ' + d + '。求前 ' + n + ' 項之和。',
          en: 'An arithmetic sequence has first term ' + a + ' and common difference ' + d + '. Find the sum of the first ' + n + ' terms.'
        },
        visual: null,
        answer: sum,
        math: { op: 'ap', mode: 'sum', a: a, d: d, n: n },
        hint: { zh: '和 = n/2 × (首項 + 末項)。', en: 'Sum = n/2 × (first + last).' }
      };
    }
    if (mode === 'findN') {
      var value = a + (n - 1) * d;
      return {
        type: 'ap',
        prompt: {
          zh: '等差數列首項是 ' + a + '，公差是 ' + d + '。第幾項是 ' + value + '？',
          en: 'An arithmetic sequence has first term ' + a + ' and common difference ' + d + '. Which term equals ' + value + '?'
        },
        visual: null,
        answer: n,
        math: { op: 'ap', mode: 'findN', a: a, d: d, value: value, n: n },
        hint: { zh: '由 a + (n − 1)d = value 解出 n。', en: 'Solve a + (n − 1)d = value for n.' }
      };
    }
    return {
      type: 'ap',
      prompt: { zh: '等差數列首項是 ' + a + '，公差是 ' + d + '。求第 ' + n + ' 項。', en: 'An arithmetic sequence has first term ' + a + ' and common difference ' + d + '. Find the ' + n + 'th term.' },
      visual: null,
      answer: a + (n - 1) * d,
      math: { op: 'ap', mode: 'term', a: a, d: d, n: n },
      hint: { zh: '第 n 項 = 首項 + (n − 1) × 公差。', en: 'nth term = first + (n − 1) × difference.' }
    };
  }

  /* 等比數列 */
  function genGp(rng, o) {
    if (o && o.mode === 'sum') {
      var sa = randInt(rng, 1, 5), sr = pick(rng, [2, 3]), sn = randInt(rng, 3, 5);
      return {
        type: 'gp',
        prompt: { zh: '等比數列首項是 ' + sa + '，公比是 ' + sr + '。求前 ' + sn + ' 項之和。', en: 'A geometric sequence has first term ' + sa + ' and common ratio ' + sr + '. Find the sum of the first ' + sn + ' terms.' },
        visual: null,
        answer: sa * (Math.pow(sr, sn) - 1) / (sr - 1),
        math: { op: 'gp', mode: 'sum', a: sa, r: sr, n: sn },
        hint: { zh: '前 n 項和 = a(rⁿ − 1)/(r − 1)。', en: 'Sum = a(rⁿ − 1)/(r − 1).' }
      };
    }
    if (o && o.mode === 'inf') {
      var ia = randInt(rng, 1, 4) * 2;
      return {
        type: 'gp',
        prompt: { zh: '等比數列首項是 ' + ia + '，公比是 1/2。求無限項之和。', en: 'A geometric sequence has first term ' + ia + ' and common ratio 1/2. Find the sum to infinity.' },
        visual: null,
        answer: ia * 2,
        math: { op: 'gp', mode: 'inf', a: ia, r: 0.5 },
        hint: { zh: 'S∞ = a ÷ (1 − r)，r = 1/2。', en: 'S∞ = a ÷ (1 − r) with r = 1/2.' }
      };
    }
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
  /* 由同一分母建立 4 個互不等值的選項（概率題用） */
  function fracChoiceSet(rng, ans, den, maxNum) {
    var pool = [];
    var top = maxNum != null ? Math.min(maxNum, den - 1) : den - 1;
    for (var n = 1; n <= top; n++) {
      var c = reduceFraction({ n: n, d: den });
      if (!valuesEqual(c, ans)) pool.push(c);
    }
    pool = shuffle(rng, pool).slice(0, 3);
    return shuffle(rng, [ans].concat(pool));
  }

  function genProb(rng, o) {
    if (o && o.mode === 'twoDice') {
      var s = randInt(rng, 2, 12);
      var cnt = 6 - Math.abs(s - 7);
      var ans = reduceFraction({ n: cnt, d: 36 });
      return {
        type: 'prob',
        prompt: { zh: '擲兩枚均勻骰子，點數之和是 ' + s + ' 的概率是多少？', en: 'Two fair dice are rolled. What is the probability that the sum is ' + s + '?' },
        visual: null,
        answer: ans,
        choices: fracChoiceSet(rng, ans, 36, 12),
        math: { op: 'prob', mode: 'twoDice', s: s, good: cnt, total: 36 },
        hint: { zh: '數一數和為 ' + s + ' 的組合數，再除以 36。', en: 'Count the pairs with sum ' + s + ', then divide by 36.' }
      };
    }
    if (o && o.mode === 'complement') {
      var ct = pick(rng, [6, 8, 10, 12]);
      var cg = randInt(rng, 1, ct - 1);
      var comp = reduceFraction({ n: ct - cg, d: ct });
      return {
        type: 'prob',
        prompt: { zh: '袋中有 ' + ct + ' 個球，其中 ' + cg + ' 個是紅球。隨機抽一個，抽到的不是紅球的概率是多少？', en: 'A bag has ' + ct + ' balls, ' + cg + ' of them red. What is the probability of NOT drawing a red ball?' },
        visual: null,
        answer: comp,
        choices: fracChoiceSet(rng, comp, ct),
        math: { op: 'prob', mode: 'complement', good: ct - cg, total: ct },
        hint: { zh: 'P(不是紅球) = 1 − P(紅球)。', en: 'P(not red) = 1 − P(red).' }
      };
    }
    var total = pick(rng, [6, 8, 10, 12]);
    var good = randInt(rng, 1, total - 1);
    var answer = reduceFraction({ n: good, d: total });
    /* 干擾項必須留在同一個樣本空間內：分母是總數，或「數錯總數」的 total−1 */
    var pool = [];
    [good + 1, good - 1, total - good, total - good + 1, good + 2].forEach(function (n) {
      if (n > 0 && n < total) pool.push(reduceFraction({ n: n, d: total }));
    });
    if (total - 1 > 1 && good < total - 1) pool.push(reduceFraction({ n: good, d: total - 1 }));
    var choices = [answer];
    var seen = {};
    seen[valueKey(answer)] = true;
    shuffle(rng, pool).forEach(function (c) {
      if (choices.length >= 4) return;
      var k = valueKey(c);
      if (!seen[k] && !valuesEqual(c, answer)) { seen[k] = true; choices.push(c); }
    });
    return {
      type: 'prob',
      prompt: { zh: '袋中有 ' + total + ' 個球，其中 ' + good + ' 個是紅球。隨機抽一個，抽到紅球的概率是多少？', en: 'A bag has ' + total + ' balls, ' + good + ' of them red. What is the probability of drawing a red ball?' },
      visual: null,
      answer: answer,
      math: { op: 'prob', good: good, total: total },
      choices: shuffle(rng, choices),
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
      hint: { zh: '兩根之和 = −(x 的係數)；兩根之積 = 常數項（本題首項係數為 1）。', en: 'Sum = −(coefficient of x); product = constant term (the leading coefficient is 1 here).' }
    };
  }

  /* 統計（modes: median/mean） */
  function genStats(rng, o) {
    var modes = (o.modes && o.modes.length) ? o.modes : ['median'];
    var mode = pick(rng, modes);
    if (mode === 'mean') {
      var mn = pick(rng, [4, 5, 6]);
      var numsMean = [];
      var sumMean = 0;
      for (var mi = 0; mi < mn; mi++) {
        var mv = randInt(rng, 1, 20);
        numsMean.push(mv);
        sumMean += mv;
      }
      while (sumMean % mn !== 0) { numsMean[mn - 1] += 1; sumMean += 1; }
      var mean = sumMean / mn;
      return {
        type: 'stats',
        prompt: {
          zh: '求 ' + numsMean.join('、') + ' 的平均數。',
          en: 'Find the mean of ' + numsMean.join(', ') + '.'
        },
        visual: { kind: 'barchart' },
        answer: mean,
        math: { op: 'stats', mode: 'mean', nums: numsMean, sorted: numsMean.slice().sort(function (x, y) { return x - y; }), mean: mean },
        hint: { zh: '全部加起來，再除以數據的個數。', en: 'Add all the values, then divide by how many there are.' }
      };
    }
    var n = pick(rng, [5, 6, 7]);
    var nums;
    if (n === 6) {
      var m1 = randInt(rng, 4, 14);
      var m2 = m1 + 2 * randInt(rng, 0, 2) + 1;
      nums = [m1 - 2, m1 - 1, m1, m2, m2 + 1, m2 + 2];
    } else {
      nums = [];
      for (var i = 0; i < n; i++) nums.push(randInt(rng, 1, 20));
      nums.sort(function (x, y) { return x - y; });
    }
    var sorted = nums.slice().sort(function (x, y) { return x - y; });
    var median = n % 2 === 1 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
    var display = shuffle(rng, nums.slice());
    return {
      type: 'stats',
      prompt: { zh: '求 ' + display.join('、') + ' 的中位數。', en: 'Find the median of ' + display.join(', ') + '.' },
      visual: { kind: 'barchart' },
      answer: median,
      math: { op: 'stats', mode: n % 2 === 1 ? 'odd' : 'even', nums: display, sorted: sorted },
      hint: n % 2 === 1
        ? { zh: '先把數字由小到大排列，再取中間那個。', en: 'Sort the numbers, then take the middle one.' }
        : { zh: '先把數字排序；共 6 個，取中間兩個的平均。', en: 'Sort the numbers; with 6 values, average the two middle ones.' }
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
        answer: piLabel(r * r, suf),
        math: { op: 'circle', r: r, mode: 'area' },
        choices: circleChoices(rng, r * r, suf),
        hint: { zh: '圓面積 = π r²。', en: 'Area = π r².' }
      };
    }
    return {
      type: 'circle',
      prompt: { zh: '圓的半徑是 ' + r + ' cm，周長是多少？（以 π 表示）', en: 'A circle has radius ' + r + ' cm. What is its circumference? (in terms of π)' },
      visual: { kind: 'circle', r: r },
      answer: piLabel(2 * r, suf),
      math: { op: 'circle', r: r, mode: 'circ' },
      choices: circleChoices(rng, 2 * r, suf),
      hint: { zh: '圓周長 = 2π r。', en: 'Circumference = 2π r.' }
    };
  }

  /* 以 π 表示的係數標籤：1π 一律寫成 π */
  function piLabel(k, suf) {
    return (k === 1 ? '' : k) + (suf || 'π');
  }

  function circleChoices(rng, k, suf) {
    var out = [piLabel(k, suf)];
    var seen = {}; seen[k] = true;
    var guard = 0;
    while (out.length < 4 && guard++ < 100) {
      var d = pick(rng, [-3, -2, -1, 1, 2, 3]);
      var cand = Math.max(1, k + d);
      if (!seen[cand]) { seen[cand] = true; out.push(piLabel(cand, suf)); }
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

  /* ================= 補缺題型（度量、貨幣、單位、幾何、高中代數） ================= */

  var ANGLE_FACTS = [
    { zh: '直角是多少度？', en: 'How many degrees is a right angle?', a: 90 },
    { zh: '平角是多少度？', en: 'How many degrees is a straight angle?', a: 180 },
    { zh: '一個周角是多少度？', en: 'How many degrees is a full turn?', a: 360 },
    { zh: '銳角小於多少度？', en: 'An acute angle is less than how many degrees?', a: 90 },
    { zh: '鈍角大於多少度？', en: 'An obtuse angle is greater than how many degrees?', a: 90 },
    { zh: '任何凸多邊形的外角和是多少度？', en: 'What is the sum of exterior angles of any convex polygon?', a: 360 },
    { zh: '三角形的內角和是多少度？', en: 'What is the sum of the interior angles of a triangle?', a: 180 },
    { zh: '四邊形的內角和是多少度？', en: 'What is the sum of the interior angles of a quadrilateral?', a: 360 },
    { zh: '正方形每個內角是多少度？', en: 'What is each interior angle of a square?', a: 90 },
    { zh: '等邊三角形每個內角是多少度？', en: 'What is each angle of an equilateral triangle?', a: 60 },
    { zh: '時針每小時轉過多少度？', en: 'How many degrees does the hour hand turn in one hour?', a: 30 },
    { zh: '分針每分鐘轉過多少度？', en: 'How many degrees does the minute hand turn in one minute?', a: 6 }
  ];

  var UNIT_FACTS = [
    { zh: '1 小時 = ? 分鐘', en: '1 hour = ? minutes', a: 60 },
    { zh: '1 日 = ? 小時', en: '1 day = ? hours', a: 24 },
    { zh: '1 星期 = ? 日', en: '1 week = ? days', a: 7 },
    { zh: '1 年 = ? 個月', en: '1 year = ? months', a: 12 },
    { zh: '1 千克 = ? 克', en: '1 kg = ? g', a: 1000 },
    { zh: '1 米 = ? 釐米', en: '1 m = ? cm', a: 100 },
    { zh: '1 打 = ? 個', en: '1 dozen = ? items', a: 12 },
    { zh: '1 分鐘 = ? 秒', en: '1 minute = ? seconds', a: 60 },
    { zh: '1 小時 = ? 秒', en: '1 hour = ? seconds', a: 3600 },
    { zh: '1 釐米 = ? 毫米', en: '1 cm = ? mm', a: 10 },
    { zh: '1 千米 = ? 米', en: '1 km = ? m', a: 1000 },
    { zh: '1 米 = ? 毫米', en: '1 m = ? mm', a: 1000 },
    { zh: '1 升 = ? 毫升', en: '1 L = ? mL', a: 1000 },
    { zh: '1 公斤 = ? 克', en: '1 kilogram = ? grams', a: 1000 }
  ];

  /* 周界 */
  function genPerimeter(rng, o) {
    var l = randInt(rng, 2, 15), w = randInt(rng, 2, 15);
    return {
      type: 'perimeter',
      prompt: { zh: '長方形的長 ' + l + ' cm，闊 ' + w + ' cm，周界是多少？', en: 'A rectangle is ' + l + ' cm by ' + w + ' cm. What is its perimeter?' },
      visual: { kind: 'rect', l: l, w: w },
      answer: 2 * (l + w),
      math: { op: 'perimeter', l: l, w: w },
      hint: { zh: '周界 = 2 × (長 + 闊)。', en: 'Perimeter = 2 × (length + width).' }
    };
  }

  /* 多邊形內角和 */
  function genPolygon(rng, o) {
    var n = randInt(rng, 3, 8);
    return {
      type: 'polygon',
      prompt: { zh: n + ' 邊形的內角和是多少？', en: 'What is the sum of the interior angles of a ' + n + '-sided polygon?' },
      visual: { kind: 'polygon', n: n },
      answer: (n - 2) * 180,
      math: { op: 'polygon', n: n },
      hint: { zh: '內角和 = (n − 2) × 180°。', en: 'Sum = (n − 2) × 180°.' }
    };
  }

  /* 角（事實） */
  function genAngle(rng, o) {
    var i = Math.floor(rng() * ANGLE_FACTS.length);
    var q = ANGLE_FACTS[i];
    return {
      type: 'angle',
      prompt: { zh: q.zh, en: q.en },
      visual: null,
      answer: q.a,
      math: { op: 'angle', a: q.a, k: i },
      hint: { zh: '記住：直角 = 90°。', en: 'Remember: a right angle is 90°.' }
    };
  }

  /* 貨幣找續 */
  function genMoney(rng, o) {
    var price = randInt(rng, 1, 50);
    var paid = price + randInt(rng, 1, 50);
    return {
      type: 'money',
      prompt: { zh: '買了一樣 $' + price + ' 的東西，付了 $' + paid + '，應找續多少？', en: 'An item costs $' + price + ' and you pay $' + paid + '. How much change?' },
      visual: null,
      answer: paid - price,
      math: { op: 'money', a: paid, b: price },
      hint: { zh: '找續 = 付的錢 − 價錢。', en: 'Change = paid − price.' }
    };
  }

  /* 單位換算（事實） */
  function genFact(rng, o) {
    var i = Math.floor(rng() * UNIT_FACTS.length);
    var q = UNIT_FACTS[i];
    var a = q.a;
    /* 換算的干擾項要像「數錯位」：×10、÷10、×2、±10/±100，而不是隨機數 */
    var pool = [a * 10, a + 10, a - 10];
    if (a >= 100) pool.push(a + 100, a - 100);
    if (a % 10 === 0) pool.push(a / 10);
    if (a % 2 === 0) pool.push(a * 2);
    var choices = [a];
    shuffle(rng, pool).forEach(function (v) {
      if (choices.length >= 4) return;
      if (v > 0 && v !== a && choices.indexOf(v) === -1) choices.push(v);
    });
    var guard = 0;
    while (choices.length < 4 && guard++ < 50) {
      var c = a + randInt(rng, 2, 9) * (rng() < 0.5 ? -1 : 1) * 10;
      if (c > 0 && choices.indexOf(c) === -1) choices.push(c);
    }
    return {
      type: 'fact',
      prompt: { zh: q.zh, en: q.en },
      visual: null,
      answer: a,
      choices: shuffle(rng, choices),
      math: { op: 'fact', a: a, k: i },
      hint: { zh: '想一想常用的換算。', en: 'Recall the common conversion.' }
    };
  }

  /* 二次方程求根（較大的根） */
  function genQuadsolve(rng, o) {
    if (o && o.mode === 'disc') {
      var dp = randInt(rng, 1, 9), dq = randInt(rng, 1, 9);
      while (dq === dp) dq = randInt(rng, 1, 9);
      var db = -(dp + dq), dc = dp * dq;
      var dbx = (db > 0 ? '+ ' + db : '- ' + (-db));
      var dcs = (dc > 0 ? '+ ' + dc : '- ' + (-dc));
      return {
        type: 'quadsolve',
        prompt: { zh: '求方程 $x^2 ' + dbx + 'x ' + dcs + ' = 0$ 的判別式。', en: 'Find the discriminant of $x^2 ' + dbx + 'x ' + dcs + ' = 0$.' },
        visual: null,
        answer: Math.pow(dp - dq, 2),
        math: { op: 'quadsolve', mode: 'disc', p: dp, q: dq, b: db, c: dc },
        hint: { zh: '判別式 = b² − 4ac；本題 a = 1。', en: 'Discriminant = b² − 4ac; here a = 1.' }
      };
    }
    if (o && o.mode === 'nature') {
      var kind = pick(rng, ['two', 'one', 'none']);
      var nb, nc, nans;
      if (kind === 'two') {
        var p1 = randInt(rng, 1, 9), q1 = randInt(rng, 1, 9);
        while (q1 === p1) q1 = randInt(rng, 1, 9);
        nb = -(p1 + q1); nc = p1 * q1; nans = 2;
      } else if (kind === 'one') {
        var r = randInt(rng, 1, 9);
        nb = -2 * r; nc = r * r; nans = 1;
      } else {
        nb = randInt(rng, -3, 3);
        nc = randInt(rng, Math.ceil(nb * nb / 4) + 1, 20);
        nans = 0;
      }
      var nbx = (nb > 0 ? '+ ' + nb : '- ' + (-nb));
      var ncs = (nc > 0 ? '+ ' + nc : '- ' + (-nc));
      return {
        type: 'quadsolve',
        prompt: {
          zh: '方程 $x^2 ' + nbx + 'x ' + ncs + ' = 0$ 有幾個實根？',
          en: 'How many real roots does $x^2 ' + nbx + 'x ' + ncs + ' = 0$ have?'
        },
        visual: null,
        answer: nans,
        math: { op: 'quadsolve', mode: 'nature', a: 1, b: nb, c: nc },
        hint: {
          zh: '判別式 = b² − 4ac：大於 0 有兩個實根，等於 0 有一個，小於 0 沒有實根。',
          en: 'Discriminant b² − 4ac: > 0 gives two real roots, = 0 one, < 0 none.'
        }
      };
    }
    var p = randInt(rng, 1, 9), q = randInt(rng, 1, 9);
    while (q === p) q = randInt(rng, 1, 9);
    var b = -(p + q), c = p * q;
    var bx = (b > 0 ? '+ ' + b : '- ' + (-b));
    var cs = (c > 0 ? '+ ' + c : '- ' + (-c));
    var eq = 'x^2 ' + bx + 'x ' + cs + ' = 0';
    return {
      type: 'quadsolve',
      prompt: { zh: '解方程 $' + eq + '$，較大的根是多少？', en: 'Solve $' + eq + '$. What is the larger root?' },
      visual: null,
      answer: Math.max(p, q),
      math: { op: 'quadsolve', p: p, q: q },
      hint: { zh: '因式分解：(x − ' + p + ')(x − ' + q + ') = 0，根是 ' + p + ' 和 ' + q + '。', en: 'Factorise: (x − ' + p + ')(x − ' + q + ') = 0; roots ' + p + ' and ' + q + '.' }
    };
  }

  /* 直線斜率 */
  function genLine(rng, o) {
    if (o && o.mode === 'eq') {
      var em = randInt(rng, 1, 4), ec = randInt(rng, 0, 9), ex = randInt(rng, 1, 4);
      var ey = em * ex + ec;
      return {
        type: 'line',
        prompt: { zh: '直線 $y = ' + em + 'x + c$ 經過點 (' + ex + ', ' + ey + ')，求 c。', en: 'The line $y = ' + em + 'x + c$ passes through (' + ex + ', ' + ey + '). Find c.' },
        visual: null,
        answer: ec,
        math: { op: 'line', mode: 'eq', m: em, c: ec, x: ex, y: ey },
        hint: { zh: '把點的坐標代入方程，再解 c。', en: 'Substitute the point into the equation, then solve for c.' }
      };
    }
    var x1 = randInt(rng, 0, 5), y1 = randInt(rng, 0, 5);
    var dx = randInt(rng, 1, 4), m = randInt(rng, 1, 4);
    var x2 = x1 + dx, y2 = y1 + m * dx;
    return {
      type: 'line',
      prompt: { zh: '直線經過 A(' + x1 + ', ' + y1 + ') 和 B(' + x2 + ', ' + y2 + ')，求斜率。', en: 'A line passes through A(' + x1 + ', ' + y1 + ') and B(' + x2 + ', ' + y2 + '). Find its slope.' },
      visual: { kind: 'plane', a: [x1, y1], b: [x2, y2] },
      answer: m,
      math: { op: 'line', a: [x1, y1], b: [x2, y2] },
      hint: { zh: '斜率 = (y2 − y1) ÷ (x2 − x1)。', en: 'Slope = (y2 − y1) ÷ (x2 − x1).' }
    };
  }

  /* 正變 */
  function genVariation(rng, o) {
    var k = randInt(rng, 2, 5);
    var a = randInt(rng, 1, 5);
    var b = k * a;
    var c = randInt(rng, 2, 6);
    return {
      type: 'variation',
      prompt: { zh: '已知 $y$ 隨 $x$ 正變。當 $x = ' + a + '$ 時 $y = ' + b + '$，求 $x = ' + c + '$ 時的 $y$。', en: '$y$ varies directly as $x$. When $x = ' + a + '$, $y = ' + b + '$. Find $y$ when $x = ' + c + '$.' },
      visual: null,
      answer: k * c,
      math: { op: 'variation', k: k, a: a, c: c },
      hint: { zh: 'y = kx，先求 k。', en: 'y = kx; find k first.' }
    };
  }

  /* 單雙數（奇偶） */
  function genOddEven(rng, o) {
    var kind = Math.floor(rng() * 3);
    if (kind === 0) {
      var n = randInt(rng, 1, 20) * 2;
      return {
        type: 'oddeven',
        prompt: { zh: n + ' 之後的下一個偶數是多少？', en: 'What is the next even number after ' + n + '?' },
        visual: { kind: 'oddeven' },
        answer: n + 2,
        math: { op: 'oddeven', mode: 'nexteven', n: n },
        hint: { zh: '偶數是 2、4、6、8…，逐個加 2。', en: 'Even numbers are 2, 4, 6, 8…; keep adding 2.' }
      };
    }
    if (kind === 1) {
      var m = randInt(rng, 1, 20) * 2 - 1;
      return {
        type: 'oddeven',
        prompt: { zh: m + ' 之後的下一個奇數是多少？', en: 'What is the next odd number after ' + m + '?' },
        visual: { kind: 'oddeven' },
        answer: m + 2,
        math: { op: 'oddeven', mode: 'nextodd', n: m },
        hint: { zh: '奇數是 1、3、5、7…，逐個加 2。', en: 'Odd numbers are 1, 3, 5, 7…; keep adding 2.' }
      };
    }
    var n2 = randInt(rng, 2, 20);
    var askEven = rng() < 0.5;
    return {
      type: 'oddeven',
      prompt: {
        zh: '1 到 ' + n2 + ' 有多少個' + (askEven ? '偶數' : '奇數') + '？',
        en: 'How many ' + (askEven ? 'even' : 'odd') + ' numbers are there from 1 to ' + n2 + '?'
      },
      visual: { kind: 'oddeven' },
      answer: askEven ? Math.floor(n2 / 2) : Math.ceil(n2 / 2),
      math: { op: 'oddeven', mode: askEven ? 'counteven' : 'countodd', n: n2 },
      hint: { zh: '逐個數：' + (askEven ? '2、4、6…' : '1、3、5…') + '。', en: 'Count: ' + (askEven ? '2, 4, 6…' : '1, 3, 5…') + '.' }
    };
  }

  /* ================= 補缺題型（圖形性質、代數、數據、高中） ================= */

  var SHAPE_FACTS = [
    { zh: '正方形有幾條邊？', en: 'How many sides does a square have?', a: 4, kind: 'square' },
    { zh: '三角形有幾條邊？', en: 'How many sides does a triangle have?', a: 3, kind: 'triangle' },
    { zh: '長方形有幾條邊？', en: 'How many sides does a rectangle have?', a: 4, kind: 'rect' },
    { zh: '正方體有幾個面？', en: 'How many faces does a cube have?', a: 6, kind: 'cube' },
    { zh: '長方體有幾個面？', en: 'How many faces does a cuboid have?', a: 6, kind: 'cuboid' },
    { zh: '正方體有幾個頂點？', en: 'How many vertices does a cube have?', a: 8, kind: 'cube' },
    { zh: '圓柱體有幾個圓形面？', en: 'How many circular faces does a cylinder have?', a: 2, kind: 'cylinder' },
    { zh: '五邊形有幾條邊？', en: 'How many sides does a pentagon have?', a: 5, kind: 'pentagon' },
    { zh: '六邊形有幾條邊？', en: 'How many sides does a hexagon have?', a: 6, kind: 'hexagon' },
    { zh: '正方體有幾條稜？', en: 'How many edges does a cube have?', a: 12, kind: 'cube' },
    { zh: '長方體有幾個頂點？', en: 'How many vertices does a cuboid have?', a: 8, kind: 'cuboid' },
    { zh: '正方形有幾個頂點？', en: 'How many vertices does a square have?', a: 4, kind: 'square' }
  ];

  var SYM_FACTS = [
    { zh: '正方形有幾條對稱軸？', en: 'How many lines of symmetry does a square have?', a: 4 },
    { zh: '長方形有幾條對稱軸？', en: 'How many lines of symmetry does a rectangle have?', a: 2 },
    { zh: '等邊三角形有幾條對稱軸？', en: 'How many lines of symmetry does an equilateral triangle have?', a: 3 },
    { zh: '等腰三角形有幾條對稱軸？', en: 'How many lines of symmetry does an isosceles triangle have?', a: 1 },
    { zh: '菱形有幾條對稱軸？', en: 'How many lines of symmetry does a rhombus have?', a: 2 },
    { zh: '平行四邊形有幾條對稱軸？', en: 'How many lines of symmetry does a parallelogram have?', a: 0 },
    { zh: '箏形有幾條對稱軸？', en: 'How many lines of symmetry does a kite have?', a: 1 },
    { zh: '正五邊形有幾條對稱軸？', en: 'How many lines of symmetry does a regular pentagon have?', a: 5 },
    { zh: '正六邊形有幾條對稱軸？', en: 'How many lines of symmetry does a regular hexagon have?', a: 6 },
    { zh: '正八邊形有幾條對稱軸？', en: 'How many lines of symmetry does a regular octagon have?', a: 8 },
    { zh: '等腰梯形有幾條對稱軸？', en: 'How many lines of symmetry does an isosceles trapezium have?', a: 1 }
  ];

  var ARCLEN_PAIRS = [[3, 60], [3, 120], [3, 180], [6, 30], [6, 60], [6, 90], [6, 120], [6, 180], [9, 60], [9, 120], [9, 180], [12, 30], [12, 60], [12, 90], [12, 120], [12, 180]];

  function factInt(rng, facts) {
    var i = Math.floor(rng() * facts.length);
    return facts[i];
  }

  /* 圖形性質 */
  function genShape(rng, o) {
    var i = Math.floor(rng() * SHAPE_FACTS.length);
    var q = SHAPE_FACTS[i];
    return {
      type: 'shape',
      prompt: { zh: q.zh, en: q.en },
      visual: { kind: 'shape', shape: q.kind },
      answer: q.a,
      math: { op: 'shape', a: q.a, k: i },
      hint: { zh: '想一想圖形有幾條邊／幾個面。', en: 'Count the sides / faces.' }
    };
  }

  /* 對稱軸 */
  function genSymmetry(rng, o) {
    var i = Math.floor(rng() * SYM_FACTS.length);
    var q = SYM_FACTS[i];
    return {
      type: 'symmetry',
      prompt: { zh: q.zh, en: q.en },
      visual: { kind: 'symmetry' },
      answer: q.a,
      math: { op: 'symmetry', a: q.a, k: i },
      hint: { zh: '想像沿著直線對摺，兩邊完全重疊。', en: 'Fold along a line so both halves match.' }
    };
  }

  /* 合併同類項 */
  function genLiketerms(rng, o) {
    var sub = rng() < 0.5;
    var a = randInt(rng, 2, 9), b = randInt(rng, 1, 9);
    if (sub && a <= b) { var t = a; a = b; b = t; }
    var ans = sub ? a - b : a + b;
    return {
      type: 'liketerms',
      prompt: { zh: '合併同類項：' + a + 'x ' + (sub ? '− ' : '+ ') + b + 'x，x 的係數是多少？', en: 'Simplify: ' + a + 'x ' + (sub ? '− ' : '+ ') + b + 'x. What is the coefficient of x?' },
      visual: null,
      answer: ans,
      math: { op: 'liketerms', a: a, b: b, mode: sub ? 'sub' : 'add' },
      hint: { zh: '同類項相加減：係數相加減。', en: 'Add or subtract the coefficients.' }
    };
  }

  /* 多項式次數 / 係數 */
  function genPolycoeff(rng, o) {
    var deg = pick(rng, [2, 3]);
    var coeff = randInt(rng, 2, 9);
    var askDeg = rng() < 0.5;
    var term = coeff + 'x^' + deg;
    if (askDeg) {
      return {
        type: 'polycoeff',
        prompt: { zh: '多項式 ' + term + ' 的次數是多少？', en: 'What is the degree of the polynomial ' + term + '?' },
        visual: null,
        answer: deg,
        math: { op: 'polycoeff', mode: 'deg', c: coeff, d: deg },
        hint: { zh: '次數 = 最高次項的指數。', en: 'Degree = the highest exponent.' }
      };
    }
    return {
      type: 'polycoeff',
      prompt: { zh: '多項式 ' + term + ' + 3 中，$x^' + deg + '$ 的係數是多少？', en: 'In the polynomial ' + term + ' + 3, what is the coefficient of $x^' + deg + '$?' },
      visual: null,
      answer: coeff,
      math: { op: 'polycoeff', mode: 'coeff', c: coeff, d: deg },
      hint: { zh: '係數 = 該項前面的數。', en: 'Coefficient = the number in front of the term.' }
    };
  }

  /* 扇形弧長（以 π 表示） */
  var SECTOR_PAIRS = [
    [3, 40], [3, 80], [3, 120], [3, 160], [3, 200], [3, 240], [3, 280], [3, 320],
    [6, 10], [6, 20], [6, 40], [6, 60], [6, 90], [6, 120], [6, 180],
    [9, 40], [9, 80], [9, 120], [9, 160],
    [12, 10], [12, 20], [12, 30], [12, 40], [12, 90]
  ];

  function genDispersion(rng, o) {
    var nums = [];
    while (nums.length < 7) {
      var v = randInt(rng, 1, 30);
      if (nums.indexOf(v) === -1) nums.push(v);
    }
    var sorted = nums.slice().sort(function (x, y) { return x - y; });
    var q1 = sorted[1], q3 = sorted[5];
    return {
      type: 'dispersion',
      prompt: { zh: '求 ' + nums.join('、') + ' 的四分位距（IQR）。', en: 'Find the interquartile range (IQR) of ' + nums.join(', ') + '.' },
      visual: null,
      answer: q3 - q1,
      math: { op: 'dispersion', nums: nums, sorted: sorted, q1: q1, q3: q3 },
      hint: { zh: '先排序；Q1 是下半部的中位數，Q3 是上半部的中位數，IQR = Q3 − Q1。', en: 'Sort first; Q1 is the lower-half median, Q3 the upper-half median, IQR = Q3 − Q1.' }
    };
  }

  function genCircleprop(rng, o) {
    var mode = pick(rng, ['semicircle', 'cyclic', 'tangent', 'sameseg']);
    var x = randInt(rng, 20, 70);
    var prompt, answer, hint;
    if (mode === 'semicircle') {
      answer = 90;
      prompt = { zh: '半圓上的圓周角是多少度？', en: 'What is the angle in a semicircle?' };
      hint = { zh: '半圓上的圓周角 = 90°。', en: 'The angle in a semicircle is 90°.' };
    } else if (mode === 'cyclic') {
      answer = 180 - x;
      prompt = { zh: '圓內接四邊形的一個內角是 ' + x + '°，它的對角是多少度？', en: 'One angle of a cyclic quadrilateral is ' + x + '°. What is its opposite angle?' };
      hint = { zh: '圓內接四邊形的對角互補（和 = 180°）。', en: 'Opposite angles of a cyclic quadrilateral sum to 180°.' };
    } else if (mode === 'tangent') {
      answer = 90;
      prompt = { zh: '圓的半徑與切線的夾角是多少度？', en: 'What is the angle between a radius and the tangent at its endpoint?' };
      hint = { zh: '切線垂直於過切點的半徑。', en: 'A tangent is perpendicular to the radius at the point of contact.' };
    } else {
      answer = x;
      prompt = { zh: '同一弓形上的兩個圓周角，其中一個是 ' + x + '°，另一個是多少度？', en: 'Two angles in the same segment: one is ' + x + '°. What is the other?' };
      hint = { zh: '同弓形內的圓周角相等。', en: 'Angles in the same segment are equal.' };
    }
    var mm = { op: 'circleprop', mode: mode };
    if (mode === 'cyclic' || mode === 'sameseg') mm.a = x;
    return {
      type: 'circleprop',
      prompt: prompt,
      visual: { kind: 'circleang' },
      answer: answer,
      math: mm,
      hint: hint
    };
  }

  /* 恆等式與展開 */
  function genIdentity(rng, o) {
    var a = randInt(rng, 1, 6), b = randInt(rng, 1, 6);
    var mode = pick(rng, ['mid', 'const', 'square', 'diff']);
    if (mode === 'diff' && a < b) { var tmp = a; a = b; b = tmp; }
    var prompt, answer, hint;
    if (mode === 'mid') {
      prompt = { zh: '展開 $(x + ' + a + ')(x + ' + b + ')$，$x$ 的係數是多少？', en: 'Expand $(x + ' + a + ')(x + ' + b + ')$. What is the coefficient of $x$?' };
      answer = a + b;
      hint = { zh: '(x + a)(x + b) = x² + (a + b)x + ab。', en: '(x + a)(x + b) = x² + (a + b)x + ab.' };
    } else if (mode === 'const') {
      prompt = { zh: '展開 $(x + ' + a + ')(x + ' + b + ')$，常數項是多少？', en: 'Expand $(x + ' + a + ')(x + ' + b + ')$. What is the constant term?' };
      answer = a * b;
      hint = { zh: '常數項 = a × b。', en: 'Constant term = a × b.' };
    } else if (mode === 'square') {
      prompt = { zh: '展開 $(x + ' + a + ')^2$，$x$ 的係數是多少？', en: 'Expand $(x + ' + a + ')^2$. What is the coefficient of $x$?' };
      answer = 2 * a;
      hint = { zh: '(x + a)² = x² + 2ax + a²。', en: '(x + a)² = x² + 2ax + a².' };
    } else {
      prompt = { zh: '計算 $(' + (a + b) + ')(' + (a - b) + ')$。', en: 'Evaluate $(' + (a + b) + ')(' + (a - b) + ')$.' };
      answer = a * a - b * b;
      hint = { zh: '平方差：(a + b)(a − b) = a² − b²。', en: 'Difference of squares: (a + b)(a − b) = a² − b².' };
    }
    return {
      type: 'identity',
      prompt: prompt,
      visual: null,
      answer: answer,
      math: { op: 'identity', mode: mode, a: a, b: b },
      hint: hint
    };
  }

  /* 柱體與錐體體積（底面積 × 高） */
  function genPrism(rng, o) {
    var mode = pick(rng, ['prism', 'pyramid']);
    var area = randInt(rng, 2, 20);
    var h = mode === 'pyramid' ? randInt(rng, 1, 4) * 3 : randInt(rng, 2, 10);
    var answer = mode === 'pyramid' ? area * h / 3 : area * h;
    return {
      type: 'prism',
      prompt: {
        zh: (mode === 'pyramid' ? '錐體' : '柱體') + '的底面積是 ' + area + ' cm²，高是 ' + h + ' cm，體積是多少？',
        en: 'A ' + (mode === 'pyramid' ? 'pyramid' : 'prism') + ' has base area ' + area + ' cm² and height ' + h + ' cm. What is its volume?'
      },
      visual: null,
      answer: answer,
      math: { op: 'prism', mode: mode, area: area, h: h },
      hint: {
        zh: mode === 'pyramid' ? '錐體體積 = 底面積 × 高 ÷ 3。' : '柱體體積 = 底面積 × 高。',
        en: mode === 'pyramid' ? 'Pyramid volume = base area × height ÷ 3.' : 'Prism volume = base area × height.'
      }
    };
  }

  /* 2×2 矩陣：行列式與乘積元素 */
  function genMatrix(rng, o) {
    var mode = pick(rng, ['det', 'entry']);
    if (mode === 'det') {
      var a = randInt(rng, 2, 6), d = randInt(rng, 2, 6);
      var b = randInt(rng, 0, 3), c = randInt(rng, 0, 3);
      if (a * d - b * c <= 0) { var t = b; b = c; c = t; }
      if (a * d - b * c <= 0) { b = 0; c = 0; }
      return {
        type: 'matrix',
        prompt: {
          zh: '求矩陣 $\\begin{pmatrix}' + a + ' & ' + b + ' \\\\ ' + c + ' & ' + d + '\\end{pmatrix}$ 的行列式。',
          en: 'Find the determinant of $\\begin{pmatrix}' + a + ' & ' + b + ' \\\\ ' + c + ' & ' + d + '\\end{pmatrix}$.'
        },
        visual: null,
        answer: a * d - b * c,
        math: { op: 'matrix', mode: 'det', a: a, b: b, c: c, d: d },
        hint: { zh: '二階行列式 = ad − bc。', en: '2×2 determinant = ad − bc.' }
      };
    }
    var A = [[randInt(rng, 0, 3), randInt(rng, 0, 3)], [randInt(rng, 0, 3), randInt(rng, 0, 3)]];
    var B = [[randInt(rng, 0, 3), randInt(rng, 0, 3)], [randInt(rng, 0, 3), randInt(rng, 0, 3)]];
    var entry = A[0][0] * B[0][0] + A[0][1] * B[1][0];
    return {
      type: 'matrix',
      prompt: {
        zh: '設 $A = \\begin{pmatrix}' + A[0][0] + ' & ' + A[0][1] + ' \\\\ ' + A[1][0] + ' & ' + A[1][1] + '\\end{pmatrix}$，$B = \\begin{pmatrix}' + B[0][0] + ' & ' + B[0][1] + ' \\\\ ' + B[1][0] + ' & ' + B[1][1] + '\\end{pmatrix}$，求 $AB$ 的左上角元素。',
        en: 'Let $A = \\begin{pmatrix}' + A[0][0] + ' & ' + A[0][1] + ' \\\\ ' + A[1][0] + ' & ' + A[1][1] + '\\end{pmatrix}$ and $B = \\begin{pmatrix}' + B[0][0] + ' & ' + B[0][1] + ' \\\\ ' + B[1][0] + ' & ' + B[1][1] + '\\end{pmatrix}$. Find the top-left entry of $AB$.'
      },
      visual: null,
      answer: entry,
      math: { op: 'matrix', mode: 'entry', A: A, B: B },
      hint: { zh: '(AB)₁₁ = A₁₁B₁₁ + A₁₂B₂₁。', en: '(AB)₁₁ = A₁₁B₁₁ + A₁₂B₂₁.' }
    };
  }

  /* 微積分入門：導數值 / 定積分 */
  function genCalculus(rng, o) {
    var mode = pick(rng, ['dval', 'idef']);
    if (mode === 'dval') {
      var a = randInt(rng, 1, 6), n = pick(rng, [2, 3]), x = randInt(rng, 1, 4);
      return {
        type: 'calculus',
        prompt: {
          zh: '設 $f(x) = ' + a + 'x^' + n + '$，求 $f\'(' + x + ')$。',
          en: 'Let $f(x) = ' + a + 'x^' + n + '$. Find $f\'(' + x + ')$.'
        },
        visual: null,
        answer: a * n * Math.pow(x, n - 1),
        math: { op: 'calculus', mode: 'dval', a: a, n: n, x: x },
        hint: { zh: 'f′(x) = a·n·x^(n−1)，再代入 x。', en: 'f′(x) = a·n·x^(n−1), then substitute x.' }
      };
    }
    var ca = pick(rng, [2, 4, 6]);
    var b = randInt(rng, 1, 5);
    return {
      type: 'calculus',
      prompt: {
        zh: '計算 $\\int_0^{' + b + '} ' + ca + 'x \\, dx$。',
        en: 'Evaluate $\\int_0^{' + b + '} ' + ca + 'x \\, dx$.'
      },
      visual: null,
      answer: ca * b * b / 2,
      math: { op: 'calculus', mode: 'idef', a: ca, b: b, n: 1 },
      hint: { zh: '∫ ax dx = a x²/2，代入上下限。', en: '∫ ax dx = a x²/2; substitute the limits.' }
    };
  }

  /* 期望值與二項概率 */
  function genExpectation(rng, o) {
    var mode = pick(rng, ['die', 'spinner', 'binomial']);
    function half(k) { return k % 2 === 0 ? k / 2 : { n: k, d: 2 }; }
    if (mode === 'die') {
      return {
        type: 'expectation',
        prompt: { zh: '擲一枚均勻骰子，點數的期望值是多少？', en: 'A fair die is rolled. What is the expected value?' },
        visual: null,
        answer: { n: 7, d: 2 },
        choices: shuffle(rng, [{ n: 7, d: 2 }, { n: 5, d: 2 }, 3, 4]),
        math: { op: 'expectation', mode: 'die' },
        hint: { zh: 'E(X) = (1 + 2 + … + 6) ÷ 6 = 7/2。', en: 'E(X) = (1 + 2 + … + 6) ÷ 6 = 7/2.' }
      };
    }
    if (mode === 'spinner') {
      var n = pick(rng, [4, 5, 6]);
      return {
        type: 'expectation',
        prompt: {
          zh: '轉盤有 ' + n + ' 格，分別標示 1 至 ' + n + '，每格機會相等。轉一次，期望值是多少？',
          en: 'A spinner has ' + n + ' equally likely sectors numbered 1 to ' + n + '. What is the expected value?'
        },
        visual: null,
        answer: half(n + 1),
        choices: shuffle(rng, [half(n + 1), half(n), half(n + 3), n]),
        math: { op: 'expectation', mode: 'spinner', n: n },
        hint: { zh: 'E(X) = (1 + … + n) ÷ n = (n + 1)/2。', en: 'E(X) = (1 + … + n) ÷ n = (n + 1)/2.' }
      };
    }
    var coins = pick(rng, [3, 4, 5]);
    var k = randInt(rng, 1, coins - 1);
    function choose(a, b) {
      function f(x) { var r = 1; for (var i = 2; i <= x; i++) r *= i; return r; }
      return f(a) / (f(b) * f(a - b));
    }
    var expectChoices = [choose(coins, k)];
    [choose(coins, k - 1), choose(coins, k + 1), 1].forEach(function (v) {
      if (v > 0 && expectChoices.indexOf(v) === -1) expectChoices.push(v);
    });
    var denom = Math.pow(2, coins);
    var expectSeen = {};
    expectSeen[valueKey(reduceFraction({ n: choose(coins, k), d: denom }))] = true;
    var expectPicked = [reduceFraction({ n: choose(coins, k), d: denom })];
    shuffle(rng, expectChoices).forEach(function (num) {
      var c = reduceFraction({ n: num, d: denom });
      var kk = valueKey(c);
      if (expectPicked.length < 4 && num !== choose(coins, k) && !expectSeen[kk]) {
        expectSeen[kk] = true;
        expectPicked.push(c);
      }
    });
    var expectGuard = 0;
    while (expectPicked.length < 4 && expectGuard++ < 60) {
      var rnum = randInt(rng, 1, denom - 1);
      var rc = reduceFraction({ n: rnum, d: denom });
      var rk = valueKey(rc);
      if (!expectSeen[rk]) { expectSeen[rk] = true; expectPicked.push(rc); }
    }
    return {
      type: 'expectation',
      prompt: {
        zh: '擲 ' + coins + ' 枚均勻硬幣，剛好有 ' + k + ' 個正面的概率是多少？',
        en: coins + ' fair coins are tossed. What is the probability of exactly ' + k + ' heads?'
      },
      visual: null,
      answer: { n: choose(coins, k), d: Math.pow(2, coins) },
      choices: shuffle(rng, expectPicked),
      math: { op: 'expectation', mode: 'binomial', n: coins, k: k },
      hint: { zh: 'P = C(n, k) ÷ 2ⁿ。', en: 'P = C(n, k) ÷ 2ⁿ.' }
    };
  }

  function genArclen(rng, o) {
    if (o && o.mode === 'sector') {
      var sp = pick(rng, SECTOR_PAIRS);
      var sr = sp[0], sa = sp[1];
      var sc = sr * sr * sa / 360;
      return {
        type: 'arclen',
        prompt: { zh: '半徑 ' + sr + ' cm、圓心角 ' + sa + '° 的扇形，面積是多少？（以 π 表示）', en: 'A sector has radius ' + sr + ' cm and central angle ' + sa + '°. What is its area? (in terms of π)' },
        visual: { kind: 'circle', r: sr },
        answer: piLabel(sc),
        math: { op: 'arclen', mode: 'sector', r: sr, angle: sa, coef: sc },
        choices: circleChoices(rng, sc, 'π'),
        hint: { zh: '扇形面積 = π r² × (圓心角 ÷ 360°)。', en: 'Sector area = π r² × (angle ÷ 360°).' }
      };
    }
    var pr = pick(rng, ARCLEN_PAIRS);
    var r = pr[0], angle = pr[1];
    var coef = r * angle / 180;
    return {
      type: 'arclen',
      prompt: { zh: '半徑 ' + r + ' cm、圓心角 ' + angle + '° 的扇形，弧長是多少？（以 π 表示）', en: 'A sector has radius ' + r + ' cm and central angle ' + angle + '°. What is its arc length? (in terms of π)' },
      visual: { kind: 'circle', r: r },
      answer: piLabel(coef),
      math: { op: 'arclen', r: r, angle: angle, coef: coef },
      choices: circleChoices(rng, coef, 'π'),
      hint: { zh: '弧長 = 2πr × (圓心角 ÷ 360°)。', en: 'Arc length = 2πr × (angle ÷ 360°).' }
    };
  }

  /* 眾數 */
  function genMode(rng, o) {
    var n = pick(rng, [5, 6, 7]);
    var mode = randInt(rng, 1, 9);
    var nums = [mode, mode, mode];
    while (nums.length < n) {
      var x = randInt(rng, 1, 9);
      if (x !== mode) nums.push(x);
    }
    nums = shuffle(rng, nums);
    return {
      type: 'mode',
      prompt: { zh: '求 ' + nums.join('、') + ' 的眾數。', en: 'Find the mode of ' + nums.join(', ') + '.' },
      visual: { kind: 'barchart' },
      answer: mode,
      math: { op: 'mode', nums: nums, m: mode },
      hint: { zh: '眾數 = 出現次數最多的數。', en: 'Mode = the most frequent value.' }
    };
  }

  /* 等差數列求和 */
  function genAsum(rng, o) {
    var n = randInt(rng, 5, 12);
    var a = randInt(rng, 1, 10);
    var d = randInt(rng, 1, 5);
    return {
      type: 'asum',
      prompt: { zh: '等差數列首項 ' + a + '、公差 ' + d + '，求前 ' + n + ' 項的和。', en: 'An arithmetic sequence has first term ' + a + ' and common difference ' + d + '. Find the sum of the first ' + n + ' terms.' },
      visual: null,
      answer: n * (2 * a + (n - 1) * d) / 2,
      math: { op: 'asum', a: a, d: d, n: n },
      hint: { zh: '和 = n/2 × (首項 + 末項)。', en: 'Sum = n/2 × (first + last).' }
    };
  }

  /* 反變 */
  function genInvvar(rng, o) {
    var k = 12 * randInt(rng, 1, 4); // 12 的倍數，能被 2、3、4、6 整除
    var a = pick(rng, [2, 3, 4, 6]);
    var c = pick(rng, [2, 3, 4, 6]);
    while (c === a) c = pick(rng, [2, 3, 4, 6]);
    return {
      type: 'invvar',
      prompt: { zh: '已知 $y$ 隨 $x$ 反變。當 $x = ' + a + '$ 時 $y = ' + (k / a) + '$，求 $x = ' + c + '$ 時的 $y$。', en: '$y$ varies inversely as $x$. When $x = ' + a + '$, $y = ' + (k / a) + '$. Find $y$ when $x = ' + c + '$.' },
      visual: null,
      answer: k / c,
      math: { op: 'invvar', k: k, a: a, c: c },
      hint: { zh: 'y = k/x，先求 k = xy。', en: 'y = k/x; find k = xy first.' }
    };
  }

  /* 排列與組合 */
  function genComb(rng, o) {
    var n = pick(rng, [4, 5, 6, 7]);
    var r = pick(rng, [2, 3]);
    if (r >= n) r = 2;
    var perm = rng() < 0.5;
    function fact(x) { var f = 1; for (var i = 2; i <= x; i++) f *= i; return f; }
    var ans = perm ? fact(n) / fact(n - r) : fact(n) / (fact(r) * fact(n - r));
    return {
      type: 'comb',
      prompt: { zh: (perm ? 'P' : 'C') + '(' + n + ', ' + r + ') = ?', en: (perm ? 'P' : 'C') + '(' + n + ', ' + r + ') = ?' },
      visual: null,
      answer: ans,
      math: { op: 'comb', n: n, r: r, mode: perm ? 'P' : 'C' },
      hint: { zh: (perm ? '排列：n! ÷ (n−r)!' : '組合：n! ÷ (r!(n−r)!)'), en: (perm ? 'Permutation: n! ÷ (n−r)!' : 'Combination: n! ÷ (r!(n−r)!)') }
    };
  }

  /* 分佈域 */
  function genRange(rng, o) {
    var n = randInt(rng, 4, 6);
    var nums = [];
    for (var i = 0; i < n; i++) nums.push(randInt(rng, 1, 30));
    var mn = Math.min.apply(null, nums), mx = Math.max.apply(null, nums);
    return {
      type: 'range',
      prompt: { zh: '求 ' + nums.join('、') + ' 的分佈域。', en: 'Find the range of ' + nums.join(', ') + '.' },
      visual: { kind: 'barchart' },
      answer: mx - mn,
      math: { op: 'range', nums: nums },
      hint: { zh: '分佈域 = 最大 − 最小。', en: 'Range = max − min.' }
    };
  }

  /* 圓方程的半徑 */
  function genCircleeq(rng, o) {
    var r = randInt(rng, 1, 10);
    return {
      type: 'circleeq',
      prompt: { zh: '圓的方程是 $x^2 + y^2 = ' + (r * r) + '$，求半徑。', en: 'A circle has equation $x^2 + y^2 = ' + (r * r) + '$. Find its radius.' },
      visual: { kind: 'circle', r: r },
      answer: r,
      math: { op: 'circleeq', r: r },
      hint: { zh: 'x² + y² = r²，半徑 = r。', en: 'x² + y² = r², so radius = r.' }
    };
  }

  /* ================= 初中補缺題型 ================= */

  var CONGRUENT_FACTS = [
    { zh: '證明三角形全等的方法共有幾種（SSS、SAS、ASA、AAS、RHS）？', en: 'How many congruence conditions are there (SSS, SAS, ASA, AAS, RHS)?', a: 5 },
    { zh: '兩個全等三角形，對應邊共有幾組相等？', en: 'How many pairs of equal sides do two congruent triangles have?', a: 3 },
    { zh: '兩個全等三角形，對應角共有幾組相等？', en: 'How many pairs of equal angles do two congruent triangles have?', a: 3 }
  ];

  var QUAD_FACTS = [
    { zh: '平行四邊形有幾組平行的對邊？', en: 'How many pairs of parallel sides does a parallelogram have?', a: 2 },
    { zh: '梯形有幾組平行的對邊？', en: 'How many pairs of parallel sides does a trapezium have?', a: 1 },
    { zh: '正方形有幾條相等的邊？', en: 'How many equal sides does a square have?', a: 4 },
    { zh: '菱形有幾條相等的邊？', en: 'How many equal sides does a rhombus have?', a: 4 },
    { zh: '長方形有幾組相等的邊？', en: 'How many pairs of equal sides does a rectangle have?', a: 2 }
  ];

  /* 角與平行線 */
  function genParallel(rng, o) {
    var ang = pick(rng, [40, 50, 60, 70, 80, 110, 120, 130]);
    var kind = pick(rng, ['corr', 'alt', 'int']);
    var label = kind === 'corr' ? '同位角' : kind === 'alt' ? '內錯角' : '同側內角';
    var ans = kind === 'int' ? 180 - ang : ang;
    return {
      type: 'parallel',
      prompt: {
        zh: '兩條平行線被一直線所截，一對' + label + '中，其中一個是 ' + ang + '°，另一個是多少度？',
        en: 'Two parallel lines are cut by a transversal. In a pair of ' + (kind === 'corr' ? 'corresponding' : kind === 'alt' ? 'alternate' : 'co-interior') + ' angles, one is ' + ang + '°. What is the other?'
      },
      visual: { kind: 'parallel' },
      answer: ans,
      math: { op: 'parallel', a: ang, mode: kind },
      hint: { zh: kind === 'int' ? '同側內角互補（和 = 180°）。' : '平行線的同位角／內錯角相等。', en: kind === 'int' ? 'Co-interior angles sum to 180°.' : 'Corresponding / alternate angles are equal.' }
    };
  }

  /* 平方根 */
  function genSqrt(rng, o) {
    var base = randInt(rng, 2, 15);
    return {
      type: 'sqrt',
      prompt: { zh: '$\\sqrt{' + (base * base) + '} = ?$', en: '$\\sqrt{' + (base * base) + '} = ?$' },
      visual: null,
      answer: base,
      math: { op: 'sqrt', base: base },
      hint: { zh: '找一個數，自乘等於 ' + (base * base) + '。', en: 'Find a number whose square is ' + (base * base) + '.' }
    };
  }

  /* 全等三角形 */
  function genCongruent(rng, o) {
    var i = Math.floor(rng() * CONGRUENT_FACTS.length);
    var q = CONGRUENT_FACTS[i];
    return {
      type: 'congruent',
      prompt: { zh: q.zh, en: q.en },
      visual: { kind: 'twotri' },
      answer: q.a,
      math: { op: 'congruent', a: q.a, k: i },
      hint: { zh: '全等三角形對應邊、對應角相等。', en: 'Congruent triangles have equal sides and angles.' }
    };
  }

  /* 相似三角形 */
  function genSimilar(rng, o) {
    var k = randInt(rng, 2, 5);
    if (rng() < 0.5) {
      return {
        type: 'similar',
        prompt: { zh: '把一個圖形放大 ' + k + ' 倍，對應邊是原來的幾倍？', en: 'A shape is enlarged by factor ' + k + '. Its sides are how many times the original?' },
        visual: { kind: 'twotri' },
        answer: k,
        math: { op: 'similar', mode: 'scale', k: k },
        hint: { zh: '放大 k 倍，對應邊也是原來的 k 倍。', en: 'Enlarging by k makes sides k times longer.' }
      };
    }
    var a = randInt(rng, 2, 5);
    return {
      type: 'similar',
      prompt: { zh: '兩個相似三角形，對應邊分別是 ' + a + ' 和 ' + (a * k) + '，放大倍數是多少？', en: 'Two similar triangles have corresponding sides ' + a + ' and ' + (a * k) + '. What is the scale factor?' },
      visual: { kind: 'twotri' },
      answer: k,
      math: { op: 'similar', mode: 'ratio', a: a, k: k },
      hint: { zh: '放大倍數 = 對應邊之比。', en: 'Scale factor = ratio of corresponding sides.' }
    };
  }

  /* 四邊形 */
  function genQuadshape(rng, o) {
    var i = Math.floor(rng() * QUAD_FACTS.length);
    var q = QUAD_FACTS[i];
    return {
      type: 'quadshape',
      prompt: { zh: q.zh, en: q.en },
      visual: null,
      answer: q.a,
      math: { op: 'quadshape', a: q.a, k: i },
      hint: { zh: '想一想這個四邊形的性質。', en: 'Think about the quadrilateral\'s properties.' }
    };
  }

  /* 圓柱體積 / 側面積（以 π 表示） */
  function genCylinder(rng, o) {
    var r = pick(rng, [2, 3, 4, 5]);
    var h = pick(rng, [4, 5, 6, 8]);
    var askVol = rng() < 0.5;
    var coef = askVol ? r * r * h : 2 * r * h;
    return {
      type: 'cylinder',
      prompt: { zh: '圓柱半徑 ' + r + ' cm、高 ' + h + ' cm，' + (askVol ? '體積' : '側面積') + '是多少？（以 π 表示）', en: 'A cylinder has radius ' + r + ' cm and height ' + h + ' cm. What is its ' + (askVol ? 'volume' : 'curved surface area') + '? (in terms of π)' },
      visual: { kind: 'cylinder' },
      answer: piLabel(coef),
      math: { op: 'cylinder', r: r, h: h, mode: askVol ? 'vol' : 'lat', coef: coef },
      choices: circleChoices(rng, coef, 'π'),
      hint: { zh: askVol ? '體積 = π r² h。' : '側面積 = 2π r h。', en: askVol ? 'Volume = π r² h.' : 'Curved surface area = 2π r h.' }
    };
  }

  /* 單利息 */
  function genSinterest(rng, o) {
    var P = pick(rng, [1000, 2000, 5000]);
    var r = pick(rng, [2, 4, 5, 10]);
    var t = pick(rng, [1, 2, 3]);
    return {
      type: 'sinterest',
      prompt: { zh: '本金 $' + P + '，年利率 ' + r + '%，' + t + ' 年的單利息是多少？', en: 'A principal of $' + P + ' earns ' + r + '% p.a. simple interest for ' + t + ' years. What is the interest?' },
      visual: null,
      answer: P * r * t / 100,
      math: { op: 'sinterest', p: P, r: r, n: t },
      hint: { zh: '單利息 = 本金 × 利率 × 年數。', en: 'Simple interest = principal × rate × years.' }
    };
  }

  /* 展開（恆等式） */
  function genExpand(rng, o) {
    var a = randInt(rng, 1, 6), b = randInt(rng, 1, 6);
    var askCoeff = rng() < 0.5;
    return {
      type: 'expand',
      prompt: { zh: '展開 $(x + ' + a + ')(x + ' + b + ')$，' + (askCoeff ? '$x$ 的係數' : '常數項') + '是多少？', en: 'Expand $(x + ' + a + ')(x + ' + b + ')$. What is the ' + (askCoeff ? 'coefficient of $x$' : 'constant term') + '?' },
      visual: null,
      answer: askCoeff ? (a + b) : (a * b),
      math: { op: 'expand', a: a, b: b, mode: askCoeff ? 'coeff' : 'const' },
      hint: { zh: '(x + a)(x + b) = x² + (a+b)x + ab。', en: '(x + a)(x + b) = x² + (a+b)x + ab.' }
    };
  }

  /* 圓形圖 */
  function genPichart(rng, o) {
    var pct = pick(rng, [10, 20, 25, 30, 40, 50, 75]);
    return {
      type: 'pichart',
      prompt: { zh: '圓形圖中，佔 ' + pct + '% 的部分對應的圓心角是多少度？', en: 'In a pie chart, what central angle corresponds to ' + pct + '%?' },
      visual: { kind: 'pie', pct: pct },
      answer: pct * 360 / 100,
      math: { op: 'pichart', pct: pct },
      hint: { zh: '圓心角 = 百分比 × 360°。', en: 'Central angle = percentage × 360°.' }
    };
  }

  /* 量度誤差 */
  function genApprox(rng, o) {
    var unit = pick(rng, [10, 100, 1000]);
    return {
      type: 'approx',
      prompt: { zh: '把數值四捨五入至最接近的 ' + unit + '，最大絕對誤差是多少？', en: 'When a number is rounded to the nearest ' + unit + ', what is the maximum absolute error?' },
      visual: null,
      answer: unit / 2,
      math: { op: 'approx', a: unit },
      hint: { zh: '最大誤差 = 單位的一半。', en: 'Max error = half of the unit.' }
    };
  }

  /* ================= 補缺題型（方向、時間、立體、三角、圓、二項式、微分） ================= */

  var DIRECTION_KEYS = ['east', 'south', 'west', 'north'];
  var DIRECTION_FACTS = [
    { zh: '太陽從哪個方向升起？', en: 'In which direction does the sun rise?', k: 'east' },
    { zh: '太陽從哪個方向落下？', en: 'In which direction does the sun set?', k: 'west' },
    { zh: '與「東」相對的方向是？', en: 'Which direction is opposite to east?', k: 'west' },
    { zh: '與「北」相對的方向是？', en: 'Which direction is opposite to north?', k: 'south' },
    { zh: '與「西」相對的方向是？', en: 'Which direction is opposite to west?', k: 'east' },
    { zh: '與「南」相對的方向是？', en: 'Which direction is opposite to south?', k: 'north' },
    { zh: '面向北，向右轉後面向哪個方向？', en: 'Facing north, which direction are you facing after turning right?', k: 'east' },
    { zh: '面向東，向左轉後面向哪個方向？', en: 'Facing east, which direction are you facing after turning left?', k: 'north' },
    { zh: '面向南，向右轉後面向哪個方向？', en: 'Facing south, which direction are you facing after turning right?', k: 'west' },
    { zh: '面向西，向左轉後面向哪個方向？', en: 'Facing west, which direction are you facing after turning left?', k: 'south' }
  ];

  /* 24 小時制：隨機出「24→12」或「12→24」，而不是固定五題 */
  function genTime24(rng, o) {
    var answer, prompt, hint, k;
    if (rng() < 0.5) {
      var h24 = randInt(rng, 13, 23);
      answer = h24 - 12;
      k = 'to12';
      prompt = {
        zh: h24 + ':00 是下午／晚上幾點？',
        en: h24 + ':00 is what time in the afternoon/evening?'
      };
      hint = { zh: '24 小時制減 12，就是下午／晚上的 12 小時制時間。', en: 'Subtract 12 from 24-hour time to get the PM 12-hour time.' };
    } else {
      var h12 = randInt(rng, 1, 11);
      answer = h12 + 12;
      k = 'to24';
      prompt = {
        zh: '下午 ' + h12 + ' 時是 24 小時制的幾點？',
        en: h12 + ' pm is what time on the 24-hour clock?'
      };
      hint = { zh: '下午時間加 12，就是 24 小時制。', en: 'Add 12 to a PM time to get the 24-hour clock.' };
    }
    var choices = [answer];
    shuffle(rng, [-3, -2, -1, 1, 2, 3]).forEach(function (d) {
      if (choices.length >= 4) return;
      var c = answer + d;
      if (c < 0 || c > 24) return;
      if (choices.indexOf(c) === -1) choices.push(c);
    });
    return {
      type: 'time24',
      prompt: prompt,
      visual: null,
      answer: answer,
      choices: shuffle(rng, choices),
      math: { op: 'time24', a: answer, k: k },
      hint: hint
    };
  }

  var SOLID_PAIRS = [
    { kind: 'coneV', r: 3, h: 3, coef: 9 },
    { kind: 'coneV', r: 3, h: 6, coef: 18 },
    { kind: 'coneV', r: 3, h: 9, coef: 27 },
    { kind: 'sphereV', r: 3, coef: 36 },
    { kind: 'sphereA', r: 3, coef: 36 },
    { kind: 'sphereA', r: 6, coef: 144 }
  ];

  var CENTRE_KEYS = ['incentre', 'circumcentre', 'centroid', 'orthocentre'];
  var CENTRE_FACTS = [
    { zh: '三角形三條角平分線的交點叫甚麼心？', en: 'The three angle bisectors meet at which centre?', k: 'incentre' },
    { zh: '三角形三條垂直平分線的交點叫甚麼心？', en: 'The three perpendicular bisectors meet at which centre?', k: 'circumcentre' },
    { zh: '三角形三條中線的交點叫甚麼心？', en: 'The three medians meet at which centre?', k: 'centroid' },
    { zh: '三角形三條高的交點叫甚麼心？', en: 'The three altitudes meet at which centre?', k: 'orthocentre' }
  ];

  var DIR_LABEL = { east: { zh: '東', en: 'East' }, south: { zh: '南', en: 'South' }, west: { zh: '西', en: 'West' }, north: { zh: '北', en: 'North' } };
  var CENTRE_LABEL = { incentre: { zh: '內心', en: 'Incentre' }, circumcentre: { zh: '外心', en: 'Circumcentre' }, centroid: { zh: '重心', en: 'Centroid' }, orthocentre: { zh: '垂心', en: 'Orthocentre' } };

  /* 方向 */
  function genDirection(rng, o) {
    var i = Math.floor(rng() * DIRECTION_FACTS.length);
    var q = DIRECTION_FACTS[i];
    return {
      type: 'direction',
      prompt: { zh: q.zh, en: q.en },
      visual: { kind: 'compass' },
      answer: q.k,
      choices: DIRECTION_KEYS.slice(),
      math: { op: 'direction', k: q.k },
      hint: { zh: '想一想指南針的方向。', en: 'Think about the compass directions.' }
    };
  }

  /* 圓錐 / 球體（以 π 表示） */
  function genCone(rng, o) {
    var q = pick(rng, SOLID_PAIRS);
    var zhPrompt, enPrompt, hintZh, hintEn;
    if (q.kind === 'coneV') {
      zhPrompt = '圓錐半徑 ' + q.r + ' cm、高 ' + q.h + ' cm，體積是多少？（以 π 表示）';
      enPrompt = 'A cone has radius ' + q.r + ' cm and height ' + q.h + ' cm. What is its volume? (in terms of π)';
      hintZh = '圓錐體積 = π r² h / 3。';
      hintEn = 'Cone volume = π r² h / 3.';
    } else if (q.kind === 'sphereV') {
      zhPrompt = '球體半徑 ' + q.r + ' cm，體積是多少？（以 π 表示）';
      enPrompt = 'A sphere has radius ' + q.r + ' cm. What is its volume? (in terms of π)';
      hintZh = '球體積 = 4π r³ / 3。';
      hintEn = 'Sphere volume = 4π r³ / 3.';
    } else {
      zhPrompt = '球體半徑 ' + q.r + ' cm，表面積是多少？（以 π 表示）';
      enPrompt = 'A sphere has radius ' + q.r + ' cm. What is its surface area? (in terms of π)';
      hintZh = '球表面積 = 4π r²。';
      hintEn = 'Sphere surface area = 4π r².';
    }
    return {
      type: 'cone',
      prompt: { zh: zhPrompt, en: enPrompt },
      visual: { kind: q.kind === 'coneV' ? 'cone' : 'sphere' },
      answer: piLabel(q.coef),
      math: { op: 'cone', kind: q.kind, r: q.r, h: q.h || 0, coef: q.coef },
      choices: circleChoices(rng, q.coef, 'π'),
      hint: { zh: hintZh, en: hintEn }
    };
  }

  /* 三角形的心 */
  function genCentre(rng, o) {
    var i = Math.floor(rng() * CENTRE_FACTS.length);
    var q = CENTRE_FACTS[i];
    return {
      type: 'centre',
      prompt: { zh: q.zh, en: q.en },
      visual: { kind: 'centre' },
      answer: q.k,
      choices: CENTRE_KEYS.slice(),
      math: { op: 'centre', k: q.k },
      hint: { zh: '內心＝角平分線，外心＝垂直平分線，重心＝中線，垂心＝高。', en: 'Incentre: angle bisectors; circumcentre: perpendicular bisectors; centroid: medians; orthocentre: altitudes.' }
    };
  }

  /* 圓周角 / 圓心角 */
  function genCircleangle(rng, o) {
    var half = pick(rng, [20, 30, 40, 50, 60]);
    var askCentre = rng() < 0.5;
    var ans = askCentre ? half * 2 : half;
    var zhPrompt = askCentre
      ? '同一段弧上，圓周角是 ' + half + '°，對應的圓心角是多少度？'
      : '同一段弧上，圓心角是 ' + (half * 2) + '°，對應的圓周角是多少度？';
    var enPrompt = askCentre
      ? 'On the same arc, an inscribed angle is ' + half + '°. What is the central angle?'
      : 'On the same arc, the central angle is ' + (half * 2) + '°. What is the inscribed angle?';
    return {
      type: 'circleangle',
      prompt: { zh: zhPrompt, en: enPrompt },
      visual: { kind: 'circleang' },
      answer: ans,
      math: { op: 'circleangle', a: half, mode: askCentre ? 'centre' : 'circ' },
      hint: { zh: '圓心角 = 2 × 圓周角（同一弧）。', en: 'Central angle = 2 × inscribed angle (same arc).' }
    };
  }

  /* 二項式定理 */
  function genBinomial(rng, o) {
    function C(a, b) {
      function fact(x) { var f = 1; for (var i = 2; i <= x; i++) f *= i; return f; }
      return fact(a) / (fact(b) * fact(a - b));
    }
    if (o && o.general) {
      var gn = pick(rng, [3, 4, 5]);
      var ga = pick(rng, [2, 3]);
      var gr = randInt(rng, 1, gn - 1);
      return {
        type: 'binomial',
        prompt: { zh: '在 $(x + ' + ga + ')^' + gn + '$ 的展開式中，' + (gr === 1 ? '$x$' : '$x^' + gr + '$') + ' 的係數是多少？', en: 'In the expansion of $(x + ' + ga + ')^' + gn + '$, what is the coefficient of ' + (gr === 1 ? '$x$' : '$x^' + gr + '$') + '?' },
        visual: null,
        answer: C(gn, gr) * Math.pow(ga, gn - gr),
        math: { op: 'binomial', mode: 'gen', n: gn, r: gr, a: ga },
        hint: { zh: 'x^r 的係數 = C(n, r) × a^(n−r)。', en: 'Coefficient of x^r = C(n, r) × a^(n−r).' }
      };
    }
    var n = pick(rng, [3, 4, 5, 6]);
    var r = pick(rng, [1, 2, 3]);
    while (r >= n) r = 1;
    return {
      type: 'binomial',
      prompt: { zh: '在 $(x + 1)^' + n + '$ 的展開式中，$x^' + r + '$ 的係數是多少？', en: 'In the expansion of $(x + 1)^' + n + '$, what is the coefficient of $x^' + r + '$?' },
      visual: null,
      answer: C(n, r),
      math: { op: 'binomial', n: n, r: r },
      hint: { zh: 'x^r 的係數 = C(n, r)。', en: 'Coefficient of x^r = C(n, r).' }
    };
  }

  /* 微分入門 */
  function genDerivative(rng, o) {
    var a = randInt(rng, 1, 9);
    var n = pick(rng, [2, 3, 4]);
    var askCoeff = rng() < 0.5;
    return {
      type: 'derivative',
      prompt: {
        zh: '求 $\\dfrac{d}{dx}(' + a + 'x^' + n + ')$，' + (askCoeff ? '導數中最高次項的係數' : '導數的次數') + '是多少？',
        en: 'Find $\\dfrac{d}{dx}(' + a + 'x^' + n + ')$. What is the ' + (askCoeff ? 'leading coefficient of the derivative' : 'degree of the derivative') + '?'
      },
      visual: null,
      answer: askCoeff ? a * n : (n - 1),
      math: { op: 'derivative', a: a, n: n, mode: askCoeff ? 'coeff' : 'deg' },
      hint: { zh: 'd/dx(ax^n) = a·n·x^(n−1)：係數是 a·n，次數是 n−1。', en: 'd/dx(ax^n) = a·n·x^(n−1): the coefficient is a·n and the degree is n−1.' }
    };
  }

  /* 逐題型（含 mode）的解題步驟；題目可自帶 p.solution，否則用這裡的 solver。
   * 這是 explain() 的正式延伸點：新增題型／模式時在這裡補一個 solver，並由
   * tests/generators.test.js 驗證每個題型都不會拋錯、步驟不得為空。 */
  var SOLVERS = {
    gp: function (p) {
      var m = p.math, ans = renderValue(p.answer);
      if (m.mode === 'sum') {
        return {
          zh: ['前 n 項和 = a(rⁿ − 1) ÷ (r − 1)。', '= ' + m.a + ' × (' + m.r + '^' + m.n + ' − 1) ÷ (' + m.r + ' − 1) = ' + ans + '。'],
          en: ['Sum of n terms = a(rⁿ − 1) ÷ (r − 1).', '= ' + m.a + ' × (' + m.r + '^' + m.n + ' − 1) ÷ (' + m.r + ' − 1) = ' + ans + '.']
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
  function explain(p) {
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
        return {
          zh: ['最大誤差 = 單位的一半。', m.a + ' ÷ 2 = ' + p.answer + '。'],
          en: ['Max error = half of the unit.', m.a + ' ÷ 2 = ' + p.answer + '.']
        };
      case 'direction':
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
      default:
        return null;
    }
  }

  /* 位值：十位、個位、位值與合成（P1「100 以內的數」） */
  function genPlacevalue(rng, o) {
    var max = Math.min(99, o.max != null ? o.max : 99);
    var min = Math.max(10, o.min != null ? o.min : 10);
    var n = randInt(rng, min, Math.max(min, max));
    var tens = Math.floor(n / 10);
    var ones = n % 10;
    var mode = pick(rng, ['tens', 'ones', 'value', 'compose']);
    var prompt, answer;
    if (mode === 'tens') {
      prompt = { zh: n + ' 的十位數字是多少？', en: 'What is the tens digit of ' + n + '?' };
      answer = tens;
    } else if (mode === 'ones') {
      prompt = { zh: n + ' 的個位數字是多少？', en: 'What is the ones digit of ' + n + '?' };
      answer = ones;
    } else if (mode === 'value') {
      prompt = { zh: '在 ' + n + ' 中，十位數字代表多少？', en: 'In ' + n + ', what value does the tens digit represent?' };
      answer = tens * 10;
    } else {
      prompt = { zh: tens + ' 個十和 ' + ones + ' 個一合起來是多少？', en: 'What number is ' + tens + ' tens and ' + ones + ' ones?' };
      answer = n;
    }
    var choices = [answer];
    if (mode === 'tens' || mode === 'ones') {
      shuffle(rng, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).forEach(function (d) {
        if (choices.length < 4 && d !== answer) choices.push(d);
      });
    } else if (mode === 'value') {
      shuffle(rng, [10, 20, 30, 40, 50, 60, 70, 80, 90]).forEach(function (v) {
        if (choices.length < 4 && v !== answer) choices.push(v);
      });
    } else {
      shuffle(rng, [n - 1, n + 1, n - 2, n + 2, n - 3, n + 3, n + 10]).forEach(function (v) {
        if (choices.length < 4 && v >= 10 && v <= 99) choices.push(v);
      });
    }
    return {
      type: 'placevalue',
      prompt: prompt,
      visual: null,
      answer: answer,
      choices: shuffle(rng, choices),
      math: { op: 'placevalue', mode: mode, n: n, tens: tens, ones: ones },
      hint: {
        zh: '十位在左、個位在右；十位數字代表幾個十。',
        en: 'Tens digit on the left, ones on the right; the tens digit counts tens.'
      }
    };
  }

  var GENERATORS = {
    count: genCount,
    compare: genCompare,
    comparegroup: genCompareGroup,
    placevalue: genPlacevalue,
    identity: genIdentity,
    circleprop: genCircleprop,
    dispersion: genDispersion,
    prism: genPrism,
    matrix: genMatrix,
    calculus: genCalculus,
    expectation: genExpectation,
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
    coord: genCoord,
    perimeter: genPerimeter,
    polygon: genPolygon,
    angle: genAngle,
    money: genMoney,
    fact: genFact,
    quadsolve: genQuadsolve,
    line: genLine,
    variation: genVariation,
    oddeven: genOddEven,
    shape: genShape,
    symmetry: genSymmetry,
    liketerms: genLiketerms,
    polycoeff: genPolycoeff,
    arclen: genArclen,
    mode: genMode,
    asum: genAsum,
    invvar: genInvvar,
    comb: genComb,
    range: genRange,
    circleeq: genCircleeq,
    parallel: genParallel,
    sqrt: genSqrt,
    congruent: genCongruent,
    similar: genSimilar,
    quadshape: genQuadshape,
    cylinder: genCylinder,
    sinterest: genSinterest,
    expand: genExpand,
    pichart: genPichart,
    approx: genApprox,
    direction: genDirection,
    time24: genTime24,
    cone: genCone,
    centre: genCentre,
    circleangle: genCircleangle,
    binomial: genBinomial,
    derivative: genDerivative
  };

  /* 題型目錄：直接由註冊表產生，新增生成器即自動納入 */
  GENERATOR_TYPES = Object.keys(GENERATORS);

  /* ---------------- 答案推導規格（MATH_SPEC） ----------------
   * 生成器把參數寫進 p.math；此表只從 p.math 重新推導答案（不讀 p.answer），
   * 是測試 oracle 與 generateProblem({selfCheck:true}) 自檢的唯一來源。
   * 鍵 = p.math.op（題型選定的運算）；模式差異在函數內按 m.mode 分支。
   * 與 GENERATORS 放在一起維護：新增題型時兩者都要加，contract 測試會檢查。 */
  var MATH_SPEC = {
    count: function (m) { return m.n; },
    frac: function (m) { return { n: m.n, d: m.d }; },
    compare: function (m) { return m.mode === 'max' ? Math.max(m.a, m.b) : Math.min(m.a, m.b); },
    comparegroup: function (m) { return m.mode === 'max' ? (m.a > m.b ? 'green' : 'orange') : (m.a < m.b ? 'green' : 'orange'); },
    fadd: function (m) { return { n: m.a + m.b, d: m.d }; },
    fsub: function (m) { return { n: m.a - m.b, d: m.d }; },
    dadd: function (m) { return (m.r / 10).toFixed(1); },
    dsub: function (m) { return (m.r / 10).toFixed(1); },
    dmul: function (m) { return (m.r / 10).toFixed(1); },
    ddiv: function (m) { return (m.r / 10).toFixed(1); },
    avg: function (m) { return m.nums.reduce(function (s, x) { return s + x; }, 0) / m.nums.length; },
    equation: function (m) {
      if (m.form === 'x+a=c') return m.c - m.a;
      if (m.form === 'x-a=c') return m.c + m.a;
      if (m.form === 'ax=c') return m.c / m.a;
      return m.a * m.c; // x/a=c
    },
    percent: function (m) {
      if (m.kind === 'reverse') return m.price * 100 / (100 - m.p);
      if (m.kind === 'change') return (m.result - m.whole) / m.whole * 100;
      if (m.kind === 'of') return m.p * m.whole / 100;
      if (m.kind === 'increase') return m.whole * (100 + m.p) / 100;
      if (m.kind === 'decrease') return m.whole * (100 - m.p) / 100;
      return m.pct;
    },
    ratio: function (m) {
      if (m.mode === 'threePart') return m.r * m.k;
      if (m.mode === 'share') return m.p * m.k;
      return m.q * m.k;
    },
    area: function (m) { return m.mode === 'area' ? m.l * m.w : 2 * (m.l + m.w); },
    fractionof: function (m) { return m.n * m.k; },
    exprsub: function (m) { return m.a * m.x + m.b; },
    linear: function (m) { return m.form === '+' ? (m.c - m.b) / m.a : (m.c + m.b) / m.a; },
    pythagoras: function (m) { return m.mode === 'hyp' ? m.c : m.b; },
    simul: function (m) { return m.mode === 'gen' ? (m.s * m.d - m.b * m.t) / (m.a * m.d - m.b * m.c) : (m.s + m.d) / 2; },
    indices: function (m) {
      if (m.mode === 'power') return Math.pow(m.base, m.e);
      if (m.mode === 'prod') return Math.pow(m.base, m.e1 + m.e2);
      if (m.mode === 'quot') return Math.pow(m.base, m.e1 - m.e2);
      return Math.pow(m.b1 * m.b2, m.e);
    },
    inequality: function (m) {
      var sign = m.a > 0 ? m.sign : (m.sign === '>' ? '<' : '>');
      return 'x ' + sign + ' ' + m.x0;
    },
    log: function (m) { return m.mode === 'law' ? Math.round(Math.log(m.m * m.n) / Math.log(m.base)) : m.n; },
    fx: function (m) { return m.a * m.x * m.x + m.b * m.x + m.c; },
    trig: function (m) {
      if (m.which === 'sin') return { n: m.a, d: m.c };
      if (m.which === 'cos') return { n: m.b, d: m.c };
      return { n: m.a, d: m.b };
    },
    ap: function (m) {
      if (m.mode === 'sum') return m.n * (2 * m.a + (m.n - 1) * m.d) / 2;
      if (m.mode === 'findN') return m.n;
      return m.a + (m.n - 1) * m.d;
    },
    gp: function (m) {
      if (m.mode === 'sum') return m.a * (Math.pow(m.r, m.n) - 1) / (m.r - 1);
      if (m.mode === 'inf') return m.a / (1 - m.r);
      return m.a * Math.pow(m.r, m.n - 1);
    },
    prob: function (m) { return { n: m.good, d: m.total }; },
    quad: function (m) { return m.askSum ? m.sum : m.prod; },
    stats: function (m) {
      if (m.mode === 'mean') return m.mean;
      var s = m.nums.slice().sort(function (x, y) { return x - y; });
      if (s.length % 2 === 0) return (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
      return s[(s.length - 1) / 2];
    },
    triangle: function (m) { return m.b * m.h / 2; },
    circle: function (m) { return piValue(m.mode === 'area' ? m.r * m.r : 2 * m.r); },
    volume: function (m) { return m.l * m.w * m.h; },
    coord: function (m) { return m.mode === 'dist' ? m.dist : '(' + m.mx + ', ' + m.my + ')'; },
    warea: function (m) { return m.a * m.b; },
    wpercent: function (m) { return m.a * (100 - m.b) / 100; },
    wratio: function (m) { return m.b; },
    wspeed: function (m) { return m.a * m.b / 60; },
    wprofit: function (m) { return m.b; },
    wcompound: function (m) { return Math.round(m.a * Math.pow(1 + m.b / 100, m.c)); },
    wtwostep: function (m) { return m.a * m.b - m.c; },
    wunit: function (m) { return m.cost1 / m.n1 * m.n2; },
    wmoney2: function (m) { return m.paid - (m.p1 * m.n1 + m.p2 * m.n2); },
    wreverse: function (m) { return m.price * 100 / (100 - m.disc); },
    wprofit2: function (m) { return m.sell - m.n * m.cost; },
    wratio2: function (m) { return (m.p + m.q) * m.k; },
    wrate2: function (m) { return m.rate * m.t2; },
    wgeo2: function (m) { return m.l * m.w * m.cost; },
    wdata2: function (m) {
      return m.target * m.n - m.scores.reduce(function (s, x) { return s + x; }, 0);
    },
    wtable: function (m) {
      var sum = 0;
      for (var i = 0; i < m.prices.length; i++) sum += m.prices[i] * m.qty[i];
      return m.paid - sum;
    },
    wequation: function (m) { return (m.result - m.b) / m.a; },
    placevalue: function (m) {
      if (m.mode === 'tens') return m.tens;
      if (m.mode === 'ones') return m.ones;
      if (m.mode === 'value') return m.tens * 10;
      return m.n;
    },
    perimeter: function (m) { return 2 * (m.l + m.w); },
    polygon: function (m) { return (m.n - 2) * 180; },
    angle: function (m) { return m.a; },
    money: function (m) { return m.a - m.b; },
    fact: function (m) { return m.a; },
    quadsolve: function (m) {
      if (m.mode === 'disc') return Math.pow(m.p - m.q, 2);
      if (m.mode === 'nature') {
        var qD = m.b * m.b - 4 * m.a * m.c;
        return qD > 0 ? 2 : (qD === 0 ? 1 : 0);
      }
      return Math.max(m.p, m.q);
    },
    line: function (m) { return m.mode === 'eq' ? m.y - m.m * m.x : (m.b[1] - m.a[1]) / (m.b[0] - m.a[0]); },
    variation: function (m) { return m.k * m.c; },
    oddeven: function (m) {
      if (m.mode === 'counteven') return Math.floor(m.n / 2);
      if (m.mode === 'countodd') return Math.ceil(m.n / 2);
      return m.n + 2;
    },
    shape: function (m) { return m.a; },
    symmetry: function (m) { return m.a; },
    liketerms: function (m) { return m.mode === 'sub' ? m.a - m.b : m.a + m.b; },
    polycoeff: function (m) { return m.mode === 'deg' ? m.d : m.c; },
    arclen: function (m) { return piValue(m.coef); },
    mode: function (m) { return m.m; },
    asum: function (m) { return m.n * (2 * m.a + (m.n - 1) * m.d) / 2; },
    invvar: function (m) { return m.k / m.c; },
    comb: function (m) {
      return m.mode === 'P' ? factInt(m.n) / factInt(m.n - m.r) : factInt(m.n) / (factInt(m.r) * factInt(m.n - m.r));
    },
    range: function (m) { return Math.max.apply(null, m.nums) - Math.min.apply(null, m.nums); },
    circleeq: function (m) { return m.r; },
    parallel: function (m) { return m.mode === 'int' ? 180 - m.a : m.a; },
    sqrt: function (m) { return m.base; },
    congruent: function (m) { return m.a; },
    similar: function (m) { return m.k; },
    quadshape: function (m) { return m.a; },
    cylinder: function (m) { return piValue(m.coef); },
    sinterest: function (m) { return m.p * m.r * m.n / 100; },
    expand: function (m) { return m.mode === 'coeff' ? m.a + m.b : m.a * m.b; },
    pichart: function (m) { return m.pct * 360 / 100; },
    approx: function (m) { return m.a / 2; },
    direction: function (m) { return m.k; },
    time24: function (m) { return m.a; },
    cone: function (m) { return piValue(m.coef); },
    centre: function (m) { return m.k; },
    circleangle: function (m) { return m.mode === 'centre' ? 2 * m.a : m.a; },
    binomial: function (m) {
      var coef = factInt(m.n) / (factInt(m.r) * factInt(m.n - m.r));
      return m.mode === 'gen' ? coef * Math.pow(m.a, m.n - m.r) : coef;
    },
    derivative: function (m) { return m.mode === 'coeff' ? m.a * m.n : m.n - 1; },
    identity: function (m) {
      if (m.mode === 'mid') return m.a + m.b;
      if (m.mode === 'const') return m.a * m.b;
      if (m.mode === 'square') return 2 * m.a;
      return m.a * m.a - m.b * m.b;
    },
    circleprop: function (m) {
      if (m.mode === 'semicircle' || m.mode === 'tangent') return 90;
      if (m.mode === 'cyclic') return 180 - m.a;
      return m.a;
    },
    dispersion: function (m) { return m.q3 - m.q1; },
    prism: function (m) { return m.mode === 'pyramid' ? m.area * m.h / 3 : m.area * m.h; },
    matrix: function (m) {
      if (m.mode === 'det') return m.a * m.d - m.b * m.c;
      return m.A[0][0] * m.B[0][0] + m.A[0][1] * m.B[1][0];
    },
    calculus: function (m) {
      if (m.mode === 'dval') return m.a * m.n * Math.pow(m.x, m.n - 1);
      return m.a * Math.pow(m.b, m.n + 1) / (m.n + 1);
    },
    expectation: function (m) {
      if (m.mode === 'die') return { n: 7, d: 2 };
      if (m.mode === 'spinner') {
        var sp = m.n + 1;
        return sp % 2 === 0 ? sp / 2 : { n: sp, d: 2 };
      }
      return { n: factInt(m.n) / (factInt(m.k) * factInt(m.n - m.k)), d: Math.pow(2, m.n) };
    },
    add: function (m) { return m.a + m.b; },
    sub: function (m) { return m.a - m.b; },
    mul: function (m) { return m.a * m.b; },
    '+': function (m) { return m.a + m.b; },
    '−': function (m) { return m.a - m.b; },
    '×': function (m) { return m.a * m.b; },
    '÷': function (m) { return m.a / m.b; }
  };

  /* π 的顯示值：係數為 1 時寫成 π，而不是 1π（與 renderValue 的約定一致） */
  function piValue(k) { return (k === 1 ? '' : k) + 'π'; }

  function factInt(n) {
    var f = 1;
    for (var i = 2; i <= n; i++) f *= i;
    return f;
  }

  /* 從 p.math 推導期望答案；缺 math / 未登記的 op 一律拋錯（測試會即時發現） */
  function answerFromMath(problem) {
    if (!problem || !problem.math || typeof problem.math !== 'object') {
      throw new Error('answerFromMath: 缺少 math 元資料');
    }
    var m = problem.math;
    /* 填空題：先由和／差反推被遮住的項 */
    if (m.blank) {
      if (m.blank === 'a') return m.op === '+' || m.op === 'add' ? m.c - m.b : m.c + m.b;
      if (m.blank === 'b') return m.op === '+' || m.op === 'add' ? m.c - m.a : m.a - m.c;
    }
    var spec = MATH_SPEC[m.op];
    if (!spec) throw new Error('answerFromMath: 未登記的 op ' + m.op);
    return spec(m);
  }

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
      if (valuesEqual(cand, answer)) continue;
      var k = valueKey(cand);
      if (!seen[k]) { seen[k] = true; out.push(cand); }
    }
    return shuffle(rng, out);
  }

  /* 每個類型合理的干擾項數值上界 */
  function distractorMax(p, o) {
    if (isFraction(p.answer)) return 20;
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
  function stableStringify(value) {
    if (value === null || typeof value !== 'object') return JSON.stringify(value);
    if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
    var keys = Object.keys(value).sort();
    return '{' + keys.map(function (k) { return JSON.stringify(k) + ':' + stableStringify(value[k]); }).join(',') + '}';
  }

  /* 題目的穩定標識（完整 math 內容，用於去重與「避開最近題」） */
  function mathSig(math) {
    return stableStringify(math);
  }

  /* 結構 key：把 math 裡的數字換成 '#'，保留運算／模式／情境欄位。
   * 兩個題目 templateSig 相同 = 同一個模板，只是換了數字（正是使用者抱怨的重複）。 */
  function blankNumerals(value) {
    if (typeof value === 'number') return '#';
    if (typeof value === 'string') return value.replace(/\d+(?:\.\d+)?/g, '#');
    if (value === null || typeof value !== 'object') return value;
    if (Array.isArray(value)) return value.map(blankNumerals);
    var out = {};
    Object.keys(value).sort().forEach(function (k) { out[k] = blankNumerals(value[k]); });
    return out;
  }

  function templateSig(problem) {
    if (!problem || !problem.math) return '';
    return problem.type + ':' + stableStringify(blankNumerals(problem.math));
  }

  /* 題幹模板 key：把英文題幹的數字換成 '#'（用於區分同一 template 的不同情境句子）。 */
  function contextSig(problem) {
    if (!problem) return '';
    var text = problem.prompt && problem.prompt.en ? String(problem.prompt.en) : '';
    return problem.type + ':' + text.replace(/\d+(?:\.\d+)?/g, '#').replace(/\s+/g, ' ').trim();
  }

  /* 組成一份題組：同題不重複；同一模板/題幹最多 maxTpl 次；候選不足時逐級放寬，
   * 但保證長度 = count（修復舊 buildQuiz 在窄題庫上只出 3 題的問題）。 */
  function composeSet(skill, count, opts) {
    opts = opts || {};
    var rng = opts.rng || seedRandom(opts.seed != null ? opts.seed : 1);
    var step = opts.difficultyStep != null ? opts.difficultyStep : 0;
    var types = typeList(skill);
    if (!types.length) return [];
    var out = [];
    var seenSig = {};
    var tCount = {}, cCount = {};
    var avoid = {};
    (opts.avoid || []).forEach(function (s) { avoid[s] = true; });
    function draw() {
      var ti = types.length > 1 ? Math.floor(rng() * types.length) : 0;
      return generateProblem(skill, { rng: rng, difficultyStep: step, typeIndex: ti });
    }
    function pass(maxTpl, uniqueSig) {
      var guard = 0;
      while (out.length < count && guard++ < count * 300) {
        var p = draw();
        var t = templateSig(p), c = contextSig(p);
        if (uniqueSig && (avoid[p.sig] || seenSig[p.sig])) continue;
        if (seenSig[p.sig]) continue; // 任何情況都不容許完全相同的題目
        if ((tCount[t] || 0) >= maxTpl || (cCount[c] || 0) >= maxTpl) continue;
        seenSig[p.sig] = true;
        tCount[t] = (tCount[t] || 0) + 1;
        cCount[c] = (cCount[c] || 0) + 1;
        out.push(p);
      }
    }
    pass(1, true);
    pass(2, true);
    /* 同一模板最多 4 題，但仍要求整題不同：讓「同結構不同問法」也有空間 */
    pass(4, true);
    /* 題庫太小：只保證不重複，允許模板重複 */
    var guard = 0;
    while (out.length < count && guard++ < count * 400) {
      var p = draw();
      if (seenSig[p.sig]) continue;
      seenSig[p.sig] = true;
      out.push(p);
    }
    /* 真·超小題庫（< count 個不同題目）：寧可重複也要補滿 count 題 */
    guard = 0;
    while (out.length < count && guard++ < count * 200) out.push(draw());
    return out;
  }

  /* 綜合考試組卷：跨技能抽題，每技能最多 maxPerSkill 題、同一模板最多 2 次；
   * stepFor(skill, rng) 決定每題難度級別（預設隨機 0..max）。 */
  function composeExam(skills, count, opts) {
    opts = opts || {};
    var rng = opts.rng || seedRandom(opts.seed != null ? opts.seed : 1);
    var maxPerSkill = opts.maxPerSkill != null ? opts.maxPerSkill : 3;
    var stepFor = opts.stepFor;
    var out = [], seenSig = {}, tCount = {}, cCount = {}, sCount = {};
    var cursor = 0;
    function stepOf(skill) {
      var levels = Math.max(1, (skill.levels || []).length);
      if (stepFor) return stepFor(skill, rng);
      return randInt(rng, 0, levels - 1);
    }
    function draw(relax) {
      for (var tries = 0; tries < skills.length * 10; tries++) {
        var skill = skills[cursor++ % skills.length];
        var types = typeList(skill);
        if (!types.length) continue;
        var p = generateProblem(skill, {
          rng: rng,
          difficultyStep: stepOf(skill),
          typeIndex: Math.floor(rng() * types.length)
        });
        if (seenSig[p.sig]) continue;
        var t = templateSig(p), c = contextSig(p);
        if (!relax && ((tCount[t] || 0) >= 2 || (cCount[c] || 0) >= 2 || (sCount[skill.id] || 0) >= maxPerSkill)) continue;
        seenSig[p.sig] = true;
        tCount[t] = (tCount[t] || 0) + 1;
        cCount[c] = (cCount[c] || 0) + 1;
        sCount[skill.id] = (sCount[skill.id] || 0) + 1;
        p.skillId = skill.id;
        return p;
      }
      return null;
    }
    var guard = 0;
    while (out.length < count && guard++ < count * 40) { var p = draw(false); if (p) out.push(p); }
    guard = 0;
    while (out.length < count && guard++ < count * 40) { p = draw(true); if (p) out.push(p); }
    /* 仍不足：跨技能抽不重複的題（放寬每技能題數），最後才容許重複 */
    guard = 0;
    while (out.length < count && guard++ < count * 400) {
      var skill = skills[cursor++ % skills.length];
      var types = typeList(skill);
      if (!types.length) continue;
      p = generateProblem(skill, { rng: rng, difficultyStep: stepOf(skill), typeIndex: Math.floor(rng() * types.length) });
      if (seenSig[p.sig]) continue;
      seenSig[p.sig] = true;
      p.skillId = skill.id;
      out.push(p);
    }
    guard = 0;
    while (out.length < count && guard++ < count * 200) {
      var fallbackSkill = skills[cursor++ % skills.length];
      var fallbackTypes = typeList(fallbackSkill);
      if (!fallbackTypes.length) continue;
      p = generateProblem(fallbackSkill, { rng: rng, difficultyStep: stepOf(fallbackSkill), typeIndex: Math.floor(rng() * fallbackTypes.length) });
      p.skillId = fallbackSkill.id;
      out.push(p);
    }
    return opts.shuffle === false ? out : shuffle(rng, out);
  }

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
    p.answerMax = o.max;
    p.answerMin = o.min;
    if (!p.choices) {
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
    return { version: 2, lang: 'zh', sound: true, theme: 'light', stars: 0, streak: { lastDay: null, count: 0 }, badges: [], skills: {}, stageExams: {} };
  }

  /* ---------------- 進度資料的清洗與升級 ----------------
   * 所有外部來源（localStorage、家長匯入）都先經過這裡：
   * 只保留已知欄位、把數值夾到合法範圍、補上缺少的預設值。
   * v1 → v2：新增 stageExams / theme，缺少時補預設。 */
  function sanitizeProgress(input) {
    var base = newProgress();
    if (!input || typeof input !== 'object' || Array.isArray(input)) return base;
    var num = function (v, d) { return (typeof v === 'number' && isFinite(v)) ? v : d; };
    var int = function (v, d, min, max) {
      var n = Math.floor(num(v, d));
      if (n < min) n = min;
      if (max != null && n > max) n = max;
      return n;
    };
    var bool = function (v, d) { return typeof v === 'boolean' ? v : d; };
    base.lang = (input.lang === 'en' || input.lang === 'zh') ? input.lang : 'zh';
    base.sound = bool(input.sound, true);
    base.theme = (input.theme === 'dark' || input.theme === 'light' || input.theme === 'auto') ? input.theme : 'light';
    base.stars = int(input.stars, 0, 0, 1000000);
    if (input.streak && typeof input.streak === 'object') {
      base.streak.lastDay = (typeof input.streak.lastDay === 'string' || input.streak.lastDay === null) ? input.streak.lastDay : null;
      base.streak.count = int(input.streak.count, 0, 0, 100000);
    }
    if (Array.isArray(input.badges)) {
      base.badges = input.badges.filter(function (b) { return typeof b === 'string'; }).slice(0, 100);
    }
    if (input.skills && typeof input.skills === 'object' && !Array.isArray(input.skills)) {
      Object.keys(input.skills).slice(0, 500).forEach(function (id) {
        var s = input.skills[id];
        if (!s || typeof s !== 'object') return;
        var sp = {
          attempts: int(s.attempts, 0, 0, 1000000),
          correct: int(s.correct, 0, 0, 1000000),
          consecCorrect: int(s.consecCorrect, 0, 0, 100),
          consecWrong: int(s.consecWrong, 0, 0, 100),
          difficultyStep: int(s.difficultyStep, 0, 0, 20),
          lastSeen: num(s.lastSeen, 0),
          typeAcc: {},
          stars: int(s.stars, 0, 0, 3),
          mastered: bool(s.mastered, false),
          quizStars: int(s.quizStars, 0, 0, 3),
          quizBest: int(s.quizBest, 0, 0, 100),
          lastProblems: Array.isArray(s.lastProblems) ? s.lastProblems.slice(-20) : []
        };
        if (s.typeAcc && typeof s.typeAcc === 'object') {
          Object.keys(s.typeAcc).slice(0, 60).forEach(function (t) {
            var a = s.typeAcc[t];
            if (a && typeof a === 'object') sp.typeAcc[t] = { a: int(a.a, 0, 0, 1000000), c: int(a.c, 0, 0, 1000000) };
          });
        }
        base.skills[id] = sp;
      });
    }
    if (input.stageExams && typeof input.stageExams === 'object' && !Array.isArray(input.stageExams)) {
      Object.keys(input.stageExams).slice(0, 100).forEach(function (id) {
        var e = input.stageExams[id];
        if (!e || typeof e !== 'object') return;
        base.stageExams[id] = {
          passed: bool(e.passed, false) || bool(e.perfect, false),
          perfect: bool(e.perfect, false),
          best: int(e.best, 0, 0, 100)
        };
      });
    }
    base.version = 2;
    return base;
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
    var avoidSig = {}, avoidTpl = {};
    (opts.avoid || []).forEach(function (q) {
      if (!q) return;
      if (q.sig) avoidSig[q.sig] = true;
      if (q.math) avoidTpl[templateSig(q)] = true;
    });
    var p = null;
    var guard = 0;
    while (guard++ < 20) {
      p = generateProblem(skill, { rng: rng, difficultyStep: step, typeIndex: chosenIdx });
      var seenRecent = recent.some(function (r) { return r.sig === p.sig; });
      if (seenRecent || avoidSig[p.sig]) continue;
      /* 先嘗試避開整節練習用過的模板；真的沒有別的模板時才接受 */
      if (guard < 16 && avoidTpl[templateSig(p)]) continue;
      break;
    }
    return p;
  }

  /* ---------------- 導出 ---------------- */

  return {
    GENERATOR_TYPES: GENERATOR_TYPES,
    MATH_SPEC: MATH_SPEC,
    answerFromMath: answerFromMath,
    templateSig: templateSig,
    contextSig: contextSig,
    composeSet: composeSet,
    composeExam: composeExam,
    seedRandom: seedRandom,
    randInt: randInt,
    pick: pick,
    shuffle: shuffle,
    isFraction: isFraction,
    valueKey: valueKey,
    renderValue: renderValue,
    valuesEqual: valuesEqual,
    reduceFraction: reduceFraction,
    normalizeInput: normalizeInput,
    generateProblem: generateProblem,
    generateSet: generateSet,
    explain: explain,
    checkAnswer: checkAnswer,
    defaultSkillProgress: defaultSkillProgress,
    newProgress: newProgress,
    sanitizeProgress: sanitizeProgress,
    practiceStars: practiceStars,
    quizStars: quizStars,
    masteryStatus: masteryStatus,
    applyResult: applyResult,
    applyQuizResult: applyQuizResult,
    gradeQuiz: gradeQuiz,
    nextProblem: nextProblem
  };
});
