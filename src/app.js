require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const api = require('./api/index');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev'));
app.use(helmet());

app.use(
  require('express-session')({
    secret: process.env.SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use('/api/v1', api);

module.exports = app;
