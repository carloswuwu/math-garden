/* 無障礙輔助（ESM）：焦點管理、背景 inert、modal tab trap、鍵盤判斷。 */
import { state } from './state.js';
import { $, screens } from './dom.js';

  function focusEl(el) {
    if (!el || typeof el.focus !== 'function') return false;
    try { el.focus(); } catch (e) { return false; }
    return document.activeElement === el;
  }

  function isVisible(el) {
    if (!el || !document.contains(el)) return false;
    var node = el;
    while (node && node.nodeType === 1) {
      if (node.hidden === true) return false;
      if (typeof window.getComputedStyle === 'function') {
        try {
          var st = window.getComputedStyle(node);
          if (st && st.display === 'none') return false;
        } catch (e) { /* 忽略 */ }
      }
      node = node.parentNode;
    }
    return true;
  }

  function restoreFocus(el) {
    if (isVisible(el)) return focusEl(el);
    return false;
  }

  function focusScreen() {
    var screen = $('screen-' + state.screen);
    if (!screen) return false;
    var node = screen.querySelector('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
    return focusEl(node);
  }

  function isTypingTarget(el) {
    if (!el) return false;
    var tag = (el.tagName || '').toUpperCase();
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable === true;
  }

  function choiceButtons() {
    var box = $('choices');
    if (!box) return [];
    return Array.prototype.slice.call(box.querySelectorAll('.choice'));
  }

  function modalFocusables() {
    var modal = $('modal');
    if (!modal) return [];
    var nodes = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    return Array.prototype.filter.call(nodes, function (el) {
      if (el.disabled) return false;
      if (el.hasAttribute('hidden')) return false;
      if (el.getAttribute('aria-hidden') === 'true') return false;
      return true;
    });
  }

  function setBackgroundInert(on) {
    ['main', 'topbar', 'updateChip', 'skipLink'].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      if (on) {
        el.setAttribute('inert', '');
        el.setAttribute('aria-hidden', 'true');
      } else {
        el.removeAttribute('inert');
        el.removeAttribute('aria-hidden');
      }
    });
  }

  function trapModalTab(e) {
    var modal = $('modal');
    var items = modalFocusables();
    if (!items.length) {
      e.preventDefault();
      focusEl(modal);
      return;
    }
    var first = items[0];
    var last = items[items.length - 1];
    var idx = items.indexOf(document.activeElement);
    if (idx === -1) {
      e.preventDefault();
      focusEl(e.shiftKey ? last : first);
      return;
    }
    if (!e.shiftKey && idx === items.length - 1) {
      e.preventDefault();
      focusEl(first);
    } else if (e.shiftKey && idx === 0) {
      e.preventDefault();
      focusEl(last);
    }
  }

export { focusEl, isVisible, restoreFocus, focusScreen, isTypingTarget, choiceButtons, modalFocusables, setBackgroundInert, trapModalTab };
