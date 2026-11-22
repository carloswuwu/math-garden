/* 值的表示與比較（ESM）：數字、分數物件、等值判斷、輸入規整。 */
  /* ---------------- 值的表示與比較 ---------------- */

function isFraction(v) {
    return v && typeof v === 'object' && typeof v.n === 'number' && typeof v.d === 'number';
  }

function gcdInt(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { var t = a % b; a = b; b = t; }
    return a || 1;
  }

  /* 化簡為最簡分數；分母保持正數 */
function reduceFraction(f) {
    var sign = f.d < 0 ? -1 : 1;
    var g = gcdInt(f.n, f.d);
    return { n: (f.n * sign) / g, d: (f.d * sign) / g };
  }

  /* 值鍵：等值分數共用同一鍵（2/4 與 1/2 相同），用於選項去重 */
function valueKey(v) {
    if (!isFraction(v)) return String(v);
    var r = reduceFraction(v);
    return r.n + '/' + r.d;
  }

function renderValue(v) {
    if (!isFraction(v)) return String(v);
    var r = reduceFraction(v);
    return r.d === 1 ? String(r.n) : r.n + '/' + r.d;
  }

  /* 等值分數視為相等：2/4 = 1/2 */
function valuesEqual(a, b) {
    if (isFraction(a) && isFraction(b)) return a.n * b.d === b.n * a.d;
    return a === b;
  }

  /* 把用戶輸入規整為「值」；無法解析返回 null */
function normalizeInput(input, expected) {
    if (input === null || input === undefined) return null;
    if (typeof input === 'object') {
      return (typeof input.n === 'number' && typeof input.d === 'number') ? { n: input.n, d: input.d } : null;
    }
    if (typeof input === 'number') return Number.isFinite(input) ? input : null;
    var s = String(input).trim();
    if (isFraction(expected)) {
      var m = /^(\d+)\s*\/\s*(\d+)$/.exec(s);
      return m ? { n: Number(m[1]), d: Number(m[2]) } : null;
    }
    if (typeof expected === 'string') return s; // 顏色/文字答案
    if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
    return null;
  }

export { isFraction, gcdInt, reduceFraction, valueKey, renderValue, valuesEqual, normalizeInput };
