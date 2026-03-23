const CACHE_NAME = 'grumpi-v1';
const urlsToCache = ['/', '/index.html', '/static/js/main.chunk.js'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// Este evento se dispara cuando hay una notificación o sincronización de pasos
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-steps') {
    console.log('[SW] Intentando sincronizar pasos en segundo plano...');
    // Aquí podrías añadir lógica de Background Sync si usas una BD indexada
  }
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});