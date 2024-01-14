const expressAsyncHandler = require("express-async-handler");
const Subscribers = require("../models/Subscribers");
const User = require("../models/User");
const sendRes = require("../utils/sendRes");

const subsribeChannel = expressAsyncHandler(async function (req, res) {
  try {
    const user = req.user?.details;
    const subscriberID = user?._id;
    const channelID = req.params.channelID;
    console.log(channelID);

    if (Boolean(channelID) === false)
      return res.status(400).json({ msg: `channelID is not specified` });

    console.log(String(channelID), String(subscriberID));
    if (String(channelID) === String(subscriberID)) {
      return sendRes(res, 400, {}, "Can't subscribe yourself");
    }

    const commonObj = {
      subscriber: subscriberID,
      channel: channelID,
    };

    const exisitingVideo = User.findById(channelID);
    if (!exisitingVideo)
      return res
        .status(404)
        .json({ msgL: `Channel with ID: ${channelID} is not found` });

    const isAlreadySubscribed = await Subscribers.findOne(commonObj).lean();

    if (isAlreadySubscribed) {
      await Subscribers.deleteOne(commonObj);
      return res.status(200).json({ msg: "Unsubscribed", isSubscribed: false });
    } else {
      await Subscribers.create(commonObj);
      return res.status(200).json({ msg: "Subscribed", isSubscribed: true });
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = { subsribeChannel };
