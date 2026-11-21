/* 契約測試：node tests/contract.test.js
 *
 * Phase 2 的跨層契約（不啟動 jsdom）：
 *  1. MATH_SPEC：每個題型的答案都能由 p.math 重新推導（唯一 oracle，用於自檢）
 *  2. 素材清單：index.html、manifest、SW precache 的每個相對檔案都存在
 *  3. i18n 與內容：所有 t('…') 字面量有中英；每個可練習技能有名稱/目標/課堂；
 *     英文題幹與提示不得含中文
 *  4. 解題步驟：每個「看一步步示範」可觸及的題型／模式都必須有步驟，
 *     且最後一步要交代畫面上顯示的答案
 *  5. 公式與技能對齊：每個公式項目標記存在的技能；公式覆蓋的題型所屬技能都被標記
 */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const M = require('../math-core.js');

const ROOT = path.join(__dirname, '..');
const ctx = {};
vm.createContext(ctx);
ctx.window = ctx;
ctx.globalThis = ctx;
['curriculum.js', 'lessons.js', 'i18n.js', 'formulas.js'].forEach((f) => {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
});
const C = ctx.Curriculum;
const Lessons = ctx.Lessons;
const I18N = ctx.I18N;
const F = ctx.Formulas;

let checks = 0;
function check(cond, msg) {
  checks++;
  assert.ok(cond, msg);
}

const CJK = /[\u4e00-\u9fff]/;
const skills = Object.values(C.skills).filter((s) => !s.scaffold && (s.types || []).length);
const typeOf = (t) => (typeof t === 'string' ? t : t.t);

/* ---------------- 1. MATH_SPEC：答案推導只有一份 oracle ---------------- */
(() => {
  check(M.MATH_SPEC && typeof M.MATH_SPEC === 'object', 'MathCore 應導出 MATH_SPEC');
  const specKeys = Object.keys(M.MATH_SPEC);
  check(specKeys.length >= 60, 'MATH_SPEC 應登記 60+ 個運算，實際 ' + specKeys.length);
  check(M.answerFromMath({ math: { op: 'count', n: 3 } }) === 3, 'answerFromMath: count');
  check(M.answerFromMath({ math: { op: '+', a: 2, b: 3 }, answer: 999 }) === 5, 'answerFromMath 只依 math，不讀 answer');
  check(M.answerFromMath({ math: { op: '+', a: null, b: 4, c: 9, blank: 'a' } }) === 5, 'answerFromMath: 填空 a');
  let unknownThrew = false;
  try { M.answerFromMath({ math: { op: 'nope' } }); } catch (e) { unknownThrew = true; }
  check(unknownThrew, 'answerFromMath 遇到未登記的 op 應拋錯');

  const usedTypes = new Set();
  const usedOps = new Set();
  for (const skill of skills) {
    const steps = Math.max(1, Math.min(3, (skill.levels || []).length));
    for (const spec of skill.types.map((t) => (typeof t === 'string' ? { t } : t))) {
      usedTypes.add(spec.t);
      for (let step = 0; step < steps; step++) {
        for (let i = 0; i < 8; i++) {
          const tag = skill.id + '/' + spec.t + '/step' + step + '/#' + i;
          const p = M.generateProblem(skill, { type: spec.t, seed: 41 + i * 31 + step * 7, difficultyStep: step, selfCheck: true });
          usedOps.add(p.math.op);
          check(Object.prototype.hasOwnProperty.call(M.MATH_SPEC, p.math.op), 'MATH_SPEC 缺少 op ' + p.math.op + ' ' + tag);
          check(M.valuesEqual(p.answer, M.answerFromMath(p)), 'MATH_SPEC 推導答案不一致 ' + tag);
        }
      }
    }
  }
  check(usedTypes.size === M.GENERATOR_TYPES.length, '課程應用到全部 GENERATOR_TYPES（' + usedTypes.size + '/' + M.GENERATOR_TYPES.length + '）');
  [...usedTypes].forEach((t) => check(M.GENERATOR_TYPES.indexOf(t) !== -1, 'GENERATOR_TYPES 缺少 ' + t));
  check(usedOps.size >= 60, '抽樣應覆蓋 60+ 個 math.op，實際 ' + usedOps.size);
})();

