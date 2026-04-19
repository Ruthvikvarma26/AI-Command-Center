const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
require('dotenv').config();

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'dummy-id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-secret',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback",
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      
      if (!user) {
        // Check if a user with the same email already exists (from manual registration)
        const email = profile.emails?.[0]?.value;
        if (email) {
          user = await User.findOne({ email });
          if (user) {
            // Link Google ID to existing manual account
            user.googleId = profile.id;
            user.avatar = user.avatar || profile.photos?.[0]?.value || '';
            await user.save();
            console.log(`[PASSPORT] Linked Google ID to existing email account: ${email}`);
          }
        }
      }

      if (!user) {
        // Truly new user - create fresh profile
        user = new User({
          googleId: profile.id,
          displayName: profile.displayName || 'Google User',
          email: profile.emails?.[0]?.value,
          avatar: profile.photos?.[0]?.value || ''
        });
        await user.save();
        console.log(`[PASSPORT] Created fresh Google account: ${user.email}`);
      }
      return done(null, user);
    } catch (err) {
      console.error('[PASSPORT] Google Strategy Error:', err);
      return done(err, null);
    }
  }
));

module.exports = { passport };
