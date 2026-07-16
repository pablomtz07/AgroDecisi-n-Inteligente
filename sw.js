const CACHE_NAME = "cosecha-shell-v22";
const PRECACHE_URLS = [
    "/login.html",
    "/index.html",
    "/dashboard.html",
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

    if (url.origin !== self.location.origin) {
        return;
    }

    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request).catch(async () => {
                const cache = await caches.open(CACHE_NAME);
                return (
                    (await cache.match(new URL(request.url).pathname)) ||
                    (await cache.match(request)) ||
                    (await cache.match("/login.html")) ||
                    Response.error()
                );
            })
        );
        return;
    }

    event.respondWith(
        (async () => {
            const cache = await caches.open(CACHE_NAME);

            try {
                const response = await fetch(request);
                if (response && response.ok) {
                    await cache.put(request, response.clone());
                    await cache.put(new URL(request.url).pathname, response.clone());
                }
                return response;
            } catch {
                return (
                    (await cache.match(request)) ||
                    (await cache.match(new URL(request.url).pathname)) ||
                    Response.error()
                );
            }
        })()
    );
});
