/*
 * 課程體系：從學前到大學的學習路徑（技能樹）。
 * 每個階段(Stage)包含若干主題(Topic)，每個主題包含若干技能(Skill)。
 * Pre-K → Grade 3 為完整內容；Grade 4 → 大學為可導航的腳手架。
 *
 * 技能字段：
 *  - id / stage / order        穩定標識、所屬階段、階段內順序
 *  - zh.name / zh.goal         中文名稱 / 學習目標
 *  - en.name / en.goal         英文名稱 / 學習目標
 *  - lesson                    對應 lessons.js 中的課程鍵；腳手架為 null
 *  - types                     題目類型數組（字符串或 {t, opts}）；腳手架為 null
 *  - levels                    自適應難度層級數組；腳手架為 null
 *  - mastery.practice          練習答對多少次視為掌握
 *  - mastery.quizPass          測驗通過分數（比例）
 *  - scaffold                  是否僅為腳手架（內容待補）
 */
(function (root) {
  'use strict';

  var skills = {

    /* ===================== 學前 Pre-K ===================== */

    'prek.count': {
      id: 'prek.count', stage: 'prek', order: 1,
      zh: { name: '數一數', goal: '能一個一個地點數 1–20 個物體，說出總數。' },
      en: { name: 'Counting', goal: 'Count 1–20 objects one by one and say the total.' },
      lesson: 'prek.count',
      types: ['count'],
      levels: [{ min: 1, max: 5 }, { min: 1, max: 10 }, { min: 1, max: 20 }],
      mastery: { practice: 8, quizPass: 0.8 }
    },

    'prek.compare': {
      id: 'prek.compare', stage: 'prek', order: 2,
      zh: { name: '比大小', goal: '會比較兩堆東西的多少，知道哪組更多、哪組更少。' },
      en: { name: 'Compare Groups', goal: 'Compare two groups and tell which has more or fewer.' },
      lesson: 'prek.compare',
      types: ['comparegroup'],
      levels: [{ min: 1, max: 5 }, { min: 1, max: 10 }, { min: 1, max: 20 }],
      mastery: { practice: 8, quizPass: 0.8 }
    },

    'prek.add10': {
      id: 'prek.add10', stage: 'prek', order: 3,
      zh: { name: '10 以內的加法', goal: '會用數一數的方法做 10 以內的加法。' },
      en: { name: 'Addition within 10', goal: 'Add numbers within 10 by counting.' },
      lesson: 'prek.add10',
      types: ['addition'],
      levels: [{ max: 10 }],
      mastery: { practice: 10, quizPass: 0.8 }
    },

    'prek.sub10': {
      id: 'prek.sub10', stage: 'prek', order: 4,
      zh: { name: '10 以內的減法', goal: '會用拿走的方法做 10 以內的減法。' },
      en: { name: 'Subtraction within 10', goal: 'Subtract within 10 by taking away.' },
      lesson: 'prek.sub10',
      types: ['subtraction'],
      levels: [{ max: 10 }],
      mastery: { practice: 10, quizPass: 0.8 }
    },

    'prek.bonds10': {
      id: 'prek.bonds10', stage: 'prek', order: 5,
      zh: { name: '數的分解', goal: '知道一個數可以分成幾和幾（如 7 = 3 + 4）。' },
      en: { name: 'Number Bonds', goal: 'Know how a number splits into two parts (e.g. 7 = 3 + 4).' },
      lesson: 'prek.bonds10',
      types: ['numberbonds'],
      levels: [{ max: 10 }],
      mastery: { practice: 10, quizPass: 0.8 }
    },

    /* ===================== 一年級 Grade 1 ===================== */

    'g1.add20': {
      id: 'g1.add20', stage: 'g1', order: 1,
      zh: { name: '20 以內的加法', goal: '會用「湊十法」計算 20 以內的加法。' },
      en: { name: 'Addition within 20', goal: 'Add within 20 using make-ten.' },
      lesson: 'g1.add20',
      types: ['addition', 'numberbonds'],
      levels: [{ max: 10 }, { max: 20 }],
      mastery: { practice: 10, quizPass: 0.8 }
    },

    'g1.sub20': {
      id: 'g1.sub20', stage: 'g1', order: 2,
      zh: { name: '20 以內的減法', goal: '會計算 20 以內的減法，並會用減法想加法。' },
      en: { name: 'Subtraction within 20', goal: 'Subtract within 20 and use addition to check.' },
      lesson: 'g1.sub20',
      types: ['subtraction', 'missing'],
      levels: [{ max: 10 }, { max: 20 }],
      mastery: { practice: 10, quizPass: 0.8 }
    },

    'g1.place100': {
      id: 'g1.place100', stage: 'g1', order: 3,
      zh: { name: '100 以內的數', goal: '會比較 100 以內數的大小，認識十位和個位。' },
      en: { name: 'Numbers within 100', goal: 'Compare numbers within 100 and understand tens and ones.' },
      lesson: 'g1.place100',
      types: ['compare'],
      levels: [{ min: 1, max: 20 }, { min: 1, max: 100 }],
      mastery: { practice: 10, quizPass: 0.8 }
    },

    'g1.addsub100': {
      id: 'g1.addsub100', stage: 'g1', order: 4,
      zh: { name: '100 以內的加減', goal: '會做 100 以內整十數、不進位的加減法。' },
      en: { name: 'Add & Subtract within 100', goal: 'Add and subtract within 100 (no regrouping).' },
      lesson: 'g1.addsub100',
      types: ['addition', 'subtraction'],
      levels: [{ max: 20 }, { max: 100 }],
      mastery: { practice: 10, quizPass: 0.8 }
    },

    'g1.word': {
      id: 'g1.word', stage: 'g1', order: 5,
      zh: { name: '簡單應用題', goal: '會讀題，判斷用加法還是減法解決問題。' },
      en: { name: 'Word Problems', goal: 'Read problems and decide to add or subtract.' },
      lesson: 'g1.word',
      types: ['word'],
      levels: [{ ops: ['add', 'sub'], max: 20 }],
      mastery: { practice: 10, quizPass: 0.8 }
    },

    /* ===================== 二年級 Grade 2 ===================== */

    'g2.addsub100r': {
      id: 'g2.addsub100r', stage: 'g2', order: 1,
      zh: { name: '100 以內加減（進退位）', goal: '會做需要進位、退位的 100 以內加減法。' },
      en: { name: 'Add & Subtract with Regrouping', goal: 'Add and subtract within 100 with regrouping.' },
      lesson: 'g2.addsub100r',
      types: ['addition', 'subtraction'],
      levels: [{ max: 50 }, { max: 100 }],
      mastery: { practice: 12, quizPass: 0.8 }
    },

    'g2.mul25': {
      id: 'g2.mul25', stage: 'g2', order: 2,
      zh: { name: '乘法：2、5、10', goal: '理解乘法是「幾個幾相加」，背熟 2、5、10 的乘法口訣。' },
      en: { name: 'Multiplication: 2, 5, 10', goal: 'Understand multiplication as groups; learn the 2, 5, 10 tables.' },
      lesson: 'g2.mul25',
      types: [{ t: 'multiplication', opts: { table: 2 } }, { t: 'multiplication', opts: { table: 5 } }, { t: 'multiplication', opts: { table: 10 } }],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },

    'g2.mul34': {
      id: 'g2.mul34', stage: 'g2', order: 3,
      zh: { name: '乘法：3、4', goal: '背熟 3 和 4 的乘法口訣，並會做簡單乘法。' },
      en: { name: 'Multiplication: 3, 4', goal: 'Learn the 3 and 4 times tables.' },
      lesson: 'g2.mul34',
      types: [{ t: 'multiplication', opts: { table: 3 } }, { t: 'multiplication', opts: { table: 4 } }],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },

    'g2.div': {
      id: 'g2.div', stage: 'g2', order: 4,
      zh: { name: '簡單除法', goal: '理解除法是「平均分」，會做表內除法。' },
      en: { name: 'Simple Division', goal: 'Understand division as sharing equally; divide within tables.' },
      lesson: 'g2.div',
      types: ['division'],
      levels: [{ maxDivisor: 5, maxQuotient: 5 }, { maxDivisor: 9, maxQuotient: 9 }],
      mastery: { practice: 12, quizPass: 0.8 }
    },

    'g2.word': {
      id: 'g2.word', stage: 'g2', order: 5,
      zh: { name: '加減乘應用題', goal: '會判斷題目用加、減還是乘法解決。' },
      en: { name: 'Word Problems', goal: 'Decide whether to add, subtract, or multiply.' },
      lesson: 'g2.word',
      types: ['word'],
      levels: [{ ops: ['add', 'sub', 'mul'], max: 20, maxFactor: 9 }],
      mastery: { practice: 12, quizPass: 0.8 }
    },

    /* ===================== 三年級 Grade 3 ===================== */

    'g3.multable': {
      id: 'g3.multable', stage: 'g3', order: 1,
      zh: { name: '乘法表：6、7、8、9', goal: '背熟 6、7、8、9 的乘法口訣，能快速口算。' },
      en: { name: 'Times Tables: 6, 7, 8, 9', goal: 'Master the 6, 7, 8, 9 tables.' },
      lesson: 'g3.multable',
      types: [{ t: 'multiplication', opts: { table: 6 } }, { t: 'multiplication', opts: { table: 7 } }, { t: 'multiplication', opts: { table: 8 } }, { t: 'multiplication', opts: { table: 9 } }],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },

    'g3.mulfree': {
      id: 'g3.mulfree', stage: 'g3', order: 2,
      zh: { name: '混合乘法', goal: '能不靠口訣表，熟練計算任意兩位數以內的乘法。' },
      en: { name: 'Mixed Multiplication', goal: 'Multiply any single-digit factors fluently.' },
      lesson: 'g3.mulfree',
      types: ['multiplication'],
      levels: [{ maxFactor: 9 }],
      mastery: { practice: 12, quizPass: 0.8 }
    },

    'g3.addsubbig': {
      id: 'g3.addsubbig', stage: 'g3', order: 3,
      zh: { name: '多位數加減', goal: '會做三位數的加減法，並用豎式計算。' },
      en: { name: 'Multi-digit Add & Subtract', goal: 'Add and subtract three-digit numbers.' },
      lesson: 'g3.addsubbig',
      types: ['addition', 'subtraction'],
      levels: [{ max: 100 }, { max: 1000 }],
      mastery: { practice: 12, quizPass: 0.8 }
    },

    'g3.muldiv': {
      id: 'g3.muldiv', stage: 'g3', order: 4,
      zh: { name: '乘除混合', goal: '能熟練完成表內乘除法的混合運算。' },
      en: { name: 'Multiply & Divide', goal: 'Multiply and divide fluently within the tables.' },
      lesson: 'g3.muldiv',
      types: ['multiplication', 'division'],
      levels: [{ maxFactor: 9, maxDivisor: 9, maxQuotient: 9 }],
      mastery: { practice: 12, quizPass: 0.8 }
    },

    'g3.fraction': {
      id: 'g3.fraction', stage: 'g3', order: 5,
      zh: { name: '分數入門', goal: '認識分數，知道幾分之一表示把一個整體平均分成幾份。' },
      en: { name: 'Intro to Fractions', goal: 'Understand fractions as equal parts of a whole.' },
      lesson: 'g3.fraction',
      types: ['fraction'],
      levels: [{ minDen: 2, maxDen: 4 }, { minDen: 2, maxDen: 8 }],
      mastery: { practice: 12, quizPass: 0.8 }
    },

    'g3.word': {
      id: 'g3.word', stage: 'g3', order: 6,
      zh: { name: '綜合應用題', goal: '能分析兩步以內的實際問題，選擇正確的運算。' },
      en: { name: 'Mixed Word Problems', goal: 'Solve one- and two-step real-world problems.' },
      lesson: 'g3.word',
      types: ['word'],
      levels: [{ ops: ['add', 'sub', 'mul'], max: 100, maxFactor: 9 }],
      mastery: { practice: 12, quizPass: 0.8 }
    },

    /* ===================== 四年級 小四 ===================== */

    'g4.multidigit': {
      id: 'g4.multidigit', stage: 'g4', order: 1,
      zh: { name: '多位數乘除', goal: '會做兩位數乘一位數、多位數除以一位數的計算。' },
      en: { name: 'Multi-digit Multiply & Divide', goal: 'Multiply 2-digit by 1-digit and divide multi-digit by 1-digit.' },
      lesson: 'g4.multidigit',
      types: ['multidigit'],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },

    'g4.fractionadd': {
      id: 'g4.fractionadd', stage: 'g4', order: 2,
      zh: { name: '同分母分數加減', goal: '會做分母相同的分數加法和減法。' },
      en: { name: 'Adding & Subtracting Fractions', goal: 'Add and subtract fractions with the same denominator.' },
      lesson: 'g4.fractionadd',
      types: ['fractionadd'],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },

    'g4.decimal': {
      id: 'g4.decimal', stage: 'g4', order: 3,
      zh: { name: '小數加減', goal: '認識一位小數，並會做小數的加法和減法。' },
      en: { name: 'Decimal Addition & Subtraction', goal: 'Add and subtract one-place decimals.' },
      lesson: 'g4.decimal',
      types: ['decimal'],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },

    'g4.area': {
      id: 'g4.area', stage: 'g4', order: 4,
      zh: { name: '長方形面積與周長', goal: '會計算長方形的面積和周長。' },
      en: { name: 'Area & Perimeter', goal: 'Find the area and perimeter of rectangles.' },
      lesson: 'g4.area',
      types: ['area'],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },

    /* ===================== 五年級 小五 ===================== */

    'g5.decimalmul': {
      id: 'g5.decimalmul', stage: 'g5', order: 1,
      zh: { name: '小數乘除', goal: '會做小數乘整數、小數除以整數的計算。' },
      en: { name: 'Decimal Multiply & Divide', goal: 'Multiply and divide decimals by whole numbers.' },
      lesson: 'g5.decimalmul',
      types: ['decimalmul'],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },

    'g5.average': {
      id: 'g5.average', stage: 'g5', order: 2,
      zh: { name: '平均數', goal: '會求一組數的平均數。' },
      en: { name: 'Averages', goal: 'Find the average of a set of numbers.' },
      lesson: 'g5.average',
      types: ['average'],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },

    'g5.fractionof': {
      id: 'g5.fractionof', stage: 'g5', order: 3,
      zh: { name: '求一個數的幾分之幾', goal: '會求一個數的幾分之幾是多少。' },
      en: { name: 'Fraction of a Number', goal: 'Find a fraction of a whole number.' },
      lesson: 'g5.fractionof',
      types: ['fractionof'],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },

    /* ===================== 六年級 小六 ===================== */

    'g6.equation': {
      id: 'g6.equation', stage: 'g6', order: 1,
      zh: { name: '簡易方程', goal: '會解一元一次方程，求出未知數 x。' },
      en: { name: 'Simple Equations', goal: 'Solve one-variable equations to find x.' },
      lesson: 'g6.equation',
      types: ['equation'],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },

    'g6.percent': {
      id: 'g6.percent', stage: 'g6', order: 2,
      zh: { name: '百分數', goal: '會求一個數的百分之幾，以及求百分率。' },
      en: { name: 'Percentages', goal: 'Find a percent of a number, and find what percent one is of another.' },
      lesson: 'g6.percent',
      types: ['percent'],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },

    'g6.ratio': {
      id: 'g6.ratio', stage: 'g6', order: 3,
      zh: { name: '比與比例', goal: '會按比分配，並求比例中的未知數。' },
      en: { name: 'Ratio & Proportion', goal: 'Use ratios to find unknown values.' },
      lesson: 'g6.ratio',
      types: ['ratio'],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },

    /* ===================== 中一（S1） ===================== */

    'ms.s1.directed': {
      id: 'ms.s1.directed', stage: 'ms1', order: 1,
      zh: { name: '有向數', goal: '會做正負數的加、減、乘、除。' },
      en: { name: 'Directed Numbers', goal: 'Add, subtract, multiply and divide positive and negative numbers.' },
      lesson: 'ms.s1.directed',
      types: ['directed'],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    'ms.s1.exprsub': {
      id: 'ms.s1.exprsub', stage: 'ms1', order: 2,
      zh: { name: '代數式求值', goal: '會把已知數代入代數式求值。' },
      en: { name: 'Substitution', goal: 'Evaluate an algebraic expression for a given value.' },
      lesson: 'ms.s1.exprsub',
      types: ['exprsub'],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    'ms.s1.linear': {
      id: 'ms.s1.linear', stage: 'ms1', order: 3,
      zh: { name: '一元一次方程', goal: '會解兩步的一元一次方程。' },
      en: { name: 'Linear Equations', goal: 'Solve one-variable linear equations in two steps.' },
      lesson: 'ms.s1.linear',
      types: ['linear'],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },

    /* ===================== 中二（S2） ===================== */

    'ms.s2.pythagoras': {
      id: 'ms.s2.pythagoras', stage: 'ms2', order: 1,
      zh: { name: '畢氏定理', goal: '會用畢氏定理求直角三角形的邊長。' },
      en: { name: 'Pythagoras Theorem', goal: 'Use Pythagoras to find sides of a right triangle.' },
      lesson: 'ms.s2.pythagoras',
      types: ['pythagoras'],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    'ms.s2.simul': {
      id: 'ms.s2.simul', stage: 'ms2', order: 2,
      zh: { name: '聯立方程', goal: '會解簡單的二元一次方程組。' },
      en: { name: 'Simultaneous Equations', goal: 'Solve simple simultaneous linear equations.' },
      lesson: 'ms.s2.simul',
      types: ['simul'],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },

    /* ===================== 中三（S3） ===================== */

    'ms.s3.indices': {
      id: 'ms.s3.indices', stage: 'ms3', order: 1,
      zh: { name: '指數定律', goal: '會用指數定律計算乘方與同底數相乘。' },
      en: { name: 'Laws of Indices', goal: 'Use index laws to evaluate powers and same-base products.' },
      lesson: 'ms.s3.indices',
      types: ['indices'],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    'ms.s3.inequality': {
      id: 'ms.s3.inequality', stage: 'ms3', order: 2,
      zh: { name: '一元一次不等式', goal: '會解簡單的一元一次不等式。' },
      en: { name: 'Linear Inequalities', goal: 'Solve simple linear inequalities in one variable.' },
      lesson: 'ms.s3.inequality',
      types: ['inequality'],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },

    /* ===================== 中四（S4） ===================== */

    'hs.s4.log': {
      id: 'hs.s4.log', stage: 'hs1', order: 1,
      zh: { name: '對數', goal: '會求簡單的對數值。' },
      en: { name: 'Logarithms', goal: 'Evaluate simple logarithms.' },
      lesson: 'hs.s4.log',
      types: ['log'],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    'hs.s4.fx': {
      id: 'hs.s4.fx', stage: 'hs1', order: 2,
      zh: { name: '函數求值', goal: '會代入二次函數求值。' },
      en: { name: 'Function Values', goal: 'Evaluate a quadratic function.' },
      lesson: 'hs.s4.fx',
      types: ['fx'],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    'hs.s4.trig': {
      id: 'hs.s4.trig', stage: 'hs1', order: 3,
      zh: { name: '三角比', goal: '會用 sin、cos、tan 求直角三角形的比。' },
      en: { name: 'Trigonometric Ratios', goal: 'Use sin, cos, tan in right triangles.' },
      lesson: 'hs.s4.trig',
      types: ['trig'],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },

    /* ===================== 中五（S5） ===================== */

    'hs.s5.ap': {
      id: 'hs.s5.ap', stage: 'hs2', order: 1,
      zh: { name: '等差數列', goal: '會求等差數列的第 n 項。' },
      en: { name: 'Arithmetic Sequences', goal: 'Find the nth term of an arithmetic sequence.' },
      lesson: 'hs.s5.ap',
      types: ['ap'],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    'hs.s5.gp': {
      id: 'hs.s5.gp', stage: 'hs2', order: 2,
      zh: { name: '等比數列', goal: '會求等比數列的第 n 項。' },
      en: { name: 'Geometric Sequences', goal: 'Find the nth term of a geometric sequence.' },
      lesson: 'hs.s5.gp',
      types: ['gp'],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    'hs.s5.prob': {
      id: 'hs.s5.prob', stage: 'hs2', order: 3,
      zh: { name: '概率', goal: '會求簡單事件的概率。' },
      en: { name: 'Probability', goal: 'Find the probability of simple events.' },
      lesson: 'hs.s5.prob',
      types: ['prob'],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },

    /* ===================== 中六（S6） ===================== */

    'hs.s6.quad': {
      id: 'hs.s6.quad', stage: 'hs3', order: 1,
      zh: { name: '二次方程的根', goal: '會用根與係數的關係求兩根之和或積。' },
      en: { name: 'Roots of Quadratics', goal: 'Use sum/product of roots.' },
      lesson: 'hs.s6.quad',
      types: ['quad'],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    'hs.s6.stats': {
      id: 'hs.s6.stats', stage: 'hs3', order: 2,
      zh: { name: '中位數', goal: '會求一組數據的中位數。' },
      en: { name: 'Median', goal: 'Find the median of a data set.' },
      lesson: 'hs.s6.stats',
      types: ['stats'],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },

    'col.calculus': {
      id: 'col.calculus', stage: 'college', order: 1, scaffold: true,
      zh: { name: '微積分', goal: '導數與積分。' },
      en: { name: 'Calculus', goal: 'Derivatives and integrals.' },
      lesson: null, types: null, levels: null, mastery: { practice: 12, quizPass: 0.8 }
    },
    'col.linalg': {
      id: 'col.linalg', stage: 'college', order: 2, scaffold: true,
      zh: { name: '線性代數', goal: '矩陣與線性方程組。' },
      en: { name: 'Linear Algebra', goal: 'Matrices and linear systems.' },
      lesson: null, types: null, levels: null, mastery: { practice: 12, quizPass: 0.8 }
    },
    'col.prob': {
      id: 'col.prob', stage: 'college', order: 3, scaffold: true,
      zh: { name: '概率與統計', goal: '概率、分布與統計推斷。' },
      en: { name: 'Probability & Statistics', goal: 'Probability, distributions, and inference.' },
      lesson: null, types: null, levels: null, mastery: { practice: 12, quizPass: 0.8 }
    },

    /* ===================== 幾何、座標、應用題（補充） ===================== */

    'prek.word': {
      id: 'prek.word', stage: 'prek', order: 6,
      zh: { name: '應用題', goal: '會讀簡單的應用題，用加減解決。' },
      en: { name: 'Word Problems', goal: 'Solve simple word problems with + and −.' },
      lesson: 'generic.word', types: ['word'], levels: [{ ops: ['add', 'sub'], max: 10 }],
      mastery: { practice: 8, quizPass: 0.8 }
    },
    'g4.triangle': {
      id: 'g4.triangle', stage: 'g4', order: 5,
      zh: { name: '三角形面積', goal: '會用底 × 高 ÷ 2 計算三角形面積。' },
      en: { name: 'Triangle Area', goal: 'Find the area of a triangle.' },
      lesson: 'g4.triangle', types: ['triangle'], levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    'g4.word': {
      id: 'g4.word', stage: 'g4', order: 6,
      zh: { name: '應用題', goal: '會用加減乘和面積解決應用題。' },
      en: { name: 'Word Problems', goal: 'Solve word problems with +, −, × and area.' },
      lesson: 'generic.word', types: ['word'], levels: [{ ops: ['add', 'sub', 'mul', 'area'], max: 100, maxFactor: 9 }],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    'g5.word': {
      id: 'g5.word', stage: 'g5', order: 4,
      zh: { name: '應用題', goal: '會解決較複雜的應用題。' },
      en: { name: 'Word Problems', goal: 'Solve more complex word problems.' },
      lesson: 'generic.word', types: ['word'], levels: [{ ops: ['add', 'sub', 'mul', 'area'], max: 1000, maxFactor: 9 }],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    'g6.circle': {
      id: 'g6.circle', stage: 'g6', order: 4,
      zh: { name: '圓的周長與面積', goal: '會計算圓的周長和面積（以 π 表示）。' },
      en: { name: 'Circles', goal: 'Find circumference and area of a circle (in π).' },
      lesson: 'g6.circle', types: ['circle'], levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    'g6.volume': {
      id: 'g6.volume', stage: 'g6', order: 5,
      zh: { name: '立體圖形的體積', goal: '會計算長方體的體積。' },
      en: { name: 'Volume of Cuboids', goal: 'Find the volume of a cuboid.' },
      lesson: 'g6.volume', types: ['volume'], levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    'g6.word': {
      id: 'g6.word', stage: 'g6', order: 6,
      zh: { name: '應用題', goal: '會綜合運用所學解決應用題。' },
      en: { name: 'Word Problems', goal: 'Solve mixed word problems.' },
      lesson: 'generic.word', types: ['word'], levels: [{ ops: ['add', 'sub', 'mul', 'area'], max: 1000, maxFactor: 9 }],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    'ms.s1.coord': {
      id: 'ms.s1.coord', stage: 'ms1', order: 4,
      zh: { name: '座標', goal: '會求兩點的距離和中點。' },
      en: { name: 'Coordinates', goal: 'Find distance and midpoint of two points.' },
      lesson: 'ms.s1.coord', types: ['coord'], levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    'ms.s1.word': {
      id: 'ms.s1.word', stage: 'ms1', order: 5,
      zh: { name: '應用題', goal: '會用數學解決應用題。' },
      en: { name: 'Word Problems', goal: 'Solve word problems.' },
      lesson: 'generic.word', types: ['word'], levels: [{ ops: ['add', 'sub', 'mul', 'area'], max: 1000, maxFactor: 9 }],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    'ms.s2.word': {
      id: 'ms.s2.word', stage: 'ms2', order: 3,
      zh: { name: '應用題', goal: '會解決應用題。' },
      en: { name: 'Word Problems', goal: 'Solve word problems.' },
      lesson: 'generic.word', types: ['word'], levels: [{ ops: ['add', 'sub', 'mul', 'area'], max: 1000, maxFactor: 9 }],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    'ms.s3.word': {
      id: 'ms.s3.word', stage: 'ms3', order: 3,
      zh: { name: '應用題', goal: '會解決應用題。' },
      en: { name: 'Word Problems', goal: 'Solve word problems.' },
      lesson: 'generic.word', types: ['word'], levels: [{ ops: ['add', 'sub', 'mul', 'area'], max: 1000, maxFactor: 9 }],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    'hs.s4.word': {
      id: 'hs.s4.word', stage: 'hs1', order: 4,
      zh: { name: '應用題', goal: '會解決應用題。' },
      en: { name: 'Word Problems', goal: 'Solve word problems.' },
      lesson: 'generic.word', types: ['word'], levels: [{ ops: ['add', 'sub', 'mul', 'area'], max: 1000, maxFactor: 9 }],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    'hs.s5.word': {
      id: 'hs.s5.word', stage: 'hs2', order: 4,
      zh: { name: '應用題', goal: '會解決應用題。' },
      en: { name: 'Word Problems', goal: 'Solve word problems.' },
      lesson: 'generic.word', types: ['word'], levels: [{ ops: ['add', 'sub', 'mul', 'area'], max: 1000, maxFactor: 9 }],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    'hs.s6.word': {
      id: 'hs.s6.word', stage: 'hs3', order: 3,
      zh: { name: '應用題', goal: '會解決應用題。' },
      en: { name: 'Word Problems', goal: 'Solve word problems.' },
      lesson: 'generic.word', types: ['word'], levels: [{ ops: ['add', 'sub', 'mul', 'area'], max: 1000, maxFactor: 9 }],
      mastery: { practice: 12, quizPass: 0.8 }
    }
  };

  var stages = [
    { id: 'prek', zh: '學前', en: 'Pre-K', desc: { zh: '數數、比大小、10 以內的加減', en: 'Counting, comparing, and adding/subtracting within 10' }, color: '#34C759', emoji: '🌱',
      topics: [
        { id: 'prek.num', zh: '認識數字', en: 'Numbers', skills: ['prek.count', 'prek.compare'] },
        { id: 'prek.calc', zh: '加減啟蒙', en: 'First Addition', skills: ['prek.add10', 'prek.sub10', 'prek.bonds10', 'prek.word'] }
      ] },
    { id: 'g1', zh: '小一', en: 'Primary 1', desc: { zh: '20 以內加減、100 以內的數', en: 'Add/subtract within 20, numbers within 100' }, color: '#FF9500', emoji: '☀️',
      topics: [
        { id: 'g1.calc', zh: '加減運算', en: 'Add & Subtract', skills: ['g1.add20', 'g1.sub20'] },
        { id: 'g1.num', zh: '更大的數', en: 'Bigger Numbers', skills: ['g1.place100', 'g1.addsub100'] },
        { id: 'g1.word', zh: '解決問題', en: 'Word Problems', skills: ['g1.word'] }
      ] },
    { id: 'g2', zh: '小二', en: 'Primary 2', desc: { zh: '100 以內進退位、乘法啟蒙', en: 'Regrouping within 100, intro to multiplication' }, color: '#007AFF', emoji: '🌈',
      topics: [
        { id: 'g2.calc', zh: '進退位加減', en: 'Add & Subtract', skills: ['g2.addsub100r'] },
        { id: 'g2.mul', zh: '乘法啟蒙', en: 'Multiplication', skills: ['g2.mul25', 'g2.mul34'] },
        { id: 'g2.div', zh: '除法', en: 'Division', skills: ['g2.div', 'g2.word'] }
      ] },
    { id: 'g3', zh: '小三', en: 'Primary 3', desc: { zh: '乘法表、多位數、分數入門', en: 'Times tables, multi-digit, intro to fractions' }, color: '#AF52DE', emoji: '🚀',
      topics: [
        { id: 'g3.mul', zh: '乘法表', en: 'Times Tables', skills: ['g3.multable', 'g3.mulfree'] },
        { id: 'g3.calc', zh: '多位數與乘除', en: 'Big Numbers', skills: ['g3.addsubbig', 'g3.muldiv'] },
        { id: 'g3.frac', zh: '分數', en: 'Fractions', skills: ['g3.fraction', 'g3.word'] }
      ] },
    { id: 'g4', zh: '小四', en: 'Primary 4', desc: { zh: '多位數乘除、分數、小數、面積', en: 'Multi-digit, fractions, decimals, area' }, color: '#5AC8FA', emoji: '🧭',
      topics: [
        { id: 'g4.num', zh: '數與運算', en: 'Numbers & Operations', skills: ['g4.multidigit', 'g4.fractionadd', 'g4.decimal'] },
        { id: 'g4.geo', zh: '度量', en: 'Measurement', skills: ['g4.area', 'g4.triangle'] },
        { id: 'g4.word', zh: '解決問題', en: 'Word Problems', skills: ['g4.word'] }
      ] },
    { id: 'g5', zh: '小五', en: 'Primary 5', desc: { zh: '小數乘除、平均數、分數乘法', en: 'Decimal ×/÷, averages, fraction of a number' }, color: '#5856D6', emoji: '⛰️',
      topics: [
        { id: 'g5.num', zh: '數與運算', en: 'Numbers & Operations', skills: ['g5.decimalmul', 'g5.fractionof'] },
        { id: 'g5.data', zh: '數據處理', en: 'Data Handling', skills: ['g5.average'] },
        { id: 'g5.word', zh: '解決問題', en: 'Word Problems', skills: ['g5.word'] }
      ] },
    { id: 'g6', zh: '小六', en: 'Primary 6', desc: { zh: '方程、百分數、比與比例', en: 'Equations, percentages, ratio' }, color: '#FF2D55', emoji: '🏆',
      topics: [
        { id: 'g6.alg', zh: '代數', en: 'Algebra', skills: ['g6.equation'] },
        { id: 'g6.num', zh: '數與比例', en: 'Numbers & Ratio', skills: ['g6.percent', 'g6.ratio'] },
        { id: 'g6.geo', zh: '度量', en: 'Measurement', skills: ['g6.circle', 'g6.volume'] },
        { id: 'g6.word', zh: '解決問題', en: 'Word Problems', skills: ['g6.word'] }
      ] },
    { id: 'ms1', zh: '中一', en: 'S1', desc: { zh: '有向數、代數式求值、一元一次方程', en: 'Directed numbers, substitution, linear equations' }, color: '#FF3B30', emoji: '🎓',
      topics: [
        { id: 'ms1.num', zh: '數與代數', en: 'Number & Algebra', skills: ['ms.s1.directed', 'ms.s1.exprsub', 'ms.s1.linear'] },
        { id: 'ms1.geo', zh: '圖形與空間', en: 'Shape & Space', skills: ['ms.s1.coord'] },
        { id: 'ms1.word', zh: '解決問題', en: 'Word Problems', skills: ['ms.s1.word'] }
      ] },
    { id: 'ms2', zh: '中二', en: 'S2', desc: { zh: '畢氏定理、聯立方程', en: 'Pythagoras, simultaneous equations' }, color: '#FF6B35', emoji: '📐',
      topics: [
        { id: 'ms2.geo', zh: '圖形與空間', en: 'Shape & Space', skills: ['ms.s2.pythagoras'] },
        { id: 'ms2.alg', zh: '代數', en: 'Algebra', skills: ['ms.s2.simul'] },
        { id: 'ms2.word', zh: '解決問題', en: 'Word Problems', skills: ['ms.s2.word'] }
      ] },
    { id: 'ms3', zh: '中三', en: 'S3', desc: { zh: '指數定律、一元一次不等式', en: 'Laws of indices, linear inequalities' }, color: '#FF8C42', emoji: '🧮',
      topics: [
        { id: 'ms3.num', zh: '數與代數', en: 'Number & Algebra', skills: ['ms.s3.indices', 'ms.s3.inequality'] },
        { id: 'ms3.word', zh: '解決問題', en: 'Word Problems', skills: ['ms.s3.word'] }
      ] },
    { id: 'hs1', zh: '中四', en: 'S4', desc: { zh: '對數、函數求值、三角比', en: 'Logarithms, function values, trigonometric ratios' }, color: '#A2845E', emoji: '🧠',
      topics: [
        { id: 'hs1.num', zh: '數與代數', en: 'Number & Algebra', skills: ['hs.s4.log', 'hs.s4.fx'] },
        { id: 'hs1.trig', zh: '三角學', en: 'Trigonometry', skills: ['hs.s4.trig'] },
        { id: 'hs1.word', zh: '解決問題', en: 'Word Problems', skills: ['hs.s4.word'] }
      ] },
    { id: 'hs2', zh: '中五', en: 'S5', desc: { zh: '等差、等比數列、概率', en: 'Arithmetic and geometric sequences, probability' }, color: '#8B6F47', emoji: '📈',
      topics: [
        { id: 'hs2.seq', zh: '數列', en: 'Sequences', skills: ['hs.s5.ap', 'hs.s5.gp'] },
        { id: 'hs2.prob', zh: '概率', en: 'Probability', skills: ['hs.s5.prob'] },
        { id: 'hs2.word', zh: '解決問題', en: 'Word Problems', skills: ['hs.s5.word'] }
      ] },
    { id: 'hs3', zh: '中六', en: 'S6', desc: { zh: '二次方程的根、中位數', en: 'Roots of quadratics, median' }, color: '#7A5F3C', emoji: '📊',
      topics: [
        { id: 'hs3.alg', zh: '代數', en: 'Algebra', skills: ['hs.s6.quad'] },
        { id: 'hs3.stats', zh: '統計', en: 'Statistics', skills: ['hs.s6.stats'] },
        { id: 'hs3.word', zh: '解決問題', en: 'Word Problems', skills: ['hs.s6.word'] }
      ] },
    { id: 'college', zh: '大學', en: 'University', desc: { zh: '微積分、線性代數、概率統計', en: 'Calculus, linear algebra, statistics' }, color: '#8E8E93', emoji: '🎯',
      topics: [
        { id: 'col.calc', zh: '微積分', en: 'Calculus', skills: ['col.calculus'] },
        { id: 'col.lin', zh: '線性代數', en: 'Linear Algebra', skills: ['col.linalg'] },
        { id: 'col.prob', zh: '概率統計', en: 'Statistics', skills: ['col.prob'] }
      ] }
  ];

  root.Curriculum = { stages: stages, skills: skills };
})(typeof window !== 'undefined' ? window : globalThis);
