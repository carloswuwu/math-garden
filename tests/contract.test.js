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
const zlib = require('zlib');
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

/* Phase 5 Stage C：內容模組以 ESM（src/data/）為來源，root classic 檔案由建置生成 */
(() => {
  const names = ['i18n', 'curriculum', 'curriculum-outline', 'formulas', 'lessons'];
  names.forEach((name) => {
    const srcPath = path.join(ROOT, 'src', 'data', name + '.js');
    check(fs.existsSync(srcPath), '缺少 ESM 內容模組 src/data/' + name + '.js');
    const src = fs.readFileSync(srcPath, 'utf8');
    check(/export\s+(const|\{)/.test(src), 'src/data/' + name + '.js 應是 ESM 匯出');
    const rootPath = path.join(ROOT, name + '.js');
    check(fs.existsSync(rootPath), '缺少生成的 root classic wrapper：' + name + '.js');
    const rootSrc = fs.readFileSync(rootPath, 'utf8');
    check(rootSrc.startsWith('/* 由 tools/build.js 從 src/data/' + name + '.js 生成'), 'root ' + name + '.js 應是生成檔（含 header）');
  });

  /* Stage D：引擎 ESM 來源（rng/values/index）與生成的 UMD math-core wrapper */
  ['rng', 'values', 'facts', 'display', 'format', 'signatures', 'choices', 'generators', 'math-spec', 'explain', 'progress', 'problem', 'compose', 'index'].forEach((name) => {
    const p = path.join(ROOT, 'src', 'core', name + '.js');
    check(fs.existsSync(p), '缺少 ESM 引擎模組 src/core/' + name + '.js');
    check(/export\s+(const|\{|function|\{)/.test(fs.readFileSync(p, 'utf8')), 'src/core/' + name + '.js 應是 ESM 匯出');
  });
  const coreRoot = fs.readFileSync(path.join(ROOT, 'math-core.js'), 'utf8');
  check(coreRoot.startsWith('/* 由 tools/build.js 從 src/core/index.js 生成'), 'root math-core.js 應是生成檔（含 header）');
  check(coreRoot.indexOf('module.exports') !== -1 && coreRoot.indexOf('root.MathCore') !== -1, 'math-core.js 應保留 UMD（Node require + window.MathCore）');

  /* Stage E：UI ESM 來源（src/ui）與生成的 classic app.js wrapper */
  ['index', 'globals', 'format', 'router', 'state', 'i18n', 'selectors', 'visual', 'dom', 'a11y', 'context', 'screens', 'assessment', 'session', 'nav-state', 'modal-state', 'nav', 'chrome', 'dialog', 'sw-state', 'sw', 'keyboard'].forEach((name) => {
    const p = path.join(ROOT, 'src', 'ui', name + '.js');
    check(fs.existsSync(p), '缺少 ESM UI 模組 src/ui/' + name + '.js');
    check(/export\s/.test(fs.readFileSync(p, 'utf8')), 'src/ui/' + name + '.js 應是 ESM 匯出');
  });
  const appRoot = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
  check(appRoot.startsWith('/* 由 tools/build.js 從 src/ui/index.js 生成'), 'root app.js 應是生成檔（含 header）');
  check(appRoot.indexOf('__mathApp') !== -1, 'app.js 應保留 window.__mathApp 測試鉤子');
})();
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
    const specs = skill.types.map((t) => (typeof t === 'string' ? { t } : t));
    for (let ti = 0; ti < specs.length; ti++) {
      const spec = specs[ti];
      usedTypes.add(spec.t);
      for (let step = 0; step < steps; step++) {
        for (let i = 0; i < 8; i++) {
          const tag = skill.id + '/' + spec.t + '#' + ti + '/step' + step + '/#' + i;
          const p = M.generateProblem(skill, { typeIndex: ti, seed: 41 + i * 31 + step * 7, difficultyStep: step, selfCheck: true });
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
  /* Stage E：UI 以 src/ui ESM 為來源；root app.js 是生成物，掃描來源 */
  function readUiSources(dir) {
    let out = '';
    fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).forEach((entry) => {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) out += readUiSources(abs);
      else if (entry.name.endsWith('.js')) out += fs.readFileSync(abs, 'utf8') + '\n';
    });
    return out;
  }
  const app = readUiSources(path.join(ROOT, 'src', 'ui'));
  const literals = new Set();
  for (const m of app.matchAll(/\bt\('([^']*)'/g)) literals.add(m[1]);
  check(literals.size >= 80, 'src/ui 應有 80+ 個 t() 字面量，實際 ' + literals.size);

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
        var l = lesson[lang];
        if (l.steps !== undefined) {
          check(Array.isArray(l.steps) && l.steps.length >= 3, '課堂 steps 應為至少 3 步的陣列 ' + skill.id + '/' + lang);
          l.steps.forEach(function (st) {
            check(typeof st === 'string' && st.trim().length > 0, '課堂 steps 有空步驟 ' + skill.id + '/' + lang);
          });
        }
        if (l.mistake !== undefined) {
          check(typeof l.mistake === 'string' && l.mistake.trim().length > 0, '課堂 mistake 應為非空字串 ' + skill.id + '/' + lang);
        }
        if (l.glossary !== undefined) {
          check(Array.isArray(l.glossary) && l.glossary.length >= 2, '課堂 glossary 應為至少 2 項的陣列 ' + skill.id + '/' + lang);
          l.glossary.forEach(function (g) {
            check(g && typeof g.term === 'string' && g.term.trim().length > 0, 'glossary term 不可為空 ' + skill.id + '/' + lang);
            check(g && typeof g.def === 'string' && g.def.trim().length > 0, 'glossary def 不可為空 ' + skill.id + '/' + lang);
          });
        }
      });
      if (lesson.zh && lesson.en) {
        var zs = Array.isArray(lesson.zh.steps) ? lesson.zh.steps.length : 0;
        var es = Array.isArray(lesson.en.steps) ? lesson.en.steps.length : 0;
        check(zs === es, '課堂中英 steps 數不一致 ' + skill.id + '/' + zs + '/' + es);
      }
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

/* ---------------- 3b. 顯示格式：raw caret 必須包在 $...$ 內 ---------------- */
(() => {
  function caretOutsideMath(text) {
    return /\^/.test(String(text).replace(/\$[^$]*\$/g, ''));
  }
  const bad = [];
  const sample = [];
  for (const skill of skills) {
    for (const spec of skill.types.map((t) => (typeof t === 'string' ? { t } : t))) {
      const p = M.generateProblem(skill, { type: spec.t, seed: 9101, difficultyStep: 1 });
      [['prompt.zh', p.prompt.zh], ['prompt.en', p.prompt.en], ['hint.zh', p.hint.zh], ['hint.en', p.hint.en]].forEach(([where, text]) => {
        if (caretOutsideMath(text)) bad.push(skill.id + '/' + spec.t + '/' + where);
      });
      const ex = M.explain(p);
      if (ex) {
        ['zh', 'en'].forEach((lang) => ex[lang].forEach((st, i) => {
          if (caretOutsideMath(st)) bad.push(skill.id + '/' + spec.t + '/explain.' + lang + '#' + i);
        }));
      }
      sample.push(p);
    }
  }
  check(bad.length === 0, '題幹/提示/解題步驟仍有 $...$ 以外的 caret：' + bad.slice(0, 8).join(', '));
  check(sample.length > 100, '格式抽查應覆蓋全部題型，實際 ' + sample.length);

  check(M.formatMathText('4^3 = ?') === '$4^3$ = ?', 'formatMathText 應把 4^3 包成 $4^3$');
  check(M.formatMathText('第 n 項 = a × r^(n−1)').indexOf('$r^(n-1)$') !== -1, 'formatMathText 應處理括號次方');
  check(M.formatMathText('已有 $x^2$ 和 2^10') === '已有 $x^2$ 和 $2^10$', 'formatMathText 不應重複包裹既有 $...$');

  const lessonBad = [];
  let deepLessons = 0;
  Object.keys(Lessons).forEach((key) => {
    const entry = Lessons[key];
    if (entry && entry.zh && entry.en && Array.isArray(entry.zh.steps) && Array.isArray(entry.en.steps)) deepLessons++;
    ['zh', 'en'].forEach((lang) => {
      const l = entry[lang];
      if (!l) return;
      ['intro', 'example', 'tip', 'mistake'].forEach((field) => {
        if (typeof l[field] !== 'string') return;
        const formatted = M.formatMathText(l[field]);
        if (caretOutsideMath(formatted)) lessonBad.push(key + '/' + lang + '/' + field);
      });
      if (Array.isArray(l.steps)) {
        l.steps.forEach((st, i) => {
          if (caretOutsideMath(M.formatMathText(st))) lessonBad.push(key + '/' + lang + '/step' + i);
        });
      }
    });
  });
  check(lessonBad.length === 0, '課堂仍有 $...$ 以外的 caret：' + lessonBad.slice(0, 8).join(', '));
  check(deepLessons === Object.keys(Lessons).length, '所有課堂都應有雙語解題步驟，實際 ' + deepLessons + '/' + Object.keys(Lessons).length);
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
    const specs = skill.types.map((t) => (typeof t === 'string' ? { t } : t));
    for (let ti = 0; ti < specs.length; ti++) {
      const spec = specs[ti];
      coveredTypes.add(spec.t);
      for (let step = 0; step < steps; step++) {
        for (let i = 0; i < 6; i++) {
          const tag = skill.id + '/' + spec.t + '#' + ti + '/step' + step;
          const p = M.generateProblem(skill, { typeIndex: ti, seed: 601 + i * 29 + step * 13, difficultyStep: step });
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

  /* 深度應用題模式必須真的透過課程 ops 出現（不只是實作了函數） */
  const DEEP_OPS = ['wunit', 'wmoney2', 'wreverse', 'wprofit2', 'wratio2', 'wrate2', 'wgeo2', 'wdata2', 'wtable', 'wequation', 'wunitconv', 'wremainder', 'wpctchain', 'wthreepart'];
  const wordOps = new Set();
  for (const skill of skills) {
    if (!skill.types.some((t) => (typeof t === 'string' ? t : t.t) === 'word')) continue;
    const steps = Math.max(1, (skill.levels || []).length);
    for (let step = 0; step < steps; step++) {
      for (let i = 0; i < 160; i++) {
        wordOps.add(M.generateProblem(skill, { type: 'word', seed: 9000 + i * 13 + step * 7, difficultyStep: step }).math.op);
      }
    }
  }
  DEEP_OPS.forEach((op) => check(wordOps.has(op), '深度應用題模式未接進課程 ops：' + op));

  /* 結構多樣性：同一技能 10 題的模板數量應有提升（有足夠模板的題型） */
  const M2 = M;
  ['g6.word', 'hs.s6.word'].forEach((sid) => {
    const skill = C.skills[sid];
    if (!skill) return;
    const set = M2.composeSet(skill, 10, { seed: 1234, difficultyStep: Math.max(1, (skill.levels || []).length - 1) });
    check(set.length === 10, sid + ' composeSet 應出 10 題');
    check(new Set(set.map((p) => p.sig)).size === 10, sid + ' composeSet 不應有完全重複');
    check(new Set(set.map((p) => M2.templateSig(p))).size >= 6, sid + ' composeSet 模板多樣性不足');
  });

  /* 每個階段的綜合考試：固定 20 題、不重複、覆蓋該階多個技能 */
  C.stages.forEach((stage) => {
    const stageSkills = [];
    stage.topics.forEach((topic) => topic.skills.forEach((id) => {
      const skill = C.skills[id];
      if (skill && !skill.scaffold && (skill.types || []).length) stageSkills.push(skill);
    }));
    if (!stageSkills.length) return;
    const exam = M2.composeExam(stageSkills, 20, { seed: 4321, maxPerSkill: Math.max(3, Math.ceil(20 / stageSkills.length)) });
    check(exam.length === 20, stage.id + ' 綜合考試應出 20 題');
    check(new Set(exam.map((p) => p.sig)).size === 20, stage.id + ' 綜合考試不應有重複題');
    check(exam.every((p) => !!p.skillId), stage.id + ' 綜合考試應標記技能');
    check(new Set(exam.map((p) => p.skillId)).size >= Math.min(3, stageSkills.length), stage.id + ' 綜合考試應覆蓋多個技能');
  });
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

/* ---------------- 6. 建置產物：dist 自我一致（hash、SW 清單、體積） ---------------- */
(() => {
  const DIST = path.join(ROOT, 'dist');
  check(fs.existsSync(path.join(DIST, 'index.html')), 'dist/index.html 不存在（先執行 npm run build）');
  if (!fs.existsSync(path.join(DIST, 'index.html'))) return;

  const distIndex = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
  const buildMeta = (distIndex.match(/name="math-garden-build" content="([0-9a-f]+)"/) || [])[1];
  check(/^[0-9a-f]{12}$/.test(buildMeta || ''), 'dist/index.html 應帶 12 位 build hash meta');
  const appRef = (distIndex.match(/src="(app\.[0-9a-f]+\.js)"/) || [])[1];
  check(!!appRef, 'dist/index.html 應引用 hashed bundle');
  check(appRef === 'app.' + buildMeta + '.js', 'bundle 檔名必須等於 app.<buildHash>.js');
  check(fs.existsSync(path.join(DIST, appRef)), 'hashed bundle 不存在：' + appRef);
  check(distIndex.indexOf('src="math-core.js"') === -1 && distIndex.indexOf('src="app.js"') === -1,
    'dist/index.html 不應再引用未打包的源碼');
  check(distIndex.indexOf('vendor/katex/katex.min.js') !== -1, 'dist 應保留 KaTeX classic script');

  const distRefs = [...distIndex.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]);
  distRefs.forEach((ref) => {
    if (ref.startsWith('#') || ref.startsWith('data:')) return;
    check(!/^(?:[a-z]+:|\/\/|\/)/i.test(ref), 'dist 資源引用必須相對：' + ref);
    check(fs.existsSync(path.join(DIST, ref)), 'dist 缺少被引用的檔案：' + ref);
  });

  const swSrc = fs.readFileSync(path.join(DIST, 'sw.js'), 'utf8');
  const cacheName = (swSrc.match(/const CACHE = '([^']+)'/) || [])[1];
  check(cacheName === 'math-garden-' + buildMeta, 'SW cache 版本應由 build hash 產生，實際 ' + cacheName);
  const assetsBlock = (swSrc.match(/const ASSETS = \[([\s\S]*?)\];/) || [])[1] || '';
  const precache = [...assetsBlock.matchAll(/'([^']+)'/g)].map((m) => m[1]);
  check(precache.length >= 25, 'SW precache 應有 25+ 項，實際 ' + precache.length);
  check(new Set(precache).size === precache.length, 'SW precache 不應重複');
  const runtimeFiles = [];
  (function walk(dir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(abs);
      else runtimeFiles.push(path.relative(DIST, abs).split(path.sep).join('/'));
    });
  })(DIST);
  const expectedPrecache = runtimeFiles.filter((f) => f !== 'sw.js' && f !== '.nojekyll').sort();
  const precacheRel = precache.map((a) => a.replace(/^\.\//, ''));
  check(JSON.stringify(precacheRel) === JSON.stringify(expectedPrecache),
    'SW precache 清單應與 dist 實際檔案一致且排序（漏了：' +
    expectedPrecache.filter((f) => precacheRel.indexOf(f) === -1).join(', ') +
    '；多了：' + precacheRel.filter((f) => expectedPrecache.indexOf(f) === -1).join(', ') + '）');
  check(precache.every((a) => a.startsWith('./')), 'SW precache 必須是相對路徑');
  const fontAssets = precache.filter((a) => a.indexOf('fonts/') !== -1);
  check(fontAssets.length === 20, '應 precache 20 個 woff2 字型，實際 ' + fontAssets.length);
  check(fontAssets.every((a) => a.endsWith('.woff2')), '字型 precache 只保留 woff2');
  check(swSrc.indexOf("e.data.type === 'SKIP_WAITING'") !== -1, 'SW 應支援 SKIP_WAITING 訊息');
  check(swSrc.indexOf('Promise.allSettled') !== -1, 'SW 安裝應使用 Promise.allSettled');
  check(swSrc.indexOf("caches.match('./index.html')") !== -1, 'SW 導覽失敗應回退快取外殼');
  check(swSrc.indexOf('Response.error()') !== -1, '非導覽資源 miss 應回傳錯誤而非 HTML');
  const installBlock = (swSrc.match(/addEventListener\('install',[\s\S]*?\}\);/g) || []).join('');
  check(installBlock.indexOf('self.skipWaiting()') === -1, '安裝時不應自動 skipWaiting（更新要等使用者確認）');

  /* 體積：advisory 上限 162 KB gzip（108 課教學步驟/常見錯誤 + 8 個新課堂與視覺化） */
  const gzipBytes = zlib.gzipSync(fs.readFileSync(path.join(DIST, appRef))).length;
  check(gzipBytes <= 162 * 1024, 'bundle gzip 應 ≤ 162 KB，實際 ' + (gzipBytes / 1024).toFixed(1) + ' KB');
})();

console.log('✓ 契約測試全部通過（' + checks + ' 項斷言，' + skills.length + ' 個技能）');
