/* Service Worker 更新（ESM）：更新 chip、接受更新、註冊、強制更新。 */
import { t } from './i18n.js';
import { $ } from './dom.js';
import { updateState } from './sw-state.js';

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


export { showUpdateChip, acceptUpdate, registerSW, forceUpdate };
