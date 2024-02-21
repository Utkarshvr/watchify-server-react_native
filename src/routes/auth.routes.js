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
    failureRedirect: "/login/failed",
  }),
  (req, res) => {
    // Check if the request is from a mobile client
    const userAgent = req.headers["user-agent"];
    const isMobile =
      userAgent.includes("Mobile") ||
      userAgent.includes("Android" || userAgent.includes("Ios"));

    // Construct the redirect URL based on the client type
    const redirectUrl = isMobile
      ? `${process.env.MOBILE_CLIENT_URL}?firstName=${req.user?._json?.given_name}&lastName=${req.user?._json?.family_name}&email=${req.user?._json?.email}&JWT_TOKEN=${req.user?.JWT_TOKEN}`
      : process.env.CLIENT_URL;

    console.log({ userAgent, isMobile, redirectUrl });

    // Redirect to the determined URL
    res.redirect(redirectUrl);
  }
);

// router.get(
//   "/mobile/google/callback",
//   passport.authenticate("google", {
//     failureRedirect: "/login/failed",
//   }),
//   (req, res) => {
//     // if (the request is from mobile)
//     res.redirect(
//       `${process.env.MOBILE_CLIENT_URL}?firstName=${req.user?._json?.given_name}/lastName=${req.user?._json?.family_name}/email=${req.user?._json?.email}/JWT_TOKEN=${req.user?.JWT_TOKEN}`
//     );
//     // else if (the request is from website)
//     res.redirect(process.env.CLIENT_URL)
//   }
// );

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect(process.env.CLIENT_URL);
});

module.exports = router;
