/* CASPER™ V1 — Offline Network-First Service Worker (sw.js) */
const CACHE_NAME = 'no1-pro-v5.7.0';
const ASSETS = [
  './',
  './index.html',
  './styles.css?v=5.7.0',
  './timer-core.js?v=5.7.0',
  './audio-engine.js?v=5.7.0',
  './music-player.js?v=5.7.0',
  './atelier-engine.js?v=5.7.0',
  './storage.js?v=5.7.0',
  './satellite-engine.js?v=5.7.0',
  './jump-watch-engine.js?v=5.7.0',
  './cycloid-watch-engine.js?v=5.7.0',
  './geometry-watch-engine.js?v=5.7.0',
  './app.js?v=5.7.0',
  './manifest.json?v=5.7.0',
  './icon.svg'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; })
          .map(function (k) { return caches.delete(k); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request, { cache: 'no-store' }).then(function (resp) {
      if (resp && resp.status === 200 && resp.type === 'basic') {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, copy);
        });
      }
      return resp;
    }).catch(function () {
      return caches.match(event.request).then(function (cached) {
        return cached || caches.match('./index.html');
      });
    })
  );
});
