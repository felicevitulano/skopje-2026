// Service worker minimo: tiene l'app disponibile anche senza rete.
// A Skopje il roaming europeo non vale, quindi l'app deve funzionare offline.
// Quando cambia l'app si alza VERSIONE e le cache vecchie vengono buttate.
const VERSIONE = "spese-skopje-v5";
const FILE = ["./", "./index.html", "./manifest.webmanifest"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSIONE).then(c => c.addAll(FILE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(k => Promise.all(k.filter(n => n !== VERSIONE).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;   // i font di Google li gestisce il browser
  // Prima la rete, così si vede subito una versione aggiornata; se manca, la copia in cache.
  e.respondWith(
    fetch(e.request)
      .then(r => { const copia = r.clone(); caches.open(VERSIONE).then(c => c.put(e.request, copia)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
