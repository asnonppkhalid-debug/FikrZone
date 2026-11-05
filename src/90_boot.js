'use strict';
/* ============ الإقلاع ============ */
(function boot() {
  Store.load();
  applySettings();
  buildShell();
  window.addEventListener('hashchange', () => Router.render());
  try { matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => applySettings()); } catch (e) { }
  window.addEventListener('beforeunload', () => Store.flush());
  window.addEventListener('pagehide', () => Store.flush());
  Object.assign(MV, { Router, Play, Store, D, Adapt, Skill, Daily, Chal, Streak, REALMS, REALM, h, s, kit, RNG, Sound, ACH, checkAchievements, levelInfo });
  Router.render();
  if (location.search.includes('mvtest')) MV.testMode = true;
})();
