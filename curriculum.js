/* 由 tools/build.js 從 src/data/curriculum.js 生成 —— 請勿手改；改 src/data/curriculum.js 後重新 npm run build。 */
(() => {
  // src/data/curriculum.js
  var skills = {
    /* ===================== 學前 Pre-K ===================== */
    "prek.count": {
      id: "prek.count",
      stage: "prek",
      order: 1,
      zh: { name: "數一數", goal: "能一個一個地點數 1–20 個物體，說出總數。" },
      en: { name: "Counting", goal: "Count 1–20 objects one by one and say the total." },
      lesson: "prek.count",
      types: ["count"],
      levels: [{ min: 1, max: 5 }, { min: 1, max: 10 }, { min: 1, max: 20 }],
      mastery: { practice: 8, quizPass: 0.8 }
    },
    "prek.compare": {
      id: "prek.compare",
      stage: "prek",
      order: 2,
      zh: { name: "比大小", goal: "會比較兩堆東西的多少，知道哪組更多、哪組更少。" },
      en: { name: "Compare Groups", goal: "Compare two groups and tell which has more or fewer." },
      lesson: "prek.compare",
      types: ["comparegroup"],
      levels: [{ min: 1, max: 5 }, { min: 1, max: 10 }, { min: 1, max: 20 }],
      mastery: { practice: 8, quizPass: 0.8 }
    },
    "prek.add10": {
      id: "prek.add10",
      stage: "prek",
      order: 3,
      zh: { name: "10 以內的加法", goal: "會用數一數的方法做 10 以內的加法。" },
      en: { name: "Addition within 10", goal: "Add numbers within 10 by counting." },
      lesson: "prek.add10",
      types: ["addition"],
      levels: [{ max: 10 }],
      mastery: { practice: 10, quizPass: 0.8 }
    },
    "prek.sub10": {
      id: "prek.sub10",
      stage: "prek",
      order: 4,
      zh: { name: "10 以內的減法", goal: "會用拿走的方法做 10 以內的減法。" },
      en: { name: "Subtraction within 10", goal: "Subtract within 10 by taking away." },
      lesson: "prek.sub10",
      types: ["subtraction"],
      levels: [{ max: 10 }],
      mastery: { practice: 10, quizPass: 0.8 }
    },
    "prek.bonds10": {
      id: "prek.bonds10",
      stage: "prek",
      order: 5,
      zh: { name: "數的分解", goal: "知道一個數可以分成幾和幾（如 7 = 3 + 4）。" },
      en: { name: "Number Bonds", goal: "Know how a number splits into two parts (e.g. 7 = 3 + 4)." },
      lesson: "prek.bonds10",
      types: ["numberbonds"],
      levels: [{ max: 10 }],
      mastery: { practice: 10, quizPass: 0.8 }
    },
    /* ===================== 一年級 Grade 1 ===================== */
    "g1.add20": {
      id: "g1.add20",
      stage: "g1",
      order: 1,
      zh: { name: "20 以內的加法", goal: "會用「湊十法」計算 20 以內的加法。" },
      en: { name: "Addition within 20", goal: "Add within 20 using make-ten." },
      lesson: "g1.add20",
      types: ["addition", "numberbonds"],
      levels: [{ max: 10 }, { max: 20 }],
      mastery: { practice: 10, quizPass: 0.8 }
    },
    "g1.sub20": {
      id: "g1.sub20",
      stage: "g1",
      order: 2,
      zh: { name: "20 以內的減法", goal: "會計算 20 以內的減法，並會用減法想加法。" },
      en: { name: "Subtraction within 20", goal: "Subtract within 20 and use addition to check." },
      lesson: "g1.sub20",
      types: ["subtraction", "missing"],
      levels: [{ max: 10 }, { max: 20 }],
      mastery: { practice: 10, quizPass: 0.8 }
    },
    "g1.place100": {
      id: "g1.place100",
      stage: "g1",
      order: 3,
      zh: { name: "100 以內的數", goal: "會比較 100 以內數的大小，認識十位和個位。" },
      en: { name: "Numbers within 100", goal: "Compare numbers within 100 and understand tens and ones." },
      lesson: "g1.place100",
      types: ["compare", "placevalue"],
      levels: [{ min: 1, max: 20 }, { min: 1, max: 100 }],
      mastery: { practice: 10, quizPass: 0.8 }
    },
    "g1.addsub100": {
      id: "g1.addsub100",
      stage: "g1",
      order: 4,
      zh: { name: "100 以內的加減", goal: "會做 100 以內整十數、不進位的加減法。" },
      en: { name: "Add & Subtract within 100", goal: "Add and subtract within 100 (no regrouping)." },
      lesson: "g1.addsub100",
      types: ["addition", "subtraction"],
      levels: [{ max: 20 }, { max: 100 }],
      mastery: { practice: 10, quizPass: 0.8 }
    },
    "g1.word": {
      id: "g1.word",
      stage: "g1",
      order: 5,
      zh: { name: "簡單應用題", goal: "會讀題，判斷用加法還是減法解決問題。" },
      en: { name: "Word Problems", goal: "Read problems and decide to add or subtract." },
      lesson: "g1.word",
      types: ["word"],
      levels: [{ ops: ["add", "sub"], max: 20 }],
      mastery: { practice: 10, quizPass: 0.8 }
    },
    /* ===================== 二年級 Grade 2 ===================== */
    "g2.addsub100r": {
      id: "g2.addsub100r",
      stage: "g2",
      order: 1,
      zh: { name: "100 以內加減（進退位）", goal: "會做需要進位、退位的 100 以內加減法。" },
      en: { name: "Add & Subtract with Regrouping", goal: "Add and subtract within 100 with regrouping." },
      lesson: "g2.addsub100r",
      types: ["addition", "subtraction"],
      levels: [{ max: 50 }, { max: 100 }],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "g2.mul25": {
      id: "g2.mul25",
      stage: "g2",
      order: 2,
      zh: { name: "乘法：2、5、10", goal: "理解乘法是「幾個幾相加」，背熟 2、5、10 的乘法口訣。" },
      en: { name: "Multiplication: 2, 5, 10", goal: "Understand multiplication as groups; learn the 2, 5, 10 tables." },
      lesson: "g2.mul25",
      types: [{ t: "multiplication", opts: { table: 2 } }, { t: "multiplication", opts: { table: 5 } }, { t: "multiplication", opts: { table: 10 } }],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "g2.mul34": {
      id: "g2.mul34",
      stage: "g2",
      order: 3,
      zh: { name: "乘法：3、4", goal: "背熟 3 和 4 的乘法口訣，並會做簡單乘法。" },
      en: { name: "Multiplication: 3, 4", goal: "Learn the 3 and 4 times tables." },
      lesson: "g2.mul34",
      types: [{ t: "multiplication", opts: { table: 3 } }, { t: "multiplication", opts: { table: 4 } }],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "g2.div": {
      id: "g2.div",
      stage: "g2",
      order: 4,
      zh: { name: "簡單除法", goal: "理解除法是「平均分」，會做表內除法。" },
      en: { name: "Simple Division", goal: "Understand division as sharing equally; divide within tables." },
      lesson: "g2.div",
      types: ["division"],
      levels: [{ maxDivisor: 5, maxQuotient: 5 }, { maxDivisor: 9, maxQuotient: 9 }],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "g2.word": {
      id: "g2.word",
      stage: "g2",
      order: 5,
      zh: { name: "加減乘應用題", goal: "會判斷題目用加、減還是乘法解決。" },
      en: { name: "Word Problems", goal: "Decide whether to add, subtract, or multiply." },
      lesson: "g2.word",
      types: ["word"],
      levels: [{ ops: ["add", "sub", "mul"], max: 20, maxFactor: 9 }],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    /* ===================== 三年級 Grade 3 ===================== */
    "g3.multable": {
      id: "g3.multable",
      stage: "g3",
      order: 1,
      zh: { name: "乘法表：6、7、8、9", goal: "背熟 6、7、8、9 的乘法口訣，能快速口算。" },
      en: { name: "Times Tables: 6, 7, 8, 9", goal: "Master the 6, 7, 8, 9 tables." },
      lesson: "g3.multable",
      types: [{ t: "multiplication", opts: { table: 6 } }, { t: "multiplication", opts: { table: 7 } }, { t: "multiplication", opts: { table: 8 } }, { t: "multiplication", opts: { table: 9 } }],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "g3.mulfree": {
      id: "g3.mulfree",
      stage: "g3",
      order: 2,
      zh: { name: "混合乘法", goal: "能不靠口訣表，熟練計算任意兩位數以內的乘法。" },
      en: { name: "Mixed Multiplication", goal: "Multiply any single-digit factors fluently." },
      lesson: "g3.mulfree",
      types: ["multiplication"],
      levels: [{ maxFactor: 9 }],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "g3.addsubbig": {
      id: "g3.addsubbig",
      stage: "g3",
      order: 3,
      zh: { name: "多位數加減", goal: "會做三位數的加減法，並用豎式計算。" },
      en: { name: "Multi-digit Add & Subtract", goal: "Add and subtract three-digit numbers." },
      lesson: "g3.addsubbig",
      types: ["addition", "subtraction"],
      levels: [{ max: 100 }, { max: 1e3 }],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "g3.muldiv": {
      id: "g3.muldiv",
      stage: "g3",
      order: 4,
      zh: { name: "乘除混合", goal: "能熟練完成表內乘除法的混合運算。" },
      en: { name: "Multiply & Divide", goal: "Multiply and divide fluently within the tables." },
      lesson: "g3.muldiv",
      types: ["multiplication", "division"],
      levels: [{ maxFactor: 9, maxDivisor: 9, maxQuotient: 9 }],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "g3.fraction": {
      id: "g3.fraction",
      stage: "g3",
      order: 5,
      zh: { name: "分數入門", goal: "認識分數，知道幾分之一表示把一個整體平均分成幾份。" },
      en: { name: "Intro to Fractions", goal: "Understand fractions as equal parts of a whole." },
      lesson: "g3.fraction",
      types: ["fraction"],
      levels: [{ minDen: 2, maxDen: 4 }, { minDen: 2, maxDen: 8 }],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "g3.word": {
      id: "g3.word",
      stage: "g3",
      order: 6,
      zh: { name: "綜合應用題", goal: "能分析兩步以內的實際問題，選擇正確的運算。" },
      en: { name: "Mixed Word Problems", goal: "Solve one- and two-step real-world problems." },
      lesson: "g3.word",
      types: ["word"],
      levels: [{ ops: ["add", "sub", "mul", "twoStep"], max: 100, maxFactor: 9 }, { ops: ["add", "sub", "mul", "twoStep", "wunit", "wmoney2"], max: 200, maxFactor: 9 }],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    /* ===================== 四年級 小四 ===================== */
    "g4.multidigit": {
      id: "g4.multidigit",
      stage: "g4",
      order: 1,
      zh: { name: "多位數乘除", goal: "會做兩位數乘一位數、多位數除以一位數的計算。" },
      en: { name: "Multi-digit Multiply & Divide", goal: "Multiply 2-digit by 1-digit and divide multi-digit by 1-digit." },
      lesson: "g4.multidigit",
      types: ["multidigit"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "g4.fractionadd": {
      id: "g4.fractionadd",
      stage: "g4",
      order: 2,
      zh: { name: "同分母分數加減", goal: "會做分母相同的分數加法和減法。" },
      en: { name: "Adding & Subtracting Fractions", goal: "Add and subtract fractions with the same denominator." },
      lesson: "g4.fractionadd",
      types: ["fractionadd"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "g4.decimal": {
      id: "g4.decimal",
      stage: "g4",
      order: 3,
      zh: { name: "小數加減", goal: "認識一位小數，並會做小數的加法和減法。" },
      en: { name: "Decimal Addition & Subtraction", goal: "Add and subtract one-place decimals." },
      lesson: "g4.decimal",
      types: ["decimal"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "g4.area": {
      id: "g4.area",
      stage: "g4",
      order: 4,
      zh: { name: "長方形面積與周界", goal: "會計算長方形的面積和周界。" },
      en: { name: "Area & Perimeter", goal: "Find the area and perimeter of rectangles." },
      lesson: "g4.area",
      types: ["area"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    /* ===================== 五年級 小五 ===================== */
    "g5.decimalmul": {
      id: "g5.decimalmul",
      stage: "g5",
      order: 1,
      zh: { name: "小數乘除", goal: "會做小數乘整數、小數除以整數的計算。" },
      en: { name: "Decimal Multiply & Divide", goal: "Multiply and divide decimals by whole numbers." },
      lesson: "g5.decimalmul",
      types: ["decimalmul"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "g5.average": {
      id: "g5.average",
      stage: "g5",
      order: 2,
      zh: { name: "平均數", goal: "會求一組數的平均數。" },
      en: { name: "Averages", goal: "Find the average of a set of numbers." },
      lesson: "g5.average",
      types: ["average"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "g5.fractionof": {
      id: "g5.fractionof",
      stage: "g5",
      order: 3,
      zh: { name: "求一個數的幾分之幾", goal: "會求一個數的幾分之幾是多少。" },
      en: { name: "Fraction of a Number", goal: "Find a fraction of a whole number." },
      lesson: "g5.fractionof",
      types: ["fractionof"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "g5.fractiondiff": {
      id: "g5.fractiondiff",
      stage: "g5",
      order: 5,
      zh: { name: "異分母分數加減", goal: "會通分後做異分母分數的加減。" },
      en: { name: "Add/Subtract Unlike Fractions", goal: "Use a common denominator to add or subtract unlike fractions." },
      lesson: "g5.fractiondiff",
      types: ["fractiondiff"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "g5.fractionmul": {
      id: "g5.fractionmul",
      stage: "g5",
      order: 6,
      zh: { name: "分數乘除", goal: "會做分數乘法與除以一個分數。" },
      en: { name: "Multiply & Divide Fractions", goal: "Multiply fractions and divide by a fraction." },
      lesson: "g5.fractionmul",
      types: ["fractionmul"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "g5.area2": {
      id: "g5.area2",
      stage: "g5",
      order: 7,
      zh: { name: "面積（二）", goal: "會求平行四邊形、三角形與梯形的面積。" },
      en: { name: "Area II", goal: "Find areas of parallelograms, triangles and trapeziums." },
      lesson: "g5.area2",
      types: ["area2"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "g5.volume1": {
      id: "g5.volume1",
      stage: "g5",
      order: 8,
      zh: { name: "體積（一）", goal: "認識體積，用長×闊×高求長方體體積。" },
      en: { name: "Volume I", goal: "Understand volume and find cuboid volume as length × width × height." },
      lesson: "g5.volume1",
      types: ["volume1"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "g5.rotation": {
      id: "g5.rotation",
      stage: "g5",
      order: 9,
      zh: { name: "旋轉對稱", goal: "認識旋轉對稱的階數與最小旋轉角。" },
      en: { name: "Rotational Symmetry", goal: "Find the order of rotational symmetry and the smallest angle." },
      lesson: "g5.rotation",
      types: ["rotation"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "g5.estimation": {
      id: "g5.estimation",
      stage: "g5",
      order: 10,
      zh: { name: "近似值與估算", goal: "會四捨五入及用近似值估算加法的和。" },
      en: { name: "Approximation & Estimation", goal: "Round numbers and estimate sums using approximations." },
      lesson: "g5.estimation",
      types: ["rounding"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "g5.chart": {
      id: "g5.chart",
      stage: "g5",
      order: 11,
      zh: { name: "統計圖", goal: "會讀棒形圖與折線圖，求相差、總和及變化。" },
      en: { name: "Charts", goal: "Read bar charts and line graphs to find differences, totals and changes." },
      lesson: "g5.chart",
      types: ["chartread"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "g5.algebra": {
      id: "g5.algebra",
      stage: "g5",
      order: 12,
      zh: { name: "代數符號（一）", goal: "會用字母表示未知數，並代入求值。" },
      en: { name: "Algebraic Symbols I", goal: "Use letters for unknowns and evaluate expressions by substitution." },
      lesson: "g5.algebra",
      types: ["exprsub"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "g5.fraccompare": {
      id: "g5.fraccompare",
      stage: "g5",
      order: 14,
      zh: { name: "分數比較與擴分約分", goal: "會比較異分母分數，並做擴分與約分。" },
      en: { name: "Comparing, Expanding & Simplifying Fractions", goal: "Compare unlike fractions and expand or simplify fractions." },
      lesson: "g5.fraccompare",
      types: ["fraccompare"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "g5.decimalmixed": {
      id: "g5.decimalmixed",
      stage: "g5",
      order: 15,
      zh: { name: "小數四則混合", goal: "會做小數加、減、乘、除及混合運算。" },
      en: { name: "Mixed Decimal Operations", goal: "Add, subtract, multiply and divide decimals." },
      lesson: "g5.decimalmixed",
      types: ["decimalmixed"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "g5.circle": {
      id: "g5.circle",
      stage: "g5",
      order: 13,
      zh: { name: "圓的認識", goal: "認識圓心、半徑與直徑，並互算長度。" },
      en: { name: "Circles", goal: "Know the centre, radius and diameter, and convert between radius and diameter." },
      lesson: "g5.circle",
      types: ["circleparts"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    /* ===================== 六年級 小六 ===================== */
    "g6.equation": {
      id: "g6.equation",
      stage: "g6",
      order: 1,
      zh: { name: "簡易方程", goal: "會解一元一次方程，求出未知數 x。" },
      en: { name: "Simple Equations", goal: "Solve one-variable equations to find x." },
      lesson: "g6.equation",
      types: ["equation"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "g6.percent": {
      id: "g6.percent",
      stage: "g6",
      order: 2,
      zh: { name: "百分數", goal: "會求一個數的百分之幾，以及求百分率。" },
      en: { name: "Percentages", goal: "Find a percent of a number, and find what percent one is of another." },
      lesson: "g6.percent",
      types: ["percent"],
      levels: [{ modes: ["of"] }, { modes: ["of", "what"] }, { modes: ["of", "what", "change", "reverse"] }],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "g6.ratio": {
      id: "g6.ratio",
      stage: "g6",
      order: 3,
      zh: { name: "比與比例", goal: "會按比分配，並求比例中的未知數。" },
      en: { name: "Ratio & Proportion", goal: "Use ratios to find unknown values." },
      lesson: "g6.ratio",
      types: ["ratio"],
      levels: [{ modes: ["findB"] }, { modes: ["findB", "share"] }, { modes: ["findB", "share", "threePart"] }],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    /* ===================== 中一（S1） ===================== */
    "ms.s1.directed": {
      id: "ms.s1.directed",
      stage: "ms1",
      order: 1,
      zh: { name: "有向數", goal: "會做正負數的加、減、乘、除。" },
      en: { name: "Directed Numbers", goal: "Add, subtract, multiply and divide positive and negative numbers." },
      lesson: "ms.s1.directed",
      types: ["directed"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "ms.s1.exprsub": {
      id: "ms.s1.exprsub",
      stage: "ms1",
      order: 2,
      zh: { name: "代數式求值", goal: "會把已知數代入代數式求值。" },
      en: { name: "Substitution", goal: "Evaluate an algebraic expression for a given value." },
      lesson: "ms.s1.exprsub",
      types: ["exprsub"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "ms.s1.linear": {
      id: "ms.s1.linear",
      stage: "ms1",
      order: 3,
      zh: { name: "一元一次方程", goal: "會解兩步的一元一次方程。" },
      en: { name: "Linear Equations", goal: "Solve one-variable linear equations in two steps." },
      lesson: "ms.s1.linear",
      types: ["linear"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    /* ===================== 中二（S2） ===================== */
    "ms.s2.pythagoras": {
      id: "ms.s2.pythagoras",
      stage: "ms2",
      order: 1,
      zh: { name: "畢氏定理", goal: "會用畢氏定理求直角三角形的邊長。" },
      en: { name: "Pythagoras Theorem", goal: "Use Pythagoras to find sides of a right triangle." },
      lesson: "ms.s2.pythagoras",
      types: ["pythagoras"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "ms.s2.simul": {
      id: "ms.s2.simul",
      stage: "ms2",
      order: 2,
      zh: { name: "聯立方程", goal: "會用消元法解二元一次方程組。" },
      en: { name: "Simultaneous Equations", goal: "Solve simultaneous linear equations by elimination." },
      lesson: "ms.s2.simul",
      types: ["simul"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    /* ===================== 中三（S3） ===================== */
    "ms.s3.indices": {
      id: "ms.s3.indices",
      stage: "ms3",
      order: 1,
      zh: { name: "指數定律", goal: "會用指數定律計算乘方、同底數相乘與相除。" },
      en: { name: "Laws of Indices", goal: "Use index laws for powers, same-base products and quotients." },
      lesson: "ms.s3.indices",
      types: ["indices"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "ms.s3.inequality": {
      id: "ms.s3.inequality",
      stage: "ms3",
      order: 2,
      zh: { name: "一元一次不等式", goal: "會解簡單的一元一次不等式。" },
      en: { name: "Linear Inequalities", goal: "Solve simple linear inequalities in one variable." },
      lesson: "ms.s3.inequality",
      types: ["inequality"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    /* ===================== 中四（S4） ===================== */
    "hs.s4.log": {
      id: "hs.s4.log",
      stage: "hs1",
      order: 1,
      zh: { name: "對數", goal: "會求簡單的對數值，並用同底對數相加的法則。" },
      en: { name: "Logarithms", goal: "Evaluate logarithms and use the same-base product law." },
      lesson: "hs.s4.log",
      types: ["log"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "hs.s4.fx": {
      id: "hs.s4.fx",
      stage: "hs1",
      order: 2,
      zh: { name: "函數求值", goal: "會代入二次函數求值。" },
      en: { name: "Function Values", goal: "Evaluate a quadratic function." },
      lesson: "hs.s4.fx",
      types: ["fx"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "hs.s4.trig": {
      id: "hs.s4.trig",
      stage: "hs1",
      order: 3,
      zh: { name: "三角比", goal: "會用 sin、cos、tan 求直角三角形的比。" },
      en: { name: "Trigonometric Ratios", goal: "Use sin, cos, tan in right triangles." },
      lesson: "hs.s4.trig",
      types: ["trig"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "hs.s4.identities": {
      id: "hs.s4.identities",
      stage: "hs1",
      order: 4,
      zh: { name: "三角恆等式", goal: "會用平方關係、商數關係與二倍角公式。" },
      en: { name: "Trigonometric Identities", goal: "Use Pythagorean, quotient and double-angle identities." },
      lesson: "hs.s4.identities",
      types: ["trigident"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    /* ===================== 中五（S5） ===================== */
    "hs.s5.ap": {
      id: "hs.s5.ap",
      stage: "hs2",
      order: 1,
      zh: { name: "等差數列", goal: "會求等差數列的第 n 項。" },
      en: { name: "Arithmetic Sequences", goal: "Find the nth term of an arithmetic sequence." },
      lesson: "hs.s5.ap",
      types: ["ap"],
      levels: [{ modes: ["term"] }, { modes: ["term", "sum"] }, { modes: ["term", "sum", "findN"] }],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "hs.s5.sinerule": {
      id: "hs.s5.sinerule",
      stage: "hs2",
      order: 3,
      zh: { name: "正弦與餘弦定理", goal: "會用正弦定理、餘弦定理及三角形面積公式。" },
      en: { name: "Sine & Cosine Rules", goal: "Use the sine rule, cosine rule and triangle area formula." },
      lesson: "hs.s5.sinerule",
      types: ["sinerule"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "hs.s5.triggraph": {
      id: "hs.s5.triggraph",
      stage: "hs2",
      order: 4,
      zh: { name: "三角函數圖像", goal: "會求正弦/餘弦曲線的振幅與週期。" },
      en: { name: "Trigonometric Graphs", goal: "Find amplitude and period of sine/cosine curves." },
      lesson: "hs.s5.triggraph",
      types: ["triggraph"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "hs.s5.compound": {
      id: "hs.s5.compound",
      stage: "hs2",
      order: 5,
      zh: { name: "複角公式", goal: "會用 sin(A±B)、cos(A±B)、tan(A+B) 公式。" },
      en: { name: "Compound-angle Formulae", goal: "Use sin(A±B), cos(A±B) and tan(A+B) formulae." },
      lesson: "hs.s5.compound",
      types: ["compound"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "hs.s5.radian": {
      id: "hs.s5.radian",
      stage: "hs2",
      order: 6,
      zh: { name: "弧度制與單位圓", goal: "會換算弧度、求弧長及特殊角三角值。" },
      en: { name: "Radians & the Unit Circle", goal: "Convert radians, find arc length and special-angle values." },
      lesson: "hs.s5.radian",
      types: ["radian"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "hs.s5.trigeq": {
      id: "hs.s5.trigeq",
      stage: "hs2",
      order: 7,
      zh: { name: "三角方程與一般解", goal: "會在 0°–360° 內解簡單三角方程。" },
      en: { name: "Trigonometric Equations", goal: "Solve simple trig equations in 0°–360°." },
      lesson: "hs.s5.trigeq",
      types: ["trigeq"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "hs.s5.gp": {
      id: "hs.s5.gp",
      stage: "hs2",
      order: 2,
      zh: { name: "等比數列", goal: "會求等比數列的第 n 項。" },
      en: { name: "Geometric Sequences", goal: "Find the nth term of a geometric sequence." },
      lesson: "hs.s5.gp",
      types: ["gp"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "hs.s5.prob": {
      id: "hs.s5.prob",
      stage: "hs2",
      order: 3,
      zh: { name: "概率", goal: "會求簡單事件的概率。" },
      en: { name: "Probability", goal: "Find the probability of simple events." },
      lesson: "hs.s5.prob",
      types: ["prob"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    /* ===================== 中六（S6） ===================== */
    "hs.s6.quad": {
      id: "hs.s6.quad",
      stage: "hs3",
      order: 1,
      zh: { name: "二次方程的根", goal: "會用根與係數的關係求兩根之和或積。" },
      en: { name: "Roots of Quadratics", goal: "Use sum/product of roots." },
      lesson: "hs.s6.quad",
      types: ["quad"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "hs.s6.stats": {
      id: "hs.s6.stats",
      stage: "hs3",
      order: 2,
      zh: { name: "中位數", goal: "會求一組數據的中位數（單數及雙數個數據）。" },
      en: { name: "Median", goal: "Find the median for odd- and even-sized data sets." },
      lesson: "hs.s6.stats",
      types: ["stats"],
      levels: [{ modes: ["median"] }, { modes: ["median", "mean"] }, { modes: ["median", "mean"] }],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "col.calculus": {
      id: "col.calculus",
      stage: "college",
      order: 1,
      zh: { name: "微積分", goal: "會求多項式的導數值與定積分。" },
      en: { name: "Calculus", goal: "Evaluate derivatives and definite integrals of polynomials." },
      lesson: "col.calculus",
      types: ["calculus"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "col.linalg": {
      id: "col.linalg",
      stage: "college",
      order: 2,
      zh: { name: "線性代數", goal: "會計算二階行列式與矩陣乘積的元素。" },
      en: { name: "Linear Algebra", goal: "Compute 2×2 determinants and entries of matrix products." },
      lesson: "col.linalg",
      types: ["matrix"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "col.prob": {
      id: "col.prob",
      stage: "college",
      order: 3,
      zh: { name: "概率與統計", goal: "會求期望值與二項概率。" },
      en: { name: "Probability & Statistics", goal: "Find expected values and binomial probabilities." },
      lesson: "col.prob",
      types: ["expectation"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "col.calculus2": {
      id: "col.calculus2",
      stage: "college",
      order: 4,
      zh: { name: "微積分（二）", goal: "會求冪函數的定積分與指定點的導數。" },
      en: { name: "Calculus II", goal: "Evaluate definite integrals and derivatives at a point for power functions." },
      lesson: "col.calculus2",
      types: ["calculus2"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "col.linalg2": {
      id: "col.linalg2",
      stage: "college",
      order: 5,
      zh: { name: "線性代數（二）", goal: "會計算二階行列式與矩陣乘法元素。" },
      en: { name: "Linear Algebra II", goal: "Compute 2×2 determinants and matrix product entries." },
      lesson: "col.linalg2",
      types: ["linalg2"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "col.stats2": {
      id: "col.stats2",
      stage: "college",
      order: 6,
      zh: { name: "統計（二）", goal: "會求一組數據的方差與標準差。" },
      en: { name: "Statistics II", goal: "Find variance and standard deviation of a small data set." },
      lesson: "col.stats2",
      types: ["stats2"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "col.trigcalc": {
      id: "col.trigcalc",
      stage: "college",
      order: 9,
      zh: { name: "三角微積分", goal: "會求 sin/cos 的導數值與定積分。" },
      en: { name: "Trigonometric Calculus", goal: "Differentiate and integrate sin/cos at key points." },
      lesson: "col.trigcalc",
      types: ["trigcalc"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "col.ode": {
      id: "col.ode",
      stage: "college",
      order: 7,
      zh: { name: "微分方程（歐拉法）", goal: "會用歐拉法估計一階微分方程的數值解。" },
      en: { name: "Differential Equations (Euler)", goal: "Use Euler’s method to estimate solutions of first-order ODEs." },
      lesson: "col.ode",
      types: ["ode"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "col.nt": {
      id: "col.nt",
      stage: "college",
      order: 8,
      zh: { name: "數論（歐拉函數與反元素）", goal: "會求歐拉函數與模乘法反元素。" },
      en: { name: "Number Theory", goal: "Find Euler totients and modular multiplicative inverses." },
      lesson: "col.nt",
      types: ["numtheory"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    /* ===================== 研究院 ===================== */
    "grad.analysis": {
      id: "grad.analysis",
      stage: "grad",
      order: 1,
      zh: { name: "實分析", goal: "會求數列極限與無窮等比級數的和。" },
      en: { name: "Real Analysis", goal: "Find limits of sequences and sums of infinite geometric series." },
      lesson: "grad.analysis",
      types: ["gradanalysis"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "grad.algebra": {
      id: "grad.algebra",
      stage: "grad",
      order: 2,
      zh: { name: "抽象代數", goal: "會求群元素的階、對稱群大小與循環群的生成元數。" },
      en: { name: "Abstract Algebra", goal: "Find element orders, symmetric-group sizes and numbers of cyclic generators." },
      lesson: "grad.algebra",
      types: ["gradalgebra"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "grad.topology": {
      id: "grad.topology",
      stage: "grad",
      order: 3,
      zh: { name: "拓撲學", goal: "會數有限集合上離散拓撲與特定點拓撲的開集數。" },
      en: { name: "Topology", goal: "Count open sets in discrete and particular-point topologies on finite sets." },
      lesson: "grad.topology",
      types: ["gradtopology"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "grad.measure": {
      id: "grad.measure",
      stage: "grad",
      order: 4,
      zh: { name: "測度論", goal: "認識勒貝格測度與計數測度。" },
      en: { name: "Measure Theory", goal: "Understand Lebesgue measure and counting measure." },
      lesson: "grad.measure",
      types: ["gradmeasure"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "grad.geometry": {
      id: "grad.geometry",
      stage: "grad",
      order: 5,
      zh: { name: "微分幾何", goal: "會求圓的曲率與球面的高斯曲率。" },
      en: { name: "Differential Geometry", goal: "Find circle curvature and sphere Gaussian curvature." },
      lesson: "grad.geometry",
      types: ["gradgeometry"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "grad.category": {
      id: "grad.category",
      stage: "grad",
      order: 6,
      zh: { name: "範疇論入門", goal: "用態射/函數的角度數函數與自同態。" },
      en: { name: "Category Theory Intro", goal: "Count functions and endomorphisms through the morphism viewpoint." },
      lesson: "grad.category",
      types: ["gradcategory"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    /* ===================== 中學與大學增補（二） ===================== */
    "ms.s2.identity": {
      id: "ms.s2.identity",
      stage: "ms2",
      order: 9,
      zh: { name: "恆等式與展開", goal: "會展開 (x+a)(x+b)、(x+a)² 與平方差，並讀出係數。" },
      en: { name: "Identities & Expansion", goal: "Expand products and squares, and read off coefficients." },
      lesson: "ms.s2.identity",
      types: ["identity"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "ms.s3.sector": {
      id: "ms.s3.sector",
      stage: "ms3",
      order: 11,
      zh: { name: "扇形面積", goal: "會用 πr² × (θ/360°) 求扇形面積（以 π 表示）。" },
      en: { name: "Sector Area", goal: "Find sector area with πr² × (θ/360°), in terms of π." },
      lesson: "ms.s3.sector",
      types: [{ t: "arclen", opts: { mode: "sector" } }],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "ms.s3.prism": {
      id: "ms.s3.prism",
      stage: "ms3",
      order: 12,
      zh: { name: "柱體與錐體體積", goal: "會用底面積 × 高求柱體體積，錐體則除以 3。" },
      en: { name: "Volume of Prisms & Pyramids", goal: "Use base area × height; divide by 3 for pyramids." },
      lesson: "ms.s3.prism",
      types: ["prism"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "hs.s4.quad2": {
      id: "hs.s4.quad2",
      stage: "hs1",
      order: 9,
      zh: { name: "判別式與實根數目", goal: "會計算判別式，並判斷二次方程有幾個實根。" },
      en: { name: "Discriminant & Number of Roots", goal: "Compute the discriminant and decide how many real roots a quadratic has." },
      lesson: "hs.s4.quad2",
      types: [{ t: "quadsolve", opts: { mode: "disc" } }, { t: "quadsolve", opts: { mode: "nature" } }],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "hs.s4.line2": {
      id: "hs.s4.line2",
      stage: "hs1",
      order: 10,
      zh: { name: "直線方程", goal: "會由直線方程與一點求未知常數。" },
      en: { name: "Equations of Lines", goal: "Find an unknown constant from a line equation and a point." },
      lesson: "hs.s4.line2",
      types: [{ t: "line", opts: { mode: "eq" } }],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "hs.s4.circleprop": {
      id: "hs.s4.circleprop",
      stage: "hs1",
      order: 11,
      zh: { name: "圓的性質", goal: "會用半圓上的角、同弓形角與圓內接四邊形求角。" },
      en: { name: "Circle Properties", goal: "Use semicircle, same-segment and cyclic-quadrilateral angle facts." },
      lesson: "hs.s4.circleprop",
      types: ["circleprop"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "hs.s5.gpsum": {
      id: "hs.s5.gpsum",
      stage: "hs2",
      order: 7,
      zh: { name: "等比數列求和", goal: "會求等比數列前 n 項和與無限項之和。" },
      en: { name: "Sums of Geometric Sequences", goal: "Find finite and infinite geometric sums." },
      lesson: "hs.s5.gpsum",
      types: [{ t: "gp", opts: { mode: "sum" } }, { t: "gp", opts: { mode: "inf" } }],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "hs.s5.dispersion": {
      id: "hs.s5.dispersion",
      stage: "hs2",
      order: 8,
      zh: { name: "四分位距", goal: "會排序數據並求四分位距（IQR）。" },
      en: { name: "Interquartile Range", goal: "Sort data and find the interquartile range." },
      lesson: "hs.s5.dispersion",
      types: ["dispersion"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "hs.s6.prob2": {
      id: "hs.s6.prob2",
      stage: "hs3",
      order: 7,
      zh: { name: "續概率", goal: "會求兩枚骰子的概率與對立事件概率。" },
      en: { name: "More Probability", goal: "Two-dice outcomes and complementary events." },
      lesson: "hs.s6.prob2",
      types: [{ t: "prob", opts: { mode: "twoDice" } }, { t: "prob", opts: { mode: "complement" } }],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "hs.s6.binomial2": {
      id: "hs.s6.binomial2",
      stage: "hs3",
      order: 8,
      zh: { name: "二項式定理（一般項）", goal: "會求 (x + a)ⁿ 展開式中 xʳ 的係數。" },
      en: { name: "Binomial Theorem (general term)", goal: "Find the coefficient of xʳ in (x + a)ⁿ." },
      lesson: "hs.s6.binomial2",
      types: [{ t: "binomial", opts: { general: true } }],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    /* ===================== 幾何、座標、應用題（補充） ===================== */
    "prek.word": {
      id: "prek.word",
      stage: "prek",
      order: 6,
      zh: { name: "應用題", goal: "會讀簡單的應用題，用加減解決。" },
      en: { name: "Word Problems", goal: "Solve simple word problems with + and −." },
      lesson: "generic.word",
      types: ["word"],
      levels: [{ ops: ["add", "sub"], max: 10 }],
      mastery: { practice: 8, quizPass: 0.8 }
    },
    "g4.triangle": {
      id: "g4.triangle",
      stage: "g4",
      order: 5,
      zh: { name: "三角形面積", goal: "會用底 × 高 ÷ 2 計算三角形面積。" },
      en: { name: "Triangle Area", goal: "Find the area of a triangle." },
      lesson: "g4.triangle",
      types: ["triangle"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "g4.word": {
      id: "g4.word",
      stage: "g4",
      order: 6,
      zh: { name: "應用題", goal: "會用加減乘和面積解決應用題。" },
      en: { name: "Word Problems", goal: "Solve word problems with +, −, × and area." },
      lesson: "generic.word",
      types: ["word"],
      levels: [{ ops: ["add", "sub", "mul", "area", "twoStep"], max: 100, maxFactor: 9 }, { ops: ["add", "sub", "mul", "area", "twoStep", "wunit", "wmoney2", "wgeo2"], max: 200, maxFactor: 9 }],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "g5.word": {
      id: "g5.word",
      stage: "g5",
      order: 4,
      zh: { name: "應用題", goal: "會解決多步、跨概念的較複雜應用題。" },
      en: { name: "Word Problems", goal: "Solve multi-step, cross-topic word problems." },
      lesson: "generic.word",
      types: ["word"],
      levels: [{ ops: ["add", "sub", "mul", "area", "percent", "ratio", "speed", "profit", "compound", "twoStep"], max: 1e3, maxFactor: 9 }, { ops: ["add", "sub", "mul", "area", "percent", "ratio", "speed", "profit", "compound", "twoStep", "wunit", "wmoney2", "wrate2", "wgeo2", "wratio2"], max: 2e3, maxFactor: 12 }],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "g6.circle": {
      id: "g6.circle",
      stage: "g6",
      order: 4,
      zh: { name: "圓的周長與面積", goal: "會計算圓的周長和面積（以 π 表示）。" },
      en: { name: "Circles", goal: "Find circumference and area of a circle (in π)." },
      lesson: "g6.circle",
      types: ["circle"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "g6.volume": {
      id: "g6.volume",
      stage: "g6",
      order: 5,
      zh: { name: "立體圖形的體積", goal: "會計算長方體的體積。" },
      en: { name: "Volume of Cuboids", goal: "Find the volume of a cuboid." },
      lesson: "g6.volume",
      types: ["volume"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "g6.word": {
      id: "g6.word",
      stage: "g6",
      order: 6,
      zh: { name: "應用題", goal: "會綜合運用百分數、比、速率等解決多步應用題。" },
      en: { name: "Word Problems", goal: "Solve multi-step problems combining percentages, ratios, rates and more." },
      lesson: "generic.word",
      types: ["word"],
      levels: [{ ops: ["add", "sub", "mul", "area", "percent", "ratio", "speed", "profit", "compound", "twoStep", "wunit", "wmoney2", "wrate2", "wgeo2", "wratio2"], max: 1e3, maxFactor: 12 }, { ops: ["add", "sub", "mul", "area", "percent", "ratio", "speed", "profit", "compound", "twoStep", "wunit", "wmoney2", "wrate2", "wgeo2", "wratio2", "wreverse", "wprofit2", "wtable", "wequation", "wunitconv", "wremainder", "wpctchain", "wthreepart"], max: 2e3, maxFactor: 12 }],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "ms.s1.coord": {
      id: "ms.s1.coord",
      stage: "ms1",
      order: 4,
      zh: { name: "座標", goal: "會求兩點的距離和中點。" },
      en: { name: "Coordinates", goal: "Find distance and midpoint of two points." },
      lesson: "ms.s1.coord",
      types: ["coord"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "ms.s1.word": {
      id: "ms.s1.word",
      stage: "ms1",
      order: 5,
      zh: { name: "應用題", goal: "會用數學解決應用題。" },
      en: { name: "Word Problems", goal: "Solve word problems." },
      lesson: "generic.word",
      types: ["word"],
      levels: [{ ops: ["add", "sub", "mul", "area", "percent", "ratio", "speed", "profit", "compound", "twoStep", "wunit", "wmoney2", "wrate2", "wgeo2", "wratio2"], max: 1e3, maxFactor: 12 }, { ops: ["add", "sub", "mul", "area", "percent", "ratio", "speed", "profit", "compound", "twoStep", "wunit", "wmoney2", "wrate2", "wgeo2", "wratio2", "wreverse", "wprofit2", "wtable", "wequation", "wunitconv", "wremainder", "wpctchain", "wthreepart"], max: 2e3, maxFactor: 12 }],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "ms.s2.word": {
      id: "ms.s2.word",
      stage: "ms2",
      order: 3,
      zh: { name: "應用題", goal: "會解決應用題。" },
      en: { name: "Word Problems", goal: "Solve word problems." },
      lesson: "generic.word",
      types: ["word"],
      levels: [{ ops: ["add", "sub", "mul", "area", "percent", "ratio", "speed", "profit", "compound", "twoStep", "wunit", "wmoney2", "wrate2", "wgeo2", "wratio2", "wreverse", "wprofit2", "wtable", "wequation", "wunitconv", "wremainder", "wpctchain", "wthreepart"], max: 2e3, maxFactor: 12 }, { ops: ["add", "sub", "mul", "area", "percent", "ratio", "speed", "profit", "compound", "twoStep", "wunit", "wmoney2", "wrate2", "wgeo2", "wratio2", "wreverse", "wprofit2", "wtable", "wequation", "wdata2", "wunitconv", "wremainder", "wpctchain", "wthreepart"], max: 3e3, maxFactor: 12 }],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "ms.s3.word": {
      id: "ms.s3.word",
      stage: "ms3",
      order: 3,
      zh: { name: "應用題", goal: "會解決應用題。" },
      en: { name: "Word Problems", goal: "Solve word problems." },
      lesson: "generic.word",
      types: ["word"],
      levels: [{ ops: ["add", "sub", "mul", "area", "percent", "ratio", "speed", "profit", "compound", "twoStep", "wunit", "wmoney2", "wrate2", "wgeo2", "wratio2", "wreverse", "wprofit2", "wtable", "wequation", "wunitconv", "wremainder", "wpctchain", "wthreepart"], max: 2e3, maxFactor: 12 }, { ops: ["add", "sub", "mul", "area", "percent", "ratio", "speed", "profit", "compound", "twoStep", "wunit", "wmoney2", "wrate2", "wgeo2", "wratio2", "wreverse", "wprofit2", "wtable", "wequation", "wdata2", "wunitconv", "wremainder", "wpctchain", "wthreepart"], max: 3e3, maxFactor: 12 }],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "hs.s4.word": {
      id: "hs.s4.word",
      stage: "hs1",
      order: 4,
      zh: { name: "應用題", goal: "會解決應用題。" },
      en: { name: "Word Problems", goal: "Solve word problems." },
      lesson: "generic.word",
      types: ["word"],
      levels: [{ ops: ["add", "sub", "mul", "area", "percent", "ratio", "speed", "profit", "compound", "twoStep", "wunit", "wmoney2", "wrate2", "wgeo2", "wratio2", "wreverse", "wprofit2", "wtable", "wequation", "wunitconv", "wremainder", "wpctchain", "wthreepart"], max: 2e3, maxFactor: 12 }, { ops: ["add", "sub", "mul", "area", "percent", "ratio", "speed", "profit", "compound", "twoStep", "wunit", "wmoney2", "wrate2", "wgeo2", "wratio2", "wreverse", "wprofit2", "wtable", "wequation", "wdata2", "wunitconv", "wremainder", "wpctchain", "wthreepart"], max: 3e3, maxFactor: 12 }],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "hs.s5.word": {
      id: "hs.s5.word",
      stage: "hs2",
      order: 4,
      zh: { name: "應用題", goal: "會解決應用題。" },
      en: { name: "Word Problems", goal: "Solve word problems." },
      lesson: "generic.word",
      types: ["word"],
      levels: [{ ops: ["add", "sub", "mul", "area", "percent", "ratio", "speed", "profit", "compound", "twoStep", "wunit", "wmoney2", "wrate2", "wgeo2", "wratio2", "wreverse", "wprofit2", "wtable", "wequation", "wunitconv", "wremainder", "wpctchain", "wthreepart"], max: 2e3, maxFactor: 12 }, { ops: ["add", "sub", "mul", "area", "percent", "ratio", "speed", "profit", "compound", "twoStep", "wunit", "wmoney2", "wrate2", "wgeo2", "wratio2", "wreverse", "wprofit2", "wtable", "wequation", "wdata2", "wunitconv", "wremainder", "wpctchain", "wthreepart"], max: 3e3, maxFactor: 12 }],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "hs.s6.word": {
      id: "hs.s6.word",
      stage: "hs3",
      order: 3,
      zh: { name: "應用題", goal: "會解決應用題。" },
      en: { name: "Word Problems", goal: "Solve word problems." },
      lesson: "generic.word",
      types: ["word"],
      levels: [{ ops: ["add", "sub", "mul", "area", "percent", "ratio", "speed", "profit", "compound", "twoStep", "wunit", "wmoney2", "wrate2", "wgeo2", "wratio2", "wreverse", "wprofit2", "wtable", "wequation", "wdata2", "wunitconv", "wremainder", "wpctchain", "wthreepart"], max: 3e3, maxFactor: 12 }, { ops: ["add", "sub", "mul", "area", "percent", "ratio", "speed", "profit", "compound", "twoStep", "wunit", "wmoney2", "wrate2", "wgeo2", "wratio2", "wreverse", "wprofit2", "wtable", "wequation", "wdata2", "wunitconv", "wremainder", "wpctchain", "wthreepart"], max: 5e3, maxFactor: 12 }],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    /* ===================== 補缺課題 ===================== */
    "g1.money": {
      id: "g1.money",
      stage: "g1",
      order: 6,
      zh: { name: "貨幣與找續", goal: "會計算購物的找續。" },
      en: { name: "Money & Change", goal: "Work out change when shopping." },
      lesson: "g1.money",
      types: ["money"],
      levels: [{}],
      mastery: { practice: 10, quizPass: 0.8 }
    },
    "g1.oddeven": {
      id: "g1.oddeven",
      stage: "g1",
      order: 7,
      zh: { name: "單雙數", goal: "會分辨奇數和偶數。" },
      en: { name: "Odd & Even", goal: "Tell odd and even numbers apart." },
      lesson: "g1.oddeven",
      types: ["oddeven"],
      levels: [{}],
      mastery: { practice: 10, quizPass: 0.8 }
    },
    "g2.fact": {
      id: "g2.fact",
      stage: "g2",
      order: 6,
      zh: { name: "單位換算", goal: "記住常用的時間與長度換算。" },
      en: { name: "Units", goal: "Recall common time and length conversions." },
      lesson: "g2.fact",
      types: ["fact"],
      levels: [{}],
      mastery: { practice: 10, quizPass: 0.8 }
    },
    "g3.angle": {
      id: "g3.angle",
      stage: "g3",
      order: 7,
      zh: { name: "角", goal: "認識直角、銳角和鈍角。" },
      en: { name: "Angles", goal: "Know right, acute and obtuse angles." },
      lesson: "g3.angle",
      types: ["angle"],
      levels: [{}],
      mastery: { practice: 10, quizPass: 0.8 }
    },
    "g4.perimeter": {
      id: "g4.perimeter",
      stage: "g4",
      order: 7,
      zh: { name: "周界", goal: "會計算長方形的周界。" },
      en: { name: "Perimeter", goal: "Find the perimeter of a rectangle." },
      lesson: "g4.perimeter",
      types: ["perimeter"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "ms.s2.polygon": {
      id: "ms.s2.polygon",
      stage: "ms2",
      order: 4,
      zh: { name: "多邊形內角和", goal: "會用 (n−2)×180° 求內角和。" },
      en: { name: "Polygon Angle Sum", goal: "Use (n−2)×180° for interior angle sum." },
      lesson: "ms.s2.polygon",
      types: ["polygon"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "hs.s4.quadsolve": {
      id: "hs.s4.quadsolve",
      stage: "hs1",
      order: 5,
      zh: { name: "二次方程求根", goal: "會因式分解並求二次方程的根。" },
      en: { name: "Solving Quadratics", goal: "Factorise and find the roots of a quadratic." },
      lesson: "hs.s4.quadsolve",
      types: ["quadsolve"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "hs.s4.line": {
      id: "hs.s4.line",
      stage: "hs1",
      order: 6,
      zh: { name: "直線的斜率", goal: "會由兩點求直線的斜率。" },
      en: { name: "Slope of a Line", goal: "Find the slope from two points." },
      lesson: "hs.s4.line",
      types: ["line"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "hs.s5.variation": {
      id: "hs.s5.variation",
      stage: "hs2",
      order: 5,
      zh: { name: "正變", goal: "會解 y = kx 的正變問題。" },
      en: { name: "Direct Variation", goal: "Solve y = kx variation problems." },
      lesson: "hs.s5.variation",
      types: ["variation"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    /* ===================== 補缺課題（二） ===================== */
    "g3.shape": {
      id: "g3.shape",
      stage: "g3",
      order: 8,
      zh: { name: "圖形性質", goal: "認識平面與立體圖形的邊、面和頂點。" },
      en: { name: "Shape Properties", goal: "Know sides, faces and vertices of shapes." },
      lesson: "g3.shape",
      types: ["shape"],
      levels: [{}],
      mastery: { practice: 10, quizPass: 0.8 }
    },
    "g6.symmetry": {
      id: "g6.symmetry",
      stage: "g6",
      order: 7,
      zh: { name: "對稱", goal: "會數圖形的對稱軸。" },
      en: { name: "Symmetry", goal: "Count lines of symmetry." },
      lesson: "g6.symmetry",
      types: ["symmetry"],
      levels: [{}],
      mastery: { practice: 10, quizPass: 0.8 }
    },
    "ms.s1.liketerms": {
      id: "ms.s1.liketerms",
      stage: "ms1",
      order: 6,
      zh: { name: "合併同類項", goal: "會合併代數式的同類項。" },
      en: { name: "Collecting Like Terms", goal: "Combine like terms." },
      lesson: "ms.s1.liketerms",
      types: ["liketerms"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "ms.s2.polycoeff": {
      id: "ms.s2.polycoeff",
      stage: "ms2",
      order: 5,
      zh: { name: "多項式", goal: "認識多項式的次數與係數。" },
      en: { name: "Polynomials", goal: "Know degree and coefficients." },
      lesson: "ms.s2.polycoeff",
      types: ["polycoeff"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "ms.s3.arclen": {
      id: "ms.s3.arclen",
      stage: "ms3",
      order: 4,
      zh: { name: "弧長與扇形", goal: "會求扇形的弧長（以 π 表示）。" },
      en: { name: "Arc Length", goal: "Find arc length (in terms of π)." },
      lesson: "ms.s3.arclen",
      types: ["arclen"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "ms.s3.mode": {
      id: "ms.s3.mode",
      stage: "ms3",
      order: 5,
      zh: { name: "眾數", goal: "會求一組數據的眾數。" },
      en: { name: "Mode", goal: "Find the mode of a data set." },
      lesson: "ms.s3.mode",
      types: ["mode"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "hs.s4.circleeq": {
      id: "hs.s4.circleeq",
      stage: "hs1",
      order: 7,
      zh: { name: "圓的方程", goal: "會由 x² + y² = r² 求半徑。" },
      en: { name: "Equation of a Circle", goal: "Find the radius from x² + y² = r²." },
      lesson: "hs.s4.circleeq",
      types: ["circleeq"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "hs.s5.asum": {
      id: "hs.s5.asum",
      stage: "hs2",
      order: 6,
      zh: { name: "等差數列求和", goal: "會求等差數列前 n 項的和。" },
      en: { name: "Sum of Arithmetic Sequence", goal: "Sum the first n terms." },
      lesson: "hs.s5.asum",
      types: ["asum"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "hs.s5.invvar": {
      id: "hs.s5.invvar",
      stage: "hs2",
      order: 7,
      zh: { name: "反變", goal: "會解 y = k/x 的反變問題。" },
      en: { name: "Inverse Variation", goal: "Solve y = k/x problems." },
      lesson: "hs.s5.invvar",
      types: ["invvar"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "hs.s6.comb": {
      id: "hs.s6.comb",
      stage: "hs3",
      order: 4,
      zh: { name: "排列與組合", goal: "會計算排列 P(n,r) 與組合 C(n,r)。" },
      en: { name: "Permutation & Combination", goal: "Compute P(n,r) and C(n,r)." },
      lesson: "hs.s6.comb",
      types: ["comb"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "hs.s6.range": {
      id: "hs.s6.range",
      stage: "hs3",
      order: 5,
      zh: { name: "分佈域", goal: "會求一組數據的分佈域。" },
      en: { name: "Range", goal: "Find the range of a data set." },
      lesson: "hs.s6.range",
      types: ["range"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    /* ===================== 初中補缺 ===================== */
    "ms.s1.parallel": {
      id: "ms.s1.parallel",
      stage: "ms1",
      order: 7,
      zh: { name: "角與平行線", goal: "認識同位角、內錯角與同側內角。" },
      en: { name: "Angles & Parallel Lines", goal: "Know corresponding, alternate and co-interior angles." },
      lesson: "ms.s1.parallel",
      types: ["parallel"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "ms.s1.sqrt": {
      id: "ms.s1.sqrt",
      stage: "ms1",
      order: 8,
      zh: { name: "平方根", goal: "會求完全平方數的平方根。" },
      en: { name: "Square Roots", goal: "Find square roots of perfect squares." },
      lesson: "ms.s1.sqrt",
      types: ["sqrt"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "ms.s2.congruent": {
      id: "ms.s2.congruent",
      stage: "ms2",
      order: 6,
      zh: { name: "全等三角形", goal: "認識全等三角形的判定與性質。" },
      en: { name: "Congruent Triangles", goal: "Know congruence conditions and properties." },
      lesson: "ms.s2.congruent",
      types: ["congruent"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "ms.s2.similar": {
      id: "ms.s2.similar",
      stage: "ms2",
      order: 7,
      zh: { name: "相似三角形", goal: "認識相似圖形的放大倍數。" },
      en: { name: "Similar Triangles", goal: "Understand scale factor of similar shapes." },
      lesson: "ms.s2.similar",
      types: ["similar"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "ms.s2.quad": {
      id: "ms.s2.quad",
      stage: "ms2",
      order: 8,
      zh: { name: "四邊形", goal: "認識平行四邊形、梯形等的性質。" },
      en: { name: "Quadrilaterals", goal: "Know properties of parallelograms, trapezia, etc." },
      lesson: "ms.s2.quad",
      types: ["quadshape"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "ms.s2.sinterest": {
      id: "ms.s2.sinterest",
      stage: "ms2",
      order: 9,
      zh: { name: "單利息", goal: "會計算單利息。" },
      en: { name: "Simple Interest", goal: "Calculate simple interest." },
      lesson: "ms.s2.sinterest",
      types: ["sinterest"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "ms.s2.approx": {
      id: "ms.s2.approx",
      stage: "ms2",
      order: 10,
      zh: { name: "量度誤差", goal: "會求四捨五入的最大誤差。" },
      en: { name: "Errors in Measurement", goal: "Find the max error of rounding." },
      lesson: "ms.s2.approx",
      types: ["approx"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "ms.s3.cylinder": {
      id: "ms.s3.cylinder",
      stage: "ms3",
      order: 6,
      zh: { name: "圓柱體積", goal: "會求圓柱的體積與側面積。" },
      en: { name: "Volume of Cylinder", goal: "Find volume and curved surface area." },
      lesson: "ms.s3.cylinder",
      types: ["cylinder"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "ms.s3.expand": {
      id: "ms.s3.expand",
      stage: "ms3",
      order: 7,
      zh: { name: "展開（恆等式）", goal: "會展開 (x+a)(x+b)。" },
      en: { name: "Expanding Binomials", goal: "Expand (x+a)(x+b)." },
      lesson: "ms.s3.expand",
      types: ["expand"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "ms.s3.pichart": {
      id: "ms.s3.pichart",
      stage: "ms3",
      order: 8,
      zh: { name: "圓形圖", goal: "會由百分比求圓心角。" },
      en: { name: "Pie Charts", goal: "Find central angle from percentage." },
      lesson: "ms.s3.pichart",
      types: ["pichart"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    /* ===================== 補缺課題（三） ===================== */
    "g2.direction": {
      id: "g2.direction",
      stage: "g2",
      order: 7,
      zh: { name: "方向", goal: "認識東、南、西、北等方向。" },
      en: { name: "Directions", goal: "Know the compass directions." },
      lesson: "g2.direction",
      types: ["direction"],
      levels: [{}],
      mastery: { practice: 10, quizPass: 0.8 }
    },
    "g3.time24": {
      id: "g3.time24",
      stage: "g3",
      order: 9,
      zh: { name: "24 小時制", goal: "會換算 12 與 24 小時制。" },
      en: { name: "24-hour Clock", goal: "Convert between 12- and 24-hour time." },
      lesson: "g3.time24",
      types: ["time24"],
      levels: [{}],
      mastery: { practice: 10, quizPass: 0.8 }
    },
    "ms.s3.cone": {
      id: "ms.s3.cone",
      stage: "ms3",
      order: 9,
      zh: { name: "圓錐與球體", goal: "會求圓錐與球體的體積／表面積。" },
      en: { name: "Cone & Sphere", goal: "Find volume / surface area of cones and spheres." },
      lesson: "ms.s3.cone",
      types: ["cone"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "ms.s3.centre": {
      id: "ms.s3.centre",
      stage: "ms3",
      order: 10,
      zh: { name: "三角形的心", goal: "認識內心、外心、重心、垂心。" },
      en: { name: "Centres of a Triangle", goal: "Know incentre, circumcentre, centroid, orthocentre." },
      lesson: "ms.s3.centre",
      types: ["centre"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "ms.s3.prob": {
      id: "ms.s3.prob",
      stage: "ms3",
      order: 11,
      zh: { name: "概率", goal: "會求簡單事件的概率。" },
      en: { name: "Probability", goal: "Find the probability of simple events." },
      lesson: "ms.s3.prob",
      types: ["prob"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "hs.s4.circleangle": {
      id: "hs.s4.circleangle",
      stage: "hs1",
      order: 8,
      zh: { name: "圓周角與圓心角", goal: "會用圓心角 = 2 × 圓周角。" },
      en: { name: "Angles in a Circle", goal: "Use central angle = 2 × inscribed angle." },
      lesson: "hs.s4.circleangle",
      types: ["circleangle"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "hs.s6.binomial": {
      id: "hs.s6.binomial",
      stage: "hs3",
      order: 6,
      zh: { name: "二項式定理", goal: "會用 C(n,r) 求展開式的係數。" },
      en: { name: "Binomial Theorem", goal: "Use C(n,r) for expansion coefficients." },
      lesson: "hs.s6.binomial",
      types: ["binomial"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "hs.s6.derivative": {
      id: "hs.s6.derivative",
      stage: "hs3",
      order: 7,
      zh: { name: "微分入門", goal: "會求 x^n 的導數。" },
      en: { name: "Intro to Derivatives", goal: "Differentiate x^n." },
      lesson: "hs.s6.derivative",
      types: ["derivative"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "hs.s6.invtrig": {
      id: "hs.s6.invtrig",
      stage: "hs3",
      order: 10,
      zh: { name: "反三角函數", goal: "會求 arcsin、arccos、arctan 及三角複合。" },
      en: { name: "Inverse Trigonometric Functions", goal: "Evaluate arcsin, arccos, arctan and compositions." },
      lesson: "hs.s6.invtrig",
      types: ["invtrig"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "hs.s6.trigdouble": {
      id: "hs.s6.trigdouble",
      stage: "hs3",
      order: 11,
      zh: { name: "二倍角應用", goal: "會用二倍角公式求 sin 2θ、cos 2θ、tan 2θ。" },
      en: { name: "Double-angle Applications", goal: "Use double-angle formulae for sin 2θ, cos 2θ and tan 2θ." },
      lesson: "hs.s6.trigdouble",
      types: ["trigdouble"],
      levels: [{}],
      mastery: { practice: 12, quizPass: 0.8 }
    },
    "challenge.nt": {
      id: "challenge.nt",
      stage: "challenge",
      order: 1,
      zh: { name: "數論挑戰", goal: "用餘數、因數倍數與同餘解決競賽數論題。" },
      en: { name: "Number Theory Challenge", goal: "Use remainders, factors and congruences to solve olympiad-style number theory." },
      lesson: "challenge.nt",
      types: ["modpow", "gcdlcm", "remainderSystem", "lastdigit"],
      levels: [
        { maxBase: 6, maxExp: 3, maxMod: 10, maxNum: 24, input: true },
        { maxBase: 9, maxExp: 5, maxMod: 13, maxNum: 36, input: true },
        { maxBase: 9, maxExp: 9, maxMod: 19, maxNum: 60, input: true }
      ],
      mastery: { practice: 8, quizPass: 0.8 }
    },
    "challenge.count": {
      id: "challenge.count",
      stage: "challenge",
      order: 2,
      zh: { name: "組合計數", goal: "用排列組合、路徑數與容斥原理計數。" },
      en: { name: "Counting Challenge", goal: "Count with permutations, paths and inclusion–exclusion." },
      lesson: "challenge.count",
      types: ["pathcount", "handshake", "arrange", "inclusion", "gridrect"],
      levels: [
        { maxSteps: 5, maxPeople: 20, maxNum: 120, input: true },
        { maxSteps: 6, maxPeople: 30, maxNum: 200, input: true },
        { maxSteps: 7, maxPeople: 40, maxNum: 300, maxDim: 8, input: true }
      ],
      mastery: { practice: 8, quizPass: 0.8 }
    },
    "challenge.geo": {
      id: "challenge.geo",
      stage: "challenge",
      order: 3,
      zh: { name: "幾何與時間", goal: "計算時針分針夾角與梯形面積等競賽幾何題。" },
      en: { name: "Geometry & Time Challenge", goal: "Work out clock-hand angles and trapezium areas." },
      lesson: "challenge.geo",
      types: ["clockangle", "trapezoid", "polygonsum"],
      levels: [{ maxSide: 10, maxHeight: 8, input: true }, { maxSide: 12, maxHeight: 10, input: true }, { maxSide: 15, maxHeight: 12, input: true }],
      mastery: { practice: 8, quizPass: 0.8 }
    },
    "challenge.logic": {
      id: "challenge.logic",
      stage: "challenge",
      order: 4,
      zh: { name: "邏輯與規律", goal: "破解數列規律並用鴿巢原理作保證性推理。" },
      en: { name: "Logic & Patterns Challenge", goal: "Crack number patterns and reason with the pigeonhole principle." },
      lesson: "challenge.logic",
      types: ["seqnext", "pigeon"],
      levels: [{ maxColors: 4, maxSame: 3, input: true }, { maxColors: 5, maxSame: 4, input: true }, { maxColors: 6, maxSame: 5, input: true }],
      mastery: { practice: 8, quizPass: 0.8 }
    },
    "challenge.algebra": {
      id: "challenge.algebra",
      stage: "challenge",
      order: 5,
      zh: { name: "代數與應用", goal: "解決工程合作與混合濃度等多步應用題。" },
      en: { name: "Algebra & Applied Challenge", goal: "Solve multi-step work-rate and mixture problems." },
      lesson: "challenge.algebra",
      types: ["workrate", "mixture", "train"],
      levels: [{ input: true }, { input: true }, { input: true }],
      mastery: { practice: 8, quizPass: 0.8 }
    },
    "challenge.prob": {
      id: "challenge.prob",
      stage: "challenge",
      order: 6,
      zh: { name: "概率遊戲", goal: "計算骰子點數和與硬幣正面的古典概率。" },
      en: { name: "Probability Games", goal: "Compute dice-sum and coin-toss classical probabilities." },
      lesson: "challenge.prob",
      types: ["diceprob", "coinprob", "dicecompare"],
      levels: [{ input: true }, { input: true }, { input: true }],
      mastery: { practice: 8, quizPass: 0.8 }
    }
  };
  var stages = [
    {
      id: "prek",
      zh: "學前",
      en: "Pre-K",
      desc: { zh: "數數、比大小、10 以內的加減", en: "Counting, comparing, and adding/subtracting within 10" },
      color: "#34C759",
      emoji: "🌱",
      topics: [
        { id: "prek.num", zh: "認識數字", en: "Numbers", skills: ["prek.count", "prek.compare"] },
        { id: "prek.calc", zh: "加減啟蒙", en: "First Addition", skills: ["prek.add10", "prek.sub10", "prek.bonds10", "prek.word"] }
      ]
    },
    {
      id: "g1",
      zh: "小一",
      en: "Primary 1",
      desc: { zh: "20 以內加減、100 以內的數", en: "Add/subtract within 20, numbers within 100" },
      color: "#FF9500",
      emoji: "☀️",
      topics: [
        { id: "g1.calc", zh: "加減運算", en: "Add & Subtract", skills: ["g1.add20", "g1.sub20"] },
        { id: "g1.num", zh: "更大的數", en: "Bigger Numbers", skills: ["g1.place100", "g1.addsub100"] },
        { id: "g1.word", zh: "解決問題", en: "Word Problems", skills: ["g1.word"] },
        { id: "g1.money", zh: "貨幣", en: "Money", skills: ["g1.money"] },
        { id: "g1.oddeven", zh: "單雙數", en: "Odd & Even", skills: ["g1.oddeven"] }
      ]
    },
    {
      id: "g2",
      zh: "小二",
      en: "Primary 2",
      desc: { zh: "100 以內進退位、乘法啟蒙", en: "Regrouping within 100, intro to multiplication" },
      color: "#007AFF",
      emoji: "🌈",
      topics: [
        { id: "g2.calc", zh: "進退位加減", en: "Add & Subtract", skills: ["g2.addsub100r"] },
        { id: "g2.mul", zh: "乘法啟蒙", en: "Multiplication", skills: ["g2.mul25", "g2.mul34"] },
        { id: "g2.div", zh: "除法", en: "Division", skills: ["g2.div", "g2.word"] },
        { id: "g2.unit", zh: "度量", en: "Measures", skills: ["g2.fact"] },
        { id: "g2.dir", zh: "圖形與空間", en: "Shape & Space", skills: ["g2.direction"] }
      ]
    },
    {
      id: "g3",
      zh: "小三",
      en: "Primary 3",
      desc: { zh: "乘法表、多位數、分數入門", en: "Times tables, multi-digit, intro to fractions" },
      color: "#AF52DE",
      emoji: "🚀",
      topics: [
        { id: "g3.mul", zh: "乘法表", en: "Times Tables", skills: ["g3.multable", "g3.mulfree"] },
        { id: "g3.calc", zh: "多位數與乘除", en: "Big Numbers", skills: ["g3.addsubbig", "g3.muldiv"] },
        { id: "g3.frac", zh: "分數", en: "Fractions", skills: ["g3.fraction", "g3.word"] },
        { id: "g3.geo", zh: "圖形與空間", en: "Shape & Space", skills: ["g3.angle"] },
        { id: "g3.shape", zh: "圖形與空間（續）", en: "Shape & Space (cont.)", skills: ["g3.shape"] },
        { id: "g3.time", zh: "度量（續）", en: "Measures (cont.)", skills: ["g3.time24"] }
      ]
    },
    {
      id: "g4",
      zh: "小四",
      en: "Primary 4",
      desc: { zh: "多位數乘除、分數、小數、面積", en: "Multi-digit, fractions, decimals, area" },
      color: "#5AC8FA",
      emoji: "🧭",
      topics: [
        { id: "g4.num", zh: "數與運算", en: "Numbers & Operations", skills: ["g4.multidigit", "g4.fractionadd", "g4.decimal"] },
        { id: "g4.geo", zh: "度量", en: "Measurement", skills: ["g4.area", "g4.triangle"] },
        { id: "g4.word", zh: "解決問題", en: "Word Problems", skills: ["g4.word"] },
        { id: "g4.peri", zh: "度量（續）", en: "Measurement (cont.)", skills: ["g4.perimeter"] }
      ]
    },
    {
      id: "g5",
      zh: "小五",
      en: "Primary 5",
      desc: { zh: "小數乘除、平均數、分數乘法", en: "Decimal ×/÷, averages, fraction of a number" },
      color: "#5856D6",
      emoji: "⛰️",
      topics: [
        { id: "g5.num", zh: "數與運算", en: "Numbers & Operations", skills: ["g5.decimalmul", "g5.fractionof", "g5.fractiondiff", "g5.fractionmul", "g5.estimation", "g5.fraccompare", "g5.decimalmixed"] },
        { id: "g5.measure", zh: "度量", en: "Measurement", skills: ["g5.area2", "g5.volume1"] },
        { id: "g5.data", zh: "數據處理", en: "Data Handling", skills: ["g5.average", "g5.chart"] },
        { id: "g5.shape", zh: "圖形與空間", en: "Shape & Space", skills: ["g5.rotation", "g5.circle"] },
        { id: "g5.algebra", zh: "代數", en: "Algebra", skills: ["g5.algebra"] },
        { id: "g5.word", zh: "解決問題", en: "Word Problems", skills: ["g5.word"] }
      ]
    },
    {
      id: "g6",
      zh: "小六",
      en: "Primary 6",
      desc: { zh: "方程、百分數、比與比例", en: "Equations, percentages, ratio" },
      color: "#FF2D55",
      emoji: "🏆",
      topics: [
        { id: "g6.alg", zh: "代數", en: "Algebra", skills: ["g6.equation"] },
        { id: "g6.num", zh: "數與比例", en: "Numbers & Ratio", skills: ["g6.percent", "g6.ratio"] },
        { id: "g6.geo", zh: "度量", en: "Measurement", skills: ["g6.circle", "g6.volume"] },
        { id: "g6.word", zh: "解決問題", en: "Word Problems", skills: ["g6.word"] },
        { id: "g6.sym", zh: "圖形與空間", en: "Shape & Space", skills: ["g6.symmetry"] }
      ]
    },
    {
      id: "ms1",
      zh: "中一",
      en: "S1",
      desc: { zh: "有向數、代數式求值、一元一次方程", en: "Directed numbers, substitution, linear equations" },
      color: "#FF3B30",
      emoji: "🎓",
      topics: [
        { id: "ms1.num", zh: "數與代數", en: "Number & Algebra", skills: ["ms.s1.directed", "ms.s1.exprsub", "ms.s1.linear"] },
        { id: "ms1.geo", zh: "圖形與空間", en: "Shape & Space", skills: ["ms.s1.coord"] },
        { id: "ms1.word", zh: "解決問題", en: "Word Problems", skills: ["ms.s1.word"] },
        { id: "ms1.lt", zh: "數與代數（續）", en: "Number & Algebra (cont.)", skills: ["ms.s1.liketerms"] },
        { id: "ms1.geo2", zh: "圖形與空間（續）", en: "Shape & Space (cont.)", skills: ["ms.s1.parallel"] },
        { id: "ms1.num2", zh: "數與代數（續二）", en: "Number & Algebra (cont.)", skills: ["ms.s1.sqrt"] }
      ]
    },
    {
      id: "ms2",
      zh: "中二",
      en: "S2",
      desc: { zh: "畢氏定理、聯立方程", en: "Pythagoras, simultaneous equations" },
      color: "#FF6B35",
      emoji: "📐",
      topics: [
        { id: "ms2.geo", zh: "圖形與空間", en: "Shape & Space", skills: ["ms.s2.pythagoras"] },
        { id: "ms2.alg", zh: "代數", en: "Algebra", skills: ["ms.s2.simul"] },
        { id: "ms2.word", zh: "解決問題", en: "Word Problems", skills: ["ms.s2.word"] },
        { id: "ms2.poly", zh: "圖形與空間（續）", en: "Shape & Space (cont.)", skills: ["ms.s2.polygon"] },
        { id: "ms2.polyc", zh: "代數（續）", en: "Algebra (cont.)", skills: ["ms.s2.polycoeff"] },
        { id: "ms2.geo3", zh: "圖形與空間（續二）", en: "Shape & Space (cont.)", skills: ["ms.s2.congruent", "ms.s2.similar", "ms.s2.quad"] },
        { id: "ms2.num", zh: "數與代數（續二）", en: "Number & Algebra (cont.)", skills: ["ms.s2.sinterest", "ms.s2.approx"] },
        { id: "ms2.id", zh: "代數（續二）", en: "Algebra (cont.)", skills: ["ms.s2.identity"] }
      ]
    },
    {
      id: "ms3",
      zh: "中三",
      en: "S3",
      desc: { zh: "指數定律、一元一次不等式", en: "Laws of indices, linear inequalities" },
      color: "#FF8C42",
      emoji: "🧮",
      topics: [
        { id: "ms3.num", zh: "數與代數", en: "Number & Algebra", skills: ["ms.s3.indices", "ms.s3.inequality"] },
        { id: "ms3.word", zh: "解決問題", en: "Word Problems", skills: ["ms.s3.word"] },
        { id: "ms3.geo2", zh: "度量（續）", en: "Measures (cont.)", skills: ["ms.s3.arclen"] },
        { id: "ms3.data", zh: "數據處理", en: "Data Handling", skills: ["ms.s3.mode"] },
        { id: "ms3.geo3", zh: "度量（續二）", en: "Measures (cont.)", skills: ["ms.s3.cylinder"] },
        { id: "ms3.alg", zh: "代數", en: "Algebra", skills: ["ms.s3.expand"] },
        { id: "ms3.data2", zh: "數據處理（續）", en: "Data Handling (cont.)", skills: ["ms.s3.pichart"] },
        { id: "ms3.geo4", zh: "度量（續三）", en: "Measures (cont.)", skills: ["ms.s3.cone"] },
        { id: "ms3.geo5", zh: "圖形與空間", en: "Shape & Space", skills: ["ms.s3.centre"] },
        { id: "ms3.data3", zh: "數據處理（續二）", en: "Data Handling (cont.)", skills: ["ms.s3.prob"] },
        { id: "ms3.meas2", zh: "度量（續四）", en: "Measures (cont.)", skills: ["ms.s3.sector", "ms.s3.prism"] }
      ]
    },
    {
      id: "hs1",
      zh: "中四",
      en: "S4",
      desc: { zh: "對數、函數求值、三角比", en: "Logarithms, function values, trigonometric ratios" },
      color: "#A2845E",
      emoji: "🧠",
      topics: [
        { id: "hs1.num", zh: "數與代數", en: "Number & Algebra", skills: ["hs.s4.log", "hs.s4.fx"] },
        { id: "hs1.trig", zh: "三角學", en: "Trigonometry", skills: ["hs.s4.trig", "hs.s4.identities"] },
        { id: "hs1.word", zh: "解決問題", en: "Word Problems", skills: ["hs.s4.word"] },
        { id: "hs1.quad", zh: "代數（續）", en: "Algebra (cont.)", skills: ["hs.s4.quadsolve"] },
        { id: "hs1.geo", zh: "圖形與空間", en: "Shape & Space", skills: ["hs.s4.line"] },
        { id: "hs1.geo2", zh: "圖形與空間（續）", en: "Shape & Space (cont.)", skills: ["hs.s4.circleeq"] },
        { id: "hs1.geo3", zh: "圖形與空間（續二）", en: "Shape & Space (cont.)", skills: ["hs.s4.circleangle"] },
        { id: "hs1.alg2", zh: "代數（續二）", en: "Algebra (cont.)", skills: ["hs.s4.quad2"] },
        { id: "hs1.geo4", zh: "圖形與空間（續三）", en: "Shape & Space (cont.)", skills: ["hs.s4.line2", "hs.s4.circleprop"] }
      ]
    },
    {
      id: "hs2",
      zh: "中五",
      en: "S5",
      desc: { zh: "等差、等比數列、概率", en: "Arithmetic and geometric sequences, probability" },
      color: "#8B6F47",
      emoji: "📈",
      topics: [
        { id: "hs2.seq", zh: "數列", en: "Sequences", skills: ["hs.s5.ap", "hs.s5.gp"] },
        { id: "hs2.trig", zh: "三角學（續）", en: "Trigonometry (cont.)", skills: ["hs.s5.sinerule", "hs.s5.triggraph"] },
        { id: "hs2.trig2", zh: "三角學（二）", en: "Trigonometry II", skills: ["hs.s5.compound", "hs.s5.radian", "hs.s5.trigeq"] },
        { id: "hs2.prob", zh: "概率", en: "Probability", skills: ["hs.s5.prob"] },
        { id: "hs2.word", zh: "解決問題", en: "Word Problems", skills: ["hs.s5.word"] },
        { id: "hs2.alg", zh: "代數", en: "Algebra", skills: ["hs.s5.variation"] },
        { id: "hs2.seq2", zh: "數列（續）", en: "Sequences (cont.)", skills: ["hs.s5.asum", "hs.s5.gpsum"] },
        { id: "hs2.alg2", zh: "代數（續）", en: "Algebra (cont.)", skills: ["hs.s5.invvar"] },
        { id: "hs2.stat", zh: "統計", en: "Statistics", skills: ["hs.s5.dispersion"] }
      ]
    },
    {
      id: "hs3",
      zh: "中六",
      en: "S6",
      desc: { zh: "二次方程的根、中位數", en: "Roots of quadratics, median" },
      color: "#7A5F3C",
      emoji: "📊",
      topics: [
        { id: "hs3.alg", zh: "代數", en: "Algebra", skills: ["hs.s6.quad"] },
        { id: "hs3.stats", zh: "統計", en: "Statistics", skills: ["hs.s6.stats"] },
        { id: "hs3.word", zh: "解決問題", en: "Word Problems", skills: ["hs.s6.word"] },
        { id: "hs3.data", zh: "數據處理（續）", en: "Data Handling (cont.)", skills: ["hs.s6.comb", "hs.s6.range", "hs.s6.prob2"] },
        { id: "hs3.alg2", zh: "代數（續）", en: "Algebra (cont.)", skills: ["hs.s6.binomial", "hs.s6.binomial2", "hs.s6.derivative"] },
        { id: "hs3.trig", zh: "三角學（三）", en: "Trigonometry III", skills: ["hs.s6.invtrig", "hs.s6.trigdouble"] }
      ]
    },
    {
      id: "college",
      zh: "大學",
      en: "University",
      desc: { zh: "微積分、線性代數、概率統計", en: "Calculus, linear algebra, statistics" },
      color: "#8E8E93",
      emoji: "🎯",
      topics: [
        { id: "col.calc", zh: "微積分", en: "Calculus", skills: ["col.calculus", "col.calculus2", "col.ode", "col.trigcalc"] },
        { id: "col.lin", zh: "線性代數", en: "Linear Algebra", skills: ["col.linalg", "col.linalg2"] },
        { id: "col.prob", zh: "概率統計", en: "Statistics", skills: ["col.prob", "col.stats2"] },
        { id: "col.nt", zh: "數論", en: "Number Theory", skills: ["col.nt"] }
      ]
    },
    {
      id: "grad",
      zh: "研究院",
      en: "Graduate School",
      desc: { zh: "實分析、抽象代數、拓撲學", en: "Real analysis, abstract algebra, topology" },
      color: "#5E5E7A",
      emoji: "🎓",
      topics: [
        { id: "grad.analysis.t", zh: "實分析", en: "Real Analysis", skills: ["grad.analysis"] },
        { id: "grad.algebra.t", zh: "抽象代數", en: "Abstract Algebra", skills: ["grad.algebra"] },
        { id: "grad.topology.t", zh: "拓撲學", en: "Topology", skills: ["grad.topology"] },
        { id: "grad.analysis2.t", zh: "測度論", en: "Measure Theory", skills: ["grad.measure"] },
        { id: "grad.geometry.t", zh: "微分幾何", en: "Differential Geometry", skills: ["grad.geometry"] },
        { id: "grad.category.t", zh: "範疇論", en: "Category Theory", skills: ["grad.category"] }
      ]
    },
    {
      id: "challenge",
      zh: "挑戰區",
      en: "Challenge",
      desc: { zh: "奧林匹克風格的額外難題：數論、計數、幾何、邏輯、代數與概率", en: "Extra-hard olympiad-style problems: number theory, counting, geometry, logic, algebra and probability" },
      color: "#B07C2A",
      emoji: "🏆",
      topics: [
        { id: "chal.nt", zh: "數論", en: "Number Theory", skills: ["challenge.nt"] },
        { id: "chal.count", zh: "組合計數", en: "Counting", skills: ["challenge.count"] },
        { id: "chal.geo", zh: "幾何與時間", en: "Geometry & Time", skills: ["challenge.geo"] },
        { id: "chal.logic", zh: "邏輯與規律", en: "Logic & Patterns", skills: ["challenge.logic"] },
        { id: "chal.algebra", zh: "代數與應用", en: "Algebra & Applied", skills: ["challenge.algebra"] },
        { id: "chal.prob", zh: "概率遊戲", en: "Probability Games", skills: ["challenge.prob"] }
      ]
    }
  ];
  var Curriculum = { stages, skills };

  // data-entry.js
  (typeof window !== "undefined" ? window : globalThis).Curriculum = Curriculum;
})();
