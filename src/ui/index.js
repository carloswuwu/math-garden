/*
 * 數學樂園 · Math Garden — 界面交互邏輯（ESM 來源）。
 * 由 build step 0 生成 root app.js（classic IIFE），file:// / legacy 部署照舊。
 * 引擎與內容依賴透過 ./globals.js 讀取 build 後仍存在的 window.* 全局。
 */
import { MathCore, I18N, Curriculum, CurriculumOutline, Formulas } from './globals.js';
import { ensureLessons } from './lessons-loader.js';
import { esc, renderMath } from './format.js';
import { parseHash, serializeRoute, sameRoute } from './router.js';
import {
  STORE_KEY, LEGACY_STORE_KEY, SESSION_KEY, SESSION_VERSION, SESSION_TTL, QUIZ_LENGTH, EXAM_LENGTH, EXAM_PASS, HOME_ROUTE,
  state, progress, setProgress, loadProgress, saveProgress
} from './state.js';
import { t, L, nameOf, goalOf } from './i18n.js';
import {
  getSkill, getStage, stageSkills, skillProgress, masteryOf, totalStars, isPassed, realStageList, stageComplete, stageUnlocked, stageSkillStats
} from './selectors.js';
import { dotsHTML, swatchColor, fractionSVG, visualAlt, renderVisual } from './visual.js';
import { $, screens } from './dom.js';
import { focusEl, isVisible, restoreFocus, focusScreen, isTypingTarget, choiceButtons, modalFocusables, setBackgroundInert, trapModalTab } from './a11y.js';
import { app } from './context.js';
import { nav } from './nav-state.js';
import { modalState } from './modal-state.js';
import {
  renderHome, renderStage, renderSkillCard, bindStageCards, renderLesson, showWorkedExample,
  renderParent, renderFormulas, renderOutline, renderSettings, themeSegBtn
} from './screens.js';
import {
  progressBarHTML, choiceAriaLabel, startPractice, nextPracticeProblem, startQuiz, applyTypedAssessment,
  buildQuiz, currentProblem, choiceLabel, renderQuestion, gradeAnswered, handleAnswer, handleTypedAnswer,
  disableChoices, setFeedback, advanceQuiz, finishQuiz, renderGradeExam, buildGradeExam, finishExam
} from './assessment.js';
import { clearSession, validateSession, readSession, saveSession, restoreSession, resumeSession, sessionSummary } from './session.js';
import { applyTheme, applyLang, playTone, confetti, toast, touchStreak, bindTopbar, toggleLang, pick } from './chrome.js';
import { showModal, closeModal, confirmUnlockAll, exportProgress, importProgress, showJsonModal, confirmReset } from './dialog.js';
import { showUpdateChip, acceptUpdate, registerSW, forceUpdate } from './sw.js';
import { handlePracticeKeys, onGlobalKeydown } from './keyboard.js';
import { currentRoute, skillStageId, parentOf, isRealStage, stageHasExam, skillLockedInStage, resolveRoute, writeHash, show, updateTopbar, navigate, onLocationChange, renderRoute, renderAssessmentRoute, renderRouteSafely, renderError, back } from './nav.js';



  /* ---------------- DOM ---------------- */

  /* ---------------- 工具 ---------------- */

  /* 文字中的 $...$ 會用 KaTeX 渲染成數學式；其餘照常轉義（無 KaTeX 時退回純文字） */


  /* ---------------- 未完成題組（sessionStorage，24 小時 TTL） ----------------
   * 只存未完成的練習/測驗/考試；完成即清除；不寫入 progress schema。 */




  /* 語言切換時同步 <html lang>，讓屏幕閱讀器用正確的語言發音 */

  /* ---------------- 音效 ---------------- */
  var audioCtx = null;




  /* ---------------- 視覺渲染 ---------------- */


  /* ---------------- 路由（純函數）與導航 ---------------- */

  /* 純函數：把 location.hash 解析為 route；無法辨識時回傳 null。
   * 只接受 #/... 片段；skip link 之類的錨點（#main）不是路由。 */

  /* 純函數：route → 規範化 hash（無法辨識的 route 一律回 #/home） */


  /* 當前 state → route（未驗證；驗證交給 resolveRoute） */
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


  /* 跨模組注入（screens → index/nav/assessment） */
  Object.assign(app, {
    navigate: navigate,
    show: show,
    startPractice: startPractice,
    startQuiz: startQuiz,
    renderGradeExam: renderGradeExam,
    resumeSession: resumeSession,
    readSession: readSession,
    confirmUnlockAll: confirmUnlockAll,
    exportProgress: exportProgress,
    importProgress: importProgress,
    confirmReset: confirmReset,
    applyTheme: applyTheme,
    applyLang: applyLang,
    updateTopbar: updateTopbar,
    toast: toast,
    saveProgress: saveProgress,
    toggleLang: toggleLang,
    bindTopbar: bindTopbar,
    renderRouteSafely: renderRouteSafely,
    currentRoute: currentRoute,
    finishExam: finishExam,
    renderQuestion: renderQuestion,
    advanceQuiz: advanceQuiz,
    finishQuiz: finishQuiz,
    sessionSummary: sessionSummary,
    forceUpdate: forceUpdate,
    pick: pick,
    clearSession: clearSession,
    saveSession: saveSession,
    playTone: playTone,
    confetti: confetti,
    touchStreak: touchStreak,
    skillStageId: skillStageId,
    resolveRoute: resolveRoute,
    writeHash: writeHash,
    closeModal: closeModal,
    init: init,
    acceptUpdate: acceptUpdate
  });

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
    ensureLessons: ensureLessons,
    showUpdateChip: showUpdateChip,
    acceptUpdate: acceptUpdate,
    session: {
      key: SESSION_KEY,
      read: readSession,
      clear: clearSession
    }
  };

export { init };
