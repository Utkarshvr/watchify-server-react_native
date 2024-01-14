const express = require("express");
const upload = require("../middlewares/multer.middlewares");
const expressAsyncHandler = require("express-async-handler");
const ApiError = require("../utils/classes/ApiError");
const ApiResponse = require("../utils/classes/ApiResponse");
const sendRes = require("../utils/sendRes");
const roughRouter = express.Router();

roughRouter.post(
  "/upload/user_picture",

  upload.fields([
    { name: "user_picture", maxCount: 1 },
    { name: "banner_image", maxCount: 1 },
  ]),

  (req, res) => {
    console.log(req.files);
    console.log(req.body);

    res.status(201).json({
      files: req.files,
      body: req.body,
    });
  }
);

roughRouter.get(
  "/custom-classes",
  expressAsyncHandler(async (req, res) => {
    // throw new ApiError(400, "Bad Request");

    // res
    //   .status(200)
    //   .json(new ApiResponse(200, { data: [1, 2, 3, 4] }, "Success"));

    // return sendRes(res, 200, { data: [1, 2, 3, 4] }, "Success");
    return sendRes(res, 404, { video: null }, "Video not found");
  })
);

module.exports = roughRouter;
