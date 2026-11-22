/*
 * 畫面渲染（ESM）：首頁、階段/技能、小課堂、家長中心、公式、大綱、設置。
 * 跨層動作（app.navigate/app.show/app.startPractice/...）透過 ./context.js 的 app 物件注入，避免循環 import。
 */
import { MathCore, I18N, Curriculum, CurriculumOutline, Formulas, Lessons } from './globals.js';
import { state, progress } from './state.js';
import { t, L, nameOf, goalOf } from './i18n.js';
import { esc, renderMath } from './format.js';
import {
  getSkill, getStage, stageSkills, skillProgress, masteryOf, totalStars, isPassed, realStageList, stageComplete, stageUnlocked, stageSkillStats
} from './selectors.js';
import { dotsHTML, swatchColor, fractionSVG, visualAlt, renderVisual } from './visual.js';
import { $ } from './dom.js';
import { app } from './context.js';

  /* ---------------- 首頁 ---------------- */

  function renderHome() {
    var realStages = realStageList();
    var unlockedCount = 0;
    var session = app.sessionSummary();
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
      el.addEventListener('click', function () { app.navigate({ screen: 'stage', stageId: el.getAttribute('data-stage') }); });
    });
    $('homeFormulasBtn').addEventListener('click', function () { app.navigate({ screen: 'formulas' }); });
    $('homeOutlineBtn').addEventListener('click', function () { app.navigate({ screen: 'outline' }); });
    $('homeParentBtn').addEventListener('click', function () { app.navigate({ screen: 'parent' }); });
    var continueBtn = $('homeContinue');
    if (continueBtn) continueBtn.addEventListener('click', app.resumeSession);
    var challengeBtn = $('homeChallengeBtn');
    if (challengeBtn) challengeBtn.addEventListener('click', function () { app.navigate({ screen: 'stage', stageId: 'challenge' }); });
    app.show('home');
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
    if (examBtn) examBtn.addEventListener('click', function () { app.navigate({ screen: 'exam', stageId: stageId }); });
    bindStageCards();
    app.show('stage');
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
        if (locked) { app.toast(t('skill.unlockHint')); return; }
        app.navigate({ screen: 'lesson', skillId: id });
      });
      var goBtn = el.querySelector('[data-action="go"]');
      if (goBtn) {
        goBtn.addEventListener('click', function (ev) {
          ev.stopPropagation();
          if (locked) { app.toast(t('skill.unlockHint')); return; }
          app.navigate({ screen: 'lesson', skillId: id });
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
      if (l.visual || lesson.visual) {
        html += '<div class="lesson-visual" id="lessonVisual"></div>';
      }
      if (l.steps && l.steps.length) {
        html += '<div class="lesson-label">' + t('lesson.steps') + '</div><ol class="lesson-steps">' +
          l.steps.map(function (step) { return '<li>' + renderMath(step) + '</li>'; }).join('') + '</ol>';
      }
      html += '<div class="lesson-label">' + t('lesson.example') + '</div><p class="lesson-text">' + renderMath(l.example) + '</p>' +
        '<div class="lesson-label">' + t('lesson.tip') + '</div><p class="lesson-text">' + renderMath(l.tip) + '</p>';
      if (l.mistake) {
        html += '<div class="lesson-label">' + t('lesson.mistake') + '</div><p class="lesson-text lesson-mistake">' + renderMath(l.mistake) + '</p>';
      }
      if (l.glossary && l.glossary.length) {
        html += '<div class="lesson-label">' + t('lesson.glossary') + '</div><dl class="lesson-glossary">' +
          l.glossary.map(function (g) {
            return '<div><dt>' + renderMath(g.term) + '</dt><dd>' + renderMath(g.def) + '</dd></div>';
          }).join('') + '</dl>';
      }
      html += '</div>' +
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

    if (lesson && (l.visual || lesson.visual)) {
      renderVisual($('lessonVisual'), l.visual || lesson.visual, null);
    }
    if (lesson) {
      $('lessonExample').addEventListener('click', function () { showWorkedExample(skillId); });
    }
    $('lessonPractice').addEventListener('click', function () { app.navigate({ screen: 'practice', skillId: skillId }); });
    $('lessonQuiz').addEventListener('click', function () { app.navigate({ screen: 'quiz', skillId: skillId }); });
    app.show('lesson');
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
    $('parentUnlock').addEventListener('click', app.confirmUnlockAll);
    $('parentExport').addEventListener('click', app.exportProgress);
    $('parentImport').addEventListener('click', app.importProgress);
    $('parentReset').addEventListener('click', app.confirmReset);
    app.show('parent');
  }


  /* ---------------- 公式一覽（參考） ---------------- */

  function renderFormulas() {
    var F = Formulas;
    if (!F) { $('screen-formulas').innerHTML = '<p class="page-sub">—</p>'; app.show('formulas'); return; }
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
    app.show('formulas');
  }


  /* ---------------- 課程大綱（參考） ---------------- */

  function renderOutline() {
    var o = CurriculumOutline;
    if (!o) { $('screen-outline').innerHTML = '<p class="page-sub">—</p>'; app.show('outline'); return; }
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
    app.show('outline');
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
    $('setLangBtn').addEventListener('click', function () { app.toggleLang(); });
    var toggleSound = function () {
      state.sound = !state.sound;
      progress.sound = state.sound;
      app.saveProgress();
      renderSettings();
      app.updateTopbar();
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
        app.saveProgress();
        app.applyTheme();
        renderSettings();
      });
    });
    $('settingsRefresh').addEventListener('click', app.forceUpdate);
    $('settingsParent').addEventListener('click', function () { app.navigate({ screen: 'parent' }); });
    app.show('settings');
  }

  function themeSegBtn(value, label) {
    return '<button class="seg-btn' + (state.theme === value ? ' on' : '') + '" data-theme="' + value + '" type="button">' + label + '</button>';
  }



export {
  renderHome, renderStage, renderSkillCard, bindStageCards, renderLesson, showWorkedExample,
  renderParent, renderFormulas, renderOutline, renderSettings, themeSegBtn
};
