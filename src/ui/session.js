/*
 * 未完成題組（ESM）：sessionStorage 24h TTL 的讀寫、驗證、恢復。
 * 導航/開始題組等跨模組動作透過 ./context.js 注入。
 */
import { MathCore } from './globals.js';
import { state, progress, SESSION_KEY, SESSION_VERSION, SESSION_TTL } from './state.js';
import { parseHash, serializeRoute, sameRoute } from './router.js';
import { getSkill, getStage } from './selectors.js';
import { t, nameOf, L } from './i18n.js';
import { app } from './context.js';
import { nav } from './nav-state.js';
import { renderQuestion } from './assessment.js';

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
    } else if (s.skillId !== parsed.skillId || s.stageId !== app.skillStageId(parsed.skillId)) {
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
    var resolved = app.resolveRoute(parsed);
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
        route: serializeRoute(app.currentRoute()),
        mode: state.mode,
        stageId: state.mode === 'exam' ? state.examStage : app.skillStageId(state.skillId),
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
    state.stageId = parsed.screen === 'exam' ? parsed.stageId : app.skillStageId(parsed.skillId);
    state.problems = s.problems;
    state.index = s.index;
    state.correct = s.correct || 0;
    state.results = Array.isArray(s.results) ? s.results : [];
    state.quizStart = s.quizStart || Date.now();
    state.locked = false;
    state.hintShown = false;
    state.attemptWrong = false;
    state.run = { mode: parsed.screen, key: parsed.screen === 'exam' ? parsed.stageId : parsed.skillId };
    renderQuestion(state.problems[state.index]);
    app.show('practice');
    saveSession(); // 刷新 savedAt：繼續學習後再給 24 小時
  }

  /* 首頁 Continue 卡：重新驗證後恢復同一題 */
  function resumeSession() {
    var s = readSession();
    var parsed = s ? parseHash(s.route) : null;
    var route = parsed ? app.resolveRoute(parsed) : null;
    if (!s || !route || !sameRoute(route, parsed)) {
      clearSession();
      renderHome();
      return;
    }
    var hash = serializeRoute(route);
    app.writeHash(hash, false);
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

export { clearSession, validateSession, readSession, saveSession, restoreSession, resumeSession, sessionSummary };
