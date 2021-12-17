const passport = require('passport');
const GoogleStartegy = require('passport-google-oauth20').Strategy;

const User = require('../models/User');

const PORT = process.env.PORT || 8000;

const GOOGLE_CALLBACK_URL = `http://localhost:${PORT}/api/v1/auth/google/callback`;

passport.use(
  new GoogleStartegy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      // console.log('Profile', profile);

      try {
        const fetchedUser = await User.findOne({
          googleId: profile.id,
        });

        // Login with existing user
        if (fetchedUser) {
          console.log('Fetched User', fetchedUser);
          return done(null, fetchedUser);
        }

        // Create a new user
        const createdUser = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          profileImage: profile.photos[0].value,
        });

        done(null, createdUser);
      } catch (err) {
        done(err);
      }
    }
  )
);

// Serializing the user._id into the session
passport.serializeUser(function (user, done) {
  console.log('Serializing: ', user.email);
  done(null, user._id);
});

// Deserializing the user._id from the session
passport.deserializeUser(async function (id, done) {
  try {
    const user = await User.findById(id);
    console.log(`Deserializing ${id} ${user.email}`);
    if (!user) return done(null, false);

    done(null, user);
  } catch (err) {
    done(err);
  }
});
