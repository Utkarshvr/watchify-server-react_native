const express = require("express");
const authRoute = require("./auth.routes.js");
const uploadRoute = require("./upload.routes.js");
const roughRouter = require("./rough.routes.js");
const userRouter = require("./user.routes.js");
const videoRouter = require("./video.routes.js");
// const subscriberRouter = require("./subscribe.routes.js");
const likesRouter = require("./likes.routes.js");
const channelRouter = require("./channel.routes.js");
const playlilstRouter = require("./playlist.routes.js");
const commentRouter = require("./comment.routes.js");
const addUserInfoInReq = require("../middlewares/add-user-info.middleware.js");
const upload = require("../middlewares/multer.middlewares.js");

const rootRoute = express.Router();

rootRoute.get("/", (req, res) =>
  res.status(200).json({ msg: "Welcome to Watchify API" })
);

rootRoute.post(
  "/upload-img",
  upload.fields([{ name: "img", maxCount: 1 }]),
  (req, res) => {
    const imgPath = req.files?.img ? req.files?.img[0]?.path : null;
    console.log({ imgPath });

    res.status(200).json({ msg: "Tried uploading an img", imgPath });
  }
);

rootRoute.get("/notify-me", (req, res) => {
  const socket = req.app.get("socket");
  socket.emit("notify-user", {
    title: "🔔🔔 This is a real-time notification 🔔🔔",
    desc: "🔔🔔 Description 🔔🔔",
  });

  res.status(200).json({ msg: "🔔🔔Sent u a notification, Check it out!🔔🔔" });
});

rootRoute.use(addUserInfoInReq);

rootRoute.use("/auth", authRoute);

rootRoute.use("/user", userRouter);

rootRoute.use("/channel", channelRouter);

rootRoute.use("/video", videoRouter);

rootRoute.use("/playlist", playlilstRouter);

rootRoute.use("/comment", commentRouter);

rootRoute.use("/like", likesRouter);

// ROUGH
rootRoute.use("/rough", roughRouter);
rootRoute.use("/upload", uploadRoute);

module.exports = rootRoute;
