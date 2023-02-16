var overviewArea = document.querySelector("#overview");
var btnAdd = document.querySelector("#add");
var addCourseDiv = document.querySelector("#addCourse");
var form = document.querySelector("form");
var courseNameInput = document.querySelector("#courseName");
var courseDescriptionInput = document.querySelector("#courseDescription");

btnAdd.addEventListener("click", function (e) {
  overviewArea.style.display = "none";
  addCourseDiv.style.display = "block";
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
