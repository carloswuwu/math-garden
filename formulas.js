/*
 * 公式一覽（參考）
 * 依課程內容整理，配合 KaTeX 排版；僅作參考，練習以題型為主。
 */
(function (root) {
  'use strict';

  var F = {
    title: { zh: '公式一覽', en: 'Formula Sheet' },
    intro: {
      zh: '以下按課題整理常用公式，方便查閱。',
      en: 'Common formulae grouped by topic, for quick reference.'
    },
    sections: [
      {
        zh: '面積與周界', en: 'Area & Perimeter', items: [
          { zh: '正方形面積', en: 'Area of square', latex: 'A = a^2' },
          { zh: '長方形面積', en: 'Area of rectangle', latex: 'A = l w' },
          { zh: '三角形面積', en: 'Area of triangle', latex: 'A = \\dfrac{1}{2} b h' },
          { zh: '長方形周界', en: 'Perimeter of rectangle', latex: 'P = 2(l + w)' },
          { zh: '正方形周界', en: 'Perimeter of square', latex: 'P = 4a' },
          { zh: '圓周長', en: 'Circumference', latex: 'C = 2 \\pi r' },
          { zh: '圓面積', en: 'Area of circle', latex: 'A = \\pi r^2' },
          { zh: '扇形面積', en: 'Area of sector', latex: 'A = \\pi r^2 \\times \\dfrac{\\theta}{360}' }
        ]
      },
      {
        zh: '百分數、速率與平均', en: 'Percentage, Rate & Average', items: [
          { zh: '百分率（部分 ÷ 整體）', en: 'Percentage', latex: 'p\\% = \\dfrac{P}{W} \\times 100\\%' },
          { zh: '增加百分率', en: 'Percentage increase', latex: "V' = V(1 + r)" },
          { zh: '減少百分率', en: 'Percentage decrease', latex: "V' = V(1 - r)" },
          { zh: '速率', en: 'Speed', latex: 'v = \\dfrac{d}{t}' }
        ]
      },
      {
        zh: '體積', en: 'Volume', items: [
          { zh: '長方體體積', en: 'Volume of cuboid', latex: 'V = l w h' },
          { zh: '柱體體積', en: 'Volume of prism', latex: 'V = A h' },
          { zh: '錐體體積', en: 'Volume of pyramid', latex: 'V = \\dfrac{1}{3} A h' },
          { zh: '圓柱體積', en: 'Volume of cylinder', latex: 'V = \\pi r^2 h' },
          { zh: '圓錐體積', en: 'Volume of cone', latex: 'V = \\dfrac{1}{3} \\pi r^2 h' },
          { zh: '球體積', en: 'Volume of sphere', latex: 'V = \\dfrac{4}{3} \\pi r^3' }
        ]
      },
      {
        zh: '數與代數', en: 'Number & Algebra', items: [
          { zh: '指數定律', en: 'Laws of indices', latex: 'a^m \\times a^n = a^{m+n},\\ \\dfrac{a^m}{a^n} = a^{m-n},\\ (a^m)^n = a^{mn}' },
          { zh: '等差數列第 n 項', en: 'nth term (arithmetic)', latex: 'a_n = a_1 + (n-1) d' },
          { zh: '等比數列第 n 項', en: 'nth term (geometric)', latex: 'a_n = a_1 r^{n-1}' },
          { zh: '一元二次方程求根', en: 'Quadratic formula', latex: 'x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
          { zh: '判別式', en: 'Discriminant', latex: '\\Delta = b^2 - 4ac' },
          { zh: '兩根之和與積', en: 'Sum & product of roots', latex: '\\alpha + \\beta = -\\dfrac{b}{a},\\quad \\alpha \\beta = \\dfrac{c}{a}' },
          { zh: '對數定律', en: 'Laws of logarithms', latex: '\\log(mn) = \\log m + \\log n,\\quad \\log\\dfrac{m}{n} = \\log m - \\log n' },
          { zh: '等比數列前 n 項和', en: 'Sum of geometric series', latex: 'S_n = \\dfrac{a(1 - r^n)}{1 - r}' },
          { zh: '等比數列無限和', en: 'Sum to infinity', latex: 'S_\\infty = \\dfrac{a}{1 - r}\\ (|r| < 1)' },
          { zh: '排列', en: 'Permutation', latex: 'P(n,r) = \\dfrac{n!}{(n-r)!}' },
          { zh: '組合', en: 'Combination', latex: 'C(n,r) = \\dfrac{n!}{r!(n-r)!}' },
          { zh: '二項式定理（一般項）', en: 'Binomial term', latex: 'T_{r+1} = C(n,r)\\,x^{n-r}a^r' }
        ]
      },
      {
        zh: '幾何與坐標', en: 'Geometry & Coordinates', items: [
          { zh: '畢氏定理', en: 'Pythagoras theorem', latex: 'a^2 + b^2 = c^2' },
          { zh: '兩點距離', en: 'Distance formula', latex: 'd = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}' },
          { zh: '中點公式', en: 'Midpoint formula', latex: 'M = \\left(\\dfrac{x_1 + x_2}{2},\\ \\dfrac{y_1 + y_2}{2}\\right)' }
        ]
      },
      {
        zh: '三角學', en: 'Trigonometry', items: [
          { zh: '三角比', en: 'Trigonometric ratios', latex: '\\sin\\theta = \\dfrac{\\text{opp}}{\\text{hyp}},\\ \\cos\\theta = \\dfrac{\\text{adj}}{\\text{hyp}},\\ \\tan\\theta = \\dfrac{\\text{opp}}{\\text{adj}}' },
          { zh: '正弦／餘弦定理', en: 'Sine / cosine rules', latex: '\\dfrac{a}{\\sin A} = \\dfrac{b}{\\sin B} = \\dfrac{c}{\\sin C},\\quad c^2 = a^2 + b^2 - 2ab\\cos C' }
        ]
      },
      {
        zh: '概率與統計', en: 'Probability & Statistics', items: [
          { zh: '概率', en: 'Probability', latex: 'P(E) = \\dfrac{n(E)}{n(S)}' },
          { zh: '平均數', en: 'Mean', latex: '\\bar{x} = \\dfrac{x_1 + x_2 + \\cdots + x_n}{n}' },
          { zh: '中位數', en: 'Median', latex: '\\tilde{x}' },
          { zh: '四分位距', en: 'Interquartile range', latex: 'IQR = Q_3 - Q_1' },
          { zh: '期望值', en: 'Expected value', latex: 'E(X) = \\sum x P(x)' }
        ]
      }
    ]
  };

  root.Formulas = F;
})(typeof window !== 'undefined' ? window : globalThis);
