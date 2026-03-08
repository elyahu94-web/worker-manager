var CACHE = 'worker-manager-v22';
var ASSETS = ['./', './index.html', './manifest.json', './logo-header.png'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) {
      return Promise.allSettled(ASSETS.map(function(a) {
        return c.add(a).catch(function(){});
      }));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  if (e.request.url.indexOf('script.google.com') > -1) return;
  // Network first — תמיד נסה לקחת מהרשת, fallback ל-cache
  e.respondWith(
    fetch(e.request).then(function(response) {
      // עדכן את ה-cache עם הגרסה החדשה
      var clone = response.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
      return response;
    }).catch(function() {
      // אם אין רשת — השתמש ב-cache
      return caches.match(e.request);
    })
  );
});
