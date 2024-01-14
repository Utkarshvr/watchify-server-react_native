const express = require("express");
const passport = require("passport");
const { login } = require("../controllers/auth.controller");
const { isAuthorized } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/login/success", isAuthorized, login);

router.get("/login/failed", (req, res) => {
  res.status(401).json({
    error: true,
    message: "Log in failure",
  });
});

router.get("/google", passport.authenticate("google", ["profile", "email"]));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    // successRedirect: process.env.CLIENT_URL,
    failureRedirect: "/login/failed",
  }),
  (req, res) => {
    console.log({
      USER___USER: req.user,
      SESSION: req.sessionID,
      // cookie: req.cookies,
      // connectSID: req.cookies["connect.sid"],
    });

    // console.log(req);
    // res.redirect(process.env.CLIENT_URL);

    res.redirect(
      `${process.env.CLIENT_URL}?firstName=${req.user?._json?.given_name}/lastName=${req.user?._json?.family_name}/email=${req.user?._json?.email}/JWT_TOKEN=${req.user?.JWT_TOKEN}`
    );
  }
);

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect(process.env.CLIENT_URL);
});

module.exports = router;