/* ---------------- 2. 素材清單：HTML/manifest/SW 引用的檔案都存在 ---------------- */
(() => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]);
  check(refs.length >= 10, 'index.html 應有多個外部引用');
  const localRefs = [];
  refs.forEach((ref) => {
    if (ref.startsWith('#')) return; // 頁內錨點
    if (ref.startsWith('data:')) return; // 內嵌 icon
    check(!/^(?:[a-z]+:|\/\/|\/)/i.test(ref), '資源引用必須是相對路徑：' + ref);
    check(fs.existsSync(path.join(ROOT, ref)), 'index.html 引用的檔案不存在：' + ref);
    localRefs.push(ref);
  });

  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.webmanifest'), 'utf8'));
  check(Array.isArray(manifest.icons) && manifest.icons.length >= 2, 'manifest 應有 2+ 個 icon');
  manifest.icons.forEach((icon) => {
    check(!/^(?:[a-z]+:|\/\/|\/)/i.test(icon.src), 'manifest icon 必須是相對路徑：' + icon.src);
    check(fs.existsSync(path.join(ROOT, icon.src)), 'manifest icon 不存在：' + icon.src);
  });
  if (manifest.start_url) check(manifest.start_url.indexOf('http') === -1, 'start_url 不應是絕對網址');

  const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  const cacheName = (sw.match(/const CACHE = '([^']+)'/) || [])[1];
  check(/^math-garden-v\d+$/.test(cacheName || ''), 'SW 快取名稱應為 math-garden-vN，實際 ' + cacheName);
  const assetsBlock = (sw.match(/const ASSETS = \[([\s\S]*?)\];/) || [])[1];
  check(!!assetsBlock, 'SW 應有 ASSETS 清單');
  const assets = [];
  if (assetsBlock) {
    [...assetsBlock.matchAll(/'([^']+)'/g)].forEach((m) => assets.push(m[1]));
  }
  check(assets.length >= 20, 'SW precache 應有 20+ 項，實際 ' + assets.length);
  check(new Set(assets).size === assets.length, 'SW precache 不應有重複項目');
  assets.forEach((asset) => {
    check(asset.startsWith('./'), 'SW precache 必須是相對路徑：' + asset);
    const rel = asset === './' ? '' : asset.slice(2);
    check(fs.existsSync(path.join(ROOT, rel)), 'SW precache 檔案不存在：' + asset);
  });
  localRefs.concat(manifest.icons.map((i) => i.src)).forEach((ref) => {
    check(assets.indexOf('./' + ref.replace(/^\.\//, '')) !== -1 || (ref === './' && assets.indexOf('./') !== -1),
      'SW precache 漏了 HTML/manifest 引用：' + ref);
  });
})();

