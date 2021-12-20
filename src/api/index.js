const express = require('express');

const loginApi = require('./login');
const usersApi = require('./users');
const notificationsApi = require('./notifications');
const postsApi = require('./posts');

const { isAuthenticated, isUnauthenticated } = require('../middlewares/auth');

const router = express.Router();

router.use(loginApi);
router.use(isAuthenticated, usersApi);
router.use(isAuthenticated, notificationsApi);
router.use(isAuthenticated, postsApi);

module.exports = router;
