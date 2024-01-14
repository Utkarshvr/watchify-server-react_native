const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Subscribers = require("../models/Subscribers");
const { Types } = require("mongoose");
const sendRes = require("../utils/sendRes");
const Playlists = require("../models/Playlist");

const getChannelByID = asyncHandler(async function (req, res) {
  const { channelID } = req.params;
  const userID = req.user?.details?._id;

  try {
    const channel = await User.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(channelID),
        },
      },
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
          isSubscribed: {
            $cond: {
              if: {
                $in: [new Types.ObjectId(userID), "$subscribers.subscriber"],
              },
              then: true,
              else: false,
            },
          },
          subscribers_count: {
            $size: "$subscribers",
          },
        },
      },
    ]);

    if (!channel.length)
      return res.status(404).json({ msg: "Channel don't exist" });
    res.status(200).json({ channel: channel[0] });
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
});

const getChannel = asyncHandler(async function (req, res) {
  const { user_handle, channelID, channel_uuid } = req.query;

  if (!user_handle && !channelID && !channel_uuid)
    return sendRes(res, 400, {}, "Specify Channel ID/UUID or User handle");

  const userID = req.user?.details?._id;
  console.log(user_handle, channelID, channel_uuid, userID);

  try {
    const channel = await User.aggregate([
      {
        $match: {
          ...(user_handle
            ? { user_handle }
            : channelID
            ? { channelID }
            : { _id: channel_uuid }),
        },
      },
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
          ...(userID
            ? {
                isSubscribed: {
                  $cond: {
                    if: {
                      $in: [
                        new Types.ObjectId(userID),
                        "$subscribers.subscriber",
                      ],
                    },
                    then: true,
                    else: false,
                  },
                },
              }
            : {}),
          subscribers_count: {
            $size: "$subscribers",
          },
        },
      },
    ]);

    if (!channel.length)
      return res.status(404).json({ msg: "Channel don't exist" });
    res.status(200).json({ channel: channel[0] });
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
});

const getSubscribers = asyncHandler(async function (req, res) {
  const { channelID } = req.params;
  const userID = req.user.details?._id;

  try {
    const subscribers = await Subscribers.find({ channel: channelID }).lean();
    console.log(userID);
    console.log(subscribers);
    res.status(200).json({
      subscribers,
      subscribers_count: subscribers?.length,
      isSubscribed: subscribers?.some(
        (sub) => String(sub.subscriber) === String(userID)
      ),
    });
  } catch (error) {
    console.log(error);
    res.status(404).send({ msg: "ERROR" });
  }
});

const getChannelsPlaylist = asyncHandler(async (req, res) => {
  const { channelID } = req.params;
  const userID = req.user?.details?._id;

  const playlists = await Playlists.find({
    owner: channelID,
    ...(userID === channelID ? {} : { isPrivate: false }),
  })
    .sort({
      createdAt: -1,
    })
    .populate("owner")
    .populate("videos")
    .lean();

  res.status(200).json({
    playlists,
  });
});

module.exports = {
  getChannelByID,
  getSubscribers,
  getChannel,
  getChannelsPlaylist,
};
