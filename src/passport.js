const jwt = require("jsonwebtoken");
const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");

const { createDefaultPlaylists } = require("./controllers/auth.controller");
const User = require("./models/User");
const Playlists = require("./models/Playlist");
const generateUniqueChannelID = require("./helpers/generateChannelID");
const randomNumber = require("./helpers/randomNumber");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      // callbackURL: "/api/auth/google/callback",
      callbackURL: process.env.CALLBACK_URL || "/api/auth/google/callback",
      scope: ["profile", "email"],
    },
    async function (accessToken, refreshToken, profile, callback) {
      let JWT_TOKEN = "";
      console.log(process.env.JWT_SECRET_KEY);
      // 1. Extract email & all other necessary fields
      const { email, given_name, family_name, name, picture } = profile?._json;

      const userByEmail = await User.findOne({ email });

      // 2. if email already exists in the DB. Return it & it's done
      if (userByEmail) {
        const defaultPlaylists = await Playlists.find({
          isDefault: true,
          owner: userByEmail?._id,
        });

        if (defaultPlaylists?.length === 0)
          // Create Default Playlists
          await createDefaultPlaylists(userByEmail._id);

        JWT_TOKEN = jwt.sign(
          { user: userByEmail },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: process.env.JWT_MAX_AGE || 15,
          }
        );
        console.log(JWT_TOKEN);
        return callback(null, { ...profile, JWT_TOKEN });

        // req.user.details = userByEmail;
      }

      // console.log("Create a New One");
      let isUserHandleUnique = false;
      let isChannelIDUnique = false;
      let userHandle;
      let channelID;

      // 3. if email doesn't exist, it means it is a new account. So save the user with:
      // (a) Create a userHandle && Check until u find a unique channel id
      while (!isUserHandleUnique) {
        // Generate a new userHandle
        userHandle = `${given_name?.toLowerCase()}${
          family_name ? family_name?.toLowerCase() : ""
        }${randomNumber()}`;

        // Check if the generated userHandle already exists in the database
        const existingUser = await User.findOne({ user_handle: userHandle });
        // console.log("Unique: ", userHandle, !existingUser);

        // If no user is found with the generated userHandle, it's unique
        if (!existingUser) {
          isUserHandleUnique = true;
        }
      }
      while (!isChannelIDUnique) {
        // Generate a new channel id
        channelID = generateUniqueChannelID();

        // Check if the generated userHandle already exists in the database
        const existingUser = await User.findOne({ channelID });
        // console.log("Unique ", channelID, !existingUser);

        // If no user is found with the generated userHandle, it's unique
        if (!existingUser) {
          isChannelIDUnique = true;
        }
      }
      // // console.log("Is Handler Unique", isUserHandleUnique);
      // // console.log("Is Channel ID Unique", isChannelIDUnique);

      // (c) Create a new user

      const userObj = {
        email,
        given_name,
        family_name,
        name,
        picture,
        user_handle: userHandle,
        channelID,
        desc: "",
      };
      // console.log(userObj);

      let newUser = await User.create(userObj);

      // Create Default Playlists
      await createDefaultPlaylists(newUser?._id);

      JWT_TOKEN = jwt.sign({ user: newUser }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_MAX_AGE || 15,
      });
      return callback(null, { ...profile, JWT_TOKEN });
    }
  )
);

passport.serializeUser((user, done) => {
  // console.log(user);
  done(null, user);
});

passport.deserializeUser((user, done) => {
  // console.log(user);
  done(null, user);
});
