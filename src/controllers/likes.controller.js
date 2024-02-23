const expressAsyncHandler = require("express-async-handler");
const Likes = require("../models/Likes");
const Videos = require("../models/Videos");
const Comments = require("../models/Comments");
const Playlists = require("../models/Playlist");

const likeContent = expressAsyncHandler(async function (req, res) {
  try {
    const contentType = req.query.contentType;
    const user = req.user?.details;
    const userID = user?._id;
    const contentID = req.params.contentID; // video-id or comment-id

    if (!contentType)
      return res.status(400).json({ msg: "contentType is not specified" });

    const Content = contentType === "video" ? Videos : Comments;

    const existingContent = await Content.findOne({
      ...(contentType === "video"
        ? { videoID: contentID }
        : { _id: contentID }),
    }).lean();

    console.log({ userID });
    console.log({ existingContent });

    if (!existingContent)
      return res.status(404).json({
        msg: `${contentType} not found`,
      });

    // const commonFindingObj = {
    //   likedBy: userID,
    //   contentType,
    //   ...(contentType === "video"
    //     ? { video: existingContent?._id }
    //     : { comment: contentID }),
    // };

    if (contentType === "video") {
      // Add video to "Liked Videos" Playlist of the logged in user
      const likedVideosPlaylist = await Playlists.findOne({
        title: "Liked Videos",
        owner: userID,
      });

      const likedVideos = likedVideosPlaylist.videos?.map((v) => v?.toString());

      const isVideoAlreadyLiked = likedVideos.some(
        (v) => v?.toString() === existingContent?._id?.toString()
      );

      // console.log(
      //   likedVideosPlaylist,
      //   likedVideos,
      //   existingContent?._id?.toString(),
      //   isVideoAlreadyLiked
      // );

      if (isVideoAlreadyLiked) {
        likedVideosPlaylist.videos = likedVideos.filter(
          (v) => v !== existingContent?._id?.toString()
        );
        await likedVideosPlaylist.save();
        return res.status(200).json({ msg: "Like Removed", isLiked: false });
      } else {
        // console.log([...likedVideos, existingContent?._id?.toString()]);

        likedVideosPlaylist.videos = [
          ...likedVideos,
          existingContent?._id?.toString(),
        ];
        await likedVideosPlaylist.save();

        return res.status(200).json({ msg: "Like Added", isLiked: true });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

module.exports = { likeContent };
