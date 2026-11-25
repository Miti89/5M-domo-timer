/**
 * CASPER — Shared Asset & Service Worker Version (version.js)
 * Single source of truth for cache busting and sw.js CACHE_NAME.
 */
(function (global) {
  'use strict';
  const CASPER_VERSION = '1.7.0';
  global.CASPER_VERSION = CASPER_VERSION;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CASPER_VERSION: CASPER_VERSION };
  }
})(typeof self !== 'undefined' ? self : (typeof window !== 'undefined' ? window : globalThis));
