/* 對話框（ESM）：modal 焦點管理、家長中心確認/匯入匯出。 */
import { MathCore } from './globals.js';
import { state, progress, setProgress, saveProgress } from './state.js';
import { t } from './i18n.js';
import { esc } from './format.js';
import { $ } from './dom.js';
import { focusEl, isVisible, focusScreen, modalFocusables, restoreFocus, setBackgroundInert, trapModalTab } from './a11y.js';
import { modalState } from './modal-state.js';
import { updateState } from './sw-state.js';
import { toast, applyTheme, applyLang } from './chrome.js';
import { clearSession } from './session.js';
import { renderParent } from './screens.js';
import { realStageList } from './selectors.js';
import { app } from './context.js';

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



export { showModal, closeModal, confirmUnlockAll, exportProgress, importProgress, showJsonModal, confirmReset };
