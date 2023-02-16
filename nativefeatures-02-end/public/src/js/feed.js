var overviewArea = document.querySelector("#overview");
var btnAdd = document.querySelector("#btnAddCourse");
var addCourseDiv = document.querySelector("#addCourse");
var form = document.querySelector("form");
var courseNameInput = document.querySelector("#courseName");
var courseDescriptionInput = document.querySelector("#courseDescription");
var locationBtn = document.querySelector("#location-btn");
var locationInput = document.querySelector("#location");
var videoPlayer = document.querySelector("#player");
var canvasElement = document.querySelector("#canvas");
var captureButton = document.querySelector("#capture-btn");
var locationLoader = document.querySelector("#location-loader");
var fetchedLocation = { lat: 0, lng: 0 };
var screenCapturevideoPlayer = document.querySelector("#captureplayer");
var screenCapturecanvasElement = document.querySelector("#canvasCapture");
var screenCaptureButton = document.querySelector("#screen-capture-btn");
btnAdd.addEventListener("click", function (e) {
  overviewArea.style.display = "none";
  addCourseDiv.style.display = "block";
  initializeMedia();
  initializeLocation();
});

screenCaptureButton.addEventListener("click", function (event) {
  navigator.mediaDevices
    .getDisplayMedia()
    .then(function (stream) {
      screenCapturevideoPlayer.srcObject = stream;
      screenCapturevideoPlayer.style.display = "block";
    })
    .catch(function (err) {
      // imagePickerArea.style.display = "block";
    });
});
function createCard(data) {
  console.log(data);
  var cardWrapper = document.createElement("section");
  cardWrapper.className =
    "section--center mdl-grid mdl-grid--no-spacing mdl-shadow--2dp";
  var courseHeader = document.createElement("header");
  courseHeader.className =
    "section__play-btn mdl-cell mdl-cell--3-col-desktop mdl-cell--2-col-tablet mdl-cell--4-col-phone mdl-color--teal-100 mdl-color-text--white";
  var coursePlayButton = document.createElement("i");
  coursePlayButton.className = "material-icons";
  coursePlayButton.textContent = "play_circle_filled";
  courseHeader.appendChild(coursePlayButton);
  cardWrapper.appendChild(courseHeader);

  var courseDetailSection = document.createElement("div");

  courseDetailSection.className =
    "mdl-card mdl-cell mdl-cell--9-col-desktop mdl-cell--6-col-tablet mdl-cell--4-col-phone";
  var courseDetailDescription = document.createElement("div");
  courseDetailDescription.className = "mdl-card__supporting-text";

  var courseDescriptionTextDiv = document.createElement("h4");
  courseDescriptionTextDiv.textContent = data.courseName;
  courseDetailDescription.textContent = data.courseDescription;

  courseDetailDescription.appendChild(courseDescriptionTextDiv);
  courseDetailSection.appendChild(courseDetailDescription);

  var coursePlayButton = document.createElement("i");
  coursePlayButton.className = "material-icons";
  coursePlayButton.textContent = "play_circle_filled";
  courseHeader.appendChild(coursePlayButton);
  cardWrapper.appendChild(courseHeader);
  cardWrapper.appendChild(courseDetailSection);
  overviewArea.appendChild(cardWrapper);
}

fetch("http://localhost:3000/courses")
  .then((response) => {
    return response.json();
  })
  .then((value) => {
    createCard(value.data);
  });

form.addEventListener("submit", function (event) {
  event.preventDefault();

  if (
    courseName.value.trim() === "" ||
    courseDescriptionInput.value.trim() === ""
  ) {
    alert("Please enter valid data!");
    return;
  }

  if ("serviceWorker" in navigator && "SyncManager" in window) {
    navigator.serviceWorker.ready.then(function (sw) {
      var post = {
        courseName: courseNameInput.value,
        courseDescription: courseDescriptionInput.value,
      };
      db.writeData("sync-courses", post)
        .then(function () {
          return sw.sync.register("sync-new-courses");
        })
        .then(function () {
          var data = { message: "Your Post was saved for syncing!" };
          console.log(data);
        })
        .catch(function (err) {
          console.log(err);
        });
    });
  } else {
    sendData();
  }
});

function initializeMedia() {
  if (!("mediaDevices" in navigator)) {
    navigator.mediaDevices = {};
  }

  if (!("getUserMedia" in navigator.mediaDevices)) {
    navigator.mediaDevices.getUserMedia = function (constraints) {
      var getUserMedia =
        navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      if (!getUserMedia) {
        return Promise.reject(new Error("getUserMedia is not implemented!"));
      }

      return new Promise(function (resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    };
  }

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then(function (stream) {
      videoPlayer.srcObject = stream;
      videoPlayer.style.display = "block";
    })
    .catch(function (err) {
      imagePickerArea.style.display = "block";
    });
}

locationBtn.addEventListener("click", function (event) {
  if (!("geolocation" in navigator)) {
    return;
  }
  var sawAlert = false;

  locationBtn.style.display = "none";
  locationLoader.style.display = "block";

  navigator.geolocation.getCurrentPosition(
    function (position) {
      locationBtn.style.display = "inline";
      locationLoader.style.display = "none";
      fetchedLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      locationInput.value = fetchedLocation.lat;
      document.querySelector("#manual-location").classList.add("is-focused");
    },
    function (err) {
      console.log(err);
      locationBtn.style.display = "inline";
      locationLoader.style.display = "none";
      if (!sawAlert) {
        alert("Couldn't fetch location, please enter manually!");
        sawAlert = true;
      }
      fetchedLocation = { lat: 0, lng: 0 };
    },
    { timeout: 7000 }
  );
});

function initializeLocation() {
  if (!("geolocation" in navigator)) {
    locationBtn.style.display = "none";
  }
}

captureButton.addEventListener("click", function (event) {
  canvasElement.style.display = "block";
  videoPlayer.style.display = "none";
  captureButton.style.display = "none";
  var context = canvasElement.getContext("2d");
  context.drawImage(
    videoPlayer,
    0,
    0,
    canvas.width,
    videoPlayer.videoHeight / (videoPlayer.videoWidth / canvas.width)
  );
  videoPlayer.srcObject.getVideoTracks().forEach(function (track) {
    track.stop();
  });
  picture = dataURItoBlob(canvasElement.toDataURL());
});

function dataURItoBlob(dataURI) {
  var byteString = atob(dataURI.split(",")[1]);
  var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  var blob = new Blob([ab], { type: mimeString });
  return blob;
}
