const CACHE_NAME = "cosecha-shell-v1";
const PRECACHE_URLS = [
    "/login.html",
    "/index.html",
    "/clima.html",
    "/mapa.html",
    "/history.html",
    "/app.js",
    "/auth.js",
    "/style.css",
    "/img/cosecha%20(2).jpg",
    "/img/cosecha(1).jpg",
    "/img/cosecha(3).jpg"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const { request } = event;

    if (request.method !== "GET") {
        return;
    }

    const url = new URL(request.url);

    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request).catch(async () => {
                const cache = await caches.open(CACHE_NAME);
                return (
                    (await cache.match(request)) ||
                    (await cache.match("/login.html")) ||
                    Response.error()
                );
            })
        );
        return;
    }

    if (url.origin === self.location.origin) {
        event.respondWith(
            caches.match(request, { ignoreSearch: true }).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(request)
                    .then((response) => {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
                        return response;
                    })
                    .catch(() => caches.match("/login.html"));
            })
        );
    }
});
