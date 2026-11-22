/* 鍵盤操作（ESM）：數字選答、方向鍵、Enter/空格、Esc。 */
import { state } from './state.js';
import { $ } from './dom.js';
import { isTypingTarget, choiceButtons, trapModalTab, focusEl } from './a11y.js';
import { modalState } from './modal-state.js';
import { closeModal } from './dialog.js';
import { app } from './context.js';

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


export { handlePracticeKeys, onGlobalKeydown };
