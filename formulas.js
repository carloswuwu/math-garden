/* 由 tools/build.js 從 src/data/formulas.js 生成 —— 請勿手改；改 src/data/formulas.js 後重新 npm run build。 */
(() => {
  // src/data/formulas.js
  var F = {
    title: { zh: "公式一覽", en: "Formula Sheet" },
    intro: {
      zh: "以下按課題整理常用公式，方便查閱。",
      en: "Common formulae grouped by topic, for quick reference."
    },
    sections: [
      {
        zh: "面積與周界",
        en: "Area & Perimeter",
        items: [
          { zh: "正方形面積", en: "Area of square", latex: "A = a^2", skills: ["g4.area"] },
          { zh: "長方形面積", en: "Area of rectangle", latex: "A = l w", skills: ["g4.area"] },
          { zh: "三角形面積", en: "Area of triangle", latex: "A = \\dfrac{1}{2} b h", skills: ["g4.triangle"] },
          { zh: "長方形周界", en: "Perimeter of rectangle", latex: "P = 2(l + w)", skills: ["g4.perimeter"] },
          { zh: "正方形周界", en: "Perimeter of square", latex: "P = 4a", skills: ["g4.perimeter"] },
          { zh: "圓周長", en: "Circumference", latex: "C = 2 \\pi r", skills: ["g6.circle"] },
          { zh: "圓面積", en: "Area of circle", latex: "A = \\pi r^2", skills: ["g6.circle"] },
          { zh: "扇形面積", en: "Area of sector", latex: "A = \\pi r^2 \\times \\dfrac{\\theta}{360}", skills: ["ms.s3.sector", "ms.s3.arclen"] }
        ]
      },
      {
        zh: "百分數、速率與平均",
        en: "Percentage, Rate & Average",
        items: [
          { zh: "百分率（部分 ÷ 整體）", en: "Percentage", latex: "p\\% = \\dfrac{P}{W} \\times 100\\%", skills: ["g6.percent"] },
          { zh: "增加百分率", en: "Percentage increase", latex: "V' = V(1 + r)", skills: ["g6.percent"] },
          { zh: "減少百分率", en: "Percentage decrease", latex: "V' = V(1 - r)", skills: ["g6.percent"] },
          { zh: "速率", en: "Speed", latex: "v = \\dfrac{d}{t}", skills: ["g5.word", "g6.word"] }
        ]
      },
      {
        zh: "體積",
        en: "Volume",
        items: [
          { zh: "長方體體積", en: "Volume of cuboid", latex: "V = l w h", skills: ["g6.volume"] },
          { zh: "柱體體積", en: "Volume of prism", latex: "V = A h", skills: ["ms.s3.prism"] },
          { zh: "錐體體積", en: "Volume of pyramid", latex: "V = \\dfrac{1}{3} A h", skills: ["ms.s3.prism"] },
          { zh: "圓柱體積", en: "Volume of cylinder", latex: "V = \\pi r^2 h", skills: ["ms.s3.cylinder"] },
          { zh: "圓錐體積", en: "Volume of cone", latex: "V = \\dfrac{1}{3} \\pi r^2 h", skills: ["ms.s3.cone"] },
          { zh: "球體積", en: "Volume of sphere", latex: "V = \\dfrac{4}{3} \\pi r^3", skills: ["ms.s3.cone"] }
        ]
      },
      {
        zh: "數與代數",
        en: "Number & Algebra",
        items: [
          { zh: "指數定律", en: "Laws of indices", latex: "a^m \\times a^n = a^{m+n},\\ \\dfrac{a^m}{a^n} = a^{m-n},\\ (a^m)^n = a^{mn}", skills: ["ms.s3.indices"] },
          { zh: "等差數列第 n 項", en: "nth term (arithmetic)", latex: "a_n = a_1 + (n-1) d", skills: ["hs.s5.ap"] },
          { zh: "等比數列第 n 項", en: "nth term (geometric)", latex: "a_n = a_1 r^{n-1}", skills: ["hs.s5.gp"] },
          { zh: "一元二次方程求根", en: "Quadratic formula", latex: "x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}", skills: ["hs.s4.quadsolve"] },
          { zh: "判別式", en: "Discriminant", latex: "\\Delta = b^2 - 4ac", skills: ["hs.s4.quadsolve", "hs.s4.quad2"] },
          { zh: "兩根之和與積", en: "Sum & product of roots", latex: "\\alpha + \\beta = -\\dfrac{b}{a},\\quad \\alpha \\beta = \\dfrac{c}{a}", skills: ["hs.s6.quad"] },
          { zh: "對數定律", en: "Laws of logarithms", latex: "\\log(mn) = \\log m + \\log n,\\quad \\log\\dfrac{m}{n} = \\log m - \\log n", skills: ["hs.s4.log"] },
          { zh: "等比數列前 n 項和", en: "Sum of geometric series", latex: "S_n = \\dfrac{a(1 - r^n)}{1 - r}", skills: ["hs.s5.gpsum"] },
          { zh: "等比數列無限和", en: "Sum to infinity", latex: "S_\\infty = \\dfrac{a}{1 - r}\\ (|r| < 1)", skills: ["hs.s5.gpsum"] },
          { zh: "排列", en: "Permutation", latex: "P(n,r) = \\dfrac{n!}{(n-r)!}", skills: ["hs.s6.comb"] },
          { zh: "組合", en: "Combination", latex: "C(n,r) = \\dfrac{n!}{r!(n-r)!}", skills: ["hs.s6.comb"] },
          { zh: "二項式定理（一般項）", en: "Binomial term", latex: "T_{r+1} = C(n,r)\\,x^{n-r}a^r", skills: ["hs.s6.binomial", "hs.s6.binomial2"] }
        ]
      },
      {
        zh: "幾何與坐標",
        en: "Geometry & Coordinates",
        items: [
          { zh: "畢氏定理", en: "Pythagoras theorem", latex: "a^2 + b^2 = c^2", skills: ["ms.s2.pythagoras"] },
          { zh: "兩點距離", en: "Distance formula", latex: "d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}", skills: ["ms.s1.coord"] },
          { zh: "中點公式", en: "Midpoint formula", latex: "M = \\left(\\dfrac{x_1 + x_2}{2},\\ \\dfrac{y_1 + y_2}{2}\\right)", skills: ["ms.s1.coord"] }
        ]
      },
      {
        zh: "三角學",
        en: "Trigonometry",
        items: [
          { zh: "三角比", en: "Trigonometric ratios", latex: "\\sin\\theta = \\dfrac{\\text{opp}}{\\text{hyp}},\\ \\cos\\theta = \\dfrac{\\text{adj}}{\\text{hyp}},\\ \\tan\\theta = \\dfrac{\\text{opp}}{\\text{adj}}", skills: ["hs.s4.trig"] },
          { zh: "平方關係", en: "Pythagorean identity", latex: "\\sin^2\\theta + \\cos^2\\theta = 1", skills: ["hs.s4.identities"] },
          { zh: "商數關係", en: "Quotient identity", latex: "\\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta}", skills: ["hs.s4.identities"] },
          { zh: "二倍角公式", en: "Double-angle formulae", latex: "\\sin 2\\theta = 2\\sin\\theta\\cos\\theta,\\quad \\cos 2\\theta = \\cos^2\\theta - \\sin^2\\theta", skills: ["hs.s4.identities"] },
          { zh: "正弦定理", en: "Sine rule", latex: "\\dfrac{a}{\\sin A} = \\dfrac{b}{\\sin B} = \\dfrac{c}{\\sin C}", skills: ["hs.s5.sinerule"] },
          { zh: "餘弦定理", en: "Cosine rule", latex: "c^2 = a^2 + b^2 - 2ab\\cos C", skills: ["hs.s5.sinerule"] },
          { zh: "三角形面積（兩邊及夾角）", en: "Area of triangle (SAS)", latex: "A = \\dfrac{1}{2}ab\\sin C", skills: ["hs.s5.sinerule"] },
          { zh: "正弦曲線的振幅與週期", en: "Amplitude and period of sine curve", latex: "y = a\\sin(bx):\\ \\text{amplitude} = |a|,\\ \\text{period} = \\dfrac{360^\\circ}{|b|}", skills: ["hs.s5.triggraph"] },
          { zh: "複角公式", en: "Compound-angle formulae", latex: "\\sin(A\\pm B)=\\sin A\\cos B\\pm\\cos A\\sin B,\\quad \\cos(A\\pm B)=\\cos A\\cos B\\mp\\sin A\\sin B", skills: ["hs.s5.compound"] },
          { zh: "正切複角公式", en: "Tangent compound angle", latex: "\\tan(A+B)=\\dfrac{\\tan A+\\tan B}{1-\\tan A\\tan B}", skills: ["hs.s5.compound"] },
          { zh: "弧度與弧長", en: "Radians and arc length", latex: "180^\\circ=\\pi,\\quad s=r\\theta,\\quad A=\\dfrac{1}{2}r^2\\theta", skills: ["hs.s5.radian"] },
          { zh: "三角方程的一般解", en: "General solutions", latex: "\\sin\\theta=\\sin\\alpha \\Rightarrow \\theta=n\\pi+(-1)^n\\alpha", skills: ["hs.s5.trigeq"] }
        ]
      },
      {
        zh: "概率與統計",
        en: "Probability & Statistics",
        items: [
          { zh: "概率", en: "Probability", latex: "P(E) = \\dfrac{n(E)}{n(S)}", skills: ["ms.s3.prob", "hs.s5.prob", "hs.s6.prob2"] },
          { zh: "平均數", en: "Mean", latex: "\\bar{x} = \\dfrac{x_1 + x_2 + \\cdots + x_n}{n}", skills: ["g5.average"] },
          { zh: "中位數", en: "Median", latex: "\\tilde{x}", skills: ["hs.s6.stats"] },
          { zh: "四分位距", en: "Interquartile range", latex: "IQR = Q_3 - Q_1", skills: ["hs.s5.dispersion"] },
          { zh: "期望值", en: "Expected value", latex: "E(X) = \\sum x P(x)", skills: ["col.prob"] }
        ]
      }
    ]
  };

  // data-entry.js
  (typeof window !== "undefined" ? window : globalThis).Formulas = F;
})();
