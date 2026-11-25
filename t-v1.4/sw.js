/* CASPER™ V1 — Offline Network-First Service Worker (sw.js) */
const CACHE_NAME = 'no1-pro-v5.6.2';
const ASSETS = [
  './',
  './index.html',
  './styles.css?v=5.6.2',
  './timer-core.js?v=5.6.2',
  './audio-engine.js?v=5.6.2',
  './music-player.js?v=5.6.2',
  './atelier-engine.js?v=5.6.2',
  './storage.js?v=5.6.2',
  './satellite-engine.js?v=5.6.2',
  './jump-watch-engine.js?v=5.6.2',
  './cycloid-watch-engine.js?v=5.6.2',
  './geometry-watch-engine.js?v=5.6.2',
  './app.js?v=5.6.2',
  './manifest.json?v=5.6.2',
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
