const ApiResponse = require("./classes/ApiResponse");

function sendRes(res, statusCode, data, message) {
  return res
    .status(statusCode)
    .json(new ApiResponse(statusCode, data, message));
}

module.exports = sendRes;
