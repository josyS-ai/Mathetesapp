const CACHE_NAME = 'ministere-parole-v1';
const APP_SHELL = [
  './ministere.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Installation : on met en cache les fichiers de l'application (l'"app shell")
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

// Activation : on supprime les anciennes versions du cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Requêtes : app shell servi depuis le cache (rapide + fonctionne hors-ligne),
// tout le reste (Supabase, polices, librairies) part sur le réseau normalement.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isAppShell = APP_SHELL.some((f) => url.pathname.endsWith(f.replace('./', '/')));

  if (isAppShell) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
  // Les appels vers supabase.co et les CDN externes passent tels quels (réseau).
});
