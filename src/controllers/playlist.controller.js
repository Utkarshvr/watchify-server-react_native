const expressAsyncHandler = require("express-async-handler");
const Playlists = require("../models/Playlist");
const sendRes = require("../utils/sendRes");
const { default: mongoose } = require("mongoose");

const createPlaylist = expressAsyncHandler(async (req, res) => {
  const { title, desc, isPrivate = true } = req.body;
  const owner = req.user?.details;

  const newPlaylist = await Playlists.create({
    title,
    desc,
    isPrivate,
    owner: owner?._id,
  });

  return sendRes(
    res,
    201,
    { playlist: newPlaylist },
    "Playlist Created Successfully"
  );
});

const addVideosToPlaylist = expressAsyncHandler(async (req, res) => {
  const { videos } = req.body;
  const { playlistID } = req.params;

  const existingPlaylist = await Playlists.findById(playlistID)
    .populate("videos")
    .lean();

  const existingVideoIds = existingPlaylist.videos.map((video) =>
    video?._id.toString()
  );

  const duplicateIds = videos.filter((videoId) =>
    existingVideoIds.includes(videoId)
  );

  const uniqueVideoIds = videos.filter(
    (videoId) => !duplicateIds.includes(videoId)
  );

  //   console.log({
  //     existingVideos: existingVideoIds,
  //     givenVideos: videos,
  //     duplicateIds,
  //     uniqueVideoIds,
  //   });

  if (uniqueVideoIds?.length === 0)
    return sendRes(
      res,
      200,
      { playlist: existingPlaylist },
      "Nothin new to add"
    );

  const updatedPlaylist = await Playlists.findByIdAndUpdate(
    playlistID,
    {
      $push: {
        videos: { $each: uniqueVideoIds },
      },
    },
    { new: true, runValidators: true }
  )
    .populate("videos")
    .lean();

  return sendRes(
    res,
    201,
    { playlist: updatedPlaylist },
    "Videos Added To The Playlist Successfully"
  );
});
const addVideoToPlaylists = expressAsyncHandler(async (req, res) => {
  const { video, playlists } = req.body;

  if (!playlists || playlists.length === 0) {
    return sendRes(res, 400, null, "No playlists provided");
  }

  const playlistPromises = playlists.map(async (playlistID) => {
    const givenPlaylist = await Playlists.findById(playlistID)
      .populate("videos")
      .lean();

    if (!givenPlaylist) {
      console.error(`Playlist with ID ${playlistID} not found.`);
      return null;
    }

    const isVideoAlreadySaved = givenPlaylist.videos.some(
      (vid) => vid?._id?.toString() === video
    );

    if (isVideoAlreadySaved) {
      console.log(`Video already present in playlist with ID ${playlistID}.`);
      return null;
    }

    const updatedPlaylist = await Playlists.findByIdAndUpdate(
      playlistID,
      {
        $push: {
          videos: video,
        },
      },
      { new: true, runValidators: true }
    )
      .populate("videos")
      .lean();

    return updatedPlaylist;
  });

  const updatedPlaylists = await Promise.all(playlistPromises);

  return sendRes(
    res,
    200,
    { updatedPlaylists: updatedPlaylists.filter(Boolean) },
    updatedPlaylists.filter(Boolean).length === 0
      ? "Video Already Added"
      : "Video added to the given playlists"
  );
});

const toggleVideoInPlaylist = expressAsyncHandler(async (req, res) => {
  const { video } = req.query;
  const { playlistID } = req.params;
  console.log(video, playlistID);

  const existingPlaylist = await Playlists.findById(playlistID);

  if (!existingPlaylist) {
    return res.status(404).json({ error: "Playlist not found" });
  }

  const isVideoAlreadyPresent = existingPlaylist.videos.some(
    (vid) => vid?.toString() === video
  );
  let message;
  if (isVideoAlreadyPresent) {
    // Remove from playlist
    existingPlaylist.videos = existingPlaylist.videos.filter(
      (vid) => vid?.toString() !== video
    );
    message = "Video Removed From The Playlist";
  } else {
    // Add to playlist
    existingPlaylist.videos.push(video);
    message = "Video Added To The Playlist";
  }

  // Save the updated playlist
  const updatedPlaylist = await existingPlaylist.save();

  // Optionally, you can populate videos if needed
  await updatedPlaylist.populate("videos");

  return sendRes(res, 201, { playlist: updatedPlaylist }, message);
});
const getPlaylistByID = expressAsyncHandler(async (req, res) => {
  const { playlistID } = req.params;
  const userID = req.user?.details?._id;

  if (!mongoose.isValidObjectId(playlistID))
    return sendRes(res, 400, {}, "Not a valid playlist ID");

  // const playlist = await Playlists.findById(playlistID)
  //   .populate("videos")
  //   .populate("owner")
  //   .lean();

  const playlist = await Playlists.aggregate([
    // Get the Playlist with the given ID
    { $match: { _id: new mongoose.Types.ObjectId(playlistID) } },

    // Populate Owner
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },

    // Populate Videos
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          {
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "video",
              as: "likes",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "creator",
              foreignField: "_id",
              as: "creator",
            },
          },
          {
            $lookup: {
              from: "watch-histories",
              localField: "_id",
              foreignField: "video",
              as: "views",
            },
          },
          {
            $addFields: {
              likes_count: { $size: "$likes" },
              isLiked: {
                $cond: {
                  if: {
                    $in: [
                      new mongoose.Types.ObjectId(userID),
                      "$likes.likedBy",
                    ],
                  },
                  then: true,
                  else: false,
                },
              },
              creator: {
                $first: "$creator",
              },

              views_count: { $size: "$views" },
              isViewed: {
                $cond: {
                  if: {
                    $in: [new mongoose.Types.ObjectId(userID), "$views.viewer"],
                  },
                  then: true,
                  else: false,
                },
              },
              lastWatched: {
                $let: {
                  vars: {
                    matchedView: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$views",
                            as: "view",
                            cond: {
                              $eq: [
                                "$$view.viewer",
                                new mongoose.Types.ObjectId(userID),
                              ],
                            },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: "$$matchedView.lastWatched",
                },
              },
            },
          },
        ],
      },
    },

    // Manipulate & Add Fields
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
  ]);

  console.log(playlist[0]?.owner?._id?.toString(), userID);

  const isMinePlaylist = playlist[0]?.owner?._id?.toString() === userID;

  if (playlist[0]?.isPrivate && !isMinePlaylist)
    return sendRes(
      res,
      403,
      {},
      "This is a Private Playlist. Only the owner can access it"
    );

  return sendRes(res, 200, { playlist: playlist[0] }, "Playlist Found");
});

module.exports = {
  createPlaylist,
  addVideosToPlaylist,
  addVideoToPlaylists,
  toggleVideoInPlaylist,
  getPlaylistByID,
};
