/* 一次性工具：把 math-kid 內所有中文從簡體轉為繁體。
 * 用法：node tests/convert_traditional.js（依賴 tests 裡的 chinese-conv） */
'use strict';
const fs = require('fs');
const path = require('path');
const { tify } = require('chinese-conv');

const ROOT = path.join(__dirname, '..');
const EXTS = new Set(['.js', '.html', '.css', '.webmanifest', '.md', '.bat', '.json']);
const SKIP = new Set(['node_modules', '.pnpm-store']);

function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else if (EXTS.has(path.extname(name).toLowerCase())) out.push(p);
  }
  return out;
}

let changed = 0;
for (const file of walk(ROOT)) {
  const src = fs.readFileSync(file, 'utf8');
  const dst = tify(src);
  if (dst !== src) {
    fs.writeFileSync(file, dst, 'utf8');
    changed++;
  }
}
console.log('converted ' + changed + ' files to Traditional Chinese');
