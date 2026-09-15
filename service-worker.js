const CACHE_NAME = 'mathetes-v3'; // ⚠️ à incrémenter (v4, v5...) à chaque future mise à jour du fichier html
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Stratégie "réseau d'abord" : on va toujours chercher la dernière version en ligne.
// Le cache ne sert que de secours si le téléphone est hors-ligne.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isAppShell = event.request.mode === 'navigate' ||
    APP_SHELL.some((f) => url.pathname.endsWith(f.replace('./', '/')) || url.pathname.endsWith(f.replace('./', '')));

  if (isAppShell) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
          return response;
        })
        .catch(() => caches.match(event.request).then((r) => r || caches.match('./index.html')))
    );
  }
  // Les appels vers supabase.co et les CDN externes passent tels quels (réseau).
});
