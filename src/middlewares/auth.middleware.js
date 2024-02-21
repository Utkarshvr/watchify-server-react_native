const jwt = require("jsonwebtoken");
const expressAsyncHandler = require("express-async-handler");
const sendRes = require("../utils/sendRes");

const isAuthorized = expressAsyncHandler(async (req, res, next) => {
  const user = req.user?.details;
  // console.log("Is Authorized??");

  if (user) return next();

  const sessionUser = req.user?._json;
  console.log({ sessionUser, USER: req.user });
  if (sessionUser) return next();

  const token = req.headers.authorization || req.headers.Authorization;
  // console.log(token);

  if (!token)
    return sendRes(
      res,
      403,
      null,
      "You must be logged in to perform this activity"
    );

  jwt.verify(
    token.replace("Bearer ", ""),
    process.env.JWT_SECRET_KEY,
    (err, decoded) => {
      console.log({ err });
      if (err) return res.status(401).json({ message: "Invalid token" });
      console.log("USER IS AUTHENTCIATED ✅✅✅");
      req.user = { details: decoded.user };
      next();
    }
  );

  // console.log({ decodedUser });
  // if (!decodedUser)
  //   return sendRes(
  //     res,
  //     403,
  //     null,
  //     "You must be logged in to perform this activity"
  //   );

  // req.user.details = decodedUser?.user;
  // next();

  // try {
  //   const response = await fetch(
  //     "https://www.googleapis.com/oauth2/v2/userinfo",
  //     {
  //       headers: {
  //         Authorization: `Bearer ${token.replace("Bearer ", "")}`,
  //       },
  //     }
  //   );
  //   const data = await response.json();
  //   console.log({ data });
  //   req.user = { ...req.user, _json: data };
  //   next();
  // } catch (err) {
  //   console.log(err);

  //   return sendRes(
  //     res,
  //     403,
  //     null,
  //     "You must be logged in to perform this activity"
  //   );
  // }

  // console.log({ isAuthorized: !!user, user });
});

module.exports = { isAuthorized };
