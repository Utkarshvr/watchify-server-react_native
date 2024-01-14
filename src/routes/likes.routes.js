const express = require("express");
const { likeContent } = require("../controllers/likes.controller");
const { isAuthorized } = require("../middlewares/auth.middleware");

const likesRouter = express.Router();

// Check if user is authorized
likesRouter.use(isAuthorized);

likesRouter.post("/:contentID", likeContent);

module.exports = likesRouter;
