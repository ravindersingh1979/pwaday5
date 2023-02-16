importScripts("https://cdn.jsdelivr.net/npm/idb@7/build/umd.js");
importScripts("./src/js/db.js");
var staticCache = "static_cache";
self.addEventListener("install", function (event) {
  console.log("Service worker getting installed", event);
});

self.addEventListener("activate", function (event) {
  console.log("service worker activated", event);
  event.waitUntil(
    fetch("http://localhost:3000/courses")
      .then((response) => {
        console.log("Got courses", response);
        return response.json();
      })
      .then((value) => {
        return db.writeData("sync-courses", value.data);
      })
  );
  //return self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  // console.log("service worker fetching data", event);
  event.respondWith(
    caches.open(staticCache).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request.url);
      });
    })
  );
  // event.respondWith(fetch(event.request));
});

self.addEventListener("sync", function (event) {
  console.log("Background syncing", event);
  if (event.tag === "sync-new-courses") {
    event.waitUntil(
      db.readAllData("sync-courses").then(function (data) {
        for (var course of data) {
          fetch("http://localhost:3000/course", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              courseName: course.courseName,
              courseDesciption: course.courseDesciption,
            }),
          })
            .then(function (response) {
              if (response.ok) {
                response.json(function (responseData) {
                  db.deleteData("sync-courses", responseData.id);
                });
              }
            })
            .catch((error) => {
              console.log("error while syncing data", error);
            });
        }
      })
    );
  }
});
