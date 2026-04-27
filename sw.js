const CACHE = "tiu-virtual-v3";

// Detecta automaticamente si estamos en localhost o en GitHub Pages
const BASE = self.location.pathname.includes("/proyecto42/")
  ? "/proyecto42"
  : "";

const ASSETS = [
  `${BASE}/`,
  `${BASE}/index.html`,
  `${BASE}/melissa.jpg`,
  `${BASE}/manifest.json`,
  `${BASE}/icon-192.png`,
  `${BASE}/icon-512.png`,
  `${BASE}/icon-maskable-512.png`,
  `${BASE}/favicon.png`
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => {
      return Promise.all(
        ASSETS.map((url) =>
          fetch(url).then((resp) => {
            if (!resp.ok) throw new Error(`404 en ${url}`);
            return c.put(url, resp);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((resp) => {
        if (!resp.ok) return resp;
        const copy = resp.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return resp;
      });
    })
  );
});