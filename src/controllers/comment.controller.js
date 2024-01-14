const expressAsyncHandler = require("express-async-handler");
const Comments = require("../models/Comments");
const { default: mongoose } = require("mongoose");
const sendRes = require("../utils/sendRes");
const Videos = require("../models/Videos");

const createComment = expressAsyncHandler(async function (req, res) {
  try {
    const user = req.user?.details;
    const { content } = req.body;
    const videoID = req.params.videoID;
    const parentCommentID = req.query.parentCommentID || null;

    if (
      (parentCommentID && !mongoose.isValidObjectId(parentCommentID)) ||
      !mongoose.isValidObjectId(videoID)
    )
      return sendRes(res, 400, null, "Not a valid UUID");

    // Check Comment
    const video = await Videos.findById(videoID).lean();
    if (!video) return sendRes(res, 404, null, "Video not Found");

    if (parentCommentID) {
      // Check Comment To Which He is trying to Reply/Comment (Parent Comment)
      const parentComment = await Comments.findById(parentCommentID).lean();
      if (!parentComment) return sendRes(res, 404, null, "Comment not Found");

      const newComment = await Comments.create({
        commenter: user?._id,
        isReply: true,
        content,
        parentComment: parentComment?._id,
        video: video?._id,
      });

      return sendRes(
        res,
        201,
        {
          comment: newComment,
        },
        "Comment Added"
      );

      // if(comment)
    } else {
      const newComment = await Comments.create({
        commenter: user?._id,
        isReply: false,
        content,
        video: video?._id,
      });

      return sendRes(
        res,
        201,
        {
          comment: newComment,
        },
        "Comment Added"
      );
    }
  } catch (error) {
    console.log(error);
    return sendRes(res, 500, null, "Couldn't Add Comment");
  }
});

module.exports = { createComment };
