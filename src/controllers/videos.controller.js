const asyncHandler = require("express-async-handler");
const Videos = require("../models/Videos");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const { generateVideoId, formatComments } = require("../helpers/utility");
const {
  Types: { ObjectId },
} = require("mongoose");
const WatchHistory = require("../models/WatchHistory");
const {
  addVideoToPlaylistsUtil,
} = require("../utils/mongo/playlists/playlist.utility");
const Comments = require("../models/Comments");
const sendRes = require("../utils/sendRes");
const Notifications = require("../models/Notifications");
const notificationTypes = require("../config/notificationTypes");

const createVideo = asyncHandler(async (req, res) => {
  const creator = req.user?.details?._id;
  const socket = req.app.get("socket");
  const { title, desc, isPublic, selectedPlaylists } = req.body;
  const todayDate = new Date();

  const progress_notification = {
    user: creator,
    content: "Video is Uploading. It may take a few minutes",
    severity: "in_progress",
    notificationType: notificationTypes.videoUpload.inProgress(),
    payload: {
      video: {
        title,
        desc,
        startedAt: todayDate.toJSON(),
      },
    },
  };

  const progressNotification = await Notifications.create(
    progress_notification
  );

  // Socket IO: Notify-User
  socket.emit("notify-user", progress_notification);

  try {
    // Your code for the CreateVideo function goes here

    // console.log(isPublic, JSON.parse(isPublic));

    const videoPath = req.files?.video ? req.files?.video[0]?.path : null;

    const thumbnailPath = req.files?.thumbnail
      ? req.files?.thumbnail[0]?.path
      : null;

    const uploadedVideo = videoPath
      ? await uploadOnCloudinary(videoPath)
      : null;

    const uploadedThumbnail = thumbnailPath
      ? await uploadOnCloudinary(thumbnailPath)
      : null;

    if (!uploadedVideo?.url) throw Error("Couldn't upload the video");

    const videoID = generateVideoId(16);

    const newVideo = await Videos.create({
      title,
      desc,
      creator,
      link: uploadedVideo?.url,
      thumbnail: uploadedThumbnail?.url || "",
      videoID,
      isPublic: isPublic === null ? true : JSON.parse(isPublic),
    });

    // Add to playlists, if given
    if (selectedPlaylists?.length > 0) {
      try {
        const updatedPlaylists = await addVideoToPlaylistsUtil(
          newVideo?._id,
          selectedPlaylists
        );
        console.log({ updatedPlaylists });
      } catch (error) {
        console.log(error);
      }
    }

    const success_notification = {
      user: creator,
      content: "Video Uploaded Successfully",
      severity: "success",
      notificationType: notificationTypes.videoUpload.success(),
      payload: {
        video: newVideo,
      },
    };

    await Notifications.create(success_notification);

    // Socket IO: Notify-User
    socket.emit("notify-user", success_notification);

    res.status(201).json({
      video: newVideo,
      msg: "Video Uploaded Successfully",
    });
  } catch (error) {
    const error_notification = {
      user: creator,
      content: "Video Uploaded Failed",
      severity: "error",
      notificationType: notificationTypes.videoUpload.failed(),
      payload: {
        video: { title, desc, failedAt: todayDate.toJSON() },
      },
    };

    await Notifications.create(error_notification);

    // Socket IO: Notify-User
    socket.emit("notify-user", error_notification);

    return res.status(400).json({ msg: "Couldn't upload video" });
  } finally {
    await progressNotification.deleteOne();
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  const videoID = req.params.id;
  const userID = req.user?.details?._id;
  const socket = req.app.get("socket");

  const video = await Videos.aggregate([
    {
      $match: {
        // _id: new ObjectId("658d6fd765b6e96cfd215d55"),
        videoID,
      },
    },
    {
      $lookup: {
        from: "playlists",
        localField: "_id",
        foreignField: "videos",
        as: "likes",
        pipeline: [
          {
            $match: {
              title: "Liked Videos",
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "creator",
        foreignField: "_id",
        as: "creator",
        pipeline: [
          {
            $lookup: {
              from: "subscribers",
              localField: "_id",
              foreignField: "channel",
              as: "subscribers",
            },
          },
          {
            $addFields: {
              isSubscribed: true,

              subscribers_count: {
                $size: "$subscribers",
              },
            },
          },
        ],
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
              $in: [new ObjectId(userID), "$likes.owner"],
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
              $in: [new ObjectId(userID), "$views.viewer"],
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
                        $eq: ["$$view.viewer", new ObjectId(userID)],
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
  ]);

  if (!video[0]?.isPublic && video[0]?.creator?._id?.toString() !== userID) {
    console.log("SENDING SOCKET MESSAGE");
    socket.emit("notify-user", {
      user: userID,
      content: "This is a private video. Only the user can access it",
      severity: "error",
      notificationType: notificationTypes.contentFetch.unauthorized(),
    });
    console.log("SENT SOCKET");

    return sendRes(
      res,
      403,
      {
        error: {
          isPrivateVideo: true,
        },
      },
      "This is a private video"
    );
  }

  let isAlreadyWatched;
  if (userID) {
    isAlreadyWatched = await WatchHistory.findOne({
      viewer: userID,
      video: video[0]?._id,
    }).lean();
    // Check if the video exists in the user's watch history
    const historyResponse = await WatchHistory.findOneAndUpdate(
      { viewer: userID, video: video[0]?._id },
      { $set: { lastWatched: new Date() } }, // Set additional fields as needed
      { upsert: true, new: true } // "upsert" creates the document if it doesn't exist, "new" returns the modified document
    ).lean();
    console.log({ historyResponse });
  }
  res.status(200).json({
    video: {
      ...video[0],
      ...(userID
        ? {
            views_count: isAlreadyWatched
              ? video[0]?.views_count
              : video[0]?.views_count + 1,
          }
        : {}),
    },
    isViewed: isAlreadyWatched,
  });
});

const getAllVideos = asyncHandler(async (req, res) => {
  const userID = req.user?.details?._id;
  console.log("Request came to get all videos", { userID });
  try {
    const videos = await Videos.aggregate([
      {
        $lookup: {
          from: "playlists",
          localField: "_id",
          foreignField: "videos",
          as: "likes",
          pipeline: [
            {
              $match: {
                title: "Liked Videos",
              },
            },
          ],
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
                $in: [new ObjectId(userID), "$likes.owner"],
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
                $in: [new ObjectId(userID), "$views.viewer"],
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
                          $eq: ["$$view.viewer", new ObjectId(userID)],
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
      {
        $match: {
          isPublic: true,
        },
      },
    ]).sort({ createdAt: -1 });

    res.status(200).json({
      videos,
    });
  } catch (error) {
    console.log(error);
  }
});

const getCommentsByVideoID = asyncHandler(async (req, res) => {
  const videoID = req.params.id;

  try {
    const commentsDB = await Comments.find({ video: videoID })
      .populate("commenter")
      .populate("parentComment")
      .lean();

    return sendRes(
      res,
      200,
      {
        // comments: commentsDB,
        comments: formatComments(commentsDB),

        // formattedComments: formatComments(commentsDB),
      },
      "All Comments Found"
    );
  } catch (error) {
    console.log(error);
    return sendRes(res, 500, null, "Comments not Found");
  }
});

module.exports = {
  createVideo,
  getVideoById,
  getAllVideos,
  getCommentsByVideoID,
};
