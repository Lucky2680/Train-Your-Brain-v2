/* Service worker: installable app shell with type-safe offline fallbacks. */
const V = 'tyb-web-v2';
const SHELL = [
  './', './index.html', './style.css', './script.js', './store.js',
  './lessons.js', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(V)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('tyb-web-') && key !== V).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  const isNavigation = request.mode === 'navigate';
  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response && response.ok && response.type !== 'opaque') {
        const copy = response.clone();
        caches.open(V).then(cache => cache.put(request, copy)).catch(() => {});
      }
      return response;
    } catch (error) {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (isNavigation) {
        const shell = await caches.match('./index.html');
        if (shell) return shell;
      }
      return new Response('Offline: this resource is not available in the cache.', {
        status: 503,
        headers: {'Content-Type': 'text/plain; charset=utf-8'}
      });
    }
  })());
});
