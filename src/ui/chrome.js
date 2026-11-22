/* 介面外殼（ESM）：主題/語言、音效、toast、連續天數、頂欄按鈕。 */
import { state, progress, saveProgress } from './state.js';
import { t } from './i18n.js';
import { $ } from './dom.js';
import { app } from './context.js';
import { back, navigate, renderRouteSafely, currentRoute } from './nav.js';

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme || 'light');
  }

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

  function bindTopbar() {
    $('backBtn').addEventListener('click', back);
    $('langBtn').addEventListener('click', toggleLang);
    $('settingsBtn').addEventListener('click', function () { navigate({ screen: 'settings' }); });
    var chip = $('updateChip');
    if (chip) chip.addEventListener('click', app.acceptUpdate);
  }

  function toggleLang() {
    state.lang = state.lang === 'zh' ? 'en' : 'zh';
    progress.lang = state.lang;
    app.saveProgress();
    app.applyLang();
    // 依目前 route 重新渲染（不在這裡另寫畫面分支）
    renderRouteSafely(currentRoute());
    app.updateTopbar();
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export { applyTheme, applyLang, playTone, confetti, toast, touchStreak, bindTopbar, toggleLang, pick };
