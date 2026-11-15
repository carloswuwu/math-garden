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

  var STORE_KEY = 'mathpath.progress.v1';
  var QUIZ_LENGTH = 10;
  var EXAM_LENGTH = 20;

  /* ---------------- 狀態 ---------------- */
  var state = {
    lang: 'zh',
    sound: true,
    theme: 'light',
    screen: 'home',
    stageId: null,
    skillId: null,
    mode: 'practice', // 'practice' | 'quiz'
    problems: [],
    index: 0,
    correct: 0,
    results: [],
    locked: false,
    hintShown: false,
    quizStart: 0
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
      if (raw) {
        var p = JSON.parse(raw);
        var base = MathCore.newProgress();
        base.streak = p.streak || base.streak;
        base.lang = p.lang || 'zh';
        base.sound = p.sound !== false;
        base.theme = p.theme || 'light';
        base.stars = p.stars || 0;
        base.badges = p.badges || [];
        base.skills = p.skills || {};
        return base;
      }
    } catch (e) { /* 忽略損壞數據 */ }
    return MathCore.newProgress();
  }
  function saveProgress() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(progress)); } catch (e) { /* 忽略 */ }
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
    return Curriculum.stages.filter(function (st) {
      return stageSkills(st).some(function (s) { return !s.scaffold; });
    });
  }
  function stageComplete(stage) {
    var skills = stageSkills(stage).filter(function (s) { return !s.scaffold; });
    return skills.length > 0 && skills.every(isPassed);
  }
  function stageUnlocked(stageId) {
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

  function renderVisual(container, visual, math) {
    container.innerHTML = '';
    if (!visual) { container.style.display = 'none'; return; }
    container.style.display = 'flex';
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

  /* ---------------- 導航 ---------------- */

  function show(screen) {
    state.screen = screen;
    screens.forEach(function (s) { $('screen-' + s).hidden = (s !== screen); });
    try { window.scrollTo(0, 0); } catch (e) { /* jsdom 無此實現 */ }
    updateTopbar();
  }

  function updateTopbar() {
    var back = $('backBtn');
    var onHome = state.screen === 'home';
    back.hidden = onHome;
    $('langBtn').textContent = state.lang === 'zh' ? 'EN' : '繁體';
    $('topbarStars').textContent = '⭐ ' + totalStars();

    var title = '';
    switch (state.screen) {
      case 'home': title = t('appName'); break;
      case 'stage': title = L(getStage(state.stageId)); break;
      case 'lesson': title = nameOf(getSkill(state.skillId)); break;
      case 'practice': title = state.mode === 'quiz' ? t('quiz.title') : t('practice.title'); break;
      case 'parent': title = t('parent.title'); break;
      case 'settings': title = t('settings.title'); break;
      case 'outline': title = t('outline.title'); break;
      case 'formulas': title = t('formulas.title'); break;
    }
    $('topbarTitle').textContent = title;
  }

  function back() {
    switch (state.screen) {
      case 'stage': renderHome(); break;
      case 'lesson': renderStage(state.stageId); break;
      case 'practice':
        if (state.mode === 'quiz') { renderLesson(state.skillId); }
        else { renderLesson(state.skillId); }
        break;
      case 'parent': renderHome(); break;
      case 'settings': renderHome(); break;
      case 'outline': renderHome(); break;
      case 'formulas': renderHome(); break;
    }
  }

  /* ---------------- 首頁 ---------------- */

  function renderHome() {
    show('home');
    var realStages = realStageList();
    var unlockedCount = 0;
    var html = '<h1 class="page-title">' + t('home.title') + '</h1>' +
      '<p class="page-sub">' + t('home.subtitle') + '</p>' +
      '<div class="stage-grid">';
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
      el.addEventListener('click', function () { renderStage(el.getAttribute('data-stage')); });
    });
    $('homeFormulasBtn').addEventListener('click', renderFormulas);
    $('homeOutlineBtn').addEventListener('click', renderOutline);
    $('homeParentBtn').addEventListener('click', renderParent);
  }

  /* ---------------- 階段 / 技能列表 ---------------- */

  function renderStage(stageId) {
    state.stageId = stageId;
    show('stage');
    var stage = getStage(stageId);
    var stats = stageSkillStats(stage);

    var hasReal = stageSkills(stage).some(function (s) { return !s.scaffold && s.types && s.types.length; });
    var html = '<h1 class="page-title">' + stage.emoji + ' ' + L(stage) + '</h1>' +
      '<p class="page-sub">' + L(stage.desc) + ' · ' + t('stage.unlockedCount', { u: stats.unlocked, t: stats.total }) + '</p>' +
      (hasReal ? '<button class="btn primary big" id="stageExamBtn" type="button" style="width:100%;margin-bottom:14px">📝 ' + t('exam.title') + '</button>' : '');

    var prevMastered = true;
    var idx = 0;
    stage.topics.forEach(function (topic) {
      html += '<div class="topic-block"><div class="topic-title">' + L(topic) + '</div>';
      topic.skills.forEach(function (id) {
        var skill = getSkill(id);
        var locked = !prevMastered && idx > 0;
        var ms = masteryOf(skill);
        prevMastered = ms.mastered || skill.scaffold;
        html += renderSkillCard(skill, ms, locked);
        idx++;
      });
      html += '</div>';
    });

    $('screen-stage').innerHTML = html;
    var examBtn = $('stageExamBtn');
    if (examBtn) examBtn.addEventListener('click', function () { renderGradeExam(stageId); });
    bindStageCards();
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
        renderLesson(id);
      });
      var goBtn = el.querySelector('[data-action="go"]');
      if (goBtn) {
        goBtn.addEventListener('click', function (ev) {
          ev.stopPropagation();
          if (locked) { toast(t('skill.unlockHint')); return; }
          renderLesson(id);
        });
      }
    });
  }

  /* ---------------- 小課堂 ---------------- */

  function renderLesson(skillId) {
    state.skillId = skillId;
    show('lesson');
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
    $('lessonPractice').addEventListener('click', function () { startPractice(skillId); });
    $('lessonQuiz').addEventListener('click', function () { startQuiz(skillId); });
  }

  /* 一步步示範：生成一道該技能的題，列出解題步驟 */
  function showWorkedExample(skillId) {
    var skill = getSkill(skillId);
    var box = $('exampleBox');
    if (!box) return;
    var p = MathCore.generateProblem(skill, { seed: (Date.now() & 0xffffffff) });
    var ex = MathCore.explain(p);
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

  function startPractice(skillId) {
    state.skillId = skillId;
    state.mode = 'practice';
    state.problems = [];
    state.index = 0;
    state.correct = 0;
    state.locked = false;
    state.hintShown = false;
    show('practice');
    nextPracticeProblem();
  }

  function nextPracticeProblem() {
    var skill = getSkill(state.skillId);
    var rng = MathCore.seedRandom((Date.now() & 0xffffffff) ^ Math.floor(Math.random() * 0xffff));
    var p = MathCore.nextProblem(skill, progress, { rng: rng });
    state.problems.push(p);
    state.index = state.problems.length - 1;
    state.locked = false;
    state.hintShown = false;
    renderQuestion(p);
  }

  function startQuiz(skillId) {
    state.skillId = skillId;
    state.mode = 'quiz';
    state.problems = buildQuiz(getSkill(skillId), QUIZ_LENGTH);
    state.index = 0;
    state.correct = 0;
    state.results = [];
    state.locked = false;
    state.hintShown = false;
    state.quizStart = Date.now();
    show('practice');
    renderQuestion(state.problems[0]);
  }

  function buildQuiz(skill, n) {
    var rng = MathCore.seedRandom(Date.now() & 0xffffffff);
    var step = skillProgress(skill.id).difficultyStep || 0;
    var types = (skill.types || []).map(function (x) { return typeof x === 'string' ? x : x.t; });
    var out = [];
    var lastSigs = [];
    var guard = 0;
    while (out.length < n && guard++ < n * 120) {
      var idx = Math.floor(rng() * types.length);
      var p = MathCore.generateProblem(skill, { rng: rng, difficultyStep: step, typeIndex: idx });
      if (lastSigs.indexOf(p.sig) === -1) {
        out.push(p);
        lastSigs.push(p.sig);
        if (lastSigs.length > 3) lastSigs.shift();
      }
    }
    return out;
  }

  function currentProblem() { return state.problems[state.index]; }

  function renderQuestion(p) {
    var isQuiz = state.mode === 'quiz' || state.mode === 'exam';
    var skill = state.mode === 'exam' ? null : getSkill(state.skillId);

    // 頭部
    var headHtml;
    if (state.mode === 'exam') {
      var examStage = getStage(state.examStage);
      headHtml = '<div class="practice-head"><span class="p-title">📝 ' + t('exam.title') + ' · ' + L(examStage) + '</span>' +
        '<span class="p-count">' + t('practice.question', { i: state.index + 1, n: state.problems.length }) + '</span></div>' +
        '<div class="progress-bar"><i style="width:' + Math.round(state.index / state.problems.length * 100) + '%"></i></div>';
    } else if (isQuiz) {
      var done = state.index;
      headHtml = '<div class="practice-head"><span class="p-title">' + t('quiz.title') + '</span>' +
        '<span class="p-count">' + t('practice.question', { i: state.index + 1, n: state.problems.length }) + '</span></div>' +
        '<div class="progress-bar"><i style="width:' + Math.round(done / state.problems.length * 100) + '%"></i></div>';
    } else {
      var practice = (skill.mastery && skill.mastery.practice) || 10;
      var c = skillProgress(skill.id).correct;
      headHtml = '<div class="practice-head"><span class="p-title">' + nameOf(skill) + '</span>' +
        '<span class="p-count">' + t('practice.progress') + ' ' + c + '/' + practice + '</span></div>' +
        '<div class="progress-bar"><i style="width:' + Math.min(100, Math.round(c / practice * 100)) + '%"></i></div>';
    }

    // 題干 + 視覺
    var bodyHtml = '<div class="prompt-card"><div class="prompt-text">' + renderMath(L(p.prompt)) + '</div>' +
      '<div class="prompt-visual" id="qVisual"></div></div>';

    // 選項
    var choiceHtml = '<div class="choices" id="choices">';
    if (p.type === 'comparegroup') {
      p.choices.forEach(function (c) {
        choiceHtml += '<button class="choice color-choice" type="button" data-value="' + c + '" data-key="' + c + '">' +
          '<span class="swatch" style="background:' + swatchColor(c) + '"></span>' +
          '<span>' + t('colors.' + c) + '</span></button>';
      });
    } else {
      p.choices.forEach(function (c) {
        var label = MathCore.isFraction(c) ? MathCore.renderValue(c) : String(c);
        choiceHtml += '<button class="choice" type="button" data-value="' + MathCore.renderValue(c) + '" data-key="' + MathCore.valueKey(c) + '">' + label + '</button>';
      });
    }
    choiceHtml += '</div>';

    var footerHtml = '<div class="feedback" id="feedback"></div>';
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

    choicesEl.querySelectorAll('.choice').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (state.locked) return;
        handleAnswer(btn, p);
      });
    });

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

  function handleAnswer(btn, p) {
    var inputStr = btn.getAttribute('data-value');
    var correct = MathCore.checkAnswer(p, inputStr).correct;

    if (correct) {
      state.locked = true;
      state.correct++;
      touchStreak();
      btn.classList.add('correct');
      disableChoices();
      setFeedback(pick(t('practice.correct')), 'ok');
      playTone(true);
      confetti();
      if (state.mode === 'practice') {
        MathCore.applyResult(progress, getSkill(state.skillId), p, true);
        saveProgress();
        updateTopbar();
        $('nextBtn').hidden = false;
      } else {
        state.results.push({ correct: true, problem: p });
        setTimeout(advanceQuiz, 900);
      }
    } else {
      btn.classList.add('wrong');
      btn.disabled = true;
      setFeedback(pick(t('practice.wrong')), 'no');
      playTone(false);
      if (state.mode === 'practice') {
        MathCore.applyResult(progress, getSkill(state.skillId), p, false);
        saveProgress();
        // 允許繼續嘗試
      } else {
        state.results.push({ correct: false, problem: p });
        disableChoices();
        // 高亮正確答案
        $('screen-practice').querySelectorAll('.choice').forEach(function (b) {
          if (MathCore.checkAnswer(p, b.getAttribute('data-value')).correct) b.classList.add('correct');
        });
        setTimeout(advanceQuiz, 1100);
      }
    }
  }

  function disableChoices() {
    $('screen-practice').querySelectorAll('.choice').forEach(function (b) { b.disabled = true; });
  }

  function setFeedback(msg, cls) {
    var f = $('feedback');
    f.textContent = msg;
    f.className = 'feedback ' + cls;
  }

  function advanceQuiz() {
    state.index++;
    if (state.index < state.problems.length) {
      state.locked = false;
      renderQuestion(state.problems[state.index]);
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
    MathCore.applyQuizResult(progress, skill, grade.percent);
    saveProgress();
    updateTopbar();

    var starsHtml = '';
    for (var i = 1; i <= 3; i++) starsHtml += '<span style="opacity:' + (i <= grade.stars ? 1 : 0.2) + '">★</span>';

    $('screen-practice').innerHTML =
      '<div class="result-card">' +
      '<div class="big">' + (grade.stars >= 2 ? '🎉' : (grade.stars >= 1 ? '👍' : '💪')) + '</div>' +
      '<h2>' + t('quiz.result') + '</h2>' +
      '<p class="page-sub">' + nameOf(skill) + '</p>' +
      '<div class="score">' + t('quiz.score', { c: grade.correct, t: grade.total }) + '</div>' +
      '<div class="result-stars">' + starsHtml + '</div>' +
      '<p class="page-sub">' + t('quiz.time') + '：' + Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0') + '</p>' +
      '<div class="result-actions">' +
      '<button class="btn secondary" id="quizBack" type="button">' + t('quiz.back') + '</button>' +
      '<button class="btn" id="quizRetry" type="button">' + t('quiz.retry') + '</button>' +
      '</div></div>';

    $('quizBack').addEventListener('click', function () { renderStage(state.stageId); });
    $('quizRetry').addEventListener('click', function () { startQuiz(state.skillId); });
  }

  /* ---------------- 綜合考試（模擬試卷） ---------------- */

  function renderGradeExam(stageId) {
    var stage = getStage(stageId);
    state.examStage = stageId;
    state.mode = 'exam';
    state.skillId = null;
    state.problems = buildGradeExam(stage, EXAM_LENGTH);
    state.index = 0;
    state.correct = 0;
    state.results = [];
    state.locked = false;
    state.quizStart = Date.now();
    show('practice');
    if (!state.problems.length) { toast(t('exam.empty')); renderStage(stageId); return; }
    renderQuestion(state.problems[0]);
  }

  function buildGradeExam(stage, n) {
    var skills = stageSkills(stage).filter(function (s) { return !s.scaffold && s.types && s.types.length; });
    if (!skills.length) return [];
    var rng = MathCore.seedRandom(Date.now() & 0xffffffff);
    var out = [];
    var lastSigs = [];
    var guard = 0;
    var k = 0;
    while (out.length < n && guard++ < n * 200) {
      var skill = skills[k % skills.length];
      k++;
      var types = skill.types.map(function (x) { return typeof x === 'string' ? x : x.t; });
      var ti = Math.floor(rng() * types.length);
      var step = skillProgress(skill.id).difficultyStep || 0;
      var p = MathCore.generateProblem(skill, { rng: rng, difficultyStep: step, typeIndex: ti });
      if (lastSigs.indexOf(p.sig) === -1) {
        p.skillId = skill.id;
        out.push(p);
        lastSigs.push(p.sig);
        if (lastSigs.length > 4) lastSigs.shift();
      }
    }
    for (var i = out.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = out[i]; out[i] = out[j]; out[j] = tmp;
    }
    return out;
  }

  function finishExam() {
    var stage = getStage(state.examStage);
    var grade = MathCore.gradeQuiz(state.results);
    var seconds = Math.round((Date.now() - state.quizStart) / 1000);
    var starsHtml = '';
    for (var i = 1; i <= 3; i++) starsHtml += '<span style="opacity:' + (i <= grade.stars ? 1 : 0.2) + '">★</span>';
    $('screen-practice').innerHTML =
      '<div class="result-card">' +
      '<div class="big">' + (grade.stars >= 2 ? '🎉' : (grade.stars >= 1 ? '👍' : '💪')) + '</div>' +
      '<h2>' + t('exam.result') + '</h2>' +
      '<p class="page-sub">' + L(stage) + '</p>' +
      '<div class="score">' + t('quiz.score', { c: grade.correct, t: grade.total }) + '</div>' +
      '<div class="result-stars">' + starsHtml + '</div>' +
      '<p class="page-sub">' + Math.round(grade.percent * 100) + '% · ' + t('quiz.time') + '：' + Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0') + '</p>' +
      '<div class="result-actions">' +
      '<button class="btn secondary" id="examBack" type="button">' + t('quiz.back') + '</button>' +
      '<button class="btn" id="examRetry" type="button">' + t('quiz.retry') + '</button>' +
      '</div></div>';
    $('examBack').addEventListener('click', function () { renderStage(state.examStage); });
    $('examRetry').addEventListener('click', function () { renderGradeExam(state.examStage); });
  }

  /* ---------------- 家長中心 ---------------- */

  function renderParent() {
    show('parent');
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
  }

  function confirmUnlockAll() {
    var modal = $('modal');
    modal.hidden = false;
    modal.innerHTML = '<div class="modal">' +
      '<h3>' + t('parent.unlockAll') + '</h3>' +
      '<p>' + t('parent.unlockAllConfirm') + '</p>' +
      '<div class="btn-row">' +
      '<button class="btn secondary" id="unlockCancel" type="button">' + t('common.cancel') + '</button>' +
      '<button class="btn" id="unlockOk" type="button">' + t('parent.unlockAll') + '</button>' +
      '</div></div>';
    $('unlockCancel').addEventListener('click', function () { modal.hidden = true; });
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
      saveProgress();
      modal.hidden = true;
      renderParent();
      toast(t('parent.unlockAllDone'));
    });
  }

  function exportProgress() {
    var json = JSON.stringify(progress);
    var done = function () { toast(t('parent.exported')); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(json).then(done).catch(function () { showJsonModal(json); });
    } else {
      showJsonModal(json);
    }
  }

  function importProgress() {
    showJsonModal(null, true);
  }

  function showJsonModal(existingJson, isImport) {
    var modal = $('modal');
    modal.hidden = false;
    var text = existingJson || '';
    modal.innerHTML = '<div class="modal">' +
      '<h3>' + (isImport ? t('parent.import') : t('parent.export')) + '</h3>' +
      '<p>' + (isImport ? t('parent.import') : t('parent.export')) + '</p>' +
      '<textarea id="jsonArea" rows="6" style="width:100%;border:1px solid var(--sep);border-radius:10px;padding:10px;font-family:monospace;background:var(--card-2);color:var(--text)">' + esc(text) + '</textarea>' +
      '<div class="btn-row" style="margin-top:14px">' +
      '<button class="btn secondary" id="jsonCancel" type="button">' + t('common.cancel') + '</button>' +
      (isImport ? '<button class="btn" id="jsonOk" type="button">' + t('parent.import') + '</button>'
                : '<button class="btn" id="jsonOk" type="button">' + t('common.close') + '</button>') +
      '</div></div>';
    $('jsonCancel').addEventListener('click', function () { modal.hidden = true; });
    $('jsonOk').addEventListener('click', function () {
      if (isImport) {
        try {
          var parsed = JSON.parse($('jsonArea').value);
          progress = MathCore.newProgress();
          progress.streak = parsed.streak || progress.streak;
          progress.skills = parsed.skills || {};
          progress.badges = parsed.badges || [];
          saveProgress();
          toast(t('parent.imported'));
          modal.hidden = true;
          renderParent();
        } catch (e) { toast('⚠ ' + e.message); }
      } else {
        modal.hidden = true;
      }
    });
  }

  function confirmReset() {
    var modal = $('modal');
    modal.hidden = false;
    modal.innerHTML = '<div class="modal">' +
      '<h3>' + t('parent.reset') + '</h3>' +
      '<p>' + t('parent.resetConfirm') + '</p>' +
      '<div class="btn-row">' +
      '<button class="btn secondary" id="resetCancel" type="button">' + t('common.cancel') + '</button>' +
      '<button class="btn danger-btn" id="resetOk" type="button">' + t('parent.reset') + '</button>' +
      '</div></div>';
    $('resetCancel').addEventListener('click', function () { modal.hidden = true; });
    $('resetOk').addEventListener('click', function () {
      progress = MathCore.newProgress();
      progress.lang = state.lang;
      progress.sound = state.sound;
      progress.theme = state.theme;
      saveProgress();
      modal.hidden = true;
      renderHome();
    });
  }

  /* ---------------- 公式一覽（參考） ---------------- */

  function renderFormulas() {
    show('formulas');
    var F = Formulas;
    if (!F) { $('screen-formulas').innerHTML = '<p class="page-sub">—</p>'; return; }
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
  }

  /* ---------------- 課程大綱（參考） ---------------- */

  function renderOutline() {
    show('outline');
    var o = CurriculumOutline;
    if (!o) { $('screen-outline').innerHTML = '<p class="page-sub">—</p>'; return; }
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
  }

  /* ---------------- 設置 ---------------- */

  function renderSettings() {
    show('settings');
    var html = '<h1 class="page-title">' + t('settings.title') + '</h1>' +
      '<div class="panel">' +
      '<div class="settings-row"><span class="k">' + t('settings.language') + '</span>' +
      '<button class="btn secondary" id="setLangBtn" type="button">' + t('langName') + ' ⇄</button></div>' +
      '<div class="settings-row"><span class="k">' + t('settings.sound') + '</span>' +
      '<div class="switch' + (state.sound ? ' on' : '') + '" id="soundSwitch" role="switch" aria-checked="' + state.sound + '"></div></div>' +
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
    $('soundSwitch').addEventListener('click', function () {
      state.sound = !state.sound;
      progress.sound = state.sound;
      saveProgress();
      renderSettings();
      updateTopbar();
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
    $('settingsParent').addEventListener('click', renderParent);
  }

  function themeSegBtn(value, label) {
    return '<button class="seg-btn' + (state.theme === value ? ' on' : '') + '" data-theme="' + value + '" type="button">' + label + '</button>';
  }

  function toggleLang() {
    state.lang = state.lang === 'zh' ? 'en' : 'zh';
    progress.lang = state.lang;
    saveProgress();
    // 重新渲染當前屏幕
    switch (state.screen) {
      case 'home': renderHome(); break;
      case 'stage': renderStage(state.stageId); break;
      case 'lesson': renderLesson(state.skillId); break;
      case 'practice': renderQuestion(currentProblem()); break;
      case 'parent': renderParent(); break;
      case 'settings': renderSettings(); break;
    }
    updateTopbar();
  }

  /* ---------------- 啟動 ---------------- */

  function bindTopbar() {
    $('backBtn').addEventListener('click', back);
    $('langBtn').addEventListener('click', toggleLang);
    $('settingsBtn').addEventListener('click', renderSettings);
  }

  /* 註冊 Service Worker（僅在 http/https 下，供離線與安裝成 App） */
  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    if (location.protocol !== 'http:' && location.protocol !== 'https:') return;
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').then(function (reg) {
        reg.update().catch(function () { /* 忽略 */ });
      }).catch(function () { /* 忽略 */ });
      // 有新版 Service Worker 接管時自動重新載入，確保拿到最新版本
      var reloading = false;
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (reloading) return;
        reloading = true;
        window.location.reload();
      });
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

  function init() {
    bindTopbar();
    applyTheme();
    registerSW();
    renderHome();
  }

  /* 腳本位於 <body> 末尾，DOM 已就緒，直接初始化 */
  init();

  /* 調試/測試鉤子（生產環境無害） */
  window.__mathApp = {
    getState: function () { return state; },
    getProgress: function () { return progress; },
    currentProblem: function () { return currentProblem(); }
  };
})();
