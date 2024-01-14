const { Schema, model } = require("mongoose");

const playlistSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: false,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isPrivate: {
      type: Boolean,
      default: true,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    videos: {
      type: [Schema.Types.ObjectId],
      ref: "Video",
      default: [],
      required: true,
    },
  },
  { timestamps: true }
);

const Playlists = model("playlists", playlistSchema);

module.exports = Playlists;
