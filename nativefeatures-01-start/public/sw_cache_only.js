var staticCache = "static_cache_v4";
self.addEventListener("install", function (event) {
  console.log("Service worker getting installed", event);
  event.waitUntil(
    caches.open(staticCache).then(function (cache) {
      console.log("Service Worker Precaching App Shell");
      cache.addAll([
        "/",
        "index.html",

        "/src/js/app.js",
        "/src/css/styles.css",
        "/src/images/ios-desktop.png",
        "/src/images/android-desktop.png",
        "https://code.getmdl.io/1.3.0/material.min.js",
        "/src/images/favicon.png",
        // "https://fonts.googleapis.com/css?family=Roboto:regular,bold,italic,thin,light,bolditalic,black,medium&amp;lang=en",
        // "https://fonts.googleapis.com/icon?family=Material+Icons",
        "https://code.getmdl.io/1.3.0/material.deep_purple-pink.min.css",
      ]);
    })
  );
});

self.addEventListener("activate", function (event) {
  console.log("service worker activated", event);
  return self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  console.log("service worker fetching data", event);

  event.respondWith(
    caches.open(staticCache).then((cache) => {
      return cache
        .match(event.request)
        .then((cachedResponse) => {
          return cachedResponse;
        })
        .catch((error) => {
          return;
        });
    })
  );
  // event.respondWith(fetch(event.request));
});
