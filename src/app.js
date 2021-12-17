require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const passport = require('passport');

const api = require('./api/index');

const app = express();

require('./database');
require('./auth/google-sso');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev'));
app.use(helmet());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

app.use(
  require('express-session')({
    secret: process.env.SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  console.log('--------CUSTOM LOGGER-------');
  console.log(req.session);
  console.log(req.user);

  next();
});

app.use('/api/v1', api);

app.use((err, req, res, next) => {
  console.log('Error', err);
  res.status(err.statusCode || 500).send(err);
});

module.exports = app;
