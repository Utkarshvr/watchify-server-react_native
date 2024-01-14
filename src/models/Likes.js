const { Schema, model } = require("mongoose");

const likeSchema = new Schema(
  {
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contentType: {
      type: String,
      enum: ["comment", "video"],
      required: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: function () {
        return this.contentType === "video";
      },
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      required: function () {
        return this.contentType === "comment";
      },
    },
  },
  { timestamps: true }
);

const Likes = model("likes", likeSchema);

module.exports = Likes;
