var notificationsButton = document.querySelector("#btnNotification");
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").then(function () {
    console.log("Service worker is registered");
  });
}

function displayConfirmNotification() {
  if ("serviceWorker" in navigator) {
    var options = {
      body: "You successfully subscribed to notifcations!",
      icon: "/src/images/icons/app-icon-96x96.png",
      image: "/src/images/android-desktop.png",
      dir: "ltr",
      lang: "en-US", // BCP 47,
      vibrate: [100, 50, 200],
      badge: "/src/images/icons/app-icon-96x96.png",
      tag: "confirm-notification",
      renotify: true,
      actions: [
        {
          action: "confirm",
          title: "Okay",
          icon: "/src/images/icons/app-icon-96x96.png",
        },
        {
          action: "cancel",
          title: "Cancel",
          icon: "/src/images/icons/app-icon-96x96.png",
        },
      ],
    };

    navigator.serviceWorker.ready.then(function (swreg) {
      swreg.showNotification("Successfully subscribed!", options);
    });
  }
}

function configurePushSub() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  var reg;
  navigator.serviceWorker.ready
    .then(function (swreg) {
      reg = swreg;
      return swreg.pushManager.getSubscription();
    })
    .then(function (sub) {
      if (sub === null) {
        // Create a new subscription
        var vapidPublicKey =
          "BJMLtMrMVVakwuPXJchPyX8-beqNRcybNtonzDr6NWbxhBwbSGVadNHMb6U_0YLBdJgCcNQj3LIV738tJFbXXOQ";
        var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidPublicKey,
        });
      } else {
        return sub;
      }
    })
    .then(function (newSub) {
      //http://localhost:3000/subscription
      return fetch("http://localhost:3000/subscription", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          //Accept: "application/json",
        },
        body: JSON.stringify(newSub),
      });
    })
    .then(function (res) {
      if (res.ok) {
        displayConfirmNotification();
      }
    })
    .catch(function (err) {
      console.log(err);
    });
}

function askForNotificationPermission() {
  Notification.requestPermission(function (result) {
    console.log("User selectd", result);
    if (result !== "granted") {
      console.log("User refused!");
    } else {
      configurePushSub();
      // displayConfirmNotification();
    }
  });
}

if ("Notification" in window && "serviceWorker" in navigator) {
  notificationsButton.addEventListener("click", askForNotificationPermission);
}

function urlBase64ToUint8Array(base64String) {
  var padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  var base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
