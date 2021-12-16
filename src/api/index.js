const express = require('express');

const loginApi = require('./login');

const router = express.Router();

router.use(loginApi);

module.exports = router;
