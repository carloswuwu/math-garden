/*
 * 數學樂園 · Math Garden — 界面交互邏輯（ESM 來源）。
 * 由 build step 0 生成 root app.js（classic IIFE），file:// / legacy 部署照舊。
 * 引擎與內容依賴透過 ./globals.js 讀取 build 後仍存在的 window.* 全局。
 */
import { MathCore, I18N, Curriculum, CurriculumOutline, Formulas, Lessons } from './globals.js';
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



  /* ---------------- 對話框（角色 / 焦點管理 / Tab 陷阱 / Esc 關閉） ---------------- */



  /* 對話框開啟時把背景（主內容／頂欄／更新 chip／skip link）設為 inert + aria-hidden，
   * 關閉時還原；焦點只在對話框內循環。 */

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
          setProgress(MathCore.sanitizeProgress(parsed));
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
      setProgress(MathCore.newProgress());
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

  /* ---------------- 啟動 ---------------- */


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
    showUpdateChip: showUpdateChip,
    acceptUpdate: acceptUpdate,
    session: {
      key: SESSION_KEY,
      read: readSession,
      clear: clearSession
    }
  };

export { init };
