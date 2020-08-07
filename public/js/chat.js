const socket = io();

const autoscroll = () => {
  //get the height of new message
  const $newMessage = $messages.lastElementChild;

  //new message margin
  const newMessageStyle = getComputedStyle($newMessage);
  const newMessageHeight =
    $newMessage.offsetHeight +
    parseFloat(newMessageStyle.marginTop) +
    parseFloat(newMessageStyle.marginBottom);

  //get whole messages container height
  const containerHeight = $messages.scrollHeight;

  //get how far we're scrolled
  const scrollOffset = $messages.scrollTop;

  //get visible height of messages
  const visibleHeight = $messages.offsetHeight;

  //The equation is, add how far we're scrolled and visible height,
  // subtract new message height from container height, now if we were scrolled to the bottom before new message
  // the value of the container - new message should be less than or equal the other value

  if (containerHeight - newMessageHeight <= scrollOffset + visibleHeight) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", (message) => {
  // console.log(`New message: ${message}`);
  const { createdAt } = message;
  console.log(createdAt);
  message.createdAt = moment(createdAt).format("h:mm:ss a");
  const html = Mustache.render(messageTemplate, message);
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("location", (location) => {
  // console.log(`New location: ${location}`);
  const { createdAt } = location;
  location.createdAt = moment(createdAt).format("h:mm:ss a");
  const html = Mustache.render(locationTemplate, location);
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ users, room }) => {
  const html = Mustache.render(sidebarTemplate, { users, room });
  $sidebar.innerHTML = html;
});

//Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $locationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");
const $sidebar = document.querySelector("#sidebar");

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  $messageFormButton.setAttribute("disabled", "disabled");
  const message = e.target.elements.message.value;

  socket.emit("sendMessage", message, (error, acknowledgment) => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }
    console.log(`delivered at:${acknowledgment}`);
  });
});

$locationButton.addEventListener("click", (e) => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }
  $locationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    const { longitude, latitude, ...others } = position.coords;
    socket.emit("sendLocation", { longitude, latitude }, (error) => {
      $locationButton.removeAttribute("disabled");
      if (error) {
        return console.log(error);
      }
      console.log("Location Shared!");
    });
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
// socket.on("countUpdated", (count) => {
//   console.log(`count is now ${count}`);
// });

// document.querySelector("#increment").addEventListener("click", () => {
//   socket.emit("incrementCount");
// });
