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
          { zh: '圓周長', en: 'Circumference', latex: 'C = 2 \\pi r' },
          { zh: '圓面積', en: 'Area of circle', latex: 'A = \\pi r^2' }
        ]
      },
      {
        zh: '體積', en: 'Volume', items: [
          { zh: '長方體體積', en: 'Volume of cuboid', latex: 'V = l w h' },
          { zh: '圓柱體積', en: 'Volume of cylinder', latex: 'V = \\pi r^2 h' }
        ]
      },
      {
        zh: '數與代數', en: 'Number & Algebra', items: [
          { zh: '指數定律', en: 'Laws of indices', latex: 'a^m \\times a^n = a^{m+n},\\ \\dfrac{a^m}{a^n} = a^{m-n},\\ (a^m)^n = a^{mn}' },
          { zh: '等差數列第 n 項', en: 'nth term (arithmetic)', latex: 'a_n = a_1 + (n-1) d' },
          { zh: '等比數列第 n 項', en: 'nth term (geometric)', latex: 'a_n = a_1 r^{n-1}' },
          { zh: '一元二次方程求根', en: 'Quadratic formula', latex: 'x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
          { zh: '兩根之和與積', en: 'Sum & product of roots', latex: '\\alpha + \\beta = -\\dfrac{b}{a},\\quad \\alpha \\beta = \\dfrac{c}{a}' }
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
          { zh: '概率', en: 'Probability', latex: 'P(E) = \\dfrac{\\text{符合條件的結果數}}{\\text{總結果數}}' },
          { zh: '平均數', en: 'Mean', latex: '\\bar{x} = \\dfrac{x_1 + x_2 + \\cdots + x_n}{n}' },
          { zh: '中位數', en: 'Median', latex: '\\text{把數據由小到大排列，取中間值}' }
        ]
      }
    ]
  };

  root.Formulas = F;
})(typeof window !== 'undefined' ? window : globalThis);
