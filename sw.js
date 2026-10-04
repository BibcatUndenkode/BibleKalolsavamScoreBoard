/* Offline cache for the score board shell. */
var CACHE = 'kalolsavam-v67';
var ASSETS = [
  './',
  './index.html',
  './assets/supabase.umd.js',
  './js/config.js',
  './manifest.json',
  './assets/forane_logo.png',
  './css/styles.css',
  './js/store.js',
  './js/ui.js',
  './js/admin.js',
  './js/app.js'
];

self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) {
    return cache.addAll(ASSETS);
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; })
      .map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  if (event.request.url === self.location.origin + '/sw.js') return;
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request).then(function (response) {
        var copy = response.clone();
        caches.open(CACHE).then(function (cache) { cache.put(event.request, copy); });
        return response;
      }).catch(function () { return caches.match('./index.html'); });
    })
  );
});
