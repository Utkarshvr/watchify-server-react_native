const express = require("express");
const upload = require("../middlewares/multer.middlewares");

const {
  customizeUser,
  getUserById,
  getNotifications,
  getUsersPlaylist,
  getUsersWatchHistory,
  markNotificationsAsRead,
  getUsersSubscription,
} = require("../controllers/user.controller");
const { isAuthorized } = require("../middlewares/auth.middleware");

const userRouter = express.Router();

// Check if user is authorized
userRouter.use(isAuthorized);

userRouter.get("/me", getUserById);
userRouter.get("/me/playlists", getUsersPlaylist);
userRouter.get("/me/watch-history", getUsersWatchHistory);
userRouter.get("/me/subscriptions", getUsersSubscription);

// ROUGH
userRouter.get("/me/notify", (req, res) => {
  const socket = req.app.get("socket");
  console.log({ socket });

  socket.emit("notify-user", {
    content: "Notificaiton! Check kar",
  });

  res.send("Notified check");
});

// Notifications
userRouter.get("/me/notifications", getNotifications);
userRouter.post("/me/notifications/markasread", markNotificationsAsRead);

userRouter.post(
  "/me/customize",
  upload.fields([
    { name: "user_picture", maxCount: 1 },
    { name: "banner_image", maxCount: 1 },
  ]),
  customizeUser
);

module.exports = userRouter;
