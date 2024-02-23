const jwt = require("jsonwebtoken");
const expressAsyncHandler = require("express-async-handler");
const sendRes = require("../utils/sendRes");

const addUserInfoInReq = expressAsyncHandler(async (req, res, next) => {
  const token = req.headers.authorization || req.headers.Authorization;

  if (token)
    jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET_KEY,
      (err, decoded) => {
        req.user = { details: decoded.user };
      }
    );
  next();
});

module.exports = addUserInfoInReq;
