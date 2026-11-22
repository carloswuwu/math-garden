/* 顯示格式（ESM）：HTML 轉義與 $...$ KaTeX 渲染；無 KaTeX 時退回純文字。 */
import { MathCore } from './globals.js';

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderMath(text) {
    var s = String(text);
    /* 純文字 caret 式子（4^3、x^(n−1)…）先包成 $...$，交由 KaTeX 排版 */
    if (MathCore && typeof MathCore.formatMathText === 'function') s = MathCore.formatMathText(s);
    if (s.indexOf('$') === -1) return esc(s);
    var parts = s.split(/(\$\$[\s\S]+?\$\$|\$[^$]+\$)/);
    var out = '';
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i];
      var isDisplay = part.length > 4 && part.slice(0, 2) === '$$' && part.slice(-2) === '$$';
      var isInline = part.length > 2 && part.charAt(0) === '$' && part.charAt(part.length - 1) === '$' && !isDisplay;
      if (isDisplay || isInline) {
        var tex = isDisplay ? part.slice(2, -2) : part.slice(1, -1);
        if (window.katex) {
          try { out += window.katex.renderToString(tex, { throwOnError: false, displayMode: isDisplay }); }
          catch (e) { out += esc(tex); }
        } else {
          out += esc(tex);
        }
      } else {
        out += esc(part);
      }
    }
    return out;
  }

export { esc, renderMath };
