importScripts("https://cdn.jsdelivr.net/npm/idb@7/build/umd.js");
importScripts("./src/js/db.js");
var staticCache = "static_cache_v29";
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

self.addEventListener("notificationclick", function (event) {
  var notification = event.notification;
  var action = event.action;

  console.log(notification);

  if (action === "confirm") {
    console.log("Confirm was chosen");
    notification.close();
  } else {
    console.log(action);
    event.waitUntil(
      clients.matchAll().then(function (clis) {
        var client = clis.find(function (c) {
          return c.visibilityState === "visible";
        });

        if (client !== undefined) {
          client.navigate(notification.data.url);
          client.focus();
        } else {
          client.openWindow(notification.data.url);
        }
        notification.close();
      })
    );
  }
});

self.addEventListener("notificationclose", function (event) {
  console.log("Notification was closed", event);
});

self.addEventListener("push", function (event) {
  console.log("Push Notification received", event);

  var data = {
    title: "New Course!",
    content: "New Course Has been added!",
    openUrl: "/",
  };

  if (event.data) {
    data = JSON.parse(event.data.text());
    console.log("data received", data);
  }

  var options = {
    body: data.content,
    icon: "/src/images/icons/app-icon-96x96.png",
    badge: "/src/images/icons/app-icon-96x96.png",
    data: {
      url: data.openUrl,
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});
