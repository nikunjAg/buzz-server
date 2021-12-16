const express = require('express');
const passport = require('passport');

const router = express.Router();

const SUCCESS_LOGIN_URL = 'http://localhost:3000/login/success';
const FAILURE_LOGIN_URL = 'http://localhost:3000/login/failed';

router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureMessage: 'Cannot login to Google, please try again later!',
    successRedirect: SUCCESS_LOGIN_URL,
    failureRedirect: FAILURE_LOGIN_URL,
  })
);

module.exports = router;
