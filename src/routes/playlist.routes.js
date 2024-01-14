const express = require("express");
const {
  createPlaylist,
  addVideosToPlaylist,
  addVideoToPlaylists,
  toggleVideoInPlaylist,
  getPlaylistByID,
} = require("../controllers/playlist.controller");
const { isAuthorized } = require("../middlewares/auth.middleware");

const playlilstRouter = express.Router();

playlilstRouter.route("/").post(createPlaylist);

playlilstRouter.route("/:playlistID").get(getPlaylistByID);

// Authorization Check
playlilstRouter.use(isAuthorized);
playlilstRouter.route("/:playlistID/add-videos").post(addVideosToPlaylist);
playlilstRouter.route("/:playlistID/toggle-video").post(toggleVideoInPlaylist);

playlilstRouter.post("/add-video-to-playlists", addVideoToPlaylists);

module.exports = playlilstRouter;
