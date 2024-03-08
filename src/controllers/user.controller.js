const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const Videos = require("../models/Videos");
const Playlists = require("../models/Playlist");
const { Types } = require("mongoose");
const WatchHistory = require("../models/WatchHistory");
const Notifications = require("../models/Notifications");
const sendRes = require("../utils/sendRes");
const Subscribers = require("../models/Subscribers");

const customizeUser = asyncHandler(async (req, res) => {
  const { name, desc, user_handle, links } = req.body;
  const userID = req.user?.details?._id;
  // Try to update the basic info first
  let updatedUser = await User.findByIdAndUpdate(
    userID,

    {
      $set: { name, user_handle, links, desc },
    },

    { new: true } // This option returns the modified document, rather than the original
  ).lean();
  // console.log(updatedUser);

  // Upload Images to Cloudinary
  // console.log(req.files);

  const user_picturePath = req.files?.user_picture
    ? req.files?.user_picture[0]?.path
    : null;
  const banner_imagePath = req.files?.banner_image
    ? req.files?.banner_image[0]?.path
    : null;

  const uploadedUserPic = user_picturePath
    ? await uploadOnCloudinary(user_picturePath)
    : null;

  const uploadedBannerPic = banner_imagePath
    ? await uploadOnCloudinary(banner_imagePath)
    : null;

  if (uploadedUserPic?.url || uploadedBannerPic?.url) {
    updatedUser = await User.findByIdAndUpdate(
      userID,

      {
        $set: {
          ...(uploadedUserPic?.url && { picture: uploadedUserPic.url }),
          ...(uploadedBannerPic?.url && {
            banner_image: uploadedBannerPic.url,
          }),
        },
      },

      { new: true } // This option returns the modified document, rather than the original
    ).lean();
  }

  // console.log(updatedUser);

  res.status(200).json({
    updatedUser,
    msg: "Successfully Customized",
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const userID = req.user?.details?._id;

  try {
    const user = User.findById(userID);
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.status(200).json({ user, msg: "User Fetched Successfully" });
  } catch (error) {
    res.status(500).json({ error, msg: "Internal Server Error" });
  }
});

const getVideosByUser = asyncHandler(async (req, res) => {
  const channelID = req.params.channelID;
  const userID = req.user?.details?._id;

  const videos = await Videos.aggregate([
    {
      $match: {
        creator: new Types.ObjectId(channelID),
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "comments",
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
        comments_count: { $size: "$comments" },
        isLiked: {
          $cond: {
            if: {
              $in: [new Types.ObjectId(userID), "$likes.owner"],
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
              $in: [new Types.ObjectId(userID), "$views.viewer"],
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
                        $eq: ["$$view.viewer", new Types.ObjectId(userID)],
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
  ]).sort({ createdAt: -1 });

  let filteredVideos = videos;

  if (userID !== channelID) {
    // Send only the Public Vidoes of the channel if the user that is requesting is not the channel owner
    filteredVideos = videos.filter((vid) => vid?.isPublic);
  }

  res.status(200).json({
    videos: filteredVideos,
  });
});

const getUsersPlaylist = asyncHandler(async (req, res) => {
  const user = req.user?.details;
  const userID = user?._id;
  console.log({ userID });

  const playlists = await Playlists.find({
    owner: userID,
  })
    .sort({
      createdAt: -1,
    })
    .populate("owner")
    .populate("videos")
    .lean();
  console.log({ playlists });

  res.status(200).json({
    playlists,
  });
});

const getUsersWatchHistory = asyncHandler(async (req, res) => {
  const user = req.user?.details;
  const userID = user?._id;
  // console.log(userID);

  const watchHistory = await WatchHistory.aggregate([
    {
      $match: {
        viewer: new Types.ObjectId(userID),
      },
    },

    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
        pipeline: [
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
              creator: {
                $first: "$creator",
              },
              views_count: {
                $size: "$views",
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
                                new Types.ObjectId(userID),
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
    {
      $addFields: {
        video: {
          $first: "$video",
        },
      },
    },
  ]).sort({
    updatedAt: -1,
  });

  // const watchHistory = await WatchHistory.find({
  //   viewer: userID,
  // })
  //   .sort({
  //     createdAt: -1,
  //   })
  //   .populate("viewer")
  //   .populate("video")
  //   .lean();
  // console.log(watchHistory);

  return res.status(200).json({
    watchHistory,
  });
});

const getNotifications = asyncHandler(async (req, res) => {
  const userID = req.user?.details?._id;
  const isRead = req.query.isRead ? JSON.parse(req.query.isRead) : null;
  console.log({ isRead });

  const notifications = await Notifications.find({
    user: userID,
    ...(isRead !== null ? { isRead } : {}),
  })
    .sort({ createdAt: -1 })
    .lean();

  return sendRes(
    res,
    200,
    { notifications },
    `All ${
      isRead === null ? "" : isRead ? "read" : "unread"
    } notifications found`
  );
});

const markNotificationsAsRead = asyncHandler(async (req, res) => {
  const userID = req.user?.details?._id;
  console.log("Will mark notifications as read");

  await Notifications.updateMany(
    {
      user: userID,
      isRead: false,
    },
    { $set: { isRead: true } },
    { new: true }
  )
    .sort({ createdAt: -1 })
    .lean();

  return sendRes(res, 200, null, `Marked all notifications as read`);
});

const getUsersSubscription = asyncHandler(async (req, res) => {
  try {
    const userID = req.user?.details?._id;
    console.log(userID);
    // const subscriptions = await Subscribers.find({
    //   subscriber: userID,
    // }).populate("channel");

    const subscriptions = await Subscribers.aggregate([
      {
        $match: {
          subscriber: new Types.ObjectId(userID),
        },
      },
      {
        $lookup: {
          from: "users", // Assuming your channel collection is named "channels"
          localField: "channel",
          foreignField: "_id",
          as: "channel",
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
        $unwind: "$channel",
      },
    ]);

    console.log(subscriptions);

    // Now, the 'subscriptions' variable contains the aggregated data with populated 'channelInfo' field.

    return sendRes(res, 200, { subscriptions }, "Subscriptions");
  } catch (error) {
    console.log(error);
    return sendRes(res, 500, error, "Subscriptions not fetched");
  }
});

module.exports = {
  customizeUser,
  getUserById,
  getVideosByUser,
  getUsersPlaylist,
  getUsersWatchHistory,
  getNotifications,
  markNotificationsAsRead,
  getUsersSubscription,
};
