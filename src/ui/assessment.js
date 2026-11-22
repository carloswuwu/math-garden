/*
 * 練習／測驗／綜合考試（ESM）：出題、作答、回饋、計分、成績。
 * 跨層動作（導航、儲存、app.toast、路由重繪）透過 ./context.js 的 app 注入。
 */
import { MathCore, I18N, Curriculum } from './globals.js';
import { state, progress, saveProgress, QUIZ_LENGTH, EXAM_LENGTH, EXAM_PASS, HOME_ROUTE } from './state.js';
import { t, L, nameOf } from './i18n.js';
import { esc, renderMath } from './format.js';
import { getSkill, getStage, stageSkills, skillProgress, masteryOf } from './selectors.js';
import { renderVisual, swatchColor } from './visual.js';
import { $ } from './dom.js';
import { focusEl, isVisible, restoreFocus, focusScreen, isTypingTarget, choiceButtons } from './a11y.js';
import { app } from './context.js';

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
    state.stageId = app.skillStageId(skillId);
    state.examStage = null;
    state.mode = 'practice';
    state.problems = [];
    state.index = 0;
    state.correct = 0;
    state.results = [];
    state.quizStart = 0;
    state.locked = false;
    state.hintShown = false;
    state.attemptWrong = false;
    state.run = { mode: 'practice', key: skillId };
    nextPracticeProblem();
    app.show('practice');
    app.saveSession();
  }

  function nextPracticeProblem() {
    var skill = getSkill(state.skillId);
    var rng = MathCore.seedRandom((Date.now() & 0xffffffff) ^ Math.floor(Math.random() * 0xffff));
    var p = MathCore.nextProblem(skill, progress, { rng: rng, avoid: state.problems.slice(-4) });
    state.problems.push(p);
    state.index = state.problems.length - 1;
    state.locked = false;
    state.hintShown = false;
    state.attemptWrong = false;
    renderQuestion(p);
    app.saveSession();
  }

  function startQuiz(skillId) {
    state.skillId = skillId;
    state.stageId = app.skillStageId(skillId);
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
    app.show('practice');
    app.saveSession();
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
      app.touchStreak();
      app.playTone(true);
      app.confetti();
      if (state.mode === 'practice') {
        MathCore.applyResult(progress, getSkill(state.skillId), p, true, { credit: !state.attemptWrong });
        saveProgress();
        app.updateTopbar();
        $('nextBtn').hidden = false;
      } else {
        state.results.push({ correct: true, problem: p });
        setTimeout(advanceQuiz, delayMs || 900);
      }
    } else {
      app.playTone(false);
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
      setFeedback(state.mode === 'practice' && state.attemptWrong ? t('practice.correctRetry') : app.pick(t('practice.correct')), 'ok');
      gradeAnswered(p, true);
      return;
    }
    btn.classList.add('wrong');
    btn.disabled = true;
    btn.setAttribute('aria-disabled', 'true');
    setFeedback(app.pick(t('practice.wrong')), 'no');
    if (state.mode === 'practice') {
      state.attemptWrong = true;
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
      setFeedback(state.mode === 'practice' && state.attemptWrong ? t('practice.correctRetry') : app.pick(t('practice.correct')), 'ok');
      gradeAnswered(p, true);
      return;
    }
    if (state.mode === 'practice') {
      state.attemptWrong = true;
      setFeedback(app.pick(t('practice.wrong')), 'no');
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
    if (!state.problems.length) { app.toast(t('exam.empty')); renderStage(stageId); return; }
    renderQuestion(state.problems[0]);
    app.show('practice');
    app.saveSession();
  }

  /* 綜合考試組卷：跨技能、每技能最多 3 題、同模板最多 2 題；
   * 約 2/3 題目用最高難度級別，其餘用學習者目前級別（至少 1），令試卷不再全部最淺。 */
  function buildGradeExam(stage, n) {
    var skills = stageSkills(stage).filter(function (s) { return !s.scaffold && s.types && s.types.length; });
    /* 大學階段只有 3 個技能，加入 S6 技能令 20 題考試有足夠橫向覆蓋 */
    if (stage.id === 'college') {
      var prev = getStage('hs3');
      if (prev) {
        stageSkills(prev).forEach(function (s) {
          if (s && !s.scaffold && s.types && s.types.length && skills.indexOf(s) === -1) skills.push(s);
        });
      }
    }
    if (!skills.length) return [];
    var rng = MathCore.seedRandom(Date.now() & 0xffffffff);
    var exam = MathCore.composeExam(skills, n, {
      rng: rng,
      maxPerSkill: Math.max(3, Math.ceil((n || 20) / skills.length)),
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
    app.clearSession();

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
    app.updateTopbar();

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
    $('examBack').addEventListener('click', function () { app.navigate({ screen: 'stage', stageId: state.examStage }); });
    $('examRetry').addEventListener('click', function () { renderGradeExam(state.examStage); });
    app.show('practice');
    var examAnnouncer = $('announcer');
    if (examAnnouncer) examAnnouncer.textContent = t('exam.result');
  }


  function advanceQuiz() {
    state.index++;
    if (state.index < state.problems.length) {
      state.locked = false;
      state.attemptWrong = false;
      renderQuestion(state.problems[state.index]);
      app.saveSession();
    } else if (state.mode === 'exam') {
      finishExam();
    } else {
      finishQuiz();
    }
  }

  function finishQuiz() {
    var skill = getSkill(state.skillId);
    var quizPass = (skill.mastery && skill.mastery.quizPass) || 0.8;
    var grade = MathCore.gradeQuiz(state.results, quizPass);
    var seconds = Math.round((Date.now() - state.quizStart) / 1000);
    app.clearSession();
    MathCore.applyQuizResult(progress, skill, grade.percent);
    saveProgress();
    app.updateTopbar();

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

    $('quizBack').addEventListener('click', function () { app.navigate({ screen: 'stage', stageId: app.skillStageId(state.skillId) }); });
    $('quizRetry').addEventListener('click', function () { startQuiz(state.skillId); });
    app.show('practice');
    var quizAnnouncer = $('announcer');
    if (quizAnnouncer) quizAnnouncer.textContent = t('quiz.result');
  }
export {
  progressBarHTML, choiceAriaLabel, startPractice, nextPracticeProblem, startQuiz, applyTypedAssessment,
  buildQuiz, currentProblem, choiceLabel, renderQuestion, gradeAnswered, handleAnswer, handleTypedAnswer,
  disableChoices, setFeedback, advanceQuiz, finishQuiz, renderGradeExam, buildGradeExam, finishExam
};
