/* CASPER — Offline-Safe Service Worker (sw.js)
 * Phase 4: Route-aware caching (navigate -> network-first, ?v= -> cache-first, external -> passthrough).
 * Never force-reloads an active timer session.
 */
(function (global) {
  'use strict';

  if (typeof global.importScripts === 'function') {
    try {
      global.importScripts('version.js');
    } catch (e) {}
  }

  const VERSION = String(global.CASPER_VERSION || '1.7.0');
  const CACHE_NAME = 'casper-v' + VERSION;
  const ASSETS = [
    './',
    './index.html',
    './version.js?v=' + VERSION,
    './styles.css?v=' + VERSION,
    './timer-core.js?v=' + VERSION,
    './audio-engine.js?v=' + VERSION,
    './music-player.js?v=' + VERSION,
    './atelier-engine.js?v=' + VERSION,
    './storage.js?v=' + VERSION,
    './cheers-engine.js?v=' + VERSION,
    './algebra-watch-engine.js?v=' + VERSION,
    './satellite-engine.js?v=' + VERSION,
    './jump-watch-engine.js?v=' + VERSION,
    './cycloid-watch-engine.js?v=' + VERSION,
    './geometry-watch-engine.js?v=' + VERSION,
    './casper-info.js?v=' + VERSION,
    './app.js?v=' + VERSION,
    './manifest.json?v=' + VERSION,
    './cheers.json',
    './icon.svg',
    './icon-192.png',
    './icon-512.png',
    './icon-192-maskable.png',
    './icon-512-maskable.png',
    './apple-touch-icon.png'
  ];

  /**
   * Pure routing decision function for Service Worker fetch requests.
   * @param {string} url Request URL (absolute or relative)
   * @param {string} mode Request mode (e.g. 'navigate', 'no-cors', 'same-origin')
   * @param {string} [selfOrigin] Optional service worker origin for cross-origin filtering
   * @returns {'network-first' | 'cache-first' | 'passthrough'}
   */
  function pickStrategy(url, mode, selfOrigin) {
    const rawUrl = String(url || '');
    const reqMode = String(mode || '');

    if (reqMode === 'navigate') {
      return 'network-first';
    }

    // Parse origin if selfOrigin is supplied and url is absolute
    if (selfOrigin && /^https?:\/\//i.test(rawUrl)) {
      const match = /^(https?:\/\/[^/?#]+)/i.exec(rawUrl);
      if (match && match[1].toLowerCase() !== String(selfOrigin).toLowerCase()) {
        return 'passthrough';
      }
    } else if (/^https?:\/\//i.test(rawUrl) && !selfOrigin) {
      // If called without selfOrigin in unit tests, treat known external URLs without ?v= as passthrough
      if (!/[?&]v=/.test(rawUrl) && !/\.(png|svg|ico)(\?|$)/i.test(rawUrl)) {
        return 'passthrough';
      }
    }

    // Same-origin cheers.json -> network-first so newly approved messages appear immediately
    if (/\/?cheers\.json(\?.*)?$/i.test(rawUrl)) {
      return 'network-first';
    }

    // Versioned static assets (?v=...) -> cache-first
    if (/[?&]v=[^&#]+/.test(rawUrl)) {
      return 'cache-first';
    }

    // Same-origin local icon assets -> cache-first for offline PWA rendering
    if (/\/?(icon(?:-192|-512)?(?:-maskable)?\.(?:png|svg)|apple-touch-icon\.png)(\?.*)?$/i.test(rawUrl)) {
      return 'cache-first';
    }

    return 'passthrough';
  }

  // Export for unit tests (jsc / Node)
  global.CasperSw = {
    VERSION: VERSION,
    CACHE_NAME: CACHE_NAME,
    ASSETS: ASSETS,
    pickStrategy: pickStrategy
  };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = global.CasperSw;
  }

  // Wire Service Worker lifecycle only inside a real ServiceWorkerGlobalScope
  if (typeof global.addEventListener === 'function' && typeof global.caches !== 'undefined') {
    global.addEventListener('install', function (event) {
      event.waitUntil(
        global.caches.open(CACHE_NAME).then(function (cache) {
          return cache.addAll(ASSETS);
        })
      );
      // Intentionally do NOT call self.skipWaiting() automatically so running timers are never interrupted.
    });

    global.addEventListener('message', function (event) {
      if (event && event.data && event.data.type === 'SKIP_WAITING' && typeof global.skipWaiting === 'function') {
        global.skipWaiting();
      }
    });

    global.addEventListener('activate', function (event) {
      event.waitUntil(
        global.caches.keys().then(function (keys) {
          return Promise.all(
            keys.filter(function (k) { return k !== CACHE_NAME; })
              .map(function (k) { return global.caches.delete(k); })
          );
        }).then(function () {
          if (global.clients && typeof global.clients.claim === 'function') {
            return global.clients.claim();
          }
        })
      );
    });

    global.addEventListener('fetch', function (event) {
      if (!event.request || event.request.method !== 'GET') return;

      const selfOrigin = (global.location && global.location.origin) ? global.location.origin : '';
      const strategy = pickStrategy(event.request.url, event.request.mode, selfOrigin);

      if (strategy === 'passthrough') {
        return;
      }

      if (strategy === 'network-first') {
        event.respondWith(
          fetch(event.request).then(function (resp) {
            if (resp && resp.status === 200 && resp.type === 'basic') {
              const copy = resp.clone();
              global.caches.open(CACHE_NAME).then(function (cache) {
                cache.put(event.request, copy);
              });
            }
            return resp;
          }).catch(function () {
            return global.caches.match(event.request).then(function (cached) {
              if (cached) return cached;
              if (event.request.mode === 'navigate') {
                return global.caches.match('./index.html');
              }
              return new Response('', { status: 503, statusText: 'Offline' });
            });
          })
        );
        return;
      }

      if (strategy === 'cache-first') {
        event.respondWith(
          global.caches.match(event.request).then(function (cached) {
            if (cached) return cached;
            return fetch(event.request).then(function (resp) {
              if (resp && resp.status === 200 && resp.type === 'basic') {
                const copy = resp.clone();
                global.caches.open(CACHE_NAME).then(function (cache) {
                  cache.put(event.request, copy);
                });
              }
              return resp;
            });
          })
        );
      }
    });
  }
})(typeof self !== 'undefined' ? self : globalThis);
