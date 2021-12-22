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
require('./utils/cloudinary');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use((req, res, next) => {
  console.log('\n\n');
  console.log('--------INCOMING REQUEST-------');

  next();
});

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

app.use('/api/v1', api);

app.use((err, req, res, next) => {
  console.log('Error', err);
  res.status(err.statusCode || 500).send(err);
});

module.exports = app;
