const express = require("express");
const upload = require("../middlewares/multer.middlewares");

const {
  createVideo,
  getVideoById,
  getAllVideos,
  getCommentsByVideoID,
} = require("../controllers/videos.controller");
const { isAuthorized } = require("../middlewares/auth.middleware");
const { createComment } = require("../controllers/comment.controller");

const videoRouter = express.Router();

videoRouter.get("/all", getAllVideos);

videoRouter.get("/:id", getVideoById);

videoRouter.get("/:id/comments", getCommentsByVideoID);
videoRouter.post("/:videoID/comment", isAuthorized, createComment);

videoRouter.post(
  "/create",
  isAuthorized,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  createVideo
);

module.exports = videoRouter;
