const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: false,
    },
    link: {
      type: String,
      required: true,
    },
    videoID: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: false,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    playlist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Playlist",
      required: false,
    },
    likes: {
      type: Array,
      default: [],
    },
    numComments: {
      type: Number,
      default: 0,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Videos = mongoose.model("Video", videoSchema);

module.exports = Videos;
