/* 階乘等共用數學小工具（ESM）。 */
function factInt(n) {
  var f = 1;
  for (var i = 2; i <= n; i++) f *= i;
  return f;
}


export { factInt };
