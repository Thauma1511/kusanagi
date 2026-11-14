importScripts('js/data.js');
const CACHE = 'kusanagi-v5';
const FICHIERS = ['./', './index.html', './js/data.js', './js/app.js', './fonts/klee-one-semibold-kusanagi.woff2',
  './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png',
  ...Object.keys(AIDES_KANJI).map((c) => `./kanji/${c.codePointAt(0).toString(16)}.webp`)];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FICHIERS))); self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((n) => n !== CACHE).map((n) => caches.delete(n))))); self.clients.claim(); });
// Réseau d'abord (pour recevoir les mises à jour), cache si hors ligne
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then((r) => { const copie = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copie)); return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('./index.html'))));
});
