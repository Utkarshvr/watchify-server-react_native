const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    viewer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    lastWatched: {
      type: Date,
    },
  },
  { timestamps: true }
);

const WatchHistory = model("watch-history", schema);

module.exports = WatchHistory;
