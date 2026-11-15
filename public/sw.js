// Service worker de ASTRA: permite instalar la app y usarla sin conexión.
const CACHE = 'astra-v2';
const CORE = ['/', '/index.html', '/manifest.webmanifest', '/assets/astra-logo.png', '/assets/icon-192.png', '/assets/icon-512.png'];

// Al instalarse guarda también el JS y el CSS que index.html pide (sus nombres cambian en cada build),
// para que la app funcione sin conexión desde la primera visita.
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) =>
        c.addAll(CORE)
          .then(() => c.match('/index.html'))
          .then((res) => (res ? res.text() : ''))
          .then((html) => {
            const found = html.match(/\/assets\/[^"'\s>]+\.(?:js|css)/g) || [];
            return Promise.all(Array.from(new Set(found)).map((u) => c.add(u).catch(() => {})));
          })
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // Navegación (rutas de la SPA): red primero, si no hay conexión se sirve index.html del caché.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put('/index.html', copy));
          }
          return res;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Resto de recursos (JS, CSS, imágenes, fuentes): caché primero y se guarda lo nuevo.
  e.respondWith(
    // ignoreVary: lo guardado al instalar debe servir aunque el servidor mande cabeceras Vary
    caches.match(req, { ignoreVary: true }).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res.ok || res.type === 'opaque') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      });
    })
  );
});
