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

router.get(`/google`, (req, res, next) => {
  const { source } = req.query;
  console.log(source);
  const state = source
    ? Buffer.from(JSON.stringify({ source })).toString("base64")
    : undefined;

  const authenticator = passport.authenticate("google", {
    scope: ["profile", "email"],
    state,
  });
  authenticator(req, res, next);
});

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login/failed",
  }),
  (req, res) => {
    try {
      const { state } = req.query;
      const { source } = JSON.parse(Buffer.from(state, "base64").toString());
      console.log({ source });
      if (typeof source === "string") {
        const isMobile = source === "mobile";

        const redirectUrl = isMobile
          ? `${process.env.MOBILE_CLIENT_URL}?firstName=${req.user?._json?.given_name}&lastName=${req.user?._json?.family_name}&email=${req.user?._json?.email}&JWT_TOKEN=${req.user?.JWT_TOKEN}`
          : process.env.CLIENT_URL;

        return res.redirect(redirectUrl);
      }
    } catch {
      // just redirect normally below
      res.redirect("/login/failed");
    }
  }
);

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect(process.env.CLIENT_URL);
});

module.exports = router;
