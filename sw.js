// sw.js — Studio Board
//
// Bump CACHE_VERSION any time you want to force every client to drop its
// old cached files (e.g. after a big change). Old caches are deleted
// automatically the next time the app opens.
const CACHE_VERSION = 'v1';
const CACHE_NAME = `studio-board-${CACHE_VERSION}`;

// Only things we know the exact, stable path to. The HTML page itself is
// NOT precached here by guessed filename — it gets cached automatically
// the first time it's fetched (see the 'fetch' handler below), so this
// works whether the file is called index.html, tasktracker.html, etc.
const PRECACHE_URLS = [
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;

  // Only handle same-origin GET requests. Everything else — Firebase Auth,
  // Firestore, Google Fonts, etc. — goes straight to the network,
  // untouched. Live/user data is never cached or intercepted.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) {
    return;
  }

  // The app page itself: network-first, so you always get the latest
  // version while online, with an instant cached copy as a fallback the
  // moment the network is slow, flaky, or unavailable — this is what
  // stops a blank white "reloading…" flash on mobile.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then(res => res || caches.match('./')))
    );
    return;
  }

  // Static assets (icons, manifest, fonts): cache-first, populating the
  // cache on first fetch so repeat loads are instant.
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return res;
      });
    })
  );
});
