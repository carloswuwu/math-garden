/*
 * 答案推導規格（MATH_SPEC）：math.op → 期望答案。
 * 契約測試逐型驗證生成器答案與此 oracle 一致；factInt 由 ./facts.js 共用。
 */
import { factInt } from './facts.js';
import { gcdInt } from './values.js';

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
  fractiondiff: function (m) { return { n: m.a * m.d + m.sign * m.c * m.b, d: m.b * m.d }; },
  fractionmul: function (m) { return m.mode === 'mul' ? { n: m.a * m.c, d: m.b * m.d } : { n: m.a * m.d, d: m.b * m.c }; },
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
  wunitconv: function (m) { return m.value * m.factor; },
  wremainder: function (m) { return m.mode === 'left' ? m.n % m.per : Math.floor(m.n / m.per); },
  wpctchain: function (m) { return m.base * (100 + m.p1) / 100 * (100 - m.p2) / 100; },
  wthreepart: function (m) { return m.a * m.unit; },
  modpow: function (m) {
    var r = 1;
    for (var i = 0; i < m.b; i++) r = (r * m.a) % m.m;
    return r;
  },
  gcdlcm: function (m) {
    var g = gcdInt(m.a, m.b);
    return m.mode === 'gcd' ? g : (m.a / g) * m.b;
  },
  remainderSystem: function (m) {
    for (var n = 1; n <= 5000; n++) if (n % m.a === m.r1 && n % m.b === m.r2) return n;
    throw new Error('remainderSystem 無解');
  },
  pathcount: function (m) { return factInt(m.m + m.n) / (factInt(m.m) * factInt(m.n)); },
  handshake: function (m) { return m.n * (m.n - 1) / 2; },
  arrange: function (m) {
    var counts = {};
    for (var i = 0; i < m.word.length; i++) counts[m.word[i]] = (counts[m.word[i]] || 0) + 1;
    var denom = 1;
    Object.keys(counts).forEach(function (ch) { denom *= factInt(counts[ch]); });
    return factInt(m.word.length) / denom;
  },
  inclusion: function (m) {
    var l = (m.a / gcdInt(m.a, m.b)) * m.b;
    return Math.floor(m.n / m.a) + Math.floor(m.n / m.b) - Math.floor(m.n / l);
  },
  clockangle: function (m) {
    var diff = Math.abs(30 * m.h - 5.5 * m.m);
    return Math.min(diff, 360 - diff);
  },
  trapezoid: function (m) { return (m.a + m.b) * m.h / 2; },
  seqnext: function (m) {
    if (m.mode === 'triangle') return (m.n + 1) * (m.n + 2) / 2;
    if (m.mode === 'fib') return m.terms[m.terms.length - 1] + m.terms[m.terms.length - 2];
    if (m.mode === 'mixed') return m.terms[m.terms.length - 1] * 2 + m.add;
    return (m.n + 1) * (m.n + 1) + 1;
  },
  pigeon: function (m) { return m.colors * (m.k - 1) + 1; },
  workrate: function (m) { return m.a * m.b / (m.a + m.b); },
  mixture: function (m) { return (m.x * m.p1 + m.y * m.p2) / (m.x + m.y); },
  diceprob: function (m) { return { n: 6 - Math.abs(m.s - 7), d: 36 }; },
  coinprob: function (m) {
    return { n: factInt(m.n) / (factInt(m.k) * factInt(m.n - m.k)), d: Math.pow(2, m.n) };
  },
  lastdigit: function (m) {
    var r = 1;
    for (var i = 0; i < m.b; i++) r = (r * m.a) % 10;
    return r;
  },
  gridrect: function (m) {
    return (m.m * (m.m + 1) / 2) * (m.n * (m.n + 1) / 2);
  },
  polygonsum: function (m) {
    return m.mode === 'sum' ? (m.n - 2) * 180 : (m.n - 2) * 180 / m.n;
  },
  train: function (m) {
    return m.d / (m.mode === 'towards' ? m.s1 + m.s2 : m.s1 - m.s2);
  },
  dicecompare: function (m) {
    var ways = 0;
    for (var i = 1; i <= 6; i++) for (var j = 1; j <= 6; j++) if (i + j > m.k) ways++;
    return { n: ways, d: 36 };
  },
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
  approx: function (m) { return m.mode === 'range' ? m.a : m.a / 2; },
  direction: function (m) { return m.k; },
  time24: function (m) { return m.a; },
  area2: function (m) {
    if (m.mode === 'parallelogram') return m.b * m.h;
    if (m.mode === 'triangle') return m.b * m.h / 2;
    return (m.a + m.b) * m.h / 2;
  },
  volume1: function (m) { return m.l * m.w * m.h; },
  rotation: function (m) { return m.mode === 'order' ? m.n : 360 / m.n; },
  calculus2: function (m) {
    return m.mode === 'defint' ? m.a * Math.pow(m.b, m.n + 1) / (m.n + 1) : m.a * m.n * Math.pow(m.x, m.n - 1);
  },
  linalg2: function (m) { return m.mode === 'det' ? m.a * m.d - m.b * m.c : m.a * m.e + m.b * m.g; },
  fraccompare: function (m) {
    if (m.mode === 'simplify') return { n: m.n, d: m.d };
    if (m.mode === 'expand') return m.n * m.k;
    return m.n1 * m.d2 > m.n2 * m.d1 ? { n: m.n1, d: m.d1 } : { n: m.n2, d: m.d2 };
  },
  decimalmixed: function (m) { return (m.r / 10).toFixed(1); },
  rounding: function (m) {
    if (m.mode === 'round') return Math.round(m.n / m.unit) * m.unit;
    return Math.round(m.a / m.unit) * m.unit + Math.round(m.b / m.unit) * m.unit;
  },
  chartread: function (m) {
    if (m.mode === 'diff') return Math.max.apply(null, m.values) - Math.min.apply(null, m.values);
    if (m.mode === 'total') return m.values.reduce(function (x, y) { return x + y; }, 0);
    return m.values[m.values.length - 1] - m.values[0];
  },
  circleparts: function (m) { return m.mode === 'diameter' ? m.r * 2 : m.d / 2; },
  ode: function (m) { return m.y0 + m.h * m.a * m.y0; },
  numtheory: function (m) {
    if (m.mode === 'phi') {
      var count = 0;
      for (var k = 1; k <= m.n; k++) {
        var a = m.n, b = k;
        while (b) { var t = a % b; a = b; b = t; }
        if (a === 1) count++;
      }
      return count;
    }
    for (var x = 1; x < m.m; x++) if ((m.a * x) % m.m === 1) return x;
    return 1;
  },
  stats2: function (m) {
    var mean = m.nums.reduce(function (x, y) { return x + y; }, 0) / m.nums.length;
    var v = m.nums.reduce(function (x, y) { return x + (y - mean) * (y - mean); }, 0) / m.nums.length;
    return m.mode === 'variance' ? v : Math.round(Math.sqrt(v) * 1000) / 1000;
  },
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

export { MATH_SPEC, answerFromMath };
