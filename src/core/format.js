/* 顯示格式（ESM）：把 $...$ 以外的 caret 式子包成 KaTeX。
 * generateProblem（題幹/提示）與 explain（解題步驟）共用。 */
  var CARET_TOKEN_RE = /(?:\([A-Za-z0-9.+\-−×÷/ ]+\)|[A-Za-z0-9.]+)\s*\^\s*(?:\{[A-Za-z0-9.+\-−]+\}|\([A-Za-z0-9.+\-−]+\)|[A-Za-z0-9.]+)/g;

  function formatMathText(text) {
    if (typeof text !== 'string' || text.indexOf('^') === -1) return text;
    return text.split(/(\$[^$]*\$)/).map(function (part, idx) {
      if (idx % 2 === 1) return part; // 已在 $...$ 內
      return part.replace(CARET_TOKEN_RE, function (tok) {
        return '$' + tok.replace(/−/g, '-') + '$';
      });
    }).join('');
  }

export { formatMathText };
