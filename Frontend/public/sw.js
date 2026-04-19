/* eslint-disable no-restricted-globals */


self.addEventListener("push", function (event) {
  const data = event.data ? event.data.json() : {};

  self.registration.showNotification(data.title || "Trackly", {
    body: data.body || "Notification from Trackly",
    icon: "assets/notification.png",
  });
});
