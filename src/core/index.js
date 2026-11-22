/*
 * 數學核心邏輯（ESM 來源）。
 * 題目生成、判分、掌握度、自適應難度、間隔復習。
 * RNG 與值工具已抽到 ./rng.js、./values.js；其餘在此，經 build 生成 root math-core.js（UMD），
 * 瀏覽器掛 window.MathCore、Node 仍可用 require("../math-core.js")。
 */
import { seedRandom, randInt, pick, shuffle } from './rng.js';
import { isFraction, gcdInt, reduceFraction, valueKey, renderValue, valuesEqual, normalizeInput } from './values.js';
import { factInt } from './facts.js';
import { MATH_SPEC, answerFromMath } from './math-spec.js';
import { fmtDecimal, fmtNum, explainEquationZh, explainEquationEn } from './display.js';
import { GENERATORS, DIR_LABEL, CENTRE_LABEL } from './generators.js';
import { formatMathText } from './format.js';
import { explain } from './explain.js';
import { fractionDistractor, buildChoices, distractorMax, distractorMin } from './choices.js';
import { stableStringify, mathSig, templateSig, contextSig } from './signatures.js';
import { levelFor, typeList, generateProblem, generateSet } from './problem.js';
import { composeSet, composeExam } from './compose.js';
import {
  defaultSkillProgress,
  typeAccKey,
  newProgress,
  sanitizeProgress,
  practiceStars,
  quizStars,
  masteryStatus,
  applyResult,
  applyQuizResult,
  gradeQuiz
} from './progress.js';

