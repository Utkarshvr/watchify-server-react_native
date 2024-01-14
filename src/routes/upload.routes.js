const express = require("express");

const uploadRouter = express.Router();

uploadRouter.get("/video", (req, res) => {
  res.send("HELLO");
});

module.exports = uploadRouter;
