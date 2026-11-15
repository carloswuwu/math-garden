/*
 * 課程大綱（香港教育局數學課程參考）
 * 依據：教育局《數學教育學習領域課程指引（小一至中六）》（2017）
 *      及各學習階段補充文件（小學、初中、高中）。
 * 純參考資料，並非考核範圍；用於家長／學生了解整體課程結構。
 */
(function (root) {
  'use strict';

  var O = {
    title: { zh: '課程大綱', en: 'Curriculum Outline' },
    intro: {
      zh: '以下大綱按香港教育局《數學教育學習領域課程指引（小一至中六）》（2017）及各階段補充文件整理，供家長參考。',
      en: 'This outline follows the Education Bureau "Mathematics Education Key Learning Area Curriculum Guide (P.1 – S.6)" (2017) and its stage supplements, for parents\' reference.'
    },
    note: {
      zh: '課程分為五個學習範疇（小學：數、度量、圖形與空間、數據處理、代數），中學則分為三個範疇（數與代數、度量及圖形與空間、數據處理）。',
      en: 'The curriculum has 5 strands at primary level (Number, Measures, Shape & Space, Data Handling, Algebra) and 3 at secondary level (Number & Algebra, Measures & Shape & Space, Data Handling).'
    },
    stages: [
      {
        id: 'ks1',
        zh: '第一學習階段（小一至小三）',
        en: 'Key Stage 1 (P.1 – P.3)',
        strands: [
          { zh: '數', en: 'Number', units: [
            { zh: '20 以內的數', en: 'Numbers to 20' },
            { zh: '100 以內的數', en: 'Numbers to 100' },
            { zh: '三位數', en: 'Three-digit numbers' },
            { zh: '四位數', en: 'Four-digit numbers' },
            { zh: '五位數', en: 'Five-digit numbers' },
            { zh: '基本加法和減法', en: 'Basic addition and subtraction' },
            { zh: '加法和減法（一至三）', en: 'Addition and subtraction (I–III)' },
            { zh: '基本乘法', en: 'Basic multiplication' },
            { zh: '乘法（一）', en: 'Multiplication (I)' },
            { zh: '除法（一）', en: 'Division (I)' },
            { zh: '四則運算（一）', en: 'Four operations (I)' },
            { zh: '分數（一）', en: 'Fractions (I)' }
          ] },
          { zh: '度量', en: 'Measures', units: [
            { zh: '長度和距離（一至四）', en: 'Length and distance (I–IV)' },
            { zh: '貨幣（一）', en: 'Money (I)' },
            { zh: '時間（一至三）', en: 'Time (I–III)' }
          ] },
          { zh: '圖形與空間', en: 'Shape & Space', units: [
            { zh: '立體圖形（一）', en: '3-D shapes (I)' },
            { zh: '直線和曲線', en: 'Straight lines and curves' },
            { zh: '平面圖形', en: '2-D shapes' },
            { zh: '角', en: 'Angles' },
            { zh: '方向和位置（一至二）', en: 'Direction and position (I–II)' },
            { zh: '四邊形（一）', en: 'Quadrilaterals (I)' },
            { zh: '三角形', en: 'Triangles' }
          ] },
          { zh: '數據處理', en: 'Data Handling', units: [
            { zh: '象形圖', en: 'Pictograms' },
            { zh: '棒形圖（一）', en: 'Bar charts (I)' }
          ] }
        ]
      },
      {
        id: 'ks2',
        zh: '第二學習階段（小四至小六）',
        en: 'Key Stage 2 (P.4 – P.6)',
        strands: [
          { zh: '數', en: 'Number', units: [
            { zh: '四則運算（二至三）', en: 'Four operations (II–III)' },
            { zh: '分數（二至五）', en: 'Fractions (II–V)' },
            { zh: '小數（一至三）', en: 'Decimals (I–III)' },
            { zh: '百分數（一至二）', en: 'Percentages (I–II)' }
          ] },
          { zh: '度量', en: 'Measures', units: [
            { zh: '面積（一至三）', en: 'Area (I–III)' },
            { zh: '周界（一至二）', en: 'Perimeter (I–II)' },
            { zh: '體積（一至二）', en: 'Volume (I–II)' },
            { zh: '角（度）', en: 'Angles (degrees)' },
            { zh: '重量', en: 'Weight' },
            { zh: '容量', en: 'Capacity' }
          ] },
          { zh: '圖形與空間', en: 'Shape & Space', units: [
            { zh: '四邊形（三至四）', en: 'Quadrilaterals (III–IV)' },
            { zh: '三角形（二）', en: 'Triangles (II)' },
            { zh: '立體圖形（三至四）', en: '3-D shapes (III–IV)' },
            { zh: '對稱', en: 'Symmetry' },
            { zh: '方向和位置（三）', en: 'Direction and position (III)' }
          ] },
          { zh: '數據處理', en: 'Data Handling', units: [
            { zh: '棒形圖（二至三）', en: 'Bar charts (II–III)' },
            { zh: '折線圖', en: 'Line graphs' },
            { zh: '平均數', en: 'Averages' },
            { zh: '統計圖的應用及誤用', en: 'Using and misusing statistical graphs' }
          ] },
          { zh: '代數', en: 'Algebra', units: [
            { zh: '簡易方程（一至二）', en: 'Simple equations (I–II)' }
          ] }
        ]
      },
      {
        id: 'js',
        zh: '第三學習階段（中一至中三）',
        en: 'Key Stage 3 (S.1 – S.3)',
        strands: [
          { zh: '數與代數', en: 'Number & Algebra', units: [
            { zh: '基礎計算', en: 'Basic computation' },
            { zh: '有向數', en: 'Directed numbers' },
            { zh: '近似值與數值估算', en: 'Approximation and estimation' },
            { zh: '有理數與無理數', en: 'Rational and irrational numbers' },
            { zh: '百分法', en: 'Percentages' },
            { zh: '率、比及比例', en: 'Rate, ratio and proportion' },
            { zh: '代數式', en: 'Algebraic expressions' },
            { zh: '一元一次方程', en: 'Linear equations in one unknown' },
            { zh: '二元一次方程', en: 'Linear equations in two unknowns' },
            { zh: '整數指數律', en: 'Laws of indices' },
            { zh: '多項式', en: 'Polynomials' },
            { zh: '恆等式', en: 'Identities' },
            { zh: '公式', en: 'Formulae' },
            { zh: '一元一次不等式', en: 'Linear inequalities in one unknown' }
          ] },
          { zh: '度量及圖形與空間', en: 'Measures, Shape & Space', units: [
            { zh: '量度的誤差', en: 'Errors in measurement' },
            { zh: '弧長和扇形面積', en: 'Arc length and sector area' },
            { zh: '立體圖形', en: '3-D figures' },
            { zh: '求積法', en: 'Mensuration' },
            { zh: '角和平行線', en: 'Angles and parallel lines' },
            { zh: '多邊形', en: 'Polygons' },
            { zh: '全等三角形', en: 'Congruent triangles' },
            { zh: '相似三角形', en: 'Similar triangles' },
            { zh: '四邊形', en: 'Quadrilaterals' },
            { zh: '三角形的內外心', en: 'Centres of a triangle' },
            { zh: '畢氏定理', en: 'Pythagoras theorem' },
            { zh: '直角坐標系', en: 'Rectangular coordinates' },
            { zh: '三角學', en: 'Trigonometry' }
          ] },
          { zh: '數據處理', en: 'Data Handling', units: [
            { zh: '數據的組織', en: 'Organisation of data' },
            { zh: '數據的表達', en: 'Presentation of data' },
            { zh: '集中趨勢的度量', en: 'Measures of central tendency' },
            { zh: '概率', en: 'Probability' }
          ] },
          { zh: '其他', en: 'Other', units: [
            { zh: '探索與研究', en: 'Exploration and research' }
          ] }
        ]
      },
      {
        id: 'ss',
        zh: '第四學習階段（中四至中六）',
        en: 'Key Stage 4 (S.4 – S.6)',
        strands: [
          { zh: '數與代數（必修）', en: 'Number & Algebra (Compulsory)', units: [
            { zh: '一元二次方程', en: 'Quadratic equations in one unknown' },
            { zh: '續方程', en: 'More about equations' },
            { zh: '變分', en: 'Variation' },
            { zh: '二元一次不等式', en: 'Linear inequalities in two unknowns' },
            { zh: '指數函數及對數函數', en: 'Exponential and logarithmic functions' },
            { zh: '函數及其圖像', en: 'Functions and their graphs' },
            { zh: '續多項式', en: 'More about polynomials' },
            { zh: '等差數列和等比數列及其求和法', en: 'Arithmetic and geometric sequences and their summation' }
          ] },
          { zh: '度量及圖形與空間（必修）', en: 'Measures, Shape & Space (Compulsory)', units: [
            { zh: '直線的方程', en: 'Equations of straight lines' },
            { zh: '圓的方程', en: 'Equations of circles' },
            { zh: '續圓', en: 'More about circles' },
            { zh: '續三角', en: 'More about trigonometry' },
            { zh: '軌跡', en: 'Loci' }
          ] },
          { zh: '數據處理（必修）', en: 'Data Handling (Compulsory)', units: [
            { zh: '排列與組合', en: 'Permutations and combinations' },
            { zh: '續概率', en: 'More about probability' },
            { zh: '離差的度量', en: 'Measures of dispersion' },
            { zh: '統計的應用及誤用', en: 'Uses and abuses of statistics' }
          ] },
          { zh: '延伸部分 單元一（微積分與統計）', en: 'Extended Part Module 1 (Calculus & Statistics)', units: [
            { zh: '基礎知識', en: 'Foundation knowledge' },
            { zh: '微積分', en: 'Calculus' },
            { zh: '統計', en: 'Statistics' },
            { zh: '進階學習單位', en: 'Further learning unit' }
          ] },
          { zh: '延伸部分 單元二（代數與微積分）', en: 'Extended Part Module 2 (Algebra & Calculus)', units: [
            { zh: '基礎知識', en: 'Foundation knowledge' },
            { zh: '代數', en: 'Algebra' },
            { zh: '微積分', en: 'Calculus' },
            { zh: '進階學習單位', en: 'Further learning unit' }
          ] }
        ]
      }
    ]
  };

  root.CurriculumOutline = O;
})(typeof window !== 'undefined' ? window : globalThis);
