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



  /* ---------------- DOM ---------------- */

  /* ---------------- 工具 ---------------- */
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  /* 文字中的 $...$ 會用 KaTeX 渲染成數學式；其餘照常轉義（無 KaTeX 時退回純文字） */


  /* ---------------- 未完成題組（sessionStorage，24 小時 TTL） ----------------
   * 只存未完成的練習/測驗/考試；完成即清除；不寫入 progress schema。 */



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


  /* ---------------- 路由（純函數）與導航 ---------------- */

  /* 純函數：把 location.hash 解析為 route；無法辨識時回傳 null。
   * 只接受 #/... 片段；skip link 之類的錨點（#main）不是路由。 */

  /* 純函數：route → 規範化 hash（無法辨識的 route 一律回 #/home） */


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

  /* ---------------- 鍵盤操作（數字選答 / 方向鍵 / Esc / Tab 陷阱） ---------------- */


  /* 元素是否仍可見（父層 hidden / display:none 時不應搶焦點） */


  /* 重新渲染後把焦點放回當前屏幕的第一個可聚焦元素，避免焦點掉到 body */



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

  var modalState = { open: false, opener: null };


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
  function toggleLang() {
    state.lang = state.lang === 'zh' ? 'en' : 'zh';
    progress.lang = state.lang;
    app.saveProgress();
    app.applyLang();
    // 依目前 route 重新渲染（不在這裡另寫畫面分支）
    renderRouteSafely(currentRoute());
    app.updateTopbar();
  }

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
    writeHash: writeHash
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
