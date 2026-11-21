/*
 * 數學樂園 · Math Garden — 界面交互邏輯
 * 依賴（按加載順序）：math-core.js → i18n.js → curriculum.js → lessons.js → app.js
 */
(function () {
  'use strict';

  var MathCore = window.MathCore;
  var I18N = window.I18N;
  var Curriculum = window.Curriculum;
  var CurriculumOutline = window.CurriculumOutline;
  var Formulas = window.Formulas;
  var Lessons = window.Lessons;

  var STORE_KEY = 'mathpath.progress';
  var LEGACY_STORE_KEY = 'mathpath.progress.v1';
  var SESSION_KEY = 'mathpath.session.v1'; // 未完成的練習/測驗/考試，只存在 sessionStorage
  var SESSION_VERSION = 1;
  var SESSION_TTL = 24 * 60 * 60 * 1000; // 24 小時後不再自動恢復
  var QUIZ_LENGTH = 10;
  var EXAM_LENGTH = 20;
  var EXAM_PASS = 0.9; // 綜合考試達 90% 即可解鎖下一階段
  var HOME_ROUTE = { screen: 'home' };

  /* ---------------- 狀態 ---------------- */
  var state = {
    lang: 'zh',
    sound: true,
    theme: 'light',
    screen: 'home',
    stageId: null,
    skillId: null,
    examStage: null,
    mode: 'practice', // 'practice' | 'quiz' | 'exam'
    problems: [],
    index: 0,
    correct: 0,
    results: [],
    locked: false,
    hintShown: false,
    quizStart: 0,
    /* 進行中題組：{ mode, key }；只在真正開始/恢復題組時設定，離開作答畫面即清除。
     * 不能只用 state.mode/state.skillId 判斷，因為 renderLesson 會更新 skillId。 */
    run: null
  };

  var progress = loadProgress();
  state.lang = progress.lang || 'zh';
  state.sound = progress.sound !== false;
  state.theme = progress.theme || 'light';

  /* ---------------- DOM ---------------- */
  var $ = function (id) { return document.getElementById(id); };
  var screens = ['home', 'stage', 'lesson', 'practice', 'parent', 'settings', 'outline', 'formulas'];

  /* ---------------- 工具 ---------------- */
  function t(path, tokens) {
    var d = I18N[state.lang] || I18N.zh;
    var v = d;
    path.split('.').forEach(function (p) { v = v && v[p]; });
    if (v == null) return path;
    if (typeof v === 'string' && tokens) {
      return v.replace(/\{(\w+)\}/g, function (_, k) { return tokens[k] != null ? tokens[k] : '{' + k + '}'; });
    }
    return v;
  }
  function L(obj) { return state.lang === 'zh' ? obj.zh : obj.en; }
  function nameOf(skill) { return state.lang === 'zh' ? skill.zh.name : skill.en.name; }
  function goalOf(skill) { return state.lang === 'zh' ? skill.zh.goal : skill.en.goal; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* 文字中的 $...$ 會用 KaTeX 渲染成數學式；其餘照常轉義（無 KaTeX 時退回純文字） */
  function renderMath(text) {
    var s = String(text);
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

  function loadProgress() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      var legacy = raw ? null : localStorage.getItem(LEGACY_STORE_KEY);
      if (!raw && !legacy) return MathCore.newProgress();
      var parsed = JSON.parse(raw || legacy);
      var clean = MathCore.sanitizeProgress(parsed);
      if (!raw && legacy) {
        try { localStorage.setItem(STORE_KEY, JSON.stringify(clean)); } catch (e) { /* 忽略 */ }
      }
      return clean;
    } catch (e) { return MathCore.newProgress(); }
  }
  function saveProgress() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(progress)); } catch (e) { /* 忽略 */ }
  }

  /* ---------------- 未完成題組（sessionStorage，24 小時 TTL） ----------------
   * 只存未完成的練習/測驗/考試；完成即清除；不寫入 progress schema。 */

  function clearSession() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch (e) { /* 忽略 */ }
  }

  /* 只信任可重新驗證的題目：每題自己的答案必須能被 checkAnswer 接受 */
  function validateSession(s) {
    if (!s || typeof s !== 'object' || Array.isArray(s) || s.v !== SESSION_VERSION) return false;
    var now = Date.now();
    if (typeof s.savedAt !== 'number' || !isFinite(s.savedAt)) return false;
    if (s.savedAt > now + 60000 || now - s.savedAt > SESSION_TTL) return false;
    if (typeof s.route !== 'string') return false;
    var parsed = parseHash(s.route);
    if (!parsed || (parsed.screen !== 'practice' && parsed.screen !== 'quiz' && parsed.screen !== 'exam')) return false;
    if (s.mode !== parsed.screen) return false;
    if (parsed.screen === 'exam') {
      if (s.stageId !== parsed.stageId) return false;
    } else if (s.skillId !== parsed.skillId || s.stageId !== skillStageId(parsed.skillId)) {
      return false;
    }
    if (!Array.isArray(s.problems) || !s.problems.length || s.problems.length > 200) return false;
    if (typeof s.index !== 'number' || Math.floor(s.index) !== s.index || s.index < 0 || s.index >= s.problems.length) return false;
    if (!Array.isArray(s.results) || s.results.length > s.problems.length) return false;
    var i;
    for (i = 0; i < s.problems.length; i++) {
      var p = s.problems[i];
      if (!p || typeof p !== 'object') return false;
      if (p.answer === undefined || p.answer === null) return false;
      if (p.input) {
        if (typeof p.input !== 'string') return false;
      } else if (!Array.isArray(p.choices)) {
        return false;
      }
      if (!p.prompt || typeof p.prompt !== 'object') return false;
      var res = null;
      try { res = MathCore.checkAnswer(p, p.answer); } catch (e) { return false; }
      if (!res || !res.correct) return false;
    }
    // route 仍須通過目前解鎖規則（避免重置進度後恢復到未解鎖內容）
    var resolved = resolveRoute(parsed);
    if (!resolved || !sameRoute(resolved, parsed)) return false;
    return true;
  }

  function readSession() {
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      var s = JSON.parse(raw);
      return validateSession(s) ? s : null;
    } catch (e) { return null; }
  }

  /* 在開始 / 前進 / 恢復時寫入；完成時由 finishQuiz/finishExam 清除 */
  function saveSession() {
    if (state.screen !== 'practice') return;
    if (state.mode !== 'practice' && state.mode !== 'quiz' && state.mode !== 'exam') return;
    if (!state.problems.length || state.index >= state.problems.length) return;
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        v: SESSION_VERSION,
        route: serializeRoute(currentRoute()),
        mode: state.mode,
        stageId: state.mode === 'exam' ? state.examStage : skillStageId(state.skillId),
        skillId: state.mode === 'exam' ? null : state.skillId,
        problems: state.problems,
        index: state.index,
        correct: state.correct,
        results: state.results,
        quizStart: state.quizStart || Date.now(),
        savedAt: Date.now()
      }));
    } catch (e) { /* 私密模式 / 容量不足：不影響學習 */ }
  }

  function restoreSession(s) {
    var parsed = parseHash(s.route);
    if (!parsed) return;
    state.mode = parsed.screen;
    state.skillId = parsed.screen === 'exam' ? null : parsed.skillId;
    state.examStage = parsed.screen === 'exam' ? parsed.stageId : null;
    state.stageId = parsed.screen === 'exam' ? parsed.stageId : skillStageId(parsed.skillId);
    state.problems = s.problems;
    state.index = s.index;
    state.correct = s.correct || 0;
    state.results = Array.isArray(s.results) ? s.results : [];
    state.quizStart = s.quizStart || Date.now();
    state.locked = false;
    state.hintShown = false;
    state.run = { mode: parsed.screen, key: parsed.screen === 'exam' ? parsed.stageId : parsed.skillId };
    renderQuestion(state.problems[state.index]);
    show('practice');
    saveSession(); // 刷新 savedAt：繼續學習後再給 24 小時
  }

  /* 首頁 Continue 卡：重新驗證後恢復同一題 */
  function resumeSession() {
    var s = readSession();
    var parsed = s ? parseHash(s.route) : null;
    var route = parsed ? resolveRoute(parsed) : null;
    if (!s || !route || !sameRoute(route, parsed)) {
      clearSession();
      renderHome();
      return;
    }
    var hash = serializeRoute(route);
    writeHash(hash, false);
    nav.lastHash = hash;
    restoreSession(s);
  }

  function sessionSummary() {
    var s = readSession();
    if (!s) return null;
    var route = parseHash(s.route);
    if (!route) return null;
    var name = '';
    if (route.screen === 'exam') {
      var stage = getStage(route.stageId);
      name = stage ? L(stage) : '';
    } else {
      var skill = getSkill(route.skillId);
      name = skill ? nameOf(skill) : '';
    }
    var modeLabel = route.screen === 'quiz' ? t('quiz.title') : route.screen === 'exam' ? t('exam.title') : t('practice.title');
    return { route: route, modeLabel: modeLabel, name: name, index: s.index, total: s.problems.length };
  }

  function getSkill(id) { return Curriculum.skills[id]; }
  function getStage(id) {
    for (var i = 0; i < Curriculum.stages.length; i++) if (Curriculum.stages[i].id === id) return Curriculum.stages[i];
    return null;
  }
  function stageSkills(stage) {
    var out = [];
    stage.topics.forEach(function (topic) {
      topic.skills.forEach(function (id) {
        var s = getSkill(id);
        if (s) out.push(s);
      });
    });
    return out;
  }
  function skillProgress(id) { return progress.skills[id] || MathCore.defaultSkillProgress(); }
  function masteryOf(skill) { return MathCore.masteryStatus(progress, skill); }
  function totalStars() {
    var sum = 0;
    for (var id in progress.skills) {
      if (Curriculum.skills[id]) sum += progress.skills[id].stars || 0;
    }
    return sum;
  }

  /* 通過測驗（≧2 星）才算過關，用於逐步解鎖 */
  function isPassed(skill) { return (skillProgress(skill.id).quizStars || 0) >= 2; }
  function realStageList() {
    /* 挑戰區是額外難題區，不屬於年級解鎖鏈；由首頁的挑戰卡直接進入。 */
    return Curriculum.stages.filter(function (st) {
      if (st.id === 'challenge') return false;
      return stageSkills(st).some(function (s) { return !s.scaffold; });
    });
  }
  function stageComplete(stage) {
    var hasReal = stageSkills(stage).some(function (s) { return !s.scaffold; });
    if (!hasReal) return false;
    var ex = (progress.stageExams || {})[stage.id];
    return !!(ex && (ex.passed || ex.perfect)); // 綜合考試達 90% 即完成此階段（舊存檔的 perfect 仍相容）
  }
  function stageUnlocked(stageId) {
    if (stageId === 'challenge') return true; // 挑戰區永遠開放
    var real = realStageList();
    for (var i = 0; i < real.length; i++) {
      if (real[i].id === stageId) return i === 0 || stageComplete(real[i - 1]);
    }
    return false; // 腳手架階段暫不解鎖
  }

  /* 計算一個階段內「已解鎖 / 已通過 / 總數」的技能數（與解鎖邏輯一致） */
  function stageSkillStats(stage) {
    var total = 0, unlocked = 0, passed = 0;
    var prevMastered = true;
    var idx = 0;
    stage.topics.forEach(function (topic) {
      topic.skills.forEach(function (id) {
        var skill = getSkill(id);
        if (!skill) return;
        if (skill.scaffold) { idx++; return; }
        var locked = !prevMastered && idx > 0;
        var ms = masteryOf(skill);
        prevMastered = ms.mastered;
        total++;
        if (!locked) unlocked++;
        if (ms.mastered) passed++;
        idx++;
      });
    });
    return { total: total, unlocked: unlocked, passed: passed };
  }

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme || 'light');
  }

  /* 語言切換時同步 <html lang>，讓屏幕閱讀器用正確的語言發音 */
  function applyLang() {
    var code = state.lang === 'en' ? 'en' : 'zh-Hant-HK';
    document.documentElement.setAttribute('lang', code);
    /* 靜態 ARIA 文案（skip link、頂欄按鈕、星星標題）也跟語言切換 */
    var skip = $('skipLink');
    if (skip) skip.textContent = t('a11y.skipLink');
    [['backBtn', 'a11y.back'], ['settingsBtn', 'a11y.settings'], ['topbarStars', 'a11y.stars']].forEach(function (pair) {
      var el = $(pair[0]);
      if (el) el.setAttribute('aria-label', t(pair[1]));
    });
    var langBtn = $('langBtn');
    if (langBtn) langBtn.setAttribute('aria-label', state.lang === 'zh' ? t('a11y.languageZh') : t('a11y.languageEn'));
  }

  /* ---------------- 音效 ---------------- */
  var audioCtx = null;
  function playTone(ok) {
    if (!state.sound) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      var o = audioCtx.createOscillator();
      var g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      o.type = 'sine';
      o.frequency.value = ok ? 880 : 220;
      var now = audioCtx.currentTime;
      g.gain.setValueAtTime(0.12, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + (ok ? 0.35 : 0.22));
      o.start(now); o.stop(now + (ok ? 0.35 : 0.22));
    } catch (e) { /* 忽略 */ }
  }

  function confetti() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var box = $('confetti');
    var colors = ['#FF9500', '#34C759', '#007AFF', '#AF52DE', '#FF2D55', '#FFCC00'];
    for (var i = 0; i < 22; i++) {
      var el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.left = (Math.random() * 100) + 'vw';
      el.style.width = (6 + Math.random() * 6) + 'px';
      el.style.height = (9 + Math.random() * 10) + 'px';
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
      el.style.animationDelay = (Math.random() * 0.25) + 's';
      box.appendChild(el);
      (function (node) { setTimeout(function () { node.remove(); }, 3300); })(el);
    }
  }

  function toast(msg) {
    var el = $('toast');
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(el._timer);
    el._timer = setTimeout(function () { el.hidden = true; }, 2200);
  }

  function touchStreak() {
    var day = new Date().toDateString();
    if (progress.streak.lastDay === day) return;
    var yesterday = new Date(Date.now() - 86400000).toDateString();
    progress.streak.count = (progress.streak.lastDay === yesterday) ? (progress.streak.count + 1) : 1;
    progress.streak.lastDay = day;
    saveProgress();
  }

  /* ---------------- 視覺渲染 ---------------- */

  function dotsHTML(n, color) {
    var cls = 'dot';
    if (color === 'green') cls = 'dot green';
    else if (color === 'gray') cls = 'dot gray';
    var html = '';
    for (var i = 0; i < n; i++) html += '<i class="' + cls + '"></i>';
    return html;
  }

  function swatchColor(key) {
    return key === 'green' ? '#34C759' : '#FF9500';
  }

  function fractionSVG(n, d) {
    var size = 168, r = 72, cx = size / 2, cy = size / 2;
    var angle = (2 * Math.PI) / d;
    var start = -Math.PI / 2;
    var s = '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" xmlns="http://www.w3.org/2000/svg">';
    for (var i = 0; i < d; i++) {
      var a0 = start + i * angle, a1 = a0 + angle;
      var x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
      var x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      var large = angle > Math.PI ? 1 : 0;
      var fill = i < n ? '#FF9500' : '#E5E5EA';
      s += '<path d="M' + cx + ',' + cy + ' L' + x0.toFixed(2) + ',' + y0.toFixed(2) +
        ' A' + r + ',' + r + ' 0 ' + large + ' 1 ' + x1.toFixed(2) + ',' + y1.toFixed(2) + ' Z" fill="' + fill + '" stroke="#FFFFFF" stroke-width="2"/>';
    }
    s += '</svg>';
    return s;
  }

  /* 圖示的文字替代：屏幕閱讀器會讀出圖中表達的內容；未能描述的圖示標為裝飾性 */
  function visualAlt(visual, math) {
    var v = visual || {};
    var tpl = function (key, tokens) { return t('a11y.visual.' + key, tokens || {}); };
    switch (v.kind) {
      case 'count': return tpl('count', { n: v.n });
      case 'compare': return tpl('compare', { a: v.a, b: v.b });
      case 'counters': return tpl('counters', { a: v.a, b: v.b, op: (math && math.op) || '+' });
      case 'grid': return tpl('grid', { a: v.a, b: v.b });
      case 'fraction': return tpl('fraction', { n: v.n, d: v.d });
      case 'triangle': return tpl('triangle', { b: v.b, h: v.h });
      case 'circle': return tpl('circle', { r: v.r });
      case 'cuboid': return tpl('cuboid', { l: v.l, w: v.w, h: v.h });
      case 'plane': return tpl('plane');
      case 'rect': return tpl('rect', { l: v.l, w: v.w });
      case 'compass': return tpl('compass');
      case 'cone': return tpl('cone');
      case 'sphere': return tpl('sphere');
      case 'pie': return tpl('pie', { pct: v.pct });
      case 'cylinder': return tpl('cylinder');
      case 'symmetry': return tpl('symmetry');
      case 'righttri': return tpl('righttri');
      case 'polygon': return tpl('polygon', { n: v.n });
      case 'parallel': return tpl('parallel');
      case 'angletype': return tpl('angletype') + ' · ' + tpl('angle_' + v.kind);
      case 'quadri': return tpl('quadri');
      case 'circleang': return tpl('circleang');
      case 'clock': return tpl('clock');
      case 'numberline': return tpl('numberline');
      case 'barchart': return tpl('barchart');
      case 'percentgrid': return tpl('percentgrid', { pct: v.pct });
      case 'twotri': return tpl('twotri');
      case 'centre': return tpl('centre');
      case 'oddeven': return tpl('oddeven');
      case 'shape': return tpl('shape') + ' · ' + tpl('shape_' + v.shape);
      default: return tpl('generic');
    }
  }

  function renderVisual(container, visual, math) {
    container.innerHTML = '';
    if (!visual) {
      container.style.display = 'none';
      container.removeAttribute('role');
      container.removeAttribute('aria-label');
      container.removeAttribute('aria-hidden');
      return;
    }
    container.style.display = 'flex';
    container.setAttribute('role', 'img');
    container.setAttribute('aria-label', visualAlt(visual, math));
    container.removeAttribute('aria-hidden');
    var html = '';
    var op = math ? math.op : null;
    switch (visual.kind) {
      case 'count':
        html = '<div class="dots">' + dotsHTML(visual.n, 'orange') + '</div>';
        break;
      case 'compare': {
        var ca = visual.colorA || 'green';
        var cb = visual.colorB || 'orange';
        var colorMode = !!visual.colorA;
        var dotsOk = visual.a <= 20 && visual.b <= 20;
        var left, right;
        if (colorMode || dotsOk) {
          left = '<div class="dot-group"><div class="dots">' + dotsHTML(visual.a, ca) + '</div>' + (colorMode ? '' : '<span class="dot-label">' + visual.a + '</span>') + '</div>';
          right = '<div class="dot-group"><div class="dots">' + dotsHTML(visual.b, cb) + '</div>' + (colorMode ? '' : '<span class="dot-label">' + visual.b + '</span>') + '</div>';
        } else {
          left = '<div class="dot-group"><span class="big-num" style="color:' + swatchColor(ca) + '">' + visual.a + '</span></div>';
          right = '<div class="dot-group"><span class="big-num" style="color:' + swatchColor(cb) + '">' + visual.b + '</span></div>';
        }
        html = '<div class="compare-wrap">' + left + right + '</div>';
        break;
      }
      case 'counters':
        if (op === '−') {
          html = '<div class="dot-group"><div class="dots">' +
            dotsHTML(visual.a - visual.b, 'orange') + dotsHTML(visual.b, 'gray') +
            '</div><span class="dot-label">' + visual.a + ' − ' + visual.b + '</span></div>';
        } else {
          html = '<div class="counters-wrap">' +
            '<div class="dot-group"><div class="dots">' + dotsHTML(visual.a, 'green') + '</div><span class="dot-label">' + visual.a + '</span></div>' +
            '<span class="op-symbol">' + (op === '×' ? '×' : '+') + '</span>' +
            '<div class="dot-group"><div class="dots">' + dotsHTML(visual.b, 'orange') + '</div><span class="dot-label">' + visual.b + '</span></div>' +
            '</div>';
        }
        break;
      case 'grid':
        var cells = '';
        for (var i = 0; i < visual.a * visual.b; i++) cells += '<i class="grid-cell"></i>';
        html = '<div class="grid-wrap" style="grid-template-columns:repeat(' + visual.b + ',1fr)">' + cells + '</div>';
        break;
      case 'fraction':
        html = fractionSVG(visual.n, visual.d);
        break;
      case 'triangle':
        html = triangleSVG(visual.b, visual.h);
        break;
      case 'circle':
        html = circleSVG(visual.r);
        break;
      case 'cuboid':
        html = cuboidSVG(visual.l, visual.w, visual.h);
        break;
      case 'plane':
        html = planeSVG(visual.a, visual.b);
        break;
      case 'rect':
        html = rectSVG(visual.l, visual.w);
        break;
      case 'compass':
        html = compassSVG();
        break;
      case 'cone':
        html = coneSVG();
        break;
      case 'sphere':
        html = sphereSVG();
        break;
      case 'pie':
        html = pieSVG(visual.pct);
        break;
      case 'cylinder':
        html = cylinderSVG();
        break;
      case 'symmetry':
        html = symmetrySVG();
        break;
      case 'righttri':
        html = righttriSVG();
        break;
      case 'polygon':
        html = polygonSVG(visual.n);
        break;
      case 'parallel':
        html = parallelSVG();
        break;
      case 'angletype':
        html = angletypeSVG(visual.kind);
        break;
      case 'quadri':
        html = quadriSVG(visual.kind);
        break;
      case 'circleang':
        html = circleangSVG();
        break;
      case 'clock':
        html = clockSVG();
        break;
      case 'numberline':
        html = numberlineSVG();
        break;
      case 'barchart':
        html = barchartSVG();
        break;
      case 'percentgrid':
        html = percentgridSVG(visual.pct);
        break;
      case 'twotri':
        html = twotriSVG();
        break;
      case 'centre':
        html = centreSVG();
        break;
      case 'oddeven':
        html = oddevenSVG();
        break;
      case 'shape':
        html = shapeSVG(visual.shape);
        break;
    }
    container.innerHTML = html;
  }

  function triangleSVG(b, h) {
    var W = 300, H = 210, pad = 42;
    var s = Math.min((W - 2 * pad) / b, (H - 2 * pad) / h);
    var bw = b * s, hh = h * s;
    var x0 = pad, y0 = H - pad, x1 = x0 + bw;
    var apexX = x0 + bw * 0.35, apexY = y0 - hh;
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<polygon points="' + x0 + ',' + y0 + ' ' + x1 + ',' + y0 + ' ' + apexX + ',' + apexY + '" fill="#FFE0B2" stroke="#FF9500" stroke-width="2.5"/>' +
      '<line x1="' + apexX + '" y1="' + apexY + '" x2="' + apexX + '" y2="' + y0 + '" stroke="#007AFF" stroke-width="2" stroke-dasharray="6 4"/>' +
      '<text x="' + ((x0 + x1) / 2) + '" y="' + (y0 + 22) + '" text-anchor="middle" font-size="14" fill="#333">底 = ' + b + ' cm</text>' +
      '<text x="' + (apexX + 8) + '" y="' + ((apexY + y0) / 2) + '" font-size="14" fill="#007AFF">高 = ' + h + ' cm</text>' +
      '</svg>';
  }

  function circleSVG(r) {
    var W = 220, H = 220, cx = 110, cy = 110, rad = 78;
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + rad + '" fill="#E3F2FD" stroke="#007AFF" stroke-width="2.5"/>' +
      '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + rad) + '" y2="' + cy + '" stroke="#FF9500" stroke-width="2"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="3" fill="#333"/>' +
      '<text x="' + (cx + rad / 2) + '" y="' + (cy - 8) + '" text-anchor="middle" font-size="14" fill="#333">r = ' + r + ' cm</text>' +
      '</svg>';
  }

  function cuboidSVG(l, w, h) {
    var W = 300, H = 230, pad = 40;
    var s = Math.min((W - 2 * pad - 30) / (l + w), (H - 2 * pad - 20) / (w + h));
    var fw = w * s, fh = h * s, d = l * s * 0.55;
    var x0 = pad + d, y0 = H - pad;
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<polygon points="' + x0 + ',' + y0 + ' ' + (x0 + fw) + ',' + y0 + ' ' + (x0 + fw) + ',' + (y0 - fh) + ' ' + x0 + ',' + (y0 - fh) + '" fill="#E3F2FD" stroke="#007AFF" stroke-width="2"/>' +
      '<polygon points="' + x0 + ',' + (y0 - fh) + ' ' + (x0 + d) + ',' + (y0 - fh - d) + ' ' + (x0 + fw + d) + ',' + (y0 - fh - d) + ' ' + (x0 + fw) + ',' + (y0 - fh) + '" fill="#BBDEFB" stroke="#007AFF" stroke-width="2"/>' +
      '<polygon points="' + (x0 + fw) + ',' + y0 + ' ' + (x0 + fw + d) + ',' + (y0 - d) + ' ' + (x0 + fw + d) + ',' + (y0 - fh - d) + ' ' + (x0 + fw) + ',' + (y0 - fh) + '" fill="#90CAF9" stroke="#007AFF" stroke-width="2"/>' +
      '<text x="' + (x0 + fw / 2) + '" y="' + (y0 + 20) + '" text-anchor="middle" font-size="13" fill="#333">闊 ' + w + ' cm</text>' +
      '<text x="' + (x0 - 6) + '" y="' + (y0 - fh / 2) + '" text-anchor="end" font-size="13" fill="#333">高 ' + h + ' cm</text>' +
      '<text x="' + (x0 + fw + d / 2) + '" y="' + (y0 - fh - d - 4) + '" text-anchor="middle" font-size="13" fill="#333">長 ' + l + ' cm</text>' +
      '</svg>';
  }

  function planeSVG(a, b) {
    var maxX = Math.max(a[0], b[0], 5) + 2;
    var maxY = Math.max(a[1], b[1], 5) + 2;
    var W = 280, H = 240, pad = 34;
    var sx = (W - 2 * pad) / maxX, sy = (H - 2 * pad) / maxY;
    function px(x) { return pad + x * sx; }
    function py(y) { return H - pad - y * sy; }
    var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">';
    s += '<line x1="' + pad + '" y1="' + (H - pad) + '" x2="' + (W - pad) + '" y2="' + (H - pad) + '" stroke="#999" stroke-width="1.5"/>';
    s += '<line x1="' + pad + '" y1="' + pad + '" x2="' + pad + '" y2="' + (H - pad) + '" stroke="#999" stroke-width="1.5"/>';
    s += '<text x="' + (W - pad - 4) + '" y="' + (H - pad - 6) + '" font-size="12" fill="#666">x</text>';
    s += '<text x="' + (pad + 4) + '" y="' + (pad + 12) + '" font-size="12" fill="#666">y</text>';
    s += '<line x1="' + px(a[0]) + '" y1="' + py(a[1]) + '" x2="' + px(b[0]) + '" y2="' + py(b[1]) + '" stroke="#007AFF" stroke-width="2"/>';
    s += '<circle cx="' + px(a[0]) + '" cy="' + py(a[1]) + '" r="4" fill="#FF3B30"/>';
    s += '<text x="' + (px(a[0]) + 6) + '" y="' + (py(a[1]) + 16) + '" font-size="13" fill="#FF3B30">A(' + a[0] + ',' + a[1] + ')</text>';
    s += '<circle cx="' + px(b[0]) + '" cy="' + py(b[1]) + '" r="4" fill="#34C759"/>';
    s += '<text x="' + (px(b[0]) + 6) + '" y="' + (py(b[1]) - 8) + '" font-size="13" fill="#34C759">B(' + b[0] + ',' + b[1] + ')</text>';
    s += '</svg>';
    return s;
  }

  function rectSVG(l, w) {
    var W = 280, H = 190, pad = 44;
    var s = Math.min((W - 2 * pad) / l, (H - 2 * pad) / w);
    var bw = l * s, hh = w * s;
    var x0 = (W - bw) / 2, y0 = (H - hh) / 2;
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="' + x0 + '" y="' + y0 + '" width="' + bw + '" height="' + hh + '" fill="#E3F2FD" stroke="#007AFF" stroke-width="2.5"/>' +
      '<text x="' + (W / 2) + '" y="' + (y0 + hh + 20) + '" text-anchor="middle" font-size="14" fill="#333">長 ' + l + ' cm</text>' +
      '<text x="' + (x0 - 8) + '" y="' + (y0 + hh / 2) + '" text-anchor="end" font-size="14" fill="#333">闊 ' + w + ' cm</text>' +
      '</svg>';
  }

  function compassSVG() {
    var W = 220, H = 220, cx = 110, cy = 110, R = 86;
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="#E3F2FD" stroke="#007AFF" stroke-width="2"/>' +
      '<polygon points="' + cx + ',' + (cy - R) + ' ' + (cx - 10) + ',' + (cy - 34) + ' ' + (cx + 10) + ',' + (cy - 34) + '" fill="#FF3B30"/>' +
      '<polygon points="' + cx + ',' + (cy + R) + ' ' + (cx - 10) + ',' + (cy + 34) + ' ' + (cx + 10) + ',' + (cy + 34) + '" fill="#C7C7CC"/>' +
      '<polygon points="' + (cx - R) + ',' + cy + ' ' + (cx - 34) + ',' + (cy - 10) + ' ' + (cx - 34) + ',' + (cy + 10) + '" fill="#C7C7CC"/>' +
      '<polygon points="' + (cx + R) + ',' + cy + ' ' + (cx + 34) + ',' + (cy - 10) + ' ' + (cx + 34) + ',' + (cy + 10) + '" fill="#C7C7CC"/>' +
      '<text x="' + cx + '" y="' + (cy - R - 6) + '" text-anchor="middle" font-size="16" font-weight="bold" fill="#FF3B30">北 N</text>' +
      '<text x="' + cx + '" y="' + (cy + R + 20) + '" text-anchor="middle" font-size="14" fill="#666">南 S</text>' +
      '<text x="' + (cx - R - 10) + '" y="' + (cy + 5) + '" text-anchor="end" font-size="14" fill="#666">西 W</text>' +
      '<text x="' + (cx + R + 10) + '" y="' + (cy + 5) + '" font-size="14" fill="#666">東 E</text>' +
      '</svg>';
  }

  function coneSVG() {
    var W = 240, H = 220, cx = 120, topY = 28, baseY = 176;
    var apexX = cx, apexY = topY, bl = cx - 56, br = cx + 56;
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<line x1="' + apexX + '" y1="' + apexY + '" x2="' + bl + '" y2="' + baseY + '" stroke="#FF9500" stroke-width="2.5"/>' +
      '<line x1="' + apexX + '" y1="' + apexY + '" x2="' + br + '" y2="' + baseY + '" stroke="#FF9500" stroke-width="2.5"/>' +
      '<ellipse cx="' + cx + '" cy="' + baseY + '" rx="56" ry="15" fill="#FFE0B2" stroke="#FF9500" stroke-width="2.5"/>' +
      '<line x1="' + apexX + '" y1="' + apexY + '" x2="' + cx + '" y2="' + baseY + '" stroke="#007AFF" stroke-width="2" stroke-dasharray="6 4"/>' +
      '<text x="' + (apexX + 8) + '" y="' + ((apexY + baseY) / 2) + '" font-size="13" fill="#007AFF">高 h</text>' +
      '<text x="' + cx + '" y="' + (baseY + 32) + '" text-anchor="middle" font-size="13" fill="#333">半徑 r</text>' +
      '</svg>';
  }

  function sphereSVG() {
    var W = 200, H = 200, cx = 100, cy = 95, R = 70;
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="#E3F2FD" stroke="#007AFF" stroke-width="2.5"/>' +
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + R + '" ry="' + Math.round(R * 0.35) + '" fill="none" stroke="#007AFF" stroke-width="1.5"/>' +
      '<text x="' + cx + '" y="' + (cy - R - 8) + '" text-anchor="middle" font-size="13" fill="#333">半徑 r</text>' +
      '</svg>';
  }

  function pieSVG(pct) {
    var W = 200, H = 200, cx = 100, cy = 100, R = 80;
    var angle = pct / 100 * 360;
    var x1 = cx, y1 = cy - R;
    var rad = angle * Math.PI / 180;
    var x2 = cx + R * Math.sin(rad);
    var y2 = cy - R * Math.cos(rad);
    var large = angle > 180 ? 1 : 0;
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M ' + cx + ',' + cy + ' L ' + x1 + ',' + y1 + ' A ' + R + ',' + R + ' 0 ' + large + ' 1 ' + x2.toFixed(2) + ',' + y2.toFixed(2) + ' Z" fill="#FFB300" stroke="#007AFF" stroke-width="2"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="none" stroke="#007AFF" stroke-width="2"/>' +
      '<text x="' + cx + '" y="' + (cy + R + 20) + '" text-anchor="middle" font-size="15" font-weight="bold" fill="#333">' + pct + '%</text>' +
      '</svg>';
  }

  function cylinderSVG() {
    var W = 200, H = 240, cx = 100, topY = 52, bottomY = 190, rx = 46, ry = 15;
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<ellipse cx="' + cx + '" cy="' + bottomY + '" rx="' + rx + '" ry="' + ry + '" fill="#BBDEFB" stroke="#007AFF" stroke-width="2"/>' +
      '<rect x="' + (cx - rx) + '" y="' + topY + '" width="' + (2 * rx) + '" height="' + (bottomY - topY) + '" fill="#E3F2FD" stroke="#007AFF" stroke-width="2"/>' +
      '<ellipse cx="' + cx + '" cy="' + topY + '" rx="' + rx + '" ry="' + ry + '" fill="#E3F2FD" stroke="#007AFF" stroke-width="2"/>' +
      '<text x="' + (cx - rx - 8) + '" y="' + ((topY + bottomY) / 2) + '" text-anchor="end" font-size="13" fill="#333">高 h</text>' +
      '<text x="' + (cx + rx + 8) + '" y="' + (topY + 4) + '" font-size="13" fill="#333">r</text>' +
      '</svg>';
  }

  function symmetrySVG() {
    var W = 220, H = 220, cx = 110, cy = 110, s = 72;
    var x0 = cx - s, y0 = cy - s, x1 = cx + s, y1 = cy + s;
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="' + x0 + '" y="' + y0 + '" width="' + (2 * s) + '" height="' + (2 * s) + '" fill="#FFF9C4" stroke="#FFB300" stroke-width="2.5"/>' +
      '<line x1="' + cx + '" y1="' + y0 + '" x2="' + cx + '" y2="' + y1 + '" stroke="#007AFF" stroke-width="1.5" stroke-dasharray="6 4"/>' +
      '<line x1="' + x0 + '" y1="' + cy + '" x2="' + x1 + '" y2="' + cy + '" stroke="#007AFF" stroke-width="1.5" stroke-dasharray="6 4"/>' +
      '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x1 + '" y2="' + y1 + '" stroke="#FF3B30" stroke-width="1.5" stroke-dasharray="6 4"/>' +
      '<line x1="' + x1 + '" y1="' + y0 + '" x2="' + x0 + '" y2="' + y1 + '" stroke="#FF3B30" stroke-width="1.5" stroke-dasharray="6 4"/>' +
      '</svg>';
  }

  function righttriSVG() {
    var W = 260, H = 210, x0 = 40, y0 = 182, x1 = 230, y1 = 182, x2 = 40, y2 = 52;
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<polygon points="' + x0 + ',' + y0 + ' ' + x1 + ',' + y1 + ' ' + x2 + ',' + y2 + '" fill="#E3F2FD" stroke="#007AFF" stroke-width="2.5"/>' +
      '<path d="M ' + (x0 + 20) + ',' + y0 + ' L ' + (x0 + 20) + ',' + (y0 - 20) + ' L ' + x0 + ',' + (y0 - 20) + '" fill="none" stroke="#FF9500" stroke-width="2"/>' +
      '<text x="' + ((x0 + x1) / 2) + '" y="' + (y0 + 20) + '" text-anchor="middle" font-size="14" fill="#333">a</text>' +
      '<text x="' + (x0 - 14) + '" y="' + ((y0 + y2) / 2) + '" text-anchor="end" font-size="14" fill="#333">b</text>' +
      '<text x="' + ((x1 + x2) / 2 + 12) + '" y="' + ((y0 + y2) / 2 - 8) + '" font-size="14" fill="#FF3B30">c</text>' +
      '</svg>';
  }

  function polygonSVG(n) {
    var W = 220, H = 210, cx = 110, cy = 100, R = 82;
    var pts = [];
    for (var i = 0; i < n; i++) {
      var ang = -Math.PI / 2 + i * 2 * Math.PI / n;
      pts.push((cx + R * Math.cos(ang)).toFixed(1) + ',' + (cy + R * Math.sin(ang)).toFixed(1));
    }
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<polygon points="' + pts.join(' ') + '" fill="#FFE0B2" stroke="#FF9500" stroke-width="2.5"/>' +
      '<text x="' + cx + '" y="' + (cy + 6) + '" text-anchor="middle" font-size="14" fill="#333">' + n + ' 邊形</text>' +
      '</svg>';
  }

  function parallelSVG() {
    var W = 260, H = 200, x0 = 40, x1 = 220;
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<line x1="' + x0 + '" y1="55" x2="' + x1 + '" y2="55" stroke="#007AFF" stroke-width="3"/>' +
      '<line x1="' + x0 + '" y1="150" x2="' + x1 + '" y2="150" stroke="#007AFF" stroke-width="3"/>' +
      '<line x1="60" y1="25" x2="210" y2="180" stroke="#FF3B30" stroke-width="2.5"/>' +
      '<text x="' + (x1 - 8) + '" y="46" text-anchor="end" font-size="13" fill="#007AFF">L1</text>' +
      '<text x="' + (x1 - 8) + '" y="172" text-anchor="end" font-size="13" fill="#007AFF">L2</text>' +
      '<text x="205" y="185" font-size="13" fill="#FF3B30">截線</text>' +
      '</svg>';
  }

  function angletypeSVG(kind) {
    var W = 220, H = 180, x0 = 60, y0 = 140;
    var a2 = kind === 'acute' ? 30 : kind === 'right' ? 90 : 120;
    var rad = a2 * Math.PI / 180;
    var x1 = x0 + 130, y1 = y0;
    var x2 = x0 + 130 * Math.cos(rad), y2 = y0 - 130 * Math.sin(rad);
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x1 + '" y2="' + y1 + '" stroke="#007AFF" stroke-width="3"/>' +
      '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="#007AFF" stroke-width="3"/>' +
      '<path d="M ' + (x0 + 28) + ',' + y0 + ' A 28,28 0 0 ' + (a2 > 90 ? 1 : 0) + ' ' + (x0 + 28 * Math.cos(rad)).toFixed(1) + ',' + (y0 - 28 * Math.sin(rad)).toFixed(1) + '" fill="none" stroke="#FF9500" stroke-width="2"/>' +
      '<text x="' + x0 + '" y="' + (y0 + 20) + '" text-anchor="middle" font-size="14" fill="#333">' + a2 + '°</text>' +
      '</svg>';
  }

  function quadriSVG(kind) {
    var W = 240, H = 180;
    if (kind === 'trap') {
      return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
        '<polygon points="70,40 180,40 210,140 40,140" fill="#E3F2FD" stroke="#007AFF" stroke-width="2.5"/>' +
        '<text x="120" y="165" text-anchor="middle" font-size="13" fill="#333">梯形</text></svg>';
    }
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<polygon points="60,40 200,40 160,140 20,140" fill="#E3F2FD" stroke="#007AFF" stroke-width="2.5"/>' +
      '<text x="110" y="165" text-anchor="middle" font-size="13" fill="#333">平行四邊形</text></svg>';
  }

  function circleangSVG() {
    var W = 220, H = 220, cx = 110, cy = 110, R = 80;
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="none" stroke="#007AFF" stroke-width="2.5"/>' +
      '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + R) + '" y2="' + cy + '" stroke="#FF3B30" stroke-width="2"/>' +
      '<line x1="' + cx + '" y1="' + cy + '" x2="' + cx + '" y2="' + (cy - R) + '" stroke="#FF3B30" stroke-width="2"/>' +
      '<path d="M ' + (cx + 24) + ',' + cy + ' A 24,24 0 0 0 ' + cx + ',' + (cy - 24) + '" fill="none" stroke="#FF9500" stroke-width="2"/>' +
      '<text x="' + (cx + 34) + '" y="' + (cy - 18) + '" font-size="13" fill="#333">圓心角</text>' +
      '<text x="' + (cx + R) + '" y="' + (cy - R + 14) + '" font-size="13" fill="#FF3B30">圓周角</text>' +
      '</svg>';
  }

  function clockSVG() {
    var W = 200, H = 200, cx = 100, cy = 100, R = 78;
    var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="#fff" stroke="#007AFF" stroke-width="3"/>';
    for (var i = 0; i < 12; i++) {
      var a = i * 30 * Math.PI / 180;
      s += '<line x1="' + (cx + (R - 10) * Math.sin(a)).toFixed(1) + '" y1="' + (cy - (R - 10) * Math.cos(a)).toFixed(1) + '" x2="' + (cx + (R - 16) * Math.sin(a)).toFixed(1) + '" y2="' + (cy - (R - 16) * Math.cos(a)).toFixed(1) + '" stroke="#666" stroke-width="2"/>';
    }
    s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + cx + '" y2="' + (cy - R + 30) + '" stroke="#333" stroke-width="3"/>';
    s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + R - 34) + '" y2="' + cy + '" stroke="#333" stroke-width="3"/>';
    s += '<text x="' + cx + '" y="' + (cy - R - 6) + '" text-anchor="middle" font-size="13" fill="#333">12</text>' +
      '<text x="' + (cx + R - 8) + '" y="' + (cy + 5) + '" text-anchor="middle" font-size="12" fill="#333">3</text>' +
      '<text x="' + cx + '" y="' + (cy + R + 18) + '" text-anchor="middle" font-size="12" fill="#333">6</text>' +
      '<text x="' + (cx - R + 8) + '" y="' + (cy + 5) + '" text-anchor="middle" font-size="12" fill="#333">9</text>';
    s += '</svg>';
    return s;
  }

  function numberlineSVG() {
    var W = 280, H = 90, y = 45, x0 = 20, x1 = 260;
    var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<line x1="' + x0 + '" y1="' + y + '" x2="' + x1 + '" y2="' + y + '" stroke="#333" stroke-width="2"/>' +
      '<polygon points="' + (x1 + 6) + ',' + y + ' ' + (x1 - 2) + ',' + (y - 5) + ' ' + (x1 - 2) + ',' + (y + 5) + '" fill="#333"/>';
    for (var v = -5; v <= 5; v++) {
      var px = 140 + v * 22;
      s += '<line x1="' + px + '" y1="' + (y - 5) + '" x2="' + px + '" y2="' + (y + 5) + '" stroke="#333" stroke-width="1.5"/>' +
        '<text x="' + px + '" y="' + (y + 22) + '" text-anchor="middle" font-size="11" fill="#333">' + v + '</text>';
    }
    s += '</svg>';
    return s;
  }

  function barchartSVG() {
    var W = 220, H = 170, x0 = 40, y0 = 140;
    var vals = [3, 5, 2, 6, 4];
    var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + (W - 15) + '" y2="' + y0 + '" stroke="#333" stroke-width="2"/>' +
      '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x0 + '" y2="' + 15 + '" stroke="#333" stroke-width="2"/>';
    for (var i = 0; i < vals.length; i++) {
      var bw = 24, bh = vals[i] * 18;
      var bx = x0 + 8 + i * 34;
      s += '<rect x="' + bx + '" y="' + (y0 - bh) + '" width="' + bw + '" height="' + bh + '" fill="' + (i % 2 ? '#FF9500' : '#007AFF') + '"/>';
    }
    s += '</svg>';
    return s;
  }

  function percentgridSVG(pct) {
    var W = 220, H = 220, x0 = 30, y0 = 30, cell = 16, gap = 1;
    var filled = Math.round(pct); // pct 即已塗格數（0–100）
    var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">';
    for (var i = 0; i < 100; i++) {
      var r = Math.floor(i / 10), c = i % 10;
      var fill = i < filled ? '#FF9500' : '#E3F2FD';
      s += '<rect x="' + (x0 + c * (cell + gap)) + '" y="' + (y0 + r * (cell + gap)) + '" width="' + cell + '" height="' + cell + '" fill="' + fill + '" stroke="#007AFF" stroke-width="0.5"/>';
    }
    s += '<text x="' + (x0 + 5 * (cell + gap)) + '" y="' + (y0 + 10 * (cell + gap) + 18) + '" text-anchor="middle" font-size="14" fill="#333">' + pct + '%</text>';
    s += '</svg>';
    return s;
  }

  function twotriSVG() {
    var W = 240, H = 190;
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<polygon points="30,160 90,160 60,90" fill="#E3F2FD" stroke="#007AFF" stroke-width="2.5"/>' +
      '<polygon points="150,160 230,160 190,70" fill="#FFE0B2" stroke="#FF9500" stroke-width="2.5"/>' +
      '<text x="60" y="180" text-anchor="middle" font-size="12" fill="#333">△1</text>' +
      '<text x="190" y="180" text-anchor="middle" font-size="12" fill="#333">△2</text>' +
      '</svg>';
  }

  function centreSVG() {
    var W = 220, H = 200, cx = 110;
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<polygon points="110,30 200,170 20,170" fill="#E3F2FD" stroke="#007AFF" stroke-width="2.5"/>' +
      '<line x1="110" y1="30" x2="110" y2="170" stroke="#FF9500" stroke-width="1.5" stroke-dasharray="5 4"/>' +
      '<line x1="200" y1="170" x2="65" y2="100" stroke="#34C759" stroke-width="1.5" stroke-dasharray="5 4"/>' +
      '<line x1="20" y1="170" x2="155" y2="100" stroke="#FF3B30" stroke-width="1.5" stroke-dasharray="5 4"/>' +
      '<circle cx="110" cy="123" r="4" fill="#FF3B30"/>' +
      '<text x="110" y="143" text-anchor="middle" font-size="12" fill="#FF3B30">心</text>' +
      '</svg>';
  }

  function oddevenSVG() {
    var W = 240, H = 140;
    var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">';
    for (var r = 0; r < 2; r++) {
      for (var c = 0; c < 5; c++) {
        s += '<circle cx="' + (40 + c * 40) + '" cy="' + (40 + r * 40) + '" r="12" fill="' + ((r * 5 + c) % 2 ? '#FF9500' : '#007AFF') + '"/>';
      }
    }
    s += '</svg>';
    return s;
  }

  function shapeSVG(kind) {
    var W = 220, H = 180;
    if (kind === 'cube') {
      return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
        '<polygon points="80,40 180,40 180,140 80,140" fill="#E3F2FD" stroke="#007AFF" stroke-width="2"/>' +
        '<polygon points="80,40 120,20 220,20 180,40" fill="#BBDEFB" stroke="#007AFF" stroke-width="2"/>' +
        '<polygon points="180,40 220,20 220,120 180,140" fill="#90CAF9" stroke="#007AFF" stroke-width="2"/>' +
        '<text x="150" y="165" text-anchor="middle" font-size="13" fill="#333">正方體</text></svg>';
    }
    if (kind === 'square') {
      return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
        '<rect x="50" y="30" width="120" height="120" fill="#FFE0B2" stroke="#FF9500" stroke-width="2.5"/>' +
        '<text x="110" y="170" text-anchor="middle" font-size="13" fill="#333">正方形</text></svg>';
    }
    if (kind === 'triangle') {
      return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
        '<polygon points="110,30 190,150 30,150" fill="#FFE0B2" stroke="#FF9500" stroke-width="2.5"/>' +
        '<text x="110" y="172" text-anchor="middle" font-size="13" fill="#333">三角形</text></svg>';
    }
    return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="60" y="40" width="100" height="80" fill="#E3F2FD" stroke="#007AFF" stroke-width="2.5"/>' +
      '<text x="110" y="145" text-anchor="middle" font-size="13" fill="#333">長方形</text></svg>';
  }

  /* ---------------- 路由（純函數）與導航 ---------------- */

  /* 純函數：把 location.hash 解析為 route；無法辨識時回傳 null。
   * 只接受 #/... 片段；skip link 之類的錨點（#main）不是路由。 */
  function parseHash(hash) {
    if (typeof hash !== 'string' || hash.length > 256) return null;
    var m = /^#\/([a-z]+)(?:\/([A-Za-z0-9._-]+))?$/.exec(hash);
    if (!m) return null;
    var screen = m[1];
    var param = m[2] || null;
    if (screen === 'home' || screen === 'parent' || screen === 'settings' || screen === 'outline' || screen === 'formulas') {
      return param ? null : { screen: screen };
    }
    if (screen === 'stage' || screen === 'exam') return param ? { screen: screen, stageId: param } : null;
    if (screen === 'lesson' || screen === 'practice' || screen === 'quiz') return param ? { screen: screen, skillId: param } : null;
    return null;
  }

  /* 純函數：route → 規範化 hash（無法辨識的 route 一律回 #/home） */
  function serializeRoute(route) {
    if (!route || typeof route !== 'object') return '#/home';
    var screen = route.screen;
    if (screen === 'stage' || screen === 'exam') return route.stageId ? '#/' + screen + '/' + route.stageId : '#/home';
    if (screen === 'lesson' || screen === 'practice' || screen === 'quiz') return route.skillId ? '#/' + screen + '/' + route.skillId : '#/home';
    if (screen === 'home' || screen === 'parent' || screen === 'settings' || screen === 'outline' || screen === 'formulas') return '#/' + screen;
    return '#/home';
  }

  function sameRoute(a, b) { return serializeRoute(a) === serializeRoute(b); }

  /* 當前 state → route（未驗證；驗證交給 resolveRoute） */
  function currentRoute() {
    switch (state.screen) {
      case 'stage': return state.stageId ? { screen: 'stage', stageId: state.stageId } : { screen: 'home' };
      case 'lesson': return state.skillId ? { screen: 'lesson', skillId: state.skillId } : { screen: 'home' };
      case 'practice':
        if (state.mode === 'exam') return state.examStage ? { screen: 'exam', stageId: state.examStage } : { screen: 'home' };
        if (!state.skillId) return { screen: 'home' };
        return { screen: state.mode === 'quiz' ? 'quiz' : 'practice', skillId: state.skillId };
      case 'parent': case 'settings': case 'outline': case 'formulas': return { screen: state.screen };
      default: return { screen: 'home' };
    }
  }

  function skillStageId(skillId) {
    var skill = getSkill(skillId);
    return skill && getStage(skill.stage) ? skill.stage : null;
  }

  /* 上一層畫面：頂欄返回鍵用它；它同時是失效 route 的最近合法祖先 */
  function parentOf(route) {
    route = route || currentRoute();
    switch (route.screen) {
      case 'stage': return { screen: 'home' };
      case 'lesson': {
        var stageId = skillStageId(route.skillId);
        return stageId ? { screen: 'stage', stageId: stageId } : { screen: 'home' };
      }
      case 'practice': case 'quiz':
        return route.skillId ? { screen: 'lesson', skillId: route.skillId } : { screen: 'home' };
      case 'exam': return route.stageId ? { screen: 'stage', stageId: route.stageId } : { screen: 'home' };
      case 'home': return null;
      default: return { screen: 'home' };
    }
  }

  function isRealStage(stage) {
    return stageSkills(stage).some(function (s) { return !s.scaffold; });
  }
  function stageHasExam(stage) {
    return stageSkills(stage).some(function (s) { return !s.scaffold && s.types && s.types.length; });
  }

  /* 技能在階段內是否仍被順序解鎖規則擋住（與 renderStage 的 prevMastered 規則一致） */
  function skillLockedInStage(skill) {
    if (skill.stage === 'challenge') return false; // 挑戰技能全部開放
    var stage = getStage(skill.stage);
    if (!stage) return true;
    var prevMastered = true;
    var idx = 0;
    var found = false;
    var locked = true;
    stage.topics.forEach(function (topic) {
      topic.skills.forEach(function (id) {
        var s = getSkill(id);
        if (!s) { idx++; return; }
        var isLocked = !prevMastered && idx > 0;
        if (id === skill.id) { found = true; locked = isLocked; }
        prevMastered = masteryOf(s).mastered || s.scaffold;
        idx++;
      });
    });
    return found ? locked : true;
  }

  /* 驗證 route：未知 → home；階段/技能未解鎖 → 最近合法祖先（含 home） */
  function resolveRoute(route) {
    if (!route || typeof route !== 'object') return null;
    switch (route.screen) {
      case 'home': return { screen: 'home' };
      case 'parent': case 'settings': case 'outline': case 'formulas': return { screen: route.screen };
      case 'stage': {
        var stage = getStage(route.stageId);
        if (!stage || !isRealStage(stage) || !stageUnlocked(stage.id)) return { screen: 'home' };
        return { screen: 'stage', stageId: stage.id };
      }
      case 'exam': {
        var examStage = getStage(route.stageId);
        if (!examStage || !stageUnlocked(examStage.id) || !stageHasExam(examStage)) return { screen: 'home' };
        return { screen: 'exam', stageId: examStage.id };
      }
      case 'lesson': case 'practice': case 'quiz': {
        var skill = getSkill(route.skillId);
        if (!skill || skill.scaffold) return { screen: 'home' };
        var skillStage = getStage(skill.stage);
        if (!skillStage || !isRealStage(skillStage) || !stageUnlocked(skillStage.id)) return { screen: 'home' };
        if (skillLockedInStage(skill)) return { screen: 'stage', stageId: skillStage.id };
        return { screen: route.screen, skillId: skill.id };
      }
    }
    return { screen: 'home' };
  }

  /* lastHash 用於去重：popstate 與 hashchange 會成對觸發；重新渲染不應寫歷史 */
  var nav = { lastHash: null };

  function writeHash(hash, replace) {
    if (location.hash === hash) return;
    try {
      if (replace) history.replaceState({ mathpath: hash }, '', hash);
      else history.pushState({ mathpath: hash }, '', hash);
    } catch (e) {
      /* file:// 或受限環境：退回直接改 hash；觸發的 hashchange 由 lastHash 去重 */
      try { location.hash = hash; } catch (e2) { /* 忽略 */ }
    }
  }

  /* show() 是唯一的「畫面已切換」出口：同步 hash（重新渲染用 replace）、
   * 更新頂欄、把焦點移到畫面標題，並透過 #announcer 宣告。 */
  function show(screen) {
    state.screen = screen;
    if (screen !== 'practice') state.run = null;
    screens.forEach(function (s) { $('screen-' + s).hidden = (s !== screen); });
    try { window.scrollTo(0, 0); } catch (e) { /* jsdom 無此實現 */ }
    updateTopbar();

    var hash = serializeRoute(currentRoute());
    if (hash !== nav.lastHash) {
      var changed = nav.lastHash !== null;
      writeHash(hash, !changed); // 首次渲染/重繪用 replace，真正的畫面切換才 push
      nav.lastHash = hash;
    }

    /* 導航後把焦點移到畫面標題，並透過 live region 宣告，避免焦點掉到 body */
    var current = $('screen-' + screen);
    var heading = current && current.querySelector('h1, .page-title');
    if (current && heading) {
      if (!heading.id) heading.id = 'screen-' + screen + '-title';
      current.setAttribute('aria-labelledby', heading.id);
      if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
      try { heading.focus({ preventScroll: true }); } catch (e) { try { heading.focus(); } catch (e2) { /* 忽略 */ } }
    }
    var announcer = $('announcer');
    if (announcer) announcer.textContent = ($('topbarTitle') || {}).textContent || '';
  }

  function updateTopbar() {
    var back = $('backBtn');
    var onHome = state.screen === 'home';
    back.hidden = onHome;
    $('langBtn').textContent = state.lang === 'zh' ? 'EN' : '繁體';
    $('langBtn').setAttribute('aria-label', state.lang === 'zh' ? t('a11y.languageZh') : t('a11y.languageEn'));
    $('topbarStars').textContent = '⭐ ' + totalStars();

    var title = '';
    switch (state.screen) {
      case 'home': title = t('appName'); break;
      case 'stage': title = L(getStage(state.stageId)); break;
      case 'lesson': title = nameOf(getSkill(state.skillId)); break;
      case 'practice':
        title = state.mode === 'exam' ? t('exam.title') : state.mode === 'quiz' ? t('quiz.title') : t('practice.title');
        break;
      case 'parent': title = t('parent.title'); break;
      case 'settings': title = t('settings.title'); break;
      case 'outline': title = t('outline.title'); break;
      case 'formulas': title = t('formulas.title'); break;
    }
    $('topbarTitle').textContent = title;
  }

  /* 程式化導航：驗證 → 寫歷史 → 渲染。所有點擊入口最終都走這裡或 show()。 */
  function navigate(route, opts) {
    opts = opts || {};
    var target;
    try { target = resolveRoute(route) || { screen: 'home' }; }
    catch (e) { target = { screen: 'home' }; } // 驗證本身出錯：交給渲染階段的錯誤邊界處理
    var hash = serializeRoute(target);
    writeHash(hash, !!opts.replace);
    nav.lastHash = hash;
    renderRouteSafely(target);
  }

  /* 瀏覽器 Back/Forward 或手動改 hash */
  function onLocationChange() {
    var hash = location.hash || '';
    if (hash === nav.lastHash) return; // 同一事件已成對觸發，或畫面已同步
    if (hash && hash.charAt(1) !== '/') {
      /* 非路由錨點（例如 skip link 的 #main）：保留畫面，只把 hash 換回目前 route，
       * 避免多一筆會讓 Back 看起來「沒有反應」的歷史。 */
      var keep = nav.lastHash || serializeRoute(currentRoute());
      try { history.replaceState({ mathpath: keep }, '', keep); } catch (e) { /* 忽略 */ }
      return;
    }
    if (!hash) { navigate(HOME_ROUTE, { replace: true }); return; }
    var target;
    try {
      var parsed = parseHash(hash);
      target = parsed ? (resolveRoute(parsed) || { screen: 'home' }) : { screen: 'home' };
    } catch (err) { renderError(err); return; }
    var canonical = serializeRoute(target);
    nav.lastHash = canonical;
    if (canonical !== hash) writeHash(canonical, true); // 失效/未解鎖 route 直接換成合法祖先
    if (modalState.open) closeModal({ restore: false }); // Back/Forward 時收起對話框
    renderRouteSafely(target);
  }

  function renderRoute(route) {
    switch (route.screen) {
      case 'home': return renderHome();
      case 'stage': return renderStage(route.stageId);
      case 'lesson': return renderLesson(route.skillId);
      case 'practice': case 'quiz': case 'exam': return renderAssessmentRoute(route);
      case 'parent': return renderParent();
      case 'settings': return renderSettings();
      case 'outline': return renderOutline();
      case 'formulas': return renderFormulas();
    }
    return renderHome();
  }

  /* 複習/測驗/考試 route：state 仍對應同一題組就重繪當前題（語言切換、Back/Forward），
   * 否則（含已完成）重新開始；未完成 session 的恢復在 init / Continue 卡處理。 */
  function renderAssessmentRoute(route) {
    var mode = route.screen;
    var key = mode === 'exam' ? route.stageId : route.skillId;
    var sameRun = !!(state.run && state.run.mode === mode && state.run.key === key && state.problems.length > 0);
    if (sameRun && state.index >= state.problems.length) {
      // 已完成的題組：保留結果卡（從別的畫面 Back 回來時只切換顯示）
      if (state.screen !== 'practice') show('practice');
      return;
    }
    if (sameRun) {
      renderQuestion(state.problems[state.index]);
      if (state.screen !== 'practice') show('practice');
      else updateTopbar();
      return;
    }
    if (mode === 'practice') return startPractice(key);
    if (mode === 'quiz') return startQuiz(key);
    return renderGradeExam(key);
  }

  function renderRouteSafely(route) {
    try { renderRoute(route); }
    catch (err) { renderError(err); }
  }

  /* 錯誤邊界：畫面渲染失敗時給可恢復的卡片，先保住進度（匯出）再回首頁 */
  function renderError(err) {
    try { if (window.console && window.console.error) window.console.error(err); } catch (e) { /* 忽略 */ }
    var box = $('screen-home');
    if (!box) return;
    box.innerHTML = '<div class="result-card"><div class="big">⚠️</div>' +
      '<h1>' + t('error.title') + '</h1>' +
      '<p class="page-sub">' + t('error.body') + '</p>' +
      '<div class="result-actions">' +
      '<button class="btn secondary" id="errorExport" type="button">📤 ' + t('error.export') + '</button>' +
      '<button class="btn" id="errorHome" type="button">' + t('error.home') + '</button>' +
      '</div></div>';
    var exportBtn = $('errorExport');
    if (exportBtn) exportBtn.addEventListener('click', function () { exportProgress(); });
    var homeBtn = $('errorHome');
    if (homeBtn) homeBtn.addEventListener('click', function () { navigate(HOME_ROUTE); });
    try { show('home'); } catch (e) { /* 忽略 */ }
    var announcer = $('announcer');
    if (announcer) announcer.textContent = t('error.title');
  }

  function back() {
    var parent = parentOf(currentRoute());
    navigate(parent || HOME_ROUTE);
  }

  /* ---------------- 首頁 ---------------- */

  function renderHome() {
    var realStages = realStageList();
    var unlockedCount = 0;
    var session = sessionSummary();
    var html = '<h1 class="page-title">' + t('home.title') + '</h1>' +
      '<p class="page-sub">' + t('home.subtitle') + '</p>';
    if (session) {
      html += '<button class="continue-card" id="homeContinue" type="button">' +
        '<span class="continue-emoji" aria-hidden="true">▶️</span>' +
        '<span class="continue-body">' +
        '<span class="continue-title">' + t('home.continue') + ' · ' + session.modeLabel + '</span>' +
        '<span class="continue-sub">' + esc(session.name) + ' · ' + t('practice.question', { i: session.index + 1, n: session.total }) + '</span>' +
        '</span></button>';
    }
    var challengeStage = getStage('challenge');
    if (challengeStage) {
      var chTotal = 0, chPassed = 0;
      stageSkills(challengeStage).forEach(function (sk) { chTotal++; if (masteryOf(sk).mastered) chPassed++; });
      html += '<button class="challenge-card" id="homeChallengeBtn" type="button">' +
        '<span class="challenge-emoji" aria-hidden="true">' + challengeStage.emoji + '</span>' +
        '<span class="challenge-body">' +
        '<span class="challenge-title">' + t('challenge.title') + '</span>' +
        '<span class="challenge-sub">' + t('challenge.desc') + '</span>' +
        '<span class="challenge-count">' + t('challenge.progress', { m: chPassed, t: chTotal }) + '</span>' +
        '</span>' +
        '<span class="challenge-arrow" aria-hidden="true">→</span></button>';
    }
    html += '<div class="stage-grid">';
    realStages.forEach(function (stage) {
      if (!stageUnlocked(stage.id)) return; // 未解鎖的階段不顯示
      unlockedCount++;
      var stats = stageSkillStats(stage);
      html += '<button class="stage-card" type="button" data-stage="' + stage.id + '">' +
        '<span class="emoji">' + stage.emoji + '</span>' +
        '<span class="name">' + L(stage) + '</span>' +
        '<span class="desc">' + L(stage.desc) + '</span>' +
        '<span class="stage-count">' + t('home.stageCount', { u: stats.unlocked, t: stats.total }) + '</span>' +
        '</button>';
    });
    html += '</div>' +
      '<p class="page-sub" style="margin-top:14px;font-size:13px">' + t('home.unlocked', { u: unlockedCount, t: realStages.length }) + '</p>' +
      '<p class="page-sub" style="font-size:13px;margin-bottom:14px">' + t('home.nextHint') + '</p>' +
      '<button class="btn secondary big" id="homeFormulasBtn" type="button" style="margin-bottom:10px">📐 ' + t('formulas.title') + '</button>' +
      '<button class="btn secondary big" id="homeOutlineBtn" type="button" style="margin-bottom:10px">📚 ' + t('outline.title') + '</button>' +
      '<button class="btn secondary big" id="homeParentBtn" type="button">👨‍👩‍👦 ' + t('home.parent') + '</button>';

    $('screen-home').innerHTML = html;

    $('screen-home').querySelectorAll('.stage-card').forEach(function (el) {
      el.addEventListener('click', function () { navigate({ screen: 'stage', stageId: el.getAttribute('data-stage') }); });
    });
    $('homeFormulasBtn').addEventListener('click', function () { navigate({ screen: 'formulas' }); });
    $('homeOutlineBtn').addEventListener('click', function () { navigate({ screen: 'outline' }); });
    $('homeParentBtn').addEventListener('click', function () { navigate({ screen: 'parent' }); });
    var continueBtn = $('homeContinue');
    if (continueBtn) continueBtn.addEventListener('click', resumeSession);
    var challengeBtn = $('homeChallengeBtn');
    if (challengeBtn) challengeBtn.addEventListener('click', function () { navigate({ screen: 'stage', stageId: 'challenge' }); });
    show('home');
  }

  /* ---------------- 階段 / 技能列表 ---------------- */

  function renderStage(stageId) {
    state.stageId = stageId;
    var stage = getStage(stageId);
    var stats = stageSkillStats(stage);
    if (stageId === 'challenge') {
      var chTotal = 0, chPassed = 0;
      stageSkills(stage).forEach(function (sk) { chTotal++; if (masteryOf(sk).mastered) chPassed++; });
      stats = { total: chTotal, unlocked: chTotal, passed: chPassed };
    }

    var hasReal = stageSkills(stage).some(function (s) { return !s.scaffold && s.types && s.types.length; });
    var html = '<h1 class="page-title">' + stage.emoji + ' ' + L(stage) + '</h1>' +
      '<p class="page-sub">' + L(stage.desc) + ' · ' + t('stage.unlockedCount', { u: stats.unlocked, t: stats.total }) + '</p>' +
      (hasReal ? '<button class="btn primary big" id="stageExamBtn" type="button" style="width:100%;margin-bottom:6px">📝 ' + t('exam.title') + '</button><p class="page-sub" style="font-size:12px;margin-bottom:14px">' + t('home.nextHint') + '</p>' : '');

    var prevMastered = true;
    var idx = 0;
    stage.topics.forEach(function (topic) {
      html += '<div class="topic-block"><div class="topic-title">' + L(topic) + '</div>';
      topic.skills.forEach(function (id) {
        var skill = getSkill(id);
        var locked = !prevMastered && idx > 0;
        if (stageId === 'challenge') locked = false; // 挑戰技能不順序鎖定
        var ms = masteryOf(skill);
        prevMastered = ms.mastered || skill.scaffold;
        html += renderSkillCard(skill, ms, locked);
        idx++;
      });
      html += '</div>';
    });

    $('screen-stage').innerHTML = html;
    var examBtn = $('stageExamBtn');
    if (examBtn) examBtn.addEventListener('click', function () { navigate({ screen: 'exam', stageId: stageId }); });
    bindStageCards();
    show('stage');
  }

  function renderSkillCard(skill, ms, locked) {
    var order = skill.order;
    var passed = ms.mastered; // 通過測驗
    var starsHtml = '';
    if (passed) starsHtml = '<span class="stars">✓ ' + '★'.repeat(Math.max(1, ms.quizStars)) + '</span>';
    else if (ms.stars > 0) starsHtml = '<span class="stars">' + '★'.repeat(ms.stars) + '</span>';

    if (skill.scaffold) {
      return '<div class="skill-card locked"><div class="badge">🔒</div>' +
        '<div class="info"><div class="name">' + nameOf(skill) + '</div>' +
        '<div class="goal">' + t('skill.comingText') + '</div></div>' +
        '<span class="stars" style="color:var(--text-2)">' + t('skill.coming') + '</span></div>';
    }

    var lockedCls = locked ? ' locked' : '';
    var goLabel = passed ? t('skill.review') : t('skill.learn');

    return '<div class="skill-card' + lockedCls + '" data-skill="' + skill.id + '" data-locked="' + (locked ? '1' : '0') + '">' +
      '<div class="badge">' + order + '</div>' +
      '<div class="info"><div class="name">' + nameOf(skill) + '</div>' +
      '<div class="goal">' + goalOf(skill) + '</div></div>' +
      (locked ? '<span class="stars" style="color:var(--text-2)">🔒</span>' : starsHtml) +
      (locked ? '' : '<button class="go" type="button" data-action="go">' + goLabel + '</button>') +
      '</div>';
  }

  function bindStageCards() {
    $('screen-stage').querySelectorAll('.skill-card').forEach(function (el) {
      var locked = el.getAttribute('data-locked') === '1';
      var id = el.getAttribute('data-skill');
      if (!id) return;
      el.addEventListener('click', function (ev) {
        if (ev.target.getAttribute('data-action') === 'go') return;
        if (locked) { toast(t('skill.unlockHint')); return; }
        navigate({ screen: 'lesson', skillId: id });
      });
      var goBtn = el.querySelector('[data-action="go"]');
      if (goBtn) {
        goBtn.addEventListener('click', function (ev) {
          ev.stopPropagation();
          if (locked) { toast(t('skill.unlockHint')); return; }
          navigate({ screen: 'lesson', skillId: id });
        });
      }
    });
  }

  /* ---------------- 小課堂 ---------------- */

  function renderLesson(skillId) {
    state.skillId = skillId;
    var skill = getSkill(skillId);
    var info = skill[state.lang === 'zh' ? 'zh' : 'en'];
    var lesson = Lessons[skill.lesson];

    var html = '<h1 class="page-title">' + esc(info.name) + '</h1>' +
      '<p class="page-sub">' + t('stage.goal') + '：' + esc(info.goal) + '</p>';

    if (lesson) {
      var l = state.lang === 'zh' ? lesson.zh : lesson.en;
      html += '<div class="lesson-card"><h2>' + t('lesson.title') + '</h2>' +
        '<div class="lesson-label">' + t('lesson.intro') + '</div><p class="lesson-text">' + renderMath(l.intro) + '</p>';
      if (lesson.visual) {
        html += '<div class="lesson-visual" id="lessonVisual"></div>';
      }
      html += '<div class="lesson-label">' + t('lesson.example') + '</div><p class="lesson-text">' + renderMath(l.example) + '</p>' +
        '<div class="lesson-label">' + t('lesson.tip') + '</div><p class="lesson-text">' + renderMath(l.tip) + '</p>' +
        '</div>' +
        '<div class="lesson-card" style="margin-top:12px">' +
        '<button class="btn secondary big" id="lessonExample" type="button">📖 ' + t('lesson.showExample') + '</button>' +
        '<div id="exampleBox" hidden></div>' +
        '</div>';
    } else {
      html += '<div class="lesson-card"><p class="lesson-text">' + t('skill.comingText') + '</p></div>';
    }

    html += '<div class="lesson-actions">' +
      '<button class="btn" id="lessonPractice" type="button">' + t('lesson.start') + '</button>' +
      '<button class="btn secondary" id="lessonQuiz" type="button">' + t('lesson.skip') + '</button>' +
      '</div>';

    $('screen-lesson').innerHTML = html;

    if (lesson && lesson.visual) {
      renderVisual($('lessonVisual'), lesson.visual, null);
    }
    if (lesson) {
      $('lessonExample').addEventListener('click', function () { showWorkedExample(skillId); });
    }
    $('lessonPractice').addEventListener('click', function () { navigate({ screen: 'practice', skillId: skillId }); });
    $('lessonQuiz').addEventListener('click', function () { navigate({ screen: 'quiz', skillId: skillId }); });
    show('lesson');
  }

  /* 一步步示範：生成一道該技能的題，列出解題步驟 */
  function showWorkedExample(skillId) {
    var skill = getSkill(skillId);
    var box = $('exampleBox');
    if (!box) return;
    var p = MathCore.generateProblem(skill, { seed: (Date.now() & 0xffffffff) });
    var ex = null;
    try { ex = MathCore.explain(p); } catch (e) { ex = null; }
    box.hidden = false;
    if (!ex) {
      box.innerHTML = '<div class="lesson-label">' + t('lesson.example') + '</div>' +
        '<p class="prompt-small">' + renderMath(L(p.prompt)) + '</p>';
      return;
    }
    var steps = state.lang === 'zh' ? ex.zh : ex.en;
    var list = '<ol class="steps-list">' + steps.map(function (s) { return '<li>' + renderMath(s) + '</li>'; }).join('') + '</ol>';
    box.innerHTML = '<div class="lesson-label">' + t('lesson.showExample') + '</div>' +
      '<p class="prompt-small">' + renderMath(L(p.prompt)) + '</p>' + list +
      '<button class="btn secondary" id="exampleNext" type="button" style="margin-top:10px">🔄 ' + t('lesson.nextExample') + '</button>';
    $('exampleNext').addEventListener('click', function () { showWorkedExample(skillId); });
  }

  /* ---------------- 練習 / 測驗 ---------------- */

  /* 進度條以 ARIA progressbar 語意呈現，數值與視覺寬度一致 */
  function progressBarHTML(pct, label) {
    var now = Math.max(0, Math.min(100, Math.round(pct || 0)));
    return '<div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + now + '"' +
      (label ? ' aria-label="' + esc(label) + '"' : '') +
      '><i style="width:' + now + '%"></i></div>';
  }

  /* 選項的無障礙名稱：例如「選項 2：5」/「Choice 2: 5」 */
  function choiceAriaLabel(index, text) {
    return t('a11y.choice', { i: index + 1, text: text });
  }

  function startPractice(skillId) {
    state.skillId = skillId;
    state.stageId = skillStageId(skillId);
    state.examStage = null;
    state.mode = 'practice';
    state.problems = [];
    state.index = 0;
    state.correct = 0;
    state.results = [];
    state.quizStart = 0;
    state.locked = false;
    state.hintShown = false;
    state.run = { mode: 'practice', key: skillId };
    nextPracticeProblem();
    show('practice');
    saveSession();
  }

  function nextPracticeProblem() {
    var skill = getSkill(state.skillId);
    var rng = MathCore.seedRandom((Date.now() & 0xffffffff) ^ Math.floor(Math.random() * 0xffff));
    var p = MathCore.nextProblem(skill, progress, { rng: rng, avoid: state.problems.slice(-4) });
    state.problems.push(p);
    state.index = state.problems.length - 1;
    state.locked = false;
    state.hintShown = false;
    renderQuestion(p);
    saveSession();
  }

  function startQuiz(skillId) {
    state.skillId = skillId;
    state.stageId = skillStageId(skillId);
    state.examStage = null;
    state.mode = 'quiz';
    state.problems = buildQuiz(getSkill(skillId), QUIZ_LENGTH);
    state.index = 0;
    state.correct = 0;
    state.results = [];
    state.locked = false;
    state.hintShown = false;
    state.quizStart = Date.now();
    state.run = { mode: 'quiz', key: skillId };
    renderQuestion(state.problems[0]);
    show('practice');
    saveSession();
  }

  /* 中學起的測驗/考試：每 3 題有 1 題改為鍵入答案（不提供選項），令評估不能只靠猜；
   * 小學階段與練習維持選擇題，避免年幼學生因輸入格式而失分。 */
  var TYPED_ASSESSMENT_STAGES = ['ms1', 'ms2', 'ms3', 'hs1', 'hs2', 'hs3', 'college'];

  function applyTypedAssessment(problems, stageId) {
    if (TYPED_ASSESSMENT_STAGES.indexOf(stageId) === -1) return problems;
    problems.forEach(function (p, i) {
      if (p.input) return;
      var numericAnswer = typeof p.answer === 'number' || MathCore.isFraction(p.answer);
      if (numericAnswer && i % 3 === 2) p.input = 'text';
    });
    return problems;
  }

  /* 測驗組卷：交給引擎的 composeSet（同模板最多 2 題、不重複整題、保證 n 題），
   * 難度至少取 1（多級別技能），避免整份測驗都停在最淺一級。 */
  function buildQuiz(skill, n) {
    var levels = Math.max(1, (skill.levels || []).length);
    var baseStep = skillProgress(skill.id).difficultyStep || 0;
    var step = Math.min(Math.max(1, baseStep), levels - 1);
    var rng = MathCore.seedRandom(Date.now() & 0xffffffff);
    return applyTypedAssessment(MathCore.composeSet(skill, n, { rng: rng, difficultyStep: step }), skill.stage);
  }

  function currentProblem() { return state.problems[state.index]; }

  /* 選項顯示文字：字串答案以鍵值存儲，按題型本地化顯示 */
  function choiceLabel(p, c) {
    if (p.type === 'direction') return t('direction.' + c);
    if (p.type === 'centre') return t('centre.' + c);
    return MathCore.isFraction(c) ? MathCore.renderValue(c) : String(c);
  }

  function renderQuestion(p) {
    var isQuiz = state.mode === 'quiz' || state.mode === 'exam';
    var skill = state.mode === 'exam' ? null : getSkill(state.skillId);

    // 頭部（進度條以 ARIA progressbar 呈現）
    var headHtml;
    var pctNow;
    if (state.mode === 'exam') {
      var examStage = getStage(state.examStage);
      pctNow = Math.round(state.index / state.problems.length * 100);
      headHtml = '<div class="practice-head"><h1 class="p-title">📝 ' + t('exam.title') + ' · ' + L(examStage) + '</h1>' +
        '<span class="p-count">' + t('practice.question', { i: state.index + 1, n: state.problems.length }) + '</span></div>' +
        progressBarHTML(pctNow, t('practice.question', { i: state.index + 1, n: state.problems.length }));
    } else if (isQuiz) {
      var done = state.index;
      pctNow = Math.round(done / state.problems.length * 100);
      headHtml = '<div class="practice-head"><h1 class="p-title">' + t('quiz.title') + '</h1>' +
        '<span class="p-count">' + t('practice.question', { i: state.index + 1, n: state.problems.length }) + '</span></div>' +
        progressBarHTML(pctNow, t('practice.question', { i: state.index + 1, n: state.problems.length }));
    } else {
      var practice = (skill.mastery && skill.mastery.practice) || 10;
      var c = skillProgress(skill.id).correct;
      pctNow = Math.min(100, Math.round(c / practice * 100));
      headHtml = '<div class="practice-head"><h1 class="p-title">' + nameOf(skill) + '</h1>' +
        '<span class="p-count">' + t('practice.progress') + ' ' + c + '/' + practice + '</span></div>' +
        progressBarHTML(pctNow, t('practice.progress') + ' ' + c + '/' + practice);
    }

    // 題干 + 視覺
    var bodyHtml = '<div class="prompt-card"><div class="prompt-text">' + renderMath(L(p.prompt)) + '</div>' +
      '<div class="prompt-visual" id="qVisual"></div></div>';

    /* 選項（button 自帶 aria-label 與 aria-disabled）或鍵入答案（挑戰區：
     * 不提供選項，避免用猜的；等值分數／小數照樣判對） */
    var choiceHtml;
    if (p.input) {
      choiceHtml = '<div class="answer-row">' +
        '<label class="sr-only" for="typedAnswer">' + esc(t('practice.typeAnswer')) + '</label>' +
        '<input class="answer-input" id="typedAnswer" type="text" inputmode="decimal" autocomplete="off" autocapitalize="off" spellcheck="false" aria-describedby="answerHint">' +
        '<button class="btn" id="typedSubmit" type="button">' + esc(t('practice.submit')) + '</button>' +
        '</div><p class="answer-hint" id="answerHint">' + esc(t('practice.answerHint')) + '</p>';
    } else {
      choiceHtml = '<div class="choices" id="choices" role="group" aria-label="' + esc(t('practice.chooseAnswer')) + '">';
      if (p.type === 'comparegroup') {
        p.choices.forEach(function (c, i) {
          var colorLabel = t('colors.' + c);
          choiceHtml += '<button class="choice color-choice" type="button" data-value="' + c + '" data-key="' + c + '" aria-label="' + esc(choiceAriaLabel(i, colorLabel)) + '" aria-disabled="false">' +
            '<span class="swatch" style="background:' + swatchColor(c) + '"></span>' +
            '<span>' + colorLabel + '</span></button>';
        });
      } else {
        p.choices.forEach(function (c, i) {
          var label = choiceLabel(p, c);
          choiceHtml += '<button class="choice" type="button" data-value="' + MathCore.renderValue(c) + '" data-key="' + MathCore.valueKey(c) + '" aria-label="' + esc(choiceAriaLabel(i, label)) + '" aria-disabled="false">' + label + '</button>';
        });
      }
      choiceHtml += '</div>';
    }

    var footerHtml = '<div class="feedback" id="feedback" role="status" aria-live="polite" aria-atomic="true"></div>';
    if (!isQuiz) {
      footerHtml += '<div class="practice-footer">' +
        '<button class="btn hint" id="hintBtn" type="button">💡 ' + t('practice.hint') + '</button>' +
        '<button class="btn" id="nextBtn" type="button" hidden>' + t('practice.next') + '</button>' +
        '</div><div class="hint-box" id="hintBox" hidden></div>';
    }

    $('screen-practice').innerHTML = headHtml + bodyHtml + choiceHtml + footerHtml;

    renderVisual($('qVisual'), p.visual, p.math);

    var feedback = $('feedback');
    var choicesEl = $('choices');
    if (choicesEl) {
      choicesEl.querySelectorAll('.choice').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (state.locked) return;
          handleAnswer(btn, p);
        });
      });
    }
    if (p.input) {
      var typedSubmit = $('typedSubmit');
      if (typedSubmit) typedSubmit.addEventListener('click', function () { handleTypedAnswer(p); });
      var typedField = $('typedAnswer');
      if (typedField) typedField.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); handleTypedAnswer(p); }
      });
    }

    if (!isQuiz) {
      $('hintBtn').addEventListener('click', function () {
        state.hintShown = true;
        var hb = $('hintBox');
        hb.textContent = L(p.hint);
        hb.hidden = false;
      });
      $('nextBtn').addEventListener('click', nextPracticeProblem);
    }
  }

  /* 作答後的共用流程：計分、練習給回饋並顯示下一題、測驗/考試排程前進 */
  function gradeAnswered(p, correct, delayMs) {
    if (correct) {
      state.locked = true;
      state.correct++;
      touchStreak();
      playTone(true);
      confetti();
      if (state.mode === 'practice') {
        MathCore.applyResult(progress, getSkill(state.skillId), p, true);
        saveProgress();
        updateTopbar();
        $('nextBtn').hidden = false;
      } else {
        state.results.push({ correct: true, problem: p });
        setTimeout(advanceQuiz, delayMs || 900);
      }
    } else {
      playTone(false);
      if (state.mode === 'practice') {
        MathCore.applyResult(progress, getSkill(state.skillId), p, false);
        saveProgress();
        // 練習答錯可以再試，不鎖定
      } else {
        state.results.push({ correct: false, problem: p });
        setTimeout(advanceQuiz, delayMs || 1100);
      }
    }
  }

  function handleAnswer(btn, p) {
    var correct = MathCore.checkAnswer(p, btn.getAttribute('data-value')).correct;
    if (correct) {
      btn.classList.add('correct');
      disableChoices();
      setFeedback(pick(t('practice.correct')), 'ok');
      gradeAnswered(p, true);
      return;
    }
    btn.classList.add('wrong');
    btn.disabled = true;
    btn.setAttribute('aria-disabled', 'true');
    setFeedback(pick(t('practice.wrong')), 'no');
    if (state.mode === 'practice') {
      gradeAnswered(p, false);
      return;
    }
    disableChoices();
    $('screen-practice').querySelectorAll('.choice').forEach(function (b) {
      if (MathCore.checkAnswer(p, b.getAttribute('data-value')).correct) b.classList.add('correct');
    });
    gradeAnswered(p, false, 1100);
  }

  /* 鍵入答案：空白提示；練習可重試；測驗/考試答錯會顯示正確答案再前進 */
  function handleTypedAnswer(p) {
    if (state.locked) return;
    var field = $('typedAnswer');
    if (!field) return;
    var raw = String(field.value || '').trim();
    if (!raw) {
      setFeedback(t('practice.enterAnswer'), 'no');
      try { field.focus(); } catch (e) { /* 忽略 */ }
      return;
    }
    var submit = $('typedSubmit');
    var correct = MathCore.checkAnswer(p, raw).correct;
    if (correct) {
      field.disabled = true;
      if (submit) submit.disabled = true;
      setFeedback(pick(t('practice.correct')), 'ok');
      gradeAnswered(p, true);
      return;
    }
    if (state.mode === 'practice') {
      setFeedback(pick(t('practice.wrong')), 'no');
      gradeAnswered(p, false);
      try { field.select(); } catch (e) { /* 忽略 */ }
      return;
    }
    field.disabled = true;
    if (submit) submit.disabled = true;
    setFeedback(t('practice.answerWas', { answer: MathCore.renderValue(p.answer) }), 'no');
    gradeAnswered(p, false, 1700);
  }

  function disableChoices() {
    $('screen-practice').querySelectorAll('.choice').forEach(function (b) {
      b.disabled = true;
      b.setAttribute('aria-disabled', 'true');
    });
  }

  function setFeedback(msg, cls) {
    var f = $('feedback');
    f.textContent = msg;
    f.className = 'feedback ' + cls;
  }

  /* ---------------- 鍵盤操作（數字選答 / 方向鍵 / Esc / Tab 陷阱） ---------------- */

  function focusEl(el) {
    if (!el || typeof el.focus !== 'function') return false;
    try { el.focus(); } catch (e) { return false; }
    return document.activeElement === el;
  }

  /* 元素是否仍可見（父層 hidden / display:none 時不應搶焦點） */
  function isVisible(el) {
    if (!el || !document.contains(el)) return false;
    var node = el;
    while (node && node.nodeType === 1) {
      if (node.hidden === true) return false;
      if (typeof window.getComputedStyle === 'function') {
        try {
          var st = window.getComputedStyle(node);
          if (st && st.display === 'none') return false;
        } catch (e) { /* 忽略 */ }
      }
      node = node.parentNode;
    }
    return true;
  }

  function restoreFocus(el) {
    if (isVisible(el)) return focusEl(el);
    return false;
  }

  /* 重新渲染後把焦點放回當前屏幕的第一個可聚焦元素，避免焦點掉到 body */
  function focusScreen() {
    var screen = $('screen-' + state.screen);
    if (!screen) return false;
    var node = screen.querySelector('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
    return focusEl(node);
  }

  function isTypingTarget(el) {
    if (!el) return false;
    var tag = (el.tagName || '').toUpperCase();
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable === true;
  }

  function choiceButtons() {
    var box = $('choices');
    if (!box) return [];
    return Array.prototype.slice.call(box.querySelectorAll('.choice'));
  }

  function handlePracticeKeys(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (isTypingTarget(e.target)) return;
    var choices = choiceButtons();
    if (!choices.length) return;
    var key = e.key;

    // Enter / Space 啟用目前聚焦的選項
    if (key === 'Enter' || key === ' ' || key === 'Spacebar') {
      var activeBtn = document.activeElement;
      if (activeBtn && choices.indexOf(activeBtn) !== -1 && !activeBtn.disabled) {
        e.preventDefault();
        if (!state.locked) activeBtn.click();
      }
      return;
    }

    // 數字鍵 1–4 選取對應選項
    if (/^[1-9]$/.test(key)) {
      var idx = Number(key) - 1;
      if (idx >= choices.length) return;
      var btn = choices[idx];
      if (btn.disabled || btn.getAttribute('aria-disabled') === 'true') return;
      e.preventDefault();
      focusEl(btn);
      if (!state.locked) btn.click();
      return;
    }

    // 方向鍵在選項之間移動焦點（跳過已禁用選項，循環）
    var isNext = key === 'ArrowRight' || key === 'ArrowDown';
    var isPrev = key === 'ArrowLeft' || key === 'ArrowUp';
    if (!isNext && !isPrev) return;
    e.preventDefault();
    var n = choices.length;
    var dir = isNext ? 1 : -1;
    var cur = choices.indexOf(document.activeElement);
    if (cur === -1) {
      for (var j = 0; j < n; j++) {
        var cand = choices[dir === 1 ? j : n - 1 - j];
        if (!cand.disabled) { focusEl(cand); break; }
      }
      return;
    }
    var nextIdx = cur;
    for (var k = 0; k < n; k++) {
      nextIdx = (nextIdx + dir + n) % n;
      if (!choices[nextIdx].disabled) { focusEl(choices[nextIdx]); break; }
    }
  }

  /* 全局鍵盤事件：對話框開啟時處理 Esc / Tab 陷阱，否則處理作答畫面快捷鍵 */
  function onGlobalKeydown(e) {
    if (modalState.open) {
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        closeModal();
        return;
      }
      if (e.key === 'Tab') {
        trapModalTab(e);
        return;
      }
      return; // 對話框開啟時不觸發作答快捷鍵
    }
    if (state.screen !== 'practice') return;
    var screen = $('screen-practice');
    if (!screen || screen.hidden) return;
    handlePracticeKeys(e);
  }

  function advanceQuiz() {
    state.index++;
    if (state.index < state.problems.length) {
      state.locked = false;
      renderQuestion(state.problems[state.index]);
      saveSession();
    } else if (state.mode === 'exam') {
      finishExam();
    } else {
      finishQuiz();
    }
  }

  function finishQuiz() {
    var skill = getSkill(state.skillId);
    var grade = MathCore.gradeQuiz(state.results);
    var seconds = Math.round((Date.now() - state.quizStart) / 1000);
    clearSession();
    MathCore.applyQuizResult(progress, skill, grade.percent);
    saveProgress();
    updateTopbar();

    var starsHtml = '';
    for (var i = 1; i <= 3; i++) starsHtml += '<span style="opacity:' + (i <= grade.stars ? 1 : 0.2) + '">★</span>';

    $('screen-practice').innerHTML =
      '<div class="result-card">' +
      '<div class="big">' + (grade.stars >= 2 ? '🎉' : (grade.stars >= 1 ? '👍' : '💪')) + '</div>' +
      '<h1>' + t('quiz.result') + '</h1>' +
      '<p class="page-sub">' + nameOf(skill) + '</p>' +
      '<div class="score">' + t('quiz.score', { c: grade.correct, t: grade.total }) + '</div>' +
      '<div class="result-stars">' + starsHtml + '</div>' +
      '<p class="page-sub">' + t('quiz.time') + '：' + Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0') + '</p>' +
      '<div class="result-actions">' +
      '<button class="btn secondary" id="quizBack" type="button">' + t('quiz.back') + '</button>' +
      '<button class="btn" id="quizRetry" type="button">' + t('quiz.retry') + '</button>' +
      '</div></div>';

    $('quizBack').addEventListener('click', function () { navigate({ screen: 'stage', stageId: skillStageId(state.skillId) }); });
    $('quizRetry').addEventListener('click', function () { startQuiz(state.skillId); });
    show('practice');
    var quizAnnouncer = $('announcer');
    if (quizAnnouncer) quizAnnouncer.textContent = t('quiz.result');
  }

  /* ---------------- 綜合考試（模擬試卷） ---------------- */

  function renderGradeExam(stageId) {
    var stage = getStage(stageId);
    state.examStage = stageId;
    state.stageId = stageId;
    state.mode = 'exam';
    state.skillId = null;
    state.problems = buildGradeExam(stage, EXAM_LENGTH);
    state.index = 0;
    state.correct = 0;
    state.results = [];
    state.locked = false;
    state.hintShown = false;
    state.quizStart = Date.now();
    state.run = { mode: 'exam', key: stageId };
    if (!state.problems.length) { toast(t('exam.empty')); renderStage(stageId); return; }
    renderQuestion(state.problems[0]);
    show('practice');
    saveSession();
  }

  /* 綜合考試組卷：跨技能、每技能最多 3 題、同模板最多 2 題；
   * 約 2/3 題目用最高難度級別，其餘用學習者目前級別（至少 1），令試卷不再全部最淺。 */
  function buildGradeExam(stage, n) {
    var skills = stageSkills(stage).filter(function (s) { return !s.scaffold && s.types && s.types.length; });
    if (!skills.length) return [];
    var rng = MathCore.seedRandom(Date.now() & 0xffffffff);
    var exam = MathCore.composeExam(skills, n, {
      rng: rng,
      maxPerSkill: 3,
      stepFor: function (skill) {
        var levels = Math.max(1, (skill.levels || []).length);
        var top = levels - 1;
        if (top <= 0) return 0;
        var sp = skillProgress(skill.id).difficultyStep || 0;
        return rng() < 0.67 ? Math.max(1, top) : Math.max(1, Math.min(sp, top));
      }
    });
    return applyTypedAssessment(exam, stage.id);
  }

  function finishExam() {
    var stage = getStage(state.examStage);
    var grade = MathCore.gradeQuiz(state.results);
    var seconds = Math.round((Date.now() - state.quizStart) / 1000);
    clearSession();

    // 記錄綜合考試成績；達 90% 即視為「完成本階段」，滿分另作紀錄
    var passed = grade.total > 0 && grade.percent >= EXAM_PASS;
    var perfect = grade.total > 0 && grade.correct === grade.total;
    progress.stageExams = progress.stageExams || {};
    var prev = progress.stageExams[state.examStage] || {};
    progress.stageExams[state.examStage] = {
      passed: !!(prev.passed || prev.perfect || passed),
      perfect: !!(prev.perfect || perfect),
      best: Math.max(prev.best || 0, Math.round(grade.percent * 100))
    };
    saveProgress();
    updateTopbar();

    var starsHtml = '';
    for (var i = 1; i <= 3; i++) starsHtml += '<span style="opacity:' + (i <= grade.stars ? 1 : 0.2) + '">★</span>';
    $('screen-practice').innerHTML =
      '<div class="result-card">' +
      '<div class="big">' + (grade.stars >= 2 ? '🎉' : (grade.stars >= 1 ? '👍' : '💪')) + '</div>' +
      '<h1>' + t('exam.result') + '</h1>' +
      '<p class="page-sub">' + L(stage) + '</p>' +
      '<div class="score">' + t('quiz.score', { c: grade.correct, t: grade.total }) + '</div>' +
      '<div class="result-stars">' + starsHtml + '</div>' +
      '<p class="page-sub">' + Math.round(grade.percent * 100) + '% · ' + t('quiz.time') + '：' + Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0') + '</p>' +
      '<p class="page-sub">' + (passed ? (perfect ? t('exam.perfectUnlock') : t('exam.passUnlock')) : t('exam.needPass')) + '</p>' +
      '<div class="result-actions">' +
      '<button class="btn secondary" id="examBack" type="button">' + t('quiz.back') + '</button>' +
      '<button class="btn" id="examRetry" type="button">' + t('quiz.retry') + '</button>' +
      '</div></div>';
    $('examBack').addEventListener('click', function () { navigate({ screen: 'stage', stageId: state.examStage }); });
    $('examRetry').addEventListener('click', function () { renderGradeExam(state.examStage); });
    show('practice');
    var examAnnouncer = $('announcer');
    if (examAnnouncer) examAnnouncer.textContent = t('exam.result');
  }

  /* ---------------- 家長中心 ---------------- */

  function renderParent() {
    var masteredCount = 0, totalCount = 0, sumStars = totalStars();
    Object.keys(Curriculum.skills).forEach(function (id) {
      var s = Curriculum.skills[id];
      if (s.scaffold) return;
      totalCount++;
      if (masteryOf(s).mastered) masteredCount++;
    });

    var html = '<h1 class="page-title">' + t('parent.title') + '</h1>' +
      '<div class="panel"><h2>' + t('parent.overview') + '</h2>' +
      '<div class="stat-row">' +
      '<div class="stat"><div class="v">' + sumStars + '</div><div class="k">' + t('parent.totalStars') + '</div></div>' +
      '<div class="stat"><div class="v">' + (progress.streak.count || 0) + '</div><div class="k">' + t('parent.streak') + '</div></div>' +
      '<div class="stat"><div class="v">' + masteredCount + '/' + totalCount + '</div><div class="k">' + t('parent.masteredSkills') + '</div></div>' +
      '</div></div>';

    html += '<div class="panel"><h2>' + t('parent.skills') + '</h2>';
    var hasAny = false;
    Curriculum.stages.forEach(function (stage) {
      stageSkills(stage).forEach(function (skill) {
        if (skill.scaffold) return;
        var sp = skillProgress(skill.id);
        if (!sp.attempts) return;
        hasAny = true;
        var ms = masteryOf(skill);
        var pct = Math.min(100, Math.round((sp.correct / ((skill.mastery && skill.mastery.practice) || 10)) * 100));
        html += '<div class="row-item"><span class="nm">' + nameOf(skill) + '</span>' +
          '<span class="bar"><i style="width:' + pct + '%"></i></span>' +
          '<span class="pc">' + (ms.mastered ? '★★★' : pct + '%') + '</span></div>';
      });
    });
    if (!hasAny) html += '<p class="page-sub">' + t('parent.empty') + '</p>';
    html += '</div>';

    html += '<div class="panel"><h2>' + t('settings.title') + '</h2>' +
      '<button class="btn secondary big" id="parentUnlock" type="button" style="margin-bottom:10px">🔓 ' + t('parent.unlockAll') + '</button>' +
      '<button class="btn secondary big" id="parentExport" type="button" style="margin-bottom:10px">📤 ' + t('parent.export') + '</button>' +
      '<button class="btn secondary big" id="parentImport" type="button" style="margin-bottom:10px">📥 ' + t('parent.import') + '</button>' +
      '<button class="btn danger-btn" id="parentReset" type="button">🗑 ' + t('parent.reset') + '</button></div>';

    $('screen-parent').innerHTML = html;
    $('parentUnlock').addEventListener('click', confirmUnlockAll);
    $('parentExport').addEventListener('click', exportProgress);
    $('parentImport').addEventListener('click', importProgress);
    $('parentReset').addEventListener('click', confirmReset);
    show('parent');
  }

  /* ---------------- 對話框（角色 / 焦點管理 / Tab 陷阱 / Esc 關閉） ---------------- */

  var modalState = { open: false, opener: null };

  function modalFocusables() {
    var modal = $('modal');
    if (!modal) return [];
    var nodes = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    return Array.prototype.filter.call(nodes, function (el) {
      if (el.disabled) return false;
      if (el.hasAttribute('hidden')) return false;
      if (el.getAttribute('aria-hidden') === 'true') return false;
      return true;
    });
  }

  /* 對話框開啟時把背景（主內容／頂欄／更新 chip／skip link）設為 inert + aria-hidden，
   * 關閉時還原；焦點只在對話框內循環。 */
  function setBackgroundInert(on) {
    ['main', 'topbar', 'updateChip', 'skipLink'].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      if (on) {
        el.setAttribute('inert', '');
        el.setAttribute('aria-hidden', 'true');
      } else {
        el.removeAttribute('inert');
        el.removeAttribute('aria-hidden');
      }
    });
  }

  function showModal(innerHTML, opener) {
    var modal = $('modal');
    if (!modal) return;
    var active = document.activeElement;
    modalState.opener = opener || (active && active !== document.body && isVisible(active) ? active : null);
    modal.innerHTML = innerHTML;
    modal.hidden = false;
    var heading = modal.querySelector('h2, h3, h4') || modal.querySelector('#modalTitle');
    if (heading && !heading.id) heading.id = 'modalTitle';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', heading ? heading.id : 'modalTitle');
    modalState.open = true;
    setBackgroundInert(true);
    var items = modalFocusables();
    if (!focusEl(items[0])) focusEl(modal);
  }

  /* 關閉對話框；預設把焦點交還開啟它的元素。restore:false 時由調用方重新渲染後自行恢復 */
  function closeModal(opts) {
    var modal = $('modal');
    if (!modal) return null;
    var opener = modalState.opener;
    var wasOpen = modalState.open;
    modal.hidden = true;
    modal.innerHTML = '';
    modalState.open = false;
    modalState.opener = null;
    setBackgroundInert(false);
    if (wasOpen && !(opts && opts.restore === false)) {
      if (!restoreFocus(opener)) focusScreen();
    }
    return opener;
  }

  function trapModalTab(e) {
    var modal = $('modal');
    var items = modalFocusables();
    if (!items.length) {
      e.preventDefault();
      focusEl(modal);
      return;
    }
    var first = items[0];
    var last = items[items.length - 1];
    var idx = items.indexOf(document.activeElement);
    if (idx === -1) {
      e.preventDefault();
      focusEl(e.shiftKey ? last : first);
      return;
    }
    if (!e.shiftKey && idx === items.length - 1) {
      e.preventDefault();
      focusEl(first);
    } else if (e.shiftKey && idx === 0) {
      e.preventDefault();
      focusEl(last);
    }
  }

  function confirmUnlockAll(ev) {
    showModal('<div class="modal">' +
      '<h3 id="modalTitle">' + t('parent.unlockAll') + '</h3>' +
      '<p>' + t('parent.unlockAllConfirm') + '</p>' +
      '<div class="btn-row">' +
      '<button class="btn secondary" id="unlockCancel" type="button">' + t('common.cancel') + '</button>' +
      '<button class="btn" id="unlockOk" type="button">' + t('parent.unlockAll') + '</button>' +
      '</div></div>', ev && ev.currentTarget);
    $('unlockCancel').addEventListener('click', function () { closeModal(); });
    $('unlockOk').addEventListener('click', function () {
      for (var id in Curriculum.skills) {
        var skill = Curriculum.skills[id];
        if (skill.scaffold) continue;
        if (!progress.skills[id]) progress.skills[id] = MathCore.defaultSkillProgress();
        var sp = progress.skills[id];
        sp.quizStars = Math.max(sp.quizStars || 0, 3);
        sp.quizBest = Math.max(sp.quizBest || 0, 100);
        sp.mastered = true;
        sp.stars = Math.max(sp.stars || 0, 3);
      }
      progress.stageExams = {};
      realStageList().forEach(function (st) {
        progress.stageExams[st.id] = { passed: true, perfect: true, best: 100 };
      });
      saveProgress();
      var opener = closeModal({ restore: false });
      renderParent();
      if (!restoreFocus(opener)) focusScreen();
      toast(t('parent.unlockAllDone'));
    });
  }

  function exportProgress(ev) {
    var opener = ev && ev.currentTarget;
    var json = JSON.stringify(progress);
    var done = function () { toast(t('parent.exported')); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(json).then(done).catch(function () { showJsonModal(json, false, opener); });
    } else {
      showJsonModal(json, false, opener);
    }
  }

  function importProgress(ev) {
    showJsonModal(null, true, ev && ev.currentTarget);
  }

  function showJsonModal(existingJson, isImport, opener) {
    var text = existingJson || '';
    showModal('<div class="modal">' +
      '<h3 id="modalTitle">' + (isImport ? t('parent.import') : t('parent.export')) + '</h3>' +
      '<p>' + (isImport ? t('parent.import') : t('parent.export')) + '</p>' +
      '<textarea id="jsonArea" rows="6" style="width:100%;border:1px solid var(--sep);border-radius:10px;padding:10px;font-family:monospace;background:var(--card-2);color:var(--text)">' + esc(text) + '</textarea>' +
      '<div class="btn-row" style="margin-top:14px">' +
      '<button class="btn secondary" id="jsonCancel" type="button">' + t('common.cancel') + '</button>' +
      (isImport ? '<button class="btn" id="jsonOk" type="button">' + t('parent.import') + '</button>'
                : '<button class="btn" id="jsonOk" type="button">' + t('common.close') + '</button>') +
      '</div></div>', opener);
    $('jsonCancel').addEventListener('click', function () { closeModal(); });
    $('jsonOk').addEventListener('click', function () {
      if (isImport) {
        try {
          var text = $('jsonArea').value;
          if (text.length > 1000000) throw new Error(t('parent.importedTooLarge'));
          var parsed = JSON.parse(text);
          if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error(t('parent.importBadFormat'));
          progress = MathCore.sanitizeProgress(parsed);
          saveProgress();
          clearSession(); // 匯入的進度可能改變解鎖狀態，舊題組不再恢復
          state.lang = progress.lang || state.lang;
          state.theme = progress.theme || state.theme;
          state.sound = progress.sound !== false;
          applyTheme();
          applyLang();
          toast(t('parent.imported'));
          var importOpener = closeModal({ restore: false });
          renderParent();
          if (!restoreFocus(importOpener)) focusScreen();
        } catch (e) { toast('⚠ ' + e.message); }
      } else {
        closeModal();
      }
    });
  }

  function confirmReset(ev) {
    showModal('<div class="modal">' +
      '<h3 id="modalTitle">' + t('parent.reset') + '</h3>' +
      '<p>' + t('parent.resetConfirm') + '</p>' +
      '<div class="btn-row">' +
      '<button class="btn secondary" id="resetCancel" type="button">' + t('common.cancel') + '</button>' +
      '<button class="btn danger-btn" id="resetOk" type="button">' + t('parent.reset') + '</button>' +
      '</div></div>', ev && ev.currentTarget);
    $('resetCancel').addEventListener('click', function () { closeModal(); });
    $('resetOk').addEventListener('click', function () {
      progress = MathCore.newProgress();
      progress.lang = state.lang;
      progress.sound = state.sound;
      progress.theme = state.theme;
      saveProgress();
      clearSession(); // 重置進度後不應再恢復舊題組
      var opener = closeModal({ restore: false });
      renderHome();
      if (!restoreFocus(opener)) focusScreen();
    });
  }

  /* ---------------- 公式一覽（參考） ---------------- */

  function renderFormulas() {
    var F = Formulas;
    if (!F) { $('screen-formulas').innerHTML = '<p class="page-sub">—</p>'; show('formulas'); return; }
    var lang = state.lang === 'zh' ? 'zh' : 'en';
    var html = '<h1 class="page-title">📐 ' + t('formulas.title') + '</h1>' +
      '<p class="page-sub">' + esc(F.intro[lang]) + '</p>';
    F.sections.forEach(function (sec) {
      html += '<div class="outline-stage"><h2>' + esc(sec[lang]) + '</h2>';
      sec.items.forEach(function (it) {
        html += '<div class="formula-row">' +
          '<div class="formula-name">' + esc(it[lang]) + '</div>' +
          '<div class="formula-latex">' + renderMath('$' + it.latex + '$') + '</div>' +
          '</div>';
      });
      html += '</div>';
    });
    $('screen-formulas').innerHTML = html;
    show('formulas');
  }

  /* ---------------- 課程大綱（參考） ---------------- */

  function renderOutline() {
    var o = CurriculumOutline;
    if (!o) { $('screen-outline').innerHTML = '<p class="page-sub">—</p>'; show('outline'); return; }
    var lang = state.lang === 'zh' ? 'zh' : 'en';
    var KS_APP = { ks1: ['prek', 'g1', 'g2', 'g3'], ks2: ['g4', 'g5', 'g6'], js: ['ms1', 'ms2', 'ms3'], ss: ['hs1', 'hs2', 'hs3'] };
    var html = '<h1 class="page-title">📚 ' + t('outline.title') + '</h1>' +
      '<p class="page-sub">' + esc(o.intro[lang]) + '</p>' +
      '<p class="page-sub" style="font-size:13px">' + esc(o.note[lang]) + '</p>';
    o.stages.forEach(function (stage) {
      html += '<div class="outline-stage"><h2>' + esc(stage[lang]) + '</h2>';
      var skillNames = [];
      (KS_APP[stage.id] || []).forEach(function (sid) {
        var st = getStage(sid);
        if (!st) return;
        stageSkills(st).forEach(function (sk) { if (!sk.scaffold) skillNames.push(nameOf(sk)); });
      });
      if (skillNames.length) {
        html += '<div class="outline-covered">📌 ' + t('outline.covered') + '：' + skillNames.map(esc).join('、') + '</div>';
      }
      stage.strands.forEach(function (strand) {
        html += '<div class="outline-strand"><div class="outline-strand-title">' + esc(strand[lang]) + '</div><ul class="outline-units">';
        strand.units.forEach(function (u) { html += '<li>' + esc(u[lang]) + '</li>'; });
        html += '</ul></div>';
      });
      html += '</div>';
    });
    $('screen-outline').innerHTML = html;
    show('outline');
  }

  /* ---------------- 設置 ---------------- */

  function renderSettings() {
    var html = '<h1 class="page-title">' + t('settings.title') + '</h1>' +
      '<div class="panel">' +
      '<div class="settings-row"><span class="k">' + t('settings.language') + '</span>' +
      '<button class="btn secondary" id="setLangBtn" type="button">' + t('langName') + ' ⇄</button></div>' +
      '<div class="settings-row"><span class="k">' + t('settings.sound') + '</span>' +
      '<div class="switch' + (state.sound ? ' on' : '') + '" id="soundSwitch" role="switch" tabindex="0" aria-label="' + esc(t('settings.sound')) + '" aria-checked="' + state.sound + '"></div></div>' +
      '<div class="settings-row"><span class="k">' + t('settings.theme') + '</span>' +
      '<div class="seg">' +
        themeSegBtn('light', t('settings.themeLight')) +
        themeSegBtn('dark', t('settings.themeDark')) +
        themeSegBtn('auto', t('settings.themeAuto')) +
      '</div></div>' +
      '</div>' +
      '<button class="btn secondary big" id="settingsRefresh" type="button" style="margin-bottom:10px">🔄 ' + t('settings.refreshApp') + '</button>' +
      '<button class="btn secondary big" id="settingsParent" type="button">👨‍👩‍👦 ' + t('home.parent') + '</button>';

    $('screen-settings').innerHTML = html;
    $('setLangBtn').addEventListener('click', function () { toggleLang(); });
    var toggleSound = function () {
      state.sound = !state.sound;
      progress.sound = state.sound;
      saveProgress();
      renderSettings();
      updateTopbar();
    };
    $('soundSwitch').addEventListener('click', toggleSound);
    $('soundSwitch').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        toggleSound();
      }
    });
    $('screen-settings').querySelectorAll('.seg-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        state.theme = b.getAttribute('data-theme');
        progress.theme = state.theme;
        saveProgress();
        applyTheme();
        renderSettings();
      });
    });
    $('settingsRefresh').addEventListener('click', forceUpdate);
    $('settingsParent').addEventListener('click', function () { navigate({ screen: 'parent' }); });
    show('settings');
  }

  function themeSegBtn(value, label) {
    return '<button class="seg-btn' + (state.theme === value ? ' on' : '') + '" data-theme="' + value + '" type="button">' + label + '</button>';
  }

  function toggleLang() {
    state.lang = state.lang === 'zh' ? 'en' : 'zh';
    progress.lang = state.lang;
    saveProgress();
    applyLang();
    // 依目前 route 重新渲染（不在這裡另寫畫面分支）
    renderRouteSafely(currentRoute());
    updateTopbar();
  }

  /* ---------------- 啟動 ---------------- */

  function bindTopbar() {
    $('backBtn').addEventListener('click', back);
    $('langBtn').addEventListener('click', toggleLang);
    $('settingsBtn').addEventListener('click', function () { navigate({ screen: 'settings' }); });
    var chip = $('updateChip');
    if (chip) chip.addEventListener('click', acceptUpdate);
  }

  /* 註冊 Service Worker（僅在 http/https 下，供離線與安裝成 App）。
   * 更新策略：不自動重新載入；偵測到 waiting worker 時顯示「新版本」chip，
   * 使用者按下才送 SKIP_WAITING（sw.js 收到後 skipWaiting），controllerchange 才 reload。 */
  var updateState = { worker: null, accepted: false };

  function showUpdateChip(waiting) {
    updateState.worker = waiting || null;
    var chip = $('updateChip');
    if (!chip) return;
    chip.textContent = '🔄 ' + t('update.available') + ' · ' + t('update.reload');
    chip.title = t('update.hint');
    chip.hidden = false;
  }

  function acceptUpdate() {
    var chip = $('updateChip');
    if (chip) chip.hidden = true;
    var worker = updateState.worker;
    if (worker && typeof worker.postMessage === 'function') {
      updateState.accepted = true;
      worker.postMessage({ type: 'SKIP_WAITING' });
      return;
    }
    try { window.location.reload(); } catch (e) { /* 忽略 */ }
  }

  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    if (location.protocol !== 'http:' && location.protocol !== 'https:') return;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (updateState.accepted) {
        try { window.location.reload(); } catch (e) { /* 忽略 */ }
      }
    });
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').then(function (reg) {
        if (reg.waiting && navigator.serviceWorker.controller) showUpdateChip(reg.waiting);
        reg.addEventListener('updatefound', function () {
          var installing = reg.installing;
          if (!installing) return;
          installing.addEventListener('statechange', function () {
            if (installing.state !== 'installed') return;
            if (navigator.serviceWorker.controller) showUpdateChip(reg.waiting || installing);
          });
        });
        reg.update().catch(function () { /* 忽略 */ });
      }).catch(function () { /* 忽略 */ });
    });
  }

  /* 強制更新：解除 Service Worker、清空快取，再重新載入 */
  function forceUpdate() {
    var done = function () { window.location.reload(); };
    if (!('serviceWorker' in navigator)) { done(); return; }
    navigator.serviceWorker.getRegistrations().then(function (rs) {
      return Promise.all(rs.map(function (r) { return r.unregister(); }));
    }).then(function () {
      if (!('caches' in window)) return null;
      return caches.keys().then(function (ks) {
        return Promise.all(ks.map(function (k) { return caches.delete(k); }));
      });
    }).then(done).catch(done);
  }

  /* 啟動：解析 hash → 驗證 → 恢復未完成的題組 → 渲染。
   * 首次渲染用 replace，不把「開啟 app」本身寫成一條歷史。 */
  function init() {
    bindTopbar();
    applyTheme();
    applyLang();
    document.addEventListener('keydown', onGlobalKeydown);
    window.addEventListener('hashchange', onLocationChange);
    window.addEventListener('popstate', onLocationChange);
    registerSW();

    var target = null;
    try {
      var parsed = parseHash(location.hash);
      target = parsed ? resolveRoute(parsed) : null;
    } catch (err) { renderError(err); return; }
    var session = readSession();
    if (session) {
      var sessionParsed = parseHash(session.route);
      var sessionRoute = null;
      try { sessionRoute = sessionParsed ? resolveRoute(sessionParsed) : null; }
      catch (e) { sessionRoute = null; }
      if (!sessionRoute || !sameRoute(sessionRoute, sessionParsed)) {
        clearSession(); // 解鎖狀態已改變，舊 session 不再合法
      } else if (target && sameRoute(target, sessionRoute)) {
        restoreSession(session); // 重新載入時回到同一題、同一進度
        return;
      }
      /* 在首頁/其他 route 開啟時不自動恢復，改由首頁 Continue 卡讓使用者決定 */
    }
    navigate(target || HOME_ROUTE, { replace: true });
  }

  /* 腳本位於 <body> 末尾，DOM 已就緒，直接初始化 */
  init();

  /* 調試/測試鉤子（生產環境無害） */
  window.__mathApp = {
    getState: function () { return state; },
    getProgress: function () { return progress; },
    currentProblem: function () { return currentProblem(); },
    renderGradeExam: renderGradeExam,
    finishExam: finishExam,
    renderHome: renderHome,
    parseHash: parseHash,
    serializeRoute: serializeRoute,
    resolveRoute: resolveRoute,
    parentOf: parentOf,
    currentRoute: currentRoute,
    navigate: navigate,
    showUpdateChip: showUpdateChip,
    acceptUpdate: acceptUpdate,
    session: {
      key: SESSION_KEY,
      read: readSession,
      clear: clearSession
    }
  };
})();
