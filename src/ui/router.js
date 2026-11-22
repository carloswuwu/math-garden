/* 路由純函數（ESM）：hash parse/serialize 與 route 比較；不依賴 state。 */

  function parseHash(hash) {
    if (typeof hash !== 'string' || hash.length > 256) return null;
    var m = /^#\/([a-z]+)(?:\/([A-Za-z0-9._-]+))?$/.exec(hash);
    if (!m) return null;
    var screen = m[1];
    var param = m[2] || null;
    if (screen === 'home' || screen === 'parent' || screen === 'settings' || screen === 'outline' || screen === 'formulas') {
      return param ? null : { screen: screen };
    }
    if (screen === 'stage' || screen === 'exam') return param ? { screen: screen, stageId: param } : null;
    if (screen === 'lesson' || screen === 'practice' || screen === 'quiz') return param ? { screen: screen, skillId: param } : null;
    return null;
  }

  function serializeRoute(route) {
    if (!route || typeof route !== 'object') return '#/home';
    var screen = route.screen;
    if (screen === 'stage' || screen === 'exam') return route.stageId ? '#/' + screen + '/' + route.stageId : '#/home';
    if (screen === 'lesson' || screen === 'practice' || screen === 'quiz') return route.skillId ? '#/' + screen + '/' + route.skillId : '#/home';
    if (screen === 'home' || screen === 'parent' || screen === 'settings' || screen === 'outline' || screen === 'formulas') return '#/' + screen;
    return '#/home';
  }

  function sameRoute(a, b) { return serializeRoute(a) === serializeRoute(b); }

export { parseHash, serializeRoute, sameRoute };
