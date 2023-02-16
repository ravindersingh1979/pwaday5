var staticCache = "static_cache_v4";
var previousStaticCache = "static_cache_v3";
self.addEventListener("install", function (event) {
  console.log("Service worker getting installed", event);
});

self.addEventListener("activate", function (event) {
  console.log("service worker activated", event);
  caches
    .open(previousStaticCache)
    .then((cache) =>
      cache.keys().then((keys) => keys.forEach((key) => cache.delete(key)))
    );

  return self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  console.log("service worker fetching data", event);
  //return; //event.respondWith(fetch(event.request.url));
  // event.respondWith(fetch(event.request));
});
