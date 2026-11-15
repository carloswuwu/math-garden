/*
 * 課程內容：每個技能的「小課堂」講解（雙語）。
 * 結構：
 *  - zh.title / zh.intro / zh.example / zh.tip
 *  - en.title / en.intro / en.example / en.tip
 *  - visual：可選的圖示（與題目共用同一套渲染器）
 *     kind ∈ { count, compare, counters, grid, fraction }；null 表示純文字。
 */
(function (root) {
  'use strict';

  var L = {

    /* ---------- Pre-K ---------- */

    'prek.count': {
      zh: { title: '數一數', intro: '用手指一個一個地數，最後一個數就是「一共有幾個」。', example: '●●●●● 一共是 5 個。', tip: '數的時候不要跳，也不要重復數同一個。' },
      en: { title: 'Counting', intro: 'Point and count one by one. The last number you say is the total.', example: '●●●●● that is 5 in all.', tip: 'Do not skip any, and do not count the same one twice.' },
      visual: { kind: 'count', n: 5 }
    },

    'prek.compare': {
      zh: { title: '比大小', intro: '比較兩組東西，哪組多，那個數就更大。', example: '●●●●● 和 ●●●，5 比 3 大。', tip: '可以一個對一個地比。' },
      en: { title: 'Compare Numbers', intro: 'Compare two groups. The group with more is the bigger number.', example: '●●●●● and ●●●, so 5 is bigger than 3.', tip: 'Match them one-to-one to compare.' },
      visual: { kind: 'compare', a: 5, b: 3 }
    },

    'prek.add10': {
      zh: { title: '10 以內的加法', intro: '加法就是「合起來」。先數第一堆，再接著數第二堆。', example: '3 + 2 = 5（3 個和 2 個合起來是 5 個）', tip: '從大的那個數開始數，會更快。' },
      en: { title: 'Addition within 10', intro: 'Addition means "putting together". Count the first group, then keep counting the second.', example: '3 + 2 = 5 (3 and 2 together make 5)', tip: 'Start counting from the bigger number to be faster.' },
      visual: { kind: 'counters', a: 3, b: 2 }
    },

    'prek.sub10': {
      zh: { title: '10 以內的減法', intro: '減法就是「拿走」。從總數裡拿走一些，剩下多少就是答案。', example: '5 − 2 = 3（5 個拿走 2 個，還剩 3 個）', tip: '用手指或圓點擺一擺，拿走再數剩下。' },
      en: { title: 'Subtraction within 10', intro: 'Subtraction means "taking away". Take some from the total and count what is left.', example: '5 − 2 = 3 (from 5 take 2, 3 are left)', tip: 'Use your fingers or dots, take away, then count the rest.' },
      visual: { kind: 'counters', a: 5, b: 2 }
    },

    'prek.bonds10': {
      zh: { title: '數的分解', intro: '一個數可以分成「幾和幾」。知道 7 可以分成 3 和 4，就能做加減法。', example: '7 = 3 + 4，所以 3 + ? = 7 的答案是 4。', tip: '多練習幾組，很快就能記住。' },
      en: { title: 'Number Bonds', intro: 'A number can split into two parts. If you know 7 splits into 3 and 4, you can add and subtract.', example: '7 = 3 + 4, so the answer to 3 + ? = 7 is 4.', tip: 'Practice a few pairs and you will remember them.' },
      visual: { kind: 'counters', a: 4, b: 3 }
    },

    /* ---------- Grade 1 ---------- */

    'g1.add20': {
      zh: { title: '20 以內的加法', intro: '用「湊十法」：先把一個數湊成 10，再加剩下的。', example: '8 + 5 = 8 + 2 + 3 = 10 + 3 = 13', tip: '看哪個數離 10 更近，先湊十。' },
      en: { title: 'Addition within 20', intro: 'Use "make ten": first make 10, then add what is left.', example: '8 + 5 = 8 + 2 + 3 = 10 + 3 = 13', tip: 'Look at which number is closer to 10 and make ten first.' },
      visual: { kind: 'counters', a: 8, b: 5 }
    },

    'g1.sub20': {
      zh: { title: '20 以內的減法', intro: '減法可以用「想加算減」：想誰加上減數等於被減數。', example: '13 − 6 = ? 想 6 + 7 = 13，所以 13 − 6 = 7。', tip: '把減法變成「加法的反過來」。' },
      en: { title: 'Subtraction within 20', intro: 'Subtract by thinking of addition: what plus the small number makes the big number?', example: '13 − 6 = ? Think 6 + 7 = 13, so 13 − 6 = 7.', tip: 'Turn subtraction into "the reverse of addition".' },
      visual: { kind: 'counters', a: 13, b: 6 }
    },

    'g1.place100': {
      zh: { title: '100 以內的數', intro: '兩位數由「十位」和「個位」組成。1 個十加 4 個一就是 14。', example: '14 = 1 個十 + 4 個一；比較 23 和 32，看十位，3 比 2 大，所以 32 更大。', tip: '先比十位，十位相同再比個位。' },
      en: { title: 'Numbers within 100', intro: 'A two-digit number has tens and ones. 1 ten plus 4 ones is 14.', example: '14 = 1 ten + 4 ones. To compare 23 and 32, look at tens: 3 > 2, so 32 is bigger.', tip: 'Compare tens first; if equal, compare ones.' },
      visual: { kind: 'counters', a: 10, b: 4 }
    },

    'g1.addsub100': {
      zh: { title: '100 以內的加減', intro: '整十數相加減，就像個位數一樣，只是後面多個 0。', example: '30 + 20 = 50；70 − 40 = 30', tip: '先把十位上的數相加減。' },
      en: { title: 'Add & Subtract within 100', intro: 'Adding tens is like adding ones, just with an extra zero.', example: '30 + 20 = 50; 70 − 40 = 30', tip: 'Add or subtract the tens digits first.' },
      visual: null
    },

    'g1.word': {
      zh: { title: '簡單應用題', intro: '先讀懂題目：問「一共」常用加法，問「還剩」常用減法。', example: '有 8 個蘋果，吃了 3 個，還剩幾個？8 − 3 = 5。', tip: '圈出題目裡的數字和關鍵詞。' },
      en: { title: 'Word Problems', intro: 'Read carefully: "in all" often means add; "left" often means subtract.', example: '8 apples, eat 3. How many left? 8 − 3 = 5.', tip: 'Circle the numbers and the key words.' },
      visual: null
    },

    /* ---------- Grade 2 ---------- */

    'g2.addsub100r': {
      zh: { title: '100 以內加減（進退位）', intro: '個位滿 10 要「進位」，個位不夠減要「退位」。', example: '48 + 27：8+7=15 寫 5 進 1，4+2+1=7，結果是 75。', tip: '從個位算起，滿了 10 記得進位。' },
      en: { title: 'Add & Subtract with Regrouping', intro: 'When ones reach 10, carry; when not enough, borrow.', example: '48 + 27: 8+7=15, write 5 carry 1, then 4+2+1=7, so 75.', tip: 'Start from the ones and remember to carry.' },
      visual: null
    },

    'g2.mul25': {
      zh: { title: '乘法：2、5、10', intro: '乘法是「幾個幾相加」。3 個 2 就是 3 × 2 = 6。', example: '2 × 5 = 10，5 × 2 = 10，10 × 3 = 30。', tip: '2、5、10 的表最好背，先背熟它們。' },
      en: { title: 'Multiplication: 2, 5, 10', intro: 'Multiplication is "groups of". 3 groups of 2 is 3 × 2 = 6.', example: '2 × 5 = 10, 5 × 2 = 10, 10 × 3 = 30.', tip: 'The 2, 5, and 10 tables are easiest — learn them first.' },
      visual: { kind: 'grid', a: 3, b: 2 }
    },

    'g2.mul34': {
      zh: { title: '乘法：3、4', intro: '3 的乘法就是每次加 3；4 的乘法就是每次加 4。', example: '3 × 4 = 12，4 × 3 = 12。', tip: '可以用已經會的加法來推。' },
      en: { title: 'Multiplication: 3, 4', intro: 'The 3 times table adds 3 each time; the 4 times table adds 4.', example: '3 × 4 = 12, 4 × 3 = 12.', tip: 'Use addition you already know to work it out.' },
      visual: { kind: 'grid', a: 4, b: 3 }
    },

    'g2.div': {
      zh: { title: '簡單除法', intro: '除法是「平均分」。把 12 平均分成 4 份，每份是 3。', example: '12 ÷ 4 = 3（因為 4 × 3 = 12）', tip: '除法可以想乘法口訣。' },
      en: { title: 'Simple Division', intro: 'Division means "sharing equally". Share 12 into 4 groups, each has 3.', example: '12 ÷ 4 = 3 (because 4 × 3 = 12)', tip: 'Think of the times table to divide.' },
      visual: { kind: 'grid', a: 4, b: 3 }
    },

    'g2.word': {
      zh: { title: '加減乘應用題', intro: '判斷用哪種運算：合起來用加，拿走用減，幾個幾用乘。', example: '每盒 4 個，有 3 盒，一共幾個？4 × 3 = 12。', tip: '看到「每個/每盒」多是乘法。' },
      en: { title: 'Word Problems', intro: 'Decide the operation: putting together = add, taking away = subtract, groups of = multiply.', example: '4 in each box, 3 boxes. How many? 4 × 3 = 12.', tip: '"Each" or "per" often means multiply.' },
      visual: null
    },

    /* ---------- Grade 3 ---------- */

    'g3.multable': {
      zh: { title: '乘法表：6、7、8、9', intro: '把剩下的 6、7、8、9 的乘法口訣背熟，口算就快了。', example: '6 × 7 = 42，7 × 8 = 56，9 × 9 = 81。', tip: '大數表可以從已會的表推出來。' },
      en: { title: 'Times Tables: 6, 7, 8, 9', intro: 'Learn the 6, 7, 8, 9 tables to multiply quickly.', example: '6 × 7 = 42, 7 × 8 = 56, 9 × 9 = 81.', tip: 'You can build big tables from the ones you already know.' },
      visual: { kind: 'grid', a: 7, b: 6 }
    },

    'g3.mulfree': {
      zh: { title: '混合乘法', intro: '任意兩個一位數相乘都要能快速算出。', example: '8 × 6 = 48，7 × 9 = 63。', tip: '交換因數，答案不變（6 × 8 = 8 × 6）。' },
      en: { title: 'Mixed Multiplication', intro: 'Multiply any two single-digit numbers quickly.', example: '8 × 6 = 48, 7 × 9 = 63.', tip: 'Order does not matter: 6 × 8 = 8 × 6.' },
      visual: { kind: 'grid', a: 6, b: 7 }
    },

    'g3.addsubbig': {
      zh: { title: '多位數加減', intro: '多位數加減要從個位起，一位一位地對齊算。', example: '356 + 128 = 484；500 − 137 = 363。', tip: '列豎式時把相同數位對齊。' },
      en: { title: 'Multi-digit Add & Subtract', intro: 'Add and subtract multi-digit numbers column by column.', example: '356 + 128 = 484; 500 − 137 = 363.', tip: 'Line up the same place values.' },
      visual: null
    },

    'g3.muldiv': {
      zh: { title: '乘除混合', intro: '乘法和除法是一對好朋友，會乘法就會除法。', example: '因為 6 × 7 = 42，所以 42 ÷ 6 = 7。', tip: '做除法時想對應的乘法口訣。' },
      en: { title: 'Multiply & Divide', intro: 'Multiplication and division are friends; know one and you know the other.', example: 'Since 6 × 7 = 42, then 42 ÷ 6 = 7.', tip: 'Think of the matching times-table fact to divide.' },
      visual: null
    },

    'g3.fraction': {
      zh: { title: '分數入門', intro: '把一個整體平均分成幾份，取其中幾份就是「幾分之幾」。', example: '把圓平均分成 4 份，涂了 3 份，就是 3/4。', tip: '上面是分子（涂色份數），下面是分母（總份數）。' },
      en: { title: 'Intro to Fractions', intro: 'Split a whole into equal parts; the shaded parts make a fraction.', example: 'A circle split into 4 equal parts with 3 shaded is 3/4.', tip: 'Top number = shaded parts (numerator); bottom = total parts (denominator).' },
      visual: { kind: 'fraction', n: 3, d: 4 }
    },

    'g3.word': {
      zh: { title: '綜合應用題', intro: '認真讀題，找出數量關系，再決定用哪種運算。', example: '每袋 6 個，有 8 袋，用了 10 個，還剩幾個？6 × 8 − 10 = 38。', tip: '分步思考：先乘，再減。' },
      en: { title: 'Mixed Word Problems', intro: 'Read carefully, find the relationship, then choose the operations.', example: '6 per bag, 8 bags, use 10. How many left? 6 × 8 − 10 = 38.', tip: 'Think in steps: first multiply, then subtract.' },
      visual: null
    },

    /* ---------- 小四 ---------- */

    'g4.multidigit': {
      zh: { title: '多位數乘除', intro: '兩位數乘一位數、多位數除以一位數，都可以用豎式一步一步算。', example: '23 × 4 = 92；96 ÷ 6 = 16。', tip: '從個位算起，記得進位和退位。' },
      en: { title: 'Multi-digit Multiply & Divide', intro: 'Use the column method step by step for multi-digit × and ÷.', example: '23 × 4 = 92; 96 ÷ 6 = 16.', tip: 'Start from the ones and remember to carry/borrow.' },
      visual: null
    },

    'g4.fractionadd': {
      zh: { title: '同分母分數加減', intro: '分母相同的分數相加減，分子直接相加減，分母不變。', example: '2/5 + 1/5 = 3/5；4/7 − 2/7 = 2/7。', tip: '分母不變，只算上面的分子。' },
      en: { title: 'Adding & Subtracting Fractions', intro: 'When denominators match, add or subtract the numerators and keep the denominator.', example: '2/5 + 1/5 = 3/5; 4/7 − 2/7 = 2/7.', tip: 'Keep the denominator; only work with the numerators.' },
      visual: null
    },

    'g4.decimal': {
      zh: { title: '小數加減', intro: '小數加減要把小數點對齊，再像整數一樣一位一位地算。', example: '3.5 + 2.4 = 5.9；7.8 − 3.2 = 4.6。', tip: '小數點一定要上下對齊。' },
      en: { title: 'Decimal Addition & Subtraction', intro: 'Line up the decimal points, then add or subtract like whole numbers.', example: '3.5 + 2.4 = 5.9; 7.8 − 3.2 = 4.6.', tip: 'Always line up the decimal points.' },
      visual: null
    },

    'g4.area': {
      zh: { title: '長方形面積與周長', intro: '面積 = 長 × 闊；周長 = (長 + 闊) × 2。', example: '長 5 cm、闊 3 cm：面積 15 cm²，周長 16 cm。', tip: '面積用「平方」，周長用「長度」。' },
      en: { title: 'Area & Perimeter', intro: 'Area = length × width; perimeter = (length + width) × 2.', example: '5 cm by 3 cm: area 15 cm², perimeter 16 cm.', tip: 'Area is in square units; perimeter is a length.' },
      visual: null
    },

    /* ---------- 小五 ---------- */

    'g5.decimalmul': {
      zh: { title: '小數乘除', intro: '小數乘除可以先當整數算，最後再點上小數點。', example: '2.4 × 3 = 7.2；7.2 ÷ 3 = 2.4。', tip: '先不看小數點，算完再數位數點回去。' },
      en: { title: 'Decimal Multiply & Divide', intro: 'Multiply or divide as whole numbers first, then place the decimal point.', example: '2.4 × 3 = 7.2; 7.2 ÷ 3 = 2.4.', tip: 'Ignore the point, calculate, then put the point back.' },
      visual: null
    },

    'g5.average': {
      zh: { title: '平均數', intro: '平均數 = 全部加起來 ÷ 個數。', example: '3、7、8 的平均數是 (3+7+8) ÷ 3 = 6。', tip: '先加總，再除以有幾個數。' },
      en: { title: 'Averages', intro: 'Average = total ÷ how many.', example: 'The average of 3, 7, 8 is (3+7+8) ÷ 3 = 6.', tip: 'Add them up first, then divide by the count.' },
      visual: null
    },

    'g5.fractionof': {
      zh: { title: '求一個數的幾分之幾', intro: '求一個數的幾分之幾：先除以分母，再乘以分子。', example: '12 的 3/4：12 ÷ 4 = 3，3 × 3 = 9。', tip: '先除後乘。' },
      en: { title: 'Fraction of a Number', intro: 'To find a fraction of a number: divide by the denominator, then multiply by the numerator.', example: '3/4 of 12: 12 ÷ 4 = 3, then 3 × 3 = 9.', tip: 'Divide first, then multiply.' },
      visual: null
    },

    /* ---------- 小六 ---------- */

    'g6.equation': {
      zh: { title: '簡易方程', intro: '把未知數 x 單獨留在等號一邊，就能求出 x。', example: 'x + 7 = 15，所以 x = 15 − 7 = 8。', tip: '移項要變號：加變減、減變加。' },
      en: { title: 'Simple Equations', intro: 'Get x alone on one side to find its value.', example: 'x + 7 = 15, so x = 15 − 7 = 8.', tip: 'When moving a term, flip its sign.' },
      visual: null
    },

    'g6.percent': {
      zh: { title: '百分數', intro: '百分之幾就是「除以 100」。求一個數的幾%，先算 1% 再相乘。', example: '200 的 25% = 50；20 是 80 的 25%。', tip: '百分之幾 = 小數（25% = 0.25）。' },
      en: { title: 'Percentages', intro: 'Percent means "out of 100". Find 1% first, then multiply.', example: '25% of 200 = 50; 20 is 25% of 80.', tip: 'Percent → decimal (25% = 0.25).' },
      visual: null
    },

    'g6.ratio': {
      zh: { title: '比與比例', intro: '比 a : b 表示 a 份對 b 份，先算出一份是多少。', example: '3 : 2，甲是 12，一份是 4，所以乙是 8。', tip: '先除以自己的份數，再乘另一邊的份數。' },
      en: { title: 'Ratio & Proportion', intro: 'The ratio a : b means a parts to b parts; find one part first.', example: '3 : 2 with A = 12: one part is 4, so B = 8.', tip: 'Divide by your parts, then multiply by the other side.' },
      visual: null
    },

    /* ---------- 中一（S1） ---------- */

    'ms.s1.directed': {
      zh: { title: '有向數', intro: '正負數相加減，先看符號；乘除時，同號得正、異號得負。', example: '(-5) + 3 = -2；(-4) × (-3) = 12；12 ÷ (-3) = -4。', tip: '減去一個負數，等於加上它的相反數。' },
      en: { title: 'Directed Numbers', intro: 'For adding/subtracting, watch the signs; for ×/÷, same signs give +, different signs give −.', example: '(-5) + 3 = -2; (-4) × (-3) = 12; 12 ÷ (-3) = -4.', tip: 'Subtracting a negative is the same as adding its opposite.' },
      visual: null
    },
    'ms.s1.exprsub': {
      zh: { title: '代數式求值', intro: '把已知的數代入字母，再按運算順序計算。', example: '已知 x = 4，2x + 3 = 2 × 4 + 3 = 11。', tip: '代入後，先乘除後加減。' },
      en: { title: 'Substitution', intro: 'Replace the letter with the given number, then calculate in the correct order.', example: 'If x = 4, then 2x + 3 = 2 × 4 + 3 = 11.', tip: 'After substituting, multiply/divide before adding/subtracting.' },
      visual: null
    },
    'ms.s1.linear': {
      zh: { title: '一元一次方程', intro: '把常數移到等號右邊，再兩邊除以 x 的係數，就求得 x。', example: '2x + 3 = 11 → 2x = 8 → x = 4。', tip: '移項要變號：加變減、減變加。' },
      en: { title: 'Linear Equations', intro: 'Move the constant to the right, then divide both sides by the coefficient of x.', example: '2x + 3 = 11 → 2x = 8 → x = 4.', tip: 'When moving a term, flip its sign.' },
      visual: null
    },

    /* ---------- 中二（S2） ---------- */

    'ms.s2.pythagoras': {
      zh: { title: '畢氏定理', intro: '直角三角形中，斜邊² = 兩條直角邊平方和。', example: '3² + 4² = 9 + 16 = 25，所以斜邊 = 5。', tip: '求直角邊時，用「斜邊² − 另一條邊²」。' },
      en: { title: 'Pythagoras Theorem', intro: 'In a right triangle, hyp² = sum of the squares of the two legs.', example: '3² + 4² = 9 + 16 = 25, so hyp = 5.', tip: 'For a leg, use hyp² − other leg².' },
      visual: null
    },
    'ms.s2.simul': {
      zh: { title: '聯立方程', intro: '兩條方程一起解；把兩式相加或相減，消去一個未知數。', example: 'x + y = 5，x − y = 1；相加得 2x = 6，x = 3。', tip: '先消去一個未知數，再求另一個。' },
      en: { title: 'Simultaneous Equations', intro: 'Solve two equations together; add or subtract to eliminate one unknown.', example: 'x + y = 5, x − y = 1; add: 2x = 6, so x = 3.', tip: 'Eliminate one unknown first, then find the other.' },
      visual: null
    },

    /* ---------- 中三（S3） ---------- */

    'ms.s3.indices': {
      zh: { title: '指數定律', intro: '同底數相乘，指數相加；乘方就是連乘。', example: '2³ = 8；2³ × 2² = 2^(3+2) = 2⁵ = 32。', tip: '底數相同時，指數相加。' },
      en: { title: 'Laws of Indices', intro: 'For the same base, add the exponents when multiplying; a power is repeated multiplication.', example: '2³ = 8; 2³ × 2² = 2^(3+2) = 2⁵ = 32.', tip: 'Same base → add the exponents.' },
      visual: null
    },
    'ms.s3.inequality': {
      zh: { title: '一元一次不等式', intro: '解法和方程相似，但兩邊乘或除以負數時，不等號要反向。', example: '2x + 1 > 5 → 2x > 4 → x > 2。', tip: '除以負數時，不等號要轉方向。' },
      en: { title: 'Linear Inequalities', intro: 'Solve like an equation, but reverse the inequality sign when multiplying or dividing by a negative.', example: '2x + 1 > 5 → 2x > 4 → x > 2.', tip: 'Reverse the sign when dividing by a negative.' },
      visual: null
    },

    /* ---------- 中四（S4） ---------- */

    'hs.s4.log': {
      zh: { title: '對數', intro: '$\\log_b x$ 就是問「$b$ 的幾次方等於 $x$」。', example: '$\\log_2 8 = 3$，因為 $2^3 = 8$。', tip: '對數和指數是互逆的。' },
      en: { title: 'Logarithms', intro: '$\\log_b x$ asks: "what power of $b$ gives $x$?".', example: '$\\log_2 8 = 3$ because $2^3 = 8$.', tip: 'Logs and powers are inverses.' },
      visual: null
    },
    'hs.s4.fx': {
      zh: { title: '函數求值', intro: '把 x 的值代入函數 $f(x)$，再計算。', example: '若 $f(x) = 2x^2 + 3x - 1$，則 $f(2) = 8 + 6 - 1 = 13$。', tip: '先算平方，再乘，最後加減。' },
      en: { title: 'Function Values', intro: 'Substitute the value of x into $f(x)$, then calculate.', example: 'If $f(x) = 2x^2 + 3x - 1$, then $f(2) = 8 + 6 - 1 = 13$.', tip: 'Square first, then multiply, then add/subtract.' },
      visual: null
    },
    'hs.s4.trig': {
      zh: { title: '三角比', intro: '在直角三角形中：$\\sin\\theta = \\dfrac{\\text{對邊}}{\\text{斜邊}}$，$\\cos\\theta = \\dfrac{\\text{鄰邊}}{\\text{斜邊}}$，$\\tan\\theta = \\dfrac{\\text{對邊}}{\\text{鄰邊}}$。', example: '對邊 3、鄰邊 4、斜邊 5，則 $\\sin\\theta = 3/5$。', tip: '記住「SOH CAH TOA」。' },
      en: { title: 'Trigonometric Ratios', intro: 'In a right triangle: $\\sin\\theta = \\dfrac{\\text{opp}}{\\text{hyp}}$, $\\cos\\theta = \\dfrac{\\text{adj}}{\\text{hyp}}$, $\\tan\\theta = \\dfrac{\\text{opp}}{\\text{adj}}$.', example: 'opp 3, adj 4, hyp 5 → $\\sin\\theta = 3/5$.', tip: 'Remember SOH CAH TOA.' },
      visual: null
    },

    /* ---------- 中五（S5） ---------- */

    'hs.s5.ap': {
      zh: { title: '等差數列', intro: '每項相差固定的「公差」$d$。第 n 項 = 首項 + (n − 1)d。', example: '首項 3、公差 4，第 5 項 = 3 + 4×4 = 19。', tip: '先找首項和公差。' },
      en: { title: 'Arithmetic Sequences', intro: 'Each term differs by a fixed common difference $d$. nth term = first + (n − 1)d.', example: 'First 3, difference 4: 5th term = 3 + 4×4 = 19.', tip: 'Find the first term and the difference.' },
      visual: null
    },
    'hs.s5.gp': {
      zh: { title: '等比數列', intro: '每項乘以固定的「公比」$r$。第 n 項 = 首項 × r^(n−1)。', example: '首項 2、公比 3，第 4 項 = 2 × 3³ = 54。', tip: '先找首項和公比。' },
      en: { title: 'Geometric Sequences', intro: 'Each term is multiplied by a fixed common ratio $r$. nth term = first × r^(n−1).', example: 'First 2, ratio 3: 4th term = 2 × 3³ = 54.', tip: 'Find the first term and the ratio.' },
      visual: null
    },
    'hs.s5.prob': {
      zh: { title: '概率', intro: '概率 = 符合條件的結果數 ÷ 所有可能的結果數。', example: '袋中 8 個球，3 個紅球，抽到紅球的概率 = 3/8。', tip: '先數總數，再數符合條件的數。' },
      en: { title: 'Probability', intro: 'Probability = favourable outcomes ÷ total outcomes.', example: '8 balls, 3 red → P(red) = 3/8.', tip: 'Count the total, then the favourable outcomes.' },
      visual: null
    },

    /* ---------- 中六（S6） ---------- */

    'hs.s6.quad': {
      zh: { title: '二次方程的根', intro: '二次方程 $x^2 + bx + c = 0$ 的兩根 α、β：兩根之和 = −b，兩根之積 = c。', example: '$x^2 - 7x + 12 = 0$：兩根之和 = 7，積 = 12。', tip: '和 = −(x 的係數)，積 = 常數項。' },
      en: { title: 'Roots of Quadratics', intro: 'For $x^2 + bx + c = 0$ with roots α, β: sum = −b, product = c.', example: '$x^2 - 7x + 12 = 0$: sum = 7, product = 12.', tip: 'Sum = −(coefficient of x); product = constant.' },
      visual: null
    },
    'hs.s6.stats': {
      zh: { title: '中位數', intro: '把數據由小到大排列，取中間那個數（若個數是單數）。', example: '1、3、7、8、9 的中位數是 7。', tip: '先排序，再取中間。' },
      en: { title: 'Median', intro: 'Sort the data, then take the middle value (for an odd count).', example: 'Median of 1, 3, 7, 8, 9 is 7.', tip: 'Sort first, then take the middle.' },
      visual: null
    },

    /* ---------- 幾何、座標、應用題 ---------- */

    'g4.triangle': {
      zh: { title: '三角形面積', intro: '三角形面積 = 底 × 高 ÷ 2。', example: '底 8 cm、高 5 cm，面積 = 8 × 5 ÷ 2 = 20 cm²。', tip: '記得最後要除以 2。' },
      en: { title: 'Triangle Area', intro: 'Area = base × height ÷ 2.', example: 'Base 8 cm, height 5 cm → area = 8 × 5 ÷ 2 = 20 cm².', tip: 'Remember to divide by 2.' },
      visual: { kind: 'triangle', b: 8, h: 5 }
    },
    'g6.circle': {
      zh: { title: '圓的周長與面積', intro: '圓周長 = 2πr；圓面積 = πr²。', example: '半徑 5 cm：周長 = 10π cm，面積 = 25π cm²。', tip: '答案用 π 表示即可。' },
      en: { title: 'Circles', intro: 'Circumference = 2πr; area = πr².', example: 'Radius 5 cm: circumference = 10π cm, area = 25π cm².', tip: 'Leave the answer in terms of π.' },
      visual: { kind: 'circle', r: 5 }
    },
    'g6.volume': {
      zh: { title: '立體圖形的體積', intro: '長方體體積 = 長 × 闊 × 高。', example: '長 4 cm、闊 3 cm、高 2 cm，體積 = 24 cm³。', tip: '體積單位是立方（cm³）。' },
      en: { title: 'Volume of Cuboids', intro: 'Volume = length × width × height.', example: '4 cm by 3 cm by 2 cm → volume = 24 cm³.', tip: 'Volume is in cubic units (cm³).' },
      visual: { kind: 'cuboid', l: 4, w: 3, h: 2 }
    },
    'ms.s1.coord': {
      zh: { title: '座標', intro: '兩點 A(x₁,y₁)、B(x₂,y₂)：距離 = √((x₂−x₁)² + (y₂−y₁)²)；中點 = ((x₁+x₂)/2, (y₁+y₂)/2)。', example: 'A(0,0)、B(3,4)：距離 5；中點 (1.5, 2)。', tip: '先算 x 和 y 的差。' },
      en: { title: 'Coordinates', intro: 'For A(x₁,y₁), B(x₂,y₂): distance = √((x₂−x₁)² + (y₂−y₁)²); midpoint = ((x₁+x₂)/2, (y₁+y₂)/2).', example: 'A(0,0), B(3,4): distance 5; midpoint (1.5, 2).', tip: 'Work out the x and y differences first.' },
      visual: { kind: 'plane', a: [0, 0], b: [3, 4] }
    },
    'generic.word': {
      zh: { title: '應用題', intro: '先讀懂題目，找出已知數和要求的量，再選合適的運算。', example: '小明有 8 個，吃了 3 個，還剩幾個？8 − 3 = 5。', tip: '圈出數字和關鍵詞（「一共」「還剩」「每」等）。' },
      en: { title: 'Word Problems', intro: 'Read carefully, find the numbers and what is asked, then choose the operation.', example: 'Sam has 8, eats 3. How many left? 8 − 3 = 5.', tip: 'Circle the numbers and key words.' },
      visual: null
    },

    'g1.money': {
      zh: { title: '貨幣與找續', intro: '找續 = 付的錢 − 價錢。', example: '買了 $6 的東西，付 $10，找續 = 10 − 6 = $4。', tip: '用減法計算找續。' },
      en: { title: 'Money & Change', intro: 'Change = money paid − price.', example: 'Item $6, paid $10 → change = 10 − 6 = $4.', tip: 'Use subtraction for change.' },
      visual: null
    },
    'g2.fact': {
      zh: { title: '單位換算', intro: '記住常用的換算：1 小時 = 60 分鐘、1 米 = 100 釐米、1 千克 = 1000 克。', example: '1 日 = 24 小時。', tip: '多讀幾次就記住。' },
      en: { title: 'Units', intro: 'Remember: 1 hour = 60 min, 1 m = 100 cm, 1 kg = 1000 g.', example: '1 day = 24 hours.', tip: 'Read them a few times to remember.' },
      visual: null
    },
    'g3.angle': {
      zh: { title: '角', intro: '直角 = 90°，銳角 < 90°，鈍角 > 90°。', example: '直角是 90°，平角是 180°。', tip: '先記住直角是 90°。' },
      en: { title: 'Angles', intro: 'Right = 90°, acute < 90°, obtuse > 90°.', example: 'A right angle is 90°, a straight angle is 180°.', tip: 'Remember the right angle is 90° first.' },
      visual: null
    },
    'g4.perimeter': {
      zh: { title: '周界', intro: '周界 = 圖形外圍一圈的總長度；長方形周界 = 2 × (長 + 闊)。', example: '長 8 cm、闊 5 cm，周界 = 2 × (8 + 5) = 26 cm。', tip: '先把長和闊加起來，再乘 2。' },
      en: { title: 'Perimeter', intro: 'Perimeter is the total length around a shape; rectangle = 2 × (length + width).', example: '8 cm by 5 cm → perimeter = 2 × (8 + 5) = 26 cm.', tip: 'Add length and width, then double it.' },
      visual: { kind: 'rect', l: 8, w: 5 }
    },
    'ms.s2.polygon': {
      zh: { title: '多邊形內角和', intro: 'n 邊形的內角和 = (n − 2) × 180°。', example: '五邊形：內角和 = (5 − 2) × 180° = 540°。', tip: '邊數減 2，再乘 180°。' },
      en: { title: 'Polygon Angle Sum', intro: 'Sum of interior angles of an n-gon = (n − 2) × 180°.', example: 'Pentagon: sum = (5 − 2) × 180° = 540°.', tip: 'Take sides minus 2, times 180°.' },
      visual: null
    },
    'hs.s4.quadsolve': {
      zh: { title: '二次方程求根', intro: '把 x² + bx + c = 0 因式分解成 (x − p)(x − q) = 0，根就是 p 和 q。', example: 'x² − 5x + 6 = 0 → (x − 2)(x − 3) = 0，根是 2 和 3。', tip: '找兩個數，和是 −b、積是 c。' },
      en: { title: 'Solving Quadratics', intro: 'Factorise x² + bx + c = 0 into (x − p)(x − q) = 0; roots are p and q.', example: 'x² − 5x + 6 = 0 → (x − 2)(x − 3) = 0, roots 2 and 3.', tip: 'Find two numbers with sum −b and product c.' },
      visual: null
    },
    'hs.s4.line': {
      zh: { title: '直線的斜率', intro: '兩點 (x₁,y₁)、(x₂,y₂) 的斜率 = (y₂ − y₁) ÷ (x₂ − x₁)。', example: '(0,0) 和 (3,4)：斜率 = (4 − 0) ÷ (3 − 0) = 4/3。', tip: '先算 y 的差，再除以 x 的差。' },
      en: { title: 'Slope of a Line', intro: 'Slope between (x₁,y₁) and (x₂,y₂) = (y₂ − y₁) ÷ (x₂ − x₁).', example: '(0,0) and (3,4): slope = (4 − 0) ÷ (3 − 0) = 4/3.', tip: 'Take the y difference over the x difference.' },
      visual: { kind: 'plane', a: [0, 0], b: [3, 4] }
    },
    'hs.s5.variation': {
      zh: { title: '正變', intro: '若 y 隨 x 正變，則 y = kx，k 是常數。', example: 'x = 2 時 y = 6，k = 3；x = 5 時 y = 3 × 5 = 15。', tip: '先由已知一組 x、y 求 k。' },
      en: { title: 'Direct Variation', intro: 'If y varies directly as x, then y = kx for a constant k.', example: 'x = 2 gives y = 6, so k = 3; at x = 5, y = 3 × 5 = 15.', tip: 'Find k from a known pair first.' },
      visual: null
    }
  };

  root.Lessons = L;
})(typeof window !== 'undefined' ? window : globalThis);
