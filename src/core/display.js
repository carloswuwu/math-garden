/* 顯示用小工具（ESM）：小數格式、帶括號負數、方程解說句。
 * 由 generators 與 core/index（explain）共用，避免循環依賴。 */
  function fmtDecimal(tenths) {
    var neg = tenths < 0;
    var v = Math.abs(tenths);
    return (neg ? '-' : '') + Math.floor(v / 10) + '.' + (v % 10);
  }

  function fmtNum(n) { return n < 0 ? '(' + n + ')' : '' + n; }

  function explainEquationZh(m) {
    if (m.form === 'x+a=c') return '兩邊同時減 ' + m.a + '：x = ' + m.c + ' − ' + m.a + '。';
    if (m.form === 'x-a=c') return '兩邊同時加 ' + m.a + '：x = ' + m.c + ' + ' + m.a + '。';
    if (m.form === 'ax=c') return '兩邊同時除以 ' + m.a + '：x = ' + m.c + ' ÷ ' + m.a + '。';
    return '兩邊同時乘 ' + m.a + '：x = ' + m.c + ' × ' + m.a + '。';
  }

  function explainEquationEn(m) {
    if (m.form === 'x+a=c') return 'Subtract ' + m.a + ' from both sides: x = ' + m.c + ' − ' + m.a + '.';
    if (m.form === 'x-a=c') return 'Add ' + m.a + ' to both sides: x = ' + m.c + ' + ' + m.a + '.';
    if (m.form === 'ax=c') return 'Divide both sides by ' + m.a + ': x = ' + m.c + ' ÷ ' + m.a + '.';
    return 'Multiply both sides by ' + m.a + ': x = ' + m.c + ' × ' + m.a + '.';
  }

export { fmtDecimal, fmtNum, explainEquationZh, explainEquationEn };
