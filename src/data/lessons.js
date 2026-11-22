/*
 * 課堂教學內容（雙語）
 * ESM 來源：src/data/lessons.js
 * 這個 root classic 檔案由 tools/build.js 生成（給 file:// / legacy 分支部署用），
 * 請改 src/data/lessons.js 再重新 build，不要直接手改這裡。
 */
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
      zh: { title: '分數入門', intro: '把一個整體平均分成幾份，取其中幾份就是「幾分之幾」。', example: '把圓平均分成 4 份，涂了 3 份，就是 3/4。', tip: '上面是分子（塗色份數），下面是分母（總份數）。' },
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
      zh: { title: '長方形面積與周界', intro: '面積 = 長 × 闊；周界 = (長 + 闊) × 2。', example: '長 5 cm、闊 3 cm：面積 15 cm²，周界 16 cm。', tip: '面積用「平方」，周界用「長度」。' },
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
      visual: { kind: 'numberline' }
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
      visual: { kind: 'righttri' }
    },
    'ms.s2.simul': {
      zh: { title: '聯立方程', intro: '兩條方程一起解；用消元法把一條方程乘以適當倍數，消去一個未知數。', example: '2x + 3y = 12，3x + 2y = 13；一式×3、二式×2 後相減得 5y = 10，y = 2，代回得 x = 3。', tip: '先消去一個未知數，再求另一個。' },
      en: { title: 'Simultaneous Equations', intro: 'Solve two equations by elimination: multiply one equation so a variable cancels.', example: '2x + 3y = 12, 3x + 2y = 13; multiply eq1 by 3 and eq2 by 2, subtract to get 5y = 10, then y = 2 and x = 3.', tip: 'Eliminate one unknown first, then find the other.' },
      visual: null
    },

    /* ---------- 中三（S3） ---------- */

    'ms.s3.indices': {
      zh: { title: '指數定律', intro: '同底數相乘，指數相加；同底數相除，指數相減；乘方就是連乘。', example: '2³ × 2² = 2⁵ = 32；2⁵ ÷ 2² = 2³ = 8。', tip: '底數相同時：乘加除減。' },
      en: { title: 'Laws of Indices', intro: 'Same base: add exponents when multiplying, subtract when dividing; a power is repeated multiplication.', example: '2³ × 2² = 2⁵ = 32; 2⁵ ÷ 2² = 2³ = 8.', tip: 'Same base: add for multiplication, subtract for division.' },
      visual: null
    },
    'ms.s3.inequality': {
      zh: { title: '一元一次不等式', intro: '解法和方程相似，但兩邊乘或除以負數時，不等號要反向。', example: '2x + 1 > 5 → 2x > 4 → x > 2。', tip: '除以負數時，不等號要轉方向。' },
      en: { title: 'Linear Inequalities', intro: 'Solve like an equation, but reverse the inequality sign when multiplying or dividing by a negative.', example: '2x + 1 > 5 → 2x > 4 → x > 2.', tip: 'Reverse the sign when dividing by a negative.' },
      visual: null
    },

    /* ---------- 中四（S4） ---------- */

    'hs.s4.log': {
      zh: { title: '對數', intro: '$\\log_b x$ 就是問「$b$ 的幾次方等於 $x$」；同底對數相加等於相乘的對數。', example: '$\\log_2 8 = 3$；$\\log_2 4 + \\log_2 8 = \\log_2 32 = 5$。', tip: '對數和指數互逆；log m + log n = log(mn)。' },
      en: { title: 'Logarithms', intro: '$\\log_b x$ asks: what power of $b$ gives $x$? Same-base logs add to the log of the product.', example: '$\\log_2 8 = 3$; $\\log_2 4 + \\log_2 8 = \\log_2 32 = 5$.', tip: 'Logs and powers are inverses; log m + log n = log(mn).' },
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
      visual: { kind: 'righttri' }
    },

    /* ---------- 中五（S5） ---------- */

    'hs.s5.ap': {
      zh: { title: '等差數列', intro: '每項相差固定的「公差」$d$。第 n 項 = 首項 + (n − 1)d。', example: '首項 3、公差 4，第 5 項 = 3 + 4×4 = 19。', tip: '先找首項和公差。' },
      en: { title: 'Arithmetic Sequences', intro: 'Each term differs by a fixed common difference $d$. nth term = first + (n − 1)d.', example: 'First 3, difference 4: 5th term = 3 + 4×4 = 19.', tip: 'Find the first term and the difference.' },
      visual: null
    },
    'hs.s5.gp': {
      zh: { title: '等比數列', intro: '每項乘以固定的「公比」$r$。第 $n$ 項 $= a r^{n-1}$（首項為 $a$）。', example: '首項 $2$、公比 $3$，第 $4$ 項 $= 2 \\times 3^{3} = 54$。', tip: '先找首項和公比。' },
      en: { title: 'Geometric Sequences', intro: 'Each term is multiplied by a fixed common ratio $r$: the $n$th term is $a r^{n-1}$.', example: 'First term $2$, ratio $3$: the 4th term is $2 \\times 3^{3} = 54$.', tip: 'Find the first term and the ratio.' },
      visual: null
    },
    'hs.s5.prob': {
      zh: { title: '概率', intro: '概率 = 符合條件的結果數 ÷ 所有可能的結果數。', example: '袋中 8 個球，3 個紅球，抽到紅球的概率 = 3/8。', tip: '先數總數，再數符合條件的數。' },
      en: { title: 'Probability', intro: 'Probability = favourable outcomes ÷ total outcomes.', example: '8 balls, 3 red → P(red) = 3/8.', tip: 'Count the total, then the favourable outcomes.' },
      visual: null
    },

    /* ---------- 中六（S6） ---------- */

    'hs.s6.quad': {
      zh: { title: '二次方程的根', intro: '二次方程 $x^2 + bx + c = 0$（首項係數為 1）的兩根 α、β：兩根之和 = −b，兩根之積 = c。', example: '$x^2 - 7x + 12 = 0$：兩根之和 = 7，積 = 12。', tip: '和 = −(x 的係數)，積 = 常數項（首項係數為 1）。' },
      en: { title: 'Roots of Quadratics', intro: 'For $x^2 + bx + c = 0$ (leading coefficient 1) with roots α, β: sum = −b, product = c.', example: '$x^2 - 7x + 12 = 0$: sum = 7, product = 12.', tip: 'Sum = −(coefficient of x); product = constant term (leading coefficient 1).' },
      visual: null
    },
    'hs.s6.stats': {
      zh: { title: '中位數', intro: '把數據由小到大排列；單數個取中間那個，雙數個取中間兩個的平均。', example: '1、3、7、8、9 的中位數是 7；1、3、7、8、9、10 的中位數是 7.5。', tip: '先排序，再取中間（雙數個要平均）。' },
      en: { title: 'Median', intro: 'Sort the data: take the middle value for an odd count, or the mean of the two middle values for an even count.', example: 'Median of 1, 3, 7, 8, 9 is 7; median of 1, 3, 7, 8, 9, 10 is 7.5.', tip: 'Sort first, then take the middle (average the two middles for an even count).' },
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
    'g1.oddeven': {
      zh: { title: '單雙數', intro: '偶數是 2、4、6、8…（可以兩個一組）；奇數是 1、3、5、7…。', example: '8 是偶數，7 是奇數；8 之後的下一個偶數是 10。', tip: '看個位：0、2、4、6、8 是偶數。' },
      en: { title: 'Odd & Even', intro: 'Even numbers are 2, 4, 6, 8… (can be paired); odd are 1, 3, 5, 7….', example: '8 is even, 7 is odd; the next even after 8 is 10.', tip: 'Look at the units digit: 0, 2, 4, 6, 8 are even.' },
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
      visual: { kind: 'polygon', n: 5 }
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
    },

    'g3.shape': {
      zh: { title: '圖形性質', intro: '邊是圖形的線段，面是立體圖形的平面，頂點是角的尖端。', example: '正方體有 6 個面、8 個頂點。', tip: '用手指逐個數。' },
      en: { title: 'Shape Properties', intro: 'Sides are edges, faces are flat surfaces, vertices are corners.', example: 'A cube has 6 faces and 8 vertices.', tip: 'Count them one by one.' },
      visual: null
    },
    'g6.symmetry': {
      zh: { title: '對稱', intro: '沿著對稱軸對摺，兩邊能完全重疊。', example: '正方形有 4 條對稱軸。', tip: '畫出所有能對摺的直線。' },
      en: { title: 'Symmetry', intro: 'Fold along a line of symmetry so both halves match.', example: 'A square has 4 lines of symmetry.', tip: 'Draw all the folding lines.' },
      visual: { kind: 'symmetry' }
    },
    'ms.s1.liketerms': {
      zh: { title: '合併同類項', intro: '同類項 = 變數相同的項，可把係數相加減。', example: '3x + 5x = 8x。', tip: '只看係數相加減，變數不變。' },
      en: { title: 'Collecting Like Terms', intro: 'Like terms have the same variable; add/subtract their coefficients.', example: '3x + 5x = 8x.', tip: 'Add the coefficients; keep the variable.' },
      visual: null
    },
    'ms.s2.polycoeff': {
      zh: { title: '多項式', intro: '次數 = 最高次項的指數；係數 = 每項前面的數。', example: '5x² 的次數是 2，係數是 5。', tip: '先找出最高次項。' },
      en: { title: 'Polynomials', intro: 'Degree = highest exponent; coefficient = the number in front.', example: '5x² has degree 2 and coefficient 5.', tip: 'Find the highest-power term first.' },
      visual: null
    },
    'ms.s3.arclen': {
      zh: { title: '弧長與扇形', intro: '弧長 = 2πr × (圓心角 ÷ 360°)。', example: '半徑 6、圓心角 60°：弧長 = 2π × 6 × 60/360 = 2π。', tip: '先算出圓心角佔全圓的份數。' },
      en: { title: 'Arc Length', intro: 'Arc length = 2πr × (angle ÷ 360°).', example: 'Radius 6, angle 60°: arc = 2π × 6 × 60/360 = 2π.', tip: 'Find the fraction of the full circle first.' },
      visual: { kind: 'circle', r: 6 }
    },
    'ms.s3.mode': {
      zh: { title: '眾數', intro: '眾數 = 一組數據中出現次數最多的數。', example: '2、3、3、5、3 的眾數是 3。', tip: '數每種數字出現多少次。' },
      en: { title: 'Mode', intro: 'The mode is the value that appears most often.', example: 'Mode of 2, 3, 3, 5, 3 is 3.', tip: 'Count how many times each value appears.' },
      visual: null
    },
    'hs.s4.circleeq': {
      zh: { title: '圓的方程', intro: '圓心在原點的圓方程是 x² + y² = r²，r 是半徑。', example: 'x² + y² = 25，半徑 = 5。', tip: '開方即可得到半徑。' },
      en: { title: 'Equation of a Circle', intro: 'A circle centred at the origin is x² + y² = r², where r is the radius.', example: 'x² + y² = 25 → radius 5.', tip: 'Take the square root for the radius.' },
      visual: null
    },
    'hs.s5.asum': {
      zh: { title: '等差數列求和', intro: '前 n 項和 = n/2 × (首項 + 末項)。', example: '1+2+…+10 = 10/2 × (1+10) = 55。', tip: '先求末項 a + (n−1)d。' },
      en: { title: 'Sum of Arithmetic Sequence', intro: 'Sum of first n terms = n/2 × (first + last).', example: '1+2+…+10 = 10/2 × (1+10) = 55.', tip: 'Find the last term a + (n−1)d first.' },
      visual: null
    },
    'hs.s5.invvar': {
      zh: { title: '反變', intro: '若 y 隨 x 反變，則 y = k/x（即 xy = k）。', example: 'x = 2 時 y = 6，k = 12；x = 3 時 y = 4。', tip: '先由 xy 求常數 k。' },
      en: { title: 'Inverse Variation', intro: 'If y varies inversely as x, then y = k/x (so xy = k).', example: 'x = 2 gives y = 6, so k = 12; at x = 3, y = 4.', tip: 'Find k from xy first.' },
      visual: null
    },
    'hs.s6.comb': {
      zh: { title: '排列與組合', intro: '排列 P(n,r) = n!/(n−r)!；組合 C(n,r) = n!/(r!(n−r)!)。', example: 'P(5,2) = 20；C(5,2) = 10。', tip: '排列考慮次序，組合不考慮。' },
      en: { title: 'Permutation & Combination', intro: 'P(n,r) = n!/(n−r)!; C(n,r) = n!/(r!(n−r)!).', example: 'P(5,2) = 20; C(5,2) = 10.', tip: 'Permutation cares about order; combination does not.' },
      visual: null
    },
    'hs.s6.range': {
      zh: { title: '分佈域', intro: '分佈域 = 最大值 − 最小值，量度數據的分散程度。', example: '3、7、5、9、1 的分佈域 = 9 − 1 = 8。', tip: '先找最大和最小值。' },
      en: { title: 'Range', intro: 'Range = max − min; it measures the spread of data.', example: 'Range of 3, 7, 5, 9, 1 = 9 − 1 = 8.', tip: 'Find the max and min first.' },
      visual: null
    },

    'ms.s1.parallel': {
      zh: { title: '角與平行線', intro: '平行線被截線所截：同位角相等、內錯角相等、同側內角互補（和 = 180°）。', example: '若一個同位角是 65°，另一個也是 65°。', tip: '先分清是同位角、內錯角還是同側內角。' },
      en: { title: 'Angles & Parallel Lines', intro: 'With parallel lines: corresponding and alternate angles are equal; co-interior angles sum to 180°.', example: 'If one corresponding angle is 65°, the other is also 65°.', tip: 'First identify the angle type.' },
      visual: { kind: 'parallel' }
    },
    'ms.s1.sqrt': {
      zh: { title: '平方根', intro: '√x 就是問「哪個數自乘等於 x」。', example: '√64 = 8，因為 8 × 8 = 64。', tip: '背熟常見平方數：1、4、9、16、25、36、49、64、81、100。' },
      en: { title: 'Square Roots', intro: '√x asks "what number squared equals x?".', example: '√64 = 8 because 8 × 8 = 64.', tip: 'Learn the squares: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100.' },
      visual: null
    },
    'ms.s2.congruent': {
      zh: { title: '全等三角形', intro: '全等三角形形狀和大小完全相同，對應邊和對應角相等。', example: '判定方法：SSS、SAS、ASA、AAS、RHS。', tip: '全等 = 完全一樣（形狀 + 大小）。' },
      en: { title: 'Congruent Triangles', intro: 'Congruent triangles are identical in shape and size; corresponding sides and angles are equal.', example: 'Conditions: SSS, SAS, ASA, AAS, RHS.', tip: 'Congruent = exactly the same (shape + size).' },
      visual: { kind: 'twotri' }
    },
    'ms.s2.similar': {
      zh: { title: '相似三角形', intro: '相似圖形形狀相同、大小不同，對應邊成比例。', example: '放大 3 倍，對應邊是原來的 3 倍。', tip: '相似 = 形狀相同（大小可不同）。' },
      en: { title: 'Similar Triangles', intro: 'Similar shapes have the same shape but different size; corresponding sides are proportional.', example: 'Enlarging by 3 makes sides 3 times longer.', tip: 'Similar = same shape (size may differ).' },
      visual: { kind: 'twotri' }
    },
    'ms.s2.quad': {
      zh: { title: '四邊形', intro: '平行四邊形有兩組平行對邊；梯形只有一組。', example: '正方形有 4 條相等的邊。', tip: '記住各四邊形的邊和角性質。' },
      en: { title: 'Quadrilaterals', intro: 'A parallelogram has two pairs of parallel sides; a trapezium has one.', example: 'A square has 4 equal sides.', tip: 'Remember the side and angle properties.' },
      visual: null
    },
    'ms.s2.sinterest': {
      zh: { title: '單利息', intro: '單利息 = 本金 × 年利率 × 年數。', example: '本金 $1000、年利率 5%、2 年：利息 = 1000 × 5% × 2 = $100。', tip: '記住公式：I = P × r × t。' },
      en: { title: 'Simple Interest', intro: 'Simple interest = principal × rate × years.', example: '$1000 at 5% for 2 years: interest = 1000 × 5% × 2 = $100.', tip: 'Remember: I = P × r × t.' },
      visual: null
    },
    'ms.s2.approx': {
      zh: { title: '量度誤差', intro: '四捨五入至最接近的某單位，最大絕對誤差 = 單位的一半。', example: '四捨五入至最接近的 10，最大誤差 = 5。', tip: '最大誤差 = 單位 ÷ 2。' },
      en: { title: 'Errors in Measurement', intro: 'When rounded to a unit, the max absolute error = half the unit.', example: 'Rounded to the nearest 10, max error = 5.', tip: 'Max error = unit ÷ 2.' },
      visual: null
    },
    'ms.s3.cylinder': {
      zh: { title: '圓柱體積', intro: '圓柱體積 = π r² h；側面積 = 2π r h。', example: '半徑 3、高 5：體積 = π × 9 × 5 = 45π。', tip: '答案用 π 表示即可。' },
      en: { title: 'Volume of Cylinder', intro: 'Volume = π r² h; curved surface area = 2π r h.', example: 'Radius 3, height 5: volume = π × 9 × 5 = 45π.', tip: 'Leave answers in terms of π.' },
      visual: { kind: 'cylinder' }
    },
    'ms.s3.expand': {
      zh: { title: '展開（恆等式）', intro: '(x + a)(x + b) = x² + (a+b)x + ab。', example: '(x + 3)(x + 2) = x² + 5x + 6。', tip: 'x 的係數 = a + b，常數項 = a × b。' },
      en: { title: 'Expanding Binomials', intro: '(x + a)(x + b) = x² + (a+b)x + ab.', example: '(x + 3)(x + 2) = x² + 5x + 6.', tip: 'Coefficient of x = a + b; constant = a × b.' },
      visual: null
    },
    'ms.s3.pichart': {
      zh: { title: '圓形圖', intro: '圓形圖中，每部分的圓心角 = 百分比 × 360°。', example: '佔 25% 的部分，圓心角 = 25% × 360° = 90°。', tip: '整個圓 = 360°。' },
      en: { title: 'Pie Charts', intro: 'In a pie chart, each sector\'s central angle = percentage × 360°.', example: '25% → central angle = 25% × 360° = 90°.', tip: 'A full circle is 360°.' },
      visual: { kind: 'pie', pct: 25 }
    },

    'g2.direction': {
      zh: { title: '方向', intro: '指南針有東、南、西、北四個主要方向。', example: '太陽從東方升起、西方落下。', tip: '記住「上北、下南、左西、右東」。' },
      en: { title: 'Directions', intro: 'A compass has four main directions: N, S, E, W.', example: 'The sun rises in the east and sets in the west.', tip: 'Remember "north up, south down, west left, east right".' },
      visual: { kind: 'compass' }
    },
    'g3.time24': {
      zh: { title: '24 小時制', intro: '下午的時間用 24 小時制 = 12 小時制 + 12。', example: '下午 5 時 = 17:00。', tip: '超過 12 就減 12，得到下午／晚上的時間。' },
      en: { title: '24-hour Clock', intro: 'In 24-hour time, PM hours = 12-hour time + 12.', example: '5 pm = 17:00.', tip: 'Subtract 12 from times over 12 to get PM.' },
      visual: { kind: 'clock' }
    },
    'ms.s3.cone': {
      zh: { title: '圓錐與球體', intro: '圓錐體積 = πr²h/3；球體積 = 4πr³/3；球表面積 = 4πr²。', example: '半徑 3 的球，體積 = 4π×27/3 = 36π。', tip: '答案用 π 表示。' },
      en: { title: 'Cone & Sphere', intro: 'Cone volume = πr²h/3; sphere volume = 4πr³/3; sphere area = 4πr².', example: 'Radius 3 sphere: volume = 4π×27/3 = 36π.', tip: 'Leave answers in terms of π.' },
      visual: { kind: 'cone' }
    },
    'ms.s3.centre': {
      zh: { title: '三角形的心', intro: '內心＝角平分線交點；外心＝垂直平分線交點；重心＝中線交點；垂心＝高的交點。', example: '三條中線交於重心。', tip: '記住四心分別由哪三條線組成。' },
      en: { title: 'Centres of a Triangle', intro: 'Incentre: angle bisectors; circumcentre: perpendicular bisectors; centroid: medians; orthocentre: altitudes.', example: 'The three medians meet at the centroid.', tip: 'Remember which three lines form each centre.' },
      visual: { kind: 'centre' }
    },
    'ms.s3.prob': {
      zh: { title: '概率', intro: '概率 = 符合條件的結果數 ÷ 所有可能結果數。', example: '擲一枚硬幣，正面概率 = 1/2。', tip: '先數總數，再數符合條件的數。' },
      en: { title: 'Probability', intro: 'Probability = favourable outcomes ÷ total outcomes.', example: 'Tossing a coin, P(heads) = 1/2.', tip: 'Count the total, then the favourable outcomes.' },
      visual: null
    },
    'hs.s4.circleangle': {
      zh: { title: '圓周角與圓心角', intro: '同一段弧上，圓心角 = 2 × 圓周角。', example: '圓周角 40° → 圓心角 80°。', tip: '圓心角是圓周角的兩倍。' },
      en: { title: 'Angles in a Circle', intro: 'On the same arc, central angle = 2 × inscribed angle.', example: 'Inscribed 40° → central 80°.', tip: 'Central angle is double the inscribed angle.' },
      visual: { kind: 'circleang' }
    },
    'hs.s6.binomial': {
      zh: { title: '二項式定理', intro: '$(x+1)^{n}$ 展開式中，$x^{r}$ 的係數 $= \\binom{n}{r} = \\frac{n!}{r!(n-r)!}$。', example: '$(x+1)^{5}$ 中 $x^{2}$ 的係數 $= \\binom{5}{2} = 10$。', tip: '係數就是組合數 $\\binom{n}{r}$。' },
      en: { title: 'Binomial Theorem', intro: 'In $(x+1)^{n}$, the coefficient of $x^{r}$ is $\\binom{n}{r} = \\frac{n!}{r!(n-r)!}$.', example: 'In $(x+1)^{5}$, the coefficient of $x^{2}$ is $\\binom{5}{2} = 10$.', tip: 'The coefficient is the combination $\\binom{n}{r}$.' },
      visual: null
    },
    'hs.s6.derivative': {
      zh: { title: '微分入門', intro: 'd/dx(ax^n) = a·n·x^(n−1)。', example: 'd/dx(3x²) = 6x。', tip: '指數乘到前面，指數減 1。' },
      en: { title: 'Intro to Derivatives', intro: 'd/dx(ax^n) = a·n·x^(n−1).', example: 'd/dx(3x²) = 6x.', tip: 'Multiply by the exponent, then reduce it by 1.' },
      visual: null
    },

    'ms.s2.identity': {
      zh: { title: '恆等式與展開', intro: '(x + a)(x + b) = x² + (a + b)x + ab；(x + a)² = x² + 2ax + a²；(a + b)(a − b) = a² − b²。', example: '(x + 3)(x + 2) = x² + 5x + 6，x 的係數是 5。', tip: '先認出是哪個恆等式，再讀係數。' },
      en: { title: 'Identities & Expansion', intro: '(x + a)(x + b) = x² + (a + b)x + ab; (x + a)² = x² + 2ax + a²; (a + b)(a − b) = a² − b².', example: '(x + 3)(x + 2) = x² + 5x + 6, so the coefficient of x is 5.', tip: 'Identify the identity first, then read off the coefficient.' },
      visual: null
    },
    'ms.s3.sector': {
      zh: { title: '扇形面積', intro: '扇形面積 = πr² × (圓心角 ÷ 360°)。', example: '半徑 6、圓心角 60°：面積 = π × 36 × 60/360 = 6π。', tip: '先算扇形佔全圓的幾分之幾。' },
      en: { title: 'Sector Area', intro: 'Sector area = πr² × (angle ÷ 360°).', example: 'Radius 6, angle 60°: area = π × 36 × 60/360 = 6π.', tip: 'Find the fraction of the full circle first.' },
      visual: { kind: 'circle', r: 6 }
    },
    'ms.s3.prism': {
      zh: { title: '柱體與錐體體積', intro: '柱體體積 = 底面積 × 高；錐體體積 = 底面積 × 高 ÷ 3。', example: '底面積 12 cm²、高 5 cm 的柱體：體積 = 60 cm³。', tip: '錐體是柱體的三分之一。' },
      en: { title: 'Volume of Prisms & Pyramids', intro: 'Prism volume = base area × height; pyramid volume = base area × height ÷ 3.', example: 'Base area 12 cm², height 5 cm: prism volume = 60 cm³.', tip: 'A pyramid is one third of the matching prism.' },
      visual: null
    },
    'hs.s4.quad2': {
      zh: { title: '判別式', intro: '二次方程 ax² + bx + c = 0 的判別式是 b² − 4ac：大於 0 有兩個實根，等於 0 有一個，小於 0 沒有實根。', example: 'x² − 5x + 6 = 0：b² − 4ac = 25 − 24 = 1 > 0，所以有兩個實根。', tip: '先讀出 a、b、c 的值（注意正負號），再判斷符號。' },
      en: { title: 'Discriminant', intro: 'For ax² + bx + c = 0, the discriminant is b² − 4ac: > 0 gives two real roots, = 0 gives one, < 0 gives none.', example: 'x² − 5x + 6 = 0: 25 − 24 = 1 > 0, so there are two real roots.', tip: 'Read a, b and c carefully, then check the sign.' },
      visual: null
    },
    'hs.s4.line2': {
      zh: { title: '直線方程', intro: '點在直線上，就把它的坐標代入方程；再解未知常數。', example: 'y = 2x + c 經過 (3, 8)：8 = 2 × 3 + c，所以 c = 2。', tip: '代入 → 解方程，兩步完成。' },
      en: { title: 'Equations of Lines', intro: 'If a point lies on a line, substitute its coordinates, then solve for the unknown constant.', example: 'y = 2x + c through (3, 8): 8 = 6 + c, so c = 2.', tip: 'Substitute, then solve — two steps.' },
      visual: null
    },
    'hs.s4.circleprop': {
      zh: { title: '圓的性質', intro: '半圓上的圓周角 = 90°；同弓形內的圓周角相等；圓內接四邊形的對角互補（和 = 180°）；切線垂直於半徑。', example: '圓內接四邊形一個內角是 70°，對角 = 180° − 70° = 110°。', tip: '先認出用的是哪一條圓的性質。' },
      en: { title: 'Circle Properties', intro: 'Angle in a semicircle = 90°; angles in the same segment are equal; opposite angles of a cyclic quadrilateral sum to 180°; a tangent is perpendicular to the radius.', example: 'A cyclic quadrilateral has an angle of 70°, so its opposite angle is 110°.', tip: 'Name the circle property you are using first.' },
      visual: { kind: 'circleang' }
    },
    'hs.s5.gpsum': {
      zh: { title: '等比數列求和', intro: '前 n 項和 = a(rⁿ − 1) ÷ (r − 1)；無限項之和（|r| < 1）= a ÷ (1 − r)。', example: '首項 2、公比 3、n = 4：和 = 2(81 − 1)/2 = 80。', tip: '無限項和只在 |r| < 1 時存在。' },
      en: { title: 'Sums of Geometric Sequences', intro: 'Sum of n terms = a(rⁿ − 1) ÷ (r − 1); sum to infinity (|r| < 1) = a ÷ (1 − r).', example: 'First 2, ratio 3, n = 4: sum = 2(81 − 1)/2 = 80.', tip: 'An infinite sum exists only when |r| < 1.' },
      visual: null
    },
    'hs.s5.dispersion': {
      zh: { title: '四分位距', intro: '先排序；Q1 是下半部的中位數，Q3 是上半部的中位數；IQR = Q3 − Q1。', example: '1、3、4、6、8、9、10：Q1 = 3，Q3 = 9，IQR = 6。', tip: '7 個數據時，Q1 是第 2 個、Q3 是第 6 個。' },
      en: { title: 'Interquartile Range', intro: 'Sort the data; Q1 is the lower-half median and Q3 the upper-half median; IQR = Q3 − Q1.', example: '1, 3, 4, 6, 8, 9, 10: Q1 = 3, Q3 = 9, IQR = 6.', tip: 'With 7 values, Q1 is the 2nd and Q3 the 6th.' },
      visual: null
    },
    'hs.s6.prob2': {
      zh: { title: '續概率', intro: '兩枚骰子共有 36 個等可能結果（有序數對）；P(不是 A) = 1 − P(A)。', example: '兩枚骰子點數和為 7 的結果有 6 個，概率 = 6/36 = 1/6。', tip: '先數總結果數，再數符合條件的結果數。' },
      en: { title: 'More Probability', intro: 'Two dice give 36 equally likely ordered outcomes; P(not A) = 1 − P(A).', example: 'There are 6 outcomes with a sum of 7, so P = 6/36 = 1/6.', tip: 'Count the total outcomes, then the favourable ones.' },
      visual: null
    },
    'hs.s6.binomial2': {
      zh: { title: '二項式定理（一般項）', intro: '$(x + a)^{n}$ 展開式中 $x^{r}$ 的係數 $= \\binom{n}{r} a^{n-r}$。', example: '$(x + 2)^{4}$ 中 $x^{2}$ 的係數 $= \\binom{4}{2} \\times 2^{2} = 24$。', tip: '先取組合數，再補上 $a$ 的次方。' },
      en: { title: 'Binomial Theorem (general term)', intro: 'In $(x + a)^{n}$, the coefficient of $x^{r}$ is $\\binom{n}{r} a^{n-r}$.', example: 'In $(x + 2)^{4}$, the coefficient of $x^{2}$ is $\\binom{4}{2} \\times 2^{2} = 24$.', tip: 'Take the combination first, then the power of $a$.' },
      visual: null
    },
    'col.calculus': {
      zh: { title: '微積分', intro: '$\\frac{d}{dx}(ax^{n}) = a n x^{n-1}$；$\\int_{0}^{b} ax^{n}\\,dx = \\frac{a b^{n+1}}{n+1}$。', example: '$f(x) = 3x^{2}$，$f\'(2) = 3 \\times 2 \\times 2 = 12$。', tip: '先微分／積分，再代入數值。' },
      en: { title: 'Calculus', intro: '$\\frac{d}{dx}(ax^{n}) = a n x^{n-1}$; $\\int_{0}^{b} ax^{n}\\,dx = \\frac{a b^{n+1}}{n+1}$.', example: 'For $f(x) = 3x^{2}$, $f\'(2) = 12$.', tip: 'Differentiate or integrate first, then substitute.' },
      visual: null
    },
    'col.linalg': {
      zh: { title: '線性代數', intro: '二階行列式 |A| = ad − bc；矩陣乘積 (AB)₁₁ = A₁₁B₁₁ + A₁₂B₂₁。', example: 'A = [[2,1],[0,3]]，|A| = 6。', tip: '行列式是主對角線積減副對角線積。' },
      en: { title: 'Linear Algebra', intro: '2×2 determinant |A| = ad − bc; matrix product entry (AB)₁₁ = A₁₁B₁₁ + A₁₂B₂₁.', example: 'A = [[2,1],[0,3]] gives |A| = 6.', tip: 'Determinant = main diagonal product − other diagonal product.' },
      visual: null
    },
    'col.prob': {
      zh: { title: '概率與統計', intro: '期望值 E(X) = Σ x·P(x)；二項概率 P = C(n, k) ÷ 2ⁿ（公平硬幣）。', example: '擲兩枚硬幣，剛好一個正面的概率 = C(2,1)/4 = 1/2。', tip: '先列出所有結果，再加權平均或數組合。' },
      en: { title: 'Probability & Statistics', intro: 'Expected value E(X) = Σ x·P(x); binomial probability P = C(n, k) ÷ 2ⁿ for fair coins.', example: 'Two coins, exactly one head: C(2,1)/4 = 1/2.', tip: 'List outcomes, then average or count combinations.' },
      visual: null
    },
    'challenge.nt': {
      zh: { title: '數論挑戰', intro: '餘數、因數倍數與同餘是競賽數論的三大法寶。大指數取餘數時，每乘一次就取餘數；同餘問題可以先列出其中一個條件的所有可能，再檢查另一個。', example: '例：$2^{5} \\div 7$ 的餘數——$2 \\to 4 \\to 1 \\to 2 \\to 4$，所以餘 $4$。', tip: '不要死算大數，善用「取餘數」和「找出週期」。' },
      en: { title: 'Number Theory Challenge', intro: 'Remainders, factors/multiples and congruences are the toolkit of olympiad number theory. Take the remainder after each multiplication for powers, and for simultaneous remainders list the numbers satisfying one condition then test the other.', example: 'Example: $2^{5} \\div 7$ — remainders go $2 \\to 4 \\to 1 \\to 2 \\to 4$, so the answer is $4$.', tip: 'Avoid huge numbers: reduce modulo at every step and look for cycles.' },
      visual: null
    },
    'challenge.count': {
      zh: { title: '組合計數', intro: '數路徑、握手、排列與重複字母、容斥原理，核心都是「有系統地數，避免重複」。', example: '例：3×3 方格由左下走到右上，共 C(6,3) = 20 條路徑。', tip: '先問「是不是每條路都一樣長？」，再決定用組合數還是分類討論。' },
      en: { title: 'Counting Challenge', intro: 'Paths, handshakes, arrangements with repeated letters and inclusion–exclusion all come down to counting systematically without double counting.', example: 'Example: on a 3×3 grid, paths from corner to opposite corner = C(6,3) = 20.', tip: 'Ask whether all objects have the same length; then use combinations or cases.' },
      visual: null
    },
    'challenge.geo': {
      zh: { title: '幾何與時間', intro: '時針每小時 30°、分針每分鐘 6°；梯形面積 = （上底 + 下底）× 高 ÷ 2。', example: '例：3:30 時，分針 180°、時針 105°，夾角 75°。', tip: '先寫出兩枝針各自的角度，再取較小的夾角。' },
      en: { title: 'Geometry & Time Challenge', intro: 'The hour hand moves 30° per hour and the minute hand 6° per minute; trapezium area = (sum of parallel sides) × height ÷ 2.', example: 'Example: at 3:30 the minute hand is at 180° and the hour hand at 105°, so the angle is 75°.', tip: 'Write down both hand angles, then take the smaller angle.' },
      visual: null
    },
    'challenge.logic': {
      zh: { title: '邏輯與規律', intro: '數列題先看差、再看比，或看是否為平方數／三角數；「保證」題用最壞情況加鴿巢原理。', example: '例：3 種顏色，要保證有 2 隻同色，最壞先各取 1 隻，再多取 1 隻 = 4 隻。', tip: '規律題可先寫出差或比，再預測下一項。' },
      en: { title: 'Logic & Patterns Challenge', intro: 'For sequences look at differences, then ratios, or recognise squares/triangular numbers; for "guaranteed" questions use the worst case and pigeonhole principle.', example: 'Example: 3 colours, guarantee 2 of the same — worst case take 1 of each, then one more = 4.', tip: 'Write the differences or ratios first, then predict the next term.' },
      visual: null
    },
    'challenge.algebra': {
      zh: { title: '代數與應用', intro: '工程問題把整項工作看成 1；混合問題先算溶質總量，再除以總量求濃度。', example: '例：甲 6 天、乙 12 天完成同一工作，合作需 6×12÷(6+12) = 4 天。', tip: '先寫出「每天完成幾分之幾」或「溶質有多少」。' },
      en: { title: 'Algebra & Applied Challenge', intro: 'Treat the whole job as 1 for work problems; for mixtures find the total solute first, then divide by the total volume.', example: 'Example: Ann takes 6 days and Ben 12 days; together = 6×12÷(6+12) = 4 days.', tip: 'Write "fraction done per day" or "amount of solute" first.' },
      visual: null
    },
    'challenge.prob': {
      zh: { title: '概率遊戲', intro: '古典概率 $= \\frac{\\text{有利結果數}}{\\text{所有等可能結果數}}$。兩粒骰子共 $36$ 個結果；$n$ 枚硬幣共 $2^{n}$ 個。', example: '例：兩粒骰子和為 $7$ 有 $6$ 個結果，概率 $= \\frac{6}{36} = \\frac{1}{6}$。', tip: '先把所有結果列成整齊的表格，再數有利結果。' },
      en: { title: 'Probability Games', intro: 'Classical probability $= \\frac{\\text{favourable outcomes}}{\\text{equally likely outcomes}}$. Two dice have $36$ outcomes; $n$ coins have $2^{n}$.', example: 'Example: sum $7$ with two dice has $6$ outcomes, so $P = \\frac{6}{36} = \\frac{1}{6}$.', tip: 'Write all outcomes as a neat table first, then count the favourable ones.' },
      visual: null
    }
  };


  /* ---------- 教學深化：較抽象的課堂加入解題步驟與常見錯誤 ----------
   * 只覆寫指定欄位（intro 可選），其餘課堂內容保持原樣；
   * 渲染器會顯示 steps / mistake（向後兼容，沒有這兩個欄位的課堂不受影響）。 */
  var LESSON_DEEPEN = {
    'generic.word': {
      zh: {
        intro: '應用題不是「看到數字就加減」：先理解情境，再把文字翻譯成算式。流程是：讀題 → 找已知與未知 → 選運算／列式 → 計算 → 檢查。',
        steps: [
          '讀題兩次：第一次理解故事，第二次圈出數字和關鍵詞（一共、還剩、每、平均、比……多）。',
          '寫下「已知」和「要求」，用代號表示未知量；必要時畫線段圖或表格。',
          '把文字翻譯成算式；多步題先問「先求什麼、再求什麼」。',
          '計算後用估算或逆運算檢查，並確認單位一致。'
        ],
        mistake: '只抓數字就隨便加減，沒有先問「題目在問什麼」；或忽略單位不同（例如分鐘與小時）就直接相加。'
      },
      en: {
        intro: 'A word problem is not “see numbers, add or subtract”: first understand the situation, then translate the words into an equation. Read → identify knowns and unknowns → choose operations and set up → calculate → check.',
        steps: [
          'Read twice: once for the story, once to circle the numbers and key words (total, left, each, average, more than...).',
          'Write down the given information and what is asked; use a letter for the unknown and draw a bar model or table if needed.',
          'Translate the words into an equation; for multi-step problems, decide what to find first.',
          'Check with estimation or the inverse operation, and make sure the units match.'
        ],
        mistake: 'Grabbing the numbers and adding or subtracting at random instead of asking what the question means; or adding quantities with different units (minutes and hours) without converting.'
      }
    },
    'g6.percent': {
      zh: {
        intro: '百分數是分母 100 的分數：$25\\% = \\frac{25}{100} = 0.25$。求「某數的百分之幾」用乘法；比較兩數用「部分 $\\div$ 全部 $\\times 100\\%$」。',
        steps: [
          '把百分數化成小數或分數（$25\\% = 0.25$）。',
          '求某數的 $p\\%$：該數 $\\times \\frac{p}{100}$。',
          '折扣：原價 $\\times (1-\\text{折扣率})$；加價／增長：原值 $\\times (1+\\text{增長率})$。',
          '檢查：折扣後應比原價小，增長後應比原值大。'
        ],
        mistake: '把增長率和折扣率的基數搞錯；以為「先加 $20\\%$ 再減 $20\\%$」會回到原價。'
      },
      en: {
        intro: 'A percentage is a fraction with denominator 100: $25\\% = \\frac{25}{100} = 0.25$. “Percent of a number” uses multiplication; comparing two numbers uses part $\\div$ whole $\\times 100\\%$.',
        steps: [
          'Change the percentage to a decimal or fraction ($25\\% = 0.25$).',
          'To find $p\\%$ of a number: multiply by $\\frac{p}{100}$.',
          'Discount: original $\\times (1-\\text{rate})$; increase: original $\\times (1+\\text{rate})$.',
          'Check: a discount makes the price smaller; an increase makes it larger.'
        ],
        mistake: 'Using the wrong base for the percentage; assuming “add $20\\%$ then subtract $20\\%$” returns to the original value.'
      }
    },
    'g6.ratio': {
      zh: {
        intro: '比 $a:b$ 表示 $a$ 份對 $b$ 份；解題關鍵是先求「一份代表多少」。',
        steps: [
          '把比看成份數：$a:b$ = $a$ 份 : $b$ 份。',
          '求一份：總量 $\\div$ 總份數；或題目給的一邊 $\\div$ 它的份數。',
          '按份數分配：所求 $=$ 一份 $\\times$ 所求份數。',
          '驗算：各部分加起來等於總量。'
        ],
        mistake: '把比 $3:2$ 直接當成「3 和 2 個」；或把「甲比乙多幾份」和「甲是乙的幾倍」混淆。'
      },
      en: {
        intro: 'The ratio $a:b$ means $a$ parts to $b$ parts; the key is to find what one part is worth.',
        steps: [
          'Treat the ratio as parts: $a:b$ = $a$ parts : $b$ parts.',
          'Find one part: total $\\div$ total parts, or the given side $\\div$ its number of parts.',
          'Share by parts: required = one part $\\times$ required number of parts.',
          'Check: the parts must add up to the total.'
        ],
        mistake: 'Treating $3:2$ as the actual amounts 3 and 2; confusing “how many more parts A has” with “how many times A is of B”.'
      }
    },
    'ms.s1.linear': {
      zh: {
        intro: '解一元一次方程的目標：把 $x$ 單獨留在等號一邊。原則是等式兩邊同時做同一件事。',
        steps: [
          '去括號、去分母（若有），把含 $x$ 的項集中一邊、常數集中另一邊。',
          '移項要變號：加變減、減變加。',
          '合併同類項，兩邊同除以 $x$ 的係數。',
          '把答案代回原方程驗算。'
        ],
        mistake: '移項忘記變號；或兩邊除以係數時只除了一邊。'
      },
      en: {
        intro: 'The goal when solving a linear equation is to get $x$ alone on one side. Whatever you do to one side, do to the other.',
        steps: [
          'Remove brackets and denominators; collect $x$ terms on one side and constants on the other.',
          'When moving a term across the equals sign, flip its sign.',
          'Combine like terms, then divide both sides by the coefficient of $x$.',
          'Substitute the answer back into the original equation to check.'
        ],
        mistake: 'Forgetting to flip a sign when moving a term; dividing only one side by the coefficient.'
      }
    },
    'ms.s1.exprsub': {
      zh: {
        intro: '代入求值：把字母換成給定的數，再按運算順序計算。',
        steps: [
          '把數字用括號代入，例如 $x=-3$ 時 $2x$ 寫成 $2(-3)$。',
          '先算括號，再乘除，最後加減。',
          '負數相乘：負負得正；減負數等於加正數。',
          '寫出完整算式，逐步化簡。'
        ],
        mistake: '代入負數時不加括號，例如把 $2x$ 錯算成 $2-3$。'
      },
      en: {
        intro: 'Substitution: replace each letter with the given number, then calculate in the correct order.',
        steps: [
          'Put the number in brackets, e.g. when $x=-3$, write $2x$ as $2(-3)$.',
          'Brackets first, then multiplication/division, then addition/subtraction.',
          'Negative times negative is positive; subtracting a negative is adding.',
          'Write the full expression and simplify step by step.'
        ],
        mistake: 'Substituting a negative number without brackets, e.g. computing $2x$ as $2-3$.'
      }
    },
    'ms.s2.pythagoras': {
      zh: {
        intro: '畢氏定理：直角三角形兩條直角邊的平方和等於斜邊平方，$a^{2}+b^{2}=c^{2}$（$c$ 為斜邊）。',
        steps: [
          '先確認是直角三角形，斜邊是直角對面最長的一邊。',
          '寫出 $a^{2}+b^{2}=c^{2}$。',
          '求斜邊：$c=\\sqrt{a^{2}+b^{2}}$；求直角邊：$a=\\sqrt{c^{2}-b^{2}}$。',
          '檢查斜邊必須長於另外兩邊。'
        ],
        mistake: '把最長邊以外的邊當成斜邊；求直角邊時仍用加法，忘記開平方根。'
      },
      en: {
        intro: 'Pythagoras: in a right triangle, the squares of the two legs add up to the square of the hypotenuse, $a^{2}+b^{2}=c^{2}$ ($c$ is the hypotenuse).',
        steps: [
          'Confirm it is a right triangle; the hypotenuse is the longest side opposite the right angle.',
          'Write $a^{2}+b^{2}=c^{2}$.',
          'Hypotenuse: $c=\\sqrt{a^{2}+b^{2}}$; leg: $a=\\sqrt{c^{2}-b^{2}}$.',
          'Check that the hypotenuse is longer than each leg.'
        ],
        mistake: 'Treating a leg as the hypotenuse; using addition instead of subtraction (and forgetting the square root) when finding a leg.'
      }
    },
    'ms.s2.simul': {
      zh: {
        intro: '聯立方程用消元法：把兩式乘以適當倍數，令某個未知數的係數相同或相反，再相加／相減消去它。',
        steps: [
          '把兩條方程整理成 $ax+by=c$ 的標準式。',
          '選定要消去的未知數，把兩式乘以適當倍數。',
          '相加或相減消去該未知數，解出剩下的一個。',
          '代回任一條方程求另一個未知數，並代入兩式驗算。'
        ],
        mistake: '只把方程的一邊乘以倍數；或相減時符號處理錯。'
      },
      en: {
        intro: 'Solve simultaneous equations by elimination: multiply the equations so that one variable has equal or opposite coefficients, then add or subtract to remove it.',
        steps: [
          'Write both equations in the form $ax+by=c$.',
          'Choose a variable to eliminate and multiply each equation as needed.',
          'Add or subtract to eliminate it, then solve the remaining equation.',
          'Substitute back into either equation, then check both.'
        ],
        mistake: 'Multiplying only one side of an equation; mishandling signs when subtracting.'
      }
    },
    'ms.s3.indices': {
      zh: {
        intro: '指數定律（同底數）：$a^{m}\\times a^{n}=a^{m+n}$、$a^{m}\\div a^{n}=a^{m-n}$、$(a^{m})^{n}=a^{mn}$、$(ab)^{n}=a^{n}b^{n}$。',
        steps: [
          '先確認底數相同；不同底數先化成同底。',
          '乘法：指數相加；除法：指數相減。',
          '括號乘方：指數相乘；積的乘方：每個因數各自乘方。',
          '結果能化簡就化簡（例如 $2^{5}=32$）。'
        ],
        mistake: '把 $a^{m}\\times a^{n}$ 算成 $a^{mn}$；混淆負指數與零指數。'
      },
      en: {
        intro: 'Laws of indices with the same base: $a^{m}\\times a^{n}=a^{m+n}$, $a^{m}\\div a^{n}=a^{m-n}$, $(a^{m})^{n}=a^{mn}$, $(ab)^{n}=a^{n}b^{n}$.',
        steps: [
          'Check the bases; if different, rewrite them with a common base first.',
          'Multiplication: add exponents; division: subtract exponents.',
          'Power of a power: multiply exponents; power of a product: apply the power to each factor.',
          'Simplify the result where possible (e.g. $2^{5}=32$).'
        ],
        mistake: 'Writing $a^{m}\\times a^{n}$ as $a^{mn}$; confusing negative and zero exponents.'
      }
    },
    'hs.s4.quadsolve': {
      zh: {
        intro: '二次方程 $ax^{2}+bx+c=0$：能因式分解就因式分解，否則用公式 $x=\\frac{-b\\pm\\sqrt{b^{2}-4ac}}{2a}$。',
        steps: [
          '整理成 $ax^{2}+bx+c=0$ 並確認 $a\\neq0$。',
          '嘗試因式分解：找 $p,q$ 使 $p+q=-b$、$pq=c$（當 $a=1$）。',
          '寫成 $(x-p)(x-q)=0$，根為 $p,q$。',
          '若不能分解，先算判別式 $b^{2}-4ac$，再代入公式。'
        ],
        mistake: '因式分解時符號錯；或忘記檢查判別式而強行開根號。'
      },
      en: {
        intro: 'Quadratic $ax^{2}+bx+c=0$: factorise if possible; otherwise use $x=\\frac{-b\\pm\\sqrt{b^{2}-4ac}}{2a}$.',
        steps: [
          'Rearrange into $ax^{2}+bx+c=0$ and confirm $a\\neq0$.',
          'Try factorising: find $p,q$ with $p+q=-b$ and $pq=c$ (when $a=1$).',
          'Write $(x-p)(x-q)=0$; the roots are $p$ and $q$.',
          'If it does not factorise, evaluate $b^{2}-4ac$ and use the formula.'
        ],
        mistake: 'Making sign errors in the factors; taking square roots without checking the discriminant.'
      }
    },
    'hs.s4.log': {
      zh: {
        intro: '對數是指數的逆運算：$\\log_b x=y \\iff b^{y}=x$（$b>0$、$b\\neq1$、$x>0$）。',
        steps: [
          '把對數式改寫成指數式：$\\log_b x=y \\iff b^{y}=x$。',
          '同底相加：$\\log m+\\log n=\\log(mn)$；相減：$\\log m-\\log n=\\log\\frac{m}{n}$。',
          '係數移入真數：$k\\log m=\\log(m^{k})$。',
          '解方程後檢查真數 $>0$。'
        ],
        mistake: '把 $\\log(m+n)$ 當成 $\\log m+\\log n$；忽略真數必須大於 0。'
      },
      en: {
        intro: 'A logarithm is the inverse of a power: $\\log_b x=y \\iff b^{y}=x$ ($b>0$, $b\\neq1$, $x>0$).',
        steps: [
          'Rewrite the log as an exponential: $\\log_b x=y \\iff b^{y}=x$.',
          'Same base: $\\log m+\\log n=\\log(mn)$; $\\log m-\\log n=\\log\\frac{m}{n}$.',
          'Move a coefficient into the argument: $k\\log m=\\log(m^{k})$.',
          'After solving, check that every argument is $>0$.'
        ],
        mistake: 'Treating $\\log(m+n)$ as $\\log m+\\log n$; ignoring the domain $x>0$.'
      }
    },
    'hs.s5.ap': {
      zh: {
        intro: '等差數列：後一項減前一項等於固定公差 $d$。第 $n$ 項 $a_n=a+(n-1)d$，前 $n$ 項和 $S_n=\\frac{n}{2}[2a+(n-1)d]$。',
        steps: [
          '由相鄰兩項求公差 $d$。',
          '確認首項 $a$；第 $n$ 項用 $a+(n-1)d$。',
          '求和可用公式，或配對首尾：$S_n=\\frac{n(a_1+a_n)}{2}$。',
          '檢查所求是「某一項」還是「前 $n$ 項和」。'
        ],
        mistake: '項數算錯（第 $n$ 項只加了 $n-1$ 次公差）；把第 $n$ 項與前 $n$ 項和的公式混用。'
      },
      en: {
        intro: 'Arithmetic sequence: consecutive terms differ by a fixed common difference $d$. nth term $a_n=a+(n-1)d$; sum $S_n=\\frac{n}{2}[2a+(n-1)d]$.',
        steps: [
          'Find $d$ from two neighbouring terms.',
          'Identify the first term $a$; use $a+(n-1)d$ for the nth term.',
          'Use the sum formula, or pair first and last: $S_n=\\frac{n(a_1+a_n)}{2}$.',
          'Check whether the question asks for a term or a sum.'
        ],
        mistake: 'Getting the number of terms wrong (adding $d$ only $n-1$ times); mixing up the nth-term and sum formulas.'
      }
    },
    'hs.s6.stats': {
      zh: {
        intro: '中位數：排序後取中間。單數個取正中間；雙數個取中間兩個的平均。',
        steps: [
          '先把數據由小到大排序，數清楚共有 $n$ 個。',
          '$n$ 為單數：中位數是第 $\\frac{n+1}{2}$ 個。',
          '$n$ 為雙數：中位數是第 $\\frac{n}{2}$ 與第 $\\frac{n}{2}+1$ 個的平均。',
          '若同時問平均數：總和 $\\div n$；留意極端值對平均數影響較大。'
        ],
        mistake: '沒有排序就直接取中間；雙數個數據只取其中一個。'
      },
      en: {
        intro: 'Median: sort the data and take the middle. For an odd count use the middle value; for an even count average the two middle values.',
        steps: [
          'Sort the data from smallest to largest and count $n$.',
          'Odd $n$: the median is the $\\frac{n+1}{2}$-th value.',
          'Even $n$: average the $\\frac{n}{2}$-th and $(\\frac{n}{2}+1)$-th values.',
          'If asked for the mean too: total $\\div n$; outliers affect the mean more.'
        ],
        mistake: 'Taking a middle value without sorting; for an even count using only one of the two middle values.'
      }
    },
    'hs.s6.derivative': {
      zh: {
        intro: '冪函數求導：若 $f(x)=ax^{n}$，則 $f\'(x)=anx^{n-1}$；常數的導數是 $0$。',
        steps: [
          '把指數 $n$ 乘到係數前面。',
          '指數減 $1$ 成為新的指數。',
          '常數項的導數是 $0$。',
          '要求某一點的導數值時，把 $x$ 代入導函數。'
        ],
        mistake: '忘記常數項導數為 0；乘了係數卻忘記把次方減 1。'
      },
      en: {
        intro: 'Differentiating powers: if $f(x)=ax^{n}$ then $f\'(x)=anx^{n-1}$; the derivative of a constant is $0$.',
        steps: [
          'Multiply the coefficient by the exponent $n$.',
          'Reduce the exponent by $1$.',
          'The derivative of a constant term is $0$.',
          'For the derivative at a point, substitute the $x$-value into the derivative.'
        ],
        mistake: 'Forgetting that a constant differentiates to 0; multiplying by the exponent but forgetting to reduce the power.'
      }
    },
    'col.calculus': {
      zh: {
        intro: '微分：$\\frac{d}{dx}(ax^{n})=anx^{n-1}$；定積分：$\\int_0^b ax^{n}\\,dx=\\frac{a b^{n+1}}{n+1}$（$n\\neq-1$）。',
        steps: [
          '微分：指數乘到前面，次方減 1；常數導數 0。',
          '積分：次方加 1，再除以新次方。',
          '定積分先求原函數，再代入上限減下限。',
          '檢查次數與符號是否合理。'
        ],
        mistake: '積分忘記除以新次方；定積分忘記代入上下限。'
      },
      en: {
        intro: 'Differentiation: $\\frac{d}{dx}(ax^{n})=anx^{n-1}$; definite integral: $\\int_0^b ax^{n}\\,dx=\\frac{a b^{n+1}}{n+1}$ ($n\\neq-1$).',
        steps: [
          'Differentiate: multiply by the exponent, then reduce the power by 1; constants give 0.',
          'Integrate: add 1 to the power, then divide by the new power.',
          'For a definite integral, find the antiderivative, then substitute upper minus lower.',
          'Check the degree and sign of the answer.'
        ],
        mistake: 'Forgetting to divide by the new power when integrating; omitting the limits in a definite integral.'
      }
    },
    'ms.s3.prob': {
      zh: {
        intro: '古典概率：$P=\\frac{\\text{有利結果數}}{\\text{所有等可能結果數}}$。概率一定在 $0$ 與 $1$ 之間。',
        steps: [
          '列出所有等可能的結果，數出總數。',
          '數出符合條件的有利結果。',
          '相除並約至最簡分數。',
          '檢查 $0\\le P\\le1$；所有可能結果的概率和應為 $1$。'
        ],
        mistake: '把有利結果與總數倒轉；忘記約簡，或把互斥事件重複計算。'
      },
      en: {
        intro: 'Classical probability: $P=\\frac{\\text{favourable outcomes}}{\\text{all equally likely outcomes}}$, always between $0$ and $1$.',
        steps: [
          'List all equally likely outcomes and count the total.',
          'Count the favourable outcomes.',
          'Divide and simplify the fraction.',
          'Check $0\\le P\\le1$; the probabilities of all outcomes should sum to $1$.'
        ],
        mistake: 'Swapping favourable outcomes and total; forgetting to simplify, or double-counting mutually exclusive events.'
      }
    }
  };

  Object.keys(LESSON_DEEPEN).forEach(function (key) {
    if (!L[key]) return;
    ['zh', 'en'].forEach(function (lang) {
      var d = LESSON_DEEPEN[key][lang];
      if (!d) return;
      Object.keys(d).forEach(function (field) { L[key][lang][field] = d[field]; });
    });
  });


  /* 教學深化（小學）：每一步如何做 + 最常見錯誤 */
  var LESSON_DEEPEN_PRIMARY = {
    'prek.count': {
      zh: { steps: ['用手指指著物件，一個一個地數，不要跳過或重複。', '每數一個就說出一個數；最後說出的數就是總數。', '數完後換個方向再數一次，確認答案一樣。'], mistake: '數得太快而漏數或重複數同一個物件；或把最後一個數當成「還有幾個」。' },
      en: { steps: ['Point to each object and count one by one; do not skip or double-count.', 'Say one number for each object; the last number you say is the total.', 'Count again in a different order to check the answer is the same.'], mistake: 'Counting too fast and skipping or repeating an object; treating the last number as “how many are left”.' }
    },
    'prek.compare': {
      zh: { steps: ['把兩組物件一個對一個配對起來。', '配對後多出物件的那一組比較多；都沒有多出就一樣多。', '再用數字比較：數數時較後出現的數較大。'], mistake: '只憑排列的長短判斷多少；或兩組排得疏密不同就以為數量不同。' },
      en: { steps: ['Match the objects in the two groups one-to-one.', 'The group with objects left over has more; if nothing is left over, they are equal.', 'Compare the numbers too: the number you reach later when counting is larger.'], mistake: 'Judging by how long the rows look; thinking the amount changed because one row is more spread out.' }
    },
    'prek.add10': {
      zh: { steps: ['先數第一堆有多少個。', '從第一堆的最後一個數接着往上數第二堆。', '數到第二堆最後一個，說出的數就是答案。'], mistake: '兩堆都從 1 開始數而忘記接着數；或漏掉其中一堆的物件。' },
      en: { steps: ['Count how many are in the first group.', 'Starting from that last number, keep counting on for the second group.', 'The last number you say is the total.'], mistake: 'Starting both groups from 1 instead of counting on; or missing objects from one group.' }
    },
    'prek.sub10': {
      zh: { steps: ['先數出原本一共有多少個。', '把要拿走的逐一拿走並數出去。', '數剩下來的物件，就是答案。'], mistake: '拿走時多拿或少拿；或把「拿走幾個」當成答案。' },
      en: { steps: ['Count the total you start with.', 'Take away the given number, counting them out one by one.', 'Count what is left; that is the answer.'], mistake: 'Taking away too many or too few; or giving the number taken away instead of what is left.' }
    },
    'prek.bonds10': {
      zh: { steps: ['用實物把總數分成兩堆（例如 7 個分成 3 個和 4 個）。', '說出「7 可以分成 3 和 4」。', '用分解做加減：3 + ? = 7，就是問 7 分成 3 和幾。'], mistake: '只背分解而沒有用實物理解；或分成的兩部分加起來不等於總數。' },
      en: { steps: ['Split the total into two groups with real objects (e.g. 7 into 3 and 4).', 'Say “7 can split into 3 and 4”.', 'Use the split for addition and subtraction: 3 + ? = 7 means 7 split into 3 and what.'], mistake: 'Memorising the split without understanding; or the two parts not adding back to the total.' }
    },
    'g1.add20': {
      zh: { steps: ['看較大的數還差多少才到 10。', '把較小的數拆成「補到 10 的部分」和「剩下的部分」。', '先加補十，再加剩下的部分。'], mistake: '拆分時拆錯或忘記把剩下的部分加回去。' },
      en: { steps: ['See how far the larger number is from 10.', 'Split the smaller number into “enough to make 10” and “the rest”.', 'Add to make 10 first, then add the rest.'], mistake: 'Splitting the number incorrectly or forgetting to add the remaining part back.' }
    },
    'g1.sub20': {
      zh: { steps: ['想「減數加多少等於被減數」。', '用加法口訣找出這個數。', '用加法驗算：差 + 減數 = 被減數。'], mistake: '想加算減時方向搞反；或退位時借錯。' },
      en: { steps: ['Ask: what plus the number being subtracted equals the starting number?', 'Use an addition fact to find it.', 'Check with addition: difference + subtracted number = starting number.'], mistake: 'Using subtraction the wrong way round; or borrowing incorrectly.' }
    },
    'g1.place100': {
      zh: { steps: ['把兩位數拆成「幾個十 + 幾個一」。', '比較大小先看十位，十位相同再看個位。', '用位值表（十位／個位）寫出數字，避免調亂。'], mistake: '只比較數字而忽略位置；或把「幾個十」和「幾個一」倒轉。' },
      en: { steps: ['Split a two-digit number into “tens + ones”.', 'Compare the tens digit first; if equal, compare the ones digit.', 'Write the number in a place-value table to avoid mixing up positions.'], mistake: 'Comparing digits without considering place value; swapping tens and ones.' }
    },
    'g1.addsub100': {
      zh: { steps: ['把整十數看成「幾個十」。', '只計算十位的加減。', '答案後面補回一個 0。'], mistake: '忘記補 0；或把 30 + 20 算成 5。' },
      en: { steps: ['Treat round tens as “how many tens”.', 'Add or subtract only the tens.', 'Put the zero back in the answer.'], mistake: 'Forgetting the zero; or writing 30 + 20 = 5.' }
    },
    'g1.word': {
      zh: { steps: ['讀題，找出已知的數和所問的問題。', '判斷關鍵詞：「一共」用加，「還剩」用減。', '列式計算，並用完整句子回答（帶單位）。'], mistake: '看到數字就加；或只寫了算式而沒有回答問題。' },
      en: { steps: ['Read the problem and identify the numbers and the question.', 'Use key words: “in total” suggests addition, “left” suggests subtraction.', 'Write the number sentence and answer in a full sentence with units.'], mistake: 'Adding because numbers appeared; or writing an expression without answering the question.' }
    },
    'g1.money': {
      zh: { steps: ['看清楚付了多少錢、東西多少錢。', '找續 = 付的錢 − 價錢。', '用「價錢 + 找續 = 付的錢」驗算。'], mistake: '用價錢減付的錢；或把「元」和「角」混在一起直接加減。' },
      en: { steps: ['Identify how much was paid and how much the item costs.', 'Change = paid − price.', 'Check with price + change = paid.'], mistake: 'Subtracting the wrong way round; or mixing dollars and cents without converting.' }
    },
    'g1.oddeven': {
      zh: { steps: ['把物件兩個一組地分。', '剛好分完是偶數；剩下 1 個是奇數。', '看個位數字：0、2、4、6、8 是偶數；1、3、5、7、9 是奇數。'], mistake: '只記住 2、4、6、8 而漏掉 0；或把「下一個偶數」加 1。' },
      en: { steps: ['Pair the objects into groups of two.', 'No remainder means even; one left over means odd.', 'Use the ones digit: 0, 2, 4, 6, 8 are even; 1, 3, 5, 7, 9 are odd.'], mistake: 'Forgetting 0 is even; or adding 1 to get the next even number.' }
    },
    'g2.addsub100r': {
      zh: { steps: ['先算個位；個位滿 10 就向十位進 1。', '再算十位，記得加上進位的 1。', '減法先算個位；不夠減就向十位借 1 當 10。'], mistake: '忘記加進位的 1；或借位後十位沒有減 1。' },
      en: { steps: ['Start with the ones; if the ones reach 10, carry 1 to the tens.', 'Then add the tens, including the carried 1.', 'For subtraction, start at the ones; if not enough, borrow 1 ten as 10 ones.'], mistake: 'Forgetting the carried 1; or not reducing the tens after borrowing.' }
    },
    'g2.mul25': {
      zh: { steps: ['把乘法看成「幾個幾相加」。', '用口訣或跳數（2、4、6…／5、10、15…）計算。', '用除法驗算：積 ÷ 其中一個數 = 另一個數。'], mistake: '把 3 × 2 和 2 × 3 的答案算錯；或跳數時漏了一格。' },
      en: { steps: ['Think of multiplication as repeated addition.', 'Use tables or skip counting (2, 4, 6... / 5, 10, 15...).', 'Check with division: product ÷ one factor = the other factor.'], mistake: 'Computing 3 × 2 or 2 × 3 incorrectly; or skipping a step when skip counting.' }
    },
    'g2.mul34': {
      zh: { steps: ['3 的乘法每次加 3；4 的乘法每次加 4。', '記住 3 × 4 = 12 等常用口訣。', '用跳數檢查：3、6、9、12…'], mistake: '把 3 × 4 和 4 × 3 當成不同答案；或加錯次數。' },
      en: { steps: ['The 3 times table adds 3 each time; the 4 times table adds 4.', 'Memorise facts such as 3 × 4 = 12.', 'Check by skip counting: 3, 6, 9, 12...'], mistake: 'Thinking 3 × 4 and 4 × 3 have different answers; or adding the wrong number of times.' }
    },
    'g2.div': {
      zh: { steps: ['把總數平均分成指定份數。', '一份一份地分，直到分完。', '用乘法驗算：每份 × 份數 = 總數。'], mistake: '分成不平均的份；或把「份數」和「每份數量」倒轉。' },
      en: { steps: ['Share the total equally into the given number of groups.', 'Give one to each group at a time until none are left.', 'Check with multiplication: each share × number of groups = total.'], mistake: 'Making unequal groups; or swapping the number of groups with the size of each share.' }
    },
    'g2.word': {
      zh: { steps: ['讀題，找出已知數量和問題。', '判斷運算：合起來用加、拿走用減、幾個幾用乘。', '列式計算並寫出完整答案（帶單位）。'], mistake: '把「每盒 4 個、3 盒」算成 4 + 3；或漏掉最後的單位。' },
      en: { steps: ['Read the problem and identify the quantities and the question.', 'Choose the operation: combine = add, take away = subtract, equal groups = multiply.', 'Calculate and write a complete answer with units.'], mistake: 'Adding 4 + 3 for “4 per box, 3 boxes”; or leaving out the units.' }
    },
    'g2.fact': {
      zh: { steps: ['記住常用換算：1 小時 = 60 分鐘、1 米 = 100 釐米、1 千克 = 1000 克。', '大單位換小單位乘，小單位換大單位除。', '換算後檢查數值大小是否合理。'], mistake: '乘除方向搞反；或把 1 日 = 24 小時記成 12 小時。' },
      en: { steps: ['Remember common conversions: 1 hour = 60 minutes, 1 metre = 100 cm, 1 kg = 1000 g.', 'Larger unit to smaller unit: multiply; smaller to larger: divide.', 'Check the size of the converted value is sensible.'], mistake: 'Multiplying when you should divide (or vice versa); or mixing up 24 hours and 12 hours in a day.' }
    },
    'g2.direction': {
      zh: { steps: ['記住東、南、西、北的順序（順時針：東→南→西→北）。', '用太陽升起（東）和指南針確認方向。', '面向北方時，右手邊是東、左手邊是西。'], mistake: '把東南西北的順序記錯；或面向不同方向時左右混淆。' },
      en: { steps: ['Remember the order east, south, west, north (clockwise).', 'Use sunrise (east) and a compass to confirm directions.', 'Facing north, east is on your right and west on your left.'], mistake: 'Getting the order of the compass directions wrong; or confusing left and right when facing a different way.' }
    },
    'g3.multable': {
      zh: { steps: ['先背熟 6、7、8、9 的乘法口訣，從 6 × 6 開始。', '用已知口訣推未知：7 × 8 = 7 × 7 + 7。', '用除法驗算：42 ÷ 6 = 7，所以 6 × 7 = 42。'], mistake: '把 7 × 8 和 8 × 7 當成不同答案；或口訣背串。' },
      en: { steps: ['Learn the 6, 7, 8 and 9 times tables, starting from 6 × 6.', 'Derive unknown facts from known ones: 7 × 8 = 7 × 7 + 7.', 'Check with division: 42 ÷ 6 = 7, so 6 × 7 = 42.'], mistake: 'Thinking 7 × 8 and 8 × 7 differ; or mixing up table entries.' }
    },
    'g3.mulfree': {
      zh: { steps: ['把較大的數拆成容易算的數（例如 8 × 6 = 8 × 5 + 8）。', '用分配律或口訣計算。', '用估算檢查：8 × 6 應接近 8 × 5 = 40。'], mistake: '拆數後漏加一部分；或把乘號看成加號。' },
      en: { steps: ['Split a larger factor into easier parts (e.g. 8 × 6 = 8 × 5 + 8).', 'Use the distributive law or times tables.', 'Estimate to check: 8 × 6 should be near 8 × 5 = 40.'], mistake: 'Splitting the number and forgetting one part; or reading × as +.' }
    },
    'g3.addsubbig': {
      zh: { steps: ['把數字按位值對齊（個位對個位、十位對十位）。', '從個位開始加減，滿十進位、不夠減借位。', '用逆運算驗算。'], mistake: '沒有對齊位值；或進退位忘記加減 1。' },
      en: { steps: ['Line up digits by place value (ones under ones, tens under tens).', 'Start at the ones; carry when reaching ten, borrow when not enough.', 'Check using the inverse operation.'], mistake: 'Not lining up place values; or forgetting to add/subtract 1 when carrying or borrowing.' }
    },
    'g3.muldiv': {
      zh: { steps: ['先想相關的乘法口訣。', '乘法求積；除法想「幾乘幾等於被除數」。', '用乘除互逆驗算。'], mistake: '把被除數和除數倒轉；或口訣記錯。' },
      en: { steps: ['Recall the related times-table fact.', 'For multiplication find the product; for division ask what times what gives the dividend.', 'Check using the inverse operation.'], mistake: 'Swapping dividend and divisor; or recalling the wrong table fact.' }
    },
    'g3.fraction': {
      zh: { steps: ['把整體平均分成指定份數（分母）。', '取其中幾份（分子）。', '寫成幾分之幾，並檢查分子分母的意義。'], mistake: '沒有平均分就取份；或把分子分母寫反。' },
      en: { steps: ['Split the whole into equal parts (denominator).', 'Take some of those parts (numerator).', 'Write the fraction and check what numerator and denominator mean.'], mistake: 'Taking parts without splitting equally; or writing numerator and denominator the wrong way round.' }
    },
    'g3.word': {
      zh: { steps: ['讀題兩次，圈出數字和關鍵詞。', '先想要先求什麼（例如先求總數），再求最後答案。', '列式計算並用估算檢查。'], mistake: '只做一步就回答多步題；或忽略「用了／還剩」的次序。' },
      en: { steps: ['Read twice and circle the numbers and key words.', 'Decide what to find first (e.g. the total), then the final answer.', 'Write the number sentence and check with estimation.'], mistake: 'Stopping after one step in a two-step problem; or ignoring the order of “used” and “left”.' }
    },
    'g3.angle': {
      zh: { steps: ['認識直角 = 90°，平角 = 180°。', '用三角尺的直角比較：小於 90° 是銳角，大於 90° 是鈍角。', '用 90°／180° 檢查角度估計。'], mistake: '把接近 90° 的角誤判為直角；或把平角當成 90°。' },
      en: { steps: ['Know that a right angle is 90° and a straight angle is 180°.', 'Compare with a right-angle square: less than 90° is acute, more than 90° is obtuse.', 'Check angle estimates against 90° and 180°.'], mistake: 'Calling an angle near 90° a right angle; or treating a straight angle as 90°.' }
    },
    'g3.shape': {
      zh: { steps: ['數一數圖形的邊、頂點和面。', '分辨平面圖形（邊、頂點）和立體圖形（面、棱、頂點）。', '用實物或模型輔助檢查。'], mistake: '把立體圖形的「面」和平面圖形的「邊」混淆；數漏頂點。' },
      en: { steps: ['Count the sides, vertices and faces of the shape.', 'Distinguish 2D shapes (sides, vertices) from solids (faces, edges, vertices).', 'Use an object or model to check.'], mistake: 'Confusing faces of a solid with sides of a 2D shape; or missing vertices.' }
    },
    'g3.time24': {
      zh: { steps: ['下午 1 時到午夜 12 時，24 小時制 = 12 小時制 + 12。', '上午時間不變；中午 12 時 = 12:00。', '用 24 小時制讀法檢查（例如 17:00 是下午 5 時）。'], mistake: '忘記加 12；或把 12:00 和 00:00 混淆。' },
      en: { steps: ['For 1 pm to midnight, 24-hour time = 12-hour time + 12.', 'Morning times stay the same; noon is 12:00.', 'Check by reading the 24-hour time back (e.g. 17:00 is 5 pm).'], mistake: 'Forgetting to add 12; or confusing 12:00 with 00:00.' }
    }
  };

  Object.keys(LESSON_DEEPEN_PRIMARY).forEach(function (key) {
    if (!L[key]) return;
    ['zh', 'en'].forEach(function (lang) {
      var d = LESSON_DEEPEN_PRIMARY[key][lang];
      if (!d) return;
      Object.keys(d).forEach(function (field) { L[key][lang][field] = d[field]; });
    });
  });


  /* 教學深化（高小至中一） */
  var LESSON_DEEPEN_MID = {
    'g4.multidigit': {
      zh: { steps: ['用豎式，把相同位值對齊。', '從個位開始乘或除，處理進位或餘數。', '用估算或逆運算檢查答案。'], mistake: '乘法漏加進位；或除法餘數沒有處理、寫錯位置。' },
      en: { steps: ['Use column form and line up equal place values.', 'Start at the ones when multiplying or dividing; handle carries or remainders.', 'Check with estimation or the inverse operation.'], mistake: 'Forgetting to add a carry; or mishandling the remainder in division.' }
    },
    'g4.fractionadd': {
      zh: { steps: ['確認分母相同（不同分母要先通分）。', '分子相加減，分母保持不變。', '化簡答案（如需要）。'], mistake: '把分母也相加；或忘記化簡。' },
      en: { steps: ['Check the denominators are equal (find a common denominator if not).', 'Add or subtract the numerators; keep the denominator unchanged.', 'Simplify the answer if possible.'], mistake: 'Adding the denominators too; or forgetting to simplify.' }
    },
    'g4.decimal': {
      zh: { steps: ['把小數點對齊（必要時補 0）。', '按整數加減法計算。', '答案的小數點與上面對齊。'], mistake: '沒有對齊小數點；或位數不同時漏補 0。' },
      en: { steps: ['Line up the decimal points, adding zeros if needed.', 'Add or subtract as if they were whole numbers.', 'Place the decimal point in the answer directly below the others.'], mistake: 'Not lining up decimal points; or not adding place-holder zeros.' }
    },
    'g4.area': {
      zh: { steps: ['寫出公式：面積 = 長 × 闊。', '代入長和闊，注意單位。', '用「面積 ÷ 長 = 闊」驗算。'], mistake: '把面積和周界公式混淆；或單位寫成 cm 而非 cm²。' },
      en: { steps: ['Write the formula: area = length × width.', 'Substitute the length and width, keeping units consistent.', 'Check with area ÷ length = width.'], mistake: 'Mixing up area and perimeter formulas; or writing cm instead of cm².' }
    },
    'g4.triangle': {
      zh: { steps: ['寫出公式：面積 = 底 × 高 ÷ 2。', '確認高是垂直於底的高。', '代入計算並用「面積 × 2 ÷ 底 = 高」驗算。'], mistake: '忘記除以 2；或把斜邊當成高。' },
      en: { steps: ['Write the formula: area = base × height ÷ 2.', 'Make sure the height is perpendicular to the base.', 'Substitute and check with area × 2 ÷ base = height.'], mistake: 'Forgetting to divide by 2; or using a slanted side as the height.' }
    },
    'g4.perimeter': {
      zh: { steps: ['沿圖形外圍走一圈，逐條邊相加。', '長方形周界 = 2 × (長 + 闊)。', '檢查單位是長度單位（cm）。'], mistake: '把面積和周界混淆；或漏加其中一條邊。' },
      en: { steps: ['Walk around the outside of the shape and add every side.', 'Rectangle perimeter = 2 × (length + width).', 'Check the unit is a length unit (cm).'], mistake: 'Confusing area with perimeter; or missing a side.' }
    },
    'g5.decimalmul': {
      zh: { steps: ['先當整數相乘或相除。', '數一數兩個數共有幾位小數，答案就點幾位小數。', '用估算檢查小數點位置是否合理。'], mistake: '小數點位數數錯；或除法忘記移動小數點。' },
      en: { steps: ['Multiply or divide as if the numbers were whole numbers.', 'Count the total decimal places and put the point back accordingly.', 'Estimate to check the decimal point is in a sensible place.'], mistake: 'Counting decimal places incorrectly; or forgetting to move the decimal point in division.' }
    },
    'g5.average': {
      zh: { steps: ['把所有數加起來。', '除以數的個數。', '用「平均數 × 個數 = 總和」驗算。'], mistake: '忘記除以個數；或加錯總和。' },
      en: { steps: ['Add all the values.', 'Divide by how many values there are.', 'Check with average × count = total.'], mistake: 'Forgetting to divide by the count; or adding the values incorrectly.' }
    },
    'g5.fractionof': {
      zh: { steps: ['先除以分母，求一份。', '再乘以分子，求幾份。', '用「答案 ÷ 原數 = 分數」檢查。'], mistake: '先乘後除次序錯；或把分子分母倒轉。' },
      en: { steps: ['Divide by the denominator to find one part.', 'Multiply by the numerator to find that many parts.', 'Check with answer ÷ original number = fraction.'], mistake: 'Multiplying before dividing; or swapping numerator and denominator.' }
    },
    'g6.equation': {
      zh: { steps: ['把含 x 的項和常數分開，常數移到等號另一邊（變號）。', '兩邊同時做相同的加減乘除，保持等式成立。', '把答案代回原方程驗算。'], mistake: '移項沒有變號；或只對一邊做運算。' },
      en: { steps: ['Separate the x term from the constant; move the constant to the other side with the opposite sign.', 'Do the same operation to both sides to keep the equation balanced.', 'Substitute the answer back to check.'], mistake: 'Moving a term without changing its sign; or changing only one side.' }
    },
    'g6.circle': {
      zh: { steps: ['寫出公式：周長 = 2πr，面積 = πr²。', '代入半徑，保留 π 或取近似值（依題目要求）。', '用直徑 = 2r 檢查。'], mistake: '把半徑和直徑混淆；或面積公式少了平方。' },
      en: { steps: ['Write the formulas: circumference = 2πr, area = πr².', 'Substitute the radius, keeping π or using an approximation as asked.', 'Check using diameter = 2r.'], mistake: 'Confusing radius and diameter; or forgetting to square r in the area formula.' }
    },
    'g6.volume': {
      zh: { steps: ['寫出長方體體積 = 長 × 闊 × 高。', '代入三個長度，單位要一致。', '用「體積 ÷ 底面積 = 高」驗算。'], mistake: '漏乘其中一個長度；或單位寫成 cm² 而非 cm³。' },
      en: { steps: ['Write volume of a cuboid = length × width × height.', 'Substitute the three lengths with consistent units.', 'Check with volume ÷ base area = height.'], mistake: 'Missing one of the lengths; or writing cm² instead of cm³.' }
    },
    'g6.symmetry': {
      zh: { steps: ['嘗試沿不同方向對摺，看兩邊是否完全重疊。', '數出所有能使圖形重疊的對稱軸。', '用鏡子或紙張輔助檢查。'], mistake: '只找到一條對稱軸就停；或把旋轉對稱當成對稱軸。' },
      en: { steps: ['Try folding along different lines to see if the halves match exactly.', 'Count every line that makes the shape overlap itself.', 'Use a mirror or paper to check.'], mistake: 'Stopping after finding one line of symmetry; or confusing rotational symmetry with a mirror line.' }
    },
    'ms.s1.directed': {
      zh: { steps: ['同號相加：取相同符號，絕對值相加。', '異號相加：取絕對值較大的符號，絕對值相減。', '乘除：同號得正、異號得負；先算括號。'], mistake: '把減負數當成加負數；或乘除符號規則記反。' },
      en: { steps: ['Same signs when adding: keep the sign and add the sizes.', 'Different signs when adding: take the sign of the larger size and subtract the sizes.', 'Multiplication/division: same signs give positive, different signs give negative; brackets first.'], mistake: 'Treating subtracting a negative as adding a negative; or reversing the sign rules for × and ÷.' }
    },
    'ms.s1.coord': {
      zh: { steps: ['距離：先算兩點的橫向差和縱向差。', '用畢氏定理：距離 = √(Δx² + Δy²)。', '中點：兩點坐標各自取平均。'], mistake: '距離忘記平方和開根號；中點只加不求平均。' },
      en: { steps: ['For distance, find the horizontal and vertical differences.', 'Use Pythagoras: distance = √(Δx² + Δy²).', 'For the midpoint, average the two x-coordinates and the two y-coordinates.'], mistake: 'Forgetting to square and take the square root for distance; averaging only one coordinate for the midpoint.' }
    },
    'ms.s1.liketerms': {
      zh: { steps: ['找出變數部分完全相同的項。', '把係數相加減，變數部分不變。', '檢查合併後是否已最簡。'], mistake: '把不同變數的項合併（如 3x + 5y）；或係數加錯。' },
      en: { steps: ['Identify terms with exactly the same variable part.', 'Add or subtract the coefficients; keep the variable part unchanged.', 'Check the result cannot be simplified further.'], mistake: 'Combining unlike terms such as 3x + 5y; or adding coefficients incorrectly.' }
    },
    'ms.s1.parallel': {
      zh: { steps: ['認出同位角、內錯角、同側內角的位置。', '同位角相等、內錯角相等、同側內角互補。', '用 180° 檢查互補關係。'], mistake: '把同位角和內錯角混淆；或互補角用 90°。' },
      en: { steps: ['Identify corresponding angles, alternate angles and co-interior angles.', 'Corresponding angles are equal, alternate angles are equal, co-interior angles add to 180°.', 'Check supplementary pairs with 180°.'], mistake: 'Confusing corresponding and alternate angles; or using 90° for supplementary angles.' }
    },
    'ms.s1.sqrt': {
      zh: { steps: ['找哪個數自乘等於被開方數。', '平方根取正數（除非題目指明負根）。', '用平方驗算：√64 = 8，因為 8² = 64。'], mistake: '把平方根和除以 2 混淆；或漏掉負根的可能。' },
      en: { steps: ['Find the number that multiplies by itself to give the value.', 'Take the positive square root unless a negative root is specified.', 'Check by squaring: √64 = 8 because 8² = 64.'], mistake: 'Confusing square root with dividing by 2; or ignoring a possible negative root.' }
    }
  };

  Object.keys(LESSON_DEEPEN_MID).forEach(function (key) {
    if (!L[key]) return;
    ['zh', 'en'].forEach(function (lang) {
      var d = LESSON_DEEPEN_MID[key][lang];
      if (!d) return;
      Object.keys(d).forEach(function (field) { L[key][lang][field] = d[field]; });
    });
  });


  /* 教學深化（中二至中三） */
  var LESSON_DEEPEN_MS2 = {
    'ms.s2.identity': {
      zh: { steps: ['展開時每一項都要乘到：(x + a)(x + b) = x² + (a + b)x + ab。', '完全平方：(x + a)² = x² + 2ax + a²。', '平方差：(a + b)(a − b) = a² − b²。'], mistake: '完全平方漏掉中間項 2ax；或平方差符號搞錯。' },
      en: { steps: ['Multiply every term when expanding: (x + a)(x + b) = x² + (a + b)x + ab.', 'Perfect square: (x + a)² = x² + 2ax + a².', 'Difference of squares: (a + b)(a − b) = a² − b².'], mistake: 'Missing the middle 2ax term in a perfect square; or getting the sign wrong in a difference of squares.' }
    },
    'ms.s2.polygon': {
      zh: { steps: ['n 邊形內角和 = (n − 2) × 180°。', '正多邊形每個內角 = 內角和 ÷ n。', '外角和固定是 360°。'], mistake: '把 (n − 2) 寫成 n；或把外角和當成 180°。' },
      en: { steps: ['Sum of interior angles of an n-gon = (n − 2) × 180°.', 'Each interior angle of a regular polygon = sum ÷ n.', 'The exterior angles always sum to 360°.'], mistake: 'Using n instead of (n − 2); or thinking exterior angles sum to 180°.' }
    },
    'ms.s2.polycoeff': {
      zh: { steps: ['次數 = 最高次項的指數。', '係數 = 該項前面的數（包括符號）。', '常數項的次數是 0。'], mistake: '把次數和係數混淆；或忽略負號。' },
      en: { steps: ['Degree = the highest exponent.', 'Coefficient = the number in front of the term, including its sign.', 'A constant term has degree 0.'], mistake: 'Confusing degree with coefficient; or ignoring a negative sign.' }
    },
    'ms.s2.congruent': {
      zh: { steps: ['全等 = 形狀和大小完全相同，對應邊、對應角相等。', '判定方法：SSS、SAS、ASA、AAS、RHS。', '寫出對應頂點時要按順序對應。'], mistake: '把相似當成全等；或對應邊沒有按順序配對。' },
      en: { steps: ['Congruent means same shape and size; corresponding sides and angles are equal.', 'Tests: SSS, SAS, ASA, AAS, RHS.', 'Write corresponding vertices in the matching order.'], mistake: 'Treating similar triangles as congruent; or pairing corresponding sides in the wrong order.' }
    },
    'ms.s2.similar': {
      zh: { steps: ['相似 = 形狀相同、大小可不同；對應角相等、對應邊成比例。', '找比例因子：對應邊之比值。', '用比例求未知邊。'], mistake: '把對應邊配錯；或把面積比當成邊長比（面積比是邊長比的平方）。' },
      en: { steps: ['Similar means same shape, possibly different size; equal corresponding angles and proportional corresponding sides.', 'Find the scale factor from a pair of corresponding sides.', 'Use the ratio to find an unknown side.'], mistake: 'Pairing the wrong corresponding sides; or treating an area ratio as a length ratio (area ratio is the square of the length ratio).' }
    },
    'ms.s2.quad': {
      zh: { steps: ['按邊和角分類四邊形。', '平行四邊形：兩組對邊平行且相等；梯形：只有一組對邊平行。', '用對角線、對角、內角等性質檢查。'], mistake: '把梯形和一般四邊形混淆；或以為所有平行四邊形都是長方形。' },
      en: { steps: ['Classify quadrilaterals by sides and angles.', 'Parallelogram: both pairs of opposite sides parallel and equal; trapezium: exactly one pair parallel.', 'Check using properties of diagonals, opposite angles and interior angles.'], mistake: 'Confusing a trapezium with a general quadrilateral; or assuming every parallelogram is a rectangle.' }
    },
    'ms.s2.sinterest': {
      zh: { steps: ['單利息 = 本金 × 年利率 × 年數。', '年利率先化成小數（5% = 0.05）。', '本利和 = 本金 + 利息。'], mistake: '把百分數直接當整數乘；或把單利息和複利息混淆。' },
      en: { steps: ['Simple interest = principal × annual rate × years.', 'Convert the rate to a decimal first (5% = 0.05).', 'Amount = principal + interest.'], mistake: 'Using the percentage as a whole number; or confusing simple with compound interest.' }
    },
    'ms.s2.approx': {
      zh: { steps: ['四捨五入到某單位，最大絕對誤差 = 該單位的一半。', '寫出量度值的可能範圍（± 最大誤差）。', '相對誤差 = 最大絕對誤差 ÷ 量度值。'], mistake: '把最大誤差當成整個單位；或範圍只寫一邊。' },
      en: { steps: ['When rounding to a unit, the maximum absolute error is half that unit.', 'Write the possible range of the measurement (± the maximum error).', 'Relative error = maximum absolute error ÷ measured value.'], mistake: 'Using the whole unit as the maximum error; or writing only one side of the range.' }
    },
    'ms.s3.inequality': {
      zh: { steps: ['解法和方程相同：移項、合併、除以係數。', '兩邊乘或除以負數時，不等號要反向。', '把解代回檢查，並用數線表示。'], mistake: '除以負數忘記反向；或把 > 和 ≥ 混淆。' },
      en: { steps: ['Solve like an equation: move terms, combine, divide by the coefficient.', 'When multiplying or dividing both sides by a negative, flip the inequality sign.', 'Check by substitution and show the solution on a number line.'], mistake: 'Forgetting to flip the sign when dividing by a negative; or confusing > with ≥.' }
    },
    'ms.s3.sector': {
      zh: { steps: ['扇形面積 = πr² × (θ/360°)。', '弧長 = 2πr × (θ/360°)。', '先確認 θ 是圓心角。'], mistake: '把扇形面積當成整個圓；或角度沒有除以 360。' },
      en: { steps: ['Sector area = πr² × (θ/360°).', 'Arc length = 2πr × (θ/360°).', 'Check that θ is the central angle.'], mistake: 'Using the whole circle area; or forgetting to divide the angle by 360.' }
    },
    'ms.s3.prism': {
      zh: { steps: ['柱體體積 = 底面積 × 高。', '錐體體積 = 底面積 × 高 ÷ 3。', '先算底面積，再乘高。'], mistake: '錐體忘記除以 3；或把底面積當成體積。' },
      en: { steps: ['Prism volume = base area × height.', 'Pyramid/cone volume = base area × height ÷ 3.', 'Find the base area first, then multiply by the height.'], mistake: 'Forgetting to divide a pyramid/cone by 3; or treating the base area as the volume.' }
    },
    'ms.s3.arclen': {
      zh: { steps: ['弧長 = 2πr × (θ/360°)。', 'θ 是圓心角，不是圓周角。', '用整個圓周長 2πr 檢查比例。'], mistake: '把半徑當直徑；或角度比例算錯。' },
      en: { steps: ['Arc length = 2πr × (θ/360°).', 'θ is the central angle, not an inscribed angle.', 'Check the fraction against the full circumference 2πr.'], mistake: 'Using the diameter instead of the radius; or miscalculating the angle fraction.' }
    },
    'ms.s3.mode': {
      zh: { steps: ['把數據逐個數出現次數。', '出現次數最多的數就是眾數。', '可能有多個眾數或沒有眾數。'], mistake: '把眾數和中位數混淆；或多個眾數只寫一個。' },
      en: { steps: ['Count how often each value appears.', 'The value that appears most often is the mode.', 'There may be more than one mode, or no mode.'], mistake: 'Confusing mode with median; or giving only one when there are several modes.' }
    },
    'ms.s3.cylinder': {
      zh: { steps: ['圓柱體積 = πr²h。', '側面積 = 2πrh；總表面積 = 2πr² + 2πrh。', '確認 r 是半徑、h 是高。'], mistake: '把半徑當直徑；或表面積漏掉兩個底圓。' },
      en: { steps: ['Cylinder volume = πr²h.', 'Curved surface area = 2πrh; total surface area = 2πr² + 2πrh.', 'Check that r is the radius and h is the height.'], mistake: 'Using the diameter instead of the radius; or leaving out the two circular ends in surface area.' }
    },
    'ms.s3.expand': {
      zh: { steps: ['用分配律逐項相乘。', '(x + a)(x + b) = x² + (a + b)x + ab。', '合併同類項並檢查符號。'], mistake: '漏乘某一項；或負號處理錯。' },
      en: { steps: ['Use the distributive law and multiply every pair of terms.', '(x + a)(x + b) = x² + (a + b)x + ab.', 'Combine like terms and check the signs.'], mistake: 'Missing a product; or making a sign error.' }
    },
    'ms.s3.pichart': {
      zh: { steps: ['每一部分的圓心角 = 百分比 × 360°。', '各部分角度加起來應是 360°。', '用比例檢查數值是否合理。'], mistake: '把百分比當成角度直接寫；或角度總和不等於 360°。' },
      en: { steps: ['Central angle of each sector = percentage × 360°.', 'The angles of all sectors should add to 360°.', 'Check the values with proportions.'], mistake: 'Writing the percentage as the angle; or angles not adding to 360°.' }
    },
    'ms.s3.cone': {
      zh: { steps: ['圓錐體積 = πr²h ÷ 3。', '球體積 = 4πr³ ÷ 3；球表面積 = 4πr²。', '先確認半徑，再代入公式。'], mistake: '圓錐和圓柱體積公式混淆；球體積忘記除以 3。' },
      en: { steps: ['Cone volume = πr²h ÷ 3.', 'Sphere volume = 4πr³ ÷ 3; sphere surface area = 4πr².', 'Confirm the radius before substituting.'], mistake: 'Confusing cone and cylinder volume; or forgetting to divide the sphere volume by 3.' }
    },
    'ms.s3.centre': {
      zh: { steps: ['內心：角平分線交點；外心：垂直平分線交點。', '重心：中線交點；垂心：高的交點。', '用定義檢查交點位置。'], mistake: '把重心和垂心混淆；或把外心當成角平分線交點。' },
      en: { steps: ['Incentre: intersection of angle bisectors; circumcentre: intersection of perpendicular bisectors.', 'Centroid: intersection of medians; orthocentre: intersection of altitudes.', 'Check the intersection using the definition.'], mistake: 'Confusing centroid and orthocentre; or mixing up the circumcentre with the angle bisectors.' }
    }
  };

  Object.keys(LESSON_DEEPEN_MS2).forEach(function (key) {
    if (!L[key]) return;
    ['zh', 'en'].forEach(function (lang) {
      var d = LESSON_DEEPEN_MS2[key][lang];
      if (!d) return;
      Object.keys(d).forEach(function (field) { L[key][lang][field] = d[field]; });
    });
  });


  /* 教學深化（高中、大學、挑戰區） */
  var LESSON_DEEPEN_SENIOR = {
    'hs.s4.fx': {
      zh: { steps: ['把 x 的值代入函數，每個 x 都換成該數。', '先算括號和平方，再乘除加減。', '用另一種代入方式或估算檢查。'], mistake: '代入負數不加括號；或平方和乘法的次序錯。' },
      en: { steps: ['Substitute the value of x wherever x appears in the function.', 'Work out brackets and squares first, then multiply/divide, then add/subtract.', 'Check with a second substitution or estimation.'], mistake: 'Substituting a negative number without brackets; or doing squares and multiplication in the wrong order.' }
    },
    'hs.s4.trig': {
      zh: { steps: ['認清直角三角形的對邊、鄰邊、斜邊（相對於角 θ）。', '$\\sin\\theta = \\frac{\\text{對邊}}{\\text{斜邊}}$、$\\cos\\theta = \\frac{\\text{鄰邊}}{\\text{斜邊}}$、$\\tan\\theta = \\frac{\\text{對邊}}{\\text{鄰邊}}$。', '用畢氏定理檢查三邊。'], mistake: '把對邊和鄰邊認錯；或分母用錯邊。' },
      en: { steps: ['Identify the opposite, adjacent and hypotenuse relative to θ.', '$\\sin\\theta = \\frac{\\text{opposite}}{\\text{hypotenuse}}$, $\\cos\\theta = \\frac{\\text{adjacent}}{\\text{hypotenuse}}$, $\\tan\\theta = \\frac{\\text{opposite}}{\\text{adjacent}}$.', 'Check the sides with Pythagoras.'], mistake: 'Swapping opposite and adjacent; or using the wrong side as the denominator.' }
    },
    'hs.s4.quad2': {
      zh: { steps: ['寫出 $a$、$b$、$c$（注意符號）。', '判別式 $D = b^{2} - 4ac$。', '$D > 0$ 兩實根、$D = 0$ 一重根、$D < 0$ 無實根。'], mistake: '$b$ 的符號代入錯；或把 $D = 0$ 當成無實根。' },
      en: { steps: ['Write down $a$, $b$ and $c$, including signs.', 'Discriminant $D = b^{2} - 4ac$.', '$D > 0$: two real roots; $D = 0$: one repeated root; $D < 0$: no real roots.'], mistake: 'Substituting the sign of $b$ incorrectly; or calling $D = 0$ “no real roots”.' }
    },
    'hs.s4.line2': {
      zh: { steps: ['把點 $(x, y)$ 代入直線方程。', '解出未知常數（如 $c$ 或 $m$）。', '用另一點或圖形檢查。'], mistake: '代入時 x、y 對調；或解方程符號錯。' },
      en: { steps: ['Substitute the point $(x, y)$ into the line equation.', 'Solve for the unknown constant ($c$ or $m$).', 'Check with another point or the graph.'], mistake: 'Swapping x and y when substituting; or making a sign error when solving.' }
    },
    'hs.s4.circleprop': {
      zh: { steps: ['認清圓心角、圓周角、同弓形角。', '圓心角 = 2 × 圓周角；同弓形圓周角相等；圓內接四邊形對角互補。', '切線垂直於過切點的半徑。'], mistake: '把圓心角和圓周角關係倒轉；或忘記對角互補。' },
      en: { steps: ['Identify central angles, inscribed angles and angles in the same segment.', 'Central angle = 2 × inscribed angle; angles in the same segment are equal; opposite angles of a cyclic quadrilateral are supplementary.', 'A tangent is perpendicular to the radius at the point of contact.'], mistake: 'Reversing the central/inscribed angle relation; or forgetting opposite angles are supplementary.' }
    },
    'hs.s4.line': {
      zh: { steps: ['斜率 $m = \\frac{y_2 - y_1}{x_2 - x_1}$。', '先算縱向差，再除以橫向差。', '用「向上／向右」檢查正負。'], mistake: 'x、y 的差倒轉；或分母為 0 時仍計算。' },
      en: { steps: ['Slope $m = \\frac{y_2 - y_1}{x_2 - x_1}$.', 'Find the vertical change first, then divide by the horizontal change.', 'Check the sign using “up/right”.'], mistake: 'Swapping the x and y differences; or calculating when the denominator is 0 (vertical line).' }
    },
    'hs.s4.circleeq': {
      zh: { steps: ['標準式 $x^{2} + y^{2} = r^{2}$，半徑 $r = \\sqrt{\\text{右邊}}$。', '圓心在原點；若不是，先配方。', '用圓心到圓上一點的距離檢查。'], mistake: '把 $r^{2}$ 當成 $r$；或配方時符號錯。' },
      en: { steps: ['Standard form $x^{2} + y^{2} = r^{2}$, so radius $r = \\sqrt{\\text{right side}}$.', 'The centre is at the origin; if not, complete the square first.', 'Check with the distance from the centre to a point on the circle.'], mistake: 'Treating $r^{2}$ as $r$; or making sign errors when completing the square.' }
    },
    'hs.s4.circleangle': {
      zh: { steps: ['找出同一段弧對應的圓心角和圓周角。', '圓心角 = 2 × 圓周角。', '用角度和 $360^{\\circ}$／$180^{\\circ}$ 檢查。'], mistake: '把 2 倍方向用反；或把不同弧的角配對。' },
      en: { steps: ['Find the central and inscribed angles that stand on the same arc.', 'Central angle = 2 × inscribed angle.', 'Check with angle sums to $360^{\\circ}$ / $180^{\\circ}$.'], mistake: 'Applying the factor of 2 the wrong way; or pairing angles on different arcs.' }
    },
    'hs.s5.gp': {
      zh: { steps: ['找出首項 $a$ 和公比 $r$（後項 ÷ 前項）。', '第 $n$ 項 $= a r^{n-1}$。', '用相鄰項比值檢查 $r$。'], mistake: '把 $r$ 算成前項除後項；或指數用成 $n$。' },
      en: { steps: ['Find the first term $a$ and common ratio $r$ (a term ÷ the previous term).', 'nth term $= a r^{n-1}$.', 'Check $r$ using neighbouring terms.'], mistake: 'Computing $r$ as previous ÷ next; or using exponent $n$ instead of $n-1$.' }
    },
    'hs.s5.prob': {
      zh: { steps: ['數出所有等可能結果總數。', '數出符合條件的有利結果。', '概率 = 有利 ÷ 總數，化簡並檢查在 0 與 1 之間。'], mistake: '把有利和總數倒轉；或把互斥事件重複計算。' },
      en: { steps: ['Count the total number of equally likely outcomes.', 'Count the favourable outcomes.', 'Probability = favourable ÷ total; simplify and check it lies between 0 and 1.'], mistake: 'Swapping favourable outcomes and total; or double-counting mutually exclusive events.' }
    },
    'hs.s5.gpsum': {
      zh: { steps: ['前 $n$ 項和 $= \\frac{a(r^{n}-1)}{r-1}$。', '無限和（$|r| < 1$）$= \\frac{a}{1-r}$。', '先確認是求和還是求某一項。'], mistake: '把 $r^{n}$ 寫成 $r \\times n$；或無限和忘記 $|r|<1$ 條件。' },
      en: { steps: ['Sum of $n$ terms $= \\frac{a(r^{n}-1)}{r-1}$.', 'Sum to infinity ($|r| < 1$) $= \\frac{a}{1-r}$.', 'Check whether the question asks for a sum or a single term.'], mistake: 'Writing $r^{n}$ as $r \\times n$; or forgetting the $|r|<1$ condition for an infinite sum.' }
    },
    'hs.s5.dispersion': {
      zh: { steps: ['排序數據。', '$Q_1$ = 下半部中位數，$Q_3$ = 上半部中位數。', '$\\text{IQR} = Q_3 - Q_1$。'], mistake: '未排序就取四分位；或把 IQR 當成 $Q_3 + Q_1$。' },
      en: { steps: ['Sort the data.', '$Q_1$ = median of the lower half, $Q_3$ = median of the upper half.', '$\\text{IQR} = Q_3 - Q_1$.'], mistake: 'Taking quartiles without sorting; or using $Q_3 + Q_1$.' }
    },
    'hs.s5.variation': {
      zh: { steps: ['正變：$y = kx$。', '用已知一對 $(x, y)$ 求 $k$。', '代入新 $x$ 求 $y$。'], mistake: '把正變當成反變；或 $k$ 算錯。' },
      en: { steps: ['Direct variation: $y = kx$.', 'Use a known pair $(x, y)$ to find $k$.', 'Substitute the new $x$ to find $y$.'], mistake: 'Treating direct variation as inverse; or computing $k$ incorrectly.' }
    },
    'hs.s5.asum': {
      zh: { steps: ['前 $n$ 項和 $= \\frac{n}{2}(\\text{首項} + \\text{末項})$。', '先確認項數 $n$。', '用逐項相加或公式互相驗算。'], mistake: '項數算成末項；或首末項配錯。' },
      en: { steps: ['Sum of $n$ terms $= \\frac{n}{2}(\\text{first} + \\text{last})$.', 'Confirm the number of terms $n$.', 'Check by adding terms directly or using another formula.'], mistake: 'Using the last term as the number of terms; or pairing the wrong first and last terms.' }
    },
    'hs.s5.invvar': {
      zh: { steps: ['反變：$y = \\frac{k}{x}$，即 $xy = k$。', '用已知一對求 $k$。', '代入新 $x$ 求 $y$。'], mistake: '把反變寫成 $y = kx$；或 $k$ 用加減求。' },
      en: { steps: ['Inverse variation: $y = \\frac{k}{x}$, i.e. $xy = k$.', 'Use a known pair to find $k$.', 'Substitute the new $x$ to find $y$.'], mistake: 'Writing inverse variation as $y = kx$; or finding $k$ by adding instead of multiplying.' }
    },
    'hs.s6.quad': {
      zh: { steps: ['兩根之和 $= -b$，兩根之積 $= c$（首項係數 1）。', '由根反求方程：$x^{2} - (\\text{和})x + (\\text{積}) = 0$。', '用因式分解檢查。'], mistake: '和忘記負號；或把積當成和。' },
      en: { steps: ['Sum of roots $= -b$, product of roots $= c$ (leading coefficient 1).', 'From roots, form $x^{2} - (\\text{sum})x + (\\text{product}) = 0$.', 'Check by factorising.'], mistake: 'Forgetting the negative sign in the sum; or swapping sum and product.' }
    },
    'hs.s6.comb': {
      zh: { steps: ['排列有序：$P(n,r) = \\frac{n!}{(n-r)!}$。', '組合無序：$C(n,r) = \\frac{n!}{r!(n-r)!}$。', '先問「順序重要嗎」再選公式。'], mistake: '把排列當組合；或階乘約簡錯。' },
      en: { steps: ['Permutations (order matters): $P(n,r) = \\frac{n!}{(n-r)!}$.', 'Combinations (order does not matter): $C(n,r) = \\frac{n!}{r!(n-r)!}$.', 'Ask “does order matter?” before choosing.'], mistake: 'Using permutations for combinations; or simplifying factorials incorrectly.' }
    },
    'hs.s6.range': {
      zh: { steps: ['分佈域 = 最大值 − 最小值。', '先排序找最大最小。', '用數據範圍檢查是否合理。'], mistake: '把分佈域和中位數混淆；或用錯最大／最小值。' },
      en: { steps: ['Range = maximum − minimum.', 'Sort the data to find the largest and smallest.', 'Check the answer against the spread of the data.'], mistake: 'Confusing range with median; or using the wrong maximum/minimum.' }
    },
    'hs.s6.binomial': {
      zh: { steps: ['$(x+1)^{n}$ 中 $x^{r}$ 的係數 $= C(n,r)$。', '用帕斯卡三角形或公式求 $C(n,r)$。', '展開檢查首尾項。'], mistake: '把 $n$ 和 $r$ 對調；或係數漏掉。' },
      en: { steps: ['In $(x+1)^{n}$, the coefficient of $x^{r}$ is $C(n,r)$.', 'Find $C(n,r)$ from Pascal’s triangle or the formula.', 'Check the first and last terms of the expansion.'], mistake: 'Swapping $n$ and $r$; or omitting a coefficient.' }
    },
    'hs.s6.prob2': {
      zh: { steps: ['兩枚骰子共有 $36$ 個有序結果。', '數有利結果；互補事件用 $1 - P(A)$。', '化簡並檢查 $0 \\le P \\le 1$。'], mistake: '只數組合（和為 7 的組合數）而非有序結果；或互補時用錯總數。' },
      en: { steps: ['Two dice have $36$ ordered outcomes.', 'Count favourable outcomes; for a complement use $1 - P(A)$.', 'Simplify and check $0 \\le P \\le 1$.'], mistake: 'Counting unordered combinations instead of ordered outcomes; or using the wrong total for a complement.' }
    },
    'hs.s6.binomial2': {
      zh: { steps: ['一般項係數 $= C(n,r)a^{n-r}$。', '先取組合數，再乘 $a$ 的次方。', '檢查 $0 \\le r \\le n$。'], mistake: '把 $a$ 的次方寫成 $r$；或 $C(n,r)$ 與 $C(n,n-r)$ 混淆。' },
      en: { steps: ['General term coefficient $= C(n,r)a^{n-r}$.', 'Take the combination first, then multiply by the power of $a$.', 'Check $0 \\le r \\le n$.'], mistake: 'Writing the power of $a$ as $r$; or confusing $C(n,r)$ with $C(n,n-r)$.' }
    },
    'col.linalg': {
      zh: { steps: ['二階行列式 $|A| = ad - bc$。', '矩陣乘法：行乘列，逐項相加。', '用單位矩陣或逆矩陣檢查。'], mistake: '行列式主對角線和副對角線符號錯；或矩陣乘法次序顛倒。' },
      en: { steps: ['2×2 determinant $|A| = ad - bc$.', 'Matrix product: row times column, summing the products.', 'Check with the identity or inverse matrix.'], mistake: 'Getting the sign of the determinant terms wrong; or reversing the order of matrix multiplication.' }
    },
    'col.prob': {
      zh: { steps: ['期望值 $E(X) = \\sum x \\cdot P(x)$。', '公平硬幣二項概率 $P = \\frac{C(n,k)}{2^{n}}$。', '檢查所有概率總和為 1。'], mistake: '期望值忘記乘概率；或二項分母用錯。' },
      en: { steps: ['Expectation $E(X) = \\sum x \\cdot P(x)$.', 'Binomial probability for a fair coin $P = \\frac{C(n,k)}{2^{n}}$.', 'Check that all probabilities sum to 1.'], mistake: 'Forgetting to multiply by the probability in expectation; or using the wrong denominator.' }
    },
    'challenge.nt': {
      zh: { steps: ['大指數取餘數：每乘一次就取餘數，並找出循環。', '同餘：先列出符合一個條件的所有可能，再檢查另一個條件。', '因數倍數：用 HCF／LCM 的關係。'], mistake: '直接硬算大數；或循環長度找錯。' },
      en: { steps: ['For large powers, reduce modulo at every step and look for a cycle.', 'Congruences: list the numbers satisfying one condition, then test the other.', 'Factors/multiples: use the HCF/LCM relationship.'], mistake: 'Trying to compute the huge number directly; or finding the wrong cycle length.' }
    },
    'challenge.count': {
      zh: { steps: ['方格路徑：在總步數中選向右／向上的步數 $= C(m+n,m)$。', '握手：$C(n,2)$；排列有重複字母要除以重複數。', '容斥：先加再減去重疊部分。'], mistake: '路徑數忘記選步數；或重複排列沒有除掉重複。' },
      en: { steps: ['Grid paths: choose the number of right/up steps out of the total $= C(m+n,m)$.', 'Handshakes: $C(n,2)$; divide by repeated factorials for repeated letters.', 'Inclusion–exclusion: add first, then subtract the overlap.'], mistake: 'Forgetting to choose the steps for grid paths; or not dividing by repeated arrangements.' }
    },
    'challenge.geo': {
      zh: { steps: ['時針每小時 $30^{\\circ}$、分針每分鐘 $6^{\\circ}$。', '夾角取較小的角（$\\le 180^{\\circ}$）。', '梯形面積 $= \\frac{(\\text{上底}+\\text{下底}) \\times \\text{高}}{2}$。'], mistake: '時針忘記加上分針帶動的角度；或夾角取成 $360^{\\circ}-$ 角。' },
      en: { steps: ['Hour hand: $30^{\\circ}$ per hour; minute hand: $6^{\\circ}$ per minute.', 'Take the smaller angle ($\\le 180^{\\circ}$).', 'Trapezium area $= \\frac{(\\text{top}+\\text{bottom}) \\times \\text{height}}{2}$.'], mistake: 'Forgetting the hour hand also moves with the minutes; or taking $360^{\\circ}-$ angle instead of the smaller one.' }
    },
    'challenge.logic': {
      zh: { steps: ['數列先看相鄰差，再看比或平方數／三角數。', '「保證」題用最壞情況 + 鴿巢原理。', '寫出規律並驗證下一項。'], mistake: '只看一兩項就猜規律；或保證題沒有考慮最壞情況。' },
      en: { steps: ['For sequences, check differences first, then ratios, squares or triangular numbers.', 'Guarantee questions use the worst case plus the pigeonhole principle.', 'Write the rule and verify the next term.'], mistake: 'Guessing a rule from one or two terms; or not using the worst case in a guarantee question.' }
    },
    'challenge.algebra': {
      zh: { steps: ['工程問題：整項工作 $= 1$，效率 $= \\frac{1}{\\text{時間}}$。', '混合問題：溶質總量 $\\div$ 總量 $=$ 濃度。', '合作時間 $= 1 \\div \\left(\\frac{1}{a} + \\frac{1}{b}\\right)$。'], mistake: '把工作總量當成時間相加；或混合時只加濃度。' },
      en: { steps: ['Work problems: total job $= 1$, rate $= \\frac{1}{\\text{time}}$.', 'Mixtures: total solute $\\div$ total volume $=$ concentration.', 'Combined time $= 1 \\div \\left(\\frac{1}{a} + \\frac{1}{b}\\right)$.'], mistake: 'Adding times instead of rates; or adding concentrations directly in a mixture.' }
    },
    'challenge.prob': {
      zh: { steps: ['列出所有等可能結果（有序數對）。', '數出有利結果。', '化簡概率並檢查 $0 \\le P \\le 1$。'], mistake: '把有序結果當成組合；或忘記化簡。' },
      en: { steps: ['List all equally likely outcomes (ordered pairs).', 'Count the favourable outcomes.', 'Simplify the probability and check $0 \\le P \\le 1$.'], mistake: 'Treating ordered outcomes as combinations; or forgetting to simplify.' }
    }
  };

  Object.keys(LESSON_DEEPEN_SENIOR).forEach(function (key) {
    if (!L[key]) return;
    ['zh', 'en'].forEach(function (lang) {
      var d = LESSON_DEEPEN_SENIOR[key][lang];
      if (!d) return;
      Object.keys(d).forEach(function (field) { L[key][lang][field] = d[field]; });
    });
  });


  /* 詞彙表：重點課堂的雙語關鍵詞（可選；沒有 glossary 的課堂照舊）。 */
  var LESSON_GLOSSARY = {
    'g6.percent': {
      zh: { glossary: [
        { term: '百分數', def: '以 100 為分母的分數，例如 25% = 25/100 = 0.25。' },
        { term: '折扣', def: '售價比原價減少的百分比；售價 = 原價 × (1 − 折扣率)。' },
        { term: '增長率', def: '增加量佔原值的百分比；新值 = 原值 × (1 + 增長率)。' }
      ] },
      en: { glossary: [
        { term: 'Percentage', def: 'A fraction with denominator 100, e.g. 25% = 25/100 = 0.25.' },
        { term: 'Discount', def: 'The percentage taken off the original price; price = original × (1 − rate).' },
        { term: 'Growth rate', def: 'The increase as a percentage of the original; new value = original × (1 + rate).' }
      ] }
    },
    'challenge.nt': {
      zh: { glossary: [
        { term: '同餘', def: '兩個數除以同一個數後餘數相同，記作 a ≡ b (mod m)。' },
        { term: '餘數', def: '整數除法中未除盡的部分；每乘一次就取餘數可避免大數。' },
        { term: '互質', def: '兩個數的最大公因數是 1。' }
      ] },
      en: { glossary: [
        { term: 'Congruence', def: 'Two numbers with the same remainder modulo m: a ≡ b (mod m).' },
        { term: 'Remainder', def: 'What is left after integer division; reduce modulo at each step.' },
        { term: 'Coprime', def: 'Two numbers whose greatest common divisor is 1.' }
      ] }
    },
    'challenge.count': {
      zh: { glossary: [
        { term: '排列', def: '有序的安排；n 個物件取 r 個的排列數是 P(n,r)。' },
        { term: '組合', def: '不計順序的選法；n 個取 r 個是 C(n,r)。' },
        { term: '容斥原理', def: '先加各集合大小，再減去重疊部分以避免重複計算。' }
      ] },
      en: { glossary: [
        { term: 'Permutation', def: 'An ordered arrangement; P(n,r) orders r of n objects.' },
        { term: 'Combination', def: 'A selection where order does not matter; C(n,r).' },
        { term: 'Inclusion–exclusion', def: 'Add set sizes, then subtract overlaps to avoid double counting.' }
      ] }
    },
    'challenge.geo': {
      zh: { glossary: [
        { term: '圓心角', def: '頂點在圓心、由兩條半徑夾出的角。' },
        { term: '梯形', def: '只有一組對邊平行的四邊形；面積 = (上底 + 下底) × 高 ÷ 2。' },
        { term: '夾角', def: '兩條射線之間的角；時鐘題取較小的角（≤180°）。' }
      ] },
      en: { glossary: [
        { term: 'Central angle', def: 'An angle at the centre between two radii.' },
        { term: 'Trapezium', def: 'A quadrilateral with one pair of parallel sides; area = (a+b)h/2.' },
        { term: 'Included angle', def: 'The angle between two rays; clock questions use the smaller angle (≤180°).' }
      ] }
    },
    'challenge.logic': {
      zh: { glossary: [
        { term: '鴿巢原理', def: '把 n+1 隻鴿子放進 n 個巢，至少一個巢有兩隻。' },
        { term: '公差', def: '等差數列中相鄰兩項的固定差。' },
        { term: '最壞情況', def: '「保證」題要考慮最不利的抽取順序。' }
      ] },
      en: { glossary: [
        { term: 'Pigeonhole principle', def: 'Put n+1 pigeons into n holes and one hole has at least two.' },
        { term: 'Common difference', def: 'The fixed gap between consecutive terms of an arithmetic sequence.' },
        { term: 'Worst case', def: 'Guarantee questions must consider the least favourable order.' }
      ] }
    },
    'challenge.algebra': {
      zh: { glossary: [
        { term: '工作效率', def: '單位時間完成的工作量；把整項工作看成 1，效率 = 1 ÷ 時間。' },
        { term: '濃度', def: '溶質佔全部溶液的比例，通常以百分數表示。' },
        { term: '相對速率', def: '相遇時相加、追及時相減的速率。' }
      ] },
      en: { glossary: [
        { term: 'Work rate', def: 'Work done per unit time; take the whole job as 1, rate = 1 ÷ time.' },
        { term: 'Concentration', def: 'Solute as a fraction of the whole solution, usually a percentage.' },
        { term: 'Relative speed', def: 'Add speeds when moving towards, subtract when chasing.' }
      ] }
    },
    'challenge.prob': {
      zh: { glossary: [
        { term: '古典概率', def: '有利結果數 ÷ 所有等可能結果數。' },
        { term: '樣本空間', def: '所有可能結果的集合；兩粒骰子的樣本空間有 36 個有序結果。' },
        { term: '互補事件', def: 'A 不發生；P(not A) = 1 − P(A)。' }
      ] },
      en: { glossary: [
        { term: 'Classical probability', def: 'Favourable outcomes ÷ all equally likely outcomes.' },
        { term: 'Sample space', def: 'The set of all outcomes; two dice give 36 ordered outcomes.' },
        { term: 'Complement', def: 'A does not happen; P(not A) = 1 − P(A).' }
      ] }
    },
    'ms.s3.indices': {
      zh: { glossary: [
        { term: '底數', def: '被乘方的數，例如 2³ 中的 2。' },
        { term: '指數', def: '次方的次數，例如 2³ 中的 3。' },
        { term: '負指數', def: 'a⁻ⁿ = 1 ÷ aⁿ。' }
      ] },
      en: { glossary: [
        { term: 'Base', def: 'The number being raised to a power, e.g. 2 in 2³.' },
        { term: 'Exponent', def: 'The power, e.g. 3 in 2³.' },
        { term: 'Negative exponent', def: 'a⁻ⁿ = 1 ÷ aⁿ.' }
      ] }
    },
    'hs.s4.log': {
      zh: { glossary: [
        { term: '對數', def: '指數的逆運算：log_b x = y 表示 bʸ = x。' },
        { term: '真數', def: '對數符號內的數，必須大於 0。' },
        { term: '底數', def: '對數的底，必須大於 0 且不等於 1。' }
      ] },
      en: { glossary: [
        { term: 'Logarithm', def: 'The inverse of a power: log_b x = y means bʸ = x.' },
        { term: 'Argument', def: 'The number inside the log; it must be greater than 0.' },
        { term: 'Base', def: 'The base of the log; greater than 0 and not 1.' }
      ] }
    }
  };

  Object.keys(LESSON_GLOSSARY).forEach(function (key) {
    if (!L[key]) return;
    ['zh', 'en'].forEach(function (lang) {
      if (LESSON_GLOSSARY[key][lang]) L[key][lang].glossary = LESSON_GLOSSARY[key][lang].glossary;
    });
  });


  /* 新增課堂：小五補充 + 大學加深（視覺化 + 詞彙表）。 */
  var EXTRA_LESSONS = {
    'g5.fractiondiff': {
      zh: {
        title: '異分母分數加減',
        intro: '分母不同時，要先通分（找共同分母），再合併分子。',
        steps: ['找兩個分母的最小公倍數作共同分母。', '把兩個分數擴分成同分母。', '分母不變，分子相加或相減，最後約簡。'],
        example: '1/3 + 1/4 = 4/12 + 3/12 = 7/12。',
        tip: '分母相乘一定是共同分母，但不一定是最小；能約簡就約簡。',
        mistake: '直接把分子和分母分別相加：1/3 + 1/4 ≠ 2/7。',
        visual: { kind: 'fraction', n: 7, d: 12 },
        glossary: [
          { term: '通分', def: '把異分母分數改寫成同分母分數。' },
          { term: '最小公倍數', def: '兩個分母最小的共同倍數。' },
          { term: '約簡', def: '分子分母同除以公因數。' }
        ]
      },
      en: {
        title: 'Adding & Subtracting Unlike Fractions',
        intro: 'When denominators differ, make a common denominator first, then combine the numerators.',
        steps: ['Find the least common multiple of the denominators.', 'Rewrite both fractions with that denominator.', 'Add or subtract numerators, keep the denominator, then simplify.'],
        example: '1/3 + 1/4 = 4/12 + 3/12 = 7/12.',
        tip: 'Multiplying the denominators always gives a common denominator, but not always the smallest; simplify at the end.',
        mistake: 'Adding numerators and denominators separately: 1/3 + 1/4 ≠ 2/7.',
        visual: { kind: 'fraction', n: 7, d: 12 },
        glossary: [
          { term: 'Common denominator', def: 'A shared denominator for unlike fractions.' },
          { term: 'LCM', def: 'The smallest common multiple of the denominators.' },
          { term: 'Simplify', def: 'Divide numerator and denominator by a common factor.' }
        ]
      }
    },
    'g5.fractionmul': {
      zh: {
        title: '分數乘除',
        intro: '分數相乘：分子乘分子、分母乘分母；除以一個分數，等於乘它的倒數。',
        steps: ['乘法：分子相乘、分母相乘。', '除法：把除數倒轉，改成乘法。', '先約簡再相乘，最後化為最簡分數。'],
        example: '2/3 × 3/4 = 6/12 = 1/2；2/3 ÷ 3/4 = 2/3 × 4/3 = 8/9。',
        tip: '交叉約簡可以令數字更小、更易算。',
        mistake: '除法時只把被除數倒轉；正確是把除數倒轉。',
        visual: { kind: 'fraction', n: 1, d: 2 },
        glossary: [
          { term: '倒數', def: '分子分母對調，例如 3/4 的倒數是 4/3。' },
          { term: '最簡分數', def: '分子分母只有公因數 1。' }
        ]
      },
      en: {
        title: 'Multiplying & Dividing Fractions',
        intro: 'To multiply fractions, multiply numerators and denominators; to divide, multiply by the reciprocal.',
        steps: ['Multiply: numerators together, denominators together.', 'Divide: flip the divisor and multiply.', 'Simplify before or after multiplying; give the answer in lowest terms.'],
        example: '2/3 × 3/4 = 6/12 = 1/2; 2/3 ÷ 3/4 = 2/3 × 4/3 = 8/9.',
        tip: 'Cross-cancelling keeps the numbers small and the arithmetic easy.',
        mistake: 'Flipping the dividend instead of the divisor when dividing.',
        visual: { kind: 'fraction', n: 1, d: 2 },
        glossary: [
          { term: 'Reciprocal', def: 'Swap numerator and denominator, e.g. 4/3 is the reciprocal of 3/4.' },
          { term: 'Lowest terms', def: 'Numerator and denominator share only the factor 1.' }
        ]
      }
    },
    'g5.area2': {
      zh: {
        title: '面積（二）',
        intro: '平行四邊形、三角形和梯形都有各自的面积公式；關鍵是找對「底」和「高」。',
        steps: ['平行四邊形：底 × 高。', '三角形：底 × 高 ÷ 2。', '梯形：(上底 + 下底) × 高 ÷ 2。'],
        example: '梯形上底 4 cm、下底 8 cm、高 5 cm，面積 = (4 + 8) × 5 ÷ 2 = 30 cm²。',
        tip: '高必須垂直於底，不是斜邊。',
        mistake: '把斜邊當作高，或用三角形公式時忘記除以 2。',
        visual: { kind: 'trapezoid', a: 4, b: 8, h: 5 },
        glossary: [
          { term: '底', def: '計算面積時所選的邊。' },
          { term: '高', def: '從底到對邊的垂直距離。' },
          { term: '梯形', def: '只有一組對邊平行的四邊形。' }
        ]
      },
      en: {
        title: 'Area II',
        intro: 'Parallelograms, triangles and trapeziums each have their own area formula; identify the correct base and height.',
        steps: ['Parallelogram: base × height.', 'Triangle: base × height ÷ 2.', 'Trapezium: (a + b) × height ÷ 2.'],
        example: 'A trapezium with parallel sides 4 cm and 8 cm and height 5 cm has area (4 + 8) × 5 ÷ 2 = 30 cm².',
        tip: 'The height is perpendicular to the base, not a slant side.',
        mistake: 'Using a slant side as the height, or forgetting to divide by 2 for a triangle.',
        visual: { kind: 'trapezoid', a: 4, b: 8, h: 5 },
        glossary: [
          { term: 'Base', def: 'The side chosen for the area calculation.' },
          { term: 'Height', def: 'The perpendicular distance from the base to the opposite side.' },
          { term: 'Trapezium', def: 'A quadrilateral with one pair of parallel sides.' }
        ]
      }
    },
    'g5.volume1': {
      zh: {
        title: '體積（一）',
        intro: '體積是立體所佔空間的大小；長方體體積 = 長 × 闊 × 高。',
        steps: ['找出長、闊、高（同一單位）。', '三個數相乘。', '答案寫上立方單位，例如 cm³。'],
        example: '長 4 cm、闊 3 cm、高 2 cm 的長方體，體積 = 4 × 3 × 2 = 24 cm³。',
        tip: '用棱長 1 cm 的小正方體去堆，數目正好等於體積的數值。',
        mistake: '把表面積和體積混淆，或忘記寫立方單位。',
        visual: { kind: 'cuboid', l: 4, w: 3, h: 2 },
        glossary: [
          { term: '體積', def: '立體所佔空間的大小。' },
          { term: '立方厘米', def: '棱長 1 cm 的正方體體積，寫作 cm³。' }
        ]
      },
      en: {
        title: 'Volume I',
        intro: 'Volume measures the space a solid occupies; cuboid volume = length × width × height.',
        steps: ['Identify length, width and height in the same unit.', 'Multiply the three numbers.', 'Write the cubic unit, e.g. cm³.'],
        example: 'A cuboid 4 cm by 3 cm by 2 cm has volume 4 × 3 × 2 = 24 cm³.',
        tip: 'Stacking unit cubes is a good model: the number of cubes equals the volume in cm³.',
        mistake: 'Confusing surface area with volume, or omitting the cubic unit.',
        visual: { kind: 'cuboid', l: 4, w: 3, h: 2 },
        glossary: [
          { term: 'Volume', def: 'The amount of space a solid occupies.' },
          { term: 'Cubic centimetre', def: 'The volume of a 1 cm cube, written cm³.' }
        ]
      }
    },
    'g5.rotation': {
      zh: {
        title: '旋轉對稱',
        intro: '圖形繞中心旋轉某個角度後能與原圖重合，就是旋轉對稱。',
        steps: ['找出圖形的中心。', '用 360° 除以邊數，得到最小旋轉角。', '非零旋轉的數目（階數）等於邊數。'],
        example: '正六邊形每轉 60° 重合一次；非零旋轉共有 6 個。',
        tip: '正方形有 4 個非零旋轉對稱（90°、180°、270°、360°）。',
        mistake: '把軸對稱的數目和旋轉對稱的階數混為一談。',
        visual: { kind: 'polygon', n: 6 },
        glossary: [
          { term: '旋轉對稱', def: '旋轉後與原圖重合的性質。' },
          { term: '最小旋轉角', def: '360° ÷ 邊數。' },
          { term: '階數', def: '非零旋轉對稱的數目。' }
        ]
      },
      en: {
        title: 'Rotational Symmetry',
        intro: 'A shape has rotational symmetry if a rotation about its centre maps it onto itself.',
        steps: ['Find the centre of the shape.', 'Divide 360° by the number of sides for the smallest angle.', 'The number of non-zero rotations (order) equals the number of sides.'],
        example: 'A regular hexagon maps onto itself every 60°; it has 6 non-zero rotational symmetries.',
        tip: 'A square has 4 non-zero rotations (90°, 180°, 270°, 360°).',
        mistake: 'Confusing the number of lines of symmetry with the order of rotational symmetry.',
        visual: { kind: 'polygon', n: 6 },
        glossary: [
          { term: 'Rotational symmetry', def: 'The shape looks unchanged after rotation.' },
          { term: 'Smallest angle', def: '360° ÷ number of sides.' },
          { term: 'Order', def: 'The number of non-zero rotations that map the shape onto itself.' }
        ]
      }
    },
    'col.calculus2': {
      zh: {
        title: '微積分（二）',
        intro: '冪函數的導數與定積分是微積分的核心工具。',
        steps: ['求導：d/dx (a x^n) = a n x^(n-1)。', '積分：∫ a x^n dx = a x^(n+1)/(n+1) + C。', '定積分代入上下限：F(b) − F(a)。'],
        example: '∫₀² 3x² dx = [x³]₀² = 8。',
        tip: '先做不定積分，再代入上限減下限。',
        mistake: '定積分忘記代入下限，或求導時指數忘記減 1。',
        visual: null,
        glossary: [
          { term: '導數', def: '函數在某一點的瞬時變化率。' },
          { term: '定積分', def: '函數在區間上與 x 軸之間的有向面積。' },
          { term: '冪規則', def: 'd/dx x^n = n x^(n-1)。' }
        ]
      },
      en: {
        title: 'Calculus II',
        intro: 'Derivatives and definite integrals of power functions are core calculus tools.',
        steps: ['Differentiate: d/dx (a x^n) = a n x^(n-1).', 'Integrate: ∫ a x^n dx = a x^(n+1)/(n+1) + C.', 'Evaluate a definite integral: F(b) − F(a).'],
        example: '∫₀² 3x² dx = [x³]₀² = 8.',
        tip: 'Find the antiderivative first, then substitute the upper and lower limits.',
        mistake: 'Forgetting the lower limit, or not decreasing the exponent when differentiating.',
        visual: null,
        glossary: [
          { term: 'Derivative', def: 'The instantaneous rate of change at a point.' },
          { term: 'Definite integral', def: 'The signed area between a curve and the x-axis over an interval.' },
          { term: 'Power rule', def: 'd/dx x^n = n x^(n-1).' }
        ]
      }
    },
    'col.linalg2': {
      zh: {
        title: '線性代數（二）',
        intro: '二階行列式與矩陣乘法是線性代數的基本運算。',
        steps: ['行列式：|A| = ad − bc。', '矩陣乘法：左矩陣的列乘右矩陣的行。', '乘積的第 i 行第 j 列 = 左第 i 列 · 右第 j 行。'],
        example: 'A = [[1,2],[3,4]]，det A = 1×4 − 2×3 = −2。',
        tip: '矩陣乘法一般不可交換：AB ≠ BA。',
        mistake: '把行列式寫成 ad + bc，或把矩陣元素逐個相乘。',
        visual: null,
        glossary: [
          { term: '行列式', def: '二階矩陣 ad − bc 的值。' },
          { term: '矩陣乘法', def: '列乘行再相加。' },
          { term: '單位矩陣', def: '主對角線為 1、其餘為 0 的矩陣。' }
        ]
      },
      en: {
        title: 'Linear Algebra II',
        intro: '2×2 determinants and matrix multiplication are basic linear-algebra operations.',
        steps: ['Determinant: |A| = ad − bc.', 'Matrix product: rows of the left matrix times columns of the right.', 'The (i,j) entry is the dot product of row i and column j.'],
        example: 'For A = [[1,2],[3,4]], det A = 1×4 − 2×3 = −2.',
        tip: 'Matrix multiplication is not commutative: AB ≠ BA in general.',
        mistake: 'Writing ad + bc for the determinant, or multiplying entries position by position.',
        visual: null,
        glossary: [
          { term: 'Determinant', def: 'For a 2×2 matrix, ad − bc.' },
          { term: 'Matrix product', def: 'Multiply rows by columns and add.' },
          { term: 'Identity matrix', def: '1s on the main diagonal and 0s elsewhere.' }
        ]
      }
    },
    'col.stats2': {
      zh: {
        title: '統計（二）',
        intro: '方差衡量數據偏離平均數的程度；標準差是方差的平方根。',
        steps: ['求平均數。', '求每個數據與平均數的差，再平方。', '取平均得方差；開平方根得標準差。'],
        example: '數據 4, 6, 8：平均 6，方差 (4+0+4)/3 = 8/3。',
        tip: '標準差與原數據同單位，較容易解釋。',
        mistake: '忘記平方差，或把方差和標準差混為一談。',
        visual: null,
        glossary: [
          { term: '方差', def: '各數據與平均數差的平方的平均。' },
          { term: '標準差', def: '方差的平方根。' },
          { term: '平均數', def: '所有數據的總和除以數據數目。' }
        ]
      },
      en: {
        title: 'Statistics II',
        intro: 'Variance measures how far data spread from the mean; standard deviation is its square root.',
        steps: ['Find the mean.', 'Find each deviation from the mean and square it.', 'Average the squared deviations for variance; take the square root for standard deviation.'],
        example: 'For 4, 6, 8: mean 6, variance (4+0+4)/3 = 8/3.',
        tip: 'Standard deviation has the same units as the data, so it is easier to interpret.',
        mistake: 'Forgetting to square deviations, or confusing variance with standard deviation.',
        visual: null,
        glossary: [
          { term: 'Variance', def: 'The average of squared deviations from the mean.' },
          { term: 'Standard deviation', def: 'The square root of variance.' },
          { term: 'Mean', def: 'The sum of the data divided by the number of values.' }
        ]
      }
    }
  };

  Object.keys(EXTRA_LESSONS).forEach(function (key) {
    L[key] = EXTRA_LESSONS[key];
  });


  var EXTRA_LESSONS2 = {
    'g5.estimation': {
      zh: {
        title: '近似值與估算',
        intro: '四捨五入可以快速得到接近的數；估算就是先用近似值再計算。',
        steps: ['找出要捨入的單位（十、百、千）。', '看下一位數字：5 或以上進位，4 或以下不變。', '估算加減時，先把各數取近似值再運算。'],
        example: '4 380 四捨五入至最接近的千位是 4 000；3 870 + 2 140 ≈ 4 000 + 2 000 = 6 000。',
        tip: '題目問「大約」時，通常用估算而不是精確計算。',
        mistake: '看錯位值，或把 4 捨入時當成 5 進位。',
        visual: { kind: 'numberline' },
        glossary: [
          { term: '四捨五入', def: '看下一位數字決定進位或捨去。' },
          { term: '近似值', def: '接近真確值的數。' },
          { term: '估算', def: '用近似值快速計算。' }
        ]
      },
      en: {
        title: 'Approximation & Estimation',
        intro: 'Rounding gives a nearby number; estimation uses rounded values to calculate quickly.',
        steps: ['Identify the rounding unit (tens, hundreds, thousands).', 'Look at the next digit: 5 or more rounds up, 4 or less stays.', 'To estimate a sum, round first, then add.'],
        example: '4 380 rounded to the nearest thousand is 4 000; 3 870 + 2 140 ≈ 4 000 + 2 000 = 6 000.',
        tip: 'When a question says “about”, estimation is usually expected.',
        mistake: 'Misreading place value, or rounding a 4 up.',
        visual: { kind: 'numberline' },
        glossary: [
          { term: 'Rounding', def: 'Use the next digit to decide whether to round up or down.' },
          { term: 'Approximation', def: 'A number close to the exact value.' },
          { term: 'Estimation', def: 'Calculating with rounded values.' }
        ]
      }
    },
    'g5.chart': {
      zh: {
        title: '統計圖',
        intro: '棒形圖用棒的高度比較數量；折線圖用線的升降顯示變化。',
        steps: ['先讀座標軸的單位和每格代表多少。', '找出各棒/各點對應的數值。', '按題目要求求相差、總和或變化。'],
        example: '四天溫度 3、5、2、6°C：最高與最低相差 6 − 2 = 4°C。',
        tip: '折線圖看趨勢，棒形圖看比較。',
        mistake: '把格數當成數值，忽略每格代表的單位。',
        visual: { kind: 'barchart', values: [3, 5, 2, 6], labels: ['A', 'B', 'C', 'D'] },
        glossary: [
          { term: '棒形圖', def: '用棒的高度表示數量。' },
          { term: '折線圖', def: '用線段連接各點顯示變化。' },
          { term: '座標軸', def: '圖表的橫軸和縱軸。' }
        ]
      },
      en: {
        title: 'Charts',
        intro: 'Bar charts compare amounts by bar height; line graphs show change by rises and falls.',
        steps: ['Read the axes and the value of each grid unit.', 'Read the value of each bar or point.', 'Find the difference, total or change as asked.'],
        example: 'Temperatures 3, 5, 2, 6°C over four days: the range is 6 − 2 = 4°C.',
        tip: 'Line graphs show trends; bar charts make comparisons easy.',
        mistake: 'Counting grid squares instead of reading the scale.',
        visual: { kind: 'barchart', values: [3, 5, 2, 6], labels: ['A', 'B', 'C', 'D'] },
        glossary: [
          { term: 'Bar chart', def: 'Uses bar heights to show amounts.' },
          { term: 'Line graph', def: 'Joins points with line segments to show change.' },
          { term: 'Axis', def: 'The horizontal or vertical scale of a chart.' }
        ]
      }
    },
    'g5.algebra': {
      zh: {
        title: '代數符號（一）',
        intro: '用字母表示未知數，例如 x 代表一個數；代入數值就可以求代數式的值。',
        steps: ['看清楚字母代表哪個數。', '把字母換成該數值。', '按先乘除後加減計算。'],
        example: '已知 x = 4，3x + 7 = 3×4 + 7 = 19。',
        tip: '3x 表示 3 × x，不是 3 + x。',
        mistake: '把 3x 當成 3 + x，或代入後忘記先乘。',
        visual: null,
        glossary: [
          { term: '代數式', def: '含字母和數字的算式，例如 3x + 7。' },
          { term: '未知數', def: '用字母表示的未知數量。' },
          { term: '代入', def: '把字母換成指定的數值。' }
        ]
      },
      en: {
        title: 'Algebraic Symbols I',
        intro: 'Letters stand for unknown numbers; substituting a value lets you evaluate an expression.',
        steps: ['See which value the letter stands for.', 'Replace the letter with that value.', 'Calculate using multiplication/division before addition/subtraction.'],
        example: 'Given x = 4, 3x + 7 = 3×4 + 7 = 19.',
        tip: '3x means 3 × x, not 3 + x.',
        mistake: 'Treating 3x as 3 + x, or not multiplying first.',
        visual: null,
        glossary: [
          { term: 'Expression', def: 'A combination of letters and numbers, e.g. 3x + 7.' },
          { term: 'Unknown', def: 'A quantity represented by a letter.' },
          { term: 'Substitute', def: 'Replace a letter with a given value.' }
        ]
      }
    },
    'g5.circle': {
      zh: {
        title: '圓的認識',
        intro: '圓心是圓的中心；半徑是圓心到圓周的距離；直徑穿過圓心，是半徑的兩倍。',
        steps: ['認出圓心、半徑和直徑。', '直徑 = 半徑 × 2。', '半徑 = 直徑 ÷ 2。'],
        example: '半徑 7 cm 的圓，直徑是 14 cm。',
        tip: '直徑是圓內最長的弦，必定穿過圓心。',
        mistake: '把直徑當成半徑，或以為所有弦都穿過圓心。',
        visual: { kind: 'circle', r: 7 },
        glossary: [
          { term: '圓心', def: '圓的中心點。' },
          { term: '半徑', def: '圓心到圓周的距離。' },
          { term: '直徑', def: '穿過圓心、兩端在圓周上的線段。' }
        ]
      },
      en: {
        title: 'Circles',
        intro: 'The centre is the middle point; the radius runs from the centre to the circle; the diameter passes through the centre and is twice the radius.',
        steps: ['Identify the centre, radius and diameter.', 'Diameter = radius × 2.', 'Radius = diameter ÷ 2.'],
        example: 'A circle of radius 7 cm has diameter 14 cm.',
        tip: 'The diameter is the longest chord and passes through the centre.',
        mistake: 'Confusing diameter with radius, or thinking every chord passes through the centre.',
        visual: { kind: 'circle', r: 7 },
        glossary: [
          { term: 'Centre', def: 'The middle point of a circle.' },
          { term: 'Radius', def: 'The distance from the centre to the circle.' },
          { term: 'Diameter', def: 'A chord through the centre; twice the radius.' }
        ]
      }
    },
    'col.ode': {
      zh: {
        title: '微分方程（歐拉法）',
        intro: '微分方程描述變化率；歐拉法用切線一步步估計數值解。',
        steps: ['寫出 dy/dx = f(x, y) 及初始值。', '選步長 h，用 y₁ = y₀ + h·f(x₀, y₀)。', '重複步驟得到後續估計值。'],
        example: 'dy/dx = 2y、y(0)=1、h=1：y₁ = 1 + 1×2 = 3。',
        tip: 'h 越小，歐拉法通常越準，但步數越多。',
        mistake: '忘記乘 h，或把初始值代入錯誤的位置。',
        visual: null,
        glossary: [
          { term: '微分方程', def: '含導數的方程，描述變化率。' },
          { term: '歐拉法', def: '用切線逐步估計解的數值方法。' },
          { term: '步長', def: '每次前進的 x 增量 h。' }
        ]
      },
      en: {
        title: 'Differential Equations (Euler)',
        intro: 'A differential equation describes a rate of change; Euler’s method follows the tangent step by step.',
        steps: ['Write dy/dx = f(x, y) with an initial value.', 'Choose step h and use y₁ = y₀ + h·f(x₀, y₀).', 'Repeat for later estimates.'],
        example: 'dy/dx = 2y, y(0)=1, h=1: y₁ = 1 + 1×2 = 3.',
        tip: 'Smaller h is usually more accurate but needs more steps.',
        mistake: 'Forgetting to multiply by h, or substituting the initial value in the wrong place.',
        visual: null,
        glossary: [
          { term: 'Differential equation', def: 'An equation involving derivatives, describing a rate of change.' },
          { term: 'Euler’s method', def: 'A numerical method following tangent steps.' },
          { term: 'Step size', def: 'The x-increment h per step.' }
        ]
      }
    },
    'col.nt': {
      zh: {
        title: '數論（歐拉函數與反元素）',
        intro: '歐拉函數 φ(n) 數出 1 至 n 中與 n 互質的數；模反元素是乘積餘 1 的數。',
        steps: ['φ(n)：逐一檢查最大公因數是否為 1。', '模 m 反元素：找最小的 x 使 ax ≡ 1 (mod m)。', '只當 a 與 m 互質時反元素才存在。'],
        example: 'φ(8) = 4（1、3、5、7）；3 在模 5 下的反元素是 2，因為 3×2=6≡1。',
        tip: '若 a 與 m 不互質，反元素不存在。',
        mistake: '把 φ(n) 當成 n 的因數數目。',
        visual: null,
        glossary: [
          { term: '歐拉函數', def: '1 至 n 中與 n 互質的數的個數。' },
          { term: '互質', def: '最大公因數為 1。' },
          { term: '模反元素', def: '使 ax ≡ 1 (mod m) 的 x。' }
        ]
      },
      en: {
        title: 'Number Theory',
        intro: 'Euler’s totient φ(n) counts integers 1..n coprime to n; a modular inverse multiplies to 1 mod m.',
        steps: ['φ(n): check which numbers have gcd 1 with n.', 'Modular inverse: find the smallest x with ax ≡ 1 (mod m).', 'An inverse exists only when a and m are coprime.'],
        example: 'φ(8) = 4 (1, 3, 5, 7); the inverse of 3 mod 5 is 2 because 3×2=6≡1.',
        tip: 'If a and m are not coprime, no inverse exists.',
        mistake: 'Confusing φ(n) with the number of divisors of n.',
        visual: null,
        glossary: [
          { term: 'Euler’s totient', def: 'The count of integers 1..n coprime to n.' },
          { term: 'Coprime', def: 'Having gcd 1.' },
          { term: 'Modular inverse', def: 'The x with ax ≡ 1 (mod m).' }
        ]
      }
    }
  };

  Object.keys(EXTRA_LESSONS2).forEach(function (key) {
    L[key] = EXTRA_LESSONS2[key];
  });


  var EXTRA_LESSONS3 = {
    'g5.fraccompare': {
      zh: {
        title: '分數比較與擴分約分',
        intro: '比較異分母分數要先通分；擴分是分子分母同乘一個數，約分是同除一個數。',
        steps: ['比較：通分後看分子，分子越大分數越大。', '擴分：分子分母同乘 k，數值不變。', '約分：分子分母同除最大公因數。'],
        example: '3/4 與 5/7：通分 21/28 與 20/28，所以 3/4 較大；8/12 約分為 2/3。',
        tip: '分子相同時，分母越小，分數越大。',
        mistake: '只比較分母大小，或約分時只除分子。',
        visual: { kind: 'fraction', n: 3, d: 4 },
        glossary: [
          { term: '擴分', def: '分子分母同乘一個數，分數值不變。' },
          { term: '約分', def: '分子分母同除公因數。' },
          { term: '通分', def: '把異分母分數改為同分母。' }
        ]
      },
      en: {
        title: 'Comparing, Expanding & Simplifying Fractions',
        intro: 'Compare unlike fractions by finding a common denominator; expanding multiplies top and bottom by the same number, simplifying divides them.',
        steps: ['Compare: use a common denominator; the larger numerator wins.', 'Expand: multiply numerator and denominator by k.', 'Simplify: divide by the greatest common factor.'],
        example: '3/4 and 5/7 become 21/28 and 20/28, so 3/4 is larger; 8/12 simplifies to 2/3.',
        tip: 'With equal numerators, the smaller denominator gives the larger fraction.',
        mistake: 'Comparing denominators only, or dividing just the numerator when simplifying.',
        visual: { kind: 'fraction', n: 3, d: 4 },
        glossary: [
          { term: 'Expand', def: 'Multiply numerator and denominator by the same number.' },
          { term: 'Simplify', def: 'Divide numerator and denominator by a common factor.' },
          { term: 'Common denominator', def: 'A shared denominator for unlike fractions.' }
        ]
      }
    },
    'g5.decimalmixed': {
      zh: {
        title: '小數四則混合',
        intro: '小數加減要對齊小數點；乘除可以先當整數算，最後再點小數點。',
        steps: ['先看清是加、減、乘還是除。', '加減：小數點對齊，逐位計算。', '乘除：先當整數算，再按小數位數點回小數點。'],
        example: '2.5 + 1.8 = 4.3；2.5 × 3 = 7.5；7.2 ÷ 3 = 2.4。',
        tip: '計完後用估算檢查答案是否合理。',
        mistake: '加減時小數點沒有對齊，或乘除後忘記點小數點。',
        visual: { kind: 'numberline' },
        glossary: [
          { term: '小數點', def: '分隔整數部分和小數部分。' },
          { term: '四則運算', def: '加、減、乘、除。' },
          { term: '估算', def: '用近似值檢查答案。' }
        ]
      },
      en: {
        title: 'Mixed Decimal Operations',
        intro: 'Line up decimal points when adding or subtracting; for multiplication and division, calculate as whole numbers first.',
        steps: ['Identify whether to add, subtract, multiply or divide.', 'Add/subtract: align decimal points and work column by column.', 'Multiply/divide: calculate as whole numbers, then place the decimal point.'],
        example: '2.5 + 1.8 = 4.3; 2.5 × 3 = 7.5; 7.2 ÷ 3 = 2.4.',
        tip: 'Use estimation to check whether the answer is reasonable.',
        mistake: 'Misaligning decimal points, or forgetting the decimal point after multiplying/dividing.',
        visual: { kind: 'numberline' },
        glossary: [
          { term: 'Decimal point', def: 'Separates the whole-number and fractional parts.' },
          { term: 'Four operations', def: 'Addition, subtraction, multiplication and division.' },
          { term: 'Estimate', def: 'Use rounded values to check an answer.' }
        ]
      }
    }
  };

  Object.keys(EXTRA_LESSONS3).forEach(function (key) {
    L[key] = EXTRA_LESSONS3[key];
  });

  /* 為原本沒有圖示的重點課堂補上視覺化（只加資料，不動既有內容）。 */
  var LESSON_VISUALS = {
    'g4.fractionadd': { fraction: { n: 3, d: 4 } },
    'g4.decimal': { numberline: true },
    'g5.average': { barchart: true },
    'g6.equation': { numberline: true },
    'ms.s1.linear': { numberline: true }
  };
  Object.keys(LESSON_VISUALS).forEach(function (key) {
    if (!L[key]) return;
    var v = LESSON_VISUALS[key];
    var visual = v.fraction ? { kind: 'fraction', n: v.fraction.n, d: v.fraction.d } : v.barchart ? { kind: 'barchart', values: [4, 6, 8, 5], labels: ['A', 'B', 'C', 'D'] } : { kind: 'numberline' };
    ['zh', 'en'].forEach(function (lang) {
      if (L[key][lang] && !L[key][lang].visual) L[key][lang].visual = visual;
    });
  });


  var GRAD_LESSONS = {
    'grad.analysis': {
      zh: {
        title: '實分析',
        intro: '實分析研究極限、連續與收斂；數列極限看 n 很大時的趋势，無窮級數則是無窮多項的和。',
        steps: ['有理函數的極限：分子分母同除以最高次冪。', '只看最高次項的係數比。', '無窮等比級數（|r|<1）和 = 首項 ÷ (1 − r)。'],
        example: 'lim (4n+3)/(2n+5) = 4/2 = 2；Σ 3(1/2)ⁿ = 3 ÷ (1−1/2) = 6。',
        tip: '常數項在 n→∞ 時趨近 0，不影響極限。',
        mistake: '把低次項也代入 n→∞，或忘記等比級數要求 |r|<1。',
        visual: null,
        glossary: [
          { term: '極限', def: 'n 趨向無窮時數列趨近的值。' },
          { term: '收斂', def: '數列或級數有有限極限。' },
          { term: '等比級數', def: '相鄰項比值固定的級數。' }
        ]
      },
      en: {
        title: 'Real Analysis',
        intro: 'Real analysis studies limits, continuity and convergence; a sequence limit is the long-run value, and a series is an infinite sum.',
        steps: ['For a rational limit, divide numerator and denominator by the highest power of n.', 'Keep only the ratio of leading coefficients.', 'For an infinite geometric series with |r|<1, sum = first term ÷ (1 − r).'],
        example: 'lim (4n+3)/(2n+5) = 4/2 = 2; Σ 3(1/2)ⁿ = 3 ÷ (1−1/2) = 6.',
        tip: 'Constant terms vanish as n→∞, so they do not affect the limit.',
        mistake: 'Substituting n→∞ into lower-order terms, or forgetting |r|<1 for geometric series.',
        visual: null,
        glossary: [
          { term: 'Limit', def: 'The value a sequence approaches as n grows.' },
          { term: 'Convergence', def: 'A sequence or series has a finite limit.' },
          { term: 'Geometric series', def: 'A series with a constant ratio between terms.' }
        ]
      }
    },
    'grad.algebra': {
      zh: {
        title: '抽象代數',
        intro: '抽象代數用公理研究群、環、域；群元素的階是回到單位元所需的最少次數。',
        steps: ['元素 a 的階：最小正整數 k 使 aᵏ = e。', '對稱群 Sₙ 有 n! 個元素。', '循環群 Cₙ 的生成元數目是 φ(n)。'],
        example: '在 (ℤ/7ℤ)× 中，2 的階是 3（2³=8≡1）；C₈ 有 φ(8)=4 個生成元。',
        tip: '階必定整除群的階（拉格朗日定理）。',
        mistake: '把群的階和元素的階混為一談。',
        visual: null,
        glossary: [
          { term: '群', def: '有結合律、單位元和反元素的集合。' },
          { term: '元素的階', def: '使 aᵏ = e 的最小正整數 k。' },
          { term: '生成元', def: '能生成整個循環群的元素。' }
        ]
      },
      en: {
        title: 'Abstract Algebra',
        intro: 'Abstract algebra studies groups, rings and fields axiomatically; the order of an element is the least power returning to the identity.',
        steps: ['Order of a: least positive k with aᵏ = e.', 'The symmetric group Sₙ has n! elements.', 'The cyclic group Cₙ has φ(n) generators.'],
        example: 'In (ℤ/7ℤ)×, the order of 2 is 3 since 2³=8≡1; C₈ has φ(8)=4 generators.',
        tip: 'An element’s order divides the group order (Lagrange).',
        mistake: 'Confusing the order of a group with the order of an element.',
        visual: null,
        glossary: [
          { term: 'Group', def: 'A set with an associative operation, identity and inverses.' },
          { term: 'Order of an element', def: 'The least positive k with aᵏ = e.' },
          { term: 'Generator', def: 'An element that generates the whole cyclic group.' }
        ]
      }
    },
    'grad.topology': {
      zh: {
        title: '拓撲學',
        intro: '拓撲學研究「開集」結構；同一個集合可以定義不同的拓撲，開集數目也不同。',
        steps: ['離散拓撲：所有子集都是開集，共 2ⁿ 個。', '特定點拓撲：開集為 ∅ 及所有含 p 的子集。', '含 p 的子集有 2ⁿ⁻¹ 個，再加空集。'],
        example: '3 個元素的集合：離散拓撲有 8 個開集；特定點拓撲有 1+4=5 個。',
        tip: '開集族必須包含 ∅、全集，並對任意並集和有限交集封閉。',
        mistake: '把「開集」當成「開區間」，或忘記空集和全集也要算。',
        visual: null,
        glossary: [
          { term: '拓撲', def: '滿足開集公理的子集族。' },
          { term: '離散拓撲', def: '所有子集都是開集。' },
          { term: '特定點拓撲', def: '開集為空集及所有含指定點的集合。' }
        ]
      },
      en: {
        title: 'Topology',
        intro: 'Topology studies open-set structures; the same set can carry different topologies with different numbers of open sets.',
        steps: ['Discrete topology: every subset is open, so 2ⁿ open sets.', 'Particular-point topology: ∅ and all subsets containing p.', 'There are 2ⁿ⁻¹ subsets containing p, plus the empty set.'],
        example: 'On a 3-element set: discrete topology has 8 open sets; particular-point topology has 1+4=5.',
        tip: 'A topology contains ∅ and the whole set and is closed under arbitrary unions and finite intersections.',
        mistake: 'Treating “open set” as “open interval”, or forgetting ∅ and the whole set.',
        visual: null,
        glossary: [
          { term: 'Topology', def: 'A family of subsets satisfying the open-set axioms.' },
          { term: 'Discrete topology', def: 'Every subset is open.' },
          { term: 'Particular-point topology', def: 'Open sets are ∅ and all sets containing a fixed point.' }
        ]
      }
    }
  };

  Object.keys(GRAD_LESSONS).forEach(function (key) {
    L[key] = GRAD_LESSONS[key];
  });

  export { L as Lessons };