/* 題型目錄由 GENERATORS 的鍵自動產生，避免清單與實作脫節 */
  var GENERATOR_TYPES;

  /* ---------------- 題目生成器 ---------------- */




  /* 比大小（顏色版）：兩堆彩色圓點，選「更多/更少」的那一組顏色 */










  /* ---------------- 深度應用題（多步／跨概念，仍然只有 type 'word'） ----------------
   * 與基本題共用同一題型；以 math.op 區分，答案一律為整數。
   * 每個 op 都必須同時出現在 MATH_SPEC、explain() 的 word 分支與 distractorMax。 */



  /* ================= 進階題型（小四～小六） ================= */



  /* 多位數乘除 */

  /* 同分母分數加減（真分數） */

  /* 小數加減（一位小數，答案用字串表示避免浮點誤差） */

  /* 小數乘除 */

  /* 平均數 */

  /* 簡易方程：求 x */

  /* 百分數（難度級別可指定 modes：of/what/increase/decrease/change/reverse） */

  /* 比與比例（modes: findB/share/threePart） */

  /* 長方形面積 / 周界 */

  /* 求一個數的幾分之幾 */

  /* ================= 中學題型（中一至中三） ================= */



  /* 有向數四則運算 */

  /* 代數式求值（代入法） */

  /* 一元一次方程（兩步） */

  /* 畢氏定理 */

  /* 聯立方程 */

  /* 指數定律：乘、除、冪的乘方 */

  /* 一元一次不等式（答案為「x > k」等字串） */

  /* ================= 高中題型（中四至中六） ================= */


  /* 對數 */

  /* 函數求值 */

  /* 三角比 */

  /* 等差數列（modes: term/sum/findN） */

  /* 等比數列 */

  /* 概率 */
  /* 由同一分母建立 4 個互不等值的選項（概率題用） */


  /* 二次方程的根之和 / 積 */

  /* 統計（modes: median/mean） */

  /* ---------------- 解題步驟（小課堂「一步步示範」用） ---------------- */


  /* ================= 幾何與座標（含圖示） ================= */


  /* 三角形面積 */

  /* 圓的周長 / 面積（以 π 表示，答案為字串） */

  /* 以 π 表示的係數標籤：1π 一律寫成 π */


  /* 長方體體積 */

  /* 座標：兩點距離 / 中點 */


  /* ================= 補缺題型（度量、貨幣、單位、幾何、高中代數） ================= */



  /* 周界 */

  /* 多邊形內角和 */

  /* 角（事實） */

  /* 貨幣找續 */

  /* 單位換算（事實） */

  /* 二次方程求根（較大的根） */

  /* 直線斜率 */

  /* 正變 */

  /* 單雙數（奇偶） */

  /* ================= 補缺題型（圖形性質、代數、數據、高中） ================= */




  /* 圖形性質 */

  /* 對稱軸 */

  /* 合併同類項 */

  /* 多項式次數 / 係數 */

  /* 扇形弧長（以 π 表示） */



  /* 恆等式與展開 */

  /* 柱體與錐體體積（底面積 × 高） */

  /* 2×2 矩陣：行列式與乘積元素 */

  /* 微積分入門：導數值 / 定積分 */

  /* 期望值與二項概率 */


  /* 眾數 */

  /* 等差數列求和 */

  /* 反變 */

  /* 排列與組合 */

  /* 分佈域 */

  /* 圓方程的半徑 */

  /* ================= 初中補缺題型 ================= */



  /* 角與平行線 */

  /* 平方根 */

  /* 全等三角形 */

  /* 相似三角形 */

  /* 四邊形 */

  /* 圓柱體積 / 側面積（以 π 表示） */

  /* 單利息 */

  /* 展開（恆等式） */

  /* 圓形圖 */

  /* 量度誤差 */

  /* ================= 補缺題型（方向、時間、立體、三角、圓、二項式、微分） ================= */


  /* 24 小時制：隨機出「24→12」或「12→24」，而不是固定五題 */




  /* 方向 */

  /* 圓錐 / 球體（以 π 表示） */

  /* 三角形的心 */

  /* 圓周角 / 圓心角 */

  /* 二項式定理 */

  /* 微分入門 */

  /* 逐題型（含 mode）的解題步驟；題目可自帶 p.solution，否則用這裡的 solver。
   * 這是 explain() 的正式延伸點：新增題型／模式時在這裡補一個 solver，並由
   * tests/generators.test.js 驗證每個題型都不會拋錯、步驟不得為空。 */

  /* ---------------- 挑戰區：奧林匹克風格加難題 ---------------- */
  /* 13 個新的高難度題型；全部答案為整數或最簡分數，並由 MATH_SPEC / explain 完整支援。 */


















  /* ---------------- 挑戰區第二階：再 5 個奧林匹克題型 ---------------- */








  /* 題型目錄：直接由註冊表產生，新增生成器即自動納入 */
  GENERATOR_TYPES = Object.keys(GENERATORS);

  /* ---------------- 選項（干擾項）生成 ---------------- */


  /* 組成一份題組：同題不重複；同一模板/題幹最多 maxTpl 次；候選不足時逐級放寬，
   * 但保證長度 = count（修復舊 buildQuiz 在窄題庫上只出 3 題的問題）。 */


  /* ---------------- 判分 ---------------- */

  function checkAnswer(problem, input) {
    var expected = problem.answer;
    var parsed = normalizeInput(input, expected);
    return { correct: valuesEqual(expected, parsed), expected: expected };
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
      var a = 0, c = 0;
      var base = ts.t;
      Object.keys(sp.typeAcc).forEach(function (key) {
        if (key === base || key.indexOf(base + ':') === 0) {
          var acc = sp.typeAcc[key];
          if (acc && acc.a) { a += acc.a; c += acc.c; }
        }
      });
      if (!a) return 1;
      return Math.max(0.05, 1 - c / a);
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

  const MathCore = {
    GENERATOR_TYPES: GENERATOR_TYPES,
    MATH_SPEC: MATH_SPEC,
    answerFromMath: answerFromMath,
    formatMathText: formatMathText,
    templateSig: templateSig,
    contextSig: contextSig,
    composeSet: composeSet,
    composeExam: composeExam,
    isInputProblem: function (p) { return !!(p && p.input); },
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

export { MathCore };
