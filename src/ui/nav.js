/*
 * 路由與導航（ESM）：resolveRoute、show、navigate、hashchange/popstate、錯誤畫面。
 * 畫面渲染直接 import screens/assessment；跨模組動作透過 context.app。
 */
import { state, progress, HOME_ROUTE } from './state.js';
import { t, L, nameOf } from './i18n.js';
import { esc } from './format.js';
import { parseHash, serializeRoute, sameRoute } from './router.js';
import { nav } from './nav-state.js';
import { modalState } from './modal-state.js';
import { $, screens } from './dom.js';
import { focusScreen } from './a11y.js';
import {
  getSkill, getStage, stageSkills, skillProgress, masteryOf, totalStars, isPassed, realStageList, stageComplete, stageUnlocked, stageSkillStats
} from './selectors.js';
import {
  renderHome, renderStage, renderLesson, renderParent, renderFormulas, renderOutline, renderSettings
} from './screens.js';
import { currentProblem, startPractice, startQuiz, renderGradeExam } from './assessment.js';
import { app } from './context.js';

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
    if (modalState.open) app.closeModal({ restore: false }); // Back/Forward 時收起對話框
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
   * 否則（含已完成）重新開始；未完成 session 的恢復在 app.init / Continue 卡處理。 */
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
    if (exportBtn) exportBtn.addEventListener('click', function () { app.exportProgress(); });
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




export { currentRoute, skillStageId, parentOf, isRealStage, stageHasExam, skillLockedInStage, resolveRoute, writeHash, show, updateTopbar, navigate, onLocationChange, renderRoute, renderAssessmentRoute, renderRouteSafely, renderError, back };