/* ---------------- 3. i18n 與內容對齊 ---------------- */
(() => {
  const app = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
  const literals = new Set();
  for (const m of app.matchAll(/\bt\('([^']*)'/g)) literals.add(m[1]);
  check(literals.size >= 80, 'app.js 應有 80+ 個 t() 字面量，實際 ' + literals.size);

  const resolvePath = (dict, key) => {
    let v = dict;
    for (const part of key.split('.')) {
      v = v == null ? undefined : v[part];
    }
    return v;
  };
  const missing = [];
  literals.forEach((key) => {
    ['zh', 'en'].forEach((lang) => {
      if (key.endsWith('.')) {
        const prefix = key.slice(0, -1);
        const node = resolvePath(I18N[lang], prefix);
        if (!node || typeof node !== 'object') missing.push(lang + ':' + key);
      } else if (resolvePath(I18N[lang], key) == null) {
        missing.push(lang + ':' + key);
      }
    });
  });
  check(missing.length === 0, 'i18n 缺少字串：' + missing.join(', '));

  skills.forEach((skill) => {
    ['zh', 'en'].forEach((lang) => {
      check(skill[lang] && typeof skill[lang].name === 'string' && skill[lang].name.trim().length > 0, '技能缺名稱 ' + skill.id + '/' + lang);
      check(skill[lang] && typeof skill[lang].goal === 'string' && skill[lang].goal.trim().length > 0, '技能缺目標 ' + skill.id + '/' + lang);
    });
    check(!!skill.lesson && !!Lessons[skill.lesson], '技能缺課堂內容 ' + skill.id);
    const lesson = Lessons[skill.lesson];
    if (lesson) {
      ['zh', 'en'].forEach((lang) => {
        check(lesson[lang] && typeof lesson[lang].intro === 'string' && lesson[lang].intro.length > 0, '課堂缺 intro ' + skill.id + '/' + lang);
        check(lesson[lang] && typeof lesson[lang].example === 'string' && lesson[lang].example.length > 0, '課堂缺 example ' + skill.id + '/' + lang);
        check(lesson[lang] && typeof lesson[lang].tip === 'string' && lesson[lang].tip.length > 0, '課堂缺 tip ' + skill.id + '/' + lang);
      });
    }
  });

  const cjkHits = new Set();
  for (const skill of skills) {
    for (const spec of skill.types.map((t) => (typeof t === 'string' ? { t } : t))) {
      for (let i = 0; i < 10; i++) {
        const p = M.generateProblem(skill, { type: spec.t, seed: 701 + i * 23 });
        if (CJK.test(p.prompt.en) || CJK.test(p.hint.en)) cjkHits.add(skill.id + '/' + spec.t);
      }
    }
  }
  check(cjkHits.size === 0, '英文題幹／提示含中文：' + [...cjkHits].join(', '));
})();

/* ---------------- 4. 解題步驟覆蓋（lesson「看一步步示範」） ---------------- */
(() => {
  const DIR = { zh: I18N.zh.direction, en: I18N.en.direction };
  const CENTRE = { zh: I18N.zh.centre, en: I18N.en.centre };
  const COLORS = { zh: I18N.zh.colors, en: I18N.en.colors };
  /* 畫面上實際顯示的答案：方向／圓心／顏色題用本地化標籤，其餘用 renderValue */
  function displayed(p) {
    if (p.type === 'direction') return { zh: DIR.zh[p.answer], en: DIR.en[p.answer] };
    if (p.type === 'centre') return { zh: CENTRE.zh[p.answer], en: CENTRE.en[p.answer] };
    if (p.type === 'comparegroup') return { zh: COLORS.zh[p.answer], en: COLORS.en[p.answer] };
    const v = M.renderValue(p.answer);
    return { zh: v, en: v };
  }

  const coveredTypes = new Set();
  const nulls = new Set();
  const lastMissing = [];
  for (const skill of skills) {
    const steps = Math.max(1, Math.min(3, (skill.levels || []).length));
    for (const spec of skill.types.map((t) => (typeof t === 'string' ? { t } : t))) {
      coveredTypes.add(spec.t);
      for (let step = 0; step < steps; step++) {
        for (let i = 0; i < 6; i++) {
          const tag = skill.id + '/' + spec.t + '/step' + step;
          const p = M.generateProblem(skill, { type: spec.t, seed: 601 + i * 29 + step * 13, difficultyStep: step });
          let ex = null;
          try { ex = M.explain(p); } catch (e) { check(false, 'explain 拋錯 ' + tag + ': ' + e.message); }
          if (!ex) { nulls.add(spec.t); continue; }
          check(Array.isArray(ex.zh) && Array.isArray(ex.en) && ex.zh.length > 0 && ex.en.length > 0, '解題步驟為空 ' + tag);
          check(ex.zh.length === ex.en.length, '解題步驟中英數量不一致 ' + tag);
          ex.zh.concat(ex.en).forEach((s) => check(typeof s === 'string' && s.trim().length > 0, '解題步驟有空字串 ' + tag));
          const shown = displayed(p);
          const zLast = ex.zh[ex.zh.length - 1], eLast = ex.en[ex.en.length - 1];
          /* 英文標籤（Green/Orange/East…）在選項首字母大寫，解題句內為小寫，故英文只比對大小寫不敏感 */
          if (zLast.indexOf(shown.zh) === -1 || eLast.toLowerCase().indexOf(String(shown.en).toLowerCase()) === -1) {
            lastMissing.push(tag + ' ans=' + shown.zh + ' zh=' + zLast + ' en=' + eLast);
          }
        }
      }
    }
  }
  check(nulls.size === 0, '以下題型沒有解題步驟：' + [...nulls].join(', '));
  check(lastMissing.length === 0, '解題最後一步未包含答案（' + lastMissing.length + '）：' + lastMissing.slice(0, 8).join(' | '));
  check(coveredTypes.size === M.GENERATOR_TYPES.length, '解題覆蓋應達全部題型（' + coveredTypes.size + '/' + M.GENERATOR_TYPES.length + '）');
})();

/* ---------------- 5. 公式與技能對齊 ---------------- */
(() => {
  /* 公式一覽目前承諾覆蓋的題型；這些題型所屬的技能都必須在某個公式項目上被標記 */
  const FORMULA_SKILL_TYPES = [
    'area', 'triangle', 'perimeter', 'circle', 'arclen', 'percent', 'volume',
    'prism', 'cylinder', 'cone', 'indices', 'ap', 'gp', 'quadsolve', 'quad',
    'log', 'comb', 'binomial', 'pythagoras', 'coord', 'trig', 'prob',
    'average', 'stats', 'dispersion', 'expectation'
  ];
  check(Array.isArray(F.sections) && F.sections.length >= 5, '公式一覽應有多個分區');
  check(typeof F.title.zh === 'string' && typeof F.title.en === 'string', '公式一覽標題應雙語');
  check(typeof F.intro.zh === 'string' && typeof F.intro.en === 'string', '公式一覽簡介應雙語');

  const tagged = new Set();
  let itemCount = 0;
  F.sections.forEach((section) => {
    check(typeof section.zh === 'string' && typeof section.en === 'string', '公式分區應雙語：' + JSON.stringify(section.zh));
    check(Array.isArray(section.items) && section.items.length > 0, '公式分區應有項目：' + section.zh);
    section.items.forEach((item) => {
      itemCount++;
      check(typeof item.zh === 'string' && item.zh.trim().length > 0, '公式項目缺中文名：' + JSON.stringify(item));
      check(typeof item.en === 'string' && item.en.trim().length > 0, '公式項目缺英文名：' + item.zh);
      check(typeof item.latex === 'string' && item.latex.trim().length > 0, '公式項目缺 latex：' + item.zh);
      check(Array.isArray(item.skills) && item.skills.length > 0, '公式項目未標記技能：' + item.zh);
      (item.skills || []).forEach((id) => {
        const skill = C.skills[id];
        check(!!skill, '公式標記的技能不存在：' + item.zh + ' → ' + id);
        check(!!skill && !skill.scaffold && (skill.types || []).length > 0, '公式標記的技能不可練習：' + id);
        tagged.add(id);
      });
    });
  });
  check(itemCount >= 40, '公式一覽應有 40+ 項，實際 ' + itemCount);
  check(tagged.size >= 30, '公式應標記 30+ 個技能，實際 ' + tagged.size);

  const uncovered = skills.filter((skill) => {
    const hasFormulaType = skill.types.some((t) => FORMULA_SKILL_TYPES.indexOf(typeOf(t)) !== -1);
    return hasFormulaType && !tagged.has(skill.id);
  }).map((s) => s.id);
  check(uncovered.length === 0, '以下技能的題型已納入公式一覽但未標記：' + uncovered.join(', '));

  /* 被公式標記的技能至少出現在一個「同類題型」的項目分區（基本健全性） */
  check([...tagged].every((id) => !!C.skills[id]), '公式技能標記全部有效');
})();

console.log('✓ 契約測試全部通過（' + checks + ' 項斷言，' + skills.length + ' 個技能）');
