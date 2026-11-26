/**
 * CASPER — Shared Asset & Service Worker Version + Update Policy Helpers (version.js)
 * Single source of truth for cache busting, sw.js CACHE_NAME, and non-disruptive SW update gating.
 */
(function (global) {
  'use strict';

  const CASPER_VERSION = '1.8.0';
  const UPDATE_CHECK_MIN_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

  /**
   * Show the "새 버전이 준비됐어요" banner ONLY when a waiting SW exists
   * and no timer session is actively running.
   */
  function shouldShowUpdateBanner(hasWaitingWorker, isTimerRunning) {
    return Boolean(hasWaitingWorker) && !Boolean(isTimerRunning);
  }

  /**
   * Reload on SW controllerchange ONLY when the user explicitly clicked "적용"
   * (ignores first-visit clients.claim() controllerchange events).
   */
  function shouldReloadOnControllerChange(opts) {
    const o = opts || {};
    return Boolean(o.requested) && !Boolean(o.alreadyReloading);
  }

  /**
   * Throttle registration.update() checks on visibilitychange to at most once per hour.
   */
  function shouldCheckForUpdate(lastCheckMs, nowMs, minIntervalMs) {
    const interval = typeof minIntervalMs === 'number' ? minIntervalMs : UPDATE_CHECK_MIN_INTERVAL_MS;
    if (!lastCheckMs || typeof lastCheckMs !== 'number') return true;
    const now = typeof nowMs === 'number' ? nowMs : Date.now();
    return (now - lastCheckMs) >= interval;
  }

  const CasperVersion = {
    CASPER_VERSION: CASPER_VERSION,
    UPDATE_CHECK_MIN_INTERVAL_MS: UPDATE_CHECK_MIN_INTERVAL_MS,
    shouldShowUpdateBanner: shouldShowUpdateBanner,
    shouldReloadOnControllerChange: shouldReloadOnControllerChange,
    shouldCheckForUpdate: shouldCheckForUpdate
  };

  global.CASPER_VERSION = CASPER_VERSION;
  global.CasperVersion = CasperVersion;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CasperVersion;
  }
})(typeof self !== 'undefined' ? self : (typeof window !== 'undefined' ? window : globalThis));
