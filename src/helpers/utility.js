function generateVideoId(length = 11) {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let videoId = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    videoId += characters.charAt(randomIndex);
  }

  return videoId;
}

const formatComments = (comments) => {
  // Create a map to store comments with comment IDs as keys
  const commentMap = new Map();

  // Create a map with comment IDs as keys and comment objects as values
  comments.forEach((comment) => {
    console.log(comment._id);
    commentMap.set(comment._id?.toString(), { ...comment, replies: [] });
  });

  // Iterate through comments to build the hierarchy
  commentMap.forEach((comment) => {
    const parentId = comment.parentComment?._id?.toString();
    console.log(comment.content, parentId);

    if (parentId && commentMap.has(parentId)) {
      // If the comment has a parent, add it to the parent's "replies" array
      const parentComment = commentMap.get(parentId);
      console.log({ parentComment });
      parentComment.replies.push(comment);
    }
  });

  // Filter out reply comments and return the top-level comments
  const result = [...commentMap.values()].filter((comment) => !comment.isReply);

  return result;
};

module.exports = { generateVideoId, formatComments };
