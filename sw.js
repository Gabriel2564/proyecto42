const CACHE = "tiu-virtual-v2";
const ASSETS = [
  "/proyecto42/",
  "/proyecto42/index.html",
  "/proyecto42/melissa.jpg",
  "/proyecto42/manifest.json",
  "/proyecto42/icon-192.png",
  "/proyecto42/icon-512.png",
  "/proyecto42/icon-maskable-512.png",
  "/proyecto42/favicon.png"
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