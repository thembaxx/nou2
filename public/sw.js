const CACHE = "carpur-public-assets-v6";
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(["/offline.html", "/icon-192.png", "/icon-512.png"])),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("carpur-") && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/") ||
    request.headers.has("RSC")
  )
    return;
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/offline.html")));
    return;
  }
  if (
    url.pathname.startsWith("/images/") ||
    url.pathname.startsWith("/models/") ||
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icon-")
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then(async (response) => {
            if (response.ok) {
              const cache = await caches.open(CACHE);
              await cache.put(request, response.clone());
              const keys = await cache.keys();
              if (keys.length > 60) {
                const removable = keys.filter(
                  (key) =>
                    !["/offline.html", "/icon-192.png", "/icon-512.png"].includes(
                      new URL(key.url).pathname,
                    ),
                );
                if (removable[0]) await cache.delete(removable[0]);
              }
            }
            return response;
          }),
      ),
    );
  }
});
