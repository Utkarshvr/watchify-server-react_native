const { Schema, model } = require("mongoose");

const subscriberschema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Subscribers = model("subscribers", subscriberschema);

module.exports = Subscribers;
