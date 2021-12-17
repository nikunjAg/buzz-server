const express = require('express');

const loginApi = require('./login');
const usersApi = require('./users');
const userApi = require('./user');
const { isAuthenticated } = require('../middlewares/auth');

const router = express.Router();

router.use(loginApi);
router.use('/users', isAuthenticated, usersApi);
router.use('/users/:id', isAuthenticated, userApi);

module.exports = router;
