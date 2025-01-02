const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const express = require('express');
const router = express.Router();
require('dotenv').config();

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_SECRET_KEY,
      callbackURL: 'http://localhost:5000/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'email', 'photos']
    },
    async function(accessToken, refreshToken, profile, cb) {
      try {
        const user = {
          id: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0]?.value,
          photo: profile.photos?.[0]?.value,
          accessToken
        };
        return cb(null, user);
      } catch (error) {
        return cb(error, null);
      }
    }
  )
);

router.get('/', passport.authenticate('facebook', { 
  scope: ['email', 'public_profile']
}));

router.get('/callback',
  passport.authenticate('facebook', { 
    failureRedirect: 'http://localhost:5173/social'
  }),
  (req, res) => {
    const userData = req.user;
    res.redirect(`http://localhost:5173/social?userData=${encodeURIComponent(JSON.stringify(userData))}`);
  }
);

router.get('/user', (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      user: req.user
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }
});

// facebookroutes.js
router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: req.user
    });
  } else {
    res.json({
      authenticated: false,
      user: null
    });
  }
});


router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('http://localhost:5173/social');
  });
});

module.exports = router;
