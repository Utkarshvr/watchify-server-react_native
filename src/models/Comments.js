const { Schema, model } = require("mongoose");

const commentSchema = new Schema(
  {
    isReply: {
      type: Boolean,
      required: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    commenter: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment", // Reference to the Comment model for the parent comment
      required: function () {
        return this.isReply;
      },
    },
  },
  { timestamps: true }
);

const Comments = model("Comment", commentSchema);

module.exports = Comments;
