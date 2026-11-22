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
    var parts = s.split(/\$([^$]*)\$/);
    var out = '';
    for (var i = 0; i < parts.length; i++) {
      if (i % 2 === 1) {
        if (window.katex) {
          try { out += window.katex.renderToString(parts[i], { throwOnError: false }); }
          catch (e) { out += esc(parts[i]); }
        } else {
          out += esc(parts[i]);
        }
      } else {
        out += esc(parts[i]);
      }
    }
    return out;
  }

export { esc, renderMath };
