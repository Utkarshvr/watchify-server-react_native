const express = require("express");
const { createComment } = require("../controllers/comment.controller");
const { isAuthorized } = require("../middlewares/auth.middleware");

const commentRouter = express.Router();

// commentRouter.get("/:ID", getCommentByID);

// commentRouter.use(isAuthorized);
commentRouter.post("/:ID", createComment);

module.exports = commentRouter;
