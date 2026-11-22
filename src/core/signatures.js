/* 題目簽名／去重（ESM）：stableStringify、mathSig、templateSig、contextSig。
 * generateProblem／nextProblem／compose 共用。 */

  function stableStringify(value) {
    if (value === null || typeof value !== 'object') return JSON.stringify(value);
    if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
    var keys = Object.keys(value).sort();
    return '{' + keys.map(function (k) { return JSON.stringify(k) + ':' + stableStringify(value[k]); }).join(',') + '}';
  }

  /* ---------------- 顯示用的數學格式 ----------------
   * 生成器的題幹/提示/解題步驟有時會用純文字 caret（4^3、x^(n−1)）。
   * 這個工具把「$...$ 以外」的 caret 式子包成 $...$，交由 KaTeX 排版；
   * 已用 $...$ 的部分保持不動（避免重複包裹）。 */

  /* 題目的穩定標識（完整 math 內容，用於去重與「避開最近題」） */
  function mathSig(math) {
    return stableStringify(math);
  }

  /* 結構 key：把 math 裡的數字換成 '#'，保留運算／模式／情境欄位。
   * 兩個題目 templateSig 相同 = 同一個模板，只是換了數字（正是使用者抱怨的重複）。 */
  function blankNumerals(value) {
    if (typeof value === 'number') return '#';
    if (typeof value === 'string') return value.replace(/\d+(?:\.\d+)?/g, '#');
    if (value === null || typeof value !== 'object') return value;
    if (Array.isArray(value)) return value.map(blankNumerals);
    var out = {};
    Object.keys(value).sort().forEach(function (k) { out[k] = blankNumerals(value[k]); });
    return out;
  }

  function templateSig(problem) {
    if (!problem || !problem.math) return '';
    return problem.type + ':' + stableStringify(blankNumerals(problem.math));
  }

  /* 題幹模板 key：把英文題幹的數字換成 '#'（用於區分同一 template 的不同情境句子）。 */
  function contextSig(problem) {
    if (!problem) return '';
    var text = problem.prompt && problem.prompt.en ? String(problem.prompt.en) : '';
    return problem.type + ':' + text.replace(/\d+(?:\.\d+)?/g, '#').replace(/\s+/g, ' ').trim();
  }

export { stableStringify, mathSig, templateSig, contextSig };
